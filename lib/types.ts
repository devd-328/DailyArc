import type { Season } from "./config";

/** AniList list statuses we handle. REPEATING is treated as currently watching. */
export type ListStatus =
  | "CURRENT"
  | "PLANNING"
  | "COMPLETED"
  | "DROPPED"
  | "PAUSED"
  | "REPEATING";

export type FuzzyDate = {
  year: number | null;
  month: number | null;
  day: number | null;
};

export type ListEntry = {
  status: ListStatus;
  /** User score out of 100. 0 or null means unscored. */
  score: number | null;
  /** Episodes the user has watched in the current watch. */
  progress: number;
  /** Number of full rewatches. */
  repeat: number;
  startedAt: FuzzyDate | null;
  completedAt: FuzzyDate | null;
  updatedAt: number | null;
  media: {
    title: {
      romaji: string | null;
      english: string | null;
      native: string | null;
    };
    format: string | null;
    episodes: number | null;
    duration: number | null;
    genres: string[];
    season: Season | null;
    seasonYear: number | null;
    startDate: FuzzyDate | null;
    averageScore: number | null;
    studios: { name: string }[];
  };
};

export type HotTake = {
  title: string;
  userScore: number;
  communityScore: number;
};

export type GenreShare = {
  name: string;
  count: number;
  share: number;
};

export type ComputedStats = {
  hours: number;
  episodes: number;
  topGenres: GenreShare[];
  topStudio: { name: string; count: number } | null;
  /** completed / (completed + dropped). Null when there are none of either. */
  completionRate: number | null;
  completed: number;
  dropped: number;
  /** dropped / (completed + dropped). 0 when there are none of either. */
  dropRate: number;
  hotTake: HotTake | null;
  countedTitles: number;
  pre2010Share: number;
  recentSeasonShare: number;
  episodesPerMonth: number;
  enoughData: boolean;
};

export type Cadence = "daily" | "weekly";
