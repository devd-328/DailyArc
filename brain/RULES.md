# Agent Rules: Do Not Guess

These rules exist to stop invented facts, invented files and invented features. If a rule here conflicts with your instinct, follow the rule.

## 1. Sources of truth
Read before you write. When files disagree, the higher one wins.

1. This file (RULES.md)
2. PRODUCT.md: what the product does, numbers, thresholds, scope
3. ARCHITECTURE.md: data, APIs, schema, routes, logic
4. DESIGN_SYSTEM.md: every visual value
5. CLAUDE.md: working style, stack, folder layout
6. The actual code in the repo

If something is not in these files or in the code, it is not decided. Do not fill the gap with a guess.

## 2. When you do not know, say so
- If a requirement, number, name or behavior is missing, stop and ask. Do not invent a default and build on it.
- If a small default is unavoidable, state it in your reply as "Assumption: ..." so it can be checked.
- Never present a guess as a fact. Use "I think" or "not verified" when you are unsure.
- If you cannot run or test something, say you did not run it. Never claim "tests pass" or "it works" without having run it.
- Open questions listed in PRODUCT.md (product name and domain, username rules for users without AniList, private list reading, post-launch watcher types) are unresolved. Do not pick an answer.

## 3. Never invent
- **Files and paths:** check that a file, folder, function or export exists (search the repo) before importing or referencing it. Do not assume `/lib` helpers exist.
- **Packages and APIs:** do not use a package, a function or an option you have not confirmed. Check `package.json` and the installed version, or the official docs. If it is not installed, ask before adding a dependency.
- **AniList fields:** use only the fields listed in ARCHITECTURE.md, or fields confirmed in the AniList GraphQL docs or schema. Do not make up field names, arguments or enums.
- **Database objects:** use only the tables, columns, views and functions in ARCHITECTURE.md. Changing the schema means changing ARCHITECTURE.md in the same change.
- **Numbers:** do not invent thresholds, XP values, caps or timings. They come from PRODUCT.md and `/lib/config.ts`. Never hardcode them in components or logic.
- **Design values:** no hex values, font names, spacings or radii that are not in DESIGN_SYSTEM.md tokens.
- **Facts about anime:** do not invent titles, studios, genres, scores or statistics for sample data. Use clearly fake placeholders (for example "Sample Title A") or real data fetched from AniList.
- **Links and sources:** do not invent URLs, docs pages or version numbers.

## 4. Stay in scope
- v1 scope is the "Included" list in PRODUCT.md. The "Not in v1" list is off limits: MyAnimeList import, friends and leaderboards, push notifications, native apps, payments, user-uploaded art.
- Do not add features, screens, settings, routes or tables that are not in the docs. If you think one is needed, propose it and wait.
- Do not refactor, rename or reformat code unrelated to the task.
- Build the card first, then the quest tracker (see CLAUDE.md).

## 5. Fixed project rules
- XP, levels, ranks, streaks and watcher types are pure functions in `/lib` with unit tests.
- Never trust client-sent XP. XP is computed on the server from the quest record.
- Check-ins go through the `check_in()` database function only.
- Level is derived from total XP. Do not store it.
- AniList scores are requested as POINT_100.
- Validate usernames before any upstream call.
- An AniList username counts as owned only after the AniList link flow. Never trust a typed username as identity.
- The Wrapped card works without an account. Do not put sign-in in front of it.
- Cache AniList responses and cards as described in ARCHITECTURE.md. Respect rate limits.
- No copyrighted anime art, logos or the Solo Leveling name.
- No em dashes in any copy, captions or UI text. Use commas, periods or colons.
- Fonts are Dela Gothic One and Zen Kaku Gothic New only. No neon gradients, glow effects or glassmorphism.

## 6. Verify before you say done
- Run the type check, linter and unit tests that exist. Report the actual result. If none exist yet, say so.
- For UI work, open the page and check it at mobile width. Do not describe how it looks without having looked.
- Cards must export at 1080x1920 and 1080x1080.
- Re-read your own diff. Remove leftovers: unused imports, placeholder text, `TODO` you made up, `console.log`.
- If you changed behavior, update the matching brain file in the same change.

## 7. Keeping the docs honest
- If you find two brain files that disagree, do not pick one silently. Point it out and ask.
- If you find the code and the docs disagree, report it. Do not "fix" the docs to match a bug.
- Do not edit PRODUCT.md thresholds or scope on your own. Those are the owner's decisions.

## 8. How to report
- Say what you changed, which files, and what you did not do.
- List every assumption and every thing you could not verify.
- Keep it short and factual. No hype and no claims you cannot back up.
