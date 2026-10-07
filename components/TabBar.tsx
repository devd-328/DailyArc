"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/quests",
    label: "Quests",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="1" />
        <path d="M8 12.5l3 3 5-6" />
      </svg>
    ),
  },
  {
    href: "/stats",
    label: "Stats",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 20V10M12 20V4M19 20v-7" />
      </svg>
    ),
  },
  {
    href: "/cards",
    label: "Cards",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="3" width="14" height="18" rx="1" />
        <path d="M9 8h6M9 12h6" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1-4.5 4-6 8-6s7 1.5 8 6" />
      </svg>
    ),
  },
] as const;

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-[76px] items-center justify-around bg-ink px-2 pb-[env(safe-area-inset-bottom)]">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex h-[52px] min-w-[72px] flex-col items-center justify-center gap-0.5 rounded-btn border-2 text-[13px] font-bold ${
              active ? "border-paper bg-pink text-ink" : "border-transparent text-paper"
            }`}
          >
            <span className="size-[18px] [&_svg]:size-full [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.2] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]">
              {tab.icon}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
