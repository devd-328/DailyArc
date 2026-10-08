import { describe, expect, it } from "vitest";
import {
  avatarImageSrc,
  galleryAvatarPath,
  isPresetAvatarPath,
  presetAvatarPath,
  presetAvatarPaths,
  resolveAvatar,
} from "./avatar";

describe("preset avatars", () => {
  it("lists 12 choosable faces", () => {
    expect(presetAvatarPaths()).toHaveLength(12);
    expect(presetAvatarPaths()[0]).toBe("/avatars/avatar-01.svg");
    expect(presetAvatarPaths()[11]).toBe("/avatars/avatar-12.svg");
  });

  it("rejects an index outside the set", () => {
    expect(() => presetAvatarPath(0)).toThrow("invalid avatar");
    expect(() => presetAvatarPath(13)).toThrow("invalid avatar");
  });

  it("accepts only the preset paths", () => {
    expect(isPresetAvatarPath("/avatars/avatar-07.svg")).toBe(true);
    expect(isPresetAvatarPath("/avatars/avatar-13.svg")).toBe(false);
    expect(isPresetAvatarPath("https://example.com/a.png")).toBe(false);
  });
});

describe("gallery avatars", () => {
  it("keeps one file path per user", () => {
    expect(galleryAvatarPath("abc")).toBe("abc/avatar.jpg");
  });

  it("builds a public storage url for an uploaded face", () => {
    expect(avatarImageSrc("gallery", "abc/avatar.jpg", "https://db.example")).toBe(
      "https://db.example/storage/v1/object/public/avatars/abc/avatar.jpg",
    );
  });

  it("falls back to the first preset when the saved face is missing", () => {
    expect(resolveAvatar(null, null)).toEqual({ type: "preset", url: "/avatars/avatar-01.svg" });
    expect(resolveAvatar("gallery", "user/avatar.jpg").type).toBe("gallery");
  });

  it("uses the preset path as the image src", () => {
    expect(avatarImageSrc("preset", "/avatars/avatar-02.svg", "https://db.example")).toBe(
      "/avatars/avatar-02.svg",
    );
  });
});
