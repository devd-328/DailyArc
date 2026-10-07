import { describe, expect, it } from "vitest";
import { isDailyArcUsername, isReservedUsername, isValidUsername } from "./username";

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

describe("isDailyArcUsername", () => {
  it("rejects reserved route names", () => {
    expect(isReservedUsername("login")).toBe(true);
    expect(isReservedUsername("API")).toBe(true);
    expect(isDailyArcUsername("login")).toBe(false);
    expect(isDailyArcUsername("wrapped")).toBe(false);
    expect(isDailyArcUsername("dev_das")).toBe(true);
  });
});
