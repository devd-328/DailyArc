import { CardPreview } from "@/components/CardPreview";
import { SiteHeader, SiteHeaderFallback } from "@/components/SiteHeader";
import { WrappedActions } from "@/components/WrappedActions";
import { CONFIG_VERSION } from "@/lib/config";
import { isValidUsername } from "@/lib/username";
import { utcDay, WRAPPED_ERROR_COPY } from "@/lib/wrapped";
import { loadWrapped } from "@/app/wrapped/load-wrapped";
import { isSignedIn } from "@/lib/supabase/session";
import { io } from "next/cache";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export async function generateMetadata({
  params,
}: PageProps<"/wrapped/[username]">): Promise<Metadata> {
  const { username } = await params;
  if (!isValidUsername(username)) return { title: "DailyArc" };
  const title = `${username} · DailyArc`;
  const image = `/api/card/${username}?format=story`;
  return {
    title,
    openGraph: {
      title,
      images: [{ url: image, width: 1080, height: 1920 }],
    },
  };
}

export default function WrappedPage({ params }: PageProps<"/wrapped/[username]">) {
  return (
    <main className="halftone relative min-h-dvh overflow-x-clip">
      <div className="page-gutter mx-auto w-full max-w-6xl">
        <Suspense fallback={<SiteHeaderFallback />}>
          <SiteHeader />
        </Suspense>
        <Suspense fallback={<WrappedFallback />}>
          <WrappedBody params={params} />
        </Suspense>
      </div>
    </main>
  );
}

async function WrappedBody({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  if (!isValidUsername(username)) {
    return <WrappedMessage code="INVALID_USERNAME" />;
  }

  await io();
  const result = await loadWrapped(username, utcDay(new Date()), CONFIG_VERSION);
  if (!result.ok) return <WrappedMessage code={result.code} />;

  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col items-center md:max-w-md lg:max-w-xl">
      <div className="wrapped-result-card flex justify-center">
        <CardPreview data={result.card} />
      </div>
      {!result.enoughData ? (
        <p className="mt-3 text-center text-[13px] font-medium text-ink-soft">
          Not enough data. Type defaults to Wanderer.
        </p>
      ) : null}
      <WrappedActions username={result.username} />
      {!(await isSignedIn()) ? (
        <div className="mt-4 flex w-full items-center gap-3 rounded-card border-2 border-ink bg-card px-3.5 py-3 shadow-row">
          <div className="min-w-0 flex-1">
            <div className="font-display text-[19px] leading-[1.2]">Add your rank to this card</div>
            <div className="mt-0.5 text-sm font-medium">Sign up and start quests.</div>
          </div>
          <Link
            href="/login"
            className="flex min-h-11 shrink-0 items-center justify-center rounded-btn border-2 border-ink bg-pink px-3.5 text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
          >
            Sign up
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function WrappedMessage({ code }: { code: keyof typeof WRAPPED_ERROR_COPY }) {
  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col gap-4 md:max-w-md">
      <p className="font-display text-[22px] leading-[1.2]">{WRAPPED_ERROR_COPY[code]}</p>
      <Link
        href="/"
        className="flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-pink text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
      >
        Make my card
      </Link>
    </div>
  );
}

function WrappedFallback() {
  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col items-center md:max-w-md">
      <div
        className="wrapped-result-card rounded-card border-2 border-dashed border-ink-soft bg-card/60"
        style={{ width: "calc(1080px * var(--card-preview-scale, 0.26))", height: "calc(1920px * var(--card-preview-scale, 0.26))" }}
      />
    </div>
  );
}
