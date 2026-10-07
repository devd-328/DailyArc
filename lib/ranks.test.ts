import { describe, expect, it } from "vitest";
import { rankForLevel } from "./ranks";

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
