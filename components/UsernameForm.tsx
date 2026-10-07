"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { isValidUsername } from "@/lib/username";

const USERNAME_RULE = "Usernames are letters, digits and underscore, 2 to 20 characters.";

export function UsernameForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const username = value.trim();
    if (!isValidUsername(username)) {
      setError(USERNAME_RULE);
      return;
    }
    setError(null);
    router.push(`/wrapped/${username}`);
  }

  return (
    <form className="relative mt-5 w-full" onSubmit={onSubmit}>
      <label htmlFor="anilist-username" className="mb-1.5 block text-sm font-bold">
        AniList username
      </label>
      <input
        id="anilist-username"
        name="username"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          if (error) setError(null);
        }}
        placeholder="dev_das"
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={20}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "username-error" : "username-hint"}
        className="h-[52px] w-full rounded-input border-2 border-ink bg-card px-3.5 text-base font-bold text-ink placeholder:font-medium placeholder:text-ink-soft"
      />
      <button
        type="submit"
        className="mt-3 flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-pink text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
      >
        Make my card
      </button>
      {error ? (
        <p id="username-error" role="alert" className="mt-2 text-[13px] font-medium">
          {error}
        </p>
      ) : (
        <p id="username-hint" className="mt-2 text-[13px] font-medium text-ink-soft">
          No account needed for the card.
        </p>
      )}
    </form>
  );
}
