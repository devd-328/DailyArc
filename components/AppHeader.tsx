import Link from "next/link";

export function AppHeader({ username, streakDays }: { username: string; streakDays: number }) {
  return (
    <header className="mb-[18px] grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1.5 sm:grid-cols-[1fr_auto_1fr] sm:gap-2">
      <div className="min-w-0 max-w-full -rotate-2 justify-self-start border-2 border-ink bg-sun px-3 py-1.5 text-[15px] font-bold shadow-row sm:px-3.5">
        <span className="block truncate">{username}</span>
      </div>
      <Link href="/quests" className="font-display text-lg sm:text-xl lg:hidden">
        DailyArc
      </Link>
      <div className="justify-self-end whitespace-nowrap rounded-chip border-2 border-ink bg-card px-3 py-1.5 text-sm font-bold sm:px-3.5">
        Streak: {streakDays} days
      </div>
    </header>
  );
}

export function AppHeaderFallback() {
  return (
    <header className="mb-[18px] grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1.5 sm:grid-cols-[1fr_auto_1fr] sm:gap-2">
      <div className="min-h-[38px] min-w-[5.5rem] -rotate-2 justify-self-start border-2 border-ink bg-sun shadow-row" />
      <div className="h-7 w-[4.75rem] sm:w-[5.75rem] lg:hidden" />
      <div className="min-h-[38px] min-w-[7.5rem] justify-self-end rounded-chip border-2 border-ink bg-card" />
    </header>
  );
}
