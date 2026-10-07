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

## Proposed stack (change here if it changes)
- Next.js (App Router), TypeScript, Tailwind CSS
- Supabase (auth, Postgres) added only when quests ship
- AniList GraphQL API for anime data. The card needs no login, only a public username. Quests, profile and the public page need an account: sign in with AniList, Google or email (see Auth in ARCHITECTURE.md)
- Card image export: server-side render with Satori or @vercel/og
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
The approved home screen mockup is at https://claude.ai/artifact/BhtbrDNSD2p78VAWnFrmXg and its exact values live in the Home screen reference section of DESIGN_SYSTEM.md. New screens must match that look exactly.

## Folder layout
/app            routes and pages
/components     UI components (card, stat screen, quest row)
/lib            pure functions and config (see ARCHITECTURE.md): xp.ts, ranks.ts, watcherType.ts, stats.ts, streaks.ts, anilist.ts, config.ts
/styles         tokens.css
/brain          these brain files

## Definition of done
Works on mobile width first, matches tokens, has no console errors, and the card exports cleanly at 1080x1920 and 1080x1080.
