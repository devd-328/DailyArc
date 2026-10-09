"use client";

import { useScrollLock } from "@/lib/use-scroll-lock";
import { useState } from "react";

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const response = await fetch("/api/profile", { method: "DELETE" });
    if (!response.ok) {
      setBusy(false);
      setError("Could not delete the account. Try again.");
      return;
    }
    window.location.assign("/");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="mt-3 block w-full text-center text-sm font-bold text-danger"
      >
        Delete account and data
      </button>
      {open ? (
        <ConfirmDelete
          busy={busy}
          error={error}
          onClose={() => {
            if (busy) return;
            setOpen(false);
          }}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}
    </>
  );
}

function ConfirmDelete({
  busy,
  error,
  onClose,
  onConfirm,
}: {
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  useScrollLock();
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center overflow-hidden overscroll-none lg:items-center lg:p-6">
      <button type="button" className="absolute inset-0 bg-[var(--dim)]" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        className="sheet-panel relative z-10 w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-card border-2 border-b-0 border-ink bg-card px-5 pb-6 pt-[18px] lg:rounded-card lg:border-b-2 lg:shadow-panel"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 id="delete-account-title" className="font-display text-[22px]">
            Delete account
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="grid size-11 place-items-center rounded-btn border-2 border-ink bg-card text-base font-bold shadow-row disabled:opacity-60"
            aria-label="Close"
          >
            x
          </button>
        </div>
        <p className="text-[15px] font-medium">
          This deletes your profile, quests, stats, and avatar. You cannot undo it.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className="mt-4 flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-danger text-[15px] font-bold text-card shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed disabled:opacity-60"
        >
          {busy ? "Deleting..." : "Delete account"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="mt-2.5 flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-card text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed disabled:opacity-60"
        >
          Cancel
        </button>
        {error ? (
          <p className="mt-2 text-center text-[13px] font-medium" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
