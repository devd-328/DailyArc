import { describe, expect, it } from "vitest";
import { crossedRankBoundary, parseCheckInResult, parseRankUpXp, rankUpCopy } from "./checkin";

describe("parseCheckInResult", () => {
  it("reads the check_in() jsonb shape", () => {
    expect(
      parseCheckInResult({
        duplicate: false,
        xp_awarded: 33,
        level: 30,
        rank: "B",
        streak: 7,
      }),
    ).toEqual({
      duplicate: false,
      xpAwarded: 33,
      level: 30,
      rank: "B",
      streak: 7,
    });
  });

  it("rejects incomplete payloads", () => {
    expect(parseCheckInResult(null)).toBeNull();
    expect(parseCheckInResult({ duplicate: false, xp_awarded: 33 })).toBeNull();
    expect(parseCheckInResult({ duplicate: false, xp_awarded: 33, level: 30, rank: "X", streak: 1 })).toBeNull();
  });
});

describe("crossedRankBoundary", () => {
  it("is true only when the rank letter changes", () => {
    expect(crossedRankBoundary("C", "B")).toBe(true);
    expect(crossedRankBoundary("C", "C")).toBe(false);
  });
});

describe("rankUpCopy", () => {
  it("matches the screens.html rank-up line", () => {
    expect(rankUpCopy("B", 33)).toBe("B rank unlocked. Quest done. +33 XP.");
  });
});

describe("parseRankUpXp", () => {
  it("accepts a whole number from the query string", () => {
    expect(parseRankUpXp("33")).toBe(33);
    expect(parseRankUpXp(["33"])).toBe(33);
    expect(parseRankUpXp("3.3")).toBeNull();
    expect(parseRankUpXp(undefined)).toBeNull();
  });
});
