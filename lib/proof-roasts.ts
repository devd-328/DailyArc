/**
 * Instant proof roasts. No model call.
 * Fake and missing-proof fails use this pool, filled with the username.
 * Gentle lines are for a hard day. Nothing auto-selects them yet.
 */
export const PROOF_ROASTS = {
  no_proof: [
    "No proof, {name}? I didn't trust my ex either, so why would I trust you?",
    "You say it is done, {name}. The camera has not heard about it.",
    "Trust issues on, {name}. A story without a photo is just a story.",
    "That is a bold claim, {name}, for someone holding zero evidence.",
    "Bro thought \"trust me\" was a file format, {name}.",
    "Official update, {name}: the quest stays open until a photo arrives.",
    "Your excuse made it, {name}. Your proof missed the meeting.",
    "Where is the picture, {name}? I do not grade speeches.",
    "Empty hands, full confidence, {name}. Pick one.",
    "I believe results, {name}. You sent a sentence.",
  ],
  fake_proof: [
    "A photo of a wall, {name}? The quest still does not know you.",
    "Nice try, {name}. My trust issues just picked up a new episode.",
    "That picture and this quest have never met, {name}.",
    "You sent a memory from a different afternoon, {name}.",
    "Random screenshot, {name}. The quest is still waiting.",
    "Blurry nothing is not a finished habit, {name}.",
    "If this photo did the quest, {name}, you can stay seated.",
    "Close, {name}, if the quest was just \"own a camera.\"",
    "I asked for proof, {name}. You sent a vibe.",
    "This image called, {name}. It does not know the quest either.",
  ],
  skipped: [
    "The quest waited. You did not.",
    "You and today's quest never actually met.",
    "The box is empty. So is the excuse.",
    "Today was free, and you still did not cash it.",
    "Skipping is a choice. You made it again.",
    "The quest sat there while you walked past.",
    "Zero progress and a full schedule. Bold priorities.",
    "Today asked for a few minutes. You gave it silence.",
    "Another clean miss. The board wrote it down.",
    "You did not lose. You never showed up.",
  ],
  streak_broken: [
    "Days of work, gone, because today felt optional.",
    "The streak died doing what you do best: waiting.",
    "That run was real. Quitting on it was also real.",
    "You had a streak. Past tense was a choice.",
    "Rest in peace, streak. Cause of death: you skipped.",
    "All those days vanished because one felt inconvenient.",
    "The counter hit zero and took your excuse with it.",
    "A streak is a promise. You hung up.",
    "You were on a roll. Then you rolled over.",
    "A real streak, and you still found the exit.",
  ],
  tomorrow: [
    "Tomorrow is tired of carrying your quests.",
    "\"Later\" has been your coach for too long.",
    "You keep dating tomorrow. Tomorrow stopped texting back.",
    "Another day of later. Later filed a complaint.",
    "Tomorrow is not a plan. It is a hiding spot.",
    "You moved the quest to tomorrow. Tomorrow sent it back.",
    "Again with tomorrow? That day already has a full inbox.",
    "The quest is today. Tomorrow does not work here.",
    "You said later so often that later changed its number.",
    "Postpone it again. I will meet you at the same excuse.",
  ],
  gentle: [
    "Rough day. One small quest still counts.",
    "You do not have to catch up. Start with one.",
    "A missed day does not erase the days you showed up.",
    "If today is heavy, do the smallest version and stop.",
    "Come back when you can. Even one quest is enough.",
    "Progress can be quiet. A short try is enough today.",
    "You are not behind. Rest, then pick one quest.",
    "Hard weeks happen. The board will still be here.",
    "Be kind to yourself, then do one easy thing.",
    "No speech. One small win whenever you are ready.",
  ],
} as const;

export type ProofRoastCategory = keyof typeof PROOF_ROASTS;

export function fillProofRoast(line: string, name: string): string {
  return line.replaceAll("{name}", name);
}

export function pickProofRoast(category: ProofRoastCategory, name: string): string {
  const lines = PROOF_ROASTS[category];
  return fillProofRoast(lines[Math.floor(Math.random() * lines.length)], name);
}
