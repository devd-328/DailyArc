import { AnimeCardPrompt, OptionalCardNote } from "@/components/AnimeCardPrompt";
import { HowItWorks } from "@/components/HowItWorks";
import { QuestBoard } from "@/components/QuestBoard";
import { RankBadge } from "@/components/RankBadge";
import { XpBar } from "@/components/XpBar";
import { STARTER_TEMPLATES } from "@/lib/quest-templates";
import { loadQuestBoard, progressFromProfile, requireProfile } from "@/lib/profile";
import { requireUser } from "@/lib/supabase/session";
import { watcherTypeLabel } from "@/lib/watcherType";
import { connection } from "next/server";
import { Suspense } from "react";

export default function QuestsPage() {
  return (
    <Suspense>
      <QuestsBody />
    </Suspense>
  );
}

async function QuestsBody() {
  const user = await requireUser();
  const profile = await requireProfile(user.id);
  await connection();
  const now = new Date();
  const progress = progressFromProfile(profile);
  const board = await loadQuestBoard(profile, now);
  const nextLevel = progress.toNext === 0 ? null : progress.level + 1;
  const typeLabel = watcherTypeLabel(profile.watcher_type);

  return (
    <div className="app-split">
      <div className="min-w-0">
        <header className="mb-[18px] flex items-center justify-between">
          <div className="-rotate-2 border-2 border-ink bg-sun px-3.5 py-1.5 text-[15px] font-bold shadow-row">
            {profile.username}
          </div>
          <div className="rounded-chip border-2 border-ink bg-card px-3.5 py-1.5 text-sm font-bold">
            Streak: {profile.current_streak} days
          </div>
        </header>

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
