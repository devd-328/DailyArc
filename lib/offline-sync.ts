import { parseCheckInResult, type CheckInResult } from "./checkin";
import { isCurrentCheckinDay, type OfflineCheckIn, type OfflineStore } from "./offline-checkins";

export type SyncEvent =
  | { type: "saved"; questId: string; result: CheckInResult }
  | { type: "rejected"; questId: string; message: string }
  | { type: "expired"; questId: string; questName: string }
  | { type: "auth" }
  | { type: "cap" }
  | { type: "paused" };

type Verdict = "yes" | "no" | "unclear" | "no_proof";

let syncing: Promise<SyncEvent[]> | null = null;

export function syncQueuedCheckIns(store: OfflineStore, timeZone: string, now = new Date()): Promise<SyncEvent[]> {
  if (syncing) return syncing;
  syncing = syncOfflineCheckIns(store, timeZone, now, fetch).finally(() => {
    syncing = null;
  });
  return syncing;
}

export async function syncOfflineCheckIns(
  store: OfflineStore,
  timeZone: string,
  now: Date,
  fetchImpl: typeof fetch,
): Promise<SyncEvent[]> {
  const events: SyncEvent[] = [];
  const rows = await store.list();

  for (const row of rows) {
    if (!isCurrentCheckinDay(row.localDay, now, timeZone)) {
      await store.delete(row.questId);
      events.push({ type: "expired", questId: row.questId, questName: row.questName });
      continue;
    }

    const outcome = await sendRow(store, row, fetchImpl);
    events.push(outcome);
    if (outcome.type === "auth" || outcome.type === "cap" || outcome.type === "paused") break;
  }

  return events;
}

async function sendRow(store: OfflineStore, row: OfflineCheckIn, fetchImpl: typeof fetch): Promise<SyncEvent> {
  if (row.status === "pending") {
    if (!row.photo) {
      await store.delete(row.questId);
      return { type: "rejected", questId: row.questId, message: "That photo is missing. Take another one." };
    }

    let response: Response;
    try {
      const form = new FormData();
      form.set("questId", row.questId);
      form.set("proof", row.photo, "proof.jpg");
      response = await fetchImpl("/api/verify-proof", { method: "POST", body: form });
    } catch {
      return { type: "paused" };
    }

    const stopped = stopForStatus(response.status);
    if (stopped) return stopped;

    if (!response.ok) return { type: "paused" };

    const verdict = parseVerdict(await response.json().catch(() => null));
    if (!verdict) return { type: "paused" };
    if (verdict.verdict !== "yes") {
      await store.delete(row.questId);
      return { type: "rejected", questId: row.questId, message: verdict.message };
    }

    await store.put({ ...row, photo: null, status: "needs-checkin" });
  }

  return saveCheckIn(store, row, fetchImpl);
}

async function saveCheckIn(store: OfflineStore, row: OfflineCheckIn, fetchImpl: typeof fetch): Promise<SyncEvent> {
  let response: Response;
  try {
    response = await fetchImpl("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quest_id: row.questId }),
    });
  } catch {
    return { type: "paused" };
  }

  const stopped = stopForStatus(response.status);
  if (stopped) return stopped;
  if (!response.ok) return { type: "paused" };

  const result = parseCheckInResult(await response.json().catch(() => null));
  if (!result) return { type: "paused" };

  await store.delete(row.questId);
  return { type: "saved", questId: row.questId, result };
}

function stopForStatus(status: number): SyncEvent | null {
  if (status === 401) return { type: "auth" };
  if (status === 429) return { type: "cap" };
  return null;
}

function parseVerdict(data: unknown): { verdict: Verdict; message: string } | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  const verdict = row.verdict;
  if (verdict !== "yes" && verdict !== "no" && verdict !== "unclear" && verdict !== "no_proof") return null;
  if (typeof row.message !== "string" || !row.message.trim()) return null;
  return { verdict, message: row.message.trim() };
}
