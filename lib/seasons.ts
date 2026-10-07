import { SEASONS, seasonStartMonth, type Season } from "./config";

export type SeasonRef = { season: Season; year: number };

export function seasonFromDate(date: Date, timeZone = "UTC"): SeasonRef {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
  });
  const bag: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== "literal") bag[part.type] = part.value;
  }
  const year = Number(bag.year);
  const month = Number(bag.month);
  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    throw new RangeError(`Could not read year/month in timezone "${timeZone}"`);
  }
  let season: Season = "WINTER";
  for (const candidate of SEASONS) {
    if (month >= seasonStartMonth[candidate]) season = candidate;
  }
  return { season, year };
}

export function previousSeason(ref: SeasonRef): SeasonRef {
  const index = SEASONS.indexOf(ref.season);
  if (index <= 0) return { season: SEASONS[SEASONS.length - 1], year: ref.year - 1 };
  return { season: SEASONS[index - 1], year: ref.year };
}

/** Current season plus the previous (count - 1) seasons. */
export function recentSeasons(now: Date, count: number, timeZone = "UTC"): SeasonRef[] {
  const result: SeasonRef[] = [];
  let cursor = seasonFromDate(now, timeZone);
  for (let i = 0; i < count; i++) {
    result.push(cursor);
    cursor = previousSeason(cursor);
  }
  return result;
}

export function seasonKey(ref: SeasonRef): string {
  return `${ref.year}-${ref.season}`;
}
