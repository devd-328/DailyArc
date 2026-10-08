import { HowItWorks } from "@/components/HowItWorks";
import { LoginForm } from "@/components/LoginForm";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <main className="halftone relative min-h-dvh overflow-x-clip">
      <div className="page-gutter mx-auto w-full max-w-6xl">
        <header className="relative mb-[18px] flex items-center justify-between">
          <Link href="/" className="font-display text-xl">
            DailyArc
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-chip border-2 border-ink bg-card px-3.5 text-sm font-bold"
          >
            Back
          </Link>
        </header>
        <Suspense>
          <LoginBody />
        </Suspense>
      </div>
    </main>
  );
}

async function LoginBody() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/onboarding");

  return (
    <div className="mx-auto grid w-full max-w-[390px] gap-6 md:max-w-md lg:max-w-4xl lg:grid-cols-2 lg:items-start lg:gap-10">
      <div>
        <h1 className="font-display text-[32px] leading-[1.1]">Sign in or sign up</h1>
        <p className="mt-3 text-[15px] font-medium leading-normal">
          One account for quests, XP and a rank. AniList is optional. It only unlocks the shareable card.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
      <HowItWorks />
    </div>
  );
}
