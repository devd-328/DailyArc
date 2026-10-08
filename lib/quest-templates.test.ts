import { describe, expect, it } from "vitest";
import { quests, STATS } from "./config";
import { STARTER_TEMPLATES, starterAdded, starterById } from "./quest-templates";

describe("starter templates", () => {
  it("shows 5 to 8 starters from the quests mockup", () => {
    expect(STARTER_TEMPLATES.length).toBeGreaterThanOrEqual(quests.starterQuestsShown.min);
    expect(STARTER_TEMPLATES.length).toBeLessThanOrEqual(quests.starterQuestsShown.max);
    expect(STARTER_TEMPLATES.map((item) => item.name)).toEqual([
      "Drink a big glass of water",
      "Walk for 20 minutes",
      "Read 10 pages",
      "Study for 25 minutes",
      "Message a friend",
    ]);
  });

  it("keeps names, stats and XP inside the product rules", () => {
    const ids = new Set<string>();
    for (const item of STARTER_TEMPLATES) {
      expect(item.kind).toBe("starter");
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.name.length).toBeLessThan(40);
      expect(item.name.includes("—")).toBe(false);
      expect(STATS.includes(item.stat)).toBe(true);
      expect(quests.allowedXpValues.includes(item.xp_value)).toBe(true);
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);
    }
  });

  it("looks up a starter by id and marks it added by name", () => {
    const first = STARTER_TEMPLATES[0];
    expect(starterById(first.id)).toEqual(first);
    expect(starterById("missing")).toBeNull();
    expect(starterAdded(first.name, [first.name])).toBe(true);
    expect(starterAdded(first.name, ["Walk for 20 minutes"])).toBe(false);
  });
});
