import { WATCHER_TYPES, watcher, type WatcherType } from "./config";
import type { ComputedStats } from "./types";

export const WATCHER_TYPE_LABELS: Record<WatcherType, string> = {
  genre_loyalist: "Genre Loyalist",
  classic_purist: "Classic Purist",
  seasonal_sampler: "Seasonal Sampler",
  binge_demon: "Binge Demon",
  wanderer: "Wanderer",
};

export type WatcherPick = {
  type: WatcherType;
  runnerUp: WatcherType | null;
};

function matches(type: WatcherType, stats: ComputedStats): boolean {
  switch (type) {
    case "genre_loyalist":
      return stats.topGenres.some((g) => g.share > watcher.genreLoyalistMinShare);
    case "classic_purist":
      return stats.pre2010Share >= watcher.classicPuristMinShare;
    case "seasonal_sampler":
      return (
        stats.recentSeasonShare >= watcher.seasonalSamplerMinShare &&
        stats.dropRate > watcher.seasonalSamplerMinDropRate
      );
    case "binge_demon":
      return stats.episodesPerMonth >= watcher.bingeDemonMinEpisodesPerMonth;
    case "wanderer":
      return true;
  }
}

/**
 * First matching type wins, in the order in PRODUCT.md (rarer types first).
 * Runner-up is the next type that also matches, or null.
 * Fewer than 10 completed titles always returns Wanderer with no runner-up.
 */
export function pickWatcherType(stats: ComputedStats): WatcherPick {
  if (!stats.enoughData) return { type: "wanderer", runnerUp: null };

  const hits: WatcherType[] = [];
  for (const type of WATCHER_TYPES) {
    if (matches(type, stats)) hits.push(type);
  }
  return { type: hits[0] ?? "wanderer", runnerUp: hits[1] ?? null };
}
