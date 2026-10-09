/**
 * Owner roast pool. Habits and effort only.
 * Leaderboard lines are stored but unused in v1 (no rivals).
 * Wake-up and phone lines are not in a live trigger: the app does not know those facts.
 */
export const ROAST_TRIGGERS = [
  "skipped_habit",
  "skipped_workout",
  "study_focus",
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
    "{name}, your habit list is not a decoration. Open it and do something.",
    "Even NPCs complete their daily tasks, {name}. What is your excuse?",
    "Your goals are waiting, {name}. Your goals are also losing hope in you.",
    "Yesterday you did nothing, {name}. Today you are planning to do nothing again. At least you are consistent.",
    "You opened the app, looked at your tasks, and left, {name}. Brave. Useless, but brave.",
    "You have 24 hours every day, same as everyone, {name}. You just waste yours better.",
    "Skipping again, {name}? Your future self already hates you.",
    "Zero tasks done, {name}. You are not lazy, you are just professionally unproductive.",
    "I would call you a quitter, {name}, but you never even started.",
  ],
  skipped_workout: [
    "Walking to the fridge does not count as cardio, {name}.",
    "{name}, your couch is the only thing getting stronger. It carries you every day.",
    "You said 'I will start tomorrow' so many times, {name}, that tomorrow is now scared of you.",
    "Your gym bag has not moved in weeks, {name}. It thinks it got fired.",
    "Your fitness plan is only strong in your imagination, {name}.",
  ],
  study_focus: [
    "Your books are not scared of you, {name}. They are just waiting for you to open them.",
    "Your exam is coming, {name}. Your brain is on vacation. Nice teamwork.",
    "You say you are tired, {name}, but you were not tired when the video was playing.",
    "You are so good at planning and so bad at doing, {name}. Should we change your title to Planner?",
  ],
  streak_at_risk: [
    "Still not done, {name}? The day is almost over.",
    "Open the app, {name}. Do one thing. Stop being dramatic.",
    "Tick tock, {name}. Your excuses are not on the leaderboard.",
    "Five more minutes, {name}? You have been saying that for five hours.",
    "You will do it later, {name}. You said that yesterday. And last week. Later never comes.",
    "{name}, the world is not saving itself.",
  ],
  streak_broken: [
    "Streak: 0. Excuses: unlimited. Impressive stats, {name}.",
    "Streak lost, {name}. Even your habits are tired of your drama.",
    "Your {streak_days} day streak is dead, {name}. We held a small funeral. You were not invited because you were busy scrolling.",
    "You lasted {streak_days} days, {name}. A goldfish has more commitment.",
    "You protected that streak for weeks and lost it for one nap, {name}. Respect the stupidity.",
    "Your streak did not break, {name}. You killed it. With your own hands.",
    "All that progress gone, {name}. You really said, 'Let me ruin this beautiful thing.'",
    "Congratulations, {name}. You reset your own life. Very bold of you.",
  ],
  late_night: [
    "You are not waiting for motivation, {name}. You are waiting for a miracle. Go and make one.",
    "Five more minutes, {name}? You have been saying that for five hours.",
    "You will do it later, {name}. You said that yesterday. And last week. Later never comes.",
    "Your to do list is just a wish list with extra steps, {name}.",
    "Your deadline is not scared of you, {name}. It is laughing.",
    "You are so good at planning and so bad at doing, {name}. Should we change your title to Planner?",
    "Still not done, {name}? The day is almost over.",
  ],
  low_level: [
    "The villain did not defeat you, {name}. Your bed did.",
    "The tutorial boss would be embarrassed to lose to you, {name}.",
    "Is this all you have, {name}? I expected a hero. I got a sleepy potato.",
    "Your power level is so low, {name}, that my scanner thought it was broken.",
    "Pathetic, {name}. Even the weakest slime in the game levels up faster than you.",
    "Tch. You are still at this level, {name}? Disappointing.",
    "I have seen beginners with more discipline, {name}. And they were crying.",
  ],
  inactive_3d: [
    "Your tasks miss you, {name}. They are crying.",
    "{name}, the world is not saving itself.",
    "Open the app, {name}. Do one thing. Stop being dramatic.",
    "Even NPCs complete their daily tasks, {name}. What is your excuse?",
    "You opened the app, looked at your tasks, and left, {name}. Brave. Useless, but brave.",
    "Yesterday you did nothing, {name}. Today you are planning to do nothing again. At least you are consistent.",
  ],
  inactive_7d: [
    "Your future self sent a message, {name}: 'Please stop.'",
    "Zero tasks done, {name}. You are not lazy, you are just professionally unproductive.",
    "I would call you a quitter, {name}, but you never even started.",
    "You have 24 hours every day, same as everyone, {name}. You just waste yours better.",
    "Skipping again, {name}? Your future self already hates you.",
    "I have waited for you to try, {name}. I am now very old.",
  ],
  level_up_roast: [
    "I roast you because I know you can be better, {name}. Prove me wrong.",
    "You are behind, {name}. So what? Even the strongest heroes lost before they won. Get up.",
    "You failed yesterday, {name}. Good. Now you have a perfect comeback story. Start it.",
    "I did not train you to quit after one bad day, {name}! GET BACK IN THE GAME!",
    "You have two legs, two hands, and zero excuses, {name}. START NOW!",
  ],
  motivational_mean: [
    "I did not train you to quit after one bad day, {name}! GET BACK IN THE GAME!",
    "Excuses do not lift weights, {name}! Excuses do not finish tasks! MOVE!",
    "You have two legs, two hands, and zero excuses, {name}. START NOW!",
    "WHAT ARE YOU DOING, {name}?! SITTING DOWN?! STAND UP AND WORK!",
    "{name}, the path to success is long. You have not even left the house.",
    "Discipline is a gift, {name}. You returned it unopened.",
    "Even I, a tired old master, did more today than you, {name}. And I took three naps.",
    "I have waited for you to try, {name}. I am now very old.",
    "You are not waiting for motivation, {name}. You are waiting for a miracle. Go and make one.",
    "Today was bad, {name}. Tomorrow is free. Do not waste that one too.",
  ],
  anime_wrapped_card: [
    "Your goals are waiting, {name}. Your goals are also losing hope in you.",
    "You have 24 hours every day, same as everyone, {name}. You just waste yours better.",
    "I roast you because I know you can be better, {name}. Prove me wrong.",
    "You are so good at planning and so bad at doing, {name}. Should we change your title to Planner?",
    "Discipline is a gift, {name}. You returned it unopened.",
    "Even NPCs complete their daily tasks, {name}. What is your excuse?",
  ],
};

/** v1 has no leaderboard. Kept so the owner copy is not lost. */
export const ROAST_RIVAL_UNUSED = [
  "Do not look at me. Look at your empty task list.",
  "While you rest, I get stronger. Keep resting. It helps me.",
  "Tch. You are still at this level? Disappointing.",
  "I wasted my time thinking you were my rival. You are barely a spectator.",
] as const;
