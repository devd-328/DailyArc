import type { Rank } from "./config";
import { isRank } from "./ranks";

export type CheckInResult = {
  duplicate: boolean;
  xpAwarded: number;
  level: number;
  rank: Rank;
  streak: number;
};

export function parseCheckInResult(data: unknown): CheckInResult | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  if (typeof row.duplicate !== "boolean") return null;
  if (typeof row.xp_awarded !== "number" || !Number.isFinite(row.xp_awarded)) return null;
  if (typeof row.level !== "number" || !Number.isInteger(row.level) || row.level < 1) return null;
  if (!isRank(row.rank)) return null;
  if (typeof row.streak !== "number" || !Number.isInteger(row.streak) || row.streak < 0) return null;
  return {
    duplicate: row.duplicate,
    xpAwarded: row.xp_awarded,
    level: row.level,
    rank: row.rank,
    streak: row.streak,
  };
}

export function crossedRankBoundary(previous: Rank, next: Rank): boolean {
  return previous !== next;
}

/** Mockup line from screens.html. Rank and XP come from check-in / lib functions. */
export function rankUpCopy(rank: Rank, xpAwarded: number): string {
  return `${rank} rank unlocked. Quest done. +${xpAwarded} XP.`;
}

export function parseRankUpXp(value: unknown): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) return null;
  return Number(raw);
}
