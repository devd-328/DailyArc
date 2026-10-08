"use client";

import { quests as questConfig, STATS, type Stat } from "@/lib/config";
import { STAT_LABELS } from "@/lib/config";
import type { Cadence } from "@/lib/types";
import { useState, type FormEvent } from "react";

export function NewQuestSheet({
  used,
  onClose,
  onSaved,
}: {
  used: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [stat, setStat] = useState<Stat>("discipline");
  const [xp, setXp] = useState<(typeof questConfig.allowedXpValues)[number]>(20);
  const [cadence, setCadence] = useState<Cadence>("daily");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name the quest.");
      return;
    }
    setBusy(true);
    setError(null);
    const response = await fetch("/api/quests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed, stat, xp_value: xp, cadence }),
    });
    setBusy(false);
    if (!response.ok) {
      setError(response.status === 409 ? "8 quests already. Retire one first." : "Could not save. Try again.");
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center lg:items-center lg:p-6">
      <button type="button" className="absolute inset-0 bg-[var(--dim)]" aria-label="Close" onClick={onClose} />
      <form
        onSubmit={(event) => void save(event)}
        className="sheet-panel relative z-10 w-full max-w-lg overflow-y-auto rounded-t-card border-2 border-b-0 border-ink bg-card px-5 pt-[18px] lg:rounded-card lg:border-b-2 lg:shadow-panel"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-[22px]">New quest</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-btn border-2 border-ink bg-card text-base font-bold shadow-row"
            aria-label="Close"
          >
            x
          </button>
        </div>
        <label htmlFor="quest-name" className="mb-1.5 block text-sm font-bold">
          Quest name
        </label>
        <input
          id="quest-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-[52px] w-full rounded-input border-2 border-ink bg-card px-3.5 text-base font-bold"
        />
        <fieldset className="mt-4">
          <legend className="mb-1.5 text-sm font-bold">Trains</legend>
          <div className="flex flex-wrap gap-2">
            {STATS.map((item) => (
              <label
                key={item}
                className={`inline-flex min-h-11 cursor-pointer items-center rounded-chip border-2 border-ink px-3.5 text-sm font-bold ${
                  stat === item ? "bg-pink shadow-row" : "bg-card"
                }`}
              >
                <input
                  type="radio"
                  name="stat"
                  value={item}
                  checked={stat === item}
                  onChange={() => setStat(item)}
                  className="sr-only"
                />
                {STAT_LABELS[item]}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-4">
          <legend className="mb-1.5 text-sm font-bold">XP</legend>
          <div className="grid grid-cols-3 gap-2">
            {questConfig.allowedXpValues.map((value) => (
              <label
                key={value}
                className={`flex min-h-11 cursor-pointer items-center justify-center rounded-chip border-2 border-ink text-sm font-bold ${
                  xp === value ? "bg-sun shadow-row" : "bg-card"
                }`}
              >
                <input
                  type="radio"
                  name="xp"
                  value={value}
                  checked={xp === value}
                  onChange={() => setXp(value)}
                  className="sr-only"
                />
                {value} XP
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-4">
          <legend className="mb-1.5 text-sm font-bold">Repeats</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["daily", "weekly"] as const).map((value) => (
              <label
                key={value}
                className={`flex min-h-11 cursor-pointer items-center justify-center rounded-chip border-2 border-ink text-sm font-bold ${
                  cadence === value ? "bg-pink shadow-row" : "bg-card"
                }`}
              >
                <input
                  type="radio"
                  name="cadence"
                  value={value}
                  checked={cadence === value}
                  onChange={() => setCadence(value)}
                  className="sr-only"
                />
                {value === "daily" ? "Daily" : "Weekly"}
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="submit"
          disabled={busy}
          className="mt-5 flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-pink text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed disabled:opacity-60"
        >
          Save quest
        </button>
        <p className="mt-2 text-center text-[13px] font-medium text-ink-soft">
          {used + 1} of {questConfig.maxActive} quests used after saving
        </p>
        {error ? (
          <p className="mt-2 text-center text-[13px] font-medium" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
