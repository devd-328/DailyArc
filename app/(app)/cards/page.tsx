import { loadWrapped } from "@/app/wrapped/load-wrapped";
import { CardPreview } from "@/components/CardPreview";
import { CoachLine } from "@/components/CoachLine";
import { RefreshCardButton } from "@/components/RefreshCardButton";
import { WrappedActions } from "@/components/WrappedActions";
import { authErrorMessage } from "@/lib/anilist-oauth";
import { roastLine } from "@/lib/coach";
import { CONFIG_VERSION } from "@/lib/config";
import { progressFromProfile, requireProfile } from "@/lib/profile";
import { daysInactiveSince, formatTimeLeft, localCheckinDate, minutesUntilDayReset } from "@/lib/streaks";
import { requireUser } from "@/lib/supabase/session";
import { utcDay, WRAPPED_ERROR_COPY } from "@/lib/wrapped";
import { io } from "next/cache";
import { connection } from "next/server";
import { Suspense } from "react";

export default function CardsPage({ searchParams }: PageProps<"/cards">) {
  return (
    <Suspense>
      <CardsBody searchParams={searchParams} />
    </Suspense>
  );
}

async function CardsBody({ searchParams }: { searchParams: PageProps<"/cards">["searchParams"] }) {
  const user = await requireUser();
  const profile = await requireProfile(user.id);
  const params = await searchParams;
  const linkError = authErrorMessage(typeof params.error === "string" ? params.error : null);

  if (!profile.anilist_username) {
    return (
      <>
        <h1 className="mb-[26px] font-display text-[32px]">Cards</h1>
        {linkError ? (
          <p className="mb-3 text-[13px] font-medium" role="alert">
            {linkError}
          </p>
        ) : null}
        <p className="max-w-sm text-[15px] font-medium leading-normal">
          Quests, XP, and rank work without a card.
        </p>
        <a
          href="/auth/anilist?next=/cards"
          className="mt-4 inline-flex min-h-12 items-center justify-center rounded-btn border-2 border-ink bg-card px-4 text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
        >
          Create card
        </a>
      </>
    );
  }

  await io();
  await connection();
  const now = new Date();
  const wrapped = await loadWrapped(profile.anilist_username, utcDay(now), CONFIG_VERSION);
  const progress = progressFromProfile(profile);
  const localDay = localCheckinDate(now, profile.timezone);
  const minutesLeft = minutesUntilDayReset(now, profile.timezone);
  const cardRoast = roastLine(
    {
      name: profile.username,
      quests: [],
      streakDays: profile.current_streak,
      bestStreak: profile.longest_streak,
      level: progress.level,
      xpToNext: Math.max(0, progress.toNext - progress.intoLevel),
      daysInactive: daysInactiveSince(profile.last_checkin_date, localDay),
      timeLeft: formatTimeLeft(minutesLeft),
      minutesLeft,
      day: localDay,
    },
    "anime_wrapped_card",
  );

  return (
    <>
      <h1 className="mb-[26px] font-display text-[32px]">Cards</h1>
      {linkError ? (
        <p className="mb-3 text-[13px] font-medium" role="alert">
          {linkError}
        </p>
      ) : null}
      {!wrapped.ok ? (
        <p className="text-center text-[15px] font-medium">{WRAPPED_ERROR_COPY[wrapped.code]}</p>
      ) : (
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
          <div className="flex w-full max-w-sm min-w-0 flex-col items-center">
            <CardPreview
              data={{
                ...wrapped.card,
                username: profile.username,
                level: progress.level,
              }}
            />
            {!wrapped.enoughData ? (
              <p className="mt-3 text-center text-[13px] font-medium text-ink-soft">
                Not enough data. Type defaults to Wanderer.
              </p>
            ) : null}
          </div>
          <div className="w-full max-w-sm min-w-0">
            <CoachLine line={cardRoast.line} tone={cardRoast.tone} label="Card roast" />
            <WrappedActions username={profile.anilist_username} copyPath={`/u/${profile.username}`} />
            <RefreshCardButton
              wide
              className="mt-3 flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-card text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed disabled:opacity-60"
            />
          </div>
        </div>
      )}
    </>
  );
}
