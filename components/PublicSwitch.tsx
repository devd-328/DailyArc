"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PublicSwitch({ isPublic }: { isPublic: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(isPublic);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    const next = !on;
    setOn(next);
    setBusy(true);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_public: next }),
    });
    setBusy(false);
    if (!response.ok) setOn(!next);
    else router.refresh();
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Public profile"
      disabled={busy}
      onClick={() => void toggle()}
      className={`relative h-[30px] w-[54px] rounded-chip border-2 border-ink ${on ? "bg-teal" : "bg-paper-2"}`}
    >
      <span
        className={`absolute top-px size-[22px] rounded-chip border-2 border-ink bg-card transition-[left] ${
          on ? "left-[26px]" : "left-px"
        }`}
      />
    </button>
  );
}
