import { RankBadge } from "@/components/RankBadge";
import { XpBar } from "@/components/XpBar";
import { STAT_LABELS, type Stat } from "@/lib/config";
import { xpToNext } from "@/lib/xp";

const SAMPLE_LEVEL = 12;
const SAMPLE_INTO = 180;

const SAMPLE_QUESTS: { name: string; stat: Stat; xp: number; done: boolean }[] = [
  { name: "Watch one episode", stat: "discipline", xp: 20, done: true },
  { name: "Read 10 pages", stat: "intelligence", xp: 20, done: false },
  { name: "20 minute walk", stat: "vitality", xp: 10, done: false },
];

export function QuestDemo() {
  const toNext = xpToNext(SAMPLE_LEVEL);

  return (
    <section className="rounded-card border-2 border-ink bg-card p-4 shadow-panel" aria-label="Sample day">
      <p className="text-[13px] font-bold text-ink-soft">A sample day</p>
      <div className="mt-3 flex items-center gap-4">
        <RankBadge rank="D" size={60} />
        <div className="min-w-0 flex-1">
          <div className="font-display text-[28px] leading-tight">Level {SAMPLE_LEVEL}</div>
          <div className="mt-2">
            <XpBar intoLevel={SAMPLE_INTO} toNext={toNext} />
          </div>
          <p className="mt-1.5 text-[13px] font-medium text-ink-soft">
            {SAMPLE_INTO.toLocaleString("en-US")} of {toNext.toLocaleString("en-US")} XP to level {SAMPLE_LEVEL + 1}
          </p>
        </div>
      </div>
      <ul className="mt-4 flex flex-col gap-2.5">
        {SAMPLE_QUESTS.map((quest) => (
          <li key={quest.name}>
            <div className="flex min-h-[66px] items-center gap-3 rounded-card border-2 border-ink bg-card px-3 py-2.5 shadow-row">
              <span
                aria-hidden="true"
                className={`grid size-7 shrink-0 place-items-center border-2 border-ink ${quest.done ? "bg-teal" : "bg-card"}`}
              >
                {quest.done ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8.5l3.2 3.2L13 4.8"
                      stroke="var(--card)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
              <div className="min-w-0 flex-1">
                <div className={`text-base font-bold leading-tight ${quest.done ? "text-ink-soft line-through" : ""}`}>
                  {quest.name}
                </div>
                <div className="mt-1.5">
                  <span className="rounded-chip bg-paper-2 px-2.5 py-0.5 text-[13px] font-bold">
                    {STAT_LABELS[quest.stat]}
                  </span>
                </div>
              </div>
              <span className="shrink-0 rounded-chip border-2 border-ink bg-sun px-2.5 py-px text-[13px] font-bold">
                +{quest.xp} XP
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
