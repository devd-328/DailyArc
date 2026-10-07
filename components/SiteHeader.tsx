import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative mb-[18px] flex items-center justify-between">
      <Link href="/" className="font-display text-xl">
        DailyArc
      </Link>
      <Link
        href="/login"
        className="inline-flex min-h-11 items-center rounded-chip border-2 border-ink bg-card px-3.5 text-sm font-bold"
      >
        Sign in
      </Link>
    </header>
  );
}
