"use client";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

const EMAIL_HINT = "No password. We send you a link.";
const EMAIL_SENT = "Check your email for a sign-in link.";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") ? "Sign in didn't finish. Try again." : null,
  );
  const [busy, setBusy] = useState<"google" | "email" | null>(null);

  async function signInGoogle() {
    if (busy) return;
    setBusy("google");
    setError(null);
    setMessage(null);
    const supabase = createClient();
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    if (oauthError || !data.url) {
      setError("Google sign-in didn't start.");
      setBusy(null);
      return;
    }
    window.location.assign(data.url);
  }

  async function sendLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy("email");
    setError(null);
    setMessage(null);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    if (otpError) {
      setError("We couldn't send the link.");
      setBusy(null);
      return;
    }
    setMessage(EMAIL_SENT);
    setBusy(null);
  }

  return (
    <div className="mt-5 flex flex-col">
      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-btn border-2 border-ink bg-pink text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
        >
          <ProviderGlyph letter="A" />
          Continue with AniList
        </button>
        <button
          type="button"
          disabled={busy != null}
          onClick={() => void signInGoogle()}
          className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-btn border-2 border-ink bg-card text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed disabled:opacity-60"
        >
          <ProviderGlyph letter="G" />
          Continue with Google
        </button>
      </div>
      <p className="mt-2.5 text-[13px] font-medium text-ink-soft">
        AniList also links your card to your account.
      </p>

      <div className="my-[18px] flex items-center gap-3 text-sm font-bold text-ink-soft">
        <span className="h-0.5 flex-1 bg-paper-2" />
        or
        <span className="h-0.5 flex-1 bg-paper-2" />
      </div>

      <form onSubmit={(event) => void sendLink(event)}>
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-bold">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError(null);
          }}
          placeholder="you@example.com"
          className="h-[52px] w-full rounded-input border-2 border-ink bg-card px-3.5 text-base font-bold text-ink placeholder:font-medium placeholder:text-ink-soft"
        />
        <button
          type="submit"
          disabled={busy != null}
          className="mt-3 flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-card text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed disabled:opacity-60"
        >
          Email me a sign-in link
        </button>
        {error ? (
          <p className="mt-2 text-[13px] font-medium" role="alert">
            {error}
          </p>
        ) : (
          <p className="mt-2 text-[13px] font-medium text-ink-soft">{message ?? EMAIL_HINT}</p>
        )}
      </form>
    </div>
  );
}

function ProviderGlyph({ letter }: { letter: string }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-[22px] place-items-center rounded-badge border-2 border-ink bg-card font-display text-[12px] leading-none"
    >
      {letter}
    </span>
  );
}
