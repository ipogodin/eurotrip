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

**Step:** 1.9 — Ship R1
**State:** not started
**Next action:** step 1.9 (ship). Needs the 8 members (I4) first. The user should look at the new map vote page (I12). Open: the two-browser check of 1.6 (I10; Anna's votes already show up in the dev data, so it may have been done). Login page approved by the user 2026-10-08 (I8 done, sea video in).

## Step board

| Step | Title                                   | Status | Started | Done | Commit |
| ---- | --------------------------------------- | ------ | ------- | ---- | ------ |
| 1.1  | Runtime, storage, test harness          | done   | 2026-10-08 | 2026-10-08 | d6ea475 |
| 1.2  | Design system + app shell               | done   | 2026-10-08 | 2026-10-08 | 1a00a49 |
| 1.3  | Auth core                               | done   | 2026-10-08 | 2026-10-08 | 6c2303d |
| 1.4  | Login splash, gate, delete old report   | done   | 2026-10-08 | 2026-10-08 | b061ded |
| 1.5  | Villa data + vote logic                 | done   | 2026-10-08 | 2026-10-08 | 72fb769 |
| 1.6  | Vote page: list + autosave              | done   | 2026-10-08 | 2026-10-08 | 8656cd1 |
| 1.7  | Map layout + villa detail (can slip)    | done (illustrated map) | 2026-10-08 | 2026-10-08 | see below |
| 1.8  | Admin                                   | done   | 2026-10-08 | 2026-10-08 | 20bba06 |
| 1.9  | Ship R1                                 | todo   |         |      |        |
| 2.1  | Phase switch + trip state               | todo   |         |      |        |
| 2.2  | Trip overview tab                       | todo   |         |      |        |
| 2.3  | Nearby tab                              | todo   |         |      |        |
| 2.4  | Flights tab                             | todo   |         |      |        |
| 2.5  | Ship R2                                 | todo   |         |      |        |
| 3.1  | Canary video background                 | done (early) | 2026-10-08 | 2026-10-08 | 4366b5b |
| 3.2  | Quality pass                            | todo   |         |      |        |
| 3.3  | SvelteKit 3 upgrade                     | todo   |         |      |        |
| 3.4  | Member photos + "neh" photo swap        | todo (needs I11) |   |      |        |

## Blockers / inputs from the user

| #  | Needed by | Input                                                                                   | Status  |
| -- | --------- | --------------------------------------------------------------------------------------- | ------- |
| I1 | 1.1       | Upgrade the Vercel CLI (`npm i -g vercel@latest`) and run `vercel link` (interactive) | done 2026-10-08: CLI 63.1.0, linked `ipogodins-projects/eurotrip` |
| I2 | 1.1       | Accept Upstash marketplace terms | done 2026-10-08 |
| I3 | 1.5       | 6–10 villa listing URLs (+ any notes per villa)                                         | done 2026-10-08: 13 Tenerife villas from the Airbnb wishlist |
| I4 | 1.9       | The 8 members: full name + short name (Illia Pogodin = admin)                          | waiting |
| I11 | 3.4      | Member photos (one each), the prank pool photos + exact caption, and the swap rules (see plan 3.4) | waiting |
| I13 | 1.8      | Admin reset-everyone's-votes button | done 2026-10-08: yes, built (plus removing a villa, points return to voters) |
| I14 | 1.8      | Sign in as a NON-admin (e.g. the 2nd dev member) and open `/admin`: it must say 403. The agent can't enter phrases; guards are unit-tested and anonymous requests were checked | waiting |
| I12 | 1.7      | Look at the map vote page (`npm run dev` → `/vote`) on a phone and a computer: photo size, the spread-out positions in Costa Adeje, the compact header. Say what to change. `VOTE_LAYOUT = 'list'` in `src/lib/config/voting.js` brings back the old card list | **waiting** |
| I10 | 1.6      | Two-browser check: sign in as the 2nd dev member on `127.0.0.1:<port>` (phrase in your `members.json`), vote, and confirm the other window sees it within 15 s. The agent may not enter phrases itself | **waiting** |
| I9 | 1.6       | Ages of the 2 kids in Feb 2027: under 2 or 2+? 6 villas allow max 8 guests (Airbnb counts kids 2–12) | done 2026-10-08: both under 2, so all 13 villas fit (no warning needed) |
| I8 | 1.4       | Look at the login page (`npm run dev`, open `/`; dev phrase is in your local `members.json`) and tell me if you want changes | done 2026-10-08: sea video approved ("looks good") |
| I5 | 1.2       | Sign-off on the style-guide screenshots (non-blocking)                                 | later   |
| I6 | 2.x       | Booked dates, address, check-in/out times, preferred arrival airport(s)                | later   |
| I7 | 3.1       | The Canary video clip (optional; a photo is used until then)                           | optional: a CC Commons clip is used now; the user's own clip can replace it |

## Step notes

_(WIP and final notes per step go here, newest first.)_

### 1.8 — done (2026-10-08): Admin

`/admin` (admin only: `requireAdmin` in the load AND in every one of the 7
actions; non-admins get 403, anonymous visitors are redirected by the gate
before any code runs). Page: **Voting window** (status chip, countdown,
closing time in PDT; date box in Pacific time; "Update deadline" /
"Reopen voting" when closed; "Close voting now"), **Results** (ranked villas
with voter avatars; **Pick winner** and **Remove** per villa), **Removed
villas** (+ "Bring back"), **Start the vote over** ("Reset everyone's votes"),
**Login security** (failed logins 24 h, pause status). Every one-way action
asks first (`ui/ConfirmSheet`); the remove sheet names who gets how many
points back. Toasts report each outcome (`admin-form.js`).
The user's additions: (1) reset everyone's votes; (2) remove a villa from
the list and give its points back to the voters.
- Storage: `voting` hash gained `removed` (JSON list of villa ids) and
  `resetAt`; `parseIds` tolerates a corrupted value; the Upstash store takes an
  injectable client so it's tested with a fake (4 tests).
- `server/admin-actions.js`: all rules as store-level functions (testable):
  `setDeadline` (future only, ≤120 days, not while a winner is picked),
  `closeNow`, `pickWinner` (active villas only), `undoWinner`,
  `resetAllVotes` (not while decided), `removeVilla` (deletes the villa from
  every ballot = points return; refuses the winner, a decided vote, and
  fewer than 2 remaining villas), `restoreVilla` (starts at zero; returned
  points are NOT re-applied). 25 tests.
- `time.js`: `pacificToUtc` / `utcToPacificInput` (DST-correct; tests cover
  Oct 31/Nov 1 2026 and Mar 14 2027, bad input, ambiguous/skipped hours).
- `server/guards.js` (`requireMember`, `requireAdmin`; 4 tests).
- Removed villas hide everywhere: `loadVoteData` returns `removed`, prunes
  every ballot to active villas, the save action validates only against active
  villas (so no one can vote for a removed one or be charged for leftovers),
  `pruneBallot` in `voting.js`. A removed villa's own page says "was removed".
  Pin positions stay put (layout uses the full list).
- **Member notices** (`useAdminNotices`): after a refresh, members see "The
  admin reset everyone's votes. You have all N points again." or "<Villa> was
  removed from the list. Your N points are back." No notice on first load.
- Verified in Chrome as the admin: remove a villa that had 3 points (the
  confirm text says who gets them back; my counter went 0 → 3 left), the old link shows the removed notice,
  the server refuses a ballot with the removed villa (400) and accepts the
  freed points elsewhere; reset everyone (+ notice); close (saves → 409) and
  reopen with a Pacific time that reads back identically; pick winner (banner
  "We're staying at …", gold pin, controls locked) and undo; restore; remove →
  notice "Your 2 points are back." Anonymous GET → login redirect, anonymous
  POSTs to all 7 actions → redirected, state unchanged. 390 px: no overflow.
- Not verified by the agent: a signed-in NON-admin getting 403 (credential
  entry is blocked for the agent; I14). Covered by `guards.test.js`.
- Gotchas: in zsh a loop variable named `path` overwrites PATH (curl vanished);
  a Write over `store/upstash.test.js` replaced existing tests (restored): check
  `git diff` for deletions before committing test files.

### Reset button wording (2026-10-08, the user's feedback)

The first top-bar version used a ↺ icon ("Start over"). The user said it looks
like "refresh the page". Replaced with plain words: an outlined pill reading
**Reset** on phones and **Reset my votes** from 641 px, aria-label "Reset all
my votes"; the My votes button and the confirmation use the same words. The
`rotate-ccw` icon was removed. Without the icon the top bar was ~11 px too wide
at 360-430 px, so the wordmark shrinks (20 px, 18 px under 400) and gaps
tighten; verified 0 px overflow at 320/340/360/375/390/430/440/700 px. Lesson:
avoid icons with a strong other meaning (refresh/undo) on destructive actions.

### Earlier version: "Start over" in the top bar (2026-10-08, the user's follow-up)

The user asked how a member can easily reset and start over: the first
version was only a button at the bottom of My votes, too hidden. Now a
**Start over** button (↺ icon, plus the label from 640 px) sits in the top bar
next to the points counter on the map, on every villa page and in the list
view, and also in My votes; it appears only while voting is open and the
member has votes, and always opens the same confirmation. One shared component,
`vote/ResetVotes.svelte` (`bar` = top-bar pill). Top bar made to fit 320–430 px
(tighter gaps, sun dropped from the counter, wordmark smaller / hidden under
350 px; the logo link keeps `aria-label`). New `rotate-ccw` icon.
Verified in Chrome: from the map, tap ↺ → confirm → 6 of 6 left, the pink
badge leaves the map, the button hides; no overflow at 320/340/360/390/430 px.

### Reset my votes (2026-10-08, the user's request)

"Reset votes": each member can take all their points back and vote again.
Built as a per-person action (the user's wording was "all votes return to
customer"); a reset for EVERYONE is not built, it belongs to Admin (1.8) if
wanted (decision for the user, I13). `BallotClient.reset()` saves an empty
ballot at once (no debounce) with its own toast; "Reset my votes" button at the
bottom of the My votes view (only while voting is open and there are votes),
behind a confirmation Sheet ("You'll get all N points back… everyone can see
your votes disappear"). No server change: an empty ballot was already valid.
Verified in Chrome: Keep leaves everything unchanged; Reset → 6 of 6 left
instantly, toast, empty state, survives reload, People shows "Not voted yet"
and Anna's votes untouched; re-voting afterwards saves normally.

### 1.7 — done (2026-10-08): map voting, villa pages (user's redesign)

The user wanted: vote buttons right under the villa photo; the vote page to
open on a map of Tenerife with each villa as a photo; tapping a photo opens
that villa's page where you vote and then go back; most of the screen
should be villa images; "approximately, not accurately". Answers to my
questions: illustrated island (not a real map), pins spread out near their
real spots, keep both views behind one switch, map before Admin/launch.
Backup of the old version: git tag **`vote-list-v1`** (commit 2d38a73).

- **Switch:** `VOTE_LAYOUT` in `src/lib/config/voting.js` (`'map'` | `'list'`);
  flip + redeploy to go back. The list code (`VillaGrid`/`VillaCard`) is
  untouched apart from the vote bar moving under the photo. In list mode the
  labels/icons and the full-size header come back too.
- `VoteBar` (new): voters + stepper, placed directly under the photo in the
  card, and under the gallery on the villa page.
- `VillaMap`: SVG island (hand-drawn coastline in `config/tenerife.js`,
  Catmull-Rom smoothing, Teide, a few area names, wave lines) with HTML `<a>`
  photo pins over it (real links: keyboard, screen readers, long-press
  menu on phones). Pin = 12.5% of the map width (44 px min on a phone),
  rank sticker (#1 gold), my points in a pink badge + pink ring, winner gets a
  gold glow; name label on big screens or on hover/focus; thin dashed
  lines + a dot point from each photo back to the real spot.
- `map-layout.js`: `spreadPins` pushes overlapping pins apart (5 villas sit
  within a few km in Adeje), deterministic, computed once in config order so
  pins never jump when the ranking changes; `smoothClosedPath`. 9 tests incl.
  "no photo hides another", "every villa lands on the island".
- `/villas/[id]`: big gallery (swipe / arrows, "n / 6"), the vote bar right
  under it, then facts, price (+ the saved dates), highlights, blurb, Airbnb
  link, "Back to the map". Same autosave (`BallotClient`), same polling.
  404 for unknown ids. Gallery height is capped so the vote buttons are always
  on screen.
- Refactors to share code: `server/vote-data.js` (members, ballots, status),
  `vote-view.js` (`buildVoteView`: tally + per-villa rows), `vote-polling.svelte.js`
  (15 s poll + deadline refresh), `VoteHeader` `compact` (one slim row).
- Verified (Chrome, 1230 px and 390 px): map renders, 13 distinct photos,
  tap → villa page, −/+ there updates the top-bar counter, back on the map
  shows the new badge, the vote persists after reload, `/villas/nope` → 404,
  `VOTE_LAYOUT = 'list'` shows the cards with the vote bar under each photo,
  no sideways scroll, all targets ≥ 44 px.
- Not done (optional in the request): press-and-hold / swipe-up to vote from
  the map on a phone. A plain link would trigger the phone's link menu on
  long-press, so it needs its own gesture handling (~1 hour). Say if wanted.
- Known limits: on a phone the island is about 360 px wide and the screen
  below the map is empty (the island's shape is wider than tall); a real
  (tile) map or a rotated island would use that space but cost accuracy or
  familiarity. No designed error page yet (a bare "404 …"), planned in 3.2.

### 1.6 follow-ups (2026-10-08, the user's feedback)

- "N left" pill (`components/vote/PointsLeft.svelte`) in the sticky app bar,
  visible while scrolling; hides "of N" under 380 px.
- Account menu closes on any pointer press outside it (window
  `pointerdown`), still on Escape and on the avatar toggle.
- Per-member budget: optional roster `votes` (1–30, validated in
  `parseMembers`, also used by the CLI), carried in `PublicMember.votes`;
  `validateBallot` gets the member's `budget` + `previousSpent` (an
  over-budget ballot is accepted only if it spends less than before, for
  budgets lowered after voting); `tally` uses each member's own budget for
  `left`; header, meter, My votes and People rows show the member's number.
  +5 tests (100 total). Not tried in the browser with a custom number: that
  needs editing the local `members.json` (holds phrases) and a dev restart.
- Gotcha: Svelte 5 trims whitespace at the start/end of an element, so
  `<span> of 6</span>` renders "0of 6"; put spaces outside tags.
- Member photos + prank swap: planned as step 3.4 (needs I11).

### 1.6 — done (2026-10-08)

`src/routes/vote/+page.server.js`: `load` (`depends('app:votes')`) returns
`me`, members (id/name/short only), all ballots, effective deadline, state,
winnerId; `actions.save` parses the JSON ballot, re-validates with server
time, `setBallot`, `fail(409)` when closed/decided, `fail(400)` otherwise.
`src/lib/ballot-client.svelte.js` (`BallotClient`): optimistic `draft`,
600 ms debounce, one request in flight (taps during it are sent next),
revert + error toast on rejection/network error, "Saved" toast, follows a
redirect when the session is gone; built now (plan said 1.7) so 1.7 reuses it.
Components in `src/lib/components/vote/`: `VoteHeader` (sunset hero,
countdown, deadline in PDT/PST via `formatDeadline`, points meter + hint,
closed/decided states), `VillaGrid`, `VillaCard` (scroll-snap photo strip with
arrow buttons on hover devices, rank sticker, facts, price + per night +
"Airbnb price for <saved dates>", highlights, blurb, Airbnb link, voter
avatars with points, Stepper or "You gave N" when closed), `PeopleList`,
`PersonRow`, `NotVotedNudge`, `MyVotes` (sticky meter, empty state), and
`types.js` (JSDoc shapes). Page: `?view=villas|people|mine` (segmented
control on ≥768 px, BottomNav on phones), 15 s polling + on tab focus
(skipped while my save is pending), a timer that refreshes right at the
deadline, card order = ranking but frozen for 5 s after a tap so cards don't
jump. New helpers in `time.js`: `formatDeadline`, `formatDateRange`,
`formatMoney` (+5 tests, 95 total). `BottomNav` now accepts hrefs with a
query (`resolve()` throws on `?view=…`). AppBar logo link raised to 44 px.
Deviations: the tally is computed in the browser with the shared pure
`tally()` (the load returns ballots, not a tally) so my unsaved taps show
instantly and polling stays small; villa facts come from the client-side
config import, not page data. Two justified lint exceptions for same-page
`?view=` navigation (`svelte/no-navigation-without-resolve` only accepts a
direct `resolve()` call, which can't carry a query).
Verified (Chrome, member A on `localhost:5193`): 3+2+1 → 0 left, all `+`
disabled with the hint, saved and survives reload; People/Mine views; crafted
POSTs rejected (4 on one villa, 7 total, unknown villa, bad JSON, 1.5 points);
deadline moved into the past (temporary edit, reverted) → no steppers, "You
gave N", header "Closed …", save → 409; 390 px: no horizontal scroll, all
targets ≥44 px, bottom nav switches views. NOT verified by the agent: the
two-browser cross-visibility check, because signing in as the second member
was blocked by a permission check (credential entry). That's I10.
Gotchas: the Chrome automation window counts as hidden, so `requestAnimationFrame`
never fires there: smooth `scrollBy` doesn't move and large images may not
paint until a scroll. Test with instant scrolling / re-screenshots; real
browsers are fine.

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

### 1.5 addendum — real villas (2026-10-08)

The user gave the Airbnb wishlist "Tenerife, Spain 2027" (13 listings), so the
island is **Tenerife**, not Fuerteventura (the placeholders were a guess from
the old report). Pulled with Claude in Chrome (wishlist cards: name, saved
dates, 9-night price in USD) plus `curl` of each public listing page (its
`data-deferred-state-0` JSON: coords, guest max, og:title rooms/baths/rating,
photo URLs, amenities, description). Kept: names cleaned up, highlights from
the real amenity lists, 1–2 sentence blurbs written from the descriptions
(Duke and "Close to the Beach" have almost no text). 6 photos each via
`npm run villas:photos` (13 MB in `static/villas/`). Typedef gained optional
`dates` and `rating`; tech-spec updated (it still showed `photos: string[]`).
Config test now allows 6–15 villas.
Gotchas: (1) the wishlist shows each listing's **own** saved dates (Feb 13 →
Mar 6 range, differs per villa); the trip dates are unknown, so prices are
estimates. Asking a listing for Feb 13–22 with 10 guests can say "not
available". (2) **6 villas have an 8-guest max** (Evita, Sunset, Red Princess,
Punta del Sol, Rocavista, Coastal Dream); they only fit the group (8 adults +
2 kids) if both kids are under 2: the user confirmed both are under 2 (I9), so all 13 fit.
The Duke and "Close to the Beach" blurbs were rewritten from guest reviews (the user said to use reviews when descriptions are thin). (3) Airbnb locations
are approximate until booking. (4) One listing is labelled only "Santa Cruz de
Tenerife" (the province); its description puts it near Arico / El Porís.
(5) The Chrome tool truncates JS results at ~1 KB; fetching the public pages
with curl from the shell was much faster for bulk data.

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
| 2026-10-08 | Step 1.6 done: vote page (3 views, autosave, polling, closed/decided states); two-browser check left to the user (I10). |
| 2026-10-08 | Login splash: looping sea video (step 3.1 pulled forward after the user's I8 feedback). |
| 2026-10-08 | Planning: raw plan captured, decisions made, tech-spec + design + detailed plan + this tracker written. No code. |
| 2026-10-08 | Step 1.5 done (placeholders): voting rules + tests, villa config, photo script. |
| 2026-10-08 | Step 1.4 done: auth gate, login splash, logout, old report deleted; dev store -> memory. |
| 2026-10-08 | Step 1.3 done: roster/phrase/session modules, members CLI, 31 tests. |
| 2026-10-08 | Step 1.2 done: design tokens, icons, 15 ui components, /styleguide. |
| 2026-10-08 | Step 1.1 done: SSR + Upstash Redis store + vitest. |
| 2026-10-08 | The user upgraded the Vercel CLI to 63.1.0 and linked the repo to the existing project `ipogodins-projects/eurotrip` (`.vercel/` and `.env.local` are gitignored). |
