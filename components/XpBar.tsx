export function XpBar({ intoLevel, toNext }: { intoLevel: number; toNext: number }) {
  const percent = toNext <= 0 ? 100 : Math.min(100, Math.max(0, (intoLevel / toNext) * 100));
  return (
    <div className="h-3.5 border-2 border-ink bg-paper">
      {percent > 0 ? <i className="xp-fill" style={{ width: `${percent}%` }} /> : null}
    </div>
  );
}
