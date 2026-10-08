# Technical spec — villa voting + trip hub

Reference for `docs/implementation-plan.md`. Shapes and rules here are the
contract. If implementation deviates, update this file in the same commit.

## Runtime

- SvelteKit 2 + `adapter-vercel`, **SSR** (no global prerender). Node 24 on
  Vercel Fluid Compute.
- All mutations are SvelteKit **form actions** (built-in Origin/CSRF check),
  progressively enhanced with `use:enhance`. No public JSON write endpoints.
- `src/lib/server/**` holds everything secret-adjacent; Kit refuses to
  import it into client bundles.

## Routes

| Route             | Access     | Purpose                                                                         |
| ----------------- | ---------- | ------------------------------------------------------------------------------- |
| `/`               | anyone     | Anonymous: login splash. Signed in: redirect → `/vote` (phase 1) / `/trip` (2) |
| `/vote`           | member     | `?view=villas\|people\|mine` · `?layout=list\|map`. Read-only once closed       |
| `/villas/[id]`    | member     | Villa detail: gallery, facts, link, voters, stepper (while open)               |
| `/trip`           | member     | Phase 2 overview (redirects to `/vote` while no winner)                         |
| `/trip/nearby`    | member     | Beaches / attractions / cafés + map                                             |
| `/trip/flights`   | member     | LON / WAW / FRA ↔ island                                                        |
| `/admin`          | admin      | Deadline, winner, dates, notes, stats                                           |
| `/_styleguide`    | dev only   | Component gallery (404 in production)                                           |

Anonymous request to any member route → `303 /?next=<path>` (only same-site
relative paths accepted for `next`).

## Members & admin

Env var `MEMBERS` (JSON array), parsed once at server start:

```json
[
  { "id": "illia", "name": "Illia Pogodin", "short": "Illia", "phrase": "copper-heron", "admin": true },
  { "id": "anna",  "name": "Anna …",        "short": "Anna",  "phrase": "…" }
]
```

- Validation at startup (throws → deploy fails loudly): 8 entries expected
  (warn otherwise), unique `id`, unique normalized `phrase`, ≥1 `admin`.
- Names are kept out of the public repo too (they're in the env var).
  `src/lib/server/members.example.json` documents the shape with fake data.
- `locals.member = { id, name, short, isAdmin }` — the phrase never leaves
  the server and never reaches page data.
- Admin checks happen in **every** admin `load` and action, not just in the UI.
- Phrases are stored **plain text** in the env var (decided 2026-10-08: the
  env var is the trust boundary; hashing ~26-bit phrases adds little).

### Editing the roster (admin, manual, pre-deploy)

Decided 2026-10-08: phrases/names/admin flag are changed **manually before a
deploy**, not through the web UI (keeps phrases out of Redis and out of reach
of a stolen admin session).

- Source of truth on the admin's machine: **`members.json`** at repo root —
  **gitignored** (add to `.gitignore` in step 1.3). Same JSON shape as above.
- Loader order: `MEMBERS` env var if set; otherwise, **in dev only**,
  `members.json`. Production without `MEMBERS` → startup error.
- Scripts (`scripts/members.js`):
  - `npm run members:check` — validate the file (same rules as startup).
  - `npm run members:gen -- <id>` — set a fresh EFF `word-word` phrase for
    one member (or all members with `--all`) and print it once.
  - `npm run members:push` — validate, then replace `MEMBERS` on Vercel for
    production + preview via the `vercel env` CLI (remove + add). Never
    prints phrases.
- Env changes apply only to **new deployments** → run `vercel --prod` after
  pushing. Dashboard editing of `MEMBERS` + redeploy is the no-script
  fallback.
- Effects: changed phrase → old phrase fails immediately after redeploy,
  existing sessions stay valid; removed member → their session dies (loader
  no longer knows the id); rotate `SESSION_SECRET` → everyone logged out.

## Sessions

- Cookie `et_session` = `base64url(JSON{ m, iat, exp })` + `.` +
  `base64url(HMAC-SHA256(SESSION_SECRET, payload))`.
- `httpOnly`, `secure` (except dev), `sameSite: 'lax'`, `path: '/'`,
  `maxAge` 60 days. Verified with `timingSafeEqual`; unknown member id →
  treated as anonymous (so removing someone from `MEMBERS` revokes them).
- Rotating `SESSION_SECRET` logs everyone out.

## Anti-brute-force (login)

The user asked for a JavaScript approach that stops code guessing. **Client
JS alone cannot do this**: an attacker skips the page and POSTs directly. So
protection is layered, with authority on the server:

1. **Entropy.** Phrases are `word-word` drawn from the EFF long word list
   (7,776 words) → 60.4 M combinations each; with 8 valid phrases, a random
   guess hits ~1 in 7.5 M.
2. **Server rate limits (Redis, authoritative):**
   - per IP: 5 failures / 15 min → locked until the window expires, and the
     lock doubles each repeat (15 → 30 → 60 min…, capped at 24 h);
   - per IP per day: 20 failures;
   - global: 60 failures / hour → all *new* logins pause for 15 min
     (existing sessions are unaffected; 8 people rarely log in at once).
   - At the global cap an attacker gets ≤ 1,440 guesses/day → expected
     time to hit any phrase ≈ 14 years.
3. **Constant-ish timing.** Every login POST takes ≥ 600 ms (sleep up to
   that floor) and compares against all phrases without early exit, so
   timing reveals nothing.
4. **No oracle.** One generic message for wrong phrase, locked out, and
   paused; the response includes `retryAfter` seconds only when locked.
5. **Honeypot field** (`website`, visually hidden, `tabindex=-1`): if filled,
   count as a failure and respond like a wrong phrase.
6. **Client UX (the "JavaScript approach", convenience only):** disables
   submit while pending; shows a live cooldown from `retryAfter`;
   normalizes input (trim, lowercase, spaces/underscores → `-`); hints the
   `word-word` format. Lockouts feel intentional, not broken.
7. **Visibility:** `/admin` shows failed attempts (24 h) and current
   global-pause state.
8. **Optional hardening (if attacked):** Vercel Firewall rate-limit rule on
   `POST /`, or Vercel BotID. Not built by default.

Client IP: `event.getClientAddress()` (adapter-vercel uses the platform
header).

## Storage (Upstash Redis)

`src/lib/server/store.js` exports one interface, with two implementations:
Upstash (when the integration env vars exist) and in-memory (local dev
without Redis + unit tests). Exact env var names are confirmed in step 1.1
and recorded here.

```
getBallots(): Promise<Record<memberId, Ballot>>      // Ballot = Record<villaId, 1|2|3>
setBallot(memberId, ballot): Promise<void>            // replaces whole ballot (MULTI DEL+HSET)
getVoting(): Promise<{ deadline: string|null }>       // admin override, ISO UTC
setVoting({ deadline }): Promise<void>
getTrip(): Promise<TripState>
setTrip(partial: Partial<TripState>): Promise<void>
hit(key, ttlSec): Promise<number>                     // INCR + EXPIRE NX
get/del helpers for lock keys
```

Keys:

| Key                   | Type   | Content                                                     |
| --------------------- | ------ | ----------------------------------------------------------- |
| `ballot:{memberId}`   | hash   | `villaId → points`                                          |
| `voting`              | hash   | `deadline` (ISO UTC override)                               |
| `trip`                | hash   | `winnerId`, `pickedAt`, `dateStart`, `dateEnd`, `checkIn`, `checkOut`, `notes`, `updatedAt` |
| `rl:ip:{ip}`          | string | fail count, TTL 15 min                                      |
| `rl:lock:{ip}`        | string | lock level, TTL = lock duration                             |
| `rl:day:{ip}`         | string | fail count, TTL 24 h                                        |
| `rl:global`           | string | fail count, TTL 1 h                                         |
| `stats:fails`         | string | fail count, TTL 24 h                                        |

Villa facts are **not** in Redis; they're in config.

## Voting rules

Constants in `src/lib/config/voting.js`:

```js
export const DEFAULT_DEADLINE = '2026-10-10T16:30:00Z'; // Sat 09:30 PDT
export const VOTE_BUDGET = 6;
export const MAX_PER_VILLA = 3;
```

- `effectiveDeadline = voting.deadline ?? DEFAULT_DEADLINE`.
- `votingState(now, deadline, winnerId)` → `'open' | 'closed' | 'decided'`.
- Admin actions: **extend** (set deadline to a future time), **close now**
  (deadline = now), **reopen** (future deadline; only when no winner),
  **pick winner** (sets `trip.winnerId`, also closes voting), **undo
  winner** (back to `closed`).
- `validateBallot(ballot, { villaIds, state })`: state must be `open`; keys
  ⊆ known villa ids; values integers 1–3 (0 → drop the key); sum ≤ 6.
  The server is the only authority. UI limits are a convenience.
- `tally(ballots, villas, members)` →
  - `byVilla`: `{ villaId, total, rank, voters: [{ memberId, points }] }`,
    sorted total desc, then name; equal totals share a rank;
  - `byPerson`: `{ memberId, spent, left, picks: [{ villaId, points }] }`;
  - `notVotedYet: memberId[]` (shown as a gentle nudge, not shaming).

## Config data shapes

`src/lib/config/villas.js`:

```js
/**
 * @typedef {{
 *   id: string; name: string; town: string; island: string;
 *   coords: [number, number];            // lat, lng
 *   url: string; source: 'airbnb'|'booking'|'vrbo'|'other';
 *   price: { total: number; currency: 'EUR'|'USD'|'GBP'; nights: number };
 *   bedrooms: number; bathrooms: number; sleeps: number;
 *   photos: string[];                    // '/villas/{id}/1.webp' …, first = cover
 *   highlights: string[];                // 3–5 short chips: "Pool", "5 min to Flag Beach"
 *   blurb: string;                       // 1–2 sentences
 * }} Villa
 */
```

`src/lib/config/trip.js` (filled in R2, keyed by villa id, only the winner
needs data):

```js
/**
 * @typedef {{ name: string; kind: 'beach'|'attraction'|'cafe';
 *   coords: [number, number]; walkMin?: number; driveMin?: number; note?: string }} Place
 * @typedef {{ origin: 'LON'|'WAW'|'FRA'; direction: 'outbound'|'return';
 *   airline: string; from: string; to: string;      // IATA codes
 *   departs?: string; arrives?: string; duration: string; stops: number;
 *   typicalPrice?: string; bookUrl: string; note?: string }} FlightOption
 * @typedef {{ address?: string; defaultDates?: { start: string; end: string };
 *   amenities: string[]; places: Place[]; flights: FlightOption[] }} TripDetail
 */
```

Walk and drive minutes are precomputed by the agent (routing service or Maps
lookups at authoring time) and stored. Nothing calls an API at runtime.

## Client behaviour

- **Autosave:** each stepper tap updates local state immediately and
  schedules a submit of the whole ballot (600 ms debounce). On server
  rejection, revert to the server ballot and show the error toast.
- **Polling:** `$effect` with `setInterval(15 s)` + `visibilitychange`,
  calling `invalidate('app:votes')`. Skipped while a save is pending.
- **Map:** Leaflet 1.9.x, imported dynamically inside `$effect` (browser
  only). Tiles: CARTO Voyager raster + attribution. Custom `divIcon` pins.
- **Time:** all timestamps are UTC ISO. Display uses `Intl.DateTimeFormat`
  in the viewer's zone, plus the fixed PDT label for the deadline.

## Testing

- Vitest: roster validation, phrase normalization, session sign/verify
  (tamper, expiry, unknown member), rate-limit escalation (in-memory store +
  fake clock), `validateBallot`, `tally`, `votingState`.
- Manual Chrome smoke tests per release (steps 1.9, 2.5), at 390 px and
  desktop widths.
