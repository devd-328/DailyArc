import { describe, expect, it } from "vitest";
import { computeStats, mediaTitle } from "./stats";
import type { ListEntry, ListStatus } from "./types";

const NOW = new Date("2026-10-08T12:00:00Z");

function entry(overrides: {
  status?: ListStatus;
  score?: number | null;
  progress?: number;
  repeat?: number;
  duration?: number | null;
  episodes?: number | null;
  genres?: string[];
  studio?: string | null;
  year?: number | null;
  season?: ListEntry["media"]["season"];
  seasonYear?: number | null;
  averageScore?: number | null;
  title?: string;
  completedAt?: { year: number; month: number; day: number } | null;
}): ListEntry {
  return {
    status: overrides.status ?? "COMPLETED",
    score: overrides.score ?? 80,
    progress: overrides.progress ?? 12,
    repeat: overrides.repeat ?? 0,
    startedAt: null,
    completedAt: overrides.completedAt ?? { year: 2026, month: 4, day: 1 },
    updatedAt: null,
    media: {
      title: { romaji: overrides.title ?? "Sample Title A", english: null, native: null },
      format: "TV",
      episodes: overrides.episodes ?? 12,
      duration: overrides.duration === undefined ? 24 : overrides.duration,
      genres: overrides.genres ?? ["Action"],
      season: overrides.season ?? "SPRING",
      seasonYear: overrides.seasonYear ?? 2024,
      startDate: { year: overrides.year ?? 2024, month: 4, day: 1 },
      averageScore: overrides.averageScore === undefined ? 70 : overrides.averageScore,
      studios: overrides.studio ? [{ name: overrides.studio }] : [],
    },
  };
}

function many(count: number, extra?: Parameters<typeof entry>[0]): ListEntry[] {
  return Array.from({ length: count }, (_, i) => entry({ title: `Title ${i}`, ...extra }));
}

describe("computeStats", () => {
  it("returns zeros and not-enough-data for an empty list", () => {
    const stats = computeStats([], NOW);
    expect(stats.hours).toBe(0);
    expect(stats.episodes).toBe(0);
    expect(stats.hotTake).toBeNull();
    expect(stats.enoughData).toBe(false);
    expect(stats.completionRate).toBeNull();
  });

  it("counts hours from progress x duration, and falls back to the median then 24 minutes", () => {
    const withDuration = entry({ progress: 10, duration: 30, title: "A" });
    const missing = entry({ progress: 10, duration: null, title: "B" });
    const stats = computeStats([withDuration, missing], NOW);
    // 10*30 + 10*30 (median of [30]) = 600 minutes = 10 hours
    expect(stats.hours).toBe(10);
    expect(stats.episodes).toBe(20);
  });

  it("uses 24 minutes when no title has a duration", () => {
    const stats = computeStats([entry({ progress: 10, duration: null })], NOW);
    expect(stats.hours).toBe(4);
  });

  it("adds rewatches using media.episodes", () => {
    const stats = computeStats([entry({ progress: 12, repeat: 1, episodes: 12, duration: 24 })], NOW);
    expect(stats.episodes).toBe(24);
  });

  it("excludes planning titles from hours, genres and studios", () => {
    const stats = computeStats(
      [
        entry({ status: "COMPLETED", genres: ["Action"], studio: "Bones" }),
        entry({ status: "PLANNING", genres: ["Romance"], studio: "Kyoto Animation", progress: 0 }),
      ],
      NOW,
    );
    expect(stats.topGenres.map((g) => g.name)).toEqual(["Action"]);
    expect(stats.topStudio).toEqual({ name: "Bones", count: 1 });
    expect(stats.countedTitles).toBe(1);
  });

  it("computes completion rate from completed vs dropped only", () => {
    const stats = computeStats(
      [
        ...many(8, { status: "COMPLETED" }),
        ...many(2, { status: "DROPPED" }),
        entry({ status: "CURRENT" }),
        entry({ status: "PAUSED" }),
      ],
      NOW,
    );
    expect(stats.completed).toBe(8);
    expect(stats.dropped).toBe(2);
    expect(stats.completionRate).toBe(0.8);
    expect(stats.dropRate).toBe(0.2);
    expect(stats.enoughData).toBe(false);
  });

  it("hides the hot take below 5 scored titles", () => {
    const stats = computeStats(many(4, { score: 90, averageScore: 50 }), NOW);
    expect(stats.hotTake).toBeNull();
  });

  it("picks the scored title farthest from the community average", () => {
    const list = [
      ...many(4, { score: 80, averageScore: 78, title: "Close" }),
      entry({ score: 90, averageScore: 62, title: "Sample Title A" }),
    ];
    const stats = computeStats(list, NOW);
    expect(stats.hotTake).toEqual({
      title: "Sample Title A",
      userScore: 90,
      communityScore: 62,
    });
  });

  it("treats score 0 as unscored", () => {
    const list = [...many(5, { score: 80, averageScore: 70 }), entry({ score: 0, averageScore: 10, title: "Unscored" })];
    expect(computeStats(list, NOW).hotTake?.title).not.toBe("Unscored");
  });

  it("sets enoughData once there are 10 completed titles", () => {
    expect(computeStats(many(10), NOW).enoughData).toBe(true);
  });

  it("uses romaji, then english, then native for titles", () => {
    expect(
      mediaTitle({
        ...entry({}),
        media: {
          ...entry({}).media,
          title: { romaji: null, english: "English Name", native: "日本語" },
        },
      }),
    ).toBe("English Name");
  });
});
