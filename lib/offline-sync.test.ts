import { describe, expect, it } from "vitest";
import type { OfflineCheckIn, OfflineStore } from "./offline-checkins";
import { syncOfflineCheckIns } from "./offline-sync";

const NOW = new Date("2026-10-07T23:00:00Z");
const TIME_ZONE = "Asia/Karachi";
const TODAY = "2026-10-08";

function memoryStore(rows: OfflineCheckIn[]): OfflineStore & { snapshot(): OfflineCheckIn[] } {
  const map = new Map(rows.map((row) => [row.questId, row]));
  return {
    list: async () => [...map.values()],
    put: async (row) => {
      map.set(row.questId, row);
    },
    delete: async (questId) => {
      map.delete(questId);
    },
    snapshot: () => [...map.values()],
  };
}

function pending(questId: string, localDay = TODAY): OfflineCheckIn {
  return {
    questId,
    questName: questId,
    localDay,
    photo: new Blob(["proof"], { type: "image/jpeg" }),
    status: "pending",
  };
}

function checkInBody() {
  return { duplicate: false, xp_awarded: 20, level: 2, rank: "E", streak: 1 };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("syncOfflineCheckIns", () => {
  it("verifies a same-day photo, checks in, and drops the row", async () => {
    const store = memoryStore([pending("walk")]);
    const calls: string[] = [];
    const events = await syncOfflineCheckIns(store, TIME_ZONE, NOW, async (input) => {
      const url = String(input);
      calls.push(url);
      if (url.endsWith("/api/verify-proof")) return json({ verdict: "yes", message: "Nice." });
      return json(checkInBody());
    });

    expect(calls).toEqual(["/api/verify-proof", "/api/checkins"]);
    expect(events).toEqual([
      {
        type: "saved",
        questId: "walk",
        result: { duplicate: false, xpAwarded: 20, level: 2, rank: "E", streak: 1 },
      },
    ]);
    expect(store.snapshot()).toEqual([]);
  });

  it("discards a photo from a previous local day without calling the server", async () => {
    const store = memoryStore([pending("walk", "2026-10-07")]);
    const events = await syncOfflineCheckIns(store, TIME_ZONE, NOW, async () => {
      throw new Error("should not fetch");
    });

    expect(events).toEqual([{ type: "expired", questId: "walk", questName: "walk" }]);
    expect(store.snapshot()).toEqual([]);
  });

  it("keeps the photo and stops the queue on 401", async () => {
    const store = memoryStore([pending("walk"), pending("read")]);
    const calls: string[] = [];
    const events = await syncOfflineCheckIns(store, TIME_ZONE, NOW, async (input) => {
      calls.push(String(input));
      return json({ error: "auth" }, 401);
    });

    expect(calls).toEqual(["/api/verify-proof"]);
    expect(events).toEqual([{ type: "auth" }]);
    expect(store.snapshot().map((row) => row.questId)).toEqual(["walk", "read"]);
    expect(store.snapshot()[0]?.photo).toBeTruthy();
  });

  it("keeps the photo and stops the queue on 429", async () => {
    const store = memoryStore([pending("walk")]);
    const events = await syncOfflineCheckIns(store, TIME_ZONE, NOW, async () => json({ error: "cap" }, 429));

    expect(events).toEqual([{ type: "cap" }]);
    expect(store.snapshot()).toHaveLength(1);
  });

  it("keeps a check-in-only row when the proof passed and the XP save failed", async () => {
    const store = memoryStore([pending("walk")]);
    const events = await syncOfflineCheckIns(store, TIME_ZONE, NOW, async (input) => {
      if (String(input).endsWith("/api/verify-proof")) return json({ verdict: "yes", message: "Nice." });
      return json({ error: "checkin" }, 500);
    });

    expect(events).toEqual([{ type: "paused" }]);
    expect(store.snapshot()).toEqual([
      { questId: "walk", questName: "walk", localDay: TODAY, photo: null, status: "needs-checkin" },
    ]);
  });

  it("only posts the check-in when the proof was already accepted", async () => {
    const store = memoryStore([{ ...pending("walk"), photo: null, status: "needs-checkin" }]);
    const calls: string[] = [];
    const events = await syncOfflineCheckIns(store, TIME_ZONE, NOW, async (input) => {
      calls.push(String(input));
      return json(checkInBody());
    });

    expect(calls).toEqual(["/api/checkins"]);
    expect(events[0]?.type).toBe("saved");
    expect(store.snapshot()).toEqual([]);
  });

  it("drops a rejected proof so it can be retaken", async () => {
    const store = memoryStore([pending("walk")]);
    const events = await syncOfflineCheckIns(store, TIME_ZONE, NOW, async () =>
      json({ verdict: "no", message: "That is a wall." }),
    );

    expect(events).toEqual([{ type: "rejected", questId: "walk", message: "That is a wall." }]);
    expect(store.snapshot()).toEqual([]);
  });
});
