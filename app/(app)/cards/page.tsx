export default function CardsPage() {
  return (
    <>
      <h1 className="mb-[26px] font-display text-[32px]">Cards</h1>
      <div className="flex flex-col items-center">
        <div
          className="grid place-items-center rounded-card border-2 border-dashed border-ink-soft bg-card/60"
          style={{ width: 190, height: 338, transform: "rotate(-3deg)" }}
        >
          <span className="font-display text-[64px] text-ink-soft">?</span>
        </div>
        <h2 className="mt-[30px] text-center font-display text-[22px]">No card yet</h2>
        <p className="mx-auto mt-2 max-w-[270px] text-center text-[15px] font-medium leading-normal">
          Link your AniList account to build your card.
        </p>
        <button
          type="button"
          className="mt-[22px] flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-pink text-[15px] font-bold shadow-row"
        >
          Link AniList
        </button>
        <p className="mt-2 text-center text-[13px] font-medium text-ink-soft">
          Your quests and rank keep working without it.
        </p>
      </div>
    </>
  );
}
