import { RANKS, leveling, type Rank } from "./config";

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
