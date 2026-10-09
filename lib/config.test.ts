import { describe, expect, it } from "vitest";
import { RANKS, STATS, STAT_LABELS, leveling, quests, streaks } from "./config";

describe("config", () => {
  it("has rank start levels that start at 1, increase, and end at the level cap", () => {
    const starts = RANKS.map((rank) => leveling.rankStartLevel[rank]);
    expect(starts[0]).toBe(1);
    expect(starts[starts.length - 1]).toBe(leveling.levelCap);
    for (let i = 1; i < starts.length; i++) {
      expect(starts[i]).toBeGreaterThan(starts[i - 1]);
    }
  });

  it("keeps the reminder window wider than the hourly cron", () => {
    expect(streaks.reminderWindowMinutes).toBeGreaterThan(60);
  });

  it("lists streak bonuses from the highest threshold to the lowest", () => {
    const days = streaks.bonuses.map((b) => b.minDays);
    expect([...days].sort((a, b) => b - a)).toEqual(days);
  });

  it("only allows the XP values from the product doc", () => {
    expect(quests.allowedXpValues).toEqual([10, 20, 30]);
  });

  it("labels every stat with the schema name from the design system", () => {
    expect(STATS.map((stat) => STAT_LABELS[stat])).toEqual([
      "Strength",
      "Intelligence",
      "Discipline",
      "Charisma",
      "Vitality",
    ]);
  });
});
