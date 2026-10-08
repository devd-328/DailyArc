# Design System

## Direction: printed cel, not glowing screen
DailyArc looks like something printed and painted, the way anime is actually made: flat cel colors, hard ink outlines, halftone screentone, and bold sound-effect lettering. It is NOT a dark neon dashboard. No purple-to-cyan gradients, no glow, no frosted glass, no generic startup fonts.

The one memorable thing: the Anime Wrapped card and the stat screen look like a freshly printed character sheet, with chunky outlines and offset shadows. Everything else stays quiet.

## Sources of truth
- Tokens, rules and component specs: this file.
- Layouts and exact values per screen: the mockups in `/mockups` (open the `.html` files, the `.png` files are renders). See "Screen references" at the bottom.
- The older mockup `Home screen@2x.png` and the earlier Claude artifact are superseded by `mockups/home-v2.html` (it fixes the wrong rank and XP numbers).

## Color tokens (light first, dark is an inversion, not a separate theme)
--paper:        #EEF2F6   cool blue-white page background
--ink:          #1B2559   deep navy for text, outlines and shadows
--pink:         #FF5A8A   primary actions, level-up moments
--sun:          #FFC93C   XP, rewards, S rank
--teal:         #2FA39A   success, completed quests, cel shadow tone
--card:         #FFFFFF   card and row surfaces
--paper-2:      #DDE4EE   stat chips, side quest card and screentone base
--ink-soft:     #5B6794   secondary text
--danger:       #E5484D   delete and destructive text only

Halftone dots: #C9D3E3 (home and app screens), drawn behind hero areas only.
Dim overlay (sheets only): rgba(27, 37, 89, 0.62). Flat, no blur.

### Rank colors and letters (always paired with the rank letter)
| Rank | Fill | Letter color | Contrast |
| --- | --- | --- | --- |
| E | #9AA7B8 | --ink | 5.9:1 |
| D | #2FA39A | --ink | 4.7:1 |
| C | #3B6CFF | white | 4.4:1 (the letter is 48px or larger, so the large text threshold of 3:1 applies) |
| B | #FF5A8A | --ink | 4.9:1 |
| A | #FF8A3D | --ink | 6.2:1 |
| S | #FFC93C | --ink | 9.4:1 |

Level to rank: E 1 to 9, D 10 to 19, C 20 to 29, B 30 to 39, A 40 to 49, S 50. Always take the rank from `rankForLevel()`, never type it by hand in a mockup or component.

Dark mode: background --ink, text --paper, same accent colors. Do not use near-black.
Text on --pink and --sun buttons is --ink, never white.

## Typography (Google Fonts, free)
- Display: Dela Gothic One. Heavy Japanese gothic with a poster feel. Used for the watcher type name, level, big stats, and screen titles. Keep it large and sparse, never for paragraphs.
- Body and UI: Zen Kaku Gothic New (weights 400, 500, 700). Clean, slightly narrow, and it carries katakana for sound-effect accents.
- No monospace face. Numbers use Dela Gothic One when big and Zen Kaku Gothic New 700 when small, with tabular figures on.
- App scale: 13, 14, 15, 16, 18, 19, 20, 22, 32, 48
- Wrapped card scale (1080 wide): 28, 34, 40, 64, 76, 168. The three stat block numbers use 64 (76 does not fit a value like "1,264" in a third of the width). The level in the footer uses 76.
- Sentence case everywhere. No all caps labels, no tracked-out eyebrows.
- Line length under 70 characters for body copy.

## Shape and surface
- Every container has a 2px --ink outline and a hard offset shadow: 4px 4px 0 --ink on large panels, 3px 3px 0 on rows, chips and buttons. No blur shadows.
- Radius by role: cards 6, inputs 6, chips 999, rank badge 2 (nearly square), buttons 10, bottom sheet 6 on the top corners only.
- Pressing a button moves it 3px toward its shadow (shadow shrinks to 1px). This is the main interaction feel.
- Background texture: halftone dot pattern (radial-gradient dots, 8px grid, 1.6px radius) behind hero areas only, fading out with a vertical mask. Not on every card.
- Speed lines appear only during level up and rank up, as a one-time burst behind the new rank badge.
- Dashed outlines are allowed only for empty-state placeholders (the ghost card).

## Components

### Core
- Rank badge: square, rank color fill, 2px ink outline, big rank letter in Dela Gothic One, letter color from the rank table. Sizes: 76 (home), 64 (public profile), 60 (profile), 176 (rank up, 3px outline), 150 (on the Wrapped card, 6px outline). Rank S is a 12 point starburst shape instead of a square. Higher ranks look physically different, not just recolored.
- XP bar: 14px tall, 2px ink outline, --paper track, --sun fill with diagonal hatch lines (repeating-linear-gradient 45deg, #FFC93C 0 6px, #F2B51F 6px 9px), a 2px ink edge on the fill, no rounded ends. Fills in steps, like a progress gauge in a game.
- Primary button: --pink fill, ink text, 2px outline, radius 10, offset shadow, min height 48. Secondary button: white fill, same shape. Small button: min height 44.
- Chips: stat chip (--paper-2 fill, radius 999, padding 2px 10px, 13px 700), XP chip (--sun fill, 2px outline, radius 999, padding 1px 9px, 13px 700), weekly tag (white fill, 2px outline, radius 999, padding 0 8px, 13px 700).
- Taped label: --sun fill, 2px outline, 3px 3px 0 shadow, rotated 2 to 3 degrees. Used for the username, the streak on the stats screen and the "Side quest" label.
- Streak pill: white fill, 2px outline, radius 999, padding 6px 14px, 14px 700.
- Input: 52px tall, white fill, 2px ink outline, radius 6, 16px text. Placeholder is --ink-soft weight 500. Typed value is --ink weight 700. Label above in 14px 700.
- Sound-effect lettering: one katakana or romaji word used as graphic texture on key moments, Dela Gothic One, --pink, rotated 8deg. Max one per screen. ドン is used on rank up and level up and on the landing hero. The home screen has none by default (ゴゴゴ may appear on a long streak).
- Section label (settings screens): 14px 700 --ink-soft, margin 12px 0 6px.

### Quests
- Quest row: white, 2px outline, radius 6, 3px 3px 0 shadow, padding 10px 12px, min height 66, 12px gap. Layout: checkbox, then quest name (16px 700) with the chips on a line below (stat chip, then a weekly tag if weekly), then the XP chip on the right. Putting chips under the name keeps every row the same height.
- Checkbox: 28x28 square, 2px outline, no radius. Empty is white. Done is --teal fill with a white check (stroke 3.5 to 4, rounded caps). Checking it plays a short hanko-style stamp (a pink circle) and floats the XP gain as "+20 XP". The settled state is the teal check. Done rows use --ink-soft text with a line-through.
- XP chip shows the real XP the user gets (base XP with the streak bonus on daily quests, for example "+33 XP"). Explain the bonus once under the section heading ("Streak bonus: +10% XP on daily quests"), 13px 500, with the bonus in --ink 700. Weekly quests show base XP only.
- Starter quest row: same as a quest row without a checkbox. On the right, an "Add" small button. After adding, it becomes an "Added" tag (--teal fill, 2px outline, radius 10, 14px 700).
- Side quest card (v1.1): --paper-2 fill, 2px outline, radius 6, 4px 4px 0 shadow, padding 20px 16px 14px. A taped "Side quest" label sits on the top edge (top -15px, left 14px). Contains the quest name, chips (stat chip in white, XP chip), and two buttons: "Done" (pink) and "Reroll (1 left)" (white). Below it, a 13px --ink-soft line: "Optional. No streak bonus. Resets tomorrow." Done state: white fill, a 30px teal check stamp, name with line-through, no buttons, line below reads "Side quest done. A new one arrives tomorrow." Its XP chip never includes the streak bonus.
- New quest sheet: white, 2px outline (no bottom edge), top corners radius 6, padding 18px 20px 22px, over the flat dim overlay. Title in Dela Gothic One 22px, close button 44x44 (white, radius 10, 3px shadow). Option chips: min height 44, 2px outline, radius 999. Selected is --pink with a 3px shadow, the selected XP option is --sun. XP and cadence options are equal-width segments with an 8px gap.

### Stats and profile
- Stat row: label left, level right ("Lv 15", 13px 700 --ink-soft), a segmented bar of 10 blocks beneath. Each block is 10 percent of progress to the next level of that stat (the stat level comes from `levelFromXp` on the stat's XP). Blocks are 14px tall with a 2px ink outline, filled blocks are --sun, empty ones are --paper. The top stat gets a small "Top" chip (--sun, 13px 700).
- Stat screen: reads like a character sheet. Left column (92px) holds the rank badge, the word "Level" and the level number in Dela Gothic One 32. The right column holds the five stat rows. The streak sits in a taped label at the top right of the screen header. Below the sheet, a small panel with "Total XP" and "Next rank".
- Settings list: white container, 2px outline, radius 6, 3px 3px 0 shadow. Rows are min 48px, padding 6px 12px, label 15px 700 on the left, value 14px 500 --ink-soft on the right, rows separated by a 2px --paper-2 line.
- Status tag: "Linked" is --teal fill with ink text and a 2px outline. "Off" is --paper-2 fill.
- Switch: 54x30 pill, 2px outline. On is --teal with a white 22px knob (2px outline) on the right. Off is --paper-2 with the knob on the left.
- Danger text: "Delete account and data" is plain --danger 14px 700 centered text, not a button, placed below the sign out button.
- Empty state ghost card: 190x338, 2px dashed --ink-soft outline, radius 6, rotated -3deg, white at 60 percent, a "?" in Dela Gothic One 64 --ink-soft. Followed by a Dela Gothic One 22 title, one line of 15px text and a pink button.
- Provider buttons on the sign-in screen use text only ("Continue with AniList", "Continue with Google") with a small neutral square glyph. Do not use brand logos.

### Navigation
- Bottom tab bar: full width, 76px tall, solid --ink background, four tabs spaced evenly (Quests, Stats, Cards, Profile).
- Tab: min width 72, height 52, an 18px line icon (24 viewBox, stroke 2.2, round caps) above a 13px 700 sentence case label, 2px gap.
- Active tab: --pink fill, ink text and icon, 2px paper outline, radius 10. Inactive: transparent, paper text.

## Anime Wrapped card spec
Sizes: 1080x1920 (story) and 1080x1080 (square). Safe margin 96px. On screen, the card is previewed by scaling the real 1080x1920 layout (0.3 on landing and result, 0.26 when more content must fit, 0.23 on the public profile), inside a 2px outline with a 4px shadow.
Story layout, with the values used in the mockups:
1. Top left: username on a taped label (top 96, 6px outline, 9px shadow, 40px text, rotated -2deg). Top right: small DailyArc mark (Dela Gothic One 40).
2. Hero: watcher type name at 168px Dela Gothic One on two lines, rotated -3 degrees, ink text with a pink offset shadow (8px 8px 0).
3. Under it: one plain sentence describing the type, 40px 500.
4. Three stat blocks (hours, episodes, completion rate), each a boxed panel (6px outline, 10px 10px 0 shadow, 16px gap between panels). Big numbers in Dela Gothic One 64 with slightly tight letter spacing, labels at 28px 700 --ink-soft.
5. Top 3 genres as outlined chips (6px outline, radius 999, 40px 700) in different cel colors (--sun, --teal, --pink).
6. Hot take in a speech bubble (6px outline, radius 36, 10px shadow) with a tail pointing down-left. A "Hot take" label in Dela Gothic One 34 --pink above the text (40px 700).
7. Bottom: rank badge (150px) plus level (Dela Gothic One 76) and "C-rank Binge Demon" below it (28px 700 --ink-soft), and the URL at the bottom right (28px 700 --ink-soft).
   - If the person has no linked profile (a visitor looking up a name), there is no rank badge. Show "Anime Wrapped for username" instead.
   - The URL is a placeholder (`domain.tld`) until the product name and domain are decided.
Background: --paper with halftone dots fading in from the top (dots scale up with the card: 4.5px radius, 22px grid). Each watcher type gets its own accent color so cards look different in a feed.

## Motion
- One orchestrated moment: the card assembles on load, panels stamping in one after another in about 700ms.
- Interaction motion only otherwise: button press, checkbox stamp, XP gauge fill in steps.
- Level up and rank up: badge slams in with scale overshoot (rotated -4deg), speed line burst, short screen shake. Under 1 second.
- No fade-and-slide-up on every section, no hover effects on every card.
- Respect prefers-reduced-motion by swapping animations for instant state changes.

## Accessibility
- Ink on paper is high contrast. Ink on pink and sun passes 4.5:1.
- Rank letters follow the table above. The white letter on rank C is 4.4:1 and is only allowed at large sizes (48px and up).
- The white check on teal is 3.1:1. It is a graphic element, which only needs 3:1, and the done state also changes the text (strike-through) so it is not color alone.
- Targets at least 44px. Visible keyboard focus: 3px --pink outline with 2px offset.
- Rank is always shown as a letter, never color alone.
- Secondary text (--ink-soft) is 4.9:1 on --paper and 5.5:1 on white. It is not used on --paper-2 at small sizes (4.3:1).

## Copy tone
Plain and punchy, like a quest board. Describe what happens. The quest home always shows a rotating rival roast from the owner pool in `lib/roast-copy.ts`. Roast habits and effort only, never body, family or identity. Leaderboard rival lines are stored but unused in v1. Sentence case, no em dashes.

## Screen references
Open these files in a browser to see each screen. Values below are the ones to match.

| File | Shows |
| --- | --- |
| `mockups/home-v2.html` | Home (quests) for a returning user, and the first-visit variant with the large card prompt |
| `mockups/screens.html` | Landing (earlier version), Wrapped result, Stats, New quest sheet, Rank up, Public profile |
| `mockups/screens-auth.html` | Landing with sign-in, Wrapped result for a visitor, Sign in or sign up, Profile (AniList linked), Profile (not linked), Cards tab empty state |
| `mockups/screens-quests.html` | Starter quests (new user), daily side quest, side quest done |

If two mockups differ, the newest file for that screen wins (`screens-auth.html` over `screens.html` for the landing and Wrapped result).

### Home screen reference (matches `mockups/home-v2.html`)
Frame 390x844. Page padding 24px top, 20px sides. Background --paper with a halftone dot layer over the top 330px, fading to transparent with a vertical mask.

Header row (margin-bottom 18):
- Username label: taped label, padding 6px 14px, Zen Kaku 700 15px, rotated -2deg.
- Streak pill: text "Streak: 12 days".

Character card:
- White, 2px outline, radius 6, 4px 4px 0 shadow, padding 16, flex with 16px gap.
- Rank badge: 76x76, rank color from `rankForLevel(level)` (level 27 is C, blue with a white letter), letter 48px.
- Level text: Dela Gothic One 32px ("Level 27"). No sound effect on this screen by default.
- XP bar as in Components. Caption: 13px 500 --ink-soft, "640 of 1,684 XP to level 28" (the number is `xpToNext(27)` = round(12 x 27^1.5)).

Section heading: "Today's quests" in Dela Gothic One 22px, with "2 of 5 done" at 14px 700 --ink-soft on the right. Margin 22px top. Under it the streak bonus line (13px 500, 10px bottom margin).

Quest rows: as in Components. Stat names are the full schema names: Strength, Intelligence, Discipline, Charisma, Vitality (not "Intellect").

Below the list:
- "+ New quest" secondary button, full width, min height 48, margin-top 14. Under it, "5 of 8 quests used" (13px 500 --ink-soft, centered).
- Anime card row (after the card has been opened once): white panel, 3px shadow, padding 10px 12px, a 28px pink square, "Your anime card" (15px 700) with the watcher type below (13px 500 --ink-soft), and a small pink "Share" button.

First-visit variant: until the user opens their card once, show the large pink panel instead of the small row, above "Today's quests" (margin-top 22): --pink fill, 2px outline, radius 6, 4px 4px 0 shadow, padding 14px 16px, title Dela Gothic One 19px "Your anime card is ready", subtext 14px 500, and a white "Open card" button.

Bottom tab bar: as in Components, Quests active.

### Other screens, key points
- Landing: wordmark (Dela Gothic One 20) and a "Sign in" pill in the header. Hero in Dela Gothic One 48px, 1.05 line height, with one word in --pink and a 3px 3px 0 ink text shadow ("Find your anime type."). One-line lead (16px 500). Username input and a pink "Make my card" button, then "No account needed for the card." Then three short how-to lines, then a panel "No AniList? Still play." with a pink "Start quests" button. A sample card tilted 4 degrees sits in document flow under the form. On the phone it is clipped to a 240px peek. It must not overlap the form or sit off-center. From 1024px the form sits on the left and the full sample card sits on the right.
- Landing is designed mobile first (the 390-wide mockup). Below about 380px the hero can drop to 40px so "Find your anime type." still fits. From 768px the same stacked layout sits in a wider column and more of the sample card is visible below the form. From 1024px the form sits on the left and the sample card sits on the right. Tokens, type, and components stay the same. Padding uses the device safe area. Card previews use `min(100%, 1080px * scale)` so they never overflow a modal or column.
- Signed-in app, from 1024px: left tab rail (220px, --ink) and a two-column main (board + how-it-works rail). Below 1024px the tab bar stays on the bottom (PWA-ready). New quest is a bottom sheet on small screens and a centered dialog (max-width 32rem, max-height 80dvh) from 1024px.
- Wrapped result: card preview, then "Save for story" (pink), "Save square" and "Copy link" (white, side by side). A visitor also sees a panel "Add your rank to this card" with a pink "Sign up" button.
- Sign in or sign up: title in Dela Gothic One 32. Pink "Continue with AniList", white "Continue with Google", a divider with "or", an email input and "Email me a sign-in link", then "No password. We send you a link."
- New quest: sheet over the dimmed quests screen. Fields in order: name, Trains (five stat chips), XP (10, 20, 30), Repeats (Daily, Weekly), pink "Save quest", and "x of 8 quests used after saving".
- Proof: the quest checkbox opens a sheet with the same chrome as New quest. Title "Show your proof", the quest name, then "Your proof is checked and deleted instantly. We never save your photos." and "Live camera only. A saved photo does not count." A 4:3 live camera sits in a 2px ink frame. Pink "Snap" takes the frame. If the camera is blocked, the frame shows that message and a white "Try the camera again". While waiting, "Checking your proof..." pulses. The verdict uses the coach line colors: teal on a pass, pink on a fail, white when the photo needs a retake. "Try again" is the white button. The live view stops after the snap. No saved photo is shown.
- Rank up: centered. Speed lines (repeating-conic-gradient, ink at 16 percent, 3 degrees on and 9 off, radial mask) behind a 176px badge rotated -4deg with a 6px 6px 0 shadow, ドン at 48px beside it, "Rank up" in Dela Gothic One 48, "Level 30" in 32, one line of copy, a slim XP bar, a pink "Keep going" and a white "Share my rank" button.
- Public profile: shows only username, rank, level, watcher type and the card. No streak, XP or stats. Ends with a pink panel "What is your type?" and a "Make my card" button.
- Profile: header panel (60px rank badge, username 18px 700, level and watcher type, best streak), then AniList, Public page and Settings sections, a white "Sign out" button, and the danger text. Without AniList, the AniList section shows "Not linked" and a pink "Link AniList" button, and the watcher type line reads "no watcher type yet".
- Cards tab (not linked): ghost card, "No card yet", "Link your AniList account to build your card.", pink "Link AniList", and "Your quests and rank keep working without it."
