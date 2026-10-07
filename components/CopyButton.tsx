"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="flex min-h-11 items-center rounded-btn border-2 border-ink bg-card px-3.5 text-sm font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
