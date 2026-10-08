import type { CoachTone } from "@/lib/coach";

export function CoachLine({
  line,
  tone,
  label = "Today's roast",
}: {
  line: string;
  tone: CoachTone;
  label?: string;
}) {
  const fill = tone === "win" ? "bg-teal" : "bg-pink";

  return (
    <p
      className={`rounded-card border-2 border-ink px-4 py-3.5 text-[15px] font-bold leading-snug shadow-row ${fill}`}
      role="status"
    >
      <span className="mb-1 block font-display text-[19px] leading-none">{label}</span>
      {line}
    </p>
  );
}
