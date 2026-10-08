# Design — Eurotrip app

**Direction (v2, 2026-10-08): "Tropical Sunset".** Replaces the first "Modern
app UI" pass, which the user found corporate and lifeless. The brief, in the
user's words: vivid, full of life, tropical fonts; it should feel like
**vacation, rest, mindfulness, fun, energy, exotic**. Still mobile-first and
product-clean in layout, but with warm color, soft organic type, big round
shapes and playful motion. Source of truth for tokens is `src/app.css`; the
live gallery is `/styleguide` (dev only).

## Principles

1. **Phone first.** Designed at 390 px; floating pill nav at the bottom on
   mobile, top nav on desktop.
2. **Warm and alive, never noisy.** Cream base, three hot accents used with
   intent: hibiscus = action, lagoon = navigation/selection/info, mango =
   points and highlights.
3. **Round everything.** Pills, 20–28 px card radii, soft glow shadows.
4. **Motion with a spring.** Buttons lift, point dots bloom, sheets bounce
   up, the sun logo turns slowly, the sunset hero floats. All of it stops
   under `prefers-reduced-motion`.
5. **Photos and gradients carry the mood; text stays calm and readable.**
6. **Accessible by default.** AA contrast verified for every text/background
   pair (see below), 44 px+ targets, strong lagoon focus rings.

## Typography

| Role | Font | Use |
| --- | --- | --- |
| Display | **Fraunces** variable, `SOFT 100`, `WONK 1`, 700-800 | Headlines, brand, titles. Warm, curvy, a bit wonky. Italic + hibiscus (`.t-display-it`) for the emphasized word |
| Body/UI | **Nunito** variable | Everything else: rounded, friendly, legible. Buttons/labels at 700-900 |
| Script | **Caveat Brush** | Rare hand-written accents (`.t-script`), e.g. "¡Vamos, familia!", max one per screen |

Scale: Display 38/42 (56/58 ≥768px), Title 26/32 (32/38), Headline 18/24 ·
800, Body 16/24, Caption 14/20 · 600, Overline 12 · 800 · +0.12em, caps,
lagoon-deep. Numbers (points, countdown, price) use `tabular-nums`.

## Color tokens

| Token | Value | Use |
| --- | --- | --- |
| `--bg` / sunny gradients | `#fff7e8` + turquoise/mango/hibiscus radial glows (fixed) | Page background |
| `--surface` / `--surface-2` | `#fff` / `#ffefd0` (sand) | Cards, sheets / tracks, inputs, skeletons |
| `--ink` / `--ink-2` / `--ink-3` | `#0c3b3e` / `#3d6466` / `#4a6d6f` | Deep-lagoon text (not black) |
| `--line` | `#f3e2c2` | Borders (2 px, warm) |
| `--hibiscus` `--accent` | `#d81b60` | Primary actions, the number that matters |
| `--papaya` | `#d2301f` | Gradient end, danger-adjacent |
| `--mango` `--sun` | `#ffb020` | Points, #1 rank, highlights |
| `--lagoon` / `--lagoon-deep` | `#0aa5a8` / `#067a80` | Active segmented control, focus, info chips, links |
| `--palm` | `#1fa971` | Success, decorative greens |
| Gradients | `--grad-cta` (hibiscus→papaya), `--grad-sun` (mango→orange), `--grad-sea` (lagoon→palm), `--grad-sunset` (mango→orange→hibiscus→plum, heroes) | |
| Member hues `--m1..8` | 8 saturated hues, white initials, all ≥ 4.5:1 | Avatars |

Contrast checked (WCAG): white on hibiscus 4.95, white on CTA gradient end
5.02, ink on cream 11.5, ink-2 on cream 6.1, ink-3 on cream 5.3, lagoon-deep on
white 5.1, chip text pairs ≥ 6.6. Re-check any new pair.

## Shape, depth, motion

Radii: 14 / 20 / 28 / pill. Shadows are warm brown, not grey. Primary buttons
have a hibiscus glow. Springs: `cubic-bezier(.34,1.56,.64,1)` for button lift,
stepper, sheet, toast, point-dot bloom. Ambient: sun logo rotates 40 s, hero
sun floats 7 s, final-minute countdown throbs.

## Components (`src/lib/components/ui/`)

AppBar (sun logo + Fraunces wordmark, pill nav, countdown chip, avatar menu) ·
BottomNav (floating white pill, active = sand pill + hibiscus text) · Button
(pill; primary gradient, secondary lagoon outline, ghost, danger) ·
SegmentedControl (sand pill track, active = lagoon-deep pill) · Card · Chip
(neutral/accent/sea/sun/success/danger) · Avatar (white ring + shadow) ·
AvatarStack · PointDots (mango "suns" that bloom) · PointsMeter (6 sunset
segments, hibiscus number) · Stepper (round, hibiscus plus) · Countdown ·
Sheet (native dialog, grabber, bouncy) · Toast · Skeleton · decorative **Sun**,
**Wave** (section divider), **Frond** (generated palm leaf, currentColor).

## Key screens

**Login splash (`/`).** Full-bleed Canary photo (video later) under a warm
sunset-tinted scrim; frosted card with the sun mark, Fraunces headline, a
script tag line, the phrase field and a big hibiscus button; fronds framing
the corners; wave edge into the cream if the card scrolls. Phrase input uses
`autocapitalize=none autocomplete=off spellcheck=false enterkeyhint=go`.

**Vote.** Sunset hero strip on top of the page (headline "Where are we
sleeping?", countdown, my points meter), then the filter pill control, then
villa cards: big rounded photo, rank sticker (mango #1), facts chips, voter
avatars, stepper. Map layout uses round pills as pins. By person = sticker
avatars with picks. My votes = sticky points meter.

**Trip hub.** Sunset-gradient hero with the villa photo, "You're going to …",
trip countdown, dates with a "changed" chip, amenity icon grid in sand
tiles; Nearby with lagoon/palm/hibiscus category colors; Flights with
origin pills and ticket-style cards.

**Admin.** Same visual language but calmer: white cards, lagoon headings.

## Imagery and icons

- Villa photos: webp, ≤1600 px (+480 px thumbs), `width`/`height` always set,
  rounded 20 px, slight warm color grade only if needed.
- Login background: Corralejo dunes (CC BY-SA, credit as a small caption),
  later the user's own video.
- Icons: inline SVG, 1.75 px stroke, in `src/lib/icons/`.
- Decoration (sun, fronds, waves) is `aria-hidden` and never carries info.
