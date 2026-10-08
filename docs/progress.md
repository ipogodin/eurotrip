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

**Step:** 1.1 — Runtime, storage, test harness
**State:** not started (planning finished 2026-10-08)
**Next action:** the user upgrades the Vercel CLI and runs `vercel link`; then the agent provisions Upstash.

## Step board

| Step | Title                                   | Status | Started | Done | Commit |
| ---- | --------------------------------------- | ------ | ------- | ---- | ------ |
| 1.1  | Runtime, storage, test harness          | todo   |         |      |        |
| 1.2  | Design system + app shell               | todo   |         |      |        |
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
| I1 | 1.1       | Upgrade the Vercel CLI (`npm i -g vercel@latest`) and run `vercel link` (interactive) | waiting |
| I2 | 1.1       | OK to add the Upstash Redis integration to the Vercel account (free tier)              | waiting |
| I3 | 1.5       | 6–10 villa listing URLs (+ any notes per villa)                                         | waiting |
| I4 | 1.9       | The 8 members: full name + short name (Illia Pogodin = admin)                          | waiting |
| I5 | 1.2       | Sign-off on the style-guide screenshots (non-blocking)                                 | later   |
| I6 | 2.x       | Booked dates, address, check-in/out times, preferred arrival airport(s)                | later   |
| I7 | 3.1       | The Canary video clip (optional; a photo is used until then)                           | later   |

## Step notes

_(WIP and final notes per step go here, newest first.)_

## Session log

| Date       | Summary                                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| 2026-10-08 | Planning: raw plan captured, decisions made, tech-spec + design + detailed plan + this tracker written. No code. |
