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

Started as a single self-contained HTML file (`surf_and_stay_report_1.html`,
originally dropped in `~/dev/tenerife/`): an interactive "Canary Islands
decision report" comparing all 8 Canary Islands for a February 2027
friends-and-family trip (8 adults + 2 toddlers), scored on surf / sand / hike
/ family-attraction weighting, with an interactive SVG archipelago map,
filterable surf-spot guide, villa-base write-ups, a 9-day itinerary planner,
and a sources/decision section.

The user asked to port it into a SvelteKit app (matching the `~/dev/wenachee`
project's stack and conventions) and deploy it to Vercel under the name
**Eurotrip**, with the explicit intent to keep adding trip-planning
functionality over time (this project is not just the Canary Islands report —
"Eurotrip" is the umbrella name for broader future trip content).

**Important naming note:** the repo/site is called "Eurotrip" per the user's
instruction, but the actual current content is a Canary Islands (Spain, not
mainland Europe-trip in the usual sense) report. Don't let the mismatch cause
confusion — it's intentional; the name is for the project as a long-lived
trip-planning site, not a description of today's content.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 (runes, forced on for all project files) |
| Language | JavaScript + JSDoc types, type-checked by `svelte-check` (`checkJs` + `strict`) |
| Adapter | `@sveltejs/adapter-vercel`; whole site is **prerendered** (`src/routes/+layout.js`) |
| Styling | Scoped `<style>` per component + shared tokens/utility classes in `src/app.css`, no CSS framework |
| Lint / format | ESLint 10 flat config (`eslint-plugin-svelte` + `eslint-config-prettier`) + Prettier with `prettier-plugin-svelte` |
| Runtime | Node `>=22.12` (`engines` + `.npmrc` `engine-strict=true`); Vercel builds on Node 24 |
| Deploy | Vercel — `vercel --prod` from project root |
| Dev | `npm run dev` → localhost:5173 (port may vary) |

There is **no `svelte.config.js`** on purpose: SvelteKit ≥2.70 accepts its
config (adapter, compilerOptions) directly in `sveltekit({...})` inside
`vite.config.js`. Put any new Kit/Svelte config there.

Started as a copy of `~/dev/wenachee`'s config; since 2026-10-03 this project
additionally has lint/format/prerender/types set up, so it's now ahead of
wenachee — don't copy configs back from it blindly.

---

## Commands — run before every commit

```bash
npm run check    # svelte-check: must report 0 errors, 0 warnings
npm run lint     # prettier --check + eslint: must pass
npm run format   # auto-fix formatting
npm run build    # must succeed; output lands in .vercel/output/static/
```

Markdown files are excluded from Prettier on purpose (`.prettierignore`) —
Prettier reflows lists and once corrupted a line in `docs/history.md`.

---

## Project structure

```
src/
  app.html               # HTML shell (lang, favicon, viewport)
  app.css                # Global design tokens (CSS vars) + shared utility classes
  routes/
    +layout.js           # `export const prerender = true` — every page is static HTML
    +layout.svelte       # imports global src/app.css
    +page.svelte          # Wires all section components together + island-selection state
  lib/
    components/
      Topbar.svelte        # Sticky nav
      Hero.svelte          # Hero banner + verdict card
      Ranking.svelte       # Top-4 score cards (click to select an island)
      IslandMap.svelte     # Interactive SVG archipelago map + side info panel
      Comparison.svelte    # Full 8-island comparison table
      Finalists.svelte     # 4 island "story" write-ups (villa towns, callouts)
      SurfGuide.svelte     # Filterable spot grid + surf school price table
      Activities.svelte    # Hike/attraction cards grid
      Planner.svelte       # 9-day itinerary, tabbed per island (fue/ace)
      Decision.svelte      # "Choose X if..." decision rules + budget guardrails
      Sources.svelte       # Collapsible source link lists
      Footer.svelte
    config/
      islands.js           # All 8 islands' scoring data + text; also defines the
                           #   `Island` / `ScoreKey` JSDoc typedefs
      spots.js              # Surf/sand/hike/family spot list (used by SurfGuide filter)
      plans.js               # 9-day itinerary data, keyed by island id (fue/ace)
      schools.js             # Surf school price/contact table rows
      activities.js          # Hike & attraction card data
static/
  favicon.svg
docs/
  history.md              # Full chronological log of requests, decisions, and rationale
```

**Island selection state** lives in `+page.svelte` as a single `$state`
(`selectedIslandId`), passed down to both `Ranking` and `IslandMap` via props
+ an `onSelect(id, scroll)` callback — this replaces the original vanilla-JS
`selectIsland()` function that mutated the DOM directly across both the score
cards and the SVG map nodes.

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
  are prerendered on the server at build time.

**Types (JSDoc, no TypeScript files):**

- Type every component's props:
  `/** @type {{ selectedId: string, onSelect: (id: string, scroll: boolean) => void }} */ let { ... } = $props();`
- Type function params with `@param`; give config arrays/objects a
  `@typedef` + `@type` in the config file (see `islands.js`).
- `npm run check` must stay at 0 errors — don't silence with `any`.

**Accessibility:**

- Clickable things are `<button>` (or `<a>` for navigation). If a non-button
  element must be interactive (the SVG island `<g>` nodes), give it
  `role="button"`, `tabindex="0"`, an `aria-label`, and an Enter/Space
  `onkeydown` handler.
- Toggle/selected-state buttons (filters, tabs, score cards, map islands)
  carry `aria-pressed={isSelected}`; group them with `role="group"` +
  `aria-label`.
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

Because everything is prerendered, the build emits only static files
(`.vercel/output/static/`), with no serverless functions. If a future feature
needs server code (`+page.server.js`, `+server.js`), set
`export const prerender = false` on just that route.

**Known pending upgrade:** SvelteKit 3.0 / adapter-vercel 7.0 shipped
2026-10-01. The project is pinned to Kit 2.x until that upgrade is done
deliberately. `npm audit` shows a low-severity `cookie` advisory that is only
fixed in Kit 3; it doesn't affect this site (no cookies, fully static).

See `docs/history.md` for the Vercel project name/ID once the first deploy has
happened, and update this section then.

---

## What's next

**As of 2026-10-08 the site is being rebuilt** into a private villa-voting +
trip-hub app (login with invite phrase → vote on villas → admin picks the
winner → trip hub with villa, nearby places and flights). The Canary Islands
report described above is **deleted in step 1.4**, and this file's
Stack/Structure/Deploy sections will change (SSR instead of prerender, Redis,
env vars). Update them as each step lands.

Follow `docs/implementation-plan.md`; track status in `docs/progress.md`
(see "Work tracking" above). Key facts for a fresh agent:

- Admin = **Illia Pogodin** (the repo owner), `admin: true` in the roster.
- Storage = Upstash Redis (Vercel Marketplace). Villa/trip facts are in
  `src/lib/config/`; only mutable state (ballots, deadline override, winner,
  trip dates/notes, rate limits) is in Redis.
- Design direction = "Modern app UI", mobile-first (`docs/design.md`).
- The voting deadline defaults to Sat 2026-10-10 09:30 PDT; the admin can
  extend or close it.
