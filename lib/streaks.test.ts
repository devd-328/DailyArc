import { describe, expect, it } from "vitest";
import { applyStreakBonus, localCheckinDate, periodStart } from "./streaks";

describe("applyStreakBonus", () => {
  it("awards no bonus below 7 days", () => {
    expect(applyStreakBonus(30, 0)).toBe(30);
    expect(applyStreakBonus(30, 6)).toBe(30);
  });

  it("awards +10 percent from 7 to 29 days, rounding the way the mockup does", () => {
    expect(applyStreakBonus(30, 7)).toBe(33);
    expect(applyStreakBonus(20, 12)).toBe(22);
    expect(applyStreakBonus(10, 12)).toBe(11);
    expect(applyStreakBonus(30, 29)).toBe(33);
  });

  it("awards +25 percent from 30 days", () => {
    expect(applyStreakBonus(20, 30)).toBe(25);
    expect(applyStreakBonus(30, 40)).toBe(38);
  });
});

describe("localCheckinDate", () => {
  it("uses the local calendar date after the grace hour", () => {
    // 04:00 in Karachi on 8 Oct 2026 (UTC+5) is 2026-10-07T23:00:00Z
    const now = new Date("2026-10-07T23:00:00Z");
    expect(localCheckinDate(now, "Asia/Karachi")).toBe("2026-10-08");
  });

  it("counts a check-in before 3:00 AM as the previous local day", () => {
    // 02:30 in Karachi on 8 Oct 2026 is 2026-10-07T21:30:00Z
    const now = new Date("2026-10-07T21:30:00Z");
    expect(localCheckinDate(now, "Asia/Karachi")).toBe("2026-10-07");
  });

  it("does not apply grace at exactly 3:00 AM", () => {
    const now = new Date("2026-10-07T22:00:00Z");
    expect(localCheckinDate(now, "Asia/Karachi")).toBe("2026-10-08");
  });
});

describe("periodStart", () => {
  it("returns the same date for daily quests", () => {
    expect(periodStart("2026-10-08", "daily")).toBe("2026-10-08");
  });

  it("returns the Monday of that week for weekly quests", () => {
    expect(periodStart("2026-10-07", "weekly")).toBe("2026-10-05"); // Wednesday
    expect(periodStart("2026-10-05", "weekly")).toBe("2026-10-05"); // Monday
    expect(periodStart("2026-10-11", "weekly")).toBe("2026-10-05"); // Sunday
  });
});
