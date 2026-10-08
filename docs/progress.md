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

**Step:** 1.3 — Auth core (no UI)
**State:** not started
**Next action:** start 1.3 (members loader, phrase normalize, session cookie, roster scripts, tests).

## Step board

| Step | Title                                   | Status | Started | Done | Commit |
| ---- | --------------------------------------- | ------ | ------- | ---- | ------ |
| 1.1  | Runtime, storage, test harness          | done   | 2026-10-08 | 2026-10-08 | d6ea475 |
| 1.2  | Design system + app shell               | done   | 2026-10-08 | 2026-10-08 | 1a00a49 |
| 1.3  | Auth core                               | todo   |         |      |        |
| 1.4  | Login splash, gate, delete old report   | todo   |         |      |        |
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
| 2026-10-08 | Step 1.2 done: design tokens, icons, 15 ui components, /styleguide. |
| 2026-10-08 | Step 1.1 done: SSR + Upstash Redis store + vitest. |
| 2026-10-08 | The user upgraded the Vercel CLI to 63.1.0 and linked the repo to the existing project `ipogodins-projects/eurotrip` (`.vercel/` and `.env.local` are gitignored). |
