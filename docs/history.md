# Project history

Chronological log of requests, decisions, and rationale for the Eurotrip
project. Append new entries at the bottom with a date. Do not delete or
rewrite old entries — if something becomes outdated, add a new entry noting
the change rather than editing history.

Purpose of this file: any agent (or the user, months later) should be able to
read this top to bottom and understand the full "why" behind the project
without the user re-explaining anything.

---

## 2026-10-03 — Project created

**Starting point:** the user had a single self-contained HTML file,
`surf_and_stay_report_1.html` (~62 KB, 368 lines), sitting in
`~/dev/tenerife/`. It's an interactive "Canary Islands decision report" — a
surf-trip planning document for 8 adults + 2 young children traveling
February 2027, comparing all 8 Canary Islands on a weighted score (surf 45%,
sandy beach 25%, hiking 18%, family attractions 12%), with:

- A hero section with a top verdict card (Fuerteventura #1).
- Top-4 "score cards" with mini progress bars, clickable to select an island.
- An interactive inline SVG map of the archipelago — click an island shape
  (or use keyboard) to update a side info panel. Originally driven by vanilla
  JS DOM manipulation (`selectIsland()` function toggling classes across both
  the score cards and the SVG nodes).
- A full comparison table across all 8 islands.
- 4 "finalist" island write-ups (Fuerteventura, Lanzarote, Gran Canaria,
  Tenerife) with recommended villa towns per island.
- A filterable surf/sand/hike/family spot grid, plus a surf-school price
  comparison table.
- A hike/attraction card grid (12 items across all islands).
- A 9-day itinerary planner, tabbed between two island plans (Fuerteventura /
  Lanzarote).
- "Choose X if…" decision rules + budget guardrails.
- Collapsible sources/citations section.

**Request:** deploy this to Vercel as its own app. The user pointed at
`~/dev/wenachee` (a SvelteKit 2 + Svelte 5 app, also deployed to Vercel, built
for a different family trip — a 2026 Lake Wenatchee camping trip with a
river-crossing puzzle game) as the reference project to copy conventions from:
same `package.json`/`vite.config.js`/`jsconfig.json`/`.gitignore`/
`vercel.json` shape, same `src/lib/components/` + `src/lib/config/` split,
Svelte 5 runes mode forced via the vite-plugin-svelte `compilerOptions`
override (same as wenachee).

Naming: the user asked for the project to be called **"Eurotrip"** — this is
deliberately a bigger/umbrella name than the current Canary Islands content,
because the user said they intend to keep adding more trip-planning
functionality later, the same way wenachee grew over time (weather API, a
game, a live schedule, etc.). So "Eurotrip" is the long-lived project name,
not a literal description of today's single report.

**Decisions made (confirmed with the user via AskUserQuestion before
building):**
- Project/repo name: `eurotrip` (lowercase, matches wenachee's convention).
- GitHub repo: **public** (matches wenachee, which is also public).
- Svelte structure: **split into components**, not a single mega `+page.svelte`
  — mirrors wenachee's pattern. Data was separated into
  `src/lib/config/{islands,spots,plans,schools,activities}.js` and markup
  into one component per report section (`Hero`, `Ranking`, `IslandMap`,
  `Comparison`, `Finalists`, `SurfGuide`, `Activities`, `Planner`,
  `Decision`, `Sources`, plus `Topbar`/`Footer`).
- Vercel scope: user's personal/default account, same as wenachee (no team
  switch needed — `vercel` CLI and `gh` CLI were both already authenticated
  in this environment as `ipogodin`).

**Implementation notes for future reference:**
- The vanilla-JS `selectIsland(id, scroll)` function (which both scrolled to
  the map section and toggled `.active`/`.selected` classes across score
  cards + SVG nodes) became a single `$state` variable (`selectedIslandId`)
  owned by `+page.svelte`, passed down to `Ranking` and `IslandMap` as a prop
  + `onSelect` callback. This was the only piece of real interactivity/shared
  state in the whole report; everything else (surf-spot filter buttons,
  planner island tabs) is local `$state` inside its own component since
  nothing else needs to read that state.
- The SVG map paths (island shapes, base-dot coordinates, etc.) were kept
  as hardcoded markup in `IslandMap.svelte` rather than data-driven — they're
  fixed illustrative geometry, not real content that changes.
- `npm run build` (vite build via `@sveltejs/adapter-vercel`) was verified to
  succeed with zero errors before considering the port done.
- Manually smoke-tested in Chrome via `claude-in-chrome`: hero/topbar render,
  score cards render, island map renders and island-click correctly swaps
  the side panel (tested Fuerteventura → Lanzarote), finalist write-ups
  render, surf spot cards + chips render. No console errors.

**Next steps the user should expect:**
- `git init`, first commit, GitHub repo creation via `gh repo create`, first
  push.
- Vercel project linking (`vercel link` / `vercel --prod`) and first deploy.
- Once a Vercel deployment exists, come back and fill in the live URL at the
  top of `AGENTS.md` and in this file.
- Per the user's explicit mid-build request: `AGENTS.md`, `CLAUDE.md`, and
  this `docs/` directory were created specifically so that any future agent
  (or the user after a long gap) has full context without needing a
  re-explanation — keep this file updated going forward whenever a
  meaningful decision, request, or change happens in this project.

---

## 2026-10-03 — Standards audit + Svelte best-practices pass

**Request:** "verify if this project is up to standards", update
`AGENTS.md` with Svelte best practices, fix the project and its
configuration, and only ask the user for things the agent can't do itself.

**Findings and what was done:**

- `npm run check` reported **11 type errors** (untyped props/params, untyped
  index lookups) → fixed with JSDoc: `Island`/`ScoreKey` typedefs in
  `src/lib/config/islands.js`, typed `$props()` in `Ranking`/`IslandMap`,
  typed tab/weight tuples, `@param` on handlers. Now 0 errors.
- **No lint/format tooling** → added the standard `sv create` setup: Prettier
  (+ `prettier-plugin-svelte`) and ESLint 10 flat config
  (`eslint-plugin-svelte`, `eslint-config-prettier`, `.gitignore`-aware).
  New scripts: `npm run lint`, `npm run format`. Whole codebase was
  reformatted once (whitespace only). `*.md` is excluded from Prettier
  because it turned a line starting with `+ \`onSelect\`` in this file into
  a bullet point, which changed the meaning of an existing entry; that change
  was reverted.
- **Accessibility bug in the map:** the SVG had `role="img"`, which makes all
  of its children presentational, so screen readers couldn't see the eight
  island buttons at all. The wrapper also had `role="application"`. Changed
  the SVG to `role="group"` (title as label, desc as description) and
  dropped `role="application"`. `aria-pressed` was only on Fuerteventura →
  added it to all 8 islands, the score cards, the surf filters and the
  planner tabs (with `role="group"` labels).
- **Unused `@sveltejs/adapter-auto`** dependency → removed.
- **Site is pure static content but was built as a serverless function** →
  added `src/routes/+layout.js` with `export const prerender = true`. The
  build now emits only static HTML, with no Vercel function.
- Added `engines.node >=22.12` + `.npmrc engine-strict=true` (Vite 8/Kit
  need modern Node; Vercel default is Node 24), and `.vscode/extensions.json`
  recommending the Svelte/Prettier/ESLint extensions.
- Removed a needless `typeof document` guard in `+page.svelte` (the
  function only runs from click handlers).
- School links got `rel="external"` (dynamic external `href`).

**Deliberately NOT done (needs a decision from the user):**

- **SvelteKit 3.0.0 / adapter-vercel 7.0.0** were released 2026-10-01 (2 days
  earlier). Stayed on Kit 2.70 rather than jumping a brand-new major
  unasked. The only `npm audit` item (low-severity `cookie`) is fixed only by
  Kit 3, and it's irrelevant for a static, cookie-less site.
- **Vercel project isn't linked locally** (`.vercel/` has no
  `project.json`), and `vercel project ls` hung in the agent's shell, likely
  waiting on an interactive prompt. The CLI is also outdated (54.x vs 62.x).
  The user needs to upgrade/link/deploy themselves.

**Verification:** `npm run check` 0 errors / 0 warnings, `npm run lint`
clean, `npm run build` OK (prerendered `index.html`). Smoke-tested the
production preview in Chrome: map click and keyboard Enter select islands,
score card selects and scrolls, surf filter (Hike → 6 spots), planner tab
switch to Lanzarote; `aria-pressed` updates; no console errors.

---

## 2026-10-08 — Voting + trip hub feature planned (no code yet)

**Request:** add a voting system for choosing the villa (6–10 candidate
properties, 8 people), followed by a phase 2 trip hub once the admin (the user)
picks a winner. Plan first, implement later, with progress tracked in files so
sessions can stop/restart without losing the thread.

**Requirements as stated:** each person has a personal two-word dash phrase
(e.g. `word-word`) held in an unexposed name → phrase map; entering it sets an
auth cookie. 6 points each, max 3 per property; votes are public and viewable
both property → voters and person → picks in one view with filters. Voting
ends Sat 2026-10-10 09:30 PST (PDT in effect → `16:30Z`). Admin may pick any
winner. Phase 2 shows property, dates (and whether they changed), map,
amenities, photos, bedrooms, nearby beaches/attractions/cafes (walking and
driving), and a tab of flights from/to London, Warsaw, Frankfurt.

**Decisions (via AskUserQuestion):** Upstash Redis via Vercel Marketplace;
edit-freely live-public voting with up to 6 points (not all must be spent);
phase 2 facts in config files + redeploy with only winner/dates/notes live
admin-editable; everything gated behind login except `/login`.

**Consequences noted:** the site can no longer be fully prerendered (gated
pages need server hooks), so `prerender = true` is removed in step A1; the
report moves to `/report`; invite phrases go in a Vercel env var rather than
a committed file because the repo is public.

**Artifacts:** `docs/plan-voting.md` (decisions, assumptions, step checklist),
`docs/voting-spec.md` (routes, auth, storage, rules). `AGENTS.md` gained a
"Work tracking" section describing the resume procedure.

---

## 2026-10-08 — Implementation plan v2 (supersedes plan-voting.md)

**Request:** review `docs/raw_plan.md` and produce an implementation plan for
the site going forward. Clarifications: Illia Pogodin is the admin and must be
markable as such; the island-selection report is no longer needed once this
ships; "good design" is expected.

**Second-round answers:** admin can extend / close / reopen the deadline
(no redeploy); the old island report is **deleted** and replaced by
villa-selection pages on the island (list **and** map, mobile-friendly);
the home page becomes a login splash with a Canary Islands background (the
user may record video) and an invite-phrase prompt with brute-force
protection; design direction = **Modern app UI**.

**Review finding that shaped the plan:** the voting deadline (Sat 09:30 PDT)
was ~48 h away at planning time, so work is split into releases: R1 = voting
live by Friday (auth, splash, list voting, admin deadline/winner; the map view
is marked "can slip"), R2 = trip hub after the winner is picked, R3 = polish
(video background, quality pass, Kit 3 upgrade).

**Security note recorded in the spec:** the user asked for "a JavaScript
approach" to stop phrase guessing. Client JS can't enforce this (direct POSTs
bypass it), so the design is layered server-side limits (per-IP escalating
lockout, daily cap, global pause), a minimum response time, a honeypot, and
EFF-wordlist phrases (~60 M combos each), with the client JS providing the
cooldown UX.

**Doc changes:** `docs/plan-voting.md` and `docs/voting-spec.md` (written
earlier today, never committed) were replaced by
`docs/implementation-plan.md`, `docs/tech-spec.md` and `docs/design.md`.
`docs/raw_plan.md` gained the clarifications and answers verbatim. The member
roster (names + phrases + admin flag) is kept in the `MEMBERS` env var, so even
names stay out of the public repo.

---

## 2026-10-08 — Roster editing decided: manual, pre-deploy

The user asked how invite phrases are stored and verified, then asked to be
able to modify them as admin, "maybe manually, on pre deployment stage".
Decision: phrases stay plain text in the `MEMBERS` Vercel env var (hashing
low-entropy phrases adds little); the admin edits a gitignored `members.json`
locally and runs `npm run members:push` (validate + replace env var via
`vercel env`), then redeploys. No in-app phrase editing (would put phrases in
Redis and expose them to a stolen admin session). Spec: `docs/tech-spec.md`
→ "Editing the roster"; plan step 1.3 updated.

---

## 2026-10-08 — Detailed plan + progress tracker; baseline commit

The user asked for a detailed implementation plan, a document for tracking,
the tracking rules in AGENTS.md, and a commit, with **no implementation yet**.

- `docs/implementation-plan.md` rewritten as a file-level plan: each step has
  a goal, numbered tasks (files to create/delete) and acceptance criteria;
  shared definition of done; critical path; decisions table. It no longer
  holds status.
- New `docs/progress.md` is the single status tracker: current position, step
  board (todo / in progress / blocked / done / skipped + dates + commit),
  blockers/inputs needed from the user (I1–I7), per-step WIP/final notes,
  session log.
- `AGENTS.md` "Work tracking" rewritten (doc table + start/WIP/finish
  procedure + secrets rule); "What's next" now describes the rebuild.
- `.gitignore` gained `members.json` ahead of step 1.3, so the roster file
  can't be committed by accident if the user creates it early.
- Committed together with the still-uncommitted 2026-10-03 standards pass
  (lint/format tooling, a11y fixes, prerender), which was verified first:
  `npm run check` 0 errors, lint clean.

---

## 2026-10-08 — Step 1.1 done (Redis + SSR)

Upstash Redis (`eurotrip-redis`) provisioned and connected to all
environments; app now SSR. A real-Redis test exposed an `HGETALL` shape
quirk (flat array when auto-deserialization is off) that the in-memory tests
could not catch, so it is handled and tested. Details in `docs/progress.md`.

---

## 2026-10-08 — Step 1.2 done (design system)

Tokens, Inter, inline icon set and 15 UI components per `docs/design.md`; a
dev-only `/styleguide` shows them. Old report CSS isolated in
`src/lib/legacy-report.css` until step 1.4 deletes the report. Details in
`docs/progress.md`.

---

## 2026-10-08 — Design v2: Tropical Sunset

After seeing the first styleguide the user said the design had "no life",
"only the corporate feel", and asked for something vivid with tropical fonts
that feels like vacation, rest, mindfulness, fun, energy and exotic
(verbatim in `docs/raw_plan.md`). Replaced the "Modern app UI" look with
**Tropical Sunset**: cream base with turquoise/mango/hibiscus glows, hibiscus
CTAs, lagoon selection color, mango "sun" point dots, Fraunces (soft/wonky
display) + Nunito (body) + Caveat Brush (script accent), pill shapes, springy
motion, floating pill bottom nav, decorative sun/wave/palm-frond components,
and a sunset hero in `/styleguide`. `docs/design.md` rewritten; step 1.2's
result updated in place (same components, new skin). The layout principles
(mobile first, list/map, public votes) are unchanged.

---

## 2026-10-08 — Step 1.3 done (auth core)

Roster loader/validator, constant-time phrase match, signed session tokens,
roster CLI (`members:init|check|gen|push`) and the EFF word list; 45 tests
total. `push` verified against Vercel with a throwaway variable (stored as
Secret for Production + Preview, replace semantics confirmed, then removed).
No UI yet; step 1.4 wires it in. Details in `docs/progress.md`.

---

## 2026-10-08 — Step 1.4 done (gate + login splash)

Login-gated app is live locally: tropical splash with invite phrase, lockout
UI, session cookie, logout, old Canary report deleted. Two safety lessons:
SvelteKit skips its CSRF origin check in dev (verified in a production-mode
preview instead), and dev was silently using the production Redis, so dev now
defaults to an in-memory store. Details in `docs/progress.md`.

---

## 2026-10-08 — Step 1.5 done (vote rules + villa config, placeholders)

Pure vote rules and tally with 19 tests; villa typedef/config with six
placeholders and a validating test; photo-processing script. Real listings are
still needed (I3). Details in `docs/progress.md`.

---

## 2026-10-08 — SvelteKit 3 upgrade stays at step 3.3

The user approved all proposals from the 2026-10-03 standards audit. By then
the commit and the Vercel CLI upgrade/link were already done. For the
remaining proposal (SvelteKit 3 / adapter-vercel 7), the user chose to keep
it as step 3.3 instead of upgrading now, because voting closes 2026-10-10 and
step 1.6 (vote page) comes first. The low `cookie` advisory is still accepted
as not exploitable (constant cookie name/path, no domain); see step 1.1 notes.

---

## 2026-10-08 — Login background: sea video instead of desert photo

Feedback on the login page (I8): "looks good", but the user wanted the
background to be dynamic and noted there was no sea, only desert. Pulled step
3.1 forward: a seamless 28 s loop of Playa del Matorral, Fuerteventura (sand
in front, waves rolling in) from Wikimedia Commons (CC BY-SA 3.0), with a
lighter tint so the sea's blue actually shows, and a phone-specific framing
so the sea isn't hidden behind the card. Reduced-motion and Save-Data visitors
get the still poster only. Details in `docs/progress.md` (step 3.1).

---

## 2026-10-08 — Real villas: 13 Tenerife listings from the Airbnb wishlist

The user shared their Airbnb wishlist "Tenerife, Spain 2027" and said it holds
all 13 listings to vote on. Consequences: the trip island is **Tenerife**
(earlier docs never stated the island; the placeholder villas guessed
Fuerteventura from the old report), and the plan's "6–10 villas" became 13
(config test now allows up to 15). Prices are the wishlist's saved 9-night
prices in USD, each for that listing's own saved dates, so they are
estimates, not quotes. Open question to the user (I9): 6 villas cap at 8
guests, which only fits 8 adults + 2 kids if both kids are under 2. Details
in `docs/progress.md` (1.5 addendum).

---

## 2026-10-08 — Step 1.6: the vote page

The user confirmed both babies are under 2, so all 13 villas fit the group
(Airbnb doesn't count under-2s), and said to read guest reviews when a
listing's description is thin (done for Duke and "Close to the Beach").
Then the vote page was built: villas / people / my votes views, tap-to-vote
with autosave, everyone's votes refreshing every 15 s, and read-only
closed/decided states. Decision: the browser computes the tally itself with
the shared `tally()`, so a tap shows instantly and polling only moves
ballots. The agent could not run the two-person check itself (signing in as
a second member with a test phrase was blocked by a permission rule), so the
user does that one (I10). Details in `docs/progress.md` (1.6).

---

## 2026-10-08 — Vote page feedback: points left, menu, budgets, photos

The user asked for: the points left to stay visible while voting (now a
pill in the sticky top bar, for every member); the account menu to close on
a click anywhere else; an optional per-member vote budget in the roster
(`votes`, default 6); and, as a planned feature (step 3.4), member photos
plus a joke "change photo": the app pretends to upload, then swaps in a
photo from a pool the user provides, with the caption "neh, I think this one
is better", visible to everyone. Decided while planning 3.4: photos never go
into `static/` or the public repo (both readable without login); they live
in a private Blob store behind a member-only route, and the "uploaded" file
never leaves the browser.
