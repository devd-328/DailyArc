import { describe, expect, it } from "vitest";
import { previousSeason, recentSeasons, seasonFromDate } from "./seasons";

describe("seasons", () => {
  it("maps months to seasons using the unverified convention in config.ts", () => {
    expect(seasonFromDate(new Date("2026-01-15T00:00:00Z"))).toEqual({ season: "WINTER", year: 2026 });
    expect(seasonFromDate(new Date("2026-04-01T00:00:00Z"))).toEqual({ season: "SPRING", year: 2026 });
    expect(seasonFromDate(new Date("2026-10-08T00:00:00Z"))).toEqual({ season: "FALL", year: 2026 });
  });

  it("walks backward across the year boundary", () => {
    expect(previousSeason({ season: "WINTER", year: 2026 })).toEqual({ season: "FALL", year: 2025 });
  });

  it("returns the current season plus the previous two", () => {
    const recent = recentSeasons(new Date("2026-10-08T00:00:00Z"), 3);
    expect(recent).toEqual([
      { season: "FALL", year: 2026 },
      { season: "SUMMER", year: 2026 },
      { season: "SPRING", year: 2026 },
    ]);
  });
});
