import { loadWrapped } from "@/app/wrapped/load-wrapped";
import { CardPreview } from "@/components/CardPreview";
import { MakeCardPanel } from "@/components/MakeCardPanel";
import { RankBadge } from "@/components/RankBadge";
import { SiteHeader, SiteHeaderFallback } from "@/components/SiteHeader";
import { CONFIG_VERSION } from "@/lib/config";
import { getPublicProfile } from "@/lib/profile";
import { isReservedUsername, isValidUsername } from "@/lib/username";
import { watcherTypeLabel } from "@/lib/watcherType";
import { utcDay, type WrappedCardData } from "@/lib/wrapped";
import { io } from "next/cache";
import type { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata({
  params,
}: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  if (!isValidUsername(username) || isReservedUsername(username)) return { title: "DailyArc" };
  const title = `${username} · DailyArc`;
  const profile = await getPublicProfile(username);
  const imageUser = profile?.anilistUsername;
  return {
    title,
    openGraph: {
      title,
      images: imageUser ? [{ url: `/api/card/${imageUser}?format=story`, width: 1080, height: 1920 }] : undefined,
    },
  };
}

export default function PublicProfilePage({ params }: PageProps<"/u/[username]">) {
  return (
    <main className="halftone relative min-h-dvh overflow-x-clip">
      <div className="page-gutter mx-auto w-full max-w-[390px] md:max-w-md">
        <Suspense fallback={<SiteHeaderFallback />}>
          <SiteHeader />
        </Suspense>
        <Suspense>
          <PublicProfileBody params={params} />
        </Suspense>
      </div>
    </main>
  );
}

async function PublicProfileBody({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  if (!isValidUsername(username) || isReservedUsername(username)) return <MakeCardPanel />;

  const profile = await getPublicProfile(username);
  if (!profile) return <MakeCardPanel />;

  let card: WrappedCardData | null = null;
  if (profile.anilistUsername) {
    await io();
    const wrapped = await loadWrapped(profile.anilistUsername, utcDay(new Date()), CONFIG_VERSION);
    if (wrapped.ok) {
      card = {
        ...wrapped.card,
        username: profile.username,
        level: profile.level,
      };
    }
  }

  const typeLabel = profile.anilistUsername
    ? (watcherTypeLabel(profile.watcherType) ?? card?.watcherTypeLabel ?? null)
    : null;

  return (
    <>
      <div className="-rotate-2 mb-3.5 inline-block border-2 border-ink bg-sun px-3.5 py-1.5 text-[15px] font-bold shadow-row">
        {profile.username}
      </div>
      <div className="flex items-center gap-3.5">
        <RankBadge rank={profile.rank} size={64} />
        <div className="font-display text-[32px] leading-[1.05]">
          {profile.rank}-rank
          {typeLabel ? (
            <>
              <br />
              {typeLabel}
            </>
          ) : null}
        </div>
      </div>
      <div className="mt-2 mb-3.5 text-sm font-bold text-ink-soft">Level {profile.level}</div>
      {card ? (
        <div className="public-profile-card flex justify-center">
          <CardPreview data={card} scale={0.23} />
        </div>
      ) : null}
      <MakeCardPanel />
    </>
  );
}
