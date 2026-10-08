"use client";

import { crossedRankBoundary, parseCheckInResult } from "@/lib/checkin";
import { applyStreakBonus } from "@/lib/streaks";
import { quests as questConfig, STAT_LABELS, streaks, type Rank } from "@/lib/config";
import type { QuestRow } from "@/lib/profile";
import { starterAdded, type StarterTemplate } from "@/lib/quest-templates";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CoachLine } from "./CoachLine";
import { HowItWorks } from "./HowItWorks";
import { NewQuestSheet } from "./NewQuestSheet";

type BoardQuest = QuestRow & { done: boolean };

export function QuestBoard({
  quests,
  streakDays,
  rank,
  starters,
}: {
  quests: BoardQuest[];
  streakDays: number;
  rank: Rank;
  starters: readonly StarterTemplate[];
}) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingTemplate, setPendingTemplate] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string[]>([]);
  const doneCount = quests.filter((quest) => quest.done).length;
  const bonus = currentBonusLabel(streakDays);
  const atLimit = quests.length >= questConfig.maxActive;
  const questNames = [...quests.map((quest) => quest.name), ...justAdded];
  const openStarters = starters.filter((item) => !starterAdded(item.name, questNames));
  const empty = quests.length === 0;

  async function checkIn(questId: string) {
    if (pendingId) return;
    setPendingId(questId);
    const response = await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quest_id: questId }),
    });
    setPendingId(null);
    if (!response.ok) return;
    const result = parseCheckInResult(await response.json());
    if (result && !result.duplicate && crossedRankBoundary(rank, result.rank)) {
      router.push(`/rank-up?xp=${result.xpAwarded}`);
      return;
    }
    router.refresh();
  }

  async function addStarter(templateId: string, name: string) {
    if (pendingTemplate || atLimit) return;
    setPendingTemplate(templateId);
    const response = await fetch("/api/quests/from-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template_id: templateId }),
    });
    setPendingTemplate(null);
    if (!response.ok) return;
    setJustAdded((current) => (current.includes(name) ? current : [...current, name]));
    router.refresh();
  }

  return (
    <>
      {empty ? (
        <div className="mt-[22px] lg:hidden">
          <HowItWorks compact />
        </div>
      ) : (
        <div className="mt-[22px]">
          <CoachLine questCount={quests.length} doneCount={doneCount} streakDays={streakDays} />
        </div>
      )}

      <div className="mt-[18px] flex items-baseline justify-between">
        <h2 className="font-display text-[22px]">{empty ? "Pick your first quests" : "Today's quests"}</h2>
        <span className="text-sm font-bold text-ink-soft">
          {empty ? "Tap Add" : `${doneCount} of ${quests.length} done`}
        </span>
      </div>
      {bonus ? (
        <p className="mb-2.5 mt-1 text-[13px] font-medium text-ink-soft">
          Streak bonus: <b className="font-bold text-ink">{bonus}</b> on daily quests
        </p>
      ) : (
        <div className="mb-2.5" />
      )}

      {empty ? null : (
        <ul className="flex flex-col gap-2.5">
          {quests.map((quest) => {
            const shownXp =
              quest.cadence === "daily" ? applyStreakBonus(quest.xp_value, streakDays) : quest.xp_value;
            return (
              <li key={quest.id}>
                <div className="flex min-h-[66px] items-center gap-3 rounded-card border-2 border-ink bg-card px-3 py-2.5 shadow-row">
                  <button
                    type="button"
                    disabled={quest.done || pendingId != null}
                    onClick={() => void checkIn(quest.id)}
                    aria-label={quest.done ? `${quest.name} done` : `Check in ${quest.name}`}
                    className={`grid size-7 shrink-0 place-items-center border-2 border-ink ${
                      quest.done ? "bg-teal" : "bg-card"
                    }`}
                  >
                    {quest.done ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M3 8.5l3.2 3.2L13 4.8"
                          stroke="var(--card)"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className={`text-base font-bold leading-tight ${quest.done ? "text-ink-soft line-through" : ""}`}>
                      {quest.name}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="rounded-chip bg-paper-2 px-2.5 py-0.5 text-[13px] font-bold">
                        {STAT_LABELS[quest.stat]}
                      </span>
                      {quest.cadence === "weekly" ? (
                        <span className="rounded-chip border-2 border-ink bg-card px-2 text-[13px] font-bold">Weekly</span>
                      ) : null}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-chip border-2 border-ink bg-sun px-2.5 py-px text-[13px] font-bold">
                    +{shownXp} XP
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {openStarters.length > 0 && !atLimit ? (
        <ul className={`flex flex-col gap-2.5 ${empty ? "" : "mt-3.5"}`}>
          {empty ? null : (
            <li className="text-[13px] font-bold text-ink-soft">More ideas. One tap.</li>
          )}
          {openStarters.map((starter) => (
            <li key={starter.id}>
              <div className="flex min-h-[66px] items-center gap-3 rounded-card border-2 border-ink bg-card px-3 py-2.5 shadow-row">
                <div className="min-w-0 flex-1">
                  <div className="text-base font-bold leading-tight">{starter.name}</div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-chip bg-paper-2 px-2.5 py-0.5 text-[13px] font-bold">
                      {STAT_LABELS[starter.stat]}
                    </span>
                    <span className="rounded-chip border-2 border-ink bg-sun px-2.5 py-px text-[13px] font-bold">
                      +{starter.xp_value} XP
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={pendingTemplate != null}
                  onClick={() => void addStarter(starter.id, starter.name)}
                  className="flex min-h-11 shrink-0 items-center justify-center rounded-btn border-2 border-ink bg-card px-3.5 text-sm font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed disabled:opacity-60"
                >
                  Add
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        disabled={atLimit}
        onClick={() => setSheetOpen(true)}
        className="mt-3.5 flex min-h-12 w-full items-center justify-center gap-2 rounded-btn border-2 border-ink bg-card text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed disabled:opacity-60"
      >
        <span className="text-xl leading-none">+</span> {empty ? "Write my own quest" : "New quest"}
      </button>
      <p className="mt-2 text-center text-[13px] font-medium text-ink-soft">
        {quests.length} of {questConfig.maxActive} quests used
      </p>

      {sheetOpen ? (
        <NewQuestSheet used={quests.length} onClose={() => setSheetOpen(false)} onSaved={() => router.refresh()} />
      ) : null}
    </>
  );
}

function currentBonusLabel(streakDays: number): string | null {
  const bonus = streaks.bonuses.find((item) => streakDays >= item.minDays);
  if (!bonus) return null;
  const percent = Math.round((bonus.multiplier - 1) * 100);
  return `+${percent}% XP`;
}
