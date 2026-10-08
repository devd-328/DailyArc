import { ROAST_COPY, type RoastTrigger } from "./roast-copy";

export type { RoastTrigger };

export type CoachTone = "roast" | "win";

export type RoastInput = {
  name: string;
  quests: readonly { name: string; done: boolean }[];
  streakDays: number;
  bestStreak: number;
  level: number;
  xpToNext: number;
  daysInactive: number;
  timeLeft: string;
  minutesLeft: number;
  day: string;
};

export type RoastResult = {
  trigger: RoastTrigger;
  line: string;
  tone: CoachTone;
};

const LATE_NIGHT_MINUTES = 4 * 60;

export function pickRoast(lines: readonly string[], seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return lines[hash % lines.length];
}

export function roastTrigger(input: RoastInput): RoastTrigger {
  const remaining = input.quests.filter((quest) => !quest.done).length;
  const hasQuests = input.quests.length > 0;

  if (input.daysInactive >= 7) return "inactive_7d";
  if (input.daysInactive >= 3) return "inactive_3d";
  if (input.streakDays === 0 && input.bestStreak > 0 && input.daysInactive >= 1) {
    return "streak_broken";
  }
  if (hasQuests && remaining > 0 && input.streakDays > 0 && remaining === input.quests.length) {
    return "streak_at_risk";
  }
  if (hasQuests && remaining > 0 && input.minutesLeft <= LATE_NIGHT_MINUTES) {
    return "late_night";
  }
  if (hasQuests && remaining > 0 && input.level <= 9 && input.bestStreak >= 3) {
    return "low_level";
  }
  if (hasQuests && remaining > 0) return "skipped_habit";
  if (hasQuests && remaining === 0) return "level_up_roast";
  return "motivational_mean";
}

function varsFor(trigger: RoastTrigger, input: RoastInput): Record<string, string> {
  const missed = input.quests.filter((quest) => !quest.done);
  const streakCopy =
    trigger === "streak_broken" && input.streakDays === 0 ? input.bestStreak : input.streakDays;
  return {
    name: input.name,
    streak_days: String(streakCopy),
    best_streak: String(input.bestStreak),
    level: String(input.level),
    xp_to_next: String(input.xpToNext),
    days_inactive: String(input.daysInactive),
    habit_name: missed[0]?.name ?? "",
    habits_missed: missed.length > 0 ? String(missed.length) : "",
    time_left: input.timeLeft,
  };
}

function usable(line: string, vars: Record<string, string>): boolean {
  for (const match of line.matchAll(/\{([a-z_]+)\}/g)) {
    if (!vars[match[1]]) return false;
  }
  return true;
}

function fill(line: string, vars: Record<string, string>): string {
  return line.replace(/\{([a-z_]+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

export function roastLine(input: RoastInput, force?: RoastTrigger): RoastResult {
  const trigger = force ?? roastTrigger(input);
  const vars = varsFor(trigger, input);
  const pool = ROAST_COPY[trigger].filter((line) => usable(line, vars));
  const fallback = ROAST_COPY.motivational_mean.filter((line) => usable(line, vars));
  const lines = pool.length > 0 ? pool : fallback;
  const seed = `${input.day}:${trigger}:${input.streakDays}:${input.daysInactive}:${input.quests.length}`;
  const picked = pickRoast(lines, seed);
  const remaining = input.quests.filter((quest) => !quest.done).length;
  return {
    trigger: pool.length > 0 ? trigger : "motivational_mean",
    line: fill(picked, vars),
    tone: remaining === 0 && input.quests.length > 0 ? "win" : "roast",
  };
}

export function coachLine(input: RoastInput, force?: RoastTrigger): string {
  return roastLine(input, force).line;
}
