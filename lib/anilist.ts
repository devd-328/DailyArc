import { SEASONS, type Season } from "./config";
import type { FuzzyDate, ListEntry, ListStatus } from "./types";

export const ANILIST_GRAPHQL_URL = "https://graphql.anilist.co";

export const ANILIST_LIST_QUERY = `query ($userName: String!, $chunk: Int!, $perChunk: Int!) {
  MediaListCollection(userName: $userName, type: ANIME, chunk: $chunk, perChunk: $perChunk) {
    hasNextChunk
    lists {
      entries {
        status
        score(format: POINT_100)
        progress
        repeat
        startedAt { year month day }
        completedAt { year month day }
        updatedAt
        media {
          id
          title { romaji english native }
          format
          episodes
          duration
          genres
          season
          seasonYear
          startDate { year month day }
          averageScore
          studios(isMain: true) { nodes { name } }
        }
      }
    }
  }
}`;

export const ANILIST_PER_CHUNK = 500;
export const ANILIST_MAX_CHUNKS = 22;
export const ANILIST_RETRIES = 2;

export type AniListErrorCode = "USER_NOT_FOUND" | "PRIVATE_LIST" | "UPSTREAM_BUSY";

const LIST_STATUSES = new Set<ListStatus>([
  "CURRENT",
  "PLANNING",
  "COMPLETED",
  "DROPPED",
  "PAUSED",
  "REPEATING",
]);

const SEASON_SET = new Set<string>(SEASONS);

type GraphQLError = { message?: string };

export type AniListCollectionPayload = {
  MediaListCollection?: {
    hasNextChunk?: boolean | null;
    lists?: Array<{
      entries?: Array<AniListEntryRaw | null> | null;
    } | null> | null;
  } | null;
};

type AniListEntryRaw = {
  status?: string | null;
  score?: number | null;
  progress?: number | null;
  repeat?: number | null;
  startedAt?: FuzzyDate | null;
  completedAt?: FuzzyDate | null;
  updatedAt?: number | null;
  media?: {
    id?: number | null;
    title?: {
      romaji?: string | null;
      english?: string | null;
      native?: string | null;
    } | null;
    format?: string | null;
    episodes?: number | null;
    duration?: number | null;
    genres?: Array<string | null> | null;
    season?: string | null;
    seasonYear?: number | null;
    startDate?: FuzzyDate | null;
    averageScore?: number | null;
    studios?: { nodes?: Array<{ name?: string | null } | null> | null } | null;
  } | null;
};

export function classifyAniListError(
  httpStatus: number,
  errors: GraphQLError[] | undefined,
): AniListErrorCode | null {
  if (httpStatus === 429) return "UPSTREAM_BUSY";
  if (httpStatus >= 500) return "UPSTREAM_BUSY";

  const messages = (errors ?? []).map((error) => error.message ?? "");
  if (messages.some((message) => /user not found/i.test(message))) return "USER_NOT_FOUND";
  if (messages.some((message) => /private user/i.test(message))) return "PRIVATE_LIST";
  if (httpStatus === 404) return "USER_NOT_FOUND";
  if (httpStatus === 403) return "PRIVATE_LIST";
  return null;
}

function fuzzyDate(value: FuzzyDate | null | undefined): FuzzyDate | null {
  if (!value || value.year == null) return null;
  return {
    year: value.year,
    month: value.month ?? null,
    day: value.day ?? null,
  };
}

function asSeason(value: string | null | undefined): Season | null {
  if (!value || !SEASON_SET.has(value)) return null;
  return value as Season;
}

function mapEntry(raw: AniListEntryRaw): { mediaId: number | null; entry: ListEntry } | null {
  const status = raw.status;
  if (!status || !LIST_STATUSES.has(status as ListStatus)) return null;
  const media = raw.media;
  if (!media) return null;

  const score = raw.score == null || raw.score <= 0 ? null : raw.score;
  const studios = (media.studios?.nodes ?? [])
    .map((node) => node?.name)
    .filter((name): name is string => Boolean(name))
    .map((name) => ({ name }));

  return {
    mediaId: media.id ?? null,
    entry: {
      status: status as ListStatus,
      score,
      progress: Math.max(0, raw.progress ?? 0),
      repeat: Math.max(0, raw.repeat ?? 0),
      startedAt: fuzzyDate(raw.startedAt),
      completedAt: fuzzyDate(raw.completedAt),
      updatedAt: raw.updatedAt ?? null,
      media: {
        title: {
          romaji: media.title?.romaji ?? null,
          english: media.title?.english ?? null,
          native: media.title?.native ?? null,
        },
        format: media.format ?? null,
        episodes: media.episodes ?? null,
        duration: media.duration ?? null,
        genres: (media.genres ?? []).filter((genre): genre is string => Boolean(genre)),
        season: asSeason(media.season),
        seasonYear: media.seasonYear ?? null,
        startDate: fuzzyDate(media.startDate),
        averageScore: media.averageScore ?? null,
        studios,
      },
    },
  };
}

const STATUS_RANK: Record<ListStatus, number> = {
  COMPLETED: 5,
  CURRENT: 4,
  REPEATING: 4,
  DROPPED: 3,
  PAUSED: 2,
  PLANNING: 1,
};

/**
 * Flatten AniList status and custom lists, then keep one row per media id.
 * Custom lists can hide or duplicate entries; AniList docs say not to skip them.
 */
export function mapAniListCollection(payload: AniListCollectionPayload): ListEntry[] {
  const byId = new Map<number, ListEntry>();
  const unkeyed: ListEntry[] = [];

  for (const list of payload.MediaListCollection?.lists ?? []) {
    for (const raw of list?.entries ?? []) {
      if (!raw) continue;
      const mapped = mapEntry(raw);
      if (!mapped) continue;
      if (mapped.mediaId == null) {
        unkeyed.push(mapped.entry);
        continue;
      }
      const existing = byId.get(mapped.mediaId);
      if (!existing || STATUS_RANK[mapped.entry.status] > STATUS_RANK[existing.status]) {
        byId.set(mapped.mediaId, mapped.entry);
      }
    }
  }

  return [...byId.values(), ...unkeyed];
}

function retryWaitMs(retryAfterHeader: string | null, attempt: number): number {
  const parsed = Number(retryAfterHeader);
  if (Number.isFinite(parsed) && parsed >= 0) return Math.min(parsed, 5) * 1000;
  return 1000 * (attempt + 1);
}

async function postAniList(
  userName: string,
  chunk: number,
  attempt = 0,
): Promise<{ httpStatus: number; json: { data?: AniListCollectionPayload | null; errors?: GraphQLError[] } }> {
  const response = await fetch(ANILIST_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      query: ANILIST_LIST_QUERY,
      variables: { userName, chunk, perChunk: ANILIST_PER_CHUNK },
    }),
  });

  if (response.status === 429 && attempt < ANILIST_RETRIES) {
    await new Promise((resolve) => setTimeout(resolve, retryWaitMs(response.headers.get("Retry-After"), attempt)));
    return postAniList(userName, chunk, attempt + 1);
  }

  let json: { data?: AniListCollectionPayload | null; errors?: GraphQLError[] } = {};
  try {
    json = (await response.json()) as typeof json;
  } catch {
    json = {};
  }
  return { httpStatus: response.status, json };
}

export type FetchAniListResult =
  | { ok: true; entries: ListEntry[] }
  | { ok: false; code: AniListErrorCode };

export async function fetchAniListAnimeList(userName: string): Promise<FetchAniListResult> {
  const merged: AniListCollectionPayload = { MediaListCollection: { hasNextChunk: false, lists: [] } };

  for (let chunk = 1; chunk <= ANILIST_MAX_CHUNKS; chunk++) {
    const { httpStatus, json } = await postAniList(userName, chunk);
    const classified = classifyAniListError(httpStatus, json.errors);
    if (classified) return { ok: false, code: classified };
    if (httpStatus !== 200) return { ok: false, code: "UPSTREAM_BUSY" };
    if (json.errors?.length) return { ok: false, code: "UPSTREAM_BUSY" };

    const collection = json.data?.MediaListCollection;
    if (!collection) return { ok: false, code: "USER_NOT_FOUND" };

    merged.MediaListCollection?.lists?.push(...(collection.lists ?? []));
    if (!collection.hasNextChunk) break;
  }

  return { ok: true, entries: mapAniListCollection(merged) };
}
