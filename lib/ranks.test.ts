import { describe, expect, it } from "vitest";
import { isRank, nextRankAt, rankForLevel } from "./ranks";

describe("rankForLevel", () => {
  it("uses the PRODUCT.md bands", () => {
    expect(rankForLevel(1)).toBe("E");
    expect(rankForLevel(9)).toBe("E");
    expect(rankForLevel(10)).toBe("D");
    expect(rankForLevel(19)).toBe("D");
    expect(rankForLevel(20)).toBe("C");
    expect(rankForLevel(27)).toBe("C");
    expect(rankForLevel(29)).toBe("C");
    expect(rankForLevel(30)).toBe("B");
    expect(rankForLevel(39)).toBe("B");
    expect(rankForLevel(40)).toBe("A");
    expect(rankForLevel(49)).toBe("A");
    expect(rankForLevel(50)).toBe("S");
  });

  it("rejects invalid levels", () => {
    expect(() => rankForLevel(0)).toThrow(RangeError);
  });
});

describe("isRank", () => {
  it("accepts the six rank letters", () => {
    expect(isRank("B")).toBe(true);
    expect(isRank("X")).toBe(false);
    expect(isRank(30)).toBe(false);
  });
});

describe("nextRankAt", () => {
  it("points at the start of the next band", () => {
    expect(nextRankAt(1)).toEqual({ rank: "D", level: 10 });
    expect(nextRankAt(27)).toEqual({ rank: "B", level: 30 });
    expect(nextRankAt(50)).toBeNull();
  });
});
