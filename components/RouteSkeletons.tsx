function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-card border-2 border-ink bg-paper-2 shadow-row ${className}`} />;
}

export function QuestsSkeleton() {
  return (
    <div className="app-split" aria-busy="true">
      <p className="sr-only">Loading quests</p>
      <div className="min-w-0">
        <Bone className="h-[108px]" />
        <div className="mt-[18px] grid grid-cols-3 gap-2">
          <Bone className="h-[92px]" />
          <Bone className="h-[92px]" />
          <Bone className="h-[92px]" />
        </div>
        <Bone className="mt-[18px] h-40" />
        <div className="mt-[18px] grid grid-cols-2 gap-2.5">
          <Bone className="h-[104px]" />
          <Bone className="h-[104px]" />
        </div>
        <div className="mt-[22px] flex flex-col gap-2.5">
          <Bone className="h-[66px]" />
          <Bone className="h-[66px]" />
          <Bone className="h-[66px]" />
        </div>
      </div>
      <div className="app-rail">
        <Bone className="h-48" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="app-split" aria-busy="true">
      <p className="sr-only">Loading stats</p>
      <div className="min-w-0">
        <Bone className="h-8 w-32" />
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Bone className="h-11 rounded-chip" />
          <Bone className="h-11 rounded-chip" />
          <Bone className="h-11 rounded-chip" />
        </div>
        <Bone className="mt-4 h-52" />
        <Bone className="mt-[18px] h-64" />
        <Bone className="mt-[18px] h-[84px]" />
      </div>
      <div className="app-rail">
        <Bone className="h-40" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div aria-busy="true">
      <p className="sr-only">Loading</p>
      <Bone className="h-8 w-40" />
      <Bone className="mt-4 h-24" />
      <Bone className="mt-3 h-14" />
      <Bone className="mt-3 h-14" />
      <Bone className="mt-3 h-14" />
    </div>
  );
}
