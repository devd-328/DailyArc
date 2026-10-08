import { quests as questConfig, type Stat } from "./config";

/**
 * Starter quest seed. Names come from mockups/screens-quests.html.
 * The owner still owns the final pool (PRODUCT.md). Do not invent extra rows here.
 */
export type StarterTemplate = {
  id: string;
  name: string;
  stat: Stat;
  xp_value: (typeof questConfig.allowedXpValues)[number];
  kind: "starter";
};

export const STARTER_TEMPLATES: readonly StarterTemplate[] = [
  {
    id: "a1c0ffee-0001-4000-8000-000000000001",
    name: "Drink a big glass of water",
    stat: "vitality",
    xp_value: 10,
    kind: "starter",
  },
  {
    id: "a1c0ffee-0002-4000-8000-000000000002",
    name: "Walk for 20 minutes",
    stat: "vitality",
    xp_value: 20,
    kind: "starter",
  },
  {
    id: "a1c0ffee-0003-4000-8000-000000000003",
    name: "Read 10 pages",
    stat: "intelligence",
    xp_value: 10,
    kind: "starter",
  },
  {
    id: "a1c0ffee-0004-4000-8000-000000000004",
    name: "Study for 25 minutes",
    stat: "discipline",
    xp_value: 20,
    kind: "starter",
  },
  {
    id: "a1c0ffee-0005-4000-8000-000000000005",
    name: "Message a friend",
    stat: "charisma",
    xp_value: 10,
    kind: "starter",
  },
];

export function starterById(id: string): StarterTemplate | null {
  return STARTER_TEMPLATES.find((item) => item.id === id) ?? null;
}

export function starterAdded(name: string, questNames: readonly string[]): boolean {
  return questNames.includes(name);
}
