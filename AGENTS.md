# Eurotrip — Agent Briefing

Repo: **https://github.com/ipogodin/eurotrip**
Live site: **https://eurotrip.vercel.app** (to be confirmed after first deploy)

Read `docs/history.md` before doing anything else in this project — it has the
full origin story and every decision made so far, in chronological order, so a
fresh agent does not need the user to re-explain context.

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
| Framework | SvelteKit 2 + Svelte 5 (runes) |
| Adapter | `@sveltejs/adapter-vercel` |
| Styling | Scoped `<style>` per component + shared tokens/utility classes in `src/app.css`, no CSS framework |
| Deploy | Vercel — `vercel --prod` from project root |
| Dev | `npm run dev` → localhost:5173 (port may vary) |

This mirrors `~/dev/wenachee`'s `package.json`, `vite.config.js`,
`jsconfig.json`, `.gitignore` and `vercel.json` almost verbatim — see that
project if a config question comes up that isn't answered here.

---

## Project structure

```
src/
  routes/
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
      islands.js           # All 8 islands' scoring data, text, map-side-panel content
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

Svelte 5 runes only: `$state`, `$derived`, `$effect`, `$props`. No
`export let`, no `on:click=` (use `onclick=`). Follow the same conventions as
`~/dev/wenachee` (see that project's AGENTS.md for the fuller rationale if
needed).

---

## Deploy

```bash
vercel --prod      # deploy from local
git push           # once GitHub → Vercel auto-deploy is connected in the dashboard
```

See `docs/history.md` for the Vercel project name/ID once the first deploy has
happened, and update this section then.

---

## What's next

This is intentionally a fresh scaffold with ONLY the ported Canary Islands
report. The user said they'll add more functionality/features later, the same
way `~/dev/wenachee` grew (games, weather API, live schedule, etc.) — so when
new requests come in, follow the existing pattern: add data to
`src/lib/config/`, add a component to `src/lib/components/`, wire it into
`+page.svelte`. Always append new context to `docs/history.md` as work
happens, don't just overwrite it.
