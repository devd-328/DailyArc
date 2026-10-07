import { describe, expect, it } from "vitest";
import { leveling } from "./config";
import { levelFromXp, totalXpToReach, xpProgress, xpToNext } from "./xp";

describe("xpToNext", () => {
  it("matches round(12 * level^1.5) for levels used in the docs", () => {
    expect(xpToNext(1)).toBe(12);
    expect(xpToNext(27)).toBe(1684);
    expect(xpToNext(30)).toBe(1972);
  });

  it("returns 0 at the cap", () => {
    expect(xpToNext(leveling.levelCap)).toBe(0);
  });

  it("rejects invalid levels", () => {
    expect(() => xpToNext(0)).toThrow(RangeError);
    expect(() => xpToNext(1.5)).toThrow(RangeError);
  });
});

describe("totalXpToReach and levelFromXp", () => {
  it("matches the exact curve, which is the PRODUCT.md pacing table rounded to the nearest 100", () => {
    expect(totalXpToReach(10)).toBe(1332);
    expect(totalXpToReach(20)).toBe(8055);
    expect(totalXpToReach(30)).toBe(22683);
    expect(totalXpToReach(40)).toBe(47064);
    expect(totalXpToReach(50)).toBe(82742);
  });

  it("starts at level 1 with 0 XP", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(-10)).toBe(1);
  });

  it("levels up exactly when the next-level cost is met", () => {
    const to2 = xpToNext(1);
    expect(levelFromXp(to2 - 1)).toBe(1);
    expect(levelFromXp(to2)).toBe(2);
  });

  it("caps at 50 even with extra XP", () => {
    expect(levelFromXp(totalXpToReach(50))).toBe(50);
    expect(levelFromXp(totalXpToReach(50) + 999_999)).toBe(50);
  });

  it("reports progress into the current level", () => {
    const to28 = xpToNext(27);
    const start = totalXpToReach(27);
    expect(xpProgress(start + 640)).toEqual({ level: 27, intoLevel: 640, toNext: to28 });
  });
});
