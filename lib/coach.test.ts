import { describe, expect, it } from "vitest";
import { coachLine, roastLine, roastTrigger, type RoastInput } from "./coach";
import { ROAST_COPY, ROAST_TRIGGERS } from "./roast-copy";

function sample(overrides: Partial<RoastInput> = {}): RoastInput {
  return {
    name: "mira_k",
    quests: [
      { name: "Walk for 20 minutes", done: false },
      { name: "Read 10 pages", done: false },
    ],
    streakDays: 0,
    bestStreak: 0,
    level: 1,
    xpToNext: 12,
    daysInactive: 0,
    timeLeft: "5 hours",
    minutesLeft: 300,
    day: "2026-10-08",
    ...overrides,
  };
}

describe("roastTrigger", () => {
  it("picks skipped_habit, streak risk, broken streak, and inactivity in priority order", () => {
    expect(roastTrigger(sample())).toBe("skipped_habit");
    expect(roastTrigger(sample({ streakDays: 7 }))).toBe("streak_at_risk");
    expect(roastTrigger(sample({ streakDays: 0, bestStreak: 12, daysInactive: 1 }))).toBe(
      "streak_broken",
    );
    expect(roastTrigger(sample({ daysInactive: 4 }))).toBe("inactive_3d");
    expect(roastTrigger(sample({ daysInactive: 9 }))).toBe("inactive_7d");
  });

  it("uses late night, a clear board, and an empty board", () => {
    expect(roastTrigger(sample({ minutesLeft: 90, timeLeft: "1 hour" }))).toBe("late_night");
    expect(
      roastTrigger(
        sample({
          quests: [
            { name: "Walk for 20 minutes", done: true },
            { name: "Read 10 pages", done: true },
          ],
        }),
      ),
    ).toBe("level_up_roast");
    expect(roastTrigger(sample({ quests: [] }))).toBe("motivational_mean");
    expect(roastTrigger(sample({ level: 4, bestStreak: 5, streakDays: 0 }))).toBe("low_level");
  });

  it("uses workout and study lines only when every open quest matches", () => {
    expect(
      roastTrigger(sample({ quests: [{ name: "Walk for 20 minutes", done: false }] })),
    ).toBe("skipped_workout");
    expect(
      roastTrigger(sample({ quests: [{ name: "Read 10 pages", done: false }] })),
    ).toBe("study_focus");
    expect(roastTrigger(sample())).toBe("skipped_habit");
  });
});

describe("roastLine", () => {
  it("fills owner copy and stays stable for the same day", () => {
    const a = roastLine(sample());
    const b = roastLine(sample());
    expect(a.line).toBe(b.line);
    expect(a.line.includes("{")).toBe(false);
    expect(a.trigger).toBe("skipped_habit");
    expect(a.line.includes("Walk for 20 minutes") || /\d+ habits skipped/.test(a.line) || a.line.length > 20).toBe(
      true,
    );
  });

  it("can force the wrapped-card pool", () => {
    const result = roastLine(sample({ bestStreak: 12, level: 7 }), "anime_wrapped_card");
    expect(result.trigger).toBe("anime_wrapped_card");
    expect(result.line.includes("{")).toBe(false);
  });

  it("keeps coachLine as the filled sentence", () => {
    expect(coachLine(sample())).toBe(roastLine(sample()).line);
  });
});

describe("ROAST_COPY", () => {
  it("keeps every shipped line free of em dashes and identity shots", () => {
    for (const trigger of ROAST_TRIGGERS) {
      expect(ROAST_COPY[trigger].length).toBeGreaterThanOrEqual(4);
      for (const line of ROAST_COPY[trigger]) {
        expect(line.includes("—")).toBe(false);
        expect(line.toLowerCase()).not.toMatch(/\bfat\b|\bugly\b|\bstupid\b|\bkill\b/);
      }
    }
  });

  it("calls the user by name in every live roast", () => {
    for (const trigger of ROAST_TRIGGERS) {
      for (const line of ROAST_COPY[trigger]) {
        expect(line).toContain("{name}");
      }
      const result = roastLine(sample(), trigger);
      expect(result.line).toContain("mira_k");
      expect(result.line.includes("{name}")).toBe(false);
    }
  });
});
