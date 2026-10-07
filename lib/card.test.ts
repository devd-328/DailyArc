import { describe, expect, it } from "vitest";
import { cache } from "./config";
import {
  CARD_SIZE,
  cardCacheControl,
  cardDownloadName,
  completionLabel,
  formatCardCount,
  parseCardFormat,
} from "./card";

describe("parseCardFormat", () => {
  it("defaults a missing query to story", () => {
    expect(parseCardFormat(null)).toBe("story");
    expect(parseCardFormat("")).toBe("story");
  });

  it("accepts story and square", () => {
    expect(parseCardFormat("story")).toBe("story");
    expect(parseCardFormat("square")).toBe("square");
  });

  it("rejects anything else", () => {
    expect(parseCardFormat("og")).toBeNull();
    expect(parseCardFormat("STORY")).toBeNull();
  });
});

describe("card sizes", () => {
  it("matches DESIGN_SYSTEM.md", () => {
    expect(CARD_SIZE.story).toEqual({ width: 1080, height: 1920 });
    expect(CARD_SIZE.square).toEqual({ width: 1080, height: 1080 });
  });
});

describe("cardCacheControl", () => {
  it("uses the long TTL when there is no profile", () => {
    expect(cardCacheControl(false)).toBe(
      `public, max-age=${cache.cardWithoutProfileTtlSeconds}, s-maxage=${cache.cardWithoutProfileTtlSeconds}`,
    );
  });

  it("uses the short TTL when there is a profile", () => {
    expect(cardCacheControl(true)).toBe(
      `public, max-age=${cache.cardWithProfileTtlSeconds}, s-maxage=${cache.cardWithProfileTtlSeconds}`,
    );
  });
});

describe("card download helpers", () => {
  it("names the file from the username and format", () => {
    expect(cardDownloadName("matchai", "story")).toBe("matchai-story.png");
  });

  it("formats counts the same way the HTML card does", () => {
    expect(formatCardCount(1264)).toBe("1,264");
    expect(completionLabel(0.78)).toBe("78%");
    expect(completionLabel(null)).toBe("-");
  });
});
