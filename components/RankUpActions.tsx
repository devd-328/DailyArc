"use client";

import Link from "next/link";
import { useState } from "react";

export function RankUpActions({ sharePath }: { sharePath: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}${sharePath}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-[30px] flex w-full flex-col gap-3">
      <Link
        href="/quests"
        className="flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-pink text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
      >
        Keep going
      </Link>
      <button
        type="button"
        onClick={() => void share()}
        className="flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-card text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
      >
        {copied ? "Copied" : "Share my rank"}
      </button>
    </div>
  );
}
