import { WrappedCard, type WrappedCardData } from "./WrappedCard";

export function CardPreview({
  data,
  scale,
}: {
  data: WrappedCardData;
  /** If omitted, uses `--card-preview-scale` so the preview can change with the viewport. */
  scale?: number;
}) {
  const scaleCss = scale != null ? String(scale) : "var(--card-preview-scale, 0.3)";

  return (
    <div
      className="relative overflow-hidden border-2 border-ink shadow-panel"
      style={{
        width: `calc(1080px * ${scaleCss})`,
        height: `calc(1920px * ${scaleCss})`,
      }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: 1080, height: 1920, transform: `scale(${scaleCss})` }}
      >
        <WrappedCard data={data} />
      </div>
    </div>
  );
}
