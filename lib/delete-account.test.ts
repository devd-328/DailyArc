import { describe, expect, it } from "vitest";
import { galleryAvatarPath } from "./avatar";
import { deleteOwnedAccount, isSameOrigin, type AccountAdmin } from "./delete-account";

function admin(steps: string[], profile: { anilistUsername: string | null } | null, failAt?: "avatar" | "auth"): AccountAdmin {
  return {
    async readProfile() {
      steps.push("profile");
      return profile;
    },
    async removeAvatar(path) {
      steps.push(`avatar:${path}`);
      if (failAt === "avatar") throw new Error("avatar");
    },
    async deleteAuthUser(userId) {
      steps.push(`auth:${userId}`);
      if (failAt === "auth") throw new Error("auth");
    },
  };
}

describe("deleteOwnedAccount", () => {
  it("removes the gallery file before the auth user, and keeps the AniList name for cache expiry", async () => {
    const steps: string[] = [];
    const result = await deleteOwnedAccount(admin(steps, { anilistUsername: "dev_das" }), "user-1");
    expect(result).toEqual({ anilistUsername: "dev_das" });
    expect(steps).toEqual(["profile", `avatar:${galleryAvatarPath("user-1")}`, "auth:user-1"]);
  });

  it("still deletes an account that has no profile yet", async () => {
    const steps: string[] = [];
    const result = await deleteOwnedAccount(admin(steps, null), "user-1");
    expect(result.anilistUsername).toBeNull();
    expect(steps.at(-1)).toBe("auth:user-1");
  });

  it("stops before the auth user when the avatar delete fails", async () => {
    const steps: string[] = [];
    await expect(deleteOwnedAccount(admin(steps, { anilistUsername: null }, "avatar"), "user-1")).rejects.toThrow(
      "avatar",
    );
    expect(steps).not.toContain("auth:user-1");
  });
});

describe("isSameOrigin", () => {
  it("accepts only the request origin", () => {
    expect(isSameOrigin("http://localhost:3000", "http://localhost:3000")).toBe(true);
    expect(isSameOrigin("http://localhost:3000", "https://evil.example")).toBe(false);
    expect(isSameOrigin("http://localhost:3000", null)).toBe(false);
  });
});
