# DailyArc: Project Brain

Read this file first in every session, then read RULES.md (how to avoid guessing). Then read the file that matches your task:
- Product decisions: PRODUCT.md
- Data, APIs, logic: ARCHITECTURE.md
- Anything visual: DESIGN_SYSTEM.md

## What this is
DailyArc (working name) turns real life into an anime power-up story. Two features in one app:
1. Anime Wrapped: enter an AniList username, get a shareable card with your anime identity and watcher type.
2. Leveling: habits become quests that give XP, levels, ranks and stats, shown on a stat screen.

The card is the growth loop. The quest tracker is the retention loop. Build the card first.

## Owner
Dev Das, CS student, frontend focused. Prefer clear, boring, well-typed code over clever code.

## Stack (change here if it changes)
Installed and working (see package.json for exact versions):
- Next.js 16.4.0 (App Router, Turbopack, Cache Components and React Compiler enabled in next.config.ts), React 19.3.0, TypeScript, Tailwind CSS 4
- Vitest for unit tests, ESLint
- Node 24 is the local runtime

This Next.js version is newer than most model knowledge. Before writing Next.js code, read the matching guide in `node_modules/next/dist/docs/` (see AGENTS.md). Do not rely on memory for Next.js APIs.

Not installed yet:
- Supabase (auth, Postgres), added only when quests ship
- AniList GraphQL API for anime data. The card needs no login, only a public username. Quests, profile and the public page need an account: sign in with AniList, Google or email (see Auth in ARCHITECTURE.md)
- Hosting: Vercel

## Working rules
- Ship the smallest version that can be shown to a friend.
- v1 scope lives in PRODUCT.md. Do not add features outside it without asking.
- All colors, spacing and fonts come from DESIGN_SYSTEM.md tokens. No hardcoded hex values in components.
- Visual identity is printed cel and screentone, light first. Never use neon purple or cyan gradients, glow effects, glassmorphism, or default AI fonts (Inter, Space Grotesk, Poppins, Roboto). Fonts are Dela Gothic One and Zen Kaku Gothic New only.
- Keep stat and XP logic in pure functions under /lib so they can be unit tested.
- Never use copyrighted anime art, logos or the Solo Leveling name. Original styling inspired by the vibe only.
- Never use em dashes in any copy, captions or UI text. Use commas, periods or colons.
- Cache AniList responses and cards as defined in ARCHITECTURE.md (by username, day and config version) and respect rate limits.

## Visual source of truth
The approved mockups are the HTML files in /mockups (start with home-v2.html). Their exact values are written down in DESIGN_SYSTEM.md under Screen references. New screens must match that look exactly. The older Claude artifact and Home screen@2x.png are superseded because they show the wrong rank and XP numbers.

## Commands
- `npm run dev`: start the dev server
- `npm run build`: production build
- `npm run lint`: ESLint
- `npm run typecheck`: generates Next route types, then runs tsc
- `npm test`: Vitest, one run (`npm run test:watch` to watch)

## Folder layout
/app            routes and pages. app/fonts holds the self-hosted katakana subset for sound effects
/components     UI components (card, stat screen, quest row)
/lib            pure functions and config. Exists now: config.ts, types.ts, xp.ts, ranks.ts, streaks.ts, seasons.ts, stats.ts, watcherType.ts, username.ts, anilist.ts, wrapped.ts, card.ts, tokens.ts
/styles         tokens.css (design tokens, imported by app/globals.css and mapped to Tailwind there)
/brain          these brain files
/mockups        approved HTML mockups and renders

Tests sit next to the code they test (for example lib/config.test.ts).

## Setup status
Done: Next.js scaffold, Tailwind with design tokens, fonts (Dela Gothic One, Zen Kaku Gothic New, katakana subset), Vitest, `lib/config.ts`, the pure functions listed under /lib (with unit tests), the public landing screen, AniList fetch, `GET /api/wrapped/[username]`, the Wrapped result page, and card image export (`GET /api/card/[username]?format=story|square`, Save for story and Save square).
Not done yet: `/login` and accounts, and IP rate limiting on public APIs. `/login` is linked from the landing and result and is not built yet.
Dark mode is not implemented (light first).

## Definition of done
Works on mobile width first, matches tokens, has no console errors, and the card exports cleanly at 1080x1920 and 1080x1080.
