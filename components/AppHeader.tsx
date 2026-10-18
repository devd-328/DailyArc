"use client";

import type { Notice } from "@/lib/notices";
import { useScrollLock } from "@/lib/use-scroll-lock";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function readStorageKey(userId: string): string {
  return `dailyarc-read-notices:${userId}`;
}

function loadReadIds(userId: string): string[] {
  try {
    const raw = localStorage.getItem(readStorageKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => typeof item === "string").slice(-50);
  } catch {
    return [];
  }
}

function saveReadIds(userId: string, ids: string[]) {
  localStorage.setItem(readStorageKey(userId), JSON.stringify(ids.slice(-50)));
}

export function AppHeader({
  userId,
  username,
  avatarSrc,
  streakDays,
  notices,
}: {
  userId: string;
  username: string;
  avatarSrc: string;
  streakDays: number;
  notices: Notice[];
}) {
  const pathname = usePathname();
  const [menu, setMenu] = useState<"account" | "notices" | null>(null);
  const [readIds, setReadIds] = useState<string[] | null>(null);
  useScrollLock(menu !== null);

  useEffect(() => {
    setReadIds(loadReadIds(userId));
  }, [userId]);

  useEffect(() => {
    setMenu(null);
  }, [pathname]);

  useEffect(() => {
    if (!menu) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenu(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menu]);

  function markRead(ids: string[]) {
    setReadIds((current) => {
      const next = [...new Set([...(current ?? []), ...ids])].slice(-50);
      saveReadIds(userId, next);
      return next;
    });
  }

  const list = notices ?? [];
  const unread = list.filter((notice) => !(readIds ?? []).includes(notice.id));
  const badge = readIds === null ? 0 : unread.length;

  return (
    <header className={`relative mb-[18px] flex items-center justify-between gap-2 ${menu ? "z-40" : ""}`}>
      {menu ? (
        <button type="button" aria-label="Close" tabIndex={-1} className="fixed inset-0 z-30 cursor-default" onClick={() => setMenu(null)} />
      ) : null}
      <div className="relative">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={menu === "account"}
          aria-label={`Account menu for ${username}`}
          onClick={() => setMenu((current) => (current === "account" ? null : "account"))}
          className="relative z-40 grid size-11 place-items-center overflow-hidden rounded-full border-2 border-ink bg-paper shadow-row"
        >
          <img src={avatarSrc} alt="" className="size-full object-cover" />
        </button>
        {menu === "account" ? (
          <div role="menu" className="absolute left-0 top-full z-40 mt-2 w-44 rounded-card border-2 border-ink bg-card shadow-panel">
            <Link
              role="menuitem"
              href="/profile"
              className="flex min-h-11 items-center px-3 text-[15px] font-bold"
            >
              Profile
            </Link>
            <form action="/auth/signout" method="post" className="border-t-2 border-paper-2">
              <button type="submit" role="menuitem" className="flex min-h-11 w-full items-center px-3 text-[15px] font-bold">
                Sign out
              </button>
            </form>
          </div>
        ) : null}
      </div>

      <div className="relative flex items-center gap-2">
        <div className="whitespace-nowrap rounded-chip border-2 border-ink bg-card px-3 py-1.5 text-sm font-bold">
          Streak: {streakDays} {streakDays === 1 ? "day" : "days"}
        </div>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={menu === "notices"}
          aria-label={badge > 0 ? `Notifications, ${badge} unread` : "Notifications"}
          onClick={() => setMenu((current) => (current === "notices" ? null : "notices"))}
          className="relative z-40 grid size-11 place-items-center rounded-btn border-2 border-ink bg-card shadow-row"
        >
          <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-[2.2]" aria-hidden="true">
            <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
          </svg>
          {badge > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-chip border-2 border-ink bg-pink px-1 text-[11px] font-bold leading-4">
              {badge > 9 ? "9+" : badge}
            </span>
          ) : null}
        </button>
        {menu === "notices" ? (
          <div
            role="dialog"
            aria-label="Notifications"
            className="absolute right-0 top-full z-40 mt-2 w-[min(20rem,calc(100vw-2.5rem))] rounded-card border-2 border-ink bg-card shadow-panel"
          >
            <div className="flex items-center justify-between border-b-2 border-paper-2 px-3 py-2">
              <h2 className="font-display text-lg">Notices</h2>
              {badge > 0 ? (
                <button type="button" onClick={() => markRead(list.map((notice) => notice.id))} className="text-[13px] font-bold">
                  Mark all read
                </button>
              ) : null}
            </div>
            {list.length === 0 ? (
              <p className="px-3 py-4 text-sm font-medium text-ink-soft">Nothing new.</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {list.map((notice) => {
                  const read = (readIds ?? []).includes(notice.id);
                  return (
                    <li key={notice.id} className="border-b-2 border-paper-2 px-3 py-2.5 last:border-b-0">
                      <Link href={notice.href} onClick={() => markRead([notice.id])} className="block">
                        <div className={`text-[15px] font-bold ${read ? "text-ink-soft" : ""}`}>{notice.title}</div>
                        <p className="mt-0.5 text-[13px] font-medium text-ink-soft">{notice.body}</p>
                      </Link>
                      {read ? (
                        <div className="mt-1 text-[13px] font-bold text-ink-soft">Read</div>
                      ) : (
                        <button type="button" onClick={() => markRead([notice.id])} className="mt-1 text-[13px] font-bold">
                          Mark read
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function AppHeaderFallback() {
  return (
    <header className="mb-[18px] flex items-center justify-between gap-2">
      <div className="size-11 rounded-full border-2 border-ink bg-paper shadow-row" />
      <div className="flex items-center gap-2">
        <div className="h-[38px] w-32 rounded-chip border-2 border-ink bg-card" />
        <div className="size-11 rounded-btn border-2 border-ink bg-card shadow-row" />
      </div>
    </header>
  );
}
