import { CoachLine } from "@/components/CoachLine";
import { RankBadge } from "@/components/RankBadge";
import { RankUpActions } from "@/components/RankUpActions";
import { XpBar } from "@/components/XpBar";
import { parseRankUpXp, rankUpCopy } from "@/lib/checkin";
import { roastLine } from "@/lib/coach";
import { progressFromProfile, requireProfile } from "@/lib/profile";
import { daysInactiveSince, formatTimeLeft, localCheckinDate, minutesUntilDayReset } from "@/lib/streaks";
import { requireUser } from "@/lib/supabase/session";
import { connection } from "next/server";
import { Suspense } from "react";

export const instant = false;

export default function RankUpPage(props: PageProps<"/rank-up">) {
  return (
    <main className="halftone relative min-h-dvh overflow-x-clip">
      <div className="mx-auto flex w-full max-w-[390px] flex-col items-center px-5 pb-8 pt-[70px] md:max-w-md">
        <Suspense>
          <RankUpBody searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function RankUpBody({ searchParams }: Pick<PageProps<"/rank-up">, "searchParams">) {
  const user = await requireUser();
  const profile = await requireProfile(user.id);
  const params = await searchParams;
  const xpAwarded = parseRankUpXp(params.xp);
  const progress = progressFromProfile(profile);
  const nextLevel = progress.toNext === 0 ? null : progress.level + 1;
  await connection();
  const now = new Date();
  const localDay = localCheckinDate(now, profile.timezone);
  const minutesLeft = minutesUntilDayReset(now, profile.timezone);
  const roast = roastLine(
    {
      name: profile.username,
      quests: [{ name: "Quest", done: true }],
      streakDays: profile.current_streak,
      bestStreak: profile.longest_streak,
      level: progress.level,
      xpToNext: Math.max(0, progress.toNext - progress.intoLevel),
      daysInactive: daysInactiveSince(profile.last_checkin_date, localDay),
      timeLeft: formatTimeLeft(minutesLeft),
      minutesLeft,
      day: localDay,
    },
    "level_up_roast",
  );

  return (
    <div className="relative flex w-full flex-col items-center">
      <div className="rank-up-burst" aria-hidden="true" />
      <div className="relative mt-6">
        <div className="-rotate-[4deg] shadow-[6px_6px_0_var(--ink)]">
          <RankBadge rank={progress.rank} size={176} />
        </div>
        <span
          className="font-sfx pointer-events-none absolute -top-[34px] -right-[92px] rotate-[8deg] text-[48px] text-pink"
          aria-hidden="true"
        >
          ドン
        </span>
      </div>
      <h1 className="mt-11 text-center font-display text-[48px] leading-[1.05]">Rank up</h1>
      <div className="mt-2 text-center font-display text-[32px]">Level {progress.level}</div>
      {xpAwarded != null ? (
        <p className="mt-3.5 max-w-[280px] text-center text-base font-medium leading-normal">
          {rankUpCopy(progress.rank, xpAwarded)}
        </p>
      ) : null}
      <div className="mt-4 w-full">
        <CoachLine line={roast.line} tone="win" label="Rank roast" />
      </div>
      <div className="mt-[30px] w-full">
        <XpBar intoLevel={progress.intoLevel} toNext={progress.toNext} />
        {nextLevel ? (
          <p className="mt-1.5 text-center text-[13px] font-medium text-ink-soft">
            {progress.intoLevel.toLocaleString("en-US")} of {progress.toNext.toLocaleString("en-US")} XP to
            level {nextLevel}
          </p>
        ) : null}
      </div>
      <RankUpActions sharePath={`/u/${profile.username}`} />
    </div>
  );
}
