import { coachLine, coachTone, type CoachInput } from "@/lib/coach";

export function CoachLine(input: CoachInput) {
  const tone = coachTone(input);
  const line = coachLine(input);
  const fill =
    tone === "roast" ? "bg-pink" : tone === "win" ? "bg-teal" : tone === "empty" ? "bg-sun" : "bg-card";

  return (
    <p
      className={`rounded-card border-2 border-ink px-3.5 py-3 text-[15px] font-bold leading-snug shadow-row ${fill}`}
      role="status"
    >
      {line}
    </p>
  );
}
