# Design System

## Direction: printed cel, not glowing screen
DailyArc looks like something printed and painted, the way anime is actually made: flat cel colors, hard ink outlines, halftone screentone, and bold sound-effect lettering. It is NOT a dark neon dashboard. No purple-to-cyan gradients, no glow, no frosted glass, no generic startup fonts.

The one memorable thing: the Anime Wrapped card and the stat screen look like a freshly printed character sheet, with chunky outlines and offset shadows. Everything else stays quiet.

## Color tokens (light first, dark is an inversion, not a separate theme)
--paper:        #EEF2F6   cool blue-white page background
--ink:          #1B2559   deep navy for text, outlines and shadows
--pink:         #FF5A8A   primary actions, level-up moments
--sun:          #FFC93C   XP, rewards, S rank
--teal:         #2FA39A   success, completed quests, cel shadow tone
--card:         #FFFFFF   card and row surfaces
--paper-2:      #DDE4EE   stat chips and screentone base
--ink-soft:     #5B6794   secondary text
--danger:       #E5484D

Rank colors (always paired with the rank letter):
E #9AA7B8, D #2FA39A, C #3B6CFF, B #FF5A8A, A #FF8A3D, S #FFC93C

Dark mode: background --ink, text --paper, same accent colors. Do not use near-black.
Text on --pink and --sun buttons is --ink, never white.

## Typography (Google Fonts, free)
- Display: Dela Gothic One. Heavy Japanese gothic with a poster feel. Used for the watcher type name, level, big stats, and screen titles. Keep it large and sparse, never for paragraphs.
- Body and UI: Zen Kaku Gothic New (weights 400, 500, 700). Clean, slightly narrow, and it carries katakana for sound-effect accents.
- No monospace face. Numbers use Dela Gothic One when big and Zen Kaku Gothic New 700 when small, with tabular figures on.
- App scale: 13, 14, 15, 16, 19, 20, 22, 32, 48
- Wrapped card scale (1080 wide): 28, 34, 40, 76, 168
- Sentence case everywhere. No all caps labels, no tracked-out eyebrows.
- Line length under 70 characters for body copy.

## Shape and surface
- Every container has a 2px --ink outline and a hard offset shadow: 4px 4px 0 --ink. No blur shadows.
- Radius by role: cards 6, inputs 6, chips 999, rank badge 2 (nearly square), buttons 10.
- Pressing a button moves it 3px toward its shadow (shadow shrinks to 1px). This is the main interaction feel.
- Background texture: halftone dot pattern (radial-gradient dots in --paper-2, 6px grid) behind hero areas only. Not on every card.
- Speed lines appear only during level up, as a one-time SVG burst behind the new rank badge.

## Components
- Rank badge: square, rank color fill, 2px ink outline, big rank letter in Dela Gothic One. Rank S is a 12 point starburst shape instead of a square. Higher ranks look physically different, not just recolored.
- XP bar: 14px tall, ink outline, --sun fill with diagonal hatch lines, no rounded ends. Fills in steps, like a progress gauge in a game.
- Stat row: label left, value right, a segmented bar of 10 blocks beneath. One block equals 10 points.
- Quest row: big square checkbox. Checking it stamps a hanko style red-pink circle and floats the XP gain as "+20 XP".
- Primary button: --pink fill, ink text, outline and offset shadow.
- Sound-effect lettering: one katakana or romaji word used as graphic texture on key moments (for example ドン on level up, ゴゴゴ on a long streak). Max one per screen.
- Stat screen: reads like a character sheet. Left column holds a rank badge and level, right column holds the stat rows, a streak counter sits in a taped-on label.

## Anime Wrapped card spec
Sizes: 1080x1920 (story) and 1080x1080 (square). Safe margin 96px.
Story layout:
1. Top left: username on a taped label. Top right: small DailyArc mark.
2. Hero: watcher type name at 168px Dela Gothic One, rotated -3 degrees, ink text with a pink offset shadow (8px 8px 0).
3. Under it: one plain sentence describing the type.
4. Three stat blocks (hours, episodes, completion rate), each a boxed panel with outline and offset shadow, big numbers in Dela Gothic One.
5. Top 3 genres as outlined chips in different cel colors.
6. Hot take in a speech bubble shape with a tail.
7. Bottom: rank badge plus level, and the URL.
Background: --paper with halftone dots fading in from the top. Each watcher type gets its own accent color so cards look different in a feed.

## Motion
- One orchestrated moment: the card assembles on load, panels stamping in one after another in about 700ms.
- Interaction motion only otherwise: button press, checkbox stamp, XP gauge fill in steps.
- Level up: badge slams in with scale overshoot, speed line burst, short screen shake. Under 1 second.
- No fade-and-slide-up on every section, no hover effects on every card.
- Respect prefers-reduced-motion by swapping animations for instant state changes.

## Accessibility
- Ink on paper is high contrast. Ink on pink and sun passes 4.5:1.
- Targets at least 44px. Visible keyboard focus: 3px --pink outline with 2px offset.
- Rank is always shown as a letter, never color alone.

## Copy tone
Plain and punchy, like a quest board. Describe what happens. Examples: "Quest done. +20 XP." "Check in for today." "Streak: 7 days." Sentence case, no em dashes.

## Home screen reference (source of truth, matches the approved mockup exactly)
Mockup: https://claude.ai/artifact/BhtbrDNSD2p78VAWnFrmXg
Frame 390x844. Page padding 24px top, 20px sides. Background --paper with a halftone dot layer (dots #C9D3E3, 1.6px radius, 8px grid) over the top 330px, fading to transparent with a vertical mask.

Header row (margin-bottom 18):
- Username label: --sun fill, 2px ink outline, 3px 3px 0 ink shadow, padding 6px 14px, Zen Kaku 700 15px, rotated -2deg.
- Streak pill: white fill, 2px ink outline, radius 999, padding 6px 14px, 700 14px, text "Streak: 12 days".

Character card:
- White, 2px ink outline, radius 6, 4px 4px 0 ink shadow, padding 16, flex with 16px gap.
- Rank badge: 76x76 square, rank color fill (B is --pink), 2px ink outline, radius 2, letter in Dela Gothic One 48px.
- Level text: Dela Gothic One 32px ("Level 27"). Sound effect (ドン): Dela Gothic One 20px, --pink, rotated 8deg, top right of the card. Only one sound effect per screen.
- XP bar: 14px tall, 2px ink outline, --paper track, fill is repeating-linear-gradient(45deg, #FFC93C 0 6px, #F2B51F 6px 9px). Margin-top 10.
- XP caption: 13px, weight 500, --ink-soft ("640 of 1,040 XP to level 28").

Section heading: "Today's quests" in Dela Gothic One 22px, with "2 of 4 done" at 14px 700 --ink-soft on the right. Margin 22px top, 10px bottom.

Quest rows (10px gap between rows):
- White, 2px ink outline, radius 6, 3px 3px 0 ink shadow, padding 10px 12px, content height 40.
- Checkbox: 28x28 square, 2px ink outline, no radius. Empty is white. Done is --teal fill with a white check (stroke 4, rounded caps).
- Quest name: 16px 700. Done rows use --ink-soft with a line-through.
- Stat chip: --paper-2 fill, radius 999, padding 3px 10px, 13px 700 (Strength, Intellect, Discipline, Vitality).
- XP chip: --sun fill, 2px ink outline, radius 999, padding 1px 8px, 13px 700 ("+30 XP").

Anime card prompt panel (margin-top 22):
- --pink fill, 2px ink outline, radius 6, 4px 4px 0 ink shadow, padding 14px 16px.
- Title: Dela Gothic One 19px ("Your anime card is ready"). Subtext 14px 500.
- Button "Open card": white fill, ink text, 2px outline, radius 10, 3px 3px 0 ink shadow, padding 10px 14px, 15px 700.

Bottom tab bar:
- Full width, 76px tall, solid --ink background, four tabs spaced evenly (Quests, Stats, Cards, Profile).
- Tab buttons 48px tall, min width 72, 14px 700 sentence case.
- Active tab: --pink fill, ink text, 2px paper outline, radius 10. Inactive: transparent, paper text.

Shadow rule as built: 4px offset on large panels (character card, prompt panel), 3px on rows, chips and buttons. Never blurred.
