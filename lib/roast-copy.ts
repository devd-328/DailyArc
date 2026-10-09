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
    "Your habit list is not a decoration. Open it and do something.",
    "Even NPCs complete their daily tasks. What is your excuse?",
    "Your goals are waiting. Your goals are also losing hope in you.",
    "Yesterday you did nothing. Today you are planning to do nothing again. At least you are consistent.",
    "You opened the app, looked at your tasks, and left. Brave. Useless, but brave.",
    "You have 24 hours every day, same as everyone. You just waste yours better.",
    "Skipping again? Your future self already hates you.",
    "Zero tasks done. You are not lazy, you are just professionally unproductive.",
    "I would call you a quitter, but you never even started.",
  ],
  skipped_workout: [
    "Walking to the fridge does not count as cardio.",
    "Your couch is the only thing getting stronger. It carries you every day.",
    "You said 'I will start tomorrow' so many times that tomorrow is now scared of you.",
    "Your gym bag has not moved in weeks. It thinks it got fired.",
    "Your fitness plan is only strong in your imagination.",
  ],
  study_focus: [
    "Your books are not scared of you. They are just waiting for you to open them.",
    "Your exam is coming. Your brain is on vacation. Nice teamwork.",
    "You say you are tired, but you were not tired when the video was playing.",
    "You are so good at planning and so bad at doing. Should we change your title to Planner?",
  ],
  streak_at_risk: [
    "Still not done? The day is almost over.",
    "Open the app. Do one thing. Stop being dramatic.",
    "Tick tock. Your excuses are not on the leaderboard.",
    "Five more minutes? You have been saying that for five hours.",
    "You will do it later. You said that yesterday. And last week. Later never comes, hero.",
    "Hero, the world is not saving itself.",
  ],
  streak_broken: [
    "Streak: 0. Excuses: unlimited. Impressive stats, honestly.",
    "Streak lost. Even your habits are tired of your drama.",
    "Your {streak_days} day streak is dead. We held a small funeral. You were not invited because you were busy scrolling.",
    "You lasted {streak_days} days. A goldfish has more commitment.",
    "You protected that streak for weeks and lost it for one nap. Respect the stupidity.",
    "Your streak did not break. You killed it. With your own hands.",
    "All that progress gone. You really said, 'Let me ruin this beautiful thing.'",
    "Congratulations, you reset your own life. Very bold of you.",
  ],
  late_night: [
    "You are not waiting for motivation. You are waiting for a miracle. Go and make one.",
    "Five more minutes? You have been saying that for five hours.",
    "You will do it later. You said that yesterday. And last week. Later never comes, hero.",
    "Your to do list is just a wish list with extra steps.",
    "Your deadline is not scared of you. It is laughing.",
    "You are so good at planning and so bad at doing. Should we change your title to Planner?",
    "Still not done? The day is almost over.",
  ],
  low_level: [
    "The villain did not defeat you. Your bed did.",
    "The tutorial boss would be embarrassed to lose to you.",
    "Is this all you have? I expected a hero. I got a sleepy potato.",
    "Your power level is so low that my scanner thought it was broken.",
    "Pathetic. Even the weakest slime in the game levels up faster than you.",
    "Tch. You are still at this level? Disappointing.",
    "I have seen beginners with more discipline. And they were crying.",
  ],
  inactive_3d: [
    "Your tasks miss you. They are crying.",
    "Hero, the world is not saving itself.",
    "Open the app. Do one thing. Stop being dramatic.",
    "Even NPCs complete their daily tasks. What is your excuse?",
    "You opened the app, looked at your tasks, and left. Brave. Useless, but brave.",
    "Yesterday you did nothing. Today you are planning to do nothing again. At least you are consistent.",
  ],
  inactive_7d: [
    "Your future self sent a message: 'Please stop.'",
    "Zero tasks done. You are not lazy, you are just professionally unproductive.",
    "I would call you a quitter, but you never even started.",
    "You have 24 hours every day, same as everyone. You just waste yours better.",
    "Skipping again? Your future self already hates you.",
    "I have waited for you to try. I am now very old.",
  ],
  level_up_roast: [
    "I roast you because I know you can be better. Prove me wrong.",
    "You are behind. So what? Even the strongest heroes lost before they won. Get up.",
    "You failed yesterday. Good. Now you have a perfect comeback story. Start it.",
    "I did not train you to quit after one bad day! GET BACK IN THE GAME!",
    "You have two legs, two hands, and zero excuses. START NOW!",
  ],
  motivational_mean: [
    "I did not train you to quit after one bad day! GET BACK IN THE GAME!",
    "Excuses do not lift weights! Excuses do not finish tasks! MOVE!",
    "You have two legs, two hands, and zero excuses. START NOW!",
    "WHAT ARE YOU DOING?! SITTING DOWN?! STAND UP AND WORK!",
    "Young one, the path to success is long. You have not even left the house.",
    "Discipline is a gift. You returned it unopened.",
    "Even I, a tired old master, did more today than you. And I took three naps.",
    "I have waited for you to try. I am now very old.",
    "You are not waiting for motivation. You are waiting for a miracle. Go and make one.",
    "Today was bad. Tomorrow is free. Do not waste that one too.",
  ],
  anime_wrapped_card: [
    "Your goals are waiting. Your goals are also losing hope in you.",
    "You have 24 hours every day, same as everyone. You just waste yours better.",
    "I roast you because I know you can be better. Prove me wrong.",
    "You are so good at planning and so bad at doing. Should we change your title to Planner?",
    "Discipline is a gift. You returned it unopened.",
    "Even NPCs complete their daily tasks. What is your excuse?",
  ],
};

/** v1 has no leaderboard. Kept so the owner copy is not lost. */
export const ROAST_RIVAL_UNUSED = [
  "Do not look at me. Look at your empty task list.",
  "While you rest, I get stronger. Keep resting. It helps me.",
  "Tch. You are still at this level? Disappointing.",
  "I wasted my time thinking you were my rival. You are barely a spectator.",
] as const;
