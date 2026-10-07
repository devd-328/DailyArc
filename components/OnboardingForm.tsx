"use client";

import { createClient } from "@/lib/supabase/client";
import { isDailyArcUsername } from "@/lib/username";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function OnboardingForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const name = username.trim();
    if (!isDailyArcUsername(name)) {
      setError("Letters, digits and underscore, 2 to 20 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const supabase = createClient();
    const { error: insertError } = await supabase.from("profiles").insert({
      id: userId,
      username: name,
      timezone,
    });
    if (insertError) {
      setBusy(false);
      if (insertError.code === "23505") {
        setError("That name is taken.");
        return;
      }
      setError("Could not save. Try again.");
      return;
    }
    router.replace("/quests");
    router.refresh();
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="mt-5">
      <label htmlFor="onboarding-username" className="mb-1.5 block text-sm font-bold">
        Username
      </label>
      <input
        id="onboarding-username"
        name="username"
        required
        autoComplete="username"
        value={username}
        onChange={(event) => {
          setUsername(event.target.value);
          if (error) setError(null);
        }}
        className="h-[52px] w-full rounded-input border-2 border-ink bg-card px-3.5 text-base font-bold text-ink placeholder:font-medium placeholder:text-ink-soft"
      />
      <p className="mt-2 text-[13px] font-medium text-ink-soft">
        Letters, digits and underscore, 2 to 20 characters. Timezone is set from this device.
      </p>
      <button
        type="submit"
        disabled={busy}
        className="mt-4 flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-pink text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed disabled:opacity-60"
      >
        Start quests
      </button>
      {error ? (
        <p className="mt-2 text-[13px] font-medium" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
