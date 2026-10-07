import { RankBadge } from "@/components/RankBadge";
import { STAT_LABELS, STATS } from "@/lib/config";
import { loadStatXp, progressFromProfile, requireProfile } from "@/lib/profile";
import { nextRankAt } from "@/lib/ranks";
import { requireUser } from "@/lib/supabase/session";
import { xpProgress } from "@/lib/xp";
import { Suspense } from "react";

export default function StatsPage() {
  return (
    <Suspense>
      <StatsBody />
    </Suspense>
  );
}

async function StatsBody() {
  const user = await requireUser();
  const profile = await requireProfile(user.id);
  const progress = progressFromProfile(profile);
  const statXp = await loadStatXp(profile.id);
  const rows = STATS.map((stat) => {
    const xp = statXp[stat];
    const { level, intoLevel, toNext } = xpProgress(xp);
    const filled = toNext <= 0 ? 10 : Math.min(10, Math.floor((intoLevel / toNext) * 10));
    return { stat, level, filled, xp };
  }).sort((a, b) => b.xp - a.xp);
  const topXp = rows[0]?.xp ?? 0;
  const next = nextRankAt(progress.level);

  return (
    <>
      <header className="relative mb-4">
        <h1 className="pr-36 font-display text-[32px]">Stats</h1>
        <div className="absolute top-0 right-0 rotate-[3deg] border-2 border-ink bg-sun px-3 py-1.5 text-sm font-bold shadow-row">
          Streak: {profile.current_streak} days
        </div>
      </header>

      <section className="rounded-card border-2 border-ink bg-card px-3.5 py-4 shadow-panel">
        <div className="flex gap-4">
          <div className="w-[92px] shrink-0 text-center">
            <RankBadge rank={progress.rank} size={76} />
            <div className="mt-2 text-[13px] font-bold text-ink-soft">Level</div>
            <div className="font-display text-[32px] leading-none">{progress.level}</div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {rows.map((row) => (
              <div key={row.stat}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[15px] font-bold">
                    {STAT_LABELS[row.stat]}
                    {topXp > 0 && row.xp === topXp ? (
                      <span className="ml-1.5 rounded-chip border-2 border-ink bg-sun px-2 py-px text-[13px] font-bold">
                        Top
                      </span>
                    ) : null}
                  </span>
                  <small className="text-[13px] font-bold text-ink-soft">Lv {row.level}</small>
                </div>
                <div className="mt-1 flex gap-0.5">
                  {Array.from({ length: 10 }, (_, index) => (
                    <i
                      key={index}
                      className={`h-3.5 flex-1 border-2 border-ink ${index < row.filled ? "bg-sun" : "bg-paper"}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-[18px] flex items-center justify-between rounded-card border-2 border-ink bg-card px-4 py-3 shadow-row">
        <div>
          <div className="text-[13px] font-bold text-ink-soft">Total XP</div>
          <div className="font-display text-[22px]">{profile.total_xp.toLocaleString("en-US")}</div>
        </div>
        <div className="text-right">
          <div className="text-[13px] font-bold text-ink-soft">Next rank</div>
          <div className="text-[15px] font-bold">
            {next ? `${next.rank} at level ${next.level}` : "S rank"}
          </div>
        </div>
      </section>
      <p className="mt-3.5 text-[13px] font-medium text-ink-soft">
        Each bar shows progress to the next level of that stat. Quests raise the stat they train.
      </p>
    </>
  );
}
