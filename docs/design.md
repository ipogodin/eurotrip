# Design — Eurotrip app

Direction chosen 2026-10-08: **Modern app UI.** Crisp and calm, product
quality (think Linear or the Airbnb app): neutral surfaces, one strong
accent, rounded cards, dense but legible data, built for the phone first.
The **login splash** is the one deliberately cinematic screen: a full-bleed
Canary Islands background with a glass card.

## Principles

1. **Phone first.** Designed at 390 px, scales up. Every action is reachable
   with a thumb. Primary nav sits at the bottom on mobile, top on desktop.
2. **Photos carry the emotion; UI stays quiet.** Color is reserved for the
   accent (actions, your votes) and data.
3. **Votes are glanceable.** Totals, ranks and who-voted show without
   opening anything. Dots (●●○) visualize 1–3 points everywhere.
4. **Instant feedback.** Optimistic updates, autosave, subtle motion, and
   "Saved" confirmation; no full-page reloads.
5. **Accessible by default.** WCAG AA contrast, 44 px touch targets, visible
   focus rings, `prefers-reduced-motion` respected.

## Tokens (replace the report tokens in `src/app.css`)

Color (light theme; dark mode is optional, R3):

| Token            | Value     | Use                                         |
| ---------------- | --------- | ------------------------------------------- |
| `--bg`           | `#F6F7F9` | App background                              |
| `--surface`      | `#FFFFFF` | Cards, sheets, bars                         |
| `--surface-2`    | `#F0F2F5` | Inputs, segmented control track, skeletons  |
| `--ink`          | `#0F1720` | Primary text                                |
| `--ink-2`        | `#4A5563` | Secondary text                              |
| `--ink-3`        | `#8A94A3` | Tertiary text, placeholders                 |
| `--line`         | `#E4E7EC` | Hairlines, card borders                     |
| `--accent`       | `#0A7C86` | Primary actions, my votes, active states (Atlantic teal, carried over from the report) |
| `--accent-ink`   | `#FFFFFF` | Text on accent                              |
| `--accent-soft`  | `#E3F4F5` | Selected backgrounds, focus halo            |
| `--sun`          | `#F5B83D` | Rank #1 badge, winner highlight only        |
| `--danger`       | `#D14343` | Errors, destructive admin actions           |
| `--success`      | `#1F8A5B` | "Saved", confirmations                      |
| Member hues      | 8 distinct, AA-checked hues | Avatar backgrounds (fixed per member id) |

Type: **Inter Variable** (self-hosted via `@fontsource-variable/inter`),
`font-feature-settings: 'cv11', 'ss01'`, `tabular-nums` for points,
countdowns and prices.

| Style      | Size / line / weight |
| ---------- | -------------------- |
| Display    | 32/38 · 700 (40/46 ≥768px) |
| Title      | 22/28 · 650          |
| Headline   | 17/24 · 600          |
| Body       | 15/22 · 400          |
| Caption    | 13/18 · 500          |
| Overline   | 11/16 · 600 · +0.08em · uppercase |

Space: 4-pt scale (`4 8 12 16 20 24 32 40 56`). Radius: `--r-sm 10px`,
`--r-md 14px`, `--r-lg 20px`, `--r-pill 999px`. Elevation: `--e1 0 1px 2px
rgb(16 24 40 / .06)`, `--e2 0 8px 24px rgb(16 24 40 / .10)`, `--e3` for sheets.
Motion: 160 ms (`cubic-bezier(.2,.8,.2,1)`) for UI, 240 ms for sheets; all
reduced to opacity-only under `prefers-reduced-motion`.

Breakpoints: `< 768` mobile (bottom nav, 1-column cards, map + bottom
sheet) · `768–1099` tablet (2-column cards) · `≥ 1100` desktop (top nav,
3-column cards; map layout = list pane left + map right).

## Components

- **AppBar:** logo mark + "Eurotrip", phase title, countdown chip, avatar
  menu (name, Admin, Log out). Sticky, translucent with blur.
- **BottomNav** (mobile): _Villas_ · _People_ · _My votes_ (phase 1);
  _Villa_ · _Nearby_ · _Flights_ (phase 2). Icons + labels, `aria-current`.
- **SegmentedControl:** filter (`By villa / By person / My votes`) and
  layout (`List / Map`) toggles; buttons with `aria-pressed` inside
  `role="group"`.
- **VillaCard:** cover photo (16:10, lazy, blur-up), rank badge, name, town,
  facts row (🛏 bedrooms · sleeps · price/night), highlight chips, total
  points, `AvatarStack` of voters with dots, `Stepper` (− ●●○ +).
- **Stepper:** 44 px round buttons, dots in the middle, disabled at 0/3 or
  when no points are left (tooltip "No points left: take one from another
  villa").
- **PointsMeter:** 6 pill segments, filled = spent, label "4 of 6 left".
  Sticky above the bottom nav on mobile while in _My votes_.
- **AvatarStack / Avatar:** initials on member hue, 28 px, overlap −8 px,
  "+2" overflow.
- **PersonRow** (_By person_): avatar, name, "5 of 6 used", horizontal list of
  mini villa thumbnails with dots. Members who haven't voted are shown muted
  with "Hasn't voted yet".
- **Countdown chip:** `1d 14h` → `2h 05m` → `04:59` (last 5 min) → "Voting
  closed". Turns `--sun` in the last 24 h.
- **Sheet:** bottom sheet on mobile (map selection, confirm dialogs), centered
  modal on desktop. Focus-trapped, Esc and swipe-down to close.
- **Toast:** bottom, 2.5 s, `aria-live="polite"`.
- **Map pins:** pill markers showing total points (`14`), accent for
  villas you voted on, sun for #1, scale up on selection.
- **Skeletons** for loading; **empty states** with one-line guidance.

## Key screens

**Login splash (`/`, anonymous).** Full-bleed background (Corralejo dunes
photo now, the user's video later) with a dark gradient scrim at the bottom.
Centered glass card (`backdrop-filter: blur(16px)`, white 72%): overline
"Eurotrip · Canary Islands 2027", title "Enter your invite phrase",
one input with placeholder `word-word`, a large primary button. Below that,
an error area with the cooldown countdown when locked. Mobile: the card sits
in the lower third for thumb reach, and the input uses
`autocapitalize="none" autocomplete="off" spellcheck="false"
enterkeyhint="go"`.

**Vote — By villa, list (default).** AppBar + countdown. Under it:
`PointsMeter` and the filter control. A grid of VillaCards sorted by rank
(ties share a rank). A "Not voted yet" nudge row at the bottom.

**Vote — map layout.** Full-height map of the island with pins. Tapping a
pin opens a bottom sheet with a compact VillaCard and stepper. Desktop: a
scrollable list on the left and the map on the right, with hover linking
between them.

**Vote — By person.** PersonRows, me first.

**Vote — My votes.** Only villas I've given points to at the top, then
"Other villas" compact rows with steppers. PointsMeter is sticky.

**Villa detail (`/villas/[id]`).** Swipeable gallery (scroll-snap) with
counter, title block, facts grid, highlights, blurb, "Open listing ↗",
voters list, sticky stepper bar at the bottom while voting is open.

**Admin.** Plain, functional cards: Voting window (state, deadline
picker in PDT, Extend / Close now / Reopen), Results table, Pick winner
(select + confirm sheet), Trip details (phase 2: dates, check-in/out,
notes), Security (failed logins 24 h, global pause state).

**Trip hub (phase 2).** _Villa_: hero gallery, "You're going to <villa>",
dates with a "changed" badge, countdown to trip, facts, amenities icon grid,
check-in/out, notes. _Nearby_: map + filter chips (Beaches / Attractions /
Cafés) + list with 🚶 min · 🚗 min and Directions links. _Flights_:
origin chips (London / Warsaw / Frankfurt), Outbound / Return toggle, flight
option cards (airline, IATA route, times, duration, stops, typical price,
Book ↗ to Google Flights / Skyscanner).

## Imagery

- Villa photos: webp, max 1600 px wide, plus 480 px thumbnails, served from
  `static/villas/{id}/`. Always `width`/`height` attributes (no layout shift).
- Background: until the user's own footage arrives, use the CC BY-SA
  Corralejo dunes photo credited in the old Hero (keep the credit as a small
  caption on the splash).
- Icons: inline SVG set (Lucide-style 1.5 px stroke) copied into
  `src/lib/icons/`, with no icon-font dependency.
