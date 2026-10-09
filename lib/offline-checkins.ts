import { localCheckinDate } from "./streaks";

export type OfflineCheckInStatus = "pending" | "needs-checkin";

export type OfflineCheckIn = {
  questId: string;
  questName: string;
  localDay: string;
  photo: Blob | null;
  status: OfflineCheckInStatus;
};

export type OfflineStore = {
  list(): Promise<OfflineCheckIn[]>;
  put(row: OfflineCheckIn): Promise<void>;
  delete(questId: string): Promise<void>;
};

const DB_NAME = "dailyarc-offline";
const STORE = "checkins";

export function isCurrentCheckinDay(storedDay: string, now: Date, timeZone: string): boolean {
  return storedDay === localCheckinDate(now, timeZone);
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "questId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open offline check-ins"));
  });
}

function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = run(tx.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Offline check-in request failed"));
        tx.oncomplete = () => db.close();
        tx.onerror = () => {
          db.close();
          reject(tx.error ?? new Error("Offline check-in transaction failed"));
        };
      }),
  );
}

export const offlineCheckInStore: OfflineStore = {
  list() {
    return withStore("readonly", (store) => store.getAll());
  },
  put(row) {
    return withStore("readwrite", (store) => store.put(row)).then(() => undefined);
  },
  delete(questId) {
    return withStore("readwrite", (store) => store.delete(questId)).then(() => undefined);
  },
};

export async function queuePendingProof(input: {
  questId: string;
  questName: string;
  timeZone: string;
  photo: Blob;
  now?: Date;
}): Promise<void> {
  await offlineCheckInStore.put({
    questId: input.questId,
    questName: input.questName,
    localDay: localCheckinDate(input.now ?? new Date(), input.timeZone),
    photo: input.photo,
    status: "pending",
  });
}

export async function queueNeedsCheckIn(input: {
  questId: string;
  questName: string;
  timeZone: string;
  now?: Date;
}): Promise<void> {
  await offlineCheckInStore.put({
    questId: input.questId,
    questName: input.questName,
    localDay: localCheckinDate(input.now ?? new Date(), input.timeZone),
    photo: null,
    status: "needs-checkin",
  });
}

export function listOfflineCheckIns(): Promise<OfflineCheckIn[]> {
  return offlineCheckInStore.list();
}
