import { createHash, timingSafeEqual } from "node:crypto";
import { graceResetLabel, localCheckinDate, minutesUntilDayReset } from "./streaks";

/** One row in push_sends. Matches the database check. */
export const STREAK_REMINDER_KIND = "streak_at_risk";

const PUSH_HOSTS = new Set([
  "fcm.googleapis.com",
  "updates.push.services.mozilla.com",
  "push.services.mozilla.com",
  "web.push.apple.com",
]);

const KEY_PATTERN = /^[A-Za-z0-9_-]+$/;

export type PushSubscriptionInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type ReminderSubscription = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type ReminderCandidate = {
  userId: string;
  timezone: string;
  currentStreak: number;
  lastCheckinDate: string | null;
  subscriptions: ReminderSubscription[];
};

export type PushSendResult = "ok" | "gone" | "failed";

/** Narrow store so the hourly scan can be tested without Supabase or the push network. */
export type ReminderStore = {
  listCandidates(): Promise<ReminderCandidate[]>;
  claim(userId: string, localDay: string): Promise<"claimed" | "exists">;
  release(userId: string, localDay: string): Promise<void>;
  dropSubscription(id: string): Promise<void>;
  send(subscription: ReminderSubscription): Promise<PushSendResult>;
};

export function isAllowedPushEndpoint(value: string): boolean {
  if (value.length === 0 || value.length > 2048) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.username !== "" || url.password !== "") return false;
  const host = url.hostname.toLowerCase();
  if (PUSH_HOSTS.has(host)) return true;
  return host.endsWith(".push.apple.com");
}

/** Browser PushSubscription JSON: endpoint plus keys.p256dh and keys.auth. */
export function parsePushSubscription(body: unknown): PushSubscriptionInput | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  if (typeof record.endpoint !== "string" || !isAllowedPushEndpoint(record.endpoint)) return null;
  if (!record.keys || typeof record.keys !== "object") return null;
  const keys = record.keys as Record<string, unknown>;
  if (typeof keys.p256dh !== "string" || typeof keys.auth !== "string") return null;
  if (!isPushKey(keys.p256dh, 16, 200) || !isPushKey(keys.auth, 8, 100)) return null;
  return { endpoint: record.endpoint, p256dh: keys.p256dh, auth: keys.auth };
}

function isPushKey(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max && KEY_PATTERN.test(value);
}

export function cronAuthorized(authorization: string | null, secret: string | undefined): boolean {
  if (!secret) return false;
  const actual = createHash("sha256").update(authorization ?? "", "utf8").digest();
  const expected = createHash("sha256").update(`Bearer ${secret}`, "utf8").digest();
  return timingSafeEqual(actual, expected);
}

export function streakReminderDue(input: {
  currentStreak: number;
  lastCheckinDate: string | null;
  localDay: string;
  minutesLeft: number;
  windowMinutes: number;
}): boolean {
  if (input.currentStreak <= 0) return false;
  if (input.lastCheckinDate != null && input.lastCheckinDate >= input.localDay) return false;
  if (input.minutesLeft <= 0 || input.minutesLeft > input.windowMinutes) return false;
  return true;
}

export function streakReminderPayload(resetLabel: string = graceResetLabel()): {
  title: string;
  body: string;
  url: "/quests";
} {
  return {
    title: "Streak at risk",
    body: `Check in before ${resetLabel} or your streak resets.`,
    url: "/quests",
  };
}

export function pushStatusOutcome(statusCode: number): PushSendResult {
  if (statusCode === 404 || statusCode === 410) return "gone";
  if (statusCode >= 200 && statusCode < 300) return "ok";
  return "failed";
}

/**
 * One reminder per user per local day, only inside the window before the reset.
 * A dead subscription (404 or 410) is dropped. A temporary failure is released
 * so the next hour can try again. A mix of success and failure keeps the claim
 * so a device that already got the alert is not notified twice.
 */
export async function deliverStreakReminders(
  store: ReminderStore,
  now: Date,
  windowMinutes: number,
): Promise<{ sent: number; dropped: number }> {
  const candidates = await store.listCandidates();
  let sent = 0;
  let dropped = 0;

  for (const candidate of candidates) {
    if (candidate.subscriptions.length === 0) continue;

    let localDay: string;
    let minutesLeft: number;
    try {
      localDay = localCheckinDate(now, candidate.timezone);
      minutesLeft = minutesUntilDayReset(now, candidate.timezone);
    } catch {
      continue;
    }

    if (
      !streakReminderDue({
        currentStreak: candidate.currentStreak,
        lastCheckinDate: candidate.lastCheckinDate,
        localDay,
        minutesLeft,
        windowMinutes,
      })
    ) {
      continue;
    }

    const claim = await store.claim(candidate.userId, localDay);
    if (claim === "exists") continue;

    let ok = 0;
    let retry = false;
    for (const subscription of candidate.subscriptions) {
      const result = await store.send(subscription);
      if (result === "ok") ok += 1;
      else if (result === "gone") {
        await store.dropSubscription(subscription.id);
        dropped += 1;
      } else {
        retry = true;
      }
    }

    if (ok === 0 && retry) await store.release(candidate.userId, localDay);
    else if (ok > 0) sent += 1;
  }

  return { sent, dropped };
}
