import { AvatarEditor } from "@/components/AvatarEditor";
import { CopyButton } from "@/components/CopyButton";
import { PublicSwitch } from "@/components/PublicSwitch";
import { RankBadge } from "@/components/RankBadge";
import { RefreshCardButton } from "@/components/RefreshCardButton";
import { authErrorMessage, displayAccountEmail, refreshedAgoLabel, storedRefreshTimestamp } from "@/lib/anilist-oauth";
import { resolveAvatar } from "@/lib/avatar";
import { progressFromProfile, requireProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { getSupabasePublicEnv } from "@/lib/supabase/public-env";
import { requireUser } from "@/lib/supabase/session";
import { watcherTypeLabel } from "@/lib/watcherType";
import { connection } from "next/server";
import { Suspense } from "react";

export default function ProfilePage({ searchParams }: PageProps<"/profile">) {
  return (
    <Suspense>
      <ProfileBody searchParams={searchParams} />
    </Suspense>
  );
}

async function ProfileBody({ searchParams }: { searchParams: PageProps<"/profile">["searchParams"] }) {
  const user = await requireUser();
  const profile = await requireProfile(user.id);
  const progress = progressFromProfile(profile);
  const typeLabel = watcherTypeLabel(profile.watcher_type);
  const avatar = resolveAvatar(profile.avatar_type, profile.avatar_url);
  const params = await searchParams;
  const linkError = authErrorMessage(typeof params.error === "string" ? params.error : null);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const refreshedRaw = storedRefreshTimestamp(auth.user?.app_metadata, auth.user?.user_metadata);
  await connection();
  const refreshedAt = typeof refreshedRaw === "string" ? new Date(refreshedRaw) : null;
  const refreshedLabel =
    profile.anilist_username && refreshedAt && !Number.isNaN(refreshedAt.getTime())
      ? refreshedAgoLabel(refreshedAt, new Date())
      : null;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="mb-3 font-display text-[32px]">Profile</h1>
      {linkError ? (
        <p className="mb-3 text-[13px] font-medium" role="alert">
          {linkError}
        </p>
      ) : null}
      <section className="flex items-center gap-3.5 rounded-card border-2 border-ink bg-card px-3.5 py-3 shadow-panel">
        <AvatarEditor
          userId={profile.id}
          avatarType={avatar.type}
          avatarUrl={avatar.url}
          supabaseUrl={getSupabasePublicEnv().url}
        />
        <RankBadge rank={progress.rank} size={60} />
        <div className="min-w-0 flex-1">
          <div className="text-lg font-bold">{profile.username}</div>
          <div className="text-sm font-medium text-ink-soft">
            Level {progress.level}, {typeLabel ?? "no watcher type yet"}
          </div>
          <div className="mt-0.5 text-[13px] font-bold">Best streak: {profile.longest_streak} days</div>
        </div>
      </section>

      <h2 className="mt-3 mb-1.5 text-sm font-bold text-ink-soft">AniList</h2>
      {profile.anilist_username ? (
        <>
          <div className="rounded-card border-2 border-ink bg-card shadow-row">
            <div className="flex min-h-12 items-center justify-between gap-2 px-3">
              <div className="min-w-0">
                <span className="text-[15px] font-bold">{profile.anilist_username}</span>
                <span className="ml-2 rounded-chip border-2 border-ink bg-teal px-2 py-0.5 text-[13px] font-bold">
                  Linked
                </span>
              </div>
              <RefreshCardButton />
            </div>
          </div>
          {refreshedLabel ? (
            <p className="mt-1.5 text-[13px] font-medium text-ink-soft">{refreshedLabel}</p>
          ) : null}
        </>
      ) : (
        <>
          <div className="rounded-card border-2 border-ink bg-card shadow-row">
            <div className="flex min-h-12 items-center px-3">
              <span className="text-[15px] font-bold">Not linked</span>
              <span className="ml-2 rounded-chip bg-paper-2 px-2 py-0.5 text-[13px] font-bold">Off</span>
            </div>
          </div>
          <a
            href="/auth/anilist?next=/profile"
            className="mt-2.5 flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-pink text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
          >
            Link AniList
          </a>
          <p className="mt-1.5 text-[13px] font-medium text-ink-soft">Link it to get your card and watcher type.</p>
        </>
      )}

      <h2 className="mt-3 mb-1.5 text-sm font-bold text-ink-soft">Public page</h2>
      <div className="rounded-card border-2 border-ink bg-card shadow-row">
        <div className="flex min-h-12 items-center justify-between px-3">
          <span className="text-[15px] font-bold">Public profile</span>
          <PublicSwitch isPublic={profile.is_public} />
        </div>
        <div className="flex min-h-12 items-center justify-between border-t-2 border-paper-2 px-3">
          <small className="text-sm font-medium text-ink-soft">domain.tld/u/{profile.username}</small>
          <CopyButton text={`domain.tld/u/${profile.username}`} />
        </div>
      </div>

      <h2 className="mt-3 mb-1.5 text-sm font-bold text-ink-soft">Settings</h2>
      <div className="rounded-card border-2 border-ink bg-card shadow-row">
        <div className="flex min-h-12 items-center justify-between px-3">
          <span className="text-[15px] font-bold">Timezone</span>
          <small className="text-sm font-medium text-ink-soft">{profile.timezone}</small>
        </div>
        <div className="flex min-h-12 items-center justify-between border-t-2 border-paper-2 px-3">
          <span className="text-[15px] font-bold">Email</span>
          <small className="text-sm font-medium text-ink-soft">{displayAccountEmail(user.email)}</small>
        </div>
      </div>

      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="mt-4 flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-card text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
        >
          Sign out
        </button>
      </form>
      <p className="mt-3 text-center text-sm font-bold text-danger">Delete account and data</p>
    </div>
  );
}
