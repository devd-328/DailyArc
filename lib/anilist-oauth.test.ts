import { describe, expect, it } from "vitest";
import {
  anilistAuthEmail,
  anilistAuthorizeUrl,
  authErrorMessage,
  displayAccountEmail,
  encodeOAuthCookie,
  parseAccessToken,
  parseAniListIdentity,
  parseOAuthCookie,
  parseViewer,
  refreshedAgoLabel,
  callbackRedirectUrl,
  canAdoptServerAniListUser,
  isSyntheticAniListEmail,
  safeAuthNext,
  safeCallbackNext,
  storedRefreshTimestamp,
  suggestedDailyArcUsername,
} from "./anilist-oauth";

describe("safeCallbackNext", () => {
  it("allows only the post-login paths and rejects host tricks", () => {
    expect(safeCallbackNext("/onboarding")).toBe("/onboarding");
    expect(safeCallbackNext("/quests")).toBe("/quests");
    expect(safeCallbackNext("/profile")).toBe("/profile");
    expect(safeCallbackNext("/\\evil.example")).toBe("/onboarding");
    expect(safeCallbackNext("//evil.example")).toBe("/onboarding");
    expect(safeCallbackNext("%2f%2fevil.example")).toBe("/onboarding");
    expect(safeCallbackNext("%5c%5cevil.example")).toBe("/onboarding");
    expect(safeCallbackNext("/onboarding\u0000")).toBe("/onboarding");
    expect(safeCallbackNext("/login")).toBe("/onboarding");
    expect(safeCallbackNext(null)).toBe("/onboarding");
  });

  it("keeps an allowed path on the request origin", () => {
    const url = callbackRedirectUrl("https://dailyarc.example", "/cards");
    expect(url.origin).toBe("https://dailyarc.example");
    expect(url.pathname).toBe("/cards");
    const blocked = callbackRedirectUrl("https://dailyarc.example", "/\\evil.example");
    expect(blocked.origin).toBe("https://dailyarc.example");
    expect(blocked.pathname).toBe("/onboarding");
  });
});

describe("AniList account guards", () => {
  it("rejects the synthetic mailbox and only adopts a server-marked user", () => {
    expect(isSyntheticAniListEmail("anilist.42@anilist.invalid")).toBe(true);
    expect(isSyntheticAniListEmail(" ANILIST.42@Anilist.Invalid ")).toBe(true);
    expect(isSyntheticAniListEmail("dev@example.com")).toBe(false);
    expect(canAdoptServerAniListUser({ provider_origin: "anilist" }, 42)).toBe(true);
    expect(canAdoptServerAniListUser({ anilist_user_id: 42 }, 42)).toBe(true);
    expect(canAdoptServerAniListUser({ anilist_user_id: 7 }, 42)).toBe(false);
    expect(canAdoptServerAniListUser({}, 42)).toBe(false);
    expect(canAdoptServerAniListUser(null, 42)).toBe(false);
  });

  it("prefers the app_metadata refresh clock and falls back to the old user value", () => {
    expect(storedRefreshTimestamp({ anilist_refreshed_at: "app" }, { anilist_refreshed_at: "user" })).toBe("app");
    expect(storedRefreshTimestamp({}, { anilist_refreshed_at: "user" })).toBe("user");
    expect(storedRefreshTimestamp({}, {})).toBeNull();
  });
});

describe("safeAuthNext", () => {
  it("allows signed-in app paths and defaults to onboarding", () => {
    expect(safeAuthNext("/profile")).toBe("/profile");
    expect(safeAuthNext("/cards")).toBe("/cards");
    expect(safeAuthNext("/login")).toBe("/onboarding");
    expect(safeAuthNext("https://evil.example")).toBe("/onboarding");
    expect(safeAuthNext("//evil")).toBe("/onboarding");
  });
});

describe("AniList identity helpers", () => {
  it("builds a non-mailable email and hides it in the profile", () => {
    expect(anilistAuthEmail(12345)).toBe("anilist.12345@anilist.invalid");
    expect(displayAccountEmail("anilist.12345@anilist.invalid")).toBe("none");
    expect(displayAccountEmail("dev@example.com")).toBe("dev@example.com");
    expect(displayAccountEmail(null)).toBe("none");
  });

  it("suggests an AniList name only when it is a valid DailyArc username", () => {
    expect(suggestedDailyArcUsername("dev_das")).toBe("dev_das");
    expect(suggestedDailyArcUsername("login")).toBeNull();
    expect(suggestedDailyArcUsername("dev-das")).toBeNull();
  });

  it("parses token, Viewer, and app_metadata payloads", () => {
    expect(parseAccessToken({ access_token: "tok" })).toBe("tok");
    expect(parseAccessToken({ access_token: "" })).toBeNull();
    expect(parseViewer({ data: { Viewer: { id: 9, name: "dev_das" } } })).toEqual({
      id: 9,
      name: "dev_das",
    });
    expect(parseViewer({ data: { Viewer: { id: "9", name: "dev_das" } } })).toBeNull();
    expect(parseAniListIdentity({ anilist_user_id: 9, anilist_username: "dev_das" })).toEqual({
      id: 9,
      name: "dev_das",
    });
    expect(parseAniListIdentity({ anilist_user_id: "9", anilist_username: "dev_das" })).toEqual({
      id: 9,
      name: "dev_das",
    });
  });

  it("round-trips the OAuth cookie and rejects a short state", () => {
    const encoded = encodeOAuthCookie({ state: "abcdefgh", next: "/profile" });
    expect(parseOAuthCookie(encoded)).toEqual({ state: "abcdefgh", next: "/profile" });
    expect(parseOAuthCookie("not-base64")).toBeNull();
  });

  it("builds the AniList authorize URL from the docs", () => {
    const url = new URL(
      anilistAuthorizeUrl(
        {
          clientId: "id-1",
          clientSecret: "secret",
          redirectUri: "http://localhost:3000/auth/anilist/callback",
        },
        "state-1",
      ),
    );
    expect(url.origin + url.pathname).toBe("https://anilist.co/api/v2/oauth/authorize");
    expect(url.searchParams.get("client_id")).toBe("id-1");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("state")).toBe("state-1");
    expect(url.searchParams.get("redirect_uri")).toBe("http://localhost:3000/auth/anilist/callback");
  });
});

describe("authErrorMessage", () => {
  it("maps AniList link failures to copy without em dashes", () => {
    expect(authErrorMessage("anilist-taken")).toBe("That AniList account is already linked to another user.");
    expect(authErrorMessage("anilist")).toBe("AniList sign-in didn't finish. Try again.");
    expect(authErrorMessage(null)).toBeNull();
  });
});

describe("refreshedAgoLabel", () => {
  it("uses minutes, hours and days", () => {
    const now = new Date("2026-10-08T12:00:00.000Z");
    expect(refreshedAgoLabel(now, now)).toBe("Card data updated just now.");
    expect(refreshedAgoLabel(new Date("2026-10-08T11:59:00.000Z"), now)).toBe("Card data updated 1 minute ago.");
    expect(refreshedAgoLabel(new Date("2026-10-08T10:00:00.000Z"), now)).toBe("Card data updated 2 hours ago.");
    expect(refreshedAgoLabel(new Date("2026-10-06T12:00:00.000Z"), now)).toBe("Card data updated 2 days ago.");
  });
});
