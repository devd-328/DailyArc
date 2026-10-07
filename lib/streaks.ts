import { streaks } from "./config";
import type { Cadence } from "./types";

/**
 * Apply the daily-streak bonus to base XP. Weekly quests should pass streakDays = 0
 * (the 7 and 30 day bonuses apply to daily streaks only).
 * Rounding: Math.round, so 30 XP at 7 days becomes 33 (matches the mockup).
 */
export function applyStreakBonus(xp: number, streakDays: number): number {
  if (xp < 0) throw new RangeError(`xp must be >= 0, got ${xp}`);
  if (streakDays < 0) throw new RangeError(`streakDays must be >= 0, got ${streakDays}`);
  let multiplier = 1;
  for (const bonus of streaks.bonuses) {
    if (streakDays >= bonus.minDays) {
      multiplier = bonus.multiplier;
      break;
    }
  }
  return Math.round(xp * multiplier);
}

type DateParts = { year: number; month: number; day: number; hour: number };

function partsInTimeZone(now: Date, timeZone: string): DateParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const bag: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
  for (const part of fmt.formatToParts(now)) {
    if (part.type !== "literal") bag[part.type] = part.value;
  }
  const year = Number(bag.year);
  const month = Number(bag.month);
  const day = Number(bag.day);
  const hour = Number(bag.hour);
  if (![year, month, day, hour].every(Number.isFinite)) {
    throw new RangeError(`Could not read local time in timezone "${timeZone}"`);
  }
  return { year, month, day, hour };
}

function isoFromUtcDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function utcFromIso(isoDate: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) throw new RangeError(`Expected YYYY-MM-DD, got "${isoDate}"`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * The user's local calendar date for a check-in, with the 3:00 AM grace window:
 * a check-in before `streaks.graceHour` local time counts for the previous day.
 */
export function localCheckinDate(now: Date, timeZone: string): string {
  const parts = partsInTimeZone(now, timeZone);
  const utc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  if (parts.hour < streaks.graceHour) {
    utc.setUTCDate(utc.getUTCDate() - 1);
  }
  return isoFromUtcDate(utc);
}

/**
 * Period key for a check-in. Daily is the local date itself.
 * Weekly is the Monday of that week (ISO week, Monday start).
 */
export function periodStart(isoDate: string, cadence: Cadence): string {
  if (cadence === "daily") return isoDate;
  const utc = utcFromIso(isoDate);
  const weekday = utc.getUTCDay();
  const daysFromMonday = (weekday + 6) % 7;
  utc.setUTCDate(utc.getUTCDate() - daysFromMonday);
  return isoFromUtcDate(utc);
}
