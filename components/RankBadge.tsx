import type { Rank } from "@/lib/config";

const SIZE = {
  60: "size-[60px] border-2 text-[38px]",
  64: "size-[64px] border-2 text-[40px]",
  76: "size-[76px] border-2 text-[48px]",
  176: "size-[176px] border-[3px] text-[120px]",
} as const;

export function RankBadge({ rank, size }: { rank: Rank; size: 60 | 64 | 76 | 176 }) {
  return (
    <div
      className={`grid shrink-0 place-items-center border-ink font-display leading-none ${SIZE[size]} ${
        rank === "S" ? "rank-starburst" : "rounded-badge"
      }`}
      style={{
        background: `var(--rank-${rank.toLowerCase()})`,
        color: `var(--rank-${rank.toLowerCase()}-text)`,
      }}
    >
      {rank}
    </div>
  );
}
