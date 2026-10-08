# Eurotrip — Agent Briefing

Repo: **https://github.com/ipogodin/eurotrip**
Live site: **https://eurotrip.vercel.app** (to be confirmed after first deploy)

Read `docs/history.md` before doing anything else in this project — it has the
full origin story and every decision made so far, in chronological order, so a
fresh agent does not need the user to re-explain context.

---

## Work tracking (resume-safe sessions)

The user stops and restarts Claude sessions at any time, so progress must live
in files, never only in conversation context.

### The docs

| File                          | What it is                                                                 | When to edit                         |
| ----------------------------- | -------------------------------------------------------------------------- | ------------------------------------ |
| `docs/progress.md`            | **Status tracker**: current position, step board, blockers/inputs, step notes, session log | Every step start / WIP / finish |
| `docs/implementation-plan.md` | What + how: steps with tasks, files and acceptance criteria; decisions table | Only when scope/approach changes   |
| `docs/tech-spec.md`           | Contract: routes, auth, anti-brute-force, storage keys, vote rules, data shapes | In the same commit as any deviation |
| `docs/design.md`              | Visual system + screen specs; **all UI follows it**                        | When the design changes             |
| `docs/raw_plan.md`            | The user's original request and answers, verbatim                         | Append-only, user's words           |
| `docs/history.md`             | Chronological log of requests/decisions/why                                | Append-only                         |

### Procedure

- **Session start:** read `docs/progress.md` → "Current position", then
  that step in `docs/implementation-plan.md`. Run `git status` and
  `git log -5` to detect a half-finished step (compare with its WIP note).
  Read `history.md`/specs as needed. Don't ask the user to re-explain
  anything that's written down.
- **Start a step:** mark it `in progress` (date) in `progress.md`.
- **Medium-size units, always green:** each step ends with
  `npm run check`, `npm run lint`, `npm test`, `npm run build` passing.
- **Before a likely stop / mid-step:** write a `WIP` note in
  `progress.md` → Step notes (done so far · next action · open questions).
- **Finish a step (do this even if the user didn't ask):** mark it `done` with
  the date and commit hash, write the final step notes (deviations,
  gotchas), move "Current position", add a session-log line, append to
  `history.md` if a decision or deviation happened, and commit as
  `step X.Y: <summary>`.
- **Blocked on the user:** mark the step `blocked` and list exactly what's
  needed in "Blockers / inputs".
- **Scope/decision changes:** update the plan's decisions table (dated) +
  `history.md`, not just chat.
- **Secrets:** never write invite phrases, `SESSION_SECRET`, tokens or the
  roster to any tracked file, doc or commit message. The GitHub repo is
  **public**. The roster lives in the `MEMBERS` env var (Vercel) and the
  gitignored `members.json` (local). Phrases are shown to the user only in
  chat.

---

## What this project is

**Eurotrip** is a private trip-planning app for a group of 8 friends/family
(8 adults + 2 toddlers) going to the Canary Islands in February 2027.

- **History:** it started (2026-10-03) as a port of a single static HTML
  "Canary Islands decision report" comparing the 8 islands. The island was
  chosen (the report was deleted in step 1.4, see git history before commit
  "step 1.4").
- **Now:** a login-gated app. Members enter a personal two-word invite phrase,
  vote on candidate villas (phase 1), the admin picks the winner, then a trip
  hub shows the villa, dates, nearby places and flights (phase 2).
- "Eurotrip" is the umbrella name for the long-lived trip site.

Plan and status: `docs/implementation-plan.md` and `docs/progress.md`.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 (runes, forced on for all project files) |
| Language | JavaScript + JSDoc types, type-checked by `svelte-check` (`checkJs` + `strict`) |
| Adapter | `@sveltejs/adapter-vercel`; **server-rendered** (gated pages cannot be static); cookie sessions |
| Data | Upstash Redis (Vercel Marketplace store `eurotrip-redis`), via `src/lib/server/store/` |
| Tests | Vitest (`npm test`), pure logic only; UI is checked manually in Chrome |
| Styling | Scoped `<style>` per component + shared tokens/utility classes in `src/app.css`, no CSS framework |
| Lint / format | ESLint 10 flat config (`eslint-plugin-svelte` + `eslint-config-prettier`) + Prettier with `prettier-plugin-svelte` |
| Runtime | Node `>=22.12` (`engines` + `.npmrc` `engine-strict=true`); Vercel builds on Node 24 |
| Deploy | Vercel — `vercel --prod` from project root |
| Dev | `npm run dev` → localhost:5173 (port may vary) |

There is **no `svelte.config.js`** on purpose: SvelteKit ≥2.70 accepts its
config (adapter, compilerOptions) directly in `sveltekit({...})` inside
`vite.config.js`. Put any new Kit/Svelte config there.

Started as a copy of `~/dev/wenachee`'s config; since 2026-10-03 this project
additionally has lint/format/types/tests set up, so it's now ahead of
wenachee — don't copy configs back from it blindly.

---

## Commands — run before every commit

```bash
npm run check    # svelte-check: must report 0 errors, 0 warnings
npm run lint     # prettier --check + eslint: must pass
npm test         # vitest unit tests: must pass
npm run format   # auto-fix formatting
npm run build    # must succeed; output lands in .vercel/output/
```

Markdown files are excluded from Prettier on purpose (`.prettierignore`) —
Prettier reflows lists and once corrupted a line in `docs/history.md`.

---

## Project structure

```
src/
  app.html                 # HTML shell
  app.css                  # Design tokens (Tropical Sunset), type scale, .btn/.field/.page helpers
  app.d.ts                 # App.Locals typing (declaration only)
  hooks.server.js          # Session -> locals.member, login gate, security headers
  routes/
    +layout.svelte         # imports app.css, mounts <Toaster/>
    +layout.server.js      # passes the signed-in member to every page
    +page.svelte/.server.js  # `/` = login splash + login action (anonymous only)
    logout/+server.js      # POST clears the cookie
    vote/+page.svelte/.server.js  # vote page: Map|People|My votes (?view=), autosave, polling; save action
    villas/[id]/           # one villa: gallery, vote bar under it, details; votes via /vote?/save
    styleguide/            # dev-only component gallery (404 in production)
  lib/
    components/SeaBackground.svelte  # login splash video loop (poster SSR, video client-only)
    components/vote/       # VillaMap (default Villas view), VoteBar, VoteHeader, PointsLeft, VillaGrid/VillaCard
                           #   (old list view, VOTE_LAYOUT='list'), PeopleList/PersonRow, NotVotedNudge, MyVotes, types.js
    ballot-client.svelte.js  # BallotClient: optimistic debounced autosave of my ballot
    vote-view.js           # buildVoteView: tally + one render row per villa (map, list, villa page)
    vote-polling.svelte.js # 15 s refresh + refresh at the deadline
    map-layout.js          # spreadPins (keeps photos from hiding each other), smoothClosedPath
    config/tenerife.js     # approximate Tenerife coastline + projection for the map
    voting.js              # pure vote rules + tally (shared by server and browser)
    components/ui/         # AppBar, BottomNav, Button, Card, Chip, Avatar(+Stack),
                           #   PointDots, PointsMeter, Stepper, Countdown, SegmentedControl,
                           #   Sheet, Toast(+Toaster), Skeleton, Sun, Wave, Frond
    icons/                 # Icon.svelte + paths.js (inline SVG icons)
    members-ui.js          # avatar color + initials (client-safe)
    time.js                # countdown formatting
    server/                # server-only (Kit blocks client imports)
      members.js           # roster validation, constant-time phrase match, toPublic
      phrase.js            # phrase normalization/format
      session.js           # signed cookie tokens, secret check, cookie options
      roster.js            # loads MEMBERS env / dev members.json (only file with $env)
      ratelimit.js         # login lockout rules (Redis-backed)
      next.js              # safe post-login redirect target
      store/               # Store interface; upstash.js (prod) + memory.js (dev/tests)
scripts/
  members.js               # roster CLI: init|check|gen|push (npm run members:*)
  wordlist-eff-large.txt   # EFF word list for phrase generation
static/
  favicon.svg
  splash/                  # login background: sea loop mp4 (1280/854) + webp posters (CC BY-SA, credited on page)
members.example.json       # fake roster shape (committed)
members.json               # REAL roster with phrases (gitignored, local only)
docs/                      # plan, specs, design, progress, history (see Work tracking)
```

**Dev uses the in-memory store**, not Redis, even though `.env.local` holds the
production Redis credentials (so development can't touch real votes). Set
`USE_REDIS_IN_DEV=1` to deliberately use the real database. Dev also reads the
roster from `members.json`; production reads the `MEMBERS` env var.

---

## Svelte coding standards

**Svelte 5 runes only** (enforced by the compiler — runes mode is forced in
`vite.config.js`):

- `$props()` for props, `$state` for local state, `$derived` for anything
  computed from state. No `export let`, no `$:`, no stores for local state.
- Avoid `$effect` — prefer `$derived` or doing the work in the event handler.
  Only use `$effect` to sync with something outside Svelte (DOM APIs,
  timers, third-party libs), and return a cleanup function.
- Events are attributes: `onclick={...}`, never `on:click`. Child → parent
  communication is a callback prop (e.g. `onSelect`), never
  `createEventDispatcher`.
- Use `{#snippet}` / `{@render}` instead of `<slot>`.
- Every `{#each}` block has a key: `{#each items as item (item.id)}`.
- `class:active={cond}` for conditional classes; keep `style=` for truly
  dynamic values only (e.g. bar widths).
- Browser-only APIs (`document`, `window`, `localStorage`) only in event
  handlers or `$effect` — never at the top level of `<script>`, since pages
  are rendered on the server first.

**Types (JSDoc, no TypeScript files; `src/app.d.ts` is the one declaration-only exception):**

- Type every component's props:
  `/** @type {{ selectedId: string, onSelect: (id: string, scroll: boolean) => void }} */ let { ... } = $props();`
- Type function params with `@param`; give config arrays/objects a
  `@typedef` + `@type` in the config file (see `islands.js`).
- `npm run check` must stay at 0 errors — don't silence with `any`.

**Accessibility:**

- Clickable things are `<button>` (or `<a>` for navigation). If a non-button
  element must be interactive, give it `role="button"`, `tabindex="0"`, an
  `aria-label`, and an Enter/Space `onkeydown` handler.
- Toggle/selected-state buttons (filters, tabs) carry
  `aria-pressed={isSelected}`; group them with `role="group"` + `aria-label`.
- Never put `role="img"` on an SVG that contains interactive children (it
  hides them from screen readers) and don't use `role="application"`.

**Links:** external links whose `href` is dynamic need `rel="external"`
(tells SvelteKit's router to skip it and satisfies
`svelte/no-navigation-without-resolve`). Internal links must use
`resolve()` from `$app/paths` once there's more than one route.

---

## Deploy

```bash
vercel link        # one-time: creates .vercel/project.json (gitignored)
vercel --prod      # deploy from local
git push           # once GitHub → Vercel auto-deploy is connected in the dashboard
```

The site is **server-rendered** on Vercel (a serverless function), because every
page except the login splash needs the session cookie. Required environment
variables (Production + Preview): `MEMBERS` (roster JSON, set with
`npm run members:push`), `SESSION_SECRET` (32+ random chars), and the Upstash
`KV_REST_API_URL` / `KV_REST_API_TOKEN` (set by the Marketplace integration).
Env changes only apply to **new deployments**. Vercel project:
`ipogodins-projects/eurotrip`.

**Known pending upgrade:** SvelteKit 3.0 / adapter-vercel 7.0 shipped
2026-10-01; the project stays on Kit 2.x until step 3.3. `npm audit` shows a
low-severity `cookie` advisory (bad characters in cookie name/path/domain);
not exploitable here since we only set one constant name/path and no domain.

See `docs/history.md` for the Vercel project name/ID once the first deploy has
happened, and update this section then.

---

## What's next

The site is being built into a private villa-voting + trip-hub app (login with
invite phrase → vote on villas → admin picks the winner → trip hub with villa,
nearby places and flights). Follow `docs/implementation-plan.md`; track status
in `docs/progress.md` (see "Work tracking" above). Key facts for a fresh agent:

- Admin = **Illia Pogodin** (the repo owner), `admin: true` in the roster.
- Storage = Upstash Redis (Vercel Marketplace). Villa/trip facts live in
  `src/lib/config/` (created in step 1.5); only mutable state (ballots,
  deadline override, winner, trip dates/notes, rate limits) is in Redis.
- Design direction = **"Tropical Sunset"**, mobile-first (`docs/design.md`,
  live gallery at `/styleguide` in dev).
- The voting deadline defaults to Sat 2026-10-10 09:30 PDT; the admin can
  extend or close it (step 1.8).
- Browser testing tip: `resize_window` doesn't change the viewport, so use a
  narrow same-origin iframe (dev allows `SAMEORIGIN` framing); the extension's
  `type` action can fail to deliver key events, so drive inputs via
  `javascript_tool` (set value + `requestSubmit()`).
