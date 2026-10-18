import { seasonStartMonth } from "./config";
import { seasonFromDate, previousSeason } from "./seasons";
import { localCheckinDate } from "./streaks";

export type XpAward = { createdAt: string; xp: number };

export type XpPoint = { label: string; xp: number };

export type XpRange = {
  total: number;
  previous: number;
  points: XpPoint[];
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

function utcFromIso(isoDate: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) throw new RangeError(`Expected YYYY-MM-DD, got "${isoDate}"`);
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function isoFromUtc(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addIsoDays(isoDate: string, days: number): string {
  const date = utcFromIso(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return isoFromUtc(date);
}

function weekdayShort(isoDate: string): string {
  return utcFromIso(isoDate).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function monthSpan(year: number, month: number): { start: string; end: string; label: string } {
  const start = isoFromUtc(new Date(Date.UTC(year, month - 1, 1)));
  const end = isoFromUtc(new Date(Date.UTC(year, month - 1, lastDayOfMonth(year, month))));
  return { start, end, label: MONTHS[month - 1] };
}

function indexAwards(awards: readonly XpAward[], timeZone: string): Map<string, number> {
  const byDay = new Map<string, number>();
  for (const award of awards) {
    if (!Number.isFinite(award.xp) || award.xp <= 0) continue;
    const created = new Date(award.createdAt);
    if (Number.isNaN(created.getTime())) continue;
    const day = localCheckinDate(created, timeZone);
    byDay.set(day, (byDay.get(day) ?? 0) + award.xp);
  }
  return byDay;
}

function totalBetween(byDay: Map<string, number>, start: string, end: string): number {
  let total = 0;
  for (const [day, xp] of byDay) {
    if (day >= start && day <= end) total += xp;
  }
  return total;
}

/** Null when there is no earlier XP to compare. Zero means the two periods match. */
export function changePercent(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function xpRanges(awards: readonly XpAward[], localDay: string, timeZone: string): {
  week: XpRange;
  month: XpRange;
  season: XpRange;
} {
  const byDay = indexAwards(awards, timeZone);
  const weekStart = addIsoDays(localDay, -6);
  const previousWeekStart = addIsoDays(localDay, -13);
  const previousWeekEnd = addIsoDays(localDay, -7);
  const week: XpRange = {
    total: totalBetween(byDay, weekStart, localDay),
    previous: totalBetween(byDay, previousWeekStart, previousWeekEnd),
    points: Array.from({ length: 7 }, (_, index) => {
      const key = addIsoDays(weekStart, index);
      return { label: weekdayShort(key), xp: byDay.get(key) ?? 0 };
    }),
  };

  const current = utcFromIso(localDay);
  const year = current.getUTCFullYear();
  const month = current.getUTCMonth() + 1;
  const monthStart = isoFromUtc(new Date(Date.UTC(year, month - 1, 1)));
  const previousMonthDate = new Date(Date.UTC(year, month - 2, 1));
  const previousMonth = monthSpan(previousMonthDate.getUTCFullYear(), previousMonthDate.getUTCMonth() + 1);
  const last = lastDayOfMonth(year, month);
  const points: XpPoint[] = [];
  for (let startDay = 1; startDay <= last; startDay += 7) {
    const endDay = Math.min(startDay + 6, last);
    const start = isoFromUtc(new Date(Date.UTC(year, month - 1, startDay)));
    const end = isoFromUtc(new Date(Date.UTC(year, month - 1, endDay)));
    points.push({ label: `${MONTHS[month - 1]} ${startDay}`, xp: totalBetween(byDay, start, end) });
  }
  const monthRange: XpRange = {
    total: totalBetween(byDay, monthStart, localDay),
    previous: totalBetween(byDay, previousMonth.start, previousMonth.end),
    points,
  };

  const seasonRef = seasonFromDate(new Date(`${localDay}T12:00:00.000Z`), "UTC");
  const seasonStart = seasonStartMonth[seasonRef.season];
  const seasonPoints: XpPoint[] = [];
  let seasonStartIso = "";
  let seasonEndIso = "";
  for (let offset = 0; offset < 3; offset += 1) {
    const span = monthSpan(seasonRef.year, seasonStart + offset);
    if (offset === 0) seasonStartIso = span.start;
    seasonEndIso = span.end;
    seasonPoints.push({ label: span.label, xp: totalBetween(byDay, span.start, span.end) });
  }
  const earlier = previousSeason(seasonRef);
  const earlierStartMonth = seasonStartMonth[earlier.season];
  const earlierStart = monthSpan(earlier.year, earlierStartMonth).start;
  const earlierEnd = monthSpan(earlier.year, earlierStartMonth + 2).end;
  const season: XpRange = {
    total: totalBetween(byDay, seasonStartIso, localDay < seasonEndIso ? localDay : seasonEndIso),
    previous: totalBetween(byDay, earlierStart, earlierEnd),
    points: seasonPoints,
  };

  return { week, month: monthRange, season };
}
