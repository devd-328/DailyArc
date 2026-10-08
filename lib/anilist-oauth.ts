import { ANILIST_GRAPHQL_URL } from "./anilist";
import { isDailyArcUsername } from "./username";

export const ANILIST_AUTHORIZE_URL = "https://anilist.co/api/v2/oauth/authorize";
export const ANILIST_TOKEN_URL = "https://anilist.co/api/v2/oauth/token";
export const ANILIST_AUTH_EMAIL_DOMAIN = "anilist.invalid";
export const ANILIST_OAUTH_COOKIE = "da_anilist_oauth";
export const ANILIST_OAUTH_MAX_AGE_SECONDS = 600;

export const ANILIST_VIEWER_QUERY = `query {
  Viewer {
    id
    name
  }
}`;

const AUTH_NEXT_PATHS = new Set(["/onboarding", "/quests", "/stats", "/cards", "/profile"]);

export type AniListOAuthEnv = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type AniListOAuthCookie = {
  state: string;
  next: string;
};

export type AniListViewer = {
  id: number;
  name: string;
};

export function getAniListOAuthEnv(): AniListOAuthEnv | null {
  const clientId = process.env.ANILIST_CLIENT_ID;
  const clientSecret = process.env.ANILIST_CLIENT_SECRET;
  const redirectUri = process.env.ANILIST_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, clientSecret, redirectUri };
}

export function safeAuthNext(value: string | null | undefined): string {
  if (!value || !AUTH_NEXT_PATHS.has(value)) return "/onboarding";
  return value;
}

export function anilistAuthEmail(anilistUserId: number): string {
  return `anilist.${anilistUserId}@${ANILIST_AUTH_EMAIL_DOMAIN}`;
}

export function displayAccountEmail(email: string | null): string {
  if (!email || email.endsWith(`@${ANILIST_AUTH_EMAIL_DOMAIN}`)) return "none";
  return email;
}

export function suggestedDailyArcUsername(anilistName: string): string | null {
  return isDailyArcUsername(anilistName) ? anilistName : null;
}

export function encodeOAuthCookie(value: AniListOAuthCookie): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

export function parseOAuthCookie(raw: string | undefined): AniListOAuthCookie | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as Record<string, unknown>;
    if (typeof record.state !== "string" || record.state.length < 8) return null;
    return { state: record.state, next: safeAuthNext(typeof record.next === "string" ? record.next : null) };
  } catch {
    return null;
  }
}

export function anilistAuthorizeUrl(env: AniListOAuthEnv, state: string): string {
  const url = new URL(ANILIST_AUTHORIZE_URL);
  url.searchParams.set("client_id", env.clientId);
  url.searchParams.set("redirect_uri", env.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  return url.toString();
}

export function parseAccessToken(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const token = (json as Record<string, unknown>).access_token;
  return typeof token === "string" && token.length > 0 ? token : null;
}

export function parseViewer(json: unknown): AniListViewer | null {
  if (!json || typeof json !== "object") return null;
  const data = (json as Record<string, unknown>).data;
  if (!data || typeof data !== "object") return null;
  const viewer = (data as Record<string, unknown>).Viewer;
  if (!viewer || typeof viewer !== "object") return null;
  const record = viewer as Record<string, unknown>;
  const id = record.id;
  const name = record.name;
  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) return null;
  if (typeof name !== "string" || name.length === 0) return null;
  return { id, name };
}

export function parseAniListIdentity(metadata: unknown): AniListViewer | null {
  if (!metadata || typeof metadata !== "object") return null;
  const record = metadata as Record<string, unknown>;
  const rawId = record.anilist_user_id;
  const id = typeof rawId === "number" ? rawId : typeof rawId === "string" && /^\d+$/.test(rawId) ? Number(rawId) : null;
  const name = record.anilist_username;
  if (id == null || !Number.isInteger(id) || id <= 0) return null;
  if (typeof name !== "string" || name.length === 0) return null;
  return { id, name };
}

export function authErrorMessage(code: string | null): string | null {
  if (!code) return null;
  if (code === "anilist-taken") return "That AniList account is already linked to another user.";
  if (code === "anilist-bound") return "This account already has a different AniList link.";
  if (code === "anilist") return "AniList sign-in didn't finish. Try again.";
  if (code === "1") return "Sign in didn't finish. Try again.";
  return "Sign in didn't finish. Try again.";
}

export function refreshedAgoLabel(from: Date, now: Date): string {
  const minutes = Math.max(0, Math.round((now.getTime() - from.getTime()) / 60_000));
  if (minutes < 1) return "Card data updated just now.";
  if (minutes === 1) return "Card data updated 1 minute ago.";
  if (minutes < 60) return `Card data updated ${minutes} minutes ago.`;
  const hours = Math.round(minutes / 60);
  if (hours === 1) return "Card data updated 1 hour ago.";
  if (hours < 48) return `Card data updated ${hours} hours ago.`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Card data updated 1 day ago.";
  return `Card data updated ${days} days ago.`;
}

export async function exchangeAniListCode(env: AniListOAuthEnv, code: string): Promise<string | null> {
  const response = await fetch(ANILIST_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: env.clientId,
      client_secret: env.clientSecret,
      redirect_uri: env.redirectUri,
      code,
    }),
  });
  if (!response.ok) return null;
  try {
    return parseAccessToken(await response.json());
  } catch {
    return null;
  }
}

export async function fetchAniListViewer(accessToken: string): Promise<AniListViewer | null> {
  const response = await fetch(ANILIST_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query: ANILIST_VIEWER_QUERY }),
  });
  if (!response.ok) return null;
  try {
    return parseViewer(await response.json());
  } catch {
    return null;
  }
}
