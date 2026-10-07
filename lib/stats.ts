import { wrapped, watcher } from "./config";
import { recentSeasons, seasonKey, type SeasonRef } from "./seasons";
import type { ComputedStats, FuzzyDate, HotTake, ListEntry, ListStatus } from "./types";

const COUNTED: ReadonlySet<ListStatus> = new Set(["CURRENT", "COMPLETED", "DROPPED", "PAUSED", "REPEATING"]);

export function mediaTitle(entry: ListEntry): string {
  return entry.media.title.romaji || entry.media.title.english || entry.media.title.native || "Untitled";
}

function isCounted(entry: ListEntry): boolean {
  return COUNTED.has(entry.status);
}

function episodesWatched(entry: ListEntry): number {
  const progress = Math.max(0, entry.progress);
  const repeat = Math.max(0, entry.repeat);
  const fullRun = entry.media.episodes ?? progress;
  return progress + repeat * fullRun;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function fuzzyToDate(fuzzy: FuzzyDate | null): Date | null {
  if (!fuzzy || fuzzy.year == null) return null;
  const month = (fuzzy.month ?? 1) - 1;
  const day = fuzzy.day ?? 1;
  const date = new Date(Date.UTC(fuzzy.year, month, day));
  return Number.isNaN(date.getTime()) ? null : date;
}

function watchDate(entry: ListEntry): Date | null {
  return (
    fuzzyToDate(entry.completedAt) ??
    fuzzyToDate(entry.startedAt) ??
    (entry.updatedAt != null ? new Date(entry.updatedAt * 1000) : null)
  );
}

function monthsAgo(from: Date, months: number): Date {
  const d = new Date(from.getTime());
  d.setUTCMonth(d.getUTCMonth() - months);
  return d;
}

function inRecentSeasons(entry: ListEntry, recent: SeasonRef[]): boolean {
  const { season, seasonYear } = entry.media;
  if (!season || seasonYear == null) return false;
  const key = seasonKey({ season, year: seasonYear });
  return recent.some((ref) => seasonKey(ref) === key);
}

export function computeStats(list: ListEntry[], now: Date = new Date()): ComputedStats {
  const counted = list.filter(isCounted);
  const completed = list.filter((e) => e.status === "COMPLETED").length;
  const dropped = list.filter((e) => e.status === "DROPPED").length;
  const finished = completed + dropped;
  const completionRate = finished === 0 ? null : completed / finished;
  const dropRate = finished === 0 ? 0 : dropped / finished;

  const knownDurations = counted
    .map((e) => e.media.duration)
    .filter((d): d is number => d != null && d > 0);
  const fallbackDuration = median(knownDurations) ?? wrapped.fallbackEpisodeMinutes;

  let totalMinutes = 0;
  let totalEpisodes = 0;
  for (const entry of counted) {
    const watched = episodesWatched(entry);
    totalEpisodes += watched;
    const duration = entry.media.duration != null && entry.media.duration > 0 ? entry.media.duration : fallbackDuration;
    totalMinutes += watched * duration;
  }

  const genreCounts = new Map<string, number>();
  const studioCounts = new Map<string, number>();
  let pre2010 = 0;
  const recent = recentSeasons(now, watcher.seasonalSamplerRecentSeasons);
  let recentCount = 0;

  for (const entry of counted) {
    for (const genre of entry.media.genres) {
      genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
    }
    for (const studio of entry.media.studios) {
      studioCounts.set(studio.name, (studioCounts.get(studio.name) ?? 0) + 1);
    }
    const year = entry.media.startDate?.year;
    if (year != null && year < watcher.classicPuristBeforeYear) pre2010 += 1;
    if (inRecentSeasons(entry, recent)) recentCount += 1;
  }

  const countedTitles = counted.length;
  const denom = countedTitles || 1;
  const topGenres = [...genreCounts.entries()]
    .map(([name, count]) => ({ name, count, share: count / denom }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 3);

  const topStudioEntry = [...studioCounts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  )[0];

  const scored: { entry: ListEntry; userScore: number; communityScore: number }[] = [];
  for (const entry of counted) {
    const userScore = entry.score ?? 0;
    const communityScore = entry.media.averageScore;
    if (userScore > 0 && communityScore != null && communityScore > 0) {
      scored.push({ entry, userScore, communityScore });
    }
  }

  let hotTake: HotTake | null = null;
  if (scored.length >= wrapped.hotTakeMinScoredTitles) {
    let best = scored[0];
    let bestGap = 0;
    for (const row of scored) {
      const gap = Math.abs(row.userScore - row.communityScore);
      if (gap > bestGap) {
        best = row;
        bestGap = gap;
      }
    }
    hotTake = {
      title: mediaTitle(best.entry),
      userScore: best.userScore,
      communityScore: best.communityScore,
    };
  }

  const windowStart = monthsAgo(now, watcher.bingeWindowMonths);
  let bingeEpisodes = 0;
  for (const entry of counted) {
    const date = watchDate(entry);
    if (date && date >= windowStart && date <= now) bingeEpisodes += episodesWatched(entry);
  }

  return {
    hours: Math.round(totalMinutes / 60),
    episodes: totalEpisodes,
    topGenres,
    topStudio: topStudioEntry ? { name: topStudioEntry[0], count: topStudioEntry[1] } : null,
    completionRate,
    completed,
    dropped,
    dropRate,
    hotTake,
    countedTitles,
    pre2010Share: countedTitles === 0 ? 0 : pre2010 / countedTitles,
    recentSeasonShare: countedTitles === 0 ? 0 : recentCount / countedTitles,
    episodesPerMonth: bingeEpisodes / watcher.bingeWindowMonths,
    enoughData: completed >= wrapped.minCompletedTitles,
  };
}
