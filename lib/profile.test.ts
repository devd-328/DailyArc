import { describe, expect, it } from "vitest";
import { parsePublicProfile } from "./profile";

describe("parsePublicProfile", () => {
  it("derives rank from level and keeps AniList fields nullable", () => {
    expect(
      parsePublicProfile({
        username: "mira_k",
        anilist_username: null,
        level: 12,
        rank: "D",
        watcher_type: null,
      }),
    ).toEqual({
      username: "mira_k",
      anilistUsername: null,
      level: 12,
      rank: "D",
      watcherType: null,
    });
  });

  it("uses rankForLevel even if the view rank disagrees", () => {
    expect(
      parsePublicProfile({
        username: "dev_das",
        anilist_username: "dev_das",
        level: 27,
        rank: "E",
        watcher_type: "binge_demon",
      }),
    ).toMatchObject({ rank: "C", watcherType: "binge_demon", anilistUsername: "dev_das" });
  });

  it("accepts level sent as a decimal string", () => {
    expect(
      parsePublicProfile({
        username: "mira_k",
        anilist_username: null,
        level: "12",
        rank: "D",
        watcher_type: null,
      }),
    ).toMatchObject({ level: 12, rank: "D" });
  });

  it("rejects unknown watcher types and bad levels", () => {
    expect(
      parsePublicProfile({
        username: "dev_das",
        anilist_username: null,
        level: 27,
        rank: "C",
        watcher_type: "made_up",
      }),
    ).toBeNull();
    expect(
      parsePublicProfile({
        username: "dev_das",
        anilist_username: null,
        level: 0,
        rank: "E",
        watcher_type: null,
      }),
    ).toBeNull();
  });
});
