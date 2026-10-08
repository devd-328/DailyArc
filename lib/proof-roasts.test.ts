import { describe, expect, it } from "vitest";
import { PROOF_ROASTS, pickProofRoast, type ProofRoastCategory } from "./proof-roasts";

const CATEGORIES = Object.keys(PROOF_ROASTS) as ProofRoastCategory[];

describe("PROOF_ROASTS", () => {
  it("keeps ten short lines in every category", () => {
    for (const category of CATEGORIES) {
      expect(PROOF_ROASTS[category]).toHaveLength(10);
      for (const line of PROOF_ROASTS[category]) {
        expect(line.split(/\s+/).filter(Boolean).length).toBeLessThanOrEqual(15);
        expect(line.length).toBeLessThanOrEqual(90);
        expect(line.includes("—")).toBe(false);
        expect(line.includes("–")).toBe(false);
        expect(line.toLowerCase()).not.toMatch(/\bfat\b|\bugly\b|\bstupid\b|\bkill\b/);
      }
    }
  });

  it("picks a line from the requested category", () => {
    const line = pickProofRoast("no_proof");
    expect(PROOF_ROASTS.no_proof).toContain(line);
  });
});
