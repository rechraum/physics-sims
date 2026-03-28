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
  BRIEF.md                   ← (new sims only) Forward-looking design brief
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
| `tunable-mass-damper` | Tuned Mass Damper | p5.js 1.9.4 | intermediate |
| `wave-interference` | Wave Interference | p5.js 1.9.4 | beginner |
| `particle-in-a-box` | Particle in a Box | p5.js 1.9.4 | intermediate |
| `blackbody-radiation` | Blackbody Radiation | p5.js 1.9.4 | intermediate |
| `photoelectric-effect` | Photoelectric Effect | p5.js 1.9.4 | intermediate |
| `uncertainty-principle` | Uncertainty Principle | p5.js 1.9.4 | intermediate |
| `double-slit` | Double-Slit Experiment | p5.js 1.9.4 | intermediate |

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
  "equations": ["y = A sin(kx − ωt)", "E<sub>n</sub> = n²E<sub>1</sub>"],
  "difficulty": "beginner | intermediate | advanced",
  "tags": ["chaos", "phase space", ...],
  "library": "p5.js | Canvas API | Three.js",
  "interactive_controls": ["slider name", "button name", ...]
}
```

`equations` is optional. Values may contain HTML (sub/superscripts) — rendered as `.equation` blocks in the About panel by nav.js, not escaped.

The gallery `index.html` fetches all `meta.json` files at runtime (requires HTTP — won't work via `file://`).

---

## Shared Infrastructure

### `shared/style.css`
CSS custom properties (design tokens) for the dark theme. Key variables:
- `--bg-primary: #0d1117`, `--bg-secondary: #161b22`, `--bg-panel: #21262d`
- `--accent: #58a6ff`, `--accent-hover: #79b8ff`, `--accent-dim: #1f4068`
- `--text-primary: #e6edf3`, `--text-secondary: #8b949e`, `--border: #30363d`
- Layout classes: `.sim-page`, `.canvas-area`, `.controls-panel`, `.info-panel`, `.btn`, `.btn-primary`, `.btn-secondary`, `.equation`
- Educational primitives: `.equation` (monospace block, accent left-border, bg-panel background), `.edu-callout` / `.edu-callout-title` (teal left-border card for real-world examples), `.edu-strip-content` / `.edu-strip-main` / `.edu-strip-aside` (two-column layout inside `.sim-edu-strip`)

### `shared/nav.js`
IIFE script included in every sim's `index.html` with `defer`. Self-injects:
- **Fixed nav bar** (44px, `z-index: 9999`, glass blur): `← Gallery` link + sim title + `About ↗` button
- **About panel** (320px, slides in from right): description, physics concept tags, **key equations** (from `meta.json` `equations` array — rendered as `.equation` blocks, HTML allowed), controls list, difficulty/library badges
- Reads `./meta.json` relative to the sim page; gracefully degrades if fetch fails
- `← Gallery` uses `galleryHref()`: returns `'../'` when `parts.length >= 1`, `'./'` only at true root. This handles both GitHub Pages (`/physics-sims/sim-slug/`) and Live Server (`/sim-slug/`) correctly.

### `index.html` (gallery)
- Hardcoded `SIM_SLUGS` array — **must be updated when adding a new sim**
- `SIM_COLORS` object maps slug → CSS gradient for card accent bar — **update when adding a sim**
- Filter chips: Difficulty (All / Beginner / Intermediate / Advanced) and Topic (All / Chaos / Phase Space / Oscillator / Stochastic / Quantum)
- Live search across title, description, concepts, tags

---

## Layout System

### Layout classes (`.sim-wrapper.layout-*`)

All sims use `height: calc(100vh - 44px)` and `overflow: hidden`.

- **`layout-a`** — canvas left (`1fr`), 280px controls panel right. Used by: lorenz-attractor, energy-landscape, gravity-well, three-body, double-pendulum-array, tunable-mass-damper, oscillator-phase-space.
- **`layout-b`** — canvas top (`1fr`), 240px strip bottom. Used by: kicked-pendulum, diffusion-levy-flights, relational-network, dripping-faucet, wave-interference.
  - `wave-interference` overrides the strip with a full-width horizontal flex row (`.wave-controls-bar`, `.ctrl-section`) — use when layout-b needs >4 controls.
- **`layout-c`** — canvas top-left (`1fr`), 280px controls top-right, **full-width 240px edu strip** spanning the bottom. Used by all quantum series sims. Best for sims with rich educational content.
  - HTML: `.sim-canvas-area` + `.sim-panel` + `.sim-edu-strip#sim-edu` all inside `.sim-wrapper.layout-c`
  - Pre-populate `#sim-edu` with `<span></span>` so nav.js skips auto-population; sketch.js owns the content.

### Nav bar offset
All sims have `padding-top: 44px` on `body`. Full-window sims needing extra care:
- `oscillator-phase-space` — `#controls` CSS top offset shifted 10px → 54px
- `tunable-mass-damper` — all 6 `createSlider()` `.position()` y-values +44px in sketch.js
- `gravity-well` — `display: flex` + `padding-top: 44px; box-sizing: border-box` on body
- **p5 coordinate note:** `.position(x, y)` on p5 DOM elements uses browser-absolute coordinates, not canvas-local. Offset by 44px when body has padding-top.

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

### Completed (full session notes in AGENTS_ARCHIVE.md)

- ✅ Gallery portal, shared nav/About infrastructure, dark-theme layout system, filter chips
- ✅ Per-sim UI overhaul: unified layout-a/b/c, HTML controls, nav bar offset fixes, dark theme
- ✅ Preview thumbnails via Puppeteer (`scripts/capture-previews.js`); p5.js standardized to 1.9.4
- ✅ `wave-interference` — layout-b, three modes, interference colormap; quantum series kickoff
- ✅ `particle-in-a-box` — layout-c introduced, mode-sensitive edu panel pattern established
- ✅ `blackbody-radiation` — two-region canvas, three spectrum modes, sqrt temperature mapping
- ✅ `photoelectric-effect` — animated apparatus, dual stacked plots (both models always visible)
- ✅ `uncertainty-principle` — dual-panel (position + momentum), three shapes (Gaussian/Two-peak/Chirped), Measure mode with bouncing wave packet + interactive collapse + free spreading, dynamic edu strip cycles through 3 states (de Broglie chirp explanation → Born-rule collapse → σ(t) spreading), legend on canvas, contextual precision slider label
- ✅ `double-slit` — layout-c; apparatus panel (wave map via p5.Graphics + animated arcs, barrier, source glow) + screen panel (dot scatter + histogram + theory curve); Fraunhofer I(y)=sinc²·cos² formula with 2000-bin CDF sampling; which-way mode (incoherent sum, orange curve, purple detector indicator); Wave/Particle display modes with particle flight animation; three edu modes (Wave-Particle, Complementarity, Math); preview: `node scripts/capture-previews.js double-slit`

### Next up
- **`quantum-tunneling`** — wave packet / Crank-Nicolson finite-difference method

### Medium-term

- **Gallery filter tags** — additional topic chips if needed (e.g., "gravity", "engineering")
- **Per-sim physics review** — audit correctness. Priority: `tunable-mass-damper` (damping ratio), `gravity-well` (orbit energy conservation)
- **Educational content** — add `equations` to remaining sim meta.json files

### Longer-term

- **Three.js upgrade for `lorenz-attractor`** — better camera controls and performance than p5.WEBGL
- **Move sims to `/sims/` subfolder** — requires updating `SIM_SLUGS`, `galleryHref()`, all relative paths
- **Link from personal site** — embed gallery or link card on owner's main GitHub Pages site

---

## Key Conventions

- **Adding a new sim:** create `<slug>/index.html`, `sketch.js`, `style.css`, `meta.json`; add slug to `SIM_SLUGS` and `SIM_COLORS` in root `index.html`; include `<script src="../shared/nav.js" defer></script>` in the sim's `<head>`
- **CSS changes:** put design tokens and reusable classes in `shared/style.css`; sim-specific overrides stay in the sim's own `style.css`
- **No frameworks, no build step** — keep it plain HTML/CSS/JS
- **p5.js CDN:** use `https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js` — all sims standardized on 1.9.4

### Quantum series conventions (all layout-c sims)

**Color language:**
- ψ / quantum curve: accent blue `rgb(88, 166, 255)`
- Classical / secondary curve: orange `rgb(255, 150, 50)`
- Probability density fill: teal `rgba(45, 215, 135, 35)`
- Probability density stroke: teal `rgba(45, 215, 135, 200)`
- Threshold / uncertainty markers: purple `rgb(170, 65, 255)`
- Canvas background: `background(17, 24, 32)` every frame

**Code patterns:**
- Canvas geometry: all coordinates in `computeGeometry()`, called from `setup()` and `windowResized()`
- Controls: read via `readControls()` each frame; derived physics in `updatePhysics()`
- Mode-sensitive edu panel: `const EDU = { modeName: \`<html>...\` }` + `updateEduPanel(m)` called from `setup()` and on mode change
- Dual-model plots: show both predictions simultaneously; active model = full alpha, inactive ≈ 75 alpha with dashed stroke
- Gallery filter: tag must be `"quantum mechanics"` (not `"quantum"`) to match the chip's exact-match filter
