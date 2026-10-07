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
- Stat screen with 5 stats
- Public profile link that shows card and rank
- Shareable card image exports (9:16 and 1:1) and an Open Graph preview image for profile links

Not in v1:
- MyAnimeList import, friends and leaderboards, push notifications, native apps, payments, user-uploaded art

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

## Connection between the two
The Wrapped card can show the user's real-life rank and level next to their watcher type. Example: "S-rank Binge Demon".

## Accounts and persistence
- Generating a Wrapped card needs no signup. Only an AniList username is required.
- Quests need an account to store progress. Sign in with AniList OAuth (fits the audience and reuses the same data source). Email sign in can come later.
- Anonymous quest progress is not supported in v1.
- The public profile link is only created after sign in. It shows the card and rank, and users can switch it to private or delete it at any time.

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
- Wrapped to quest conversion (share of card users who sign in and create a quest)
- Day 7 return rate for quest users (cohort: users who created at least one quest)

## Open questions
- Final product name and domain (the repo uses "DailyArc"; this affects share URLs)
- Whether signup is required before the first card (default: no)
- Which watcher types to add after launch
- Whether the watcher type should give a small cosmetic bonus to quests (for example a title or badge)
