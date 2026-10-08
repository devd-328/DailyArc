"use client";

import Link from "next/link";
import { useCallback, useState, useSyncExternalStore } from "react";

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
}: {
  username: string;
  anilistUsername: string | null;
  watcherTypeLabel: string | null;
}) {
  const getSnapshot = useCallback(
    () => (anilistUsername ? readOpened(username) : "closed"),
    [anilistUsername, username],
  );
  const opened = useSyncExternalStore(subscribe, getSnapshot, () => "unknown");
  const [copied, setCopied] = useState(false);

  if (!anilistUsername || opened === "unknown") return null;

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

  if (opened === "closed") {
    return (
      <div className="flex items-center gap-3 rounded-card border-2 border-ink bg-pink px-4 py-3.5 shadow-panel">
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
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-card border-2 border-ink bg-card px-3 py-2.5 shadow-row">
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
  );
}

export function OptionalCardNote() {
  return (
    <div className="rounded-card border-2 border-ink bg-card px-4 py-3.5 shadow-row">
      <h3 className="font-display text-[19px] leading-[1.25]">No AniList? You still play.</h3>
      <p className="mt-1.5 text-sm font-medium leading-normal">
        Quests, XP and rank are the game. Link AniList later if you want the shareable watcher card.
      </p>
      <a
        href="/auth/anilist?next=/cards"
        className="mt-3 flex min-h-11 w-full items-center justify-center rounded-btn border-2 border-ink bg-card px-3.5 text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
      >
        Link AniList later
      </a>
    </div>
  );
}
