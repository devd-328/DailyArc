import { CardPreview } from "@/components/CardPreview";
import { SiteHeader, SiteHeaderFallback } from "@/components/SiteHeader";
import { UsernameForm } from "@/components/UsernameForm";
import { LANDING_CARD_PREVIEW } from "@/components/WrappedCard";
import { isSignedIn } from "@/lib/supabase/session";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="halftone relative min-h-dvh overflow-x-clip">
      <div className="page-gutter mx-auto w-full max-w-6xl">
        <Suspense fallback={<SiteHeaderFallback />}>
          <SiteHeader />
        </Suspense>

        <div className="mt-2 grid grid-cols-1 items-start gap-8 lg:mt-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="mx-auto w-full max-w-[390px] md:max-w-md lg:mx-0 lg:max-w-xl">
            <div className="relative">
              <h1 className="relative font-display text-[2.5rem] leading-[1.05] min-[380px]:text-5xl">
                Find your
                <br />
                <em className="not-italic text-pink [text-shadow:3px_3px_0_var(--ink)]">anime</em> type.
              </h1>
              <span
                className="font-sfx pointer-events-none absolute top-16 right-0 rotate-[8deg] text-4xl text-pink min-[380px]:top-[4.75rem] min-[380px]:text-5xl"
                aria-hidden="true"
              >
                ドン
              </span>
              <p className="relative mt-3 max-w-[240px] text-base font-medium leading-normal md:max-w-xs">
                Enter any public AniList username. Get a card you can share.
              </p>
            </div>

            <UsernameForm />

            <Suspense>
              <LevelUpPanel />
            </Suspense>
          </div>

          <div className="landing-card-peek" aria-hidden="true">
            <div className="rotate-[4deg]">
              <CardPreview data={LANDING_CARD_PREVIEW} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

async function LevelUpPanel() {
  if (await isSignedIn()) return null;
  return (
    <div className="relative mt-[22px] flex items-center gap-3 rounded-card border-2 border-ink bg-card px-3.5 py-3 shadow-row">
      <div className="min-w-0 flex-1">
        <div className="font-display text-[19px] leading-[1.2]">Then level up for real</div>
        <div className="mt-0.5 text-sm font-medium">Quests, XP and a rank on your card.</div>
      </div>
      <Link
        href="/login"
        className="flex min-h-11 shrink-0 items-center justify-center rounded-btn border-2 border-ink bg-card px-3.5 text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
      >
        Sign up
      </Link>
    </div>
  );
}
