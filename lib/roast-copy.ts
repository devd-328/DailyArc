/**
 * Owner roast pool. Max intensity. Habits and effort only.
 * Leaderboard lines are stored but unused in v1 (no rivals).
 */
export const ROAST_TRIGGERS = [
  "skipped_habit",
  "streak_at_risk",
  "streak_broken",
  "late_night",
  "low_level",
  "inactive_3d",
  "inactive_7d",
  "level_up_roast",
  "motivational_mean",
  "anime_wrapped_card",
] as const;

export type RoastTrigger = (typeof ROAST_TRIGGERS)[number];

export const ROAST_COPY: Record<RoastTrigger, readonly string[]> = {
  skipped_habit: [
    "{name}, the villain didn't even show up. You lost to yourself over '{habit_name}'.",
    "Your future self just filed a 14 page complaint about '{habit_name}'.",
    "{habits_missed} habits skipped. The plot armor ran out and so did the audience.",
    "Somewhere there is a version of you who did '{habit_name}'. They're thriving. You're reading this.",
    "Your habit list is a graveyard and you're the only one visiting.",
    "You have the discipline of a filler episode and the screen time of a fan theory nobody asked for.",
    "Every skipped day is a chapter your future self has to read out loud at the reunion. Do '{habit_name}'.",
  ],
  streak_at_risk: [
    "{streak_days} days of effort, and you're about to delete it for a nap. Say bye to your own legacy.",
    "In {time_left} this streak becomes a story you tell people to sound disciplined. Log it.",
    "Your {streak_days} day streak is hanging off a cliff by one finger and you're scrolling.",
    "{time_left} to save {streak_days} days. The clock believes in you more than you do.",
    "You built {streak_days} days. Don't be the only villain in your own story.",
  ],
  streak_broken: [
    "Your best streak is {best_streak}. You just reminded everyone why it isn't higher.",
    "{streak_days} days built, one lazy night to burn it. That's not a setback, that's a signature move.",
    "Zero again. The streak counter is embarrassed to be associated with you.",
    "You reset your streak like it was a game option. It was a promise, {name}.",
    "RIP streak, {streak_days} days old. Cause of death: you. No memorial, no mourners.",
    "Your streak had plot armor and you still found a way to end it.",
    "Reset to zero. Even a Level 1 slime is looking down on you.",
  ],
  late_night: [
    "Every night you bargain with the clock like it owes you something. {time_left} left. It doesn't.",
    "Imagine being this close to a clean day and choosing the couch. Couldn't be me. Is you.",
    "You're the final boss of procrastination, and you're not even hard.",
    "{time_left} left. Your excuses are just warming up and your goals are already tired of them.",
    "Midnight logging is the 'I did my homework on the bus' of self improvement.",
  ],
  low_level: [
    "Level {level} after all this time. The system had to zoom in to find you.",
    "Your XP bar moves like it's carrying you personally. {xp_to_next} to go. Try carrying it back.",
    "Level {level}. The tutorial boss felt bad and let you win.",
    "You're the character the narrator skips when listing the cast.",
    "If effort were a stat, yours would read N/A.",
    "You've been Level {level} so long it's basically your personality.",
  ],
  inactive_3d: [
    "Your arc got canceled by popular demand, {name}. Prove them wrong.",
    "{days_inactive} days. Your goals filed a missing person report and nobody was surprised.",
    "The side characters are doing better than you. The side characters.",
    "You ghosted your own growth. Honestly, impressive.",
    "{days_inactive} days offline. Your habits have started telling people you moved away.",
    "Even anime hiatuses are shorter than this.",
  ],
  inactive_7d: [
    "{days_inactive} days of silence. This is the longest filler arc in history and you wrote it.",
    "Remember when you said this time would be different? The app does. It kept the receipts.",
    "Your future self left you a voicemail. It's just one long sigh.",
    "{days_inactive} days offline. Your best streak of {best_streak} is crying in the archive.",
    "A whole week of nothing. Your character retired and forgot to tell you.",
    "Your Level {level} is gathering dust, and the dust has better consistency than you.",
  ],
  level_up_roast: [
    "Level {level}. Don't let it go to your head. Your head hasn't earned a vacation.",
    "Look at you, a protagonist. Now try doing it on a day nobody is watching.",
    "You leveled up. The narrator needs a minute to recover.",
    "Level {level} reached. We had the odds at 50 to 1 and we still lost money.",
    "You leveled up, {name}. Do it again before you get comfortable and ruin it.",
  ],
  motivational_mean: [
    "No one is coming to save your arc. Pick up the sword.",
    "Talent is overrated. Showing up is the plot twist you keep missing.",
    "Pain now, power later. Skipping now, regret later. Pick one.",
    "The only thing between you and your power-up is you. Awkward.",
    "Nobody cares about your excuses. The plot only cares about your next move.",
    "You're not behind, {name}. You're the character who hasn't had their training montage yet. Press start.",
  ],
  anime_wrapped_card: [
    "Best streak: {best_streak} days. Longest excuse: the rest of the year.",
    "Final level {level}. The system says you had potential. The system is a snitch.",
    "Your most consistent habit this year was avoiding your habits.",
    "Archetype unlocked: The 'Tomorrow, I Promise' Hero.",
    "Your rival this year was your own alarm clock. It won.",
    "You logged most of your year at 11:59 PM. Cramming for your own life.",
  ],
};

/** v1 has no leaderboard. Kept so the owner copy is not lost. */
export const ROAST_RIVAL_UNUSED = [
  "{rival_name} overtook you without breaking a sweat. You handed them the road and a head start.",
  "Rank {rank}. The only thing you're leading is the group chat about starting tomorrow.",
  "{rival_name} doesn't have half your potential, and they still beat you. Think about that.",
  "You're losing to {rival_name} and they aren't even trying hard. That's the insult.",
  "Your name on the leaderboard looks like it's whispering.",
] as const;
