export function XpChart({ points, label }: { points: { label: string; xp: number }[]; label: string }) {
  const width = 300;
  const height = 72;
  const max = Math.max(1, ...points.map((point) => point.xp));
  const coords = points.map((point, index) => {
    const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
    const y = height - 4 - (point.xp / max) * (height - 8);
    return { x, y };
  });
  const line = coords.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-20 w-full" role="img" aria-label={label}>
        <polygon points={area} className="fill-teal/25" />
        <polyline points={line} fill="none" className="stroke-teal" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="mt-1 flex justify-between text-[13px] font-bold text-ink-soft">
        {points.map((point, index) => (
          <span key={`${point.label}-${index}`}>{point.label}</span>
        ))}
      </div>
      <ul className="sr-only">
        {points.map((point, index) => (
          <li key={`${point.label}-${index}`}>
            {point.label}: {point.xp} XP
          </li>
        ))}
      </ul>
    </div>
  );
}
