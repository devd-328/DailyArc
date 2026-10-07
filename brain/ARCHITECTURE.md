# Architecture

## Stack
- Next.js (App Router, TypeScript)
- Supabase: Postgres, Auth (email sign-in link and Google as built-in providers, AniList as a custom flow, see Auth), row level security
- Image generation: `next/og` (Satori) in an API route
- Hosting: Vercel (CDN caching for card images)
- Analytics: PostHog, or the `events` table below
- Tests: Vitest. Everything in `/lib` is pure and must have unit tests. The leveling and watcher type rules are where bugs will hide.

## Data flow
Username -> validate -> /api/wrapped/[username] -> cache lookup -> AniList GraphQL -> computeStats() -> pickWatcherType() -> JSON -> card component and /api/card image route.

## AniList query (shape)
Fetch `MediaListCollection(userName, type: ANIME)` with:
- list entry: status, `score(format: POINT_100)`, progress, repeat, startedAt, completedAt, updatedAt
- media: title, format, episodes, duration, genres, season, seasonYear, startDate, averageScore, `studios(isMain: true)`

Notes:
- Always request scores as POINT_100. Users have different score formats (10 point, stars and so on), and the hot take compares against the community `averageScore` which is also out of 100.
- `isMain: true` on studios so that sequels and co-productions don't skew the favorite studio.
- `season` and `seasonYear` feed Seasonal Sampler. `startedAt`, `completedAt` and `updatedAt` feed the episodes per month calculation for Binge Demon.
- Large lists come back in chunks. Loop on `hasNextChunk` until done.
- Use `progress` (not `media.episodes`) for episodes watched, so currently watching and dropped titles count correctly. Add rewatches via `repeat`.

Error handling:
- User not found -> 404 with code `USER_NOT_FOUND`
- Private profile -> 403 with code `PRIVATE_LIST`
- Empty list -> 200 with code `EMPTY_LIST` and no stats
- Rate limit (429) -> retry once or twice using the `Retry-After` header, then return 503 with code `UPSTREAM_BUSY`. Serve stale cache if any exists.

## Core pure functions (/lib)
- computeStats(list): returns hours, episodes, topGenres, topStudio, completionRate, hotTake (null if fewer than 5 scored titles)
- pickWatcherType(stats, config): returns one of the 5 types plus the runner-up
- xpToNext(level): round(12 * level^1.5). Valid for levels 1 to 49 (level cap is 50)
- levelFromXp(totalXp): derives level (capped at 50) from total XP
- rankForLevel(level): E, D, C, B, A or S
- applyStreakBonus(xp, streakDays): +10 percent at 7 days, +25 percent at 30 days (daily streaks only)
- localCheckinDate(now, timezone): applies the 3:00 AM grace window and returns the local date
- periodStart(date, cadence): the date itself for daily, the Monday of that week for weekly

### Config (/lib/config.ts)
One file for every tunable number, so that rule changes don't need logic changes:
- level cap, XP curve constant and exponent, rank thresholds
- daily base XP cap (150), max active quests (8), allowed XP values (10, 20, 30)
- watcher type thresholds (40 percent genre, 60 percent pre-2010, 50 percent current seasons with 30 percent drop rate, 150 episodes per month)
- grace hour (3), cache TTLs
- starter quests shown (5 to 8), side quest rerolls per day (1)
- `CONFIG_VERSION`: bump when any threshold changes. It is part of every cache key.

## Auth
Anyone can use the Wrapped card without an account. Accounts are needed for quests, profile and the public page.

Sign in methods (one screen for sign in and sign up):
- Email: a sign-in link, no password.
- Google.
- AniList.

AniList note (to verify before building): Supabase Auth has no built-in AniList provider that I have confirmed. AniList uses OAuth 2 but is not a standard OpenID Connect provider. Plan: a custom route `/auth/anilist` redirects to AniList, `/auth/anilist/callback` exchanges the code on the server, calls the AniList `Viewer` query to get the verified id and name, then either links it to the signed-in user or signs in the user who already has that id (using the Supabase admin API). Check the current Supabase and AniList docs first. If this proves too costly, ship email and Google first and add AniList linking right after.

Linking rules:
- `anilist_user_id` and `anilist_username` are set only from the verified AniList response, never from client input.
- An AniList id that is already linked to another account is rejected with a clear error.
- A user with no linked AniList account can use quests. They have no card and no watcher type.

Access:
- Public (no login): `/`, `/login`, `/wrapped/[username]`, `/u/[username]`, `/api/wrapped/[username]`, `/api/card/[username]`.
- Auth required: `/onboarding`, `/quests`, `/stats`, `/cards`, `/profile` and every write API. Signed-out requests are redirected to `/login`.

First sign in goes through `/onboarding`: pick a username (default: the AniList name if it is free), and the timezone is detected from the browser and saved to the profile.

## Database (Supabase, added with quests)

### profiles
id (uuid, = auth user id), username (unique), anilist_user_id (nullable, unique), anilist_username (nullable, unique), timezone (default 'UTC'), total_xp (default 0), current_streak, longest_streak, last_checkin_date, watcher_type (nullable), is_public (default true), created_at

- Level is not stored. It is derived from `total_xp`, so the two cannot drift apart.
- `username` is the public name used in `/u/[username]`. It is chosen by the user and does not have to match the AniList name.
- `anilist_username` and `anilist_user_id` are only set by the AniList link flow, never from client input. This stops someone from claiming another user's AniList name and showing a rank on it.
- `watcher_type` is filled when the AniList account is linked and the Wrapped data has been computed. It stays null for users without AniList.
- `current_streak` is the daily streak: a day counts when at least one daily quest was checked in. Weekly quests do not count toward it.

### quests
id, user_id, name, stat (enum: strength, intelligence, discipline, charisma, vitality), xp_value (check in 10, 20, 30), cadence (enum: daily, weekly), weekly_streak (default 0), active, template_id (nullable, set when added from a starter quest), created_at

### checkins
id, quest_id, user_id, period_start (date), base_xp, xp_awarded, created_at
Unique on (quest_id, period_start).

- For daily quests `period_start` is the user's local date (after the grace window). For weekly quests it is the Monday of that week.
- `base_xp` is the XP before the streak bonus (used for the daily cap). `xp_awarded` is what the user received.

### stats
user_id, strength_xp, intelligence_xp, discipline_xp, charisma_xp, vitality_xp

- Stores XP per stat. Stat levels are derived with `levelFromXp`.

### wrapped_cache
anilist_username, day (date), config_version, payload (jsonb), created_at
Unique on (anilist_username, day, config_version).
Only the server (service role) reads and writes it.

### quest_templates
id, name, stat (same enum as quests), xp_value (check in 10, 20, 30), kind (enum: starter, side), active (default true), created_at
- Content comes from a seed file in the repo, written and approved by the owner (see PRODUCT.md for the content rules). Agents do not invent rows.
- Readable by signed-in users. No client writes.

### side_quests (v1.1)
id, user_id, local_date (date), template_id, base_xp, rerolled (default false), completed_at (nullable), created_at
Unique on (user_id, local_date).
- One row per user per local day. The row is created the first time the user opens the day, by the server, so a refresh shows the same quest.
- `base_xp` is copied from the template when the row is created.

### events
id, name (`wrapped_generated`, `card_exported`, `sign_in_started`, `sign_in_completed`, `anilist_linked`, `quest_created`, `quest_checkin`, `starter_quest_added`, `side_quest_rerolled`, `side_quest_completed`), anilist_username (nullable), user_id (nullable), props (jsonb), created_at
Used for the success metrics. Insert only, through the server.

### Views and functions
- `public_profiles` view: username, anilist_username (nullable, needed to render the card), level (via the SQL function `level_from_xp`), rank, watcher_type (nullable). Only rows where `is_public = true`. It never exposes `id`, `user_id`, email, timezone or XP details.
- `level_from_xp` and `rank_for_level` SQL functions mirror the TypeScript ones. A parity test runs both against the same values.
- `check_in(quest_id)` Postgres function (security definer). See Check-in flow.

### Row level security
- Users can read their own rows in profiles, quests, checkins and stats.
- Users can insert and update their own quests (name, stat, xp_value, cadence, active). They cannot touch XP, streak, level or watcher type columns.
- Clients have no insert or update access to `checkins`, `stats` or any XP or streak column. These change only through `check_in()`.
- Users can read `quest_templates` and their own `side_quests`. They cannot write to either. Side quests change only through server functions.
- `public_profiles` is the only thing readable without auth.

## Check-in flow
`POST /api/checkins { quest_id }` calls the `check_in(quest_id)` function, which runs in one transaction:
1. Load the quest and check that it belongs to the caller and is active.
2. Work out the user's local date from their timezone and the grace window, then the `period_start`.
3. Insert the check-in. The unique key rejects duplicates, so a double click or a retry returns the existing result and awards nothing twice.
4. Apply the daily cap: the sum of today's `base_xp` is limited to 150. In v1.1 this sum includes the day's completed side quest.
5. Update the streak (continue, or reset to 1 if a day was missed), then apply the streak bonus to daily quests.
6. Add XP to `profiles.total_xp` and to the matching column in `stats`.
7. Return the new level, rank, streak and XP awarded.

The client never sends an XP value. XP comes only from the quest record.

Creating a quest is limited to 8 active quests, enforced in the database with a trigger or check function, not only in the UI.

## Starter quests and side quests

### Starter quests (v1)
- `GET /api/quest-templates?kind=starter` returns the active starter templates (5 to 8 are shown).
- `POST /api/quests/from-template { template_id }` creates a normal daily quest by copying name, stat and XP from the template on the server. The client sends only the template id. The 8 quest limit applies.

### Daily side quest (v1.1)
- `GET /api/side-quest` returns today's side quest. If today's row does not exist, the server picks a random active `side` template that is not yesterday's, and inserts the row.
- `POST /api/side-quest/reroll` is allowed once per day and only while not completed. It replaces the template with a different one and sets `rerolled`.
- `POST /api/side-quest/complete` calls the `complete_side_quest()` Postgres function (security definer), in one transaction:
  1. Load today's row for the caller (local date with the grace window). Reject if already completed.
  2. Apply the daily cap together with that day's check-ins.
  3. Set `completed_at`. Award exactly `base_xp`. No streak bonus. The streak is not changed.
  4. Add XP to `profiles.total_xp` and to the matching column in `stats`.
  5. Return the new level, rank and XP awarded.
- Side quests never count toward the 8 quest limit or the "x of y done" count.

## Routes
```
GET    /                          landing and username input (public)
GET    /login                     sign in or sign up: AniList, Google, email (public)
GET    /auth/callback             Supabase callback for email and Google
GET    /auth/anilist              starts AniList OAuth (sign in or link)
GET    /auth/anilist/callback     AniList OAuth callback
GET    /onboarding                pick username, save timezone (auth, first sign in)
GET    /wrapped/[username]        result page with share buttons, Open Graph tags point to /api/card (public)
GET    /api/wrapped/[username]    returns Wrapped JSON (cached, public)
GET    /api/card/[username]       returns PNG (query: format=story or square, public)
GET    /u/[username]              public profile, Open Graph tags point to /api/card
GET    /quests                    quest board (auth)
GET    /stats                     stat screen (auth)
GET    /cards                     own card, or the link AniList empty state (auth)
GET    /profile                   own account, AniList link, public page switch, settings (auth)
POST   /api/quests                create or update a quest (auth)
POST   /api/checkins              check in (auth)
GET    /api/quest-templates       starter templates (auth)
POST   /api/quests/from-template  add a starter quest (auth)
GET    /api/side-quest            today's side quest (auth, v1.1)
POST   /api/side-quest/reroll     reroll once per day (auth, v1.1)
POST   /api/side-quest/complete   complete today's side quest (auth, v1.1)
PATCH  /api/profile               update username, timezone, is_public (auth)
POST   /api/profile/refresh-card  refresh own card data, cooldown applies (auth)
DELETE /api/profile               delete profile, auth user and all related data (auth)
POST   /api/events                record a share or export event
```

## Caching
- AniList data: stored in `wrapped_cache` by (username, day, config_version). A manual refresh is allowed with a cooldown (suggested 10 minutes). Until Supabase ships, the same key is stored with Next.js `use cache` (`cacheLife('wrapped')`: revalidate 24 hours).
- Card images: served with CDN cache headers. The key is username, day, format and config_version.
- The rank and level badge on the card is read at render time from `public_profiles` and is not part of the cached Wrapped data. Cards for users who have a profile use a short CDN TTL (about 5 minutes), so a level up shows quickly. Cards for users without a profile use a long TTL.

## Rules
- Check-ins are idempotent per quest per period (day for daily, week for weekly).
- Dates use the user's local timezone stored on the profile, with the 3:00 AM grace window.
- Never trust client XP values. Compute XP on the server from the quest record.
- Cache AniList responses and generated cards by username plus day plus config version.
- Validate usernames before any upstream call: letters, digits and underscore only, 2 to 20 characters. Reject anything else with 400. (AniList's own rules are not verified, check them before relying on this.)
- A DailyArc `username` (public name) has the same character rules and must be unique. Reserved names (for example `api`, `login`, `u`, `wrapped`) are rejected, because they clash with routes.
- Rate limit `/api/wrapped`, `/api/card` and `/api/events` per IP, because they trigger upstream calls and image rendering.
- Never return internal ids from public endpoints.
- Deleting a profile removes its quests, check-ins, stats, events and its auth user, and clears its cache entries.
