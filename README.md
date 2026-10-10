<div align="center">

# DailyArc

**Level up your real life like an anime protagonist, then share your anime identity card.**

Anime Wrapped for any public AniList username, and a quest tracker that turns habits into XP, levels, ranks, and stats.

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16-1B2559?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-FF5A8A?style=flat-square&logo=react&logoColor=1B2559)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3B6CFF?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-2FA39A?style=flat-square&logo=tailwindcss&logoColor=1B2559)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-FFC93C?style=flat-square&labelColor=1B2559&color=FFC93C)](LICENSE)

<br />

[Getting started](#getting-started) · [What it does](#what-it-does) · [Ranks](#ranks) · [Docs](#project-docs)

</div>

---

## What it does

Two loops, one app. The card is how people find DailyArc. The quests are why they come back.

<table>
<tr>
<td width="50%" valign="top">

### Anime Wrapped

Look up any public AniList username. No account needed.

- Hours watched, episodes, top genres, favorite studio
- Completion rate and a hot take
- One of five watcher types, plus a runner-up trait
- Save a 9:16 story or a 1:1 square, or copy a public link

</td>
<td width="50%" valign="top">

### Quest tracker

Sign in, then turn habits into quests.

- Daily and weekly quests that train five stats
- XP, levels, and ranks from E to S
- Streaks with a bonus, and a reminder before the daily reset
- A public profile that shows rank, level, and the card

</td>
</tr>
</table>

Sign in with AniList, Google, or an email link. Linking AniList is how a username is proven. A name typed into a form is never treated as owned.

## Watcher types

Rarer types are checked first. If nothing matches, the card is a Wanderer.

| Type | You are this when |
| --- | --- |
| Genre Loyalist | One genre is more than 40% of the list |
| Classic Purist | At least 60% of the list aired before 2010 |
| Seasonal Sampler | Half the list is from the last few seasons, with a high drop rate |
| Binge Demon | About 150 episodes a month, averaged over the last year |
| Wanderer | Nothing else matches |

The card can pair a watcher type with a real-life rank. Example: **S-rank Binge Demon**.

## Ranks

| Rank | Levels | Feel |
| :---: | --- | --- |
| **E** | 1 to 9 | Starting out |
| **D** | 10 to 19 | A few weeks in |
| **C** | 20 to 29 | A season of showing up |
| **B** | 30 to 39 | Close to a year |
| **A** | 40 to 49 | A long arc |
| **S** | 50 | The cap. Meant to take years, and to be reachable |

Five stats sit under the overall level: Strength, Intelligence, Discipline, Charisma, and Vitality. Each quest feeds one of them.

## Stack

| | |
| --- | --- |
| App | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Data | Supabase (Postgres, Auth, row level security) |
| Anime data | AniList GraphQL, public lists only |
| Tests | Vitest |

## Getting started

Node 24 and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` and fill in Supabase, AniList, and push keys before sign-in, quests, or the public profile will work. Wrapped lookup for a public username is the open path.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types, then typecheck |
| `npm test` | Run Vitest once |

## Project docs

Product decisions, data rules, and the visual system live in [`/brain`](brain):

| File | Read it for |
| --- | --- |
| [`brain/CLAUDE.md`](brain/CLAUDE.md) | Start here |
| [`brain/RULES.md`](brain/RULES.md) | How to avoid guessing |
| [`brain/PRODUCT.md`](brain/PRODUCT.md) | Scope, quests, ranks, sharing |
| [`brain/ARCHITECTURE.md`](brain/ARCHITECTURE.md) | Data, APIs, auth |
| [`brain/DESIGN_SYSTEM.md`](brain/DESIGN_SYSTEM.md) | Color, type, and components |

Approved screen mockups are in [`/mockups`](mockups).

## License

[MIT](LICENSE). Copyright (c) 2026 Dev Das.
