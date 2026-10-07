import { computeStats } from "./stats";
import type { HotTake, ListEntry } from "./types";
import { pickWatcherType, WATCHER_TYPE_LABELS, WATCHER_TYPE_LINES } from "./watcherType";

export type WrappedCardData = {
  username: string;
  watcherTypeLabel: string;
  watcherLine: string;
  hours: number;
  episodes: number;
  completionRate: number | null;
  topGenres: readonly string[];
  hotTake: HotTake | null;
  /** Null for a visitor with no linked profile: no rank badge. */
  level: number | null;
};

export type WrappedErrorCode =
  | "INVALID_USERNAME"
  | "USER_NOT_FOUND"
  | "PRIVATE_LIST"
  | "EMPTY_LIST"
  | "UPSTREAM_BUSY";

export type WrappedOk = {
  ok: true;
  username: string;
  card: WrappedCardData;
  enoughData: boolean;
};

export type WrappedErr = {
  ok: false;
  code: WrappedErrorCode;
};

export type WrappedResult = WrappedOk | WrappedErr;

export function utcDay(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function watcherLineFor(
  type: keyof typeof WATCHER_TYPE_LABELS,
  runnerUp: keyof typeof WATCHER_TYPE_LABELS | null,
): string {
  const line = WATCHER_TYPE_LINES[type];
  if (!runnerUp || runnerUp === type || runnerUp === "wanderer") return line;
  return `${line} With a ${WATCHER_TYPE_LABELS[runnerUp]} streak.`;
}

export function buildWrapped(username: string, list: ListEntry[], now: Date = new Date()): WrappedResult {
  if (list.length === 0) return { ok: false, code: "EMPTY_LIST" };

  const stats = computeStats(list, now);
  const pick = pickWatcherType(stats);
  const watcherTypeLabel = WATCHER_TYPE_LABELS[pick.type];

  return {
    ok: true,
    username,
    enoughData: stats.enoughData,
    card: {
      username,
      watcherTypeLabel,
      watcherLine: watcherLineFor(pick.type, pick.runnerUp),
      hours: stats.hours,
      episodes: stats.episodes,
      completionRate: stats.completionRate,
      topGenres: stats.topGenres.map((genre) => genre.name),
      hotTake: stats.hotTake,
      level: null,
    },
  };
}

export const WRAPPED_ERROR_COPY: Record<WrappedErrorCode, string> = {
  INVALID_USERNAME: "Usernames are letters, digits and underscore, 2 to 20 characters.",
  USER_NOT_FOUND: "We couldn't find that AniList user.",
  PRIVATE_LIST: "This list is private or empty.",
  EMPTY_LIST: "This list is private or empty.",
  UPSTREAM_BUSY: "AniList is busy. Try again in a bit.",
};
