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
| 1.9  | Ship R1                                 | done (live) | 2026-10-08 | 2026-10-08 | see below |
| 2.1  | Phase switch + trip state               | todo   |         |      |        |
| 2.2  | Trip overview tab                       | todo   |         |      |        |
| 2.3  | Nearby tab                              | todo   |         |      |        |
| 2.4  | Flights tab                             | todo   |         |      |        |
| 2.5  | Ship R2                                 | todo   |         |      |        |
| 3.1  | Canary video background                 | done (early) | 2026-10-08 | 2026-10-08 | 4366b5b |
| 3.2  | Quality pass                            | todo   |         |      |        |
| 3.3  | SvelteKit 3 upgrade                     | todo   |         |      |        |
| 3.4  | Member photos + "neh" photo swap        | done (live upload pending) | 2026-10-08 | 2026-10-08 | see below |

## Blockers / inputs from the user

| #  | Needed by | Input                                                                                   | Status  |
| -- | --------- | --------------------------------------------------------------------------------------- | ------- |
| I1 | 1.1       | Upgrade the Vercel CLI (`npm i -g vercel@latest`) and run `vercel link` (interactive) | done 2026-10-08: CLI 63.1.0, linked `ipogodins-projects/eurotrip` |
| I2 | 1.1       | Accept Upstash marketplace terms | done 2026-10-08 |
| I3 | 1.5       | 6–10 villa listing URLs (+ any notes per villa)                                         | done 2026-10-08: 13 Tenerife villas from the Airbnb wishlist |
| I4 | 1.9       | The 8 members: full name + short name (Illia Pogodin = admin)                          | waiting |
| I16 | 1.9      | Add a `"preferred"` name per member in `members.json` | done 2026-10-08: 8 of 8 filled in (no duplicates, none over the limit); verified through a fresh dev server |
| I15 | 1.9      | Go-ahead to run `npm run avatars:upload` against the live Redis (writes only avatar keys; 158 KB) | waiting |
| I11 | 3.4      | Member photos (one each), the prank pool photos + exact caption, and the swap rules (see plan 3.4). Photos delivered 2026-10-08 as `avatars/<id>_1` (default), `<id>_2` ... (versions); `npm run avatars:check`: 8 of 8 fine; faces checked in circle crops. Phrases file done. Admin can reset someone to version 1: yes (decided). Remaining: build 3.4 | mostly done |
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

### Comments + exact/approximate locations (2026-10-09, BRANCH `feature/comments-and-location-flags`, NOT yet on production)

Waiting for the user's OK to merge to `main` (a merge deploys to production at once).
**Exact vs approximate locations (option C):** each villa has `exactLocation` (Airbnb's
own `isExactLocation` flag: Sunset, Silvia, Evita, Beach, Rocavista exact; H20, Duke,
Bonita Salvaje approximate). Map: solid dot = exact, dashed ring = approximate area, a
line out to the photo, a short legend; photos now keep clear of EVERY real spot
(`keepClear` in `spreadPins`) so the dots aren't hidden under photos; the villa page
and winner card say "Exact location" / "Approximate area" (+ "the host hides the exact
spot until you book"). Real addresses only come after booking.
**Public comments** (user's answers: no editing; after a winner is picked only the
winner's comments exist, the others "not visible at all"; no reactions for now):
- Villa page: comments list (photo, name or "You", "x min ago"), a text box (500
  chars, plain text, Ctrl/Cmd+Enter posts), a delete button on your own comments (the
  admin sees it on all), a confirm sheet. Chat-bubble count on each villa's photo on
  the map and in the winner card. Names are the public short name, never the private
  preferred name.
- Rules in `server/comments.js`: visible only for active villas and, once a winner is
  picked, only for the winner (the others are not listed, not counted, not sent in the
  page data, and can't be posted to; they come back if the winner is undone); 1-500
  characters, control characters stripped, 10 posts per person per hour, 200 per villa.
  Redis: a hash `comments:<villaId>` (comment id -> JSON).
- Tests (+36): rules, both stores, and for EVERY member through the real handlers:
  post, see others', delete only their own (admin any), no preferred-name leak, and
  the group scenario for the winner-only rule. Proven by breaking it on purpose (the
  winner rule: 6 tests failed; the delete rule: 8 failed).
- Verified in Chrome: post (line break + emoji kept), a comment trying to run HTML/JS
  shows as plain text and nothing runs, delete with confirm, the map badge, and after
  picking a test winner the other villa's page data contains NO trace of its comment
  while the winner's stays; 360 px: no overflow even with a 270-character single word.
- NOT done: editing, reactions, "new comment" indicators, notifications.

### Production changes since launch (2026-10-09)

- The user changed Tetiana's phrase in `members.json`; pushed with `members:push` and
  redeployed from `main` (not the feature branch, so only the roster changed). Live
  checks fine. `members.md` (the ignored mirror) was synced afterwards, since it
  is what the earlier phrase restore used.
- **A push to `main` deploys to production** (the project is connected to GitHub);
  AGENTS.md now says so and new features go on branches.

### 1.9 — SHIPPED (2026-10-08): live at https://2027eurotrip.vercel.app

Done, in order: default deadline set to **Sat 2026-10-10 10:00 am Pacific (PDT,
17:00Z)** (the user wrote "10 am PST"; in October Pacific time is PDT, so 10:00
local; change it in /admin if strict PST was meant); `SESSION_SECRET` (random, never
printed) and `MEMBERS` (the roster) set on Vercel as hidden secrets for
Production + Preview; the 16 photos uploaded to the live Redis (checked read-back:
16 images, 0 votes, no deadline override, no winner); `vercel --prod`. Live checks
without a real phrase: login page 200; /vote, /admin, /villas/*, /avatars/*,
/styleguide all 303 to the invite screen for anonymous visitors; security headers
(HSTS, nosniff, DENY framing, no-store); public files load; ONE wrong phrase gets
the generic "That phrase didn't work" after the built-in delay (so the roster loaded
from the secret); a cross-site POST gets 403; no error logs. Not tested live: a real
phrase login (the agent can't type phrases): the user does that on their phone.
- The deployment-specific `*.vercel.app` addresses sit behind Vercel's own login
  (Vercel Authentication); the public project address does not, so members use
  `https://2027eurotrip.vercel.app`.
- **Incident:** to "generate the invites" the agent ran `members:gen --all`, which
  overwrote the phrases the user had chosen by hand for each person (the user
  hadn't said to replace them). Noticed because the user said so mid-deploy;
  restored from the git-ignored `members.md` table (full name -> phrase), roster
  check OK, `MEMBERS` re-pushed and redeployed within minutes. The generated
  phrases that had been shown in chat were live for ~20 min and are void. Fixes:
  `members:gen` now keeps `members.json.bak`, AGENTS.md says never to regenerate
  phrases without asking.
- Still the user's: send each person their phrase; confirm `members.json` has the
  phrases they intended (the restore used `members.md`, which could be older than
  their latest edit); log in on a phone and try voting.

### Villa list cut to the south-west + zoomed map (2026-10-08, the user's request)

The user removed 5 villas (Airbnb rooms 49901573, 1443528584945991888,
735931048615921810, 22045753, 674271392481837871 = San Miguel de Abona, Golf del
Sur, Arico, Güímar, La Matanza) so only the south-west remains, and asked to
magnify the island a little to show the area closer.
- **Removed from `src/lib/config/villas.js` and their photo folders deleted
  from `static/villas/`** (13 MB -> 6.6 MB), not hidden with the admin "Remove"
  feature: it's before launch and nobody has voted. 8 villas remain: 6 in Costa
  Adeje/Adeje, 1 in Arona and 1 in Callao Salvaje (see the config). Git history still holds the old photos.
- **Zoom:** `VIEWPORT` in `config/tenerife.js` is the window the map shows
  (x 20, y 282, w 680, h 598 of the 1000 x 880 drawing = about 1.5x, the south-west
  from Los Gigantes to Teide and down to Los Cristianos). The SVG `viewBox`, pin
  positions (percent of the window), pin spacing (`PIN_UNITS` = 12.5% of the window
  width) and the stage's aspect ratio all follow it, so changing the zoom is one
  line. `spreadPins` now takes `bounds` instead of width/height. A first try at
  1.67x cut the island into a corner and no longer read as Tenerife; 1.47x keeps it
  recognizable. Labels moved (Los Gigantes inward, Los Cristianos below the photos).
- Tests: spreading/bounds updated, plus 3 guards: the window keeps the drawing's
  proportions, stays inside the drawing, and contains every villa with room for its
  photo (so a villa added later can't fall off the edge of the map).
- Verified in Chrome: desktop and 390 px (8 photos of 44 px, all inside the map,
  none overlapping, no overflow) and the winner-only view on the zoomed map (picked
  a test winner, then undid it).

### Winner-only main page (2026-10-08, the user's request)

Once the admin picks a winner, the main page is about that villa only, and a later
redeploy will add more about the location (surf spots etc.; phase 2). Built:
- `/vote` in the decided state: the banner "We're staying at <villa>", the map
  with ONLY the winner (`VillaMap` `featured`: bigger photo at its own spot, name
  label above it, no leader lines), and a `WinnerCard` (facts, highlights, blurb,
  "See the photos and details"). No People / My votes tabs, no bottom nav, no
  points counter or reset button; a leftover `?view=people` is ignored.
- The winner's villa page: all photos and details, "Winner" sticker, Airbnb link,
  but no voting controls.
- Every other villa's page says "<villa> wasn't chosen" with a link to the winner.
- Undo winner restores normal voting (verified: 13 pins, tabs, bottom nav).
- Verified in Chrome (picked a winner as the admin, then undid it): desktop and 390 px
  (no overflow, 81 px photo, no small targets). The label was clipped at the bottom
  of the map on phones, moved above the photo.
- The votes are still stored and the admin page still shows the full results.
- Phase 2 (after the winner is picked): redeploy with the trip hub: more about the
  location, surf spots and beaches nearby, flights (plan section 6, steps 2.1-2.5).
  The data and the inputs it needs from the user are listed there.

### Preferred names filled in (2026-10-08)

The user filled in all 8. `members:check` OK, no warnings; checked without
printing them: 8 of 8, no duplicates, longest 8 characters, no emoji/odd
characters, none matches another member's name; one equals its own short name
(no visible difference). Verified through the app: the signed-in member sees
their own preferred name in the menu, the People row and the profile line, other
members stay full names, and the data sent to the browser holds 1 copy of the
`preferred` key. **Gotcha:** two dev servers were listening on port 5193 (an
older one started with `--host 127.0.0.1`, which `pkill -f "vite dev --port
5193"` does not match), and the old one kept serving a stale roster. The dev
server reads `members.json` once at start, so after editing it, kill by port
(`lsof -nP -t -iTCP:5193 -sTCP:LISTEN`) and check one process is left.

### Preferred name (2026-10-08, the user's request)

New optional roster field `preferred`: how the app calls a person when it
talks to them. Rules from the user: only the signed-in person ever sees it;
other members (and the admin) can't see anyone else's; the profile still shows
full name (+ nickname); everywhere else the app uses the preferred name for the
viewer. Built: roster parsing (trimmed, 1-30 chars, one line, unicode ok;
falls back to `short`; warns how many members lack one), two shapes
(`PublicMember` for everyone, never has it; `SelfMember` for `locals.member`
only; `toSelf`), viewer-side helpers `withCallName`/`nameFor` (the viewer's own
entry gets `callName`; nobody else's), used in: account menu ("Hi, {preferred}!"
above the full name), the greeting in the list layout, the viewer's own People
row, the "Still deciding" line, voter-list titles and the admin page's own
entries; the profile sheet shows "The app calls you …" to the person only.
Tests (+15): parsing/validation, shapes, helpers, and for EVERY member that
nothing they receive (layout, vote, all 13 villa pages, admin) contains anyone
else's preferred name; proven by making the member list leak it (8 tests
failed) and restoring. Verified in Chrome on a throwaway second dev server with
test values: the person sees their own preferred name in all those places and
exactly 1 copy of it in the data sent to the browser; another member's test
value appeared 0 times, including on the admin page.
**Blank `"preferred": ""` fields were added to all 8 members in `members.json` for the user to fill in (a blank = not filled in = the short name is used; `members:check` warns until they are).** Earlier the file had no `preferred` values (`members:check`
now warns: 8 members have none), so everyone is currently called by their short
name. The user adds them (names are theirs to choose).

### 3.4 — done early (2026-10-08): photo avatars, "Change photo", profiles

Triggered by the user: "no avatars on the local page", so they couldn't verify
visually. The page only had coloured initials; this step built the photos.
- **Where photos come from.** Live: pre-made 256 px WebPs in Redis (private;
  keys `avatar:img:<id>:<n>`; hashes `avatars:version` = the photo each member
  shows, `avatars:count` = how many exist), served only to signed-in members by
  `GET /avatars/<id>/<version>`. Local `npm run dev`: read straight from the
  git-ignored `avatars/` folder (so the real photos show with no upload); that
  code is `import.meta.env.DEV`-guarded and verified absent from the production
  build (no `sharp`, no folder access). All 16 photos = 158 KB.
- **No spoilers:** the image route serves a member's photo only up to the
  version they're on now, so nobody can guess the prank photo's URL
  (`/avatars/<id>/2` is 404 until they get it).
- **Avatar** shows the photo over the coloured initials (initials remain if an
  image fails or a member has none). Member data (`PublicMember.photo`) carries
  each member's current version via `publicMembers()` and the root layout load
  (re-runs with the 15 s vote refresh), so a photo change reaches everyone's
  screen within ~15 s.
- **Change photo** (account menu): choose a photo, fake "Uploading…" (~2.2 s,
  progress bar, preview of the chosen picture), then reveal of the NEXT PREPARED
  version with a random phrase from `avatar-phrases.txt`. The chosen picture
  never leaves the device: the request (`POST /avatars/swap`, a form post so
  SvelteKit's cross-site check applies, 415 otherwise) carries only
  `action=update`; verified by intercepting the request in Chrome. Each press
  moves up one version; on the last one the member stays.
- **Admin:** a "Profile photos" card (photo n of N per member) with "Back to own
  photo" (version 1; votes untouched). Action `resetPhoto` behind `requireAdmin`.
- **Profiles:** in People, clicking/tapping a member's picture opens a sheet with
  their photo enlarged (200 px from a 256 px source), their name, nickname if it
  differs, and what they voted for; a computer also shows a hover/keyboard-focus
  preview. 44 px tap targets.
- **`npm run avatars:upload`** (`-- --dry-run` to only report) processes the
  photos and writes them to the Redis in `.env.local`; it never touches which
  version anyone is on. NOT RUN against the live database yet: needs the user's
  go-ahead (part of launch).
- Tests (+25): store (memory + fake Redis), `photoVersions`/`swapPhoto`/
  `resetPhoto`, the image route (members only, no spoilers, 404s), the swap
  route (401/415/400, only the presser changes, others see it), admin reset
  (403 for non-admins). Verified in Chrome as a non-admin test member: photos
  for all 8 in People and the app bar, full Change-photo flow, profile sheet,
  hover preview. The test swap moved that dev member to photo 2 (in-memory dev
  store; resets on restart).
- Not done: notifying others of a changed photo (later feature); the admin photo
  reset was verified by tests, not in the browser (the browser was signed in as
  a non-admin).

### Pre-launch verification for all 8 members (2026-10-08)

The user: verify the site for every member, THEN generate the invites.
- **Found and fixed:** avatar colours came from a hash of the id, so the 8 real
  members shared only 4 colours (3 people on one colour, two pairs). Colours now
  follow roster position (`hueForIndex`, `PublicMember.hue`, carried by
  `toPublic`, `publicMembers`, the admin load): 8 members = 8 colours, and the
  People view shows 8 different ones. 3 tests.
- **Per-member scenario test** (`src/lib/server/scenario.test.js`, 63 tests):
  runs the real vote/admin handlers once per member on the real roster's
  public fields (phrases are NOT read; placeholders used; without
  `members.json` it uses 8 made-up members). Each member: sees the vote page
  and no phrase in the data, opens all 13 villa pages, spends exactly their
  budget and not a point more, is refused bad ballots (4 on one villa, unknown
  villa, fractions, junk), can only change their own ballot, can take all points
  back; the 7 non-admins get 403 on the admin page and on all 7 admin actions
  with no state changed (this closes I14); the admin can use them. Group
  scenarios: totals across all 8 ballots, removing a villa returns exactly each
  voter's points, reset clears all 8, close/winner freezes everyone. Proven
  not vacuous by deliberately breaking the admin lock (7 tests failed), the
  budget rule (8) and the points return (1), then restoring.
- **Privacy scan** of every tracked file and all git history for the members'
  surnames, full names and nicknames: nothing for the other 7 members (the
  owner's own name is everywhere, expected). Only first names (as ids) in my own
  note in `docs/progress.md`, committed in `8d94bed`; removed from the current
  file; still in that commit's history (decision for the user: leave it, or
  rewrite history; first names only, no surnames or phrases).
- Browser smoke test as the admin on the restarted dev server (new roster):
  map 13 pins, People 8 members/8 colours, My votes, a villa page, admin page
  with the 7 other members listed as not voted; no console errors.
- Not verifiable before deploy: real phrase login and the signed session,
  production-only behaviour (secure cookie, CSRF origin check, Redis), a
  second person voting live. Those are the 1.9 smoke test.

### Photos re-verified, faces checked, phrases + versions (2026-10-08)

The user replaced `illia_1` and `marina_1` and asked to re-verify and to check
face placement. The checker found `illia_1` twice (the old 149x177 .jpg left
beside the new 344x454 .png); the old one was moved (not deleted) to the
scratchpad. Result: 16 photos, 8 of 8 members fine, no identical pairs.
Faces: rendered all 16 as the app will show them (centered square crop, circle)
and looked at them: every face is fully inside its circle, none cut; notes:
`alex_1` is tilted sideways (EXIF rotation applied; the user should say if
it's wrong), `illia_1` fills the circle and clips the very top of the head.
So the plain center crop is enough; no per-photo focus setting needed.
Built (tested, 11 tests): `src/lib/config/avatar-phrases.txt` (12 phrases to
edit; random, never the same twice in a row), `src/lib/avatar.js`
(`parsePhrases`, `pickPhrase`, `currentVersion`, `nextVersion`). Checker now
accepts any number of versions (`_3` ...), flags gaps and identical pictures.
Decision: the avatar a member shows is just a version number; each "update"
moves them up one and they stay on the last (easy to change). The upload,
private storage and the swap UI are still step 3.4; custom notifications to
others are a later, separate feature.

### Avatar photos delivered (2026-10-08)

The user changed several member ids in `members.json` (8 members; the ids
are kept out of the public repo) and named the photos `<id>_1` (own, default)
and `<id>_2` (prank replacement), 16 files in `avatars/`. Checker rewritten
for that convention (per-member lines, stray files, unreadable/oversized,
identical pair) with realistic sizes: error under 256 px, note under 512 px.
Result: all names match, all readable, no identical pairs; `illia_1.jpg`
(149x177, 8 KB) and `marina_1.png` (196x218) are too small and should be
replaced with bigger photos; 4 more are 412-506 px (fine). Face placement was
NOT checked (they're center-cropped to a circle). Note: ids changed, so any
dev ballots keyed by old ids no longer match (dev store is in-memory); the
production roster is set at launch anyway.

### Roster loaded + avatar folder (2026-10-08)

The user filled `members.json` with all 8 members (`npm run members:check`
OK, 1 admin; no custom `votes` yet) and asked where to upload avatar images and
how to name them. Answer: a private, git-ignored `avatars/` folder
(`avatars/<member-id>.<jpg|jpeg|png|webp>`; prank photos in `avatars/pool/`
as `<n>.<ext>` or `<member-id>.<ext>`), tracked README only, and a checker
(`npm run avatars:check`: missing/duplicate/unknown names, < 512 px, very
wide/tall, unreadable files, > 10 MB; tested with dummy files). Photos are not
used by the app yet: the upload to private Blob + the `Avatar` photo support is
step 3.4. `members.md` (untracked, ignored, never committed) exists in the
repo root; the agent did not read it.

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
