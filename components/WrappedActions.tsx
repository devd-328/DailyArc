"use client";

import { useState } from "react";
import { cardDownloadName, type CardFormat } from "@/lib/card";

export function WrappedActions({
  username,
  copyPath,
}: {
  username: string;
  copyPath?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<CardFormat | null>(null);

  async function copyLink() {
    const url = `${window.location.origin}${copyPath ?? `/wrapped/${username}`}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function save(format: CardFormat) {
    if (busy) return;
    setBusy(format);
    try {
      const res = await fetch(`/api/card/${encodeURIComponent(username)}?format=${format}`);
      if (!res.ok) return;
      const blob = await res.blob();
      if (!blob.type.includes("png")) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = cardDownloadName(username, format);
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-[22px] flex w-full flex-col gap-3">
      <button
        type="button"
        disabled={busy != null}
        aria-busy={busy === "story" ? true : undefined}
        onClick={() => void save("story")}
        className="flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-pink text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed disabled:opacity-60"
      >
        Save for story
      </button>
      <div className="flex gap-3">
        <button
          type="button"
          disabled={busy != null}
          aria-busy={busy === "square" ? true : undefined}
          onClick={() => void save("square")}
          className="flex min-h-12 flex-1 items-center justify-center rounded-btn border-2 border-ink bg-card text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed disabled:opacity-60"
        >
          Save square
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="flex min-h-12 flex-1 items-center justify-center rounded-btn border-2 border-ink bg-card text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
