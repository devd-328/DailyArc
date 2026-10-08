import type { CSSProperties } from "react";
import { WrappedCard, type WrappedCardData } from "./WrappedCard";

export function CardPreview({
  data,
  scale,
}: {
  data: WrappedCardData;
  /** If omitted, uses `--card-preview-scale` so the preview can change with the viewport. */
  scale?: number;
}) {
  return (
    <div
      className="card-preview border-2 border-ink shadow-panel"
      style={scale != null ? ({ "--card-preview-scale": String(scale) } as CSSProperties) : undefined}
    >
      <div className="card-preview-stage">
        <WrappedCard data={data} />
      </div>
    </div>
  );
}
