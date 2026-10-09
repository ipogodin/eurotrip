# Implementation plan — villa voting + trip hub

> **This file says WHAT to build and HOW. It does not track status.**
> Status, the current step, WIP notes and blockers live in
> **`docs/progress.md`**. Update that file, not this one, as work proceeds.
> Edit this file only when scope or approach changes, and log the change in
> the decisions table below.

Companion docs (read all before coding):

| Doc                   | Role                                                        |
| --------------------- | ----------------------------------------------------------- |
| `docs/progress.md`    | **Where we are**: step board, WIP, blockers, session log   |
| `docs/raw_plan.md`    | The user's own words + answers, verbatim                    |
| `docs/tech-spec.md`   | Contract: routes, auth, anti-brute-force, storage, rules   |
| `docs/design.md`      | Visual system + screen specs; all UI must follow it         |
| `docs/history.md`     | Chronological decision log                                  |

---

## 1. What we're building

The site stops being the Canary Islands comparison report and becomes a
private trip app for 8 people:

1. **Login splash** (`/`): a full-bleed Canary background (photo now,
   the user's video later) and an invite-phrase field, with server-side
   brute-force protection and a client cooldown UX.
2. **Phase 1, villa voting:** 6–10 candidate rentals on the island, shown as a
   **list** or on a **map**, mobile-first. 6 points per person, max 5 per villa (was 3),
   autosaved, editable until the deadline. Votes are public: _By villa_ /
   _By person_ / _My votes_ filters in one view.
3. **Admin (Illia Pogodin):** extend / close / reopen the deadline, pick the
   winner (any villa), and later edit trip dates and notes.
4. **Phase 2, trip hub:** once a winner is picked, everyone sees the villa,
   dates (flagged if changed), photos, bedrooms, amenities, map, nearby
   beaches/attractions/cafés with walk and drive times, and a Flights tab
   (London / Warsaw / Frankfurt ↔ island).

The old island report is **deleted** in step 1.4 (git history keeps it).

## 2. Decisions

| Date       | Topic          | Decision                                                                                                   |
| ---------- | -------------- | ---------------------------------------------------------------------------------------------------------- |
| 2026-10-08 | Storage        | Upstash Redis via Vercel Marketplace                                                                       |
| 2026-10-08 | Vote rules     | ≤6 pts (need not spend all), ≤5 per villa (raised from 3 on 2026-10-08), editable until deadline, live + public                         |
| 2026-10-08 | Phase 2 data   | Config files + redeploy; admin UI edits only deadline, winner, dates, notes                               |
| 2026-10-08 | Gating         | Everything behind login; `/` is the login splash when anonymous                                            |
| 2026-10-08 | Deadline       | Default Sat 2026-10-10 09:30 PDT (`16:30Z`); admin can extend / close now / reopen without redeploy       |
| 2026-10-08 | Old report     | Deleted; replaced by villa list + map                                                                      |
| 2026-10-08 | Home page      | Canary background + phrase prompt; video from the user later                                               |
| 2026-10-08 | Design         | Modern app UI (`docs/design.md`)                                                                           |
| 2026-10-08 | Admin          | Illia Pogodin, `admin: true` in the roster; also a voter                                                   |
| 2026-10-08 | Secrets        | Roster (names + phrases) in the `MEMBERS` env var; local gitignored `members.json`; never in the repo     |
| 2026-10-08 | Phrase storage | Plain text in the env var (hashing ~26-bit phrases adds little)                                            |
| 2026-10-08 | Roster editing | Manual, pre-deploy: edit `members.json` → `npm run members:push` → redeploy. No in-app editing           |
| 2026-10-08 | Kit version    | Stay on SvelteKit 2 for R1/R2; Kit 3 upgrade is step 3.3                                                   |
| 2026-10-08 | Villas         | 13 Tenerife listings from the wishlist, cut to the **8 south-west ones** before launch (the user removed 5: east/south-east/north) |
| 2026-10-08 | Vote budget    | Default 6; optional per-member `votes` in the roster (1–30) overrides it. Launch roster: nobody has a custom number (all 6) |
| 2026-10-08 | Preferred name | Optional private roster field `preferred`: only the signed-in person receives it; everyone else sees full/short names |
| 2026-10-08 | Member photos  | User supplies photos; "change photo" is a prank swap (step 3.4); photos never in `static/` or the repo     |

## 3. Timeline

Voting closes **Sat 2026-10-10 09:30 PDT** by default. **Release 1 must be
live by Fri 2026-10-09 evening PDT.** If it slips, the admin extends the
deadline (step 1.8; until then, change `DEFAULT_DEADLINE` and redeploy).
Steps marked _(can slip)_ may move after the R1 deploy.

Critical path: 1.1 → 1.3 → 1.4 → 1.5 → 1.6 → 1.8 → 1.9. Step 1.2 (design
system) runs before 1.4 because every screen uses it. Step 1.7 can slip.

## 4. Conventions for every step

- Follow `AGENTS.md` (Svelte 5 runes, JSDoc types, a11y rules) and
  `docs/design.md` (tokens, components).
- **Definition of done** (every step): `npm run check` = 0 errors/warnings,
  `npm run lint` clean, `npm test` green (from 1.1 on), `npm run build`
  succeeds, the step's acceptance criteria are verified, `docs/progress.md`
  is updated, a `docs/history.md` entry is added if a decision or deviation
  happened, and a commit is made (`step X.Y: <summary>`).
- Pure logic (vote rules, phrase/session, rate limits) is unit-tested.
  UI is verified in Chrome at **390 px** and **1280 px**.
- Never write a real phrase, `SESSION_SECRET` or token to any tracked
  file, a commit message, or the docs.

---

## 5. Release 1 — Voting live (target: Fri 2026-10-09 PDT)

### Step 1.1 — Runtime, storage, test harness

**Goal:** the app runs as SSR on Vercel with a working Redis store and a test
runner. The old report still renders.

Tasks:
1. Delete `src/routes/+layout.js` (global `prerender = true`).
2. User action: upgrade the CLI (`npm i -g vercel@latest`) and run
   `vercel link` (interactive → the user runs `! vercel link`).
3. Provision **Upstash Redis** from the Vercel Marketplace (load the
   `vercel:marketplace` skill first), connect it to the project for all
   environments, then `vercel env pull .env.local`. Record the exact
   env var names in `docs/tech-spec.md` → Storage.
4. `npm i @upstash/redis`.
5. Create `src/lib/server/store/index.js` (`getStore()` picks an
   implementation), `upstash.js`, `memory.js`, implementing the interface in
   the tech-spec. Use Upstash when its env vars exist; otherwise in-memory
   with a one-time console warning (dev only; production without Redis →
   throw).
6. `npm i -D vitest`; add a `test` block in `vite.config.js`; scripts
   `"test": "vitest run"` and `"test:watch": "vitest"`.
7. `src/lib/server/store/memory.test.js` covering every interface method,
   including TTL expiry with fake timers.
8. Run `npm audit`; confirm the `cookie` advisory doesn't affect us (we only
   set a constant cookie name/path/domain) and record the finding in
   progress notes.
9. Add `npm test` to the AGENTS.md "Commands" block.

Acceptance:
- `npm run build` produces `.vercel/output/functions/…` (SSR), and
  `npm run preview` still shows the report.
- `npm test` is green.
- A throwaway script (not committed), or the dev server, writes and reads a
  key on the real Upstash instance.

### Step 1.2 — Design system + app shell

**Goal:** tokens, font, icons and the base component kit from
`docs/design.md`, viewable in a dev-only style guide.

Tasks:
1. `npm i @fontsource-variable/inter`; import it in `+layout.svelte`.
2. Rewrite `src/app.css`: the new tokens (color, type scale, space, radius,
   elevation, motion), base element styles, focus ring, reduced-motion rules.
   Keep the old report tokens in a block marked
   `/* legacy report tokens — delete in step 1.4 */` so the report keeps
   rendering until it's removed.
3. Create `src/lib/icons/` with the ~20 inline SVG icons we need (Lucide-style,
   1.5 px stroke): bed, users, bath, map, list, pin, clock, plus, minus,
   check, x, chevron-left/right, external, log-out, shield, plane, waves,
   coffee, landmark, walk, car, calendar, settings.
4. Create `src/lib/components/ui/` with: `AppBar`, `BottomNav`, `Button`
   (primary / secondary / ghost / danger; sizes), `SegmentedControl`,
   `Avatar`, `AvatarStack`, `PointDots`, `Stepper`, `PointsMeter`,
   `Countdown`, `Card`, `Chip`, `Sheet` (bottom sheet ↔ modal, focus trap),
   `Toast` (+ a tiny toast store module), `Skeleton`. Each component has typed
   `$props()` and follows the a11y rules.
5. `src/lib/members-ui.js`: deterministic member hue from the id (8
   AA-checked hues) and initials.
6. `src/routes/_styleguide/+page.svelte` + `+page.server.js` that throws a
   404 when `!dev`.
7. Screenshots at 390 / 1280 px → show the user for a quick sign-off
   (non-blocking; record feedback in progress).

Acceptance: the style guide renders every component and state (disabled,
pressed, focus) without console errors; contrast spot-checked; the report
still renders.

### Step 1.3 — Auth core (no UI)

**Goal:** members roster, phrase check, signed sessions and the roster
scripts, all tested.

Tasks:
1. Add `members.json` to `.gitignore` (_done at planning time as a safety
   net_). Commit `members.example.json` (fake names and phrases).
2. `src/lib/server/members.js`: load `MEMBERS` env, or in dev only
   `members.json`; validate (unique ids, unique normalized phrases,
   `word-word` format, ≥1 admin, warn if ≠ 8); export `getMembers()`,
   `findMemberById()`, `matchPhrase(input)` (constant-time over all
   members, no early exit).
3. `src/lib/server/phrase.js`: `normalizePhrase()` (trim, lowercase,
   whitespace/underscores → `-`, collapse dashes).
4. `src/lib/server/session.js`: `createSession(memberId)`,
   `readSession(cookieValue)` (HMAC-SHA256 with `SESSION_SECRET`,
   `timingSafeEqual`, expiry), cookie options constant. Fail fast if
   `SESSION_SECRET` is missing or shorter than 32 bytes in production.
5. `scripts/wordlist-eff-large.txt` (EFF long list, credited in a header
   comment / README note) + `scripts/members.js` CLI:
   - `check`: validate `members.json`;
   - `gen <id>|--all`: set new phrases using `crypto.randomInt`, write the file,
     print the new phrases once;
   - `push`: validate, then replace `MEMBERS` for production + preview via
     `vercel env rm` / `vercel env add` (value piped through stdin, never
     echoed).
   - npm scripts `members:check`, `members:gen`, `members:push`.
6. Tests: `members.test.js` (validation errors, matching, case/space
   variants, no match), `phrase.test.js`, `session.test.js` (round trip,
   tampered payload, tampered signature, expired, unknown member, wrong
   secret).

Acceptance: all tests are green, and `npm run members:check` passes on the
example file and fails on a duplicate phrase.

### Step 1.4 — Login splash, gate, logout; delete old report

**Goal:** anonymous users see only the splash, members are signed in by
phrase, and the old report is gone.

Tasks:
1. `src/hooks.server.js`: read the session → `locals.member`
   (`{ id, name, short, isAdmin }` or `null`); for any non-`/` route
   without a member → `303 /?next=<path>` (relative paths only). Add
   security headers (`X-Frame-Options: DENY`, `Referrer-Policy`,
   `X-Content-Type-Options`).
2. `src/app.d.ts`-equivalent JSDoc for `App.Locals` (in `src/app.d.ts` —
   allowed as a declaration file, or via `jsconfig` types). Note the choice
   in progress.
3. `src/lib/server/ratelimit.js`, per the tech-spec "Anti-brute-force":
   `checkLogin(ip)` → `{ allowed, retryAfter }`, `recordFailure(ip)`,
   `recordSuccess(ip)`, escalating lock, daily cap, global pause, 24 h fail
   stats. Tests with the memory store + fake timers.
4. `src/routes/+page.server.js`: `load` redirects members to `/vote`
   (later the phase-aware target); `actions.login`: honeypot → rate check
   → `matchPhrase` → ≥600 ms floor → set cookie and redirect to a safe `next`,
   or `fail(400|429, { message, retryAfter })`.
5. `src/routes/+page.svelte`: the splash per `docs/design.md` (background,
   glass card, input attributes, cooldown countdown driven by `retryAfter`,
   disabled-while-pending, `use:enhance`, works without JS too).
6. Background: download the Corralejo dunes photo (CC BY-SA, already
   credited in the old Hero) → `static/splash/corralejo-{1600,2400}.webp`
   + a tiny blurred placeholder; caption credit on the splash.
7. `src/routes/logout/+page.server.js`: POST action clears the cookie → `/`.
8. Temporary `src/routes/vote/+page.svelte` placeholder ("Voting opens here")
   inside the new `AppBar` shell, so the redirect has a target.
9. **Delete the report:** components `Topbar, Hero, Ranking, IslandMap,
   Comparison, Finalists, SurfGuide, Activities, Planner, Decision, Sources,
   Footer` and config `islands, spots, plans, schools, activities`, plus
   the legacy token block in `app.css`.
10. Update the `AGENTS.md` project-structure section.

Acceptance (manual, dev server with members.json):
- Anonymous `/vote` → redirected to `/?next=/vote`.
- Correct phrase (any case, with spaces) → lands on `/vote`; reload keeps the
  session; logout works.
- 5 wrong phrases → the 6th shows a cooldown with a countdown; even the
  correct phrase is refused while locked.
- The honeypot filled via devtools → treated as a failure.
- The splash looks right at 390 / 1280 px; no console errors.

### Step 1.5 — Villa data + vote logic

**Goal:** the real villa data in config and all vote rules as tested pure
functions.

Tasks:
1. `src/lib/config/voting.js`: `DEFAULT_DEADLINE`, `VOTE_BUDGET`,
   `MAX_PER_VILLA`, `DEADLINE_LABEL = 'Sat 10 Oct, 9:30 am PDT'`.
2. `src/lib/config/villas.js`: the `Villa` typedef (tech-spec) + entries.
   With the listings provided: extract name, town, coords, price, bedrooms,
   bathrooms, sleeps, highlights and a blurb from each public listing page
   (Chrome), and the user confirms. Without them: 6 clearly fake placeholders
   (`[placeholder]` in the name) so the UI can be built.
3. `scripts/photos.js` (`npm i -D sharp`): takes source images per villa →
   `static/villas/{id}/{n}.webp` (1600 w) + `{n}-thumb.webp` (480 w), and
   reports dimensions for the config.
4. `src/lib/voting.js` (shared, no server imports): `votingState()`,
   `effectiveDeadline()`, `validateBallot()`, `tally()`, `spent()`,
   `canIncrement()` per the tech-spec.
5. `src/lib/voting.test.js`: limits (per-villa cap, 6 total, 0 drops a key),
   unknown villa, non-integer, closed/decided rejection, tie ranks,
   byPerson, notVotedYet, deadline override precedence.

Acceptance: the tests are green, and the villa photos render in the style
guide's VillaCard preview.

### Step 1.6 — Vote page: list layout + autosave

**Goal:** members can vote end-to-end on a phone.

Tasks:
1. `src/routes/vote/+page.server.js`: `load` (`depends('app:votes')`)
   returns villas, members (public fields only), ballots, tally,
   effective deadline, state, me; `actions.save` parses the JSON ballot from
   form data, re-validates with server time, `setBallot`, returns the fresh
   tally, or `fail(400|409)` with a message.
2. Components in `src/lib/components/vote/`: `VillaCard`, `VillaGrid`,
   `PersonRow`, `PeopleList`, `MyVotes`, `NotVotedNudge`, `VoteHeader`
   (countdown + PointsMeter + filters).
3. `src/routes/vote/+page.svelte`: `?view=villas|people|mine` via
   `SegmentedControl` (updates the URL with `goto(..., { replaceState,
   keepFocus, noScroll })`); `BottomNav` on mobile mirrors the three views.
4. Autosave: local `$state` draft ballot → optimistic UI → 600 ms debounced
   submit via `fetch` to the form action (`deserialize`), single in-flight
   request, rollback + error toast on failure, "Saved" toast on success.
5. Polling: `$effect` with a 15 s `setInterval` + `visibilitychange` →
   `invalidate('app:votes')`, skipped while a save is pending or in flight;
   cleanup on destroy.
6. Closed / decided states: steppers hidden, banner "Voting closed" /
   "Winner: X".
7. The `AppBar` avatar menu: name, Admin (if admin), Log out.

Acceptance (two browsers, two members):
- A votes 3+2+1 → 0 left, `+` buttons disabled with a hint; B sees A's votes
  within 15 s in all three views.
- A crafted POST with 4 points on one villa → rejected by the server.
- After moving the deadline into the past (temp config edit) → saving is
  refused and the UI shows closed.
- 390 px: no horizontal scroll, touch targets ≥ 44 px.

### Step 1.7 — Map layout + villa detail _(can slip)_

Tasks:
1. `npm i leaflet`; `src/lib/components/vote/VillaMap.svelte`: dynamic
   import in `$effect`, CARTO Voyager tiles + attribution, `divIcon` pins
   with totals (accent if I voted, sun for #1), fit bounds to villas,
   cleanup `map.remove()`.
2. `?layout=list|map` toggle. Mobile: full-height map + `Sheet` with a
   compact VillaCard + Stepper. Desktop ≥1100: list left / map right with
   hover ↔ pin highlight.
3. `src/routes/villas/[id]/+page.server.js` (404 on unknown id) and
   `+page.svelte`: scroll-snap gallery with counter, facts grid, highlights,
   blurb, listing link (`rel="external noopener"`, new tab), voters, sticky
   stepper bar sharing the autosave logic (extract it to
   `src/lib/ballot-client.svelte.js`).

Acceptance: pins and sheet work by touch (Chrome device emulation) and by
keyboard; detail-page votes stay in sync with the list.

### Step 1.8 — Admin

Tasks:
1. `src/lib/server/guards.js`: `requireMember(locals)`,
   `requireAdmin(locals)` (403).
2. `src/routes/admin/+page.server.js`: `load` = results tally, effective
   deadline, state, winner, fail stats, global pause. Actions:
   `extend` (datetime-local interpreted as **America/Los_Angeles** →
   UTC; must be in the future), `closeNow`, `reopen` (no winner; future
   deadline), `pickWinner` (valid villa id; also closes), `undoWinner`.
   Every action calls `requireAdmin`.
3. `src/routes/admin/+page.svelte` per the design: the Voting window card,
   Results table, Pick winner (+ confirm `Sheet`), Security card.
4. Tests: guard behaviour; the PDT→UTC conversion for the extend input,
   including the DST edge (the PDT→PST switch on Nov 1).

Acceptance: a non-admin gets 403 on GET and on every POST (curl); extend
updates everyone's countdown on the next poll; close → voting locked;
pick winner → banner shown on `/vote`.

### Step 1.9 — Ship R1

Tasks:
1. With the user: finalize `members.json` (8 names), `npm run members:gen
   -- --all`, show the phrases **in chat only**, and the user distributes
   them.
2. `SESSION_SECRET` = `openssl rand -base64 48` → `vercel env add` (prod +
   preview), never printed in docs.
3. `npm run members:push`; `vercel --prod`.
4. Production smoke test in Chrome (390 + 1280): splash, wrong phrase ×6 →
   lockout, login as the admin, vote, a second member in an incognito window,
   cross-visibility, admin extend → countdown changes, logout. Check
   Vercel runtime logs for errors.
5. Fill in the live URL in `AGENTS.md`; update the Deploy section (now
   SSR + env vars); write a history entry.

Acceptance: all 8 phrases work in production (the user confirms); no runtime
errors in the logs.

---

## 6. Release 2 — Trip hub (after the winner is picked)

Inputs first: booked dates, address/coords, check-in/out times, and the
group's preferred arrival airport(s).

### Step 2.1 — Phase switch + trip state

1. `votingState` → `decided` when `trip.winnerId` is set. `/` for members
   → `/trip` when decided, else `/vote`. `/trip*` → `/vote` while not
   decided.
2. `/vote` decided view: winner banner + final results, read-only.
3. Admin "Trip details" card: date start/end, check-in/out times, notes
   (plain text, max 2,000 chars; rendered as text, never as HTML).
4. `src/lib/config/trip.js`: typedef + the winner's `defaultDates`; a
   "Dates changed" badge when the Redis dates differ.
5. `BottomNav` switches to _Villa · Nearby · Flights_.

### Step 2.2 — Overview tab (`/trip`)

Hero gallery (reuse the 1.7 gallery), "You're going to <villa>", dates +
badge, trip countdown, facts, amenities icon grid, check-in/out, notes,
listing link.

### Step 2.3 — Nearby tab (`/trip/nearby`)

1. The agent researches ~6–10 beaches, ~6–10 attractions and ~6–10 cafés
   around the villa; coords from OSM/Maps; walk + drive minutes precomputed
   (OSRM or Google Maps lookups at authoring time), stored in `trip.js`.
2. A map with the villa + category pins; chips filter the map and the list
   together; the list is sorted by drive time with 🚶/🚗 minutes and a
   "Directions" link (Google Maps `dir` URL).

### Step 2.4 — Flights tab (`/trip/flights`)

1. The agent researches the routes for London (LHR/LGW/STN/LTN), Warsaw
   (WAW/WMI) and Frankfurt (FRA/HHN) ↔ the island airport around the trip
   dates: airlines, direct vs 1-stop, typical times, durations, typical
   price band, as of the research date (shown on the page).
2. UI: origin chips, Outbound/Return segmented control, option cards,
   deep links to Google Flights and Skyscanner prefilled with
   origin/destination/date.

### Step 2.5 — Ship R2

Deploy, smoke test the phase switch + all tabs at 390/1280, update docs.

---

## 7. Release 3 — Polish

- **3.1 Canary video background:** `ffmpeg` → H.264 MP4 + WebM (~1080p,
  ≤6 MB, muted loop, no audio track) + poster; `autoplay muted loop
  playsinline`; the still image under `prefers-reduced-motion` /
  `Save-Data`.
- **3.2 Quality pass:** Lighthouse mobile ≥90 for perf + a11y,
  keyboard-only and VoiceOver walkthrough, empty/error states, favicon +
  OG image, optional dark mode.
- **3.3 SvelteKit 3 / adapter-vercel 7 upgrade:** separate commit, full
  re-test.

### Step 3.4 — Member photos + the "neh, this one is better" swap

Requested 2026-10-08. Can be pulled forward (even before 1.9) as soon as the
photos arrive; it doesn't touch voting logic. ~Half a day.

**What it does.** Every avatar (app bar, voter stacks, People view, trip hub)
shows the member's photo instead of initials. The account menu gets a
**Change photo** item. When someone uses it, the app plays along ("Uploading
your photo…"), then says it's updated, but the new avatar is a different
photo from a pool the user supplied, shown with the caption **"neh, I think
this one is better"**. Everyone else sees the swapped photo too (on their
next 15 s refresh), so the joke is shared.

**Inputs from the user (I11):**
- DONE 2026-10-08: numbered photo versions per member in the git-ignored
  `avatars/` folder: `<id>_1` (own photo, the default), `<id>_2` (first
  replacement), `<id>_3` ... if more are added. Each "update" moves the member
  up one version; after the last one they go round to the first (changed 2026-10-09). (Replaces the earlier shared-pool
  idea.) The stored value is just the version number.
- DONE 2026-10-08: the phrases live in `src/lib/config/avatar-phrases.txt`
  (one per line, `#` comments; edit freely), picked at random (never the same
  phrase twice in a row), logic in `src/lib/avatar.js` (tested).
- DONE 2026-10-08 (user): yes, the admin can reset a member's profile photo to
  the initial configuration (version 1). Their vote budget is unaffected.
- Later, separate feature: notifying the others when someone changes their
  photo (e.g. "Anna has a new photo"). Not part of 3.4.

**Privacy (decided):** the repo is public and `static/` files are served to
anyone with the URL, without login. So member photos and the prank pool go
into a **private Vercel Blob store**, uploaded once by the agent with the CLI,
never committed. They're served through a gated route
`/avatars/[member]/+server.js` (member session required, `Cache-Control:
private`), resized to 96 / 256 px webp at upload time.

**Tasks:**
1. Provision a private Blob store (load the `vercel:vercel-storage` skill),
   `scripts/avatars.js upload` to crop/resize and upload `<id>_1.webp` and
   `<id>_2.webp` (the checker `npm run avatars:check` already exists); record
   the blob keys, never the files, in config.
2. Redis `avatar:{memberId}` = the version number (1 = own photo, 2 = first replacement, ...);
   the highest version per member comes from the upload (a small manifest), via
   `currentVersion` / `nextVersion` in `avatar.js`;
   the vote/trip `load` returns each member's current avatar version so
   polling picks up swaps.
3. `Avatar.svelte`: photo when available (`<img>` from `/avatars/<id>?v=…`,
   initials fallback while loading / on error).
4. Account menu → **Change photo** → native file picker (`accept="image/*"`).
   The chosen file is **never uploaded or stored**: the client only shows a
   preview + fake progress (~1.5 s), then posts a form action
   `?/swapPhoto` (no file) that moves the member up one version and returns a random phrase from the
   phrases file (and never back, unless the admin resets).
   Then a Sheet reveals the new avatar with the caption.
5. (Moved to a later feature.) Notifying the others, e.g. "Anna has a new photo".
6. Admin: "Reset photo" per member (back to version 1; votes and everything else stay as they are).

**Acceptance:** photos never reachable without a session (curl the URL
logged out → 303); the swap persists across reloads and shows for a second
member within 15 s; the uploaded file never leaves the browser (check the
request payload); keyboard and screen-reader friendly (the caption is
announced).

## 8. Risks

| Risk                               | Mitigation                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| R1 not live before Saturday        | Admin deadline extension; 1.7 can slip; redeploy with a new `DEFAULT_DEADLINE`    |
| Phrase brute force                 | Layered server limits (tech-spec); client JS is UX only                           |
| Secrets leak via the public repo   | Env vars + gitignored `members.json`; phrases shown only in chat                  |
| Lost votes                         | Whole-ballot writes; only the owner writes their ballot                           |
| Timezone mistakes                  | UTC storage; admin input explicitly in America/Los_Angeles; DST edge tested       |
| Listing photos as public static    | Acceptable (already public on listing sites); nothing private in `static/`        |
| Vercel CLI outdated (54 vs 63)     | The user upgrades in step 1.1                                                     |
