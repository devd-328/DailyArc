import { OnboardingForm } from "@/components/OnboardingForm";
import { getProfile } from "@/lib/profile";
import { requireUser } from "@/lib/supabase/session";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const instant = false;

export default function OnboardingPage() {
  return (
    <main className="halftone relative min-h-dvh overflow-x-clip">
      <div className="page-gutter mx-auto w-full max-w-6xl">
        <header className="relative mb-[18px] flex items-center justify-between">
          <Link href="/" className="font-display text-xl">
            DailyArc
          </Link>
        </header>
        <Suspense>
          <OnboardingBody />
        </Suspense>
      </div>
    </main>
  );
}

async function OnboardingBody() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (profile) redirect("/quests");

  return (
    <div className="mx-auto w-full max-w-[390px] md:max-w-md">
      <h1 className="font-display text-[32px] leading-[1.1]">Pick a username</h1>
      <p className="mt-3 text-[15px] font-medium leading-normal">
        This is your public name. You can use quests without linking AniList.
      </p>
      <OnboardingForm userId={user.id} />
    </div>
  );
}
