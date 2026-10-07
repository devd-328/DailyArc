import { RankBadge } from "@/components/RankBadge";
import { RankUpActions } from "@/components/RankUpActions";
import { XpBar } from "@/components/XpBar";
import { parseRankUpXp, rankUpCopy } from "@/lib/checkin";
import { progressFromProfile, requireProfile } from "@/lib/profile";
import { requireUser } from "@/lib/supabase/session";
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
