import { describe, expect, it } from "vitest";
import {
  cronAuthorized,
  deliverStreakReminders,
  isAllowedPushEndpoint,
  parsePushSubscription,
  pushStatusOutcome,
  streakReminderDue,
  streakReminderPayload,
  type ReminderCandidate,
  type ReminderStore,
  type ReminderSubscription,
} from "./push";

const subscription: ReminderSubscription = {
  id: "sub-1",
  endpoint: "https://fcm.googleapis.com/fcm/send/abc",
  p256dh: "BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  auth: "AAAAAAAAAAAA",
};

function candidate(overrides: Partial<ReminderCandidate> = {}): ReminderCandidate {
  return {
    userId: "user-1",
    timezone: "Asia/Karachi",
    currentStreak: 4,
    lastCheckinDate: "2026-10-06",
    subscriptions: [subscription],
    ...overrides,
  };
}

function store(candidates: ReminderCandidate[], sendResult: "ok" | "gone" | "failed" = "ok") {
  const claims = new Set<string>();
  const dropped: string[] = [];
  const sent: string[] = [];
  const released: string[] = [];
  const fake: ReminderStore = {
    async listCandidates() {
      return candidates;
    },
    async claim(userId, localDay) {
      const key = `${userId}:${localDay}`;
      if (claims.has(key)) return "exists";
      claims.add(key);
      return "claimed";
    },
    async release(userId, localDay) {
      claims.delete(`${userId}:${localDay}`);
      released.push(userId);
    },
    async dropSubscription(id) {
      dropped.push(id);
    },
    async send(item) {
      sent.push(item.id);
      return sendResult;
    },
  };
  return { fake, claims, dropped, sent, released };
}

describe("isAllowedPushEndpoint", () => {
  it("allows Apple, Google and Mozilla push hosts", () => {
    expect(isAllowedPushEndpoint("https://fcm.googleapis.com/fcm/send/abc")).toBe(true);
    expect(isAllowedPushEndpoint("https://updates.push.services.mozilla.com/wpush/v2/abc")).toBe(true);
    expect(isAllowedPushEndpoint("https://web.push.apple.com/abc")).toBe(true);
  });

  it("rejects other hosts, insecure URLs and credentials", () => {
    expect(isAllowedPushEndpoint("https://evil.example/fcm.googleapis.com")).toBe(false);
    expect(isAllowedPushEndpoint("http://fcm.googleapis.com/fcm/send/abc")).toBe(false);
    expect(isAllowedPushEndpoint("https://user:pass@fcm.googleapis.com/fcm/send/abc")).toBe(false);
    expect(isAllowedPushEndpoint("https://fcm.googleapis.com.evil.example/abc")).toBe(false);
  });
});

describe("parsePushSubscription", () => {
  it("reads the browser subscription shape", () => {
    expect(
      parsePushSubscription({
        endpoint: "https://fcm.googleapis.com/fcm/send/abc",
        keys: { p256dh: "BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", auth: "AAAAAAAAAAAA" },
      }),
    ).toEqual({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc",
      p256dh: "BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      auth: "AAAAAAAAAAAA",
    });
  });

  it("rejects a subscription the cron must not call", () => {
    expect(
      parsePushSubscription({
        endpoint: "https://127.0.0.1/push",
        keys: { p256dh: "BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", auth: "AAAAAAAAAAAA" },
      }),
    ).toBeNull();
  });
});

describe("cronAuthorized", () => {
  it("accepts only the bearer secret", () => {
    expect(cronAuthorized("Bearer nightwatch", "nightwatch")).toBe(true);
    expect(cronAuthorized("Bearer other", "nightwatch")).toBe(false);
    expect(cronAuthorized(null, "nightwatch")).toBe(false);
    expect(cronAuthorized("Bearer nightwatch", undefined)).toBe(false);
  });
});

describe("streakReminderDue", () => {
  it("is due only for a live streak with no check-in today, inside the window", () => {
    expect(
      streakReminderDue({
        currentStreak: 3,
        lastCheckinDate: "2026-10-07",
        localDay: "2026-10-08",
        minutesLeft: 90,
        windowMinutes: 120,
      }),
    ).toBe(true);
  });

  it("skips a finished day, a dead streak and time outside the window", () => {
    const base = {
      currentStreak: 3,
      lastCheckinDate: "2026-10-08",
      localDay: "2026-10-08",
      minutesLeft: 90,
      windowMinutes: 120,
    };
    expect(streakReminderDue(base)).toBe(false);
    expect(streakReminderDue({ ...base, lastCheckinDate: "2026-10-07", currentStreak: 0 })).toBe(false);
    expect(streakReminderDue({ ...base, lastCheckinDate: "2026-10-07", minutesLeft: 121 })).toBe(false);
  });
});

describe("streakReminderPayload", () => {
  it("points at the quest board and names the reset", () => {
    expect(streakReminderPayload("3:00 AM")).toEqual({
      title: "Streak at risk",
      body: "Check in before 3:00 AM or your streak resets.",
      url: "/quests",
    });
  });
});

describe("pushStatusOutcome", () => {
  it("treats 404 and 410 as a dead subscription", () => {
    expect(pushStatusOutcome(201)).toBe("ok");
    expect(pushStatusOutcome(404)).toBe("gone");
    expect(pushStatusOutcome(410)).toBe("gone");
    expect(pushStatusOutcome(429)).toBe("failed");
  });
});

describe("deliverStreakReminders", () => {
  // 01:30 in Karachi on 8 Oct 2026 is 90 minutes before the 3:00 AM reset.
  // The quest day is still 7 Oct because of the grace window, so a check-in
  // dated 6 Oct has not covered today.
  const now = new Date("2026-10-07T20:30:00Z");

  it("sends once and keeps the claim", async () => {
    const { fake, sent, released } = store([candidate()]);
    const result = await deliverStreakReminders(fake, now, 120);
    expect(result).toEqual({ sent: 1, dropped: 0 });
    expect(sent).toEqual(["sub-1"]);
    expect(released).toEqual([]);
    const again = await deliverStreakReminders(fake, now, 120);
    expect(again.sent).toBe(0);
  });

  it("does not send after today's check-in or outside the window", async () => {
    const checkedIn = store([candidate({ lastCheckinDate: "2026-10-07" })]);
    expect(await deliverStreakReminders(checkedIn.fake, now, 120)).toEqual({ sent: 0, dropped: 0 });
    expect(checkedIn.sent).toEqual([]);

    const early = store([candidate()]);
    expect(await deliverStreakReminders(early.fake, now, 60)).toEqual({ sent: 0, dropped: 0 });
    expect(early.sent).toEqual([]);
  });

  it("drops a dead subscription and retries a temporary failure", async () => {
    const dead = store([candidate()], "gone");
    const droppedResult = await deliverStreakReminders(dead.fake, now, 120);
    expect(droppedResult).toEqual({ sent: 0, dropped: 1 });
    expect(dead.dropped).toEqual(["sub-1"]);
    expect(dead.released).toEqual([]);

    const failed = store([candidate()], "failed");
    await deliverStreakReminders(failed.fake, now, 120);
    expect(failed.released).toEqual(["user-1"]);
  });
});
