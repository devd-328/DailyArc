import { isSignedIn } from "@/lib/supabase/session";
import Link from "next/link";

export async function SiteHeader() {
  const signedIn = await isSignedIn();
  return <SiteHeaderBar signedIn={signedIn} />;
}

export function SiteHeaderFallback() {
  return (
    <header className="relative mb-[18px] flex items-center justify-between">
      <Link href="/" className="font-display text-xl">
        DailyArc
      </Link>
      <div className="min-h-11 min-w-[5.5rem]" />
    </header>
  );
}

function SiteHeaderBar({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="relative mb-[18px] flex items-center justify-between">
      <Link href="/" className="font-display text-xl">
        DailyArc
      </Link>
      {signedIn ? (
        <Link
          href="/quests"
          className="inline-flex min-h-11 items-center rounded-chip border-2 border-ink bg-card px-3.5 text-sm font-bold"
        >
          Quests
        </Link>
      ) : (
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center rounded-chip border-2 border-ink bg-card px-3.5 text-sm font-bold"
        >
          Sign in
        </Link>
      )}
    </header>
  );
}
