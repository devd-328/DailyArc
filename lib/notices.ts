import { daysInactiveSince, formatTimeLeft } from "./streaks";

export type Notice = {
  id: string;
  title: string;
  body: string;
  href: string;
};

export function buildNotices(input: {
  localDay: string;
  streakDays: number;
  lastCheckinDate: string | null;
  minutesLeft: number;
  reminderWindowMinutes: number;
  questCount: number;
  questsLeft: number;
  anilistLinked: boolean;
}): Notice[] {
  const notices: Notice[] = [];
  const streakStillOpen =
    input.streakDays > 0 && daysInactiveSince(input.lastCheckinDate, input.localDay) === 1;
  if (streakStillOpen && input.minutesLeft <= input.reminderWindowMinutes) {
    notices.push({
      id: `streak:${input.localDay}`,
      title: "Streak is ending",
      body: `${formatTimeLeft(input.minutesLeft)} left to keep the streak.`,
      href: "/quests",
    });
  }

  if (input.questCount === 0) {
    notices.push({
      id: "quests-empty",
      title: "No quests yet",
      body: "Add one to start earning XP.",
      href: "/quests?new=1",
    });
  } else if (input.questsLeft > 0) {
    const noun = input.questsLeft === 1 ? "quest" : "quests";
    notices.push({
      id: `quests:${input.localDay}`,
      title: "Quests left today",
      body: `${input.questsLeft} ${noun} still open today.`,
      href: "/quests",
    });
  }

  if (!input.anilistLinked) {
    notices.push({
      id: "card",
      title: "Anime card",
      body: "Link AniList on your profile to make your card.",
      href: "/profile",
    });
  }

  return notices;
}
