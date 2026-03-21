# Physics Simulations — Agent Context

## Project Overview
A unified GitHub Pages site hosting interactive physics simulations, designed to be both a personal portfolio piece and an educational resource. Lives at `https://rechraum.github.io/physics-sims/` (repo: `https://github.com/rechraum/physics-sims`). Will be linked from the owner's main personal site.

**Two guiding goals:**
1. Clean, browsable gallery experience
2. Educational — teach the physics behind each simulation

**Constraint:** No build step. Pure static HTML/CSS/JS only. Must work on GitHub Pages without Jekyll or a bundler.

---

## Repo Structure

```
/index.html                  ← Gallery portal (data-driven card grid)
/404.html                    ← GitHub Pages custom 404
/.nojekyll                   ← Prevents Jekyll processing
/shared/
  style.css                  ← Design tokens + layout primitives (dark theme)
  nav.js                     ← Self-injecting nav bar + About panel (included in every sim)
/<sim-slug>/
  index.html                 ← Standalone simulation page
  sketch.js                  ← Simulation logic (usually p5.js)
  style.css                  ← Sim-specific styles
  meta.json                  ← Structured metadata (see schema below)
```

Sims are currently at the **root level** (not under a `/sims/` subfolder). A future reorganization into `/sims/<slug>/` was discussed but not yet done — do not move them without updating all relative paths in `nav.js`, `index.html` fetch calls, and the gallery's `SIM_SLUGS` array.

---

## Simulations Inventory

| Slug | Title | Library | Difficulty |
|------|-------|---------|------------|
| `diffusion-levy-flights` | Lévy Flights & Brownian Motion | p5.js 1.4.0 | intermediate |
| `double-pendulum-array` | Double Pendulum Chaos | p5.js 1.6.0 | intermediate |
| `dripping-faucet` | Dripping Faucet & the Logistic Map | Canvas API (no p5) | beginner |
| `energy-landscape` | Energy Landscape Explorer | p5.js 1.6.0 | intermediate |
| `gravity-well` | Gravity Well & Orbital Phase Space | p5.js 1.6.0 | intermediate |
| `kicked-pendulum` | Kicked Pendulum | p5.js 1.6.0 | intermediate |
| `lorenz-attractor` | Lorenz Attractor | p5.js 1.6.0 (WEBGL) | advanced |
| `oscillator-phase-space` | Harmonic Oscillator Phase Space | p5.js 1.6.0 | beginner |
| `relational-network` | Relational Network Dynamics | p5.js 1.6.0 | intermediate |
| `three-body` | Three-Body Problem | p5.js 1.6.0 | advanced |
| `tunable-mass-damper` | Tuned Mass Damper | p5.js 1.4.2 | intermediate |

**Archived (not in gallery):** `_archive/phase-space-wrapper` — original multi-sim wrapper, now fully split into individual sims above. `_archive/orbital-phase-space` — duplicate of `gravity-well`, retired.

---

## meta.json Schema

Every sim folder has a `meta.json` with this shape:

```json
{
  "title": "Human-readable title",
  "slug": "folder-name",
  "description": "1–3 sentence explanation for a general audience.",
  "physics_concepts": ["concept 1", "concept 2"],
  "difficulty": "beginner | intermediate | advanced",
  "tags": ["chaos", "phase space", ...],
  "library": "p5.js | Canvas API | Three.js",
  "interactive_controls": ["slider name", "button name", ...]
}
```

The gallery `index.html` fetches all `meta.json` files at runtime (requires HTTP — won't work via `file://`).

---

## Shared Infrastructure

### `shared/style.css`
CSS custom properties (design tokens) for the dark theme. Key variables:
- `--bg-primary: #0d1117`, `--bg-secondary: #161b22`, `--bg-panel: #21262d`
- `--accent: #58a6ff`, `--accent-hover: #79b8ff`, `--accent-dim: #1f4068`
- `--text-primary: #e6edf3`, `--text-secondary: #8b949e`, `--border: #30363d`
- Layout classes: `.sim-page`, `.canvas-area`, `.controls-panel`, `.info-panel`, `.btn`, `.btn-primary`, `.btn-secondary`, `.equation`

### `shared/nav.js`
IIFE script included in every sim's `index.html` with `defer`. Self-injects:
- **Fixed nav bar** (44px, `z-index: 9999`, glass blur): `← Gallery` link + sim title + `About ↗` button
- **About panel** (320px, slides in from right): description, physics concept tags, controls list, difficulty/library badges
- Reads `./meta.json` relative to the sim page; gracefully degrades if fetch fails
- `← Gallery` uses `galleryHref()`: returns `'../'` when `parts.length >= 1`, `'./'` only at true root. This handles both GitHub Pages (`/physics-sims/sim-slug/`) and Live Server (`/sim-slug/`) correctly — the prior `parts.length <= 1` condition caused Live Server to reload the sim page instead of navigating to the gallery.

### `index.html` (gallery)
- Hardcoded `SIM_SLUGS` array — **must be updated when adding a new sim**
- `SIM_COLORS` object maps slug → CSS gradient for card accent bar — **update when adding a sim**
- Filter chips: Difficulty (All / Beginner / Intermediate / Advanced) and Topic (All / Chaos / Phase Space / Oscillator / Stochastic)
- Live search across title, description, concepts, tags

---

## Layout Compatibility Notes

All sims have `padding-top: 44px` on `body` so the fixed nav bar does not overlap content. The approach varies by layout type:

**Full-window sims** (canvas fills viewport, controls are `position: absolute` in browser space):
- `oscillator-phase-space` — `#controls` top offset shifted from 10px → 54px in CSS
- `tunable-mass-damper` — all 6 slider `.position()` y-values shifted +44px in `sketch.js` (p5 DOM elements use browser-absolute coords, not canvas-local)
- `gravity-well` — `body` uses `display: flex` + `padding-top: 44px; box-sizing: border-box`
- `double-pendulum-array` — `padding-top: 44px` on body

**Flow-layout sims** (explicit canvas size, scrollable page):
- `diffusion-levy-flights`, `dripping-faucet`, `relational-network`, `energy-landscape`, `kicked-pendulum`, `lorenz-attractor`, `three-body` — `padding-top: 44px` on body

**p5.js coordinate note:** `createSlider()`, `createButton()`, `createDiv()` use `.position(x, y)` in browser-absolute coordinates — these must be offset by 44px when the body has `padding-top`. Canvas-drawn text via `text()` uses canvas-local coordinates and is unaffected by body padding.

---

## Local Development

```bash
# From the repo root — fetch() requires HTTP
python -m http.server 8000
# or use VS Code Live Server
```

Then open `http://localhost:8000`.

---

## Roadmap

### Completed

- ✅ Consolidated all sims into unified gallery with shared nav bar and About panel
- ✅ Fixed nav bar offset across all sims (`padding-top: 44px`, per-sim adjustments)
- ✅ Fixed gallery `← Gallery` link (Live Server path depth bug in `galleryHref()`)
- ✅ Fixed `relational-network` invisible labels (added `color: #dcdcdc` to body; `overflow-x: hidden` to restore vertical scroll to controls)
- ✅ Split `phase-space-wrapper` into 5 standalone sims: `energy-landscape`, `gravity-well`, `kicked-pendulum`, `lorenz-attractor`, `three-body`
- ✅ Retired duplicate `orbital-phase-space` (same as `gravity-well`); archived alongside `phase-space-wrapper` in `_archive/`
- ✅ Cleaned stale files (`styleOld.css`, `test.html`, broken double-pendulum option in wrapper)

### Next: Per-sim UI/layout overhaul

Goal: consistent layout, styling, and UX across all 11 sims. Key principles:
- Use `shared/style.css` design tokens (already defined, not yet used by sim pages)
- Controls in HTML (not dynamically created via p5 where avoidable)
- Consistent panel layout: canvas area + controls panel + optional info panel
- Dark theme unified across all sims
- Priority sims for overhaul: `tunable-mass-damper` (sliders in sketch.js), `double-pendulum-array` (global-mode p5, full-window), `relational-network` (controls below large canvas)

### Medium-term

- **Add preview images** — `preview.png` per sim folder; gallery cards ready to show thumbnails once images exist
- **Gallery filter tags** — expand topic chips to cover more tags (e.g., "gravity", "engineering", "network")
- **Per-sim physics review** — audit correctness (integration method, parameter ranges). Priority: `tunable-mass-damper` (coupled equations, damping ratio), `gravity-well` (orbit energy conservation)
- **Educational content expansion** — richer `meta.json` content (equations, deeper explanations). About panel in `nav.js` is already wired for this
- **Upgrade p5.js versions** — `diffusion-levy-flights` and `tunable-mass-damper` still use p5.js 1.4.x; standardize to 1.9.x (test carefully — API changes between 1.4 and 1.9)
- **Convert `double-pendulum-array` to instance mode** — currently global-mode p5, which limits layout flexibility in the upcoming UI overhaul

### Longer-term

- **New simulations** — candidates: wave interference, fluid simulation, N-body gravity, spring-mass lattice, bifurcation explorer
- **Three.js upgrade for `lorenz-attractor`** — currently uses `p5.WEBGL`; Three.js would give better camera controls and performance
- **Move sims to `/sims/` subfolder** — cleaner repo structure; requires updating `SIM_SLUGS`, `galleryHref()`, and all relative asset paths
- **Link from personal site** — embed gallery or link card on owner's main GitHub Pages site

---

## Key Conventions

- **Adding a new sim:** create `<slug>/index.html`, `sketch.js`, `style.css`, `meta.json`; add slug to `SIM_SLUGS` and `SIM_COLORS` in root `index.html`; include `<script src="../shared/nav.js" defer></script>` in the sim's `<head>`
- **CSS changes:** put design tokens and reusable classes in `shared/style.css`; sim-specific overrides stay in the sim's own `style.css`
- **No frameworks, no build step** — keep it plain HTML/CSS/JS
- **p5.js CDN:** use `https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js` (or newer) — no local copies
