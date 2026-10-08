export type CoachTone = "empty" | "roast" | "nudge" | "win";

export type CoachInput = {
  questCount: number;
  doneCount: number;
  streakDays: number;
};

export function coachTone({ questCount, doneCount }: CoachInput): CoachTone {
  if (questCount === 0) return "empty";
  if (doneCount === questCount) return "win";
  if (doneCount === 0) return "roast";
  return "nudge";
}

/** Rival-board lines. Sentence case, no em dashes. */
export function coachLine(input: CoachInput): string {
  const { questCount, doneCount, streakDays } = input;
  const remaining = questCount - doneCount;

  if (questCount === 0) {
    return "Tap Add on a starter. A blank board stays Rank E.";
  }
  if (doneCount === 0) {
    if (streakDays <= 0) {
      return "Zero check-ins. Your streak is a rumor. Tap one box.";
    }
    return `Streak of ${streakDays} and nothing done today. Do not bottle it.`;
  }
  if (remaining === 0) {
    return "Board cleared. Come back tomorrow or it was a fluke.";
  }
  if (remaining === 1) {
    return "One left. Finish it. Half-done is still extra energy.";
  }
  return `${remaining} still open. You adding quests for decoration?`;
}
