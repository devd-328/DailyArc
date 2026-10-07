import { describe, expect, it } from "vitest";
import type { ListEntry } from "./types";
import { buildWrapped, utcDay, watcherLineFor } from "./wrapped";

function entry(overrides: Partial<ListEntry> = {}): ListEntry {
  return {
    status: "COMPLETED",
    score: 80,
    progress: 12,
    repeat: 0,
    startedAt: null,
    completedAt: { year: 2020, month: 1, day: 1 },
    updatedAt: null,
    media: {
      title: { romaji: "Sample Title A", english: null, native: null },
      format: "TV",
      episodes: 12,
      duration: 24,
      genres: ["Action"],
      season: "WINTER",
      seasonYear: 2020,
      startDate: { year: 2020, month: 1, day: 1 },
      averageScore: 70,
      studios: [{ name: "Sample Studio" }],
    },
    ...overrides,
  };
}

describe("utcDay", () => {
  it("returns the UTC calendar date", () => {
    expect(utcDay(new Date("2026-10-07T23:30:00.000Z"))).toBe("2026-10-07");
  });
});

describe("buildWrapped", () => {
  it("returns EMPTY_LIST when there are no entries", () => {
    expect(buildWrapped("dev_das", [])).toEqual({ ok: false, code: "EMPTY_LIST" });
  });

  it("builds a visitor card with no rank and Wanderer when there is not enough data", () => {
    const result = buildWrapped("dev_das", [entry()]);
    if (!result.ok) throw new Error("expected ok");
    expect(result.enoughData).toBe(false);
    expect(result.card.level).toBeNull();
    expect(result.card.watcherTypeLabel).toBe("Wanderer");
    expect(result.card.username).toBe("dev_das");
    expect(result.card.hours).toBeGreaterThan(0);
  });
});

describe("watcherLineFor", () => {
  it("uses the mockup line for Binge Demon", () => {
    expect(watcherLineFor("binge_demon", null)).toBe(
      "You finish whole seasons before the weekend is over.",
    );
  });

  it("adds the runner-up as a streak, matching PRODUCT.md", () => {
    expect(watcherLineFor("binge_demon", "genre_loyalist")).toBe(
      "You finish whole seasons before the weekend is over. With a Genre Loyalist streak.",
    );
  });
});
