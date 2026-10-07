import { describe, expect, it } from "vitest";
import type { ComputedStats } from "./types";
import { WATCHER_TYPES } from "./config";
import { pickWatcherType, WATCHER_TYPE_LABELS, WATCHER_TYPE_LINES } from "./watcherType";

function stats(overrides: Partial<ComputedStats> = {}): ComputedStats {
  return {
    hours: 100,
    episodes: 200,
    topGenres: [{ name: "Action", count: 4, share: 0.2 }],
    topStudio: { name: "Bones", count: 3 },
    completionRate: 0.8,
    completed: 12,
    dropped: 3,
    dropRate: 0.2,
    hotTake: null,
    countedTitles: 20,
    pre2010Share: 0.1,
    recentSeasonShare: 0.1,
    episodesPerMonth: 20,
    enoughData: true,
    ...overrides,
  };
}

describe("pickWatcherType", () => {
  it("defaults to Wanderer when nothing else matches", () => {
    expect(pickWatcherType(stats())).toEqual({ type: "wanderer", runnerUp: null });
  });

  it("forces Wanderer when there is not enough data, even if other rules match", () => {
    expect(
      pickWatcherType(
        stats({
          enoughData: false,
          completed: 3,
          topGenres: [{ name: "Action", count: 8, share: 0.8 }],
        }),
      ),
    ).toEqual({ type: "wanderer", runnerUp: null });
  });

  it("does not use Wanderer as a runner-up", () => {
    expect(
      pickWatcherType(stats({ topGenres: [{ name: "Action", count: 9, share: 0.45 }] })),
    ).toEqual({ type: "genre_loyalist", runnerUp: null });
  });

  it("picks Genre Loyalist first, even if the user also binges", () => {
    expect(
      pickWatcherType(
        stats({
          topGenres: [{ name: "Action", count: 9, share: 0.45 }],
          episodesPerMonth: 200,
        }),
      ),
    ).toEqual({ type: "genre_loyalist", runnerUp: "binge_demon" });
  });

  it("does not pick Genre Loyalist at exactly 40 percent (must be above)", () => {
    expect(
      pickWatcherType(stats({ topGenres: [{ name: "Action", count: 8, share: 0.4 }] })),
    ).toEqual({ type: "wanderer", runnerUp: null });
  });

  it("picks Classic Purist at 60 percent pre-2010", () => {
    expect(pickWatcherType(stats({ pre2010Share: 0.6 })).type).toBe("classic_purist");
  });

  it("picks Seasonal Sampler only when recent share and drop rate both pass", () => {
    expect(
      pickWatcherType(stats({ recentSeasonShare: 0.5, dropRate: 0.3 })).type,
    ).toBe("wanderer");
    expect(
      pickWatcherType(stats({ recentSeasonShare: 0.5, dropRate: 0.31 })).type,
    ).toBe("seasonal_sampler");
  });

  it("picks Binge Demon at 150 episodes per month", () => {
    expect(pickWatcherType(stats({ episodesPerMonth: 150 })).type).toBe("binge_demon");
  });
});

describe("watcher type copy", () => {
  it("has a label and line for every type", () => {
    for (const type of WATCHER_TYPES) {
      expect(WATCHER_TYPE_LABELS[type].length).toBeGreaterThan(0);
      expect(WATCHER_TYPE_LINES[type].length).toBeGreaterThan(0);
    }
  });
});
