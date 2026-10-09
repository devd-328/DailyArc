# Product

## One-line pitch
Level up your real life like an anime protagonist, then share your anime identity card.

## Audience
Anime fans aged 15 to 28 who share on Instagram, TikTok, X and Reddit. They like rankings, stats, personality types and screenshots.

## v1 scope
Included:
- Anime Wrapped card from an AniList username
- 5 watcher types
- Quest tracker: create habits, daily check-in, XP, level, rank
- Starter quests: ready-made suggestions on the empty quests screen, added with one tap
- Stat screen with 5 stats
- Public profile link that shows card and rank
- Accounts: one screen to sign in or sign up with AniList, Google or email
- Profile tab: account, AniList link, public page switch, settings, streak reminder switch
- Shareable card image exports (9:16 and 1:1) and an Open Graph preview image for profile links

Not in v1:
- MyAnimeList import, friends and leaderboards, notifications other than the streak reminder, native apps, payments, user-uploaded art
- Daily side quest (random optional quest). Planned for v1.1, see "Starter quests and side quests"

## Anime Wrapped stats
- Total hours watched and episodes
- Top 3 genres
- Favorite studio
- Completion rate (completed vs dropped)
- Hot take: title where the user's score differs most from the community average

### Calculation rules
- Hours watched = sum of (episodes watched x episode duration). If a title has no duration, use the median duration of the user's other titles, or 24 minutes if none exist.
- Completion rate = completed / (completed + dropped). Titles that are planning, paused or currently watching are excluded.
- Hot take: only titles the user has scored are considered. Needs at least 5 scored titles, otherwise the hot take is hidden.
- Top genres and favorite studio are counted by number of titles on the list (completed, watching, dropped and paused; planning excluded).

### Edge cases
- Username not found: show "We couldn't find that AniList user".
- Private or empty list: show "This list is private or empty".
- Fewer than 10 completed titles: generate the card, but show a "not enough data" notice and default the type to Wanderer.
- AniList rate limit (about 90 requests per minute): cache results per username (suggested 24 hours) and offer a manual refresh with a cooldown.

## Watcher types (rule based, first match wins)
Rarer and more specific types are checked first so they actually show up.

1. Genre Loyalist: one genre above 40 percent of list
2. Classic Purist: at least 60 percent of list aired before 2010
3. Seasonal Sampler: at least 50 percent of list aired in the current or last 2 seasons, and drop rate above 30 percent
4. Binge Demon: at least 150 episodes per month, averaged over the last 12 months
5. Wanderer: default when nothing else matches

Thresholds are starting values and live in config so they can be tuned without code changes. The card also shows the runner-up type as a secondary trait (for example "Binge Demon with Genre Loyalist streak").

## Leveling system
- Quest: name, stat it trains, XP value (10, 20 or 30), cadence (daily or weekly)
- Stats: Strength, Intelligence, Discipline, Charisma, Vitality
- XP to go from level N to N+1: round(12 * N^1.5)
- Level cap: 50. At the cap, XP keeps counting for stats and streaks.
- Ranks by level: E 1 to 9, D 10 to 19, C 20 to 29, B 30 to 39, A 40 to 49, S 50
- Streak bonus: +10 percent XP at 7 day streak, +25 percent at 30 days
- Missed day: streak resets, no XP loss (keep it motivating, not punishing)

### Streak reminder
- Opt in from the profile screen. Off until the user allows notifications.
- One alert per local day, only when the daily streak is above 0 and there is no check-in for the current quest day.
- Sent in the 120 minutes before the 3:00 AM local reset. An hourly job sends it. The app does not need to be open.
- iPhone and iPad receive it only after DailyArc is added to the home screen. Android can allow it in the browser.

### Pacing (assumes about 70 XP per day: 3 daily quests at 20 XP plus streak bonus)
| Level | Total XP | Approx. time |
| --- | --- | --- |
| 10 (D rank) | about 1,300 | about 3 weeks |
| 20 (C rank) | about 8,000 | about 4 months |
| 30 (B rank) | about 22,700 | about 11 months |
| 40 (A rank) | about 47,000 | about 22 months |
| 50 (S rank) | about 83,000 | about 3 years |

S rank is meant to be prestigious, but reachable for a dedicated user. The original formula (100 x level^1.5) put level 50 at about 690k XP, which is decades of play, so it was lowered.

### Quest rules (anti-farming)
- Max 8 active quests per user.
- Max 1 check-in per quest per cadence period (once per day for daily, once per week for weekly).
- Daily XP cap: 150 base XP before streak bonus.
- Weekly quests keep their own streak counted in weeks. The 7 day and 30 day bonuses apply to daily streaks only.
- Each quest's XP goes to its stat. A stat's level uses the same XP curve, based on the total XP earned in that stat. The overall level is based on total XP across all stats.

### Streaks and time
- A "day" follows the user's local timezone, stored on their profile.
- Grace window: a check-in before 3:00 AM local time counts for the previous day.
- A missed day resets the streak to 0. No XP is removed.

## Starter quests and side quests
Random quests are an extra on top of the user's own habits. They never replace them.

### Starter quests (v1)
- The empty quests screen shows 5 to 8 ready-made quests. Tapping Add copies one into the user's quests (a normal daily quest, with the template's name, stat and XP).
- They count toward the 8 quest limit once added.
- The user can still write their own quest at any time.

### Daily side quest (v1.1)
- One random quest per day, optional, shown above the user's own quests.
- Picked from a hand-written pool of about 40 to 60 templates. Never the same as yesterday's.
- XP is the template's fixed value (10, 20 or 30). No streak bonus applies.
- It counts inside the daily XP cap (150 base XP), so it is not a free XP source.
- It does not affect the streak, does not count toward the 8 quest limit, and is not part of the "x of y done" count.
- The user can reroll it once per day (only before completing it).
- It expires at the end of the user's local day (same 3:00 AM grace window). Skipping it costs nothing.

### Quest template content rules
- Templates are written and approved by the owner. Agents must not invent quest text.
- Positive, small and doable in a day. No dieting, fasting, weight loss, extreme workouts, skipping sleep, spending money, meeting strangers, or anything physically risky.
- Nothing that depends on age, body, money or family situation. The audience starts at 15.
- Each template has a name (under 40 characters, sentence case, no em dashes), one stat, and an XP value of 10, 20 or 30.

## Connection between the two
The Wrapped card can show the user's real-life rank and level next to their watcher type. Example: "S-rank Binge Demon".

## Accounts and persistence
- Anyone can generate a Wrapped card for any public AniList username, with no account. This is the growth loop and stays open.
- An account is required for quests, a profile and a public page. There is no anonymous quest progress in v1.
- Sign in methods: AniList, Google, or email (a sign-in link, no password). One screen handles both sign in and sign up.
- AniList can be linked at sign in or later from the Profile tab. Linking (OAuth) is the only way to prove ownership of an AniList username. A username typed into a form is never treated as owned.
- A user who signs up with Google or email and never links AniList can still use quests. Their public page shows rank and level, but no card and no watcher type, and their Cards tab asks them to link AniList.
- On first sign in the user picks a username (default: their AniList name if it is free). It is used in the public URL.
- One AniList account can be linked to only one DailyArc account.
- In v1 the AniList link is used only to prove identity. Private lists are not read.
- The public page is created at sign in. It shows rank, level, watcher type and card (when linked). Users can switch it to private or delete the account at any time.

## Screens: Cards and Profile tabs
Cards tab:
- Linked user: their own card, with "Save for story", "Save square", "Copy link" and a refresh button (cooldown applies).
- Not linked: an empty state with a "Link AniList" button.

Profile tab (private, own account only):
- Header: username, rank, level, watcher type (if linked), best streak.
- AniList: linked or not linked. Link or refresh card data.
- Public page: on or off switch, and the link with a copy button.
- Settings: timezone (detected automatically, editable), email.
- Account: sign out, delete account and data.

## Sharing
- Export card as image in 9:16 (TikTok, Instagram Stories) and 1:1 (X, Reddit, Instagram posts).
- Public profile links render the card as the Open Graph preview image so the link looks good when pasted.
- Exports carry a small product name and URL watermark.

## Privacy
- Only public AniList data is used. Private lists are not read.
- Users can delete their profile and cached Wrapped data.
- No user-uploaded content in v1.

## Success metrics
- Cards generated per day
- Share rate (card exports divided by cards generated)
- Wrapped to quest conversion (share of visitors who generated a card, then signed up and created a quest)
- Sign-up completion rate (share of people who started sign in and finished it)
- Day 7 return rate for quest users (cohort: users who created at least one quest)

## Decided
- Signup is not required for the first card. Anyone can look up a public AniList username. Accounts are required for quests, profile and public page.
- Sign in with AniList, Google or email. AniList is linkable later.

## Open questions
- Final product name and domain (the repo uses "DailyArc"; this affects share URLs)
- Username rules for users who sign up without AniList (length, characters, reserved names)
- Whether to read private AniList lists after linking (v1: no)
- Which watcher types to add after launch
- The starter quest list and the side quest pool (owner writes and approves them)
- Whether side quests should be flavored by watcher type later (for example "Watch one episode, then stop" for Binge Demon)
- Whether the watcher type should give a small cosmetic bonus to quests (for example a title or badge)
