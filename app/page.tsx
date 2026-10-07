// Temporary placeholder. It only proves that tokens, fonts and Tailwind are wired up.
// The real landing screen is specified in brain/DESIGN_SYSTEM.md (Screen references).
export default function Home() {
  return (
    <main className="halftone mx-auto flex min-h-dvh max-w-[390px] flex-col justify-center gap-4 px-5">
      <h1 className="relative font-display text-5xl leading-[1.05]">DailyArc</h1>
      <p className="relative text-base font-medium">Project is set up. The card comes next.</p>
      <button
        type="button"
        className="relative min-h-12 w-fit rounded-btn border-2 border-ink bg-pink px-4 text-[15px] font-bold shadow-row active:translate-x-0.5 active:translate-y-0.5 active:shadow-pressed"
      >
        Make my card
      </button>
      <span className="font-sfx absolute right-8 top-24 rotate-[8deg] text-5xl text-pink" aria-hidden="true">
        ドン
      </span>
    </main>
  );
}
