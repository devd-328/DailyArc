import { describe, expect, it } from "vitest";
import { addIsoDays, changePercent, xpRanges } from "./xp-series";

describe("xpRanges", () => {
  it("buckets the last 7 days and compares them with the 7 before", () => {
    const ranges = xpRanges(
      [
        { createdAt: "2026-10-19T12:00:00.000Z", xp: 20 },
        { createdAt: "2026-10-12T12:00:00.000Z", xp: 10 },
      ],
      "2026-10-19",
      "UTC",
    );
    expect(ranges.week.points.map((point) => point.label)).toEqual(["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"]);
    expect(ranges.week.points[6]).toEqual({ label: "Mon", xp: 20 });
    expect(ranges.week.total).toBe(20);
    expect(ranges.week.previous).toBe(10);
    expect(changePercent(ranges.week.total, ranges.week.previous)).toBe(100);
  });

  it("splits the current month into week labels and keeps a future week at zero", () => {
    const ranges = xpRanges([{ createdAt: "2026-10-02T12:00:00.000Z", xp: 30 }], "2026-10-19", "UTC");
    expect(ranges.month.points.map((point) => point.label)).toEqual(["Oct 1", "Oct 8", "Oct 15", "Oct 22", "Oct 29"]);
    expect(ranges.month.points[0]?.xp).toBe(30);
    expect(ranges.month.points[3]?.xp).toBe(0);
    expect(ranges.month.total).toBe(30);
  });

  it("returns null when the earlier period has no XP", () => {
    expect(changePercent(20, 0)).toBeNull();
    expect(changePercent(20, 20)).toBe(0);
  });

  it("steps across month boundaries", () => {
    expect(addIsoDays("2026-10-01", -1)).toBe("2026-09-30");
  });
});
