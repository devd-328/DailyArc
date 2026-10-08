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
  safeAuthNext,
  suggestedDailyArcUsername,
} from "./anilist-oauth";

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
