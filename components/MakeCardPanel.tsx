import Link from "next/link";

export function MakeCardPanel() {
  return (
    <div className="mt-[18px] flex items-center gap-3 rounded-card border-2 border-ink bg-pink px-3.5 py-3 shadow-panel">
      <div className="min-w-0 flex-1">
        <div className="font-display text-[19px] leading-[1.2]">What is your type?</div>
        <div className="mt-0.5 text-sm font-medium">Enter your AniList name.</div>
      </div>
      <Link
        href="/"
        className="flex min-h-12 shrink-0 items-center justify-center rounded-btn border-2 border-ink bg-card px-3.5 text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
      >
        Make my card
      </Link>
    </div>
  );
}
