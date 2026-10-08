import { describe, expect, it } from "vitest";
import { coachLine, coachTone } from "./coach";

describe("coachLine", () => {
  it("roasts an empty board and a board with nothing done", () => {
    expect(coachTone({ questCount: 0, doneCount: 0, streakDays: 0 })).toBe("empty");
    expect(coachLine({ questCount: 0, doneCount: 0, streakDays: 0 })).toContain("Tap Add");
    expect(coachTone({ questCount: 3, doneCount: 0, streakDays: 0 })).toBe("roast");
    expect(coachLine({ questCount: 3, doneCount: 0, streakDays: 0 })).toContain("Zero check-ins");
  });

  it("nudges leftover quests and celebrates a clear board", () => {
    expect(coachTone({ questCount: 3, doneCount: 2, streakDays: 1 })).toBe("nudge");
    expect(coachLine({ questCount: 3, doneCount: 2, streakDays: 1 })).toContain("One left");
    expect(coachTone({ questCount: 3, doneCount: 3, streakDays: 1 })).toBe("win");
    expect(coachLine({ questCount: 3, doneCount: 3, streakDays: 1 })).toContain("Board cleared");
  });
});
