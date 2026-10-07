import type { Rank } from "@/lib/config";
import { rankForLevel } from "@/lib/ranks";
import type { HotTake } from "@/lib/types";

export type WrappedCardData = {
  username: string;
  watcherTypeLabel: string;
  watcherLine: string;
  hours: number;
  episodes: number;
  completionRate: number | null;
  topGenres: readonly string[];
  hotTake: HotTake | null;
  /** Null for a visitor with no linked profile: no rank badge. */
  level: number | null;
};

const GENRE_FILL = ["var(--sun)", "var(--teal)", "var(--pink)"] as const;

/** Preview data from mockups/screens-auth.html. Placeholders only, not real AniList stats. */
export const LANDING_CARD_PREVIEW: WrappedCardData = {
  username: "dev_das",
  watcherTypeLabel: "Binge Demon",
  watcherLine: "You finish whole seasons before the weekend is over.",
  hours: 1264,
  episodes: 3160,
  completionRate: 0.78,
  topGenres: ["Action", "Drama", "Fantasy"],
  hotTake: { title: "Sample Title A", userScore: 9, communityScore: 6.2 },
  level: 27,
};

function rankFill(rank: Rank): string {
  return `var(--rank-${rank.toLowerCase()})`;
}

function rankText(rank: Rank): string {
  return `var(--rank-${rank.toLowerCase()}-text)`;
}

function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

export function WrappedCard({ data }: { data: WrappedCardData }) {
  const rank = data.level != null ? rankForLevel(data.level) : null;
  const heroLines = data.watcherTypeLabel.split(" ");

  return (
    <div className="card-halftone relative h-[1920px] w-[1080px] overflow-hidden bg-paper text-ink">
      <div className="absolute top-[96px] left-[96px] rotate-[-2deg] border-[6px] border-ink bg-sun px-[40px] py-[14px] text-[40px] font-bold shadow-[9px_9px_0_var(--ink)]">
        {data.username}
      </div>
      <div className="absolute top-[108px] right-[96px] font-display text-[40px]">DailyArc</div>

      <div className="absolute top-[290px] left-[96px] origin-top-left rotate-[-3deg] font-display text-[168px] leading-[1.02] [text-shadow:8px_8px_0_var(--pink)]">
        {heroLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </div>

      <p className="absolute top-[690px] left-[96px] w-[860px] text-[40px] font-medium leading-[1.35]">
        {data.watcherLine}
      </p>

      <div className="absolute top-[850px] left-[96px] flex w-[888px] gap-[16px]">
        <StatBlock value={formatCount(data.hours)} label="Hours" />
        <StatBlock value={formatCount(data.episodes)} label="Episodes" />
        <StatBlock
          value={data.completionRate == null ? "-" : `${Math.round(data.completionRate * 100)}%`}
          label="Completed"
        />
      </div>

      <div className="absolute top-[1160px] left-[96px] w-[888px]">
        <div className="mb-[18px] text-[34px] font-bold text-ink-soft">Top genres</div>
        <div className="flex flex-wrap gap-[16px]">
          {data.topGenres.map((genre, index) => (
            <span
              key={genre}
              className="rounded-chip border-[6px] border-ink px-[36px] py-[12px] text-[40px] font-bold"
              style={{ background: GENRE_FILL[index % GENRE_FILL.length] }}
            >
              {genre}
            </span>
          ))}
        </div>
      </div>

      {data.hotTake ? <HotTakeBubble take={data.hotTake} /> : null}

      <footer className="absolute top-[1660px] right-[96px] left-[96px] flex items-center gap-[28px]">
        {rank && data.level != null ? (
          <>
            <div
              className="grid size-[150px] shrink-0 place-items-center rounded-badge border-[6px] border-ink font-display text-[100px] leading-none"
              style={{ background: rankFill(rank), color: rankText(rank) }}
            >
              {rank}
            </div>
            <div>
              <div className="font-display text-[76px] leading-[1.05]">Level {data.level}</div>
              <div className="text-[28px] font-bold text-ink-soft">
                {rank}-rank {data.watcherTypeLabel}
              </div>
            </div>
          </>
        ) : (
          <div className="text-[34px] font-bold text-ink-soft">Anime Wrapped for {data.username}</div>
        )}
      </footer>

      <div className="absolute right-[96px] bottom-[56px] text-[28px] font-bold text-ink-soft">domain.tld</div>
    </div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0 flex-1 border-[6px] border-ink bg-card py-[26px] pr-[12px] pl-[18px] shadow-[10px_10px_0_var(--ink)]">
      <b className="block font-display text-[64px] font-normal leading-[1.1] tracking-[-0.02em] whitespace-nowrap">
        {value}
      </b>
      <span className="mt-[10px] block text-[28px] font-bold text-ink-soft">{label}</span>
    </div>
  );
}

function HotTakeBubble({ take }: { take: HotTake }) {
  return (
    <div className="hot-take-bubble absolute top-[1380px] left-[96px] w-[888px] rounded-[36px] border-[6px] border-ink bg-card px-[40px] pt-[34px] pb-[38px] shadow-[10px_10px_0_var(--ink)]">
      <div className="mb-[10px] font-display text-[34px] text-pink">Hot take</div>
      <p className="text-[40px] font-bold leading-[1.3]">
        You gave {take.title} a {take.userScore}. Everyone else gave it {take.communityScore}.
      </p>
    </div>
  );
}
