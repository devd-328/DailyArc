import { galleryAvatarPath } from "./avatar";

export type AccountProfile = {
  anilistUsername: string | null;
};

/** Narrow store so deletion order can be tested without Supabase. */
export type AccountAdmin = {
  readProfile(userId: string): Promise<AccountProfile | null>;
  removeAvatar(path: string): Promise<void>;
  deleteAuthUser(userId: string): Promise<void>;
};

/**
 * Deletes the signed-in account.
 * Avatar first, then the auth user. Profile, quests, check-ins, stats,
 * proof rows, and reservations cascade from auth.users.
 * The gallery object is removed even for a preset face, in case an older upload is still public.
 */
export async function deleteOwnedAccount(admin: AccountAdmin, userId: string): Promise<AccountProfile> {
  const profile = await admin.readProfile(userId);
  await admin.removeAvatar(galleryAvatarPath(userId));
  await admin.deleteAuthUser(userId);
  return { anilistUsername: profile?.anilistUsername ?? null };
}

/** Browser deletes send Origin. A missing or foreign Origin is rejected. */
export function isSameOrigin(requestOrigin: string, originHeader: string | null): boolean {
  return originHeader === requestOrigin;
}
