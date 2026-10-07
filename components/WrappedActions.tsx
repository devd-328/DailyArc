"use client";

import { useState } from "react";

export function WrappedActions({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}/wrapped/${username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-[22px] flex w-full flex-col gap-3">
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-pink text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
      >
        Save for story
      </button>
      <div className="flex gap-3">
        <button
          type="button"
          className="flex min-h-12 flex-1 items-center justify-center rounded-btn border-2 border-ink bg-card text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
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
