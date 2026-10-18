import { describe, expect, it } from "vitest";
import { buildNotices } from "./notices";

const base = {
  localDay: "2026-10-19",
  streakDays: 12,
  lastCheckinDate: "2026-10-18",
  minutesLeft: 90,
  reminderWindowMinutes: 120,
  questCount: 5,
  questsLeft: 2,
  anilistLinked: true,
};

describe("buildNotices", () => {
  it("warns about an open streak only inside the reminder window", () => {
    expect(buildNotices(base).map((notice) => notice.id)).toEqual(["streak:2026-10-19", "quests:2026-10-19"]);
    expect(buildNotices({ ...base, minutesLeft: 180 }).map((notice) => notice.id)).toEqual(["quests:2026-10-19"]);
    expect(buildNotices({ ...base, lastCheckinDate: "2026-10-19" }).map((notice) => notice.id)).toEqual([
      "quests:2026-10-19",
    ]);
  });

  it("points an empty board at a new quest and a missing card at the profile", () => {
    const notices = buildNotices({
      ...base,
      streakDays: 0,
      lastCheckinDate: null,
      questCount: 0,
      questsLeft: 0,
      anilistLinked: false,
    });
    expect(notices.map((notice) => notice.href)).toEqual(["/quests?new=1", "/profile"]);
  });
});
