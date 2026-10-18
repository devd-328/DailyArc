import { StatsBoard, type StatBar } from "@/components/StatsBoard";
import { STATS } from "@/lib/config";
import { loadStatXp, loadXpAwards, progressFromProfile, requireProfile } from "@/lib/profile";
import { nextRankAt } from "@/lib/ranks";
import { localCheckinDate } from "@/lib/streaks";
import { requireUser } from "@/lib/supabase/session";
import { xpRanges } from "@/lib/xp-series";
import { xpProgress } from "@/lib/xp";
import { connection } from "next/server";

export default function StatsPage() {
  return <StatsBody />;
}

async function StatsBody() {
  const user = await requireUser();
  await connection();
  const now = new Date();
  const since = new Date(now);
  since.setUTCDate(since.getUTCDate() - 400);
  const [profile, statXp, awards] = await Promise.all([
    requireProfile(user.id),
    loadStatXp(user.id),
    loadXpAwards(user.id, since),
  ]);
  const progress = progressFromProfile(profile);
  const ranges = xpRanges(awards, localCheckinDate(now, profile.timezone), profile.timezone);
  const ranked = STATS.map((stat) => ({ stat, xp: statXp[stat] })).sort((a, b) => b.xp - a.xp);
  const topXp = ranked[0]?.xp ?? 0;
  const rows: StatBar[] = ranked.map((row) => ({
    stat: row.stat,
    level: xpProgress(row.xp).level,
    xp: row.xp,
    percent: topXp > 0 ? Math.round((row.xp / topXp) * 100) : 0,
    top: topXp > 0 && row.xp === topXp,
  }));
  const next = nextRankAt(progress.level);

  return (
    <div className="app-split">
    <div>
      <StatsBoard
        rank={progress.rank}
        nextLabel={next ? `${next.rank} at level ${next.level}` : "S rank"}
        rows={rows}
        ranges={ranges}
      />
      <p className="mt-3.5 text-[13px] font-medium text-ink-soft lg:hidden">
        Each bar is that stat's share of your strongest stat. Quests raise the stat they train.
      </p>
    </div>
    <aside className="app-rail">
      <section className="rounded-card border-2 border-ink bg-card p-4 shadow-panel">
        <h2 className="font-display text-[22px]">How stats work</h2>
        <p className="mt-3 text-[15px] font-medium leading-normal">
          Each quest trains one stat. The bar compares that stat with your strongest one. Top is whichever has the most XP.
        </p>
        <p className="mt-3 text-[15px] font-medium leading-normal">
          Skip a day and the streak resets. XP stays. Rank is from total XP, not vibes.
        </p>
      </section>
    </aside>
    </div>
  );
}
