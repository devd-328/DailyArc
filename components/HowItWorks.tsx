const STEPS = [
  {
    n: "1",
    title: "Add a quest",
    body: "Tap Add on a starter, or write your own. One tap is enough.",
  },
  {
    n: "2",
    title: "Check in when you do it",
    body: "Tap the box and snap a live photo. It is checked and deleted. You get XP.",
  },
  {
    n: "3",
    title: "Come back tomorrow",
    body: "Streaks pay extra XP. Rank letters get louder as the bar fills.",
  },
] as const;

export function HowItWorks({ compact = false }: { compact?: boolean }) {
  return (
    <section className="rounded-card border-2 border-ink bg-card p-4 shadow-panel">
      <h2 className={`font-display ${compact ? "text-[19px]" : "text-[22px]"}`}>How this works</h2>
      <ol className={compact ? "mt-3 flex flex-col gap-3" : "mt-3.5 flex flex-col gap-3.5"}>
        {STEPS.map((step) => (
          <li key={step.n} className="flex gap-3">
            <span
              aria-hidden="true"
              className="grid size-7 shrink-0 place-items-center rounded-badge border-2 border-ink bg-sun text-[13px] font-bold"
            >
              {step.n}
            </span>
            <div className="min-w-0">
              <div className="text-[15px] font-bold leading-tight">{step.title}</div>
              <p className="mt-0.5 text-[13px] font-medium leading-normal text-ink-soft">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[13px] font-medium text-ink-soft">
        AniList is optional. It unlocks the shareable anime card. Quests, XP and rank work without it.
      </p>
    </section>
  );
}
