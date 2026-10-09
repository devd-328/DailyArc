"use client";

import { graceResetLabel } from "@/lib/streaks";
import { useEffect, useState } from "react";

const resetLabel = graceResetLabel();

function urlBase64ToUint8Array(value: string): Uint8Array {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

export function StreakReminderSwitch({ vapidPublicKey }: { vapidPublicKey: string | null }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const capable =
      "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

    if (!capable) {
      Promise.resolve().then(() => {
        if (!cancelled) setSupported(false);
      });
      return () => {
        cancelled = true;
      };
    }

    const blocked = Notification.permission === "denied";
    navigator.serviceWorker
      .getRegistration("/sw.js")
      .then((registration) => registration?.pushManager.getSubscription() ?? null)
      .then((subscription) => {
        if (cancelled) return;
        setSupported(true);
        setOn(subscription != null);
        if (blocked) setNote("Notifications are blocked in this browser.");
      })
      .catch(() => {
        if (cancelled) return;
        setSupported(true);
        if (blocked) setNote("Notifications are blocked in this browser.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    if (!vapidPublicKey) return;
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setNote("Notifications are blocked in this browser.");
      return;
    }
    const registration = await navigator.serviceWorker.register("/sw.js");
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    });
    if (!response.ok) {
      await subscription.unsubscribe();
      setNote("Could not save this reminder. Try again.");
      return;
    }
    setOn(true);
    setNote(null);
  }

  async function disable() {
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) {
      const response = await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      if (!response.ok) {
        setNote("Could not turn this reminder off. Try again.");
        return;
      }
      await subscription.unsubscribe();
    }
    setOn(false);
    setNote(null);
  }

  async function toggle() {
    if (busy || supported !== true || !vapidPublicKey) return;
    setBusy(true);
    try {
      if (on) await disable();
      else await enable();
    } catch {
      setNote("Could not change this reminder. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-3 py-3">
      <div className="flex min-h-12 items-center justify-between gap-3">
        <span className="text-[15px] font-bold">Streak reminder</span>
        {supported === true && vapidPublicKey ? (
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label="Streak reminder"
            disabled={busy}
            onClick={() => void toggle()}
            className={`relative h-[30px] w-[54px] shrink-0 rounded-chip border-2 border-ink ${on ? "bg-teal" : "bg-paper-2"}`}
          >
            <span
              className={`absolute top-px size-[22px] rounded-chip border-2 border-ink bg-card transition-[left] ${
                on ? "left-[26px]" : "left-px"
              }`}
            />
          </button>
        ) : null}
      </div>
      <p className="text-[13px] font-medium text-ink-soft">
        One alert before {resetLabel} if your streak is still going and you have not checked in.
      </p>
      {supported === false ? (
        <p className="mt-1 text-[13px] font-medium text-ink-soft">This browser cannot show reminders.</p>
      ) : null}
      {supported === true && !vapidPublicKey ? (
        <p className="mt-1 text-[13px] font-medium text-ink-soft">Reminders are not set up on this server yet.</p>
      ) : null}
      {note ? (
        <p className="mt-1 text-[13px] font-medium" role="alert">
          {note}
        </p>
      ) : null}
    </div>
  );
}
