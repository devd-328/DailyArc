"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefreshCardButton({
  className = "flex min-h-11 items-center rounded-btn border-2 border-ink bg-card px-3.5 text-sm font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed disabled:opacity-60",
  wide = false,
}: {
  className?: string;
  wide?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    const response = await fetch("/api/profile/refresh-card", { method: "POST" });
    setBusy(false);
    if (response.status === 429) {
      setMessage("Wait a few minutes before refreshing.");
      return;
    }
    if (!response.ok) {
      setMessage("Could not refresh. Try again.");
      return;
    }
    router.refresh();
  }

  return (
    <div className={wide ? "w-full" : undefined}>
      <button type="button" disabled={busy} onClick={() => void refresh()} className={className}>
        Refresh
      </button>
      {message ? (
        <p className="mt-1.5 text-[13px] font-medium" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
