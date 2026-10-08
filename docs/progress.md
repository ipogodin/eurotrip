# Progress tracker

The **single source of truth for where the work is.** Plan details are in
`docs/implementation-plan.md`; this file only tracks status.

**How to use (agents):**

- **Session start:** read this file top to bottom. Take the step in
  **Current position**, then run `git status` + `git log -5` to see whether it
  was left half-done (compare with its WIP note).
- **Starting a step:** set its row to `in progress` with today's date, and
  update **Current position**.
- **Mid-step / before a likely stop:** write a `WIP` note under
  **Step notes** (done so far · next action · open questions). Commit WIP
  only if the repo is green; otherwise leave it uncommitted and say so in
  the note.
- **Finishing a step:** row → `done`, date + short commit hash; replace the
  WIP note with final notes (what was done, deviations, gotchas); move
  **Current position** to the next step; add a line to the **Session log**;
  commit (`step X.Y: …`).
- **Blocked:** row → `blocked`, and add the reason to **Blockers / inputs**.
- Statuses: `todo` · `in progress` · `blocked` · `done` · `skipped`.
- Never put secrets here.

---

## Current position

**Step:** 1.6 — Vote page: list layout + autosave
**State:** not started
**Next action:** step 1.6 (vote page). It can be built against the placeholder villas; real villas (I3) just replace `src/lib/config/villas.js`. Login page approved by the user 2026-10-08 (I8 done, sea video in).

## Step board

| Step | Title                                   | Status | Started | Done | Commit |
| ---- | --------------------------------------- | ------ | ------- | ---- | ------ |
| 1.1  | Runtime, storage, test harness          | done   | 2026-10-08 | 2026-10-08 | d6ea475 |
| 1.2  | Design system + app shell               | done   | 2026-10-08 | 2026-10-08 | 1a00a49 |
| 1.3  | Auth core                               | done   | 2026-10-08 | 2026-10-08 | 6c2303d |
| 1.4  | Login splash, gate, delete old report   | done   | 2026-10-08 | 2026-10-08 | b061ded |
| 1.5  | Villa data + vote logic                 | done   | 2026-10-08 | 2026-10-08 | 72fb769 |
| 1.6  | Vote page: list + autosave              | todo   |         |      |        |
| 1.7  | Map layout + villa detail (can slip)    | todo   |         |      |        |
| 1.8  | Admin                                   | todo   |         |      |        |
| 1.9  | Ship R1                                 | todo   |         |      |        |
| 2.1  | Phase switch + trip state               | todo   |         |      |        |
| 2.2  | Trip overview tab                       | todo   |         |      |        |
| 2.3  | Nearby tab                              | todo   |         |      |        |
| 2.4  | Flights tab                             | todo   |         |      |        |
| 2.5  | Ship R2                                 | todo   |         |      |        |
| 3.1  | Canary video background                 | done (early) | 2026-10-08 | 2026-10-08 | 4366b5b |
| 3.2  | Quality pass                            | todo   |         |      |        |
| 3.3  | SvelteKit 3 upgrade                     | todo   |         |      |        |

## Blockers / inputs from the user

| #  | Needed by | Input                                                                                   | Status  |
| -- | --------- | --------------------------------------------------------------------------------------- | ------- |
| I1 | 1.1       | Upgrade the Vercel CLI (`npm i -g vercel@latest`) and run `vercel link` (interactive) | done 2026-10-08: CLI 63.1.0, linked `ipogodins-projects/eurotrip` |
| I2 | 1.1       | Accept Upstash marketplace terms | done 2026-10-08 |
| I3 | 1.5       | 6–10 villa listing URLs (+ any notes per villa)                                         | waiting |
| I4 | 1.9       | The 8 members: full name + short name (Illia Pogodin = admin)                          | waiting |
| I8 | 1.4       | Look at the login page (`npm run dev`, open `/`; dev phrase is in your local `members.json`) and tell me if you want changes | done 2026-10-08: sea video approved ("looks good") |
| I5 | 1.2       | Sign-off on the style-guide screenshots (non-blocking)                                 | later   |
| I6 | 2.x       | Booked dates, address, check-in/out times, preferred arrival airport(s)                | later   |
| I7 | 3.1       | The Canary video clip (optional; a photo is used until then)                           | optional: a CC Commons clip is used now; the user's own clip can replace it |

## Step notes

_(WIP and final notes per step go here, newest first.)_

### 3.1 — done early (2026-10-08), from the user's I8 feedback

The user's verdict on the login page: make the background dynamic, and it
showed only desert, no sea. Replaced the Corralejo dunes photo with a looping
beach video: Wikimedia Commons "Pájara - Morro Jable - Playa del Matorral (0)
06.ogv" by Frank Vincentz, CC BY-SA 3.0 (sand + sea + waves, fixed camera,
no people; credited on the page). ffmpeg: cropped a 6 px black strip at the
bottom, first 30 s with the last 2 s crossfaded into the start (seamless 28 s
loop), no audio, H.264 `+faststart`: `static/splash/sea-1280.mp4` (3.2 MB) and
`sea-854.mp4` (1.4 MB, `<source media="(max-width: 900px)">`), webp posters
(23/13 KB). New `src/lib/components/SeaBackground.svelte`: the poster is SSR'd
(instant), the video is added only in the browser and never under
`prefers-reduced-motion` or Save-Data, fades in on `playing`; it mutes and calls
`play()` itself through `{@attach}` because Svelte sets `muted` only as a
property and iOS Safari may not autoplay otherwise. The splash tint was
lightened (it used to multiply the photo at 55% under a strong pink/purple
gradient, which hid most colour): warm sky glow, clear middle, dusk at the
bottom for the credit. Phones (portrait, <768 px): frame shifted up 24% so
the sea sits above the card, sun shrunk into the top-right corner, credit
shortened to one line. Dunes webps deleted.
Deviations from the plan: MP4 only, no WebM (VP9 came out *larger* than
H.264 at the same quality); a Commons clip instead of the user's own (I7 can
still replace it). Verified: check/lint/83 tests/build; Chrome at desktop and
a 390 px iframe (card/credit don't overlap). Could not see actual playback in
Chrome: the automation window counts as hidden, and Chrome doesn't load media
in hidden tabs (`readyState` 0); the files were checked with ffprobe and the
loop seam frame-by-frame. Gotcha: when the user's Chrome is signed in on
`localhost`, `/` redirects to `/vote`; use a second dev server on
`127.0.0.1` (cookies are per host) to see the splash without logging out.

### 1.5 — done (2026-10-08), with placeholder villas

`src/lib/config/voting.js` (deadline `2026-10-10T16:30:00Z` = Sat 09:30 PDT,
budget 6, max 3 per villa), `src/lib/voting.js` (pure, shared client/server:
`votingState`, `effectiveDeadline`, `validateBallot`, `spent`, `canIncrement`,
`withPoints`, `tally` — ties share a rank 1,2,2,4; villas with 0 votes are
unranked; unknown villas/members ignored), 19 tests incl. prototype-key,
non-integer, over-budget, closed/decided cases. `src/lib/config/villas.js`
holds the `Villa` typedef (photos are `{src, thumb, width, height}` objects,
changed from plain strings so layout can reserve space) plus **6 clearly
marked placeholders** (`[placeholder]`, `placeholder: true`) around
Lajares/Corralejo/El Cotillo/La Oliva/Famara/Costa Teguise, and a config test
that will catch bad real data (6-10 villas, unique ids, Canary-box coords,
photo path shape). `scripts/photos.js` (`npm run villas:photos -- <id> <photos…>`)
makes 1600px + 480px webp with EXIF rotation and prints the `photos` snippet
(tested). 74 tests total.
Deviation: the plan's "photos render in a styleguide VillaCard" moves to 1.6,
where `VillaCard` is built. Real villa data is **not done** — waiting on I3.

### 1.4 — done (2026-10-08)

`hooks.server.js`: reads the session cookie -> `locals.member` (public fields
only), clears forged/expired/removed-member cookies, gate: anonymous may only
see `/` (GET elsewhere -> `303 /?next=<path>`, non-GET -> `/`), dev-only
exception for `/styleguide`; security headers (`X-Frame-Options` DENY — dev
SAMEORIGIN, `nosniff`, referrer, permissions) and `Cache-Control: private,
no-store`. `ratelimit.js` implements the spec (5 fails/15 min -> lock that
doubles to a 24 h cap, 20/day per IP, 60/h global pause), 8 tests. `/`
(`+page.server.js`): honeypot, rate check before the phrase check, constant
>=600 ms response, one generic message, `retryAfter` only when locked,
`safeNext` allows only same-site relative paths (tested). `/logout` is a
`+server.js` POST. Splash `+page.svelte`: dunes photo (webp 960/1920) under a
sunset tint, floating sun, swaying fronds, glass card, cooldown countdown from
`retryAfter`, disabled while pending/locked. Placeholder `/vote`. Old report
(12 components, 5 config files, legacy CSS) deleted. AGENTS.md rewritten for
the new architecture. 55 tests total.
Verified: curl (gate redirects, wrong phrase 400 w/ 600 ms, honeypot rejected,
correct phrase in odd case/spacing logs in, open-redirect attempt ignored,
tampered cookie ignored, logout, lockout after 5 wrong tries even for the
right phrase); **production-mode preview** (cross-site/origin-less POST ->
403, cookie Secure+HttpOnly, /styleguide 404 for members); Chrome: splash at
desktop + 390px, error state, lockout UI (disabled button + live countdown),
login with `?next=/vote`, avatar menu shows Admin, logout.
Gotchas found: (1) SvelteKit's CSRF origin check is skipped in dev — only
test it against a production build. (2) `.env.local` holds the PRODUCTION
Redis credentials and dev used it: a curl lockout test wrote lock keys to the
real database. Fixed: dev now uses the in-memory store unless
`USE_REDIS_IN_DEV=1`; the stray `rl:*`/`stats:*` keys were deleted (database
had nothing else). (3) A test iframe that auto-submitted on load looped and
locked the IP. (4) The Chrome extension's `type` action sometimes delivers no
key events; use JS (see AGENTS.md).
Deviation: the sun is placed in the sky (top) rather than behind the card.
Decided: the login photo stays the Corralejo dunes (tinted) until the user
supplies their own photo/video (step 3.1).

### 1.3 — done (2026-10-08)

Modules in `src/lib/server/`: `phrase.js` (normalize: case, spaces, `_`,
typographic dashes; format `word-word`), `members.js` (`parseMembers` reports
all roster errors at once; `matchPhrase` hashes input and every phrase with
SHA-256 and compares with `timingSafeEqual`, no early exit; `toPublic` drops
the phrase), `session.js` (HMAC-SHA256 signed `payload.sig` token, 60-day
expiry, `resolveSecret` throws in prod without a 32+ char `SESSION_SECRET`,
`cookieOptions`), `roster.js` (the only module with `$env`/`$app` imports:
`MEMBERS` env, dev-only fallback to `members.json`, cached; `findMemberById`,
`getSessionSecret`). Pure modules have no `$` imports so vitest runs them
directly. 31 new tests (45 total). Added `@types/node` (needed for
`node:crypto`/`Buffer` under svelte-check).
Roster CLI `scripts/members.js` (`npm run members:init|check|gen|push`),
wordlist `scripts/wordlist-eff-large.txt` (EFF large list, CC BY 3.0 US;
7,772 words, 4 hyphenated removed; validated before use). `members.example.json`
is committed (fake data); `members.json` is gitignored.
Verified with the real CLI: init/check/gen, duplicate phrase rejected, unknown
id rejected, and `push --name ZZ_ROSTER_TEST` set a *Secret* var for
Production + Preview, replacing (not duplicating) on a second run; the test
var was then removed. `push` uses `vercel env add ... --sensitive --force`
with the value on stdin; values are never printed.
Deviations: added `members:init` (not in the plan); `members.json` currently
holds the 2 example members (one phrase regenerated while testing). Real names
and phrases: step 1.9. Note: `grep` in this shell is `ugrep` (rejects
`grep -v -- '-'`), use python for such filters.

### 1.2 — done (2026-10-08)

New tokens/base styles in `src/app.css` (Inter Variable via
`@fontsource-variable/inter`, 8 member hues, space/radius/elevation/motion,
`.btn*`, `.field`, `.page`, `.stack`, `.row`, `.sr-only`, reduced-motion).
The old report CSS moved to `src/lib/legacy-report.css`, imported only by the
report's `+page.svelte` (delete both in step 1.4). Icons: single
`src/lib/icons/Icon.svelte` + `paths.js` (31 Lucide-style paths) instead of one
file per icon. Components in `src/lib/components/ui/`: AppBar, BottomNav,
Button, Card, Chip, Avatar, AvatarStack, PointDots, Stepper, PointsMeter,
Countdown (browser-only clock to avoid hydration mismatch), SegmentedControl,
Sheet (native `<dialog>`: focus trap + Esc for free), Toast
(`toast.svelte.js` + `Toaster`, mounted in the layout), Skeleton. Helpers:
`members-ui.js` (hue/initials), `time.js` (`formatRemaining`), 14 unit tests.
Styleguide route is `/styleguide` (not `/_styleguide` as the plan said): 404
in production via `+page.server.js`.
Checked in Chrome: desktop and a 390 px iframe. Gotcha: `resize_window` only
resizes the outer window, so a narrow iframe was used for the phone view.
**Design v2 (same day):** the user found the first look corporate, so the skin
was redone as "Tropical Sunset" (see `docs/design.md`, `docs/history.md`): new
tokens/fonts in `app.css` (Fraunces, Nunito, Caveat Brush via fontsource),
restyled all components, added `Sun`, `Wave`, `Frond`, a sunset hero and
palette swatches in `/styleguide`. `--bottomnav-h` is now 84px (floating nav).
Still open (I5): the user's verdict on the new look at `/styleguide`.

### 1.1 — done (2026-10-08)

SSR runtime (removed `src/routes/+layout.js`; build emits `index.func`).
Upstash for Redis provisioned as `eurotrip-redis` via
`vercel integration add upstash/upstash-kv`, connected to Production, Preview
and Development. Env vars: `KV_REST_API_URL`, `KV_REST_API_TOKEN`,
`KV_REST_API_READ_ONLY_TOKEN`, `KV_URL`, `REDIS_URL`; pulled into the
gitignored `.env.local`. Store in `src/lib/server/store/`
(`types/memory/upstash/index`), 8 tests (`npm test`).
Gotcha found only by a real-Redis test: with `automaticDeserialization:
false`, `HGETALL` returns a flat `[k, v, ...]` array → `toHash()` in
`upstash.js` normalizes it (unit-tested). Verified against the real
database: ballots, voting, trip, `hit`/`ttl`, `setValue`/`del`.
`npm audit`: only the low `cookie` advisory (GHSA-pxg6-pf52-xh8x); not
exploitable here (constant cookie name/path, no domain); real fix = step 3.3.
The integration install also added third-party agent skills
(`.agents/`, `.claude/skills/`, `skills-lock.json`); gitignored on purpose.
The CLI re-adds a bare `.env*` line to `.gitignore` on `vercel link`; don't keep
it (it would override the `!.env.example` exception).

## Session log

| Date       | Summary                                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| 2026-10-08 | Login splash: looping sea video (step 3.1 pulled forward after the user's I8 feedback). |
| 2026-10-08 | Planning: raw plan captured, decisions made, tech-spec + design + detailed plan + this tracker written. No code. |
| 2026-10-08 | Step 1.5 done (placeholders): voting rules + tests, villa config, photo script. |
| 2026-10-08 | Step 1.4 done: auth gate, login splash, logout, old report deleted; dev store -> memory. |
| 2026-10-08 | Step 1.3 done: roster/phrase/session modules, members CLI, 31 tests. |
| 2026-10-08 | Step 1.2 done: design tokens, icons, 15 ui components, /styleguide. |
| 2026-10-08 | Step 1.1 done: SSR + Upstash Redis store + vitest. |
| 2026-10-08 | The user upgraded the Vercel CLI to 63.1.0 and linked the repo to the existing project `ipogodins-projects/eurotrip` (`.vercel/` and `.env.local` are gitignored). |
