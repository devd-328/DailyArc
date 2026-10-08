import { HowItWorks } from "@/components/HowItWorks";
import { OnboardingForm } from "@/components/OnboardingForm";
import { parseAniListIdentity, suggestedDailyArcUsername } from "@/lib/anilist-oauth";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const identity = parseAniListIdentity(auth.user?.app_metadata);
  const defaultUsername = identity ? suggestedDailyArcUsername(identity.name) : null;

  return (
    <div className="mx-auto grid w-full max-w-[390px] gap-6 md:max-w-md lg:max-w-4xl lg:grid-cols-2 lg:items-start lg:gap-10">
      <div>
        <h1 className="font-display text-[32px] leading-[1.1]">Pick a username</h1>
        <p className="mt-3 text-[15px] font-medium leading-normal">
          This is your public name. Next screen: tap Add on a starter quest and check it off.
        </p>
        <OnboardingForm
          userId={user.id}
          defaultUsername={defaultUsername ?? ""}
          hasAniList={identity != null}
        />
      </div>
      <HowItWorks />
    </div>
  );
}
