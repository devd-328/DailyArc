import { AnimeCardPrompt, OptionalCardNote } from "@/components/AnimeCardPrompt";
import { HowItWorks } from "@/components/HowItWorks";
import { QuestBoard } from "@/components/QuestBoard";
import { RankBadge } from "@/components/RankBadge";
import { XpBar } from "@/components/XpBar";
import { XpChart } from "@/components/XpChart";
import { STAT_LABELS, STATS } from "@/lib/config";
import { STARTER_TEMPLATES } from "@/lib/quest-templates";
import { loadQuestBoard, loadStatXp, loadXpAwards, primeActiveQuests, progressFromProfile, requireProfile } from "@/lib/profile";
import { daysInactiveSince, formatTimeLeft, minutesUntilDayReset } from "@/lib/streaks";
import { requireUser } from "@/lib/supabase/session";
import { watcherTypeLabel } from "@/lib/watcherType";
import { xpRanges } from "@/lib/xp-series";
import { xpProgress } from "@/lib/xp";
import { connection } from "next/server";
import Link from "next/link";
import { Suspense } from "react";

export default function QuestsPage({ searchParams }: PageProps<"/quests">) {
  return <QuestsBody searchParams={searchParams} />;
}

async function QuestsBody({ searchParams }: { searchParams: PageProps<"/quests">["searchParams"] }) {
  const [user, params] = await Promise.all([requireUser(), searchParams]);
  await connection();
  const now = new Date();
  const since = new Date(now);
  since.setUTCDate(since.getUTCDate() - 400);
  primeActiveQuests(user.id);
  const awards = loadXpAwards(user.id, since);
  const [profile, statXp] = await Promise.all([requireProfile(user.id), loadStatXp(user.id)]);
  const board = await loadQuestBoard(profile, now);
  const progress = progressFromProfile(profile);
  const rankedStats = STATS.map((stat) => {
    const xp = statXp[stat];
    const statProgress = xpProgress(xp);
    const percent = statProgress.toNext <= 0 ? 100 : Math.round((statProgress.intoLevel / statProgress.toNext) * 100);
    return { stat, xp, level: statProgress.level, percent };
  }).sort((a, b) => b.xp - a.xp || a.stat.localeCompare(b.stat));
  const topStat = rankedStats[0];
  const doneCount = board.quests.filter((quest) => quest.done).length;
  const questsLeft = board.quests.length - doneCount;
  const nextLevel = progress.toNext === 0 ? null : progress.level + 1;
  const typeLabel = watcherTypeLabel(profile.watcher_type);
  const minutesLeft = minutesUntilDayReset(now, profile.timezone);
  const roast = {
    name: profile.username,
    streakDays: profile.current_streak,
    bestStreak: profile.longest_streak,
    level: progress.level,
    xpToNext: Math.max(0, progress.toNext - progress.intoLevel),
    daysInactive: daysInactiveSince(profile.last_checkin_date, board.localDay),
    timeLeft: formatTimeLeft(minutesLeft),
    minutesLeft,
    day: board.localDay,
  };

  return (
    <div className="app-split">
      <div className="min-w-0">
        <section className="flex items-center gap-4 rounded-card border-2 border-ink bg-card p-4 shadow-panel">
          <RankBadge rank={progress.rank} size={76} />
          <div className="min-w-0 flex-1">
            <div className="font-display text-[32px] leading-tight">Level {progress.level}</div>
            <div className="mt-2.5">
              <XpBar intoLevel={progress.intoLevel} toNext={progress.toNext} />
            </div>
            {nextLevel ? (
              <p className="mt-1.5 text-[13px] font-medium text-ink-soft">
                {progress.intoLevel.toLocaleString("en-US")} of {progress.toNext.toLocaleString("en-US")} XP to
                level {nextLevel}
              </p>
            ) : null}
          </div>
        </section>

        <div className="mt-[18px] grid grid-cols-3 gap-2">
          <section className="rounded-card border-2 border-ink bg-card px-2.5 py-3 shadow-row">
            <div className="text-[13px] font-bold text-ink-soft">Streak</div>
            <div className="font-display text-[22px] leading-tight">
              {profile.current_streak} {profile.current_streak === 1 ? "day" : "days"}
            </div>
            <div className="text-[13px] font-medium text-ink-soft">best {profile.longest_streak}</div>
          </section>
          <section className="rounded-card border-2 border-ink bg-card px-2.5 py-3 shadow-row">
            <div className="text-[13px] font-bold text-ink-soft">Quests</div>
            <div className="font-display text-[22px] leading-tight">
              {doneCount}/{board.quests.length}
            </div>
            <div className="text-[13px] font-medium text-ink-soft">
              {board.quests.length === 0 ? "none yet" : `${questsLeft} left today`}
            </div>
          </section>
          <section className="rounded-card border-2 border-ink bg-card px-2.5 py-3 shadow-row">
            <div className="text-[13px] font-bold text-ink-soft">Top stat</div>
            <div className="text-[15px] font-bold leading-tight">{topStat ? STAT_LABELS[topStat.stat] : "None"}</div>
            <div className="text-[13px] font-medium text-ink-soft">{topStat ? `Lv ${topStat.level}` : "Lv 1"}</div>
          </section>
        </div>

        <Suspense fallback={<WeekChartFallback />}>
          <WeekXp awards={awards} localDay={board.localDay} timeZone={profile.timezone} />
        </Suspense>

        <div className="mt-[18px] flex items-baseline justify-between">
          <h2 className="font-display text-[22px]">Stats</h2>
          <Link href="/stats" className="text-sm font-bold text-ink-soft">
            View all
          </Link>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {rankedStats.slice(0, 2).map((row, index) => (
            <section key={row.stat} className="rounded-card border-2 border-ink bg-card px-3 py-3 shadow-row">
              <div className="text-[15px] font-bold">{STAT_LABELS[row.stat]}</div>
              <div className="font-display text-[22px] leading-tight">{row.xp.toLocaleString("en-US")} XP</div>
              <div className="mt-2 h-3.5 border-2 border-ink bg-paper">
                {row.percent > 0 ? (
                  <i className={`block h-full ${index === 0 ? "bg-sun" : "bg-teal"}`} style={{ width: `${row.percent}%` }} />
                ) : null}
              </div>
              <div className="mt-1 text-[13px] font-bold text-ink-soft">{row.percent}% to next</div>
            </section>
          ))}
        </div>

        <div className="mt-[22px] lg:hidden">
          <AnimeCardPrompt
            username={profile.username}
            anilistUsername={profile.anilist_username}
            watcherTypeLabel={typeLabel}
          />
        </div>

        <QuestBoard
          quests={board.quests}
          streakDays={profile.current_streak}
          rank={progress.rank}
          starters={STARTER_TEMPLATES}
          roast={roast}
          timezone={profile.timezone}
          openComposer={(Array.isArray(params.new) ? params.new[0] : params.new) === "1"}
        />
      </div>

      <aside className="app-rail">
        <HowItWorks />
        <AnimeCardPrompt
          username={profile.username}
          anilistUsername={profile.anilist_username}
          watcherTypeLabel={typeLabel}
        />
        {profile.anilist_username ? null : <OptionalCardNote />}
      </aside>
    </div>
  );
}

function WeekChartFallback() {
  return (
    <section className="mt-[18px] rounded-card border-2 border-ink bg-card px-3.5 py-4 shadow-panel" aria-busy="true">
      <h2 className="font-display text-[22px]">XP this week</h2>
      <p className="sr-only">Loading this week's XP</p>
      <div className="mt-3 h-[140px] animate-pulse rounded-card border-2 border-ink bg-paper-2" />
    </section>
  );
}

async function WeekXp({
  awards,
  localDay,
  timeZone,
}: {
  awards: ReturnType<typeof loadXpAwards>;
  localDay: string;
  timeZone: string;
}) {
  const week = xpRanges(await awards, localDay, timeZone).week;
  return (
    <section className="mt-[18px] rounded-card border-2 border-ink bg-card px-3.5 py-4 shadow-panel">
      <h2 className="font-display text-[22px]">XP this week</h2>
      <div className="mt-3">
        <XpChart points={week.points} label="XP this week" />
      </div>
    </section>
  );
}
