"use client";

import Link from "next/link";
import { useCallback, useState, useSyncExternalStore, type ReactNode } from "react";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function emit() {
  listeners.forEach((listener) => listener());
}

function storageKey(username: string): string {
  return `dailyarc:card-opened:${username}`;
}

function readOpened(username: string): "open" | "closed" {
  return window.localStorage.getItem(storageKey(username)) === "1" ? "open" : "closed";
}

export function AnimeCardPrompt({
  username,
  anilistUsername,
  watcherTypeLabel,
  children,
}: {
  username: string;
  anilistUsername: string | null;
  watcherTypeLabel: string | null;
  children: ReactNode;
}) {
  const getSnapshot = useCallback(
    () => (anilistUsername ? readOpened(username) : "closed"),
    [anilistUsername, username],
  );
  const opened = useSyncExternalStore(subscribe, getSnapshot, () => "unknown");
  const [copied, setCopied] = useState(false);

  if (!anilistUsername || opened === "unknown") return children;

  function markOpened() {
    window.localStorage.setItem(storageKey(username), "1");
    emit();
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/u/${username}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      {opened === "closed" ? (
        <div className="mt-[22px] flex items-center gap-3 rounded-card border-2 border-ink bg-pink px-4 py-3.5 shadow-panel">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[19px] leading-[1.25]">Your anime card is ready</h3>
            <p className="mt-1.5 text-sm font-medium">See your watcher type and share it.</p>
          </div>
          <Link
            href="/cards"
            onClick={markOpened}
            className="flex min-h-11 shrink-0 items-center justify-center rounded-btn border-2 border-ink bg-card px-3.5 text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
          >
            Open card
          </Link>
        </div>
      ) : null}
      {children}
      {opened === "open" ? (
        <div className="mt-5 flex items-center gap-3 rounded-card border-2 border-ink bg-card px-3 py-2.5 shadow-row">
          <div className="size-7 shrink-0 rounded-badge border-2 border-ink bg-pink" />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold">Your anime card</div>
            {watcherTypeLabel ? (
              <div className="text-[13px] font-medium text-ink-soft">{watcherTypeLabel}</div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void share()}
            className="flex min-h-11 shrink-0 items-center justify-center rounded-btn border-2 border-ink bg-pink px-3.5 text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
          >
            {copied ? "Copied" : "Share"}
          </button>
        </div>
      ) : null}
    </>
  );
}
