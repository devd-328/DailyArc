import { describe, expect, it } from "vitest";
import { fittedSize } from "./proof-image";

describe("fittedSize", () => {
  it("shrinks a wide photo to 800px and keeps the ratio", () => {
    expect(fittedSize(4000, 3000)).toEqual({ width: 800, height: 600 });
  });

  it("leaves a photo that is already small enough", () => {
    expect(fittedSize(640, 480)).toEqual({ width: 640, height: 480 });
  });

  it("rounds the height and never returns zero", () => {
    expect(fittedSize(8000, 1)).toEqual({ width: 800, height: 1 });
  });

  it("rejects a broken size", () => {
    expect(() => fittedSize(0, 100)).toThrow("invalid image size");
  });
});
