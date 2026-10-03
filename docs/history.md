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
