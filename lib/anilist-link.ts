import { revalidateTag } from "next/cache";
import { fetchAniListAnimeList } from "./anilist";
import {
  anilistAuthEmail,
  parseAniListIdentity,
  type AniListViewer,
} from "./anilist-oauth";
import { cache, CONFIG_VERSION, type WatcherType } from "./config";
import { computeStats } from "./stats";
import { createAdminClient } from "./supabase/admin";
import { pickWatcherType } from "./watcherType";
import { utcDay } from "./wrapped";

export type LinkAniListResult = "ok" | "missing" | "taken" | "bound";

function sameAniListId(stored: unknown, viewerId: number): boolean {
  return String(stored) === String(viewerId);
}

export async function setAniListAppMetadata(userId: string, viewer: AniListViewer): Promise<void> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(userId);
  const existing = data.user?.app_metadata ?? {};
  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...existing,
      anilist_user_id: viewer.id,
      anilist_username: viewer.name,
    },
  });
  if (error) throw error;
}

export async function findProfileIdByAniList(anilistUserId: number): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("anilist_user_id", anilistUserId)
    .maybeSingle();
  return typeof data?.id === "string" ? data.id : null;
}

export async function findOrCreateAniListAuthUser(viewer: AniListViewer): Promise<string> {
  const admin = createAdminClient();
  const email = anilistAuthEmail(viewer.id);
  const created = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    app_metadata: {
      anilist_user_id: viewer.id,
      anilist_username: viewer.name,
    },
  });
  if (created.data.user) return created.data.user.id;

  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data.user) throw error ?? new Error("anilist user lookup failed");
  await setAniListAppMetadata(data.user.id, viewer);
  return data.user.id;
}

export async function writeAniListToProfile(userId: string, viewer: AniListViewer): Promise<LinkAniListResult> {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, anilist_user_id")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return "missing";
  if (profile.anilist_user_id != null && !sameAniListId(profile.anilist_user_id, viewer.id)) {
    return "bound";
  }
  const takenBy = await findProfileIdByAniList(viewer.id);
  if (takenBy && takenBy !== userId) return "taken";

  const { error } = await admin
    .from("profiles")
    .update({
      anilist_user_id: viewer.id,
      anilist_username: viewer.name,
    })
    .eq("id", userId);
  if (error?.code === "23505") return "taken";
  if (error) throw error;
  return "ok";
}

export async function applyPendingAniListIdentity(userId: string): Promise<LinkAniListResult> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(userId);
  const viewer = parseAniListIdentity(data.user?.app_metadata);
  if (!viewer) return "missing";
  return writeAniListToProfile(userId, viewer);
}

export async function refreshLinkedCard(
  userId: string,
  options: { ignoreCooldown?: boolean } = {},
): Promise<
  | { ok: true; watcherType: WatcherType | null; refreshedAt: string }
  | { ok: false; error: "not-linked" | "cooldown" | "busy" }
> {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("anilist_username")
    .eq("id", userId)
    .maybeSingle();
  if (!profile?.anilist_username || typeof profile.anilist_username !== "string") {
    return { ok: false, error: "not-linked" };
  }

  const { data: authData } = await admin.auth.admin.getUserById(userId);
  const last = authData.user?.user_metadata
    ? (authData.user.user_metadata as Record<string, unknown>).anilist_refreshed_at
    : null;
  if (!options.ignoreCooldown && typeof last === "string") {
    const elapsed = (Date.now() - Date.parse(last)) / 1000;
    if (Number.isFinite(elapsed) && elapsed < cache.refreshCooldownSeconds) {
      return { ok: false, error: "cooldown" };
    }
  }

  let watcherType: WatcherType | null = null;
  const fetched = await fetchAniListAnimeList(profile.anilist_username);
  if (!fetched.ok) {
    if (fetched.code === "UPSTREAM_BUSY") return { ok: false, error: "busy" };
  } else if (fetched.entries.length > 0) {
    watcherType = pickWatcherType(computeStats(fetched.entries, new Date())).type;
    const { error } = await admin.from("profiles").update({ watcher_type: watcherType }).eq("id", userId);
    if (error) throw error;
  }

  const refreshedAt = new Date().toISOString();
  const { error: metaError } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...(authData.user?.user_metadata ?? {}),
      anilist_refreshed_at: refreshedAt,
    },
  });
  if (metaError) throw metaError;

  revalidateTag(`wrapped:${profile.anilist_username}:${utcDay()}:${CONFIG_VERSION}`, { expire: 0 });
  return { ok: true, watcherType, refreshedAt };
}

export async function issueSessionForUserId(
  createSession: (tokenHash: string) => Promise<boolean>,
  userId: string,
): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(userId);
  const email = data.user?.email;
  if (!email) return false;
  const { data: link, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = link?.properties?.hashed_token;
  if (error || !tokenHash) return false;
  return createSession(tokenHash);
}
