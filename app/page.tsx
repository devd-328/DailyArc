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
          <div className="mx-auto w-full min-w-0 max-w-[390px] md:max-w-md lg:mx-0 lg:max-w-xl">
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
              <p className="relative mt-3 max-w-[280px] text-base font-medium leading-normal md:max-w-xs">
                Public AniList name in, shareable card out. No account for that part.
              </p>
            </div>

            <UsernameForm />

            <ol className="mt-4 flex flex-col gap-2 text-[13px] font-medium leading-normal text-ink-soft">
              <li>
                <b className="font-bold text-ink">1.</b> Make a card if you have AniList. Skip it if you do not.
              </li>
              <li>
                <b className="font-bold text-ink">2.</b> Sign up. Add a starter quest in one tap.
              </li>
              <li>
                <b className="font-bold text-ink">3.</b> Check in daily. XP, rank, roast if you ghost.
              </li>
            </ol>

            <Suspense>
              <LevelUpPanel />
            </Suspense>
          </div>

          <div className="landing-card-peek" aria-hidden="true">
            <div className="landing-card-tilt">
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
        <div className="font-display text-[19px] leading-[1.2]">No AniList? Still play.</div>
        <div className="mt-0.5 text-sm font-medium">Daily quests, XP and a rank. Card is extra.</div>
      </div>
      <Link
        href="/login"
        className="flex min-h-11 shrink-0 items-center justify-center rounded-btn border-2 border-ink bg-pink px-3.5 text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
      >
        Start quests
      </Link>
    </div>
  );
}
