import {
  ANILIST_OAUTH_COOKIE,
  ANILIST_OAUTH_MAX_AGE_SECONDS,
  anilistAuthorizeUrl,
  encodeOAuthCookie,
  getAniListOAuthEnv,
  safeAuthNext,
} from "@/lib/anilist-oauth";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { origin, searchParams } = new URL(request.url);
  const env = getAniListOAuthEnv();
  if (!env) {
    return NextResponse.redirect(new URL("/login?error=anilist", origin));
  }

  const state = crypto.randomUUID();
  const next = safeAuthNext(searchParams.get("next"));
  const authorize = NextResponse.redirect(anilistAuthorizeUrl(env, state));
  authorize.cookies.set(ANILIST_OAUTH_COOKIE, encodeOAuthCookie({ state, next }), {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https://"),
    path: "/",
    maxAge: ANILIST_OAUTH_MAX_AGE_SECONDS,
  });
  return authorize;
}
