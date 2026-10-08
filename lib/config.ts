/**
 * Every tunable number lives here. Values come from brain/PRODUCT.md and
 * brain/ARCHITECTURE.md. Change them here, not inside components or logic.
 *
 * Bump CONFIG_VERSION whenever a value that affects Wrapped results changes
 * (watcher thresholds, stat rules). It is part of every cache key.
 */
export const CONFIG_VERSION = 2;

export const RANKS = ["E", "D", "C", "B", "A", "S"] as const;
export type Rank = (typeof RANKS)[number];

export const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"] as const;
export type Season = (typeof SEASONS)[number];

/**
 * Calendar month (1 to 12) in which each season starts. NOT VERIFIED against AniList.
 * This is the common anime convention: Winter Jan to Mar, Spring Apr to Jun,
 * Summer Jul to Sep, Fall Oct to Dec. AniList's own schema docs may define the
 * months differently. Check the AniList docs before launch and fix it here.
 */
export const seasonStartMonth: Record<Season, number> = { WINTER: 1, SPRING: 4, SUMMER: 7, FALL: 10 };

export const STATS = ["strength", "intelligence", "discipline", "charisma", "vitality"] as const;
export type Stat = (typeof STATS)[number];

export const STAT_LABELS: Record<Stat, string> = {
  strength: "Strength",
  intelligence: "Intelligence",
  discipline: "Discipline",
  charisma: "Charisma",
  vitality: "Vitality",
};

export const WATCHER_TYPES = [
  "genre_loyalist",
  "classic_purist",
  "seasonal_sampler",
  "binge_demon",
  "wanderer",
] as const;
export type WatcherType = (typeof WATCHER_TYPES)[number];

export const leveling = {
  /** XP to go from level N to N+1: round(xpCurveConstant * N ^ xpCurveExponent) */
  xpCurveConstant: 12,
  xpCurveExponent: 1.5,
  levelCap: 50,
  /** Lowest level of each rank. S is the cap. */
  rankStartLevel: { E: 1, D: 10, C: 20, B: 30, A: 40, S: 50 } satisfies Record<Rank, number>,
} as const;

export const streaks = {
  /** Bonus applies to daily quests only. */
  bonuses: [
    { minDays: 30, multiplier: 1.25 },
    { minDays: 7, multiplier: 1.1 },
  ],
  /** A check-in before this local hour counts for the previous day. */
  graceHour: 3,
} as const;

export const quests = {
  maxActive: 8,
  allowedXpValues: [10, 20, 30],
  /** Base XP per local day, before the streak bonus. Includes the side quest (v1.1). */
  dailyBaseXpCap: 150,
  starterQuestsShown: { min: 5, max: 8 },
  sideQuestRerollsPerDay: 1,
} as const;

/** Choosable preset faces, plus one optional gallery photo per user. */
export const avatars = {
  count: 12,
  /** Reject a gallery file above this before cropping. */
  maxUploadBytes: 5_000_000,
  size: 256,
  jpegQuality: 0.8,
} as const;

/** Verify-and-discard proof photos. The image is not stored. */
export const proof = {
  /** Longest edge of the JPEG sent to the API, in pixels. */
  maxWidth: 800,
  jpegQuality: 0.6,
  /** Reject uploads above this. A compressed photo should be far smaller. */
  maxBytes: 1_000_000,
  /** Proof attempts stored per user per UTC day. Blurry retakes are not stored. */
  dailyCap: 10,
} as const;

export const watcher = {
  /** Share of the list in one genre (0 to 1). */
  genreLoyalistMinShare: 0.4,
  /** Share of the list that aired before 2010 (0 to 1). */
  classicPuristMinShare: 0.6,
  classicPuristBeforeYear: 2010,
  /** Share of the list in the current or last 2 seasons (0 to 1). */
  seasonalSamplerMinShare: 0.5,
  /** Drop rate above this (0 to 1) is also required for Seasonal Sampler. */
  seasonalSamplerMinDropRate: 0.3,
  /** "Recent" means the current season plus the previous 2, so 3 seasons in total. */
  seasonalSamplerRecentSeasons: 3,
  /** Average episodes per month over the last 12 months. */
  bingeDemonMinEpisodesPerMonth: 150,
  bingeWindowMonths: 12,
} as const;

export const wrapped = {
  /** Hot take is hidden below this many scored titles. */
  hotTakeMinScoredTitles: 5,
  /** Below this many completed titles, show a "not enough data" notice. */
  minCompletedTitles: 10,
  /** Duration used for titles with no duration and no other data, in minutes. */
  fallbackEpisodeMinutes: 24,
} as const;

/** Cache and cooldown values. These are suggestions from ARCHITECTURE.md, tune later. */
export const cache = {
  wrappedTtlSeconds: 24 * 60 * 60,
  refreshCooldownSeconds: 10 * 60,
  cardWithProfileTtlSeconds: 5 * 60,
  cardWithoutProfileTtlSeconds: 24 * 60 * 60,
} as const;
