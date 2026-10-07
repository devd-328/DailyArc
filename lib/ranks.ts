import { RANKS, leveling, type Rank } from "./config";

export function isRank(value: unknown): value is Rank {
  return typeof value === "string" && (RANKS as readonly string[]).includes(value);
}

/** Rank for a level. Level 1 is E. The cap (50) is S. */
export function rankForLevel(level: number): Rank {
  if (!Number.isInteger(level) || level < 1) {
    throw new RangeError(`level must be an integer >= 1, got ${level}`);
  }
  let rank: Rank = "E";
  for (const candidate of RANKS) {
    if (level >= leveling.rankStartLevel[candidate]) rank = candidate;
  }
  return rank;
}

/** Next rank and the level where it starts. Null at S. */
export function nextRankAt(level: number): { rank: Rank; level: number } | null {
  const current = rankForLevel(level);
  const index = RANKS.indexOf(current);
  if (index < 0 || index === RANKS.length - 1) return null;
  const rank = RANKS[index + 1];
  return { rank, level: leveling.rankStartLevel[rank] };
}
