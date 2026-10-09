import { streaks } from "@/lib/config";
import {
  STREAK_REMINDER_KIND,
  cronAuthorized,
  deliverStreakReminders,
  pushStatusOutcome,
  streakReminderPayload,
  type ReminderCandidate,
  type ReminderStore,
  type ReminderSubscription,
} from "@/lib/push";
import { createAdminClient } from "@/lib/supabase/admin";
import { connection } from "next/server";
import { NextResponse } from "next/server";
import { WebPushError, sendNotification, setVapidDetails } from "web-push";

const CHUNK = 100;

type ProfileRow = {
  id: string;
  timezone: string;
  current_streak: number;
  last_checkin_date: string | null;
};

type SubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function GET(request: Request) {
  await connection();
  if (!cronAuthorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "auth" }, { status: 401 });
  }

  const vapid = readVapid();
  if (!vapid) return NextResponse.json({ error: "config" }, { status: 500 });
  setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  try {
    const result = await deliverStreakReminders(reminderStore(), new Date(), streaks.reminderWindowMinutes);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "send" }, { status: 500 });
  }
}

function readVapid(): { subject: string; publicKey: string; privateKey: string } | null {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return null;
  if (!subject.startsWith("mailto:") && !subject.startsWith("https://")) return null;
  return { subject, publicKey, privateKey };
}

function reminderStore(): ReminderStore {
  const admin = createAdminClient();
  const payload = JSON.stringify(streakReminderPayload());

  return {
    async listCandidates() {
      const { data, error } = await admin
        .from("profiles")
        .select("id, timezone, current_streak, last_checkin_date")
        .gt("current_streak", 0);
      if (error) throw new Error("profiles");
      const profiles = (data ?? []) as ProfileRow[];
      if (profiles.length === 0) return [];

      const subscriptions: SubscriptionRow[] = [];
      for (const ids of chunks(
        profiles.map((row) => row.id),
        CHUNK,
      )) {
        const result = await admin
          .from("push_subscriptions")
          .select("id, user_id, endpoint, p256dh, auth")
          .in("user_id", ids);
        if (result.error) throw new Error("subscriptions");
        subscriptions.push(...((result.data ?? []) as SubscriptionRow[]));
      }

      const byUser = new Map<string, ReminderSubscription[]>();
      for (const row of subscriptions) {
        const list = byUser.get(row.user_id) ?? [];
        list.push({ id: row.id, endpoint: row.endpoint, p256dh: row.p256dh, auth: row.auth });
        byUser.set(row.user_id, list);
      }

      const candidates: ReminderCandidate[] = [];
      for (const row of profiles) {
        const owned = byUser.get(row.id);
        if (!owned || owned.length === 0) continue;
        candidates.push({
          userId: row.id,
          timezone: row.timezone,
          currentStreak: row.current_streak,
          lastCheckinDate: row.last_checkin_date,
          subscriptions: owned,
        });
      }
      return candidates;
    },

    async claim(userId, localDay) {
      const { error } = await admin.from("push_sends").insert({
        user_id: userId,
        local_day: localDay,
        kind: STREAK_REMINDER_KIND,
      });
      if (!error) return "claimed";
      if (error.code === "23505") return "exists";
      throw new Error("claim");
    },

    async release(userId, localDay) {
      const { error } = await admin
        .from("push_sends")
        .delete()
        .eq("user_id", userId)
        .eq("local_day", localDay)
        .eq("kind", STREAK_REMINDER_KIND);
      if (error) throw new Error("release");
    },

    async dropSubscription(id) {
      const { error } = await admin.from("push_subscriptions").delete().eq("id", id);
      if (error) throw new Error("drop");
    },

    async send(subscription) {
      try {
        const result = await sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          payload,
        );
        return pushStatusOutcome(result.statusCode);
      } catch (error) {
        if (error instanceof WebPushError) return pushStatusOutcome(error.statusCode);
        if (error && typeof error === "object" && "statusCode" in error) {
          const statusCode = (error as { statusCode: unknown }).statusCode;
          if (typeof statusCode === "number") return pushStatusOutcome(statusCode);
        }
        return "failed";
      }
    },
  };
}

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
