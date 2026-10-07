import { WATCHER_TYPES, watcher, type WatcherType } from "./config";
import type { ComputedStats } from "./types";

export const WATCHER_TYPE_LABELS: Record<WatcherType, string> = {
  genre_loyalist: "Genre Loyalist",
  classic_purist: "Classic Purist",
  seasonal_sampler: "Seasonal Sampler",
  binge_demon: "Binge Demon",
  wanderer: "Wanderer",
};

/**
 * One-line type copy on the card.
 * Binge Demon is from mockups/screens-auth.html. The others restate the
 * PRODUCT.md rules in plain language so the card has a sentence until
 * the owner writes final flavor copy.
 */
export const WATCHER_TYPE_LINES: Record<WatcherType, string> = {
  genre_loyalist: "One genre makes up more than 40 percent of your list.",
  classic_purist: "At least 60 percent of your list aired before 2010.",
  seasonal_sampler: "Most of your list is from recent seasons, and your drop rate is high.",
  binge_demon: "You finish whole seasons before the weekend is over.",
  wanderer: "No single watching pattern stood out.",
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
    if (type === "wanderer") continue;
    if (matches(type, stats)) hits.push(type);
  }
  return { type: hits[0] ?? "wanderer", runnerUp: hits[1] ?? null };
}
