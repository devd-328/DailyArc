import { loadWrapped } from "@/app/wrapped/load-wrapped";
import { CardPreview } from "@/components/CardPreview";
import { RefreshCardButton } from "@/components/RefreshCardButton";
import { WrappedActions } from "@/components/WrappedActions";
import { authErrorMessage } from "@/lib/anilist-oauth";
import { CONFIG_VERSION } from "@/lib/config";
import { progressFromProfile, requireProfile } from "@/lib/profile";
import { requireUser } from "@/lib/supabase/session";
import { utcDay, WRAPPED_ERROR_COPY } from "@/lib/wrapped";
import { io } from "next/cache";
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
        <div className="mx-auto flex w-full max-w-sm flex-col items-center">
          <div
            className="grid place-items-center rounded-card border-2 border-dashed border-ink-soft bg-card/60"
            style={{ width: 190, height: 338, transform: "rotate(-3deg)" }}
          >
            <span className="font-display text-[64px] text-ink-soft">?</span>
          </div>
          <h2 className="mt-[30px] text-center font-display text-[22px]">No card yet</h2>
          <p className="mx-auto mt-2 max-w-[270px] text-center text-[15px] font-medium leading-normal">
            Link AniList if you want the watcher card. Skip it if you are here for quests.
          </p>
          <a
            href="/auth/anilist?next=/cards"
            className="mt-[22px] flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-pink text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
          >
            Link AniList
          </a>
          <p className="mt-2 text-center text-[13px] font-medium text-ink-soft">
            Your quests and rank keep working without it.
          </p>
        </div>
      </>
    );
  }

  await io();
  const wrapped = await loadWrapped(profile.anilist_username, utcDay(new Date()), CONFIG_VERSION);
  const progress = progressFromProfile(profile);

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
