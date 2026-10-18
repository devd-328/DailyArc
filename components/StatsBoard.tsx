"use client";

import { RankBadge } from "@/components/RankBadge";
import { XpChart } from "@/components/XpChart";
import type { Rank, Stat } from "@/lib/config";
import { STAT_LABELS } from "@/lib/config";
import { changePercent, type XpRange } from "@/lib/xp-series";
import { useState } from "react";

const RANGES = ["week", "month", "season"] as const;
type RangeKey = (typeof RANGES)[number];

const RANGE_COPY: Record<RangeKey, { label: string; caption: string; against: string }> = {
  week: { label: "Week", caption: "XP this week", against: "last week" },
  month: { label: "Month", caption: "XP this month", against: "last month" },
  season: { label: "Season", caption: "XP this season", against: "last season" },
};

const BAR: Record<Stat, string> = {
  discipline: "bg-sun",
  strength: "bg-teal",
  intelligence: "bg-pink",
  vitality: "bg-rank-c",
  charisma: "bg-rank-a",
};

export type StatBar = {
  stat: Stat;
  level: number;
  xp: number;
  percent: number;
  top: boolean;
};

function changeCopy(change: number | null, against: string): string | null {
  if (change === null) return null;
  if (change === 0) return `Same as ${against}`;
  if (change > 0) return `+${change}% vs ${against}`;
  return `${Math.abs(change)}% less than ${against}`;
}

export function StatsBoard({
  rank,
  nextLabel,
  rows,
  ranges,
}: {
  rank: Rank;
  nextLabel: string;
  rows: StatBar[];
  ranges: Record<RangeKey, XpRange>;
}) {
  const [range, setRange] = useState<RangeKey>("month");
  const current = ranges[range];
  const copy = RANGE_COPY[range];
  const delta = changePercent(current.total, current.previous);
  const change = changeCopy(delta, copy.against);

  return (
    <div className="min-w-0">
      <h1 className="font-display text-[32px]">Stats</h1>
      <p className="mt-1 text-[15px] font-medium text-ink-soft">How your stats are growing</p>

      <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="XP range">
        {RANGES.map((key) => {
          const selected = key === range;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={selected}
              onClick={() => setRange(key)}
              className={`flex min-h-11 items-center justify-center rounded-chip border-2 border-ink text-sm font-bold ${
                selected ? "bg-pink shadow-row" : "bg-card"
              }`}
            >
              {RANGE_COPY[key].label}
            </button>
          );
        })}
      </div>

      <section className="mt-4 rounded-card border-2 border-ink bg-card px-3.5 py-4 shadow-panel">
        <div className="font-display text-[48px] leading-none">{current.total.toLocaleString("en-US")}</div>
        <div className="mt-1 text-[13px] font-bold text-ink-soft">{copy.caption}</div>
        {change ? (
          <div
            className={`mt-2 inline-flex rounded-chip border-2 border-ink px-2 py-0.5 text-[13px] font-bold ${
              delta !== null && delta > 0 ? "bg-teal" : "bg-paper-2"
            }`}
          >
            {change}
          </div>
        ) : null}
        <div className="mt-3">
          <XpChart points={current.points} label={copy.caption} />
        </div>
      </section>

      <section className="mt-[18px] rounded-card border-2 border-ink bg-card px-3.5 py-4 shadow-panel">
        <h2 className="font-display text-[22px]">Stat breakdown</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.stat}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[15px] font-bold">
                  {STAT_LABELS[row.stat]}
                  {row.top ? (
                    <span className="ml-1.5 rounded-chip border-2 border-ink bg-sun px-2 py-px text-[13px] font-bold">
                      Top
                    </span>
                  ) : null}
                </span>
                <small className="text-[13px] font-bold text-ink-soft">
                  Lv {row.level}
                  <span className="ml-2">{row.xp.toLocaleString("en-US")} XP</span>
                </small>
              </div>
              <div className="mt-1 h-3.5 border-2 border-ink bg-paper">
                {row.percent > 0 ? <i className={`block h-full ${BAR[row.stat]}`} style={{ width: `${row.percent}%` }} /> : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-[18px] flex items-center gap-3 rounded-card border-2 border-ink bg-card px-4 py-3 shadow-row">
        <RankBadge rank={rank} size={60} />
        <div>
          <div className="text-[13px] font-bold text-ink-soft">Next rank</div>
          <div className="text-[15px] font-bold">{nextLabel}</div>
        </div>
      </section>
    </div>
  );
}
