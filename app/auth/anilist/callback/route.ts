import {
  applyPendingAniListIdentity,
  findOrCreateAniListAuthUser,
  findProfileIdByAniList,
  issueSessionForUserId,
  refreshLinkedCard,
  setAniListAppMetadata,
  writeAniListToProfile,
} from "@/lib/anilist-link";
import {
  ANILIST_OAUTH_COOKIE,
  exchangeAniListCode,
  fetchAniListViewer,
  getAniListOAuthEnv,
  parseOAuthCookie,
} from "@/lib/anilist-oauth";
import { createRouteClient } from "@/lib/supabase/route";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const stored = parseOAuthCookie(request.cookies.get(ANILIST_OAUTH_COOKIE)?.value);
  const next = stored?.next ?? "/onboarding";
  const clear = (response: NextResponse) => {
    response.cookies.set(ANILIST_OAUTH_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  };

  const fail = (code: string) => {
    const path = next === "/onboarding" ? "/login" : next;
    return clear(NextResponse.redirect(new URL(`${path}?error=${code}`, origin)));
  };

  if (searchParams.get("error")) return fail("anilist");
  const env = getAniListOAuthEnv();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!env || !code || !stored || !state || state !== stored.state) return fail("anilist");

  const accessToken = await exchangeAniListCode(env, code);
  if (!accessToken) return fail("anilist");
  const viewer = await fetchAniListViewer(accessToken);
  if (!viewer) return fail("anilist");

  try {
    const success = clear(NextResponse.redirect(new URL(next, origin)));
    const supabase = createRouteClient(request, success);
    const { data } = await supabase.auth.getClaims();
    const signedInId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;

    if (signedInId) {
      await setAniListAppMetadata(signedInId, viewer);
      const linked = await writeAniListToProfile(signedInId, viewer);
      if (linked === "taken") return fail("anilist-taken");
      if (linked === "bound") return fail("anilist-bound");
      if (linked === "ok") await refreshLinkedCard(signedInId, { ignoreCooldown: true });
      return success;
    }

    const existingProfileId = await findProfileIdByAniList(viewer.id);
    const userId = existingProfileId ?? (await findOrCreateAniListAuthUser(viewer));
    await setAniListAppMetadata(userId, viewer);

    const issued = await issueSessionForUserId(async (tokenHash) => {
      const { error } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
      if (!error) return true;
      const retry = await supabase.auth.verifyOtp({ type: "email", token_hash: tokenHash });
      return !retry.error;
    }, userId);
    if (!issued) return fail("anilist");

    const linked = await applyPendingAniListIdentity(userId);
    if (linked === "taken") return fail("anilist-taken");
    if (linked === "ok") await refreshLinkedCard(userId, { ignoreCooldown: true });
    return success;
  } catch {
    return fail("anilist");
  }
}
