import { describe, expect, it } from "vitest";
import {
  PROOF_ROASTS,
  fillProofRoast,
  pickProofRoast,
  type ProofRoastCategory,
} from "./proof-roasts";

const CATEGORIES = Object.keys(PROOF_ROASTS) as ProofRoastCategory[];
const NAMED = ["no_proof", "fake_proof"] as const;

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

  it("calls the user by name on missing and fake proof", () => {
    for (const category of NAMED) {
      for (const line of PROOF_ROASTS[category]) {
        expect(line).toContain("{name}");
        const filled = fillProofRoast(line, "mira_k");
        expect(filled).toContain("mira_k");
        expect(filled.includes("{name}")).toBe(false);
      }
    }
  });

  it("picks a filled line from the requested category", () => {
    const line = pickProofRoast("fake_proof", "devdas");
    expect(line).toContain("devdas");
    expect(PROOF_ROASTS.fake_proof.map((item) => fillProofRoast(item, "devdas"))).toContain(line);
  });
});
