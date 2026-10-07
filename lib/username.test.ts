import { describe, expect, it } from "vitest";
import { isValidUsername } from "./username";

describe("isValidUsername", () => {
  it("accepts letters, digits and underscore, 2 to 20 characters", () => {
    expect(isValidUsername("dev_das")).toBe(true);
    expect(isValidUsername("ab")).toBe(true);
    expect(isValidUsername("a".repeat(20))).toBe(true);
  });

  it("rejects empty, too long, spaces and symbols", () => {
    expect(isValidUsername("")).toBe(false);
    expect(isValidUsername("a")).toBe(false);
    expect(isValidUsername("a".repeat(21))).toBe(false);
    expect(isValidUsername("dev das")).toBe(false);
    expect(isValidUsername("dev-das")).toBe(false);
  });
});
