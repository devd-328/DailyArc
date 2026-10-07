import { describe, expect, it } from "vitest";
import { classifyAniListError, mapAniListCollection, type AniListCollectionPayload } from "./anilist";

function payload(entries: AniListCollectionPayload["MediaListCollection"]): AniListCollectionPayload {
  return { MediaListCollection: entries };
}

describe("classifyAniListError", () => {
  it("maps user not found and private user messages", () => {
    expect(classifyAniListError(200, [{ message: "User not found" }])).toBe("USER_NOT_FOUND");
    expect(classifyAniListError(404, [])).toBe("USER_NOT_FOUND");
    expect(classifyAniListError(200, [{ message: "Private User" }])).toBe("PRIVATE_LIST");
    expect(classifyAniListError(403, [])).toBe("PRIVATE_LIST");
  });

  it("maps rate limits and server errors to UPSTREAM_BUSY", () => {
    expect(classifyAniListError(429, [])).toBe("UPSTREAM_BUSY");
    expect(classifyAniListError(503, [])).toBe("UPSTREAM_BUSY");
  });
});

describe("mapAniListCollection", () => {
  it("maps a list entry and treats score 0 as unscored", () => {
    const entries = mapAniListCollection(
      payload({
        lists: [
          {
            entries: [
              {
                status: "COMPLETED",
                score: 0,
                progress: 12,
                repeat: 1,
                startedAt: { year: 2020, month: 1, day: 2 },
                completedAt: { year: 2020, month: 2, day: 3 },
                updatedAt: 1_700_000_000,
                media: {
                  id: 1,
                  title: { romaji: "Sample Title A", english: null, native: null },
                  format: "TV",
                  episodes: 12,
                  duration: 24,
                  genres: ["Action", null],
                  season: "FALL",
                  seasonYear: 2019,
                  startDate: { year: 2019, month: 10, day: 1 },
                  averageScore: 72,
                  studios: { nodes: [{ name: "Sample Studio" }, { name: null }] },
                },
              },
            ],
          },
        ],
      }),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0]?.score).toBeNull();
    expect(entries[0]?.progress).toBe(12);
    expect(entries[0]?.media.genres).toEqual(["Action"]);
    expect(entries[0]?.media.studios).toEqual([{ name: "Sample Studio" }]);
    expect(entries[0]?.media.season).toBe("FALL");
  });

  it("keeps one row per media id, preferring completed over planning", () => {
    const entries = mapAniListCollection(
      payload({
        lists: [
          {
            entries: [
              {
                status: "PLANNING",
                score: 0,
                progress: 0,
                repeat: 0,
                media: { id: 7, title: { romaji: "Sample Title A" }, genres: [] },
              },
            ],
          },
          {
            entries: [
              {
                status: "COMPLETED",
                score: 80,
                progress: 13,
                repeat: 0,
                media: { id: 7, title: { romaji: "Sample Title A" }, genres: ["Drama"] },
              },
            ],
          },
        ],
      }),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0]?.status).toBe("COMPLETED");
    expect(entries[0]?.progress).toBe(13);
  });

  it("skips unknown statuses and missing media", () => {
    const entries = mapAniListCollection(
      payload({
        lists: [
          {
            entries: [
              { status: "UNKNOWN", media: { id: 1, title: { romaji: "X" }, genres: [] } },
              { status: "COMPLETED", media: null },
            ],
          },
        ],
      }),
    );
    expect(entries).toHaveLength(0);
  });
});
