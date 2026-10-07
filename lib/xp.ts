import { leveling } from "./config";

/**
 * XP needed to go from `level` to `level + 1`.
 * Formula: round(12 * level^1.5). Returns 0 at the cap (there is no next level).
 */
export function xpToNext(level: number): number {
  if (!Number.isInteger(level) || level < 1) {
    throw new RangeError(`level must be an integer >= 1, got ${level}`);
  }
  if (level >= leveling.levelCap) return 0;
  return Math.round(leveling.xpCurveConstant * level ** leveling.xpCurveExponent);
}

/**
 * Total XP required to *reach* `level` from level 1 (sum of xpToNext for 1 .. level-1).
 */
export function totalXpToReach(level: number): number {
  if (!Number.isInteger(level) || level < 1) {
    throw new RangeError(`level must be an integer >= 1, got ${level}`);
  }
  const capped = Math.min(level, leveling.levelCap);
  let total = 0;
  for (let n = 1; n < capped; n++) total += xpToNext(n);
  return total;
}

/**
 * Overall (or per-stat) level from total XP. Starts at 1. Caps at 50.
 * XP past the cap is kept but does not raise the level.
 */
export function levelFromXp(totalXp: number): number {
  const xp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  let remaining = xp;
  while (level < leveling.levelCap) {
    const need = xpToNext(level);
    if (remaining < need) break;
    remaining -= need;
    level += 1;
  }
  return level;
}

/** XP earned toward the next level, and the size of that level. Both 0 at the cap. */
export function xpProgress(totalXp: number): { level: number; intoLevel: number; toNext: number } {
  const level = levelFromXp(totalXp);
  const toNext = xpToNext(level);
  const intoLevel = Math.max(0, Math.floor(totalXp) - totalXpToReach(level));
  return { level, intoLevel, toNext };
}
