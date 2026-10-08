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

**Step:** 1.5 — Villa data + vote logic
**State:** not started
**Next action:** step 1.5 needs the villa listing URLs (I3). Without them: build `voting.js` logic + tests first, and placeholder villas clearly marked `[placeholder]`.

## Step board

| Step | Title                                   | Status | Started | Done | Commit |
| ---- | --------------------------------------- | ------ | ------- | ---- | ------ |
| 1.1  | Runtime, storage, test harness          | done   | 2026-10-08 | 2026-10-08 | d6ea475 |
| 1.2  | Design system + app shell               | done   | 2026-10-08 | 2026-10-08 | 1a00a49 |
| 1.3  | Auth core                               | done   | 2026-10-08 | 2026-10-08 | 6c2303d |
| 1.4  | Login splash, gate, delete old report   | done   | 2026-10-08 | 2026-10-08 | b061ded |
| 1.5  | Villa data + vote logic                 | todo   |         |      |        |
| 1.6  | Vote page: list + autosave              | todo   |         |      |        |
| 1.7  | Map layout + villa detail (can slip)    | todo   |         |      |        |
| 1.8  | Admin                                   | todo   |         |      |        |
| 1.9  | Ship R1                                 | todo   |         |      |        |
| 2.1  | Phase switch + trip state               | todo   |         |      |        |
| 2.2  | Trip overview tab                       | todo   |         |      |        |
| 2.3  | Nearby tab                              | todo   |         |      |        |
| 2.4  | Flights tab                             | todo   |         |      |        |
| 2.5  | Ship R2                                 | todo   |         |      |        |
| 3.1  | Canary video background                 | todo   |         |      |        |
| 3.2  | Quality pass                            | todo   |         |      |        |
| 3.3  | SvelteKit 3 upgrade                     | todo   |         |      |        |

## Blockers / inputs from the user

| #  | Needed by | Input                                                                                   | Status  |
| -- | --------- | --------------------------------------------------------------------------------------- | ------- |
| I1 | 1.1       | Upgrade the Vercel CLI (`npm i -g vercel@latest`) and run `vercel link` (interactive) | done 2026-10-08: CLI 63.1.0, linked `ipogodins-projects/eurotrip` |
| I2 | 1.1       | Accept Upstash marketplace terms | done 2026-10-08 |
| I3 | 1.5       | 6–10 villa listing URLs (+ any notes per villa)                                         | waiting |
| I4 | 1.9       | The 8 members: full name + short name (Illia Pogodin = admin)                          | waiting |
| I5 | 1.2       | Sign-off on the style-guide screenshots (non-blocking)                                 | later   |
| I6 | 2.x       | Booked dates, address, check-in/out times, preferred arrival airport(s)                | later   |
| I7 | 3.1       | The Canary video clip (optional; a photo is used until then)                           | later   |

## Step notes

_(WIP and final notes per step go here, newest first.)_

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
| 2026-10-08 | Planning: raw plan captured, decisions made, tech-spec + design + detailed plan + this tracker written. No code. |
| 2026-10-08 | Step 1.4 done: auth gate, login splash, logout, old report deleted; dev store -> memory. |
| 2026-10-08 | Step 1.3 done: roster/phrase/session modules, members CLI, 31 tests. |
| 2026-10-08 | Step 1.2 done: design tokens, icons, 15 ui components, /styleguide. |
| 2026-10-08 | Step 1.1 done: SSR + Upstash Redis store + vitest. |
| 2026-10-08 | The user upgraded the Vercel CLI to 63.1.0 and linked the repo to the existing project `ipogodins-projects/eurotrip` (`.vercel/` and `.env.local` are gitignored). |
