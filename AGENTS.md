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
/index.html                        ← Gallery portal (data-driven card grid)
/404.html                          ← GitHub Pages custom 404
/.nojekyll                         ← Prevents Jekyll processing
/shared/
  style.css                        ← Design tokens + layout primitives (dark theme)
  nav.js                           ← Self-injecting nav bar + About panel (included in every sim)
/sims/
  chaos/<slug>/                    ← Chaos & Dynamics series sims
  quantum/<slug>/                  ← Quantum Mechanics series sims
  thermodynamics/<slug>/           ← Thermodynamics series sims
  finance/<slug>/                  ← Finance & Entropy series sims (planned)
/tools/
  knowledge-map/                   ← Interactive D3 concept map
/scripts/
  capture-previews.js              ← Puppeteer preview screenshot capture
/_archive/                         ← Retired/prototype sims (not in gallery)

Each sim folder contains:
  index.html                       ← Standalone simulation page
  sketch.js                        ← Simulation logic (usually p5.js)
  style.css                        ← Sim-specific styles
  meta.json                        ← Structured metadata (see schema below)
  BRIEF.md                         ← (new sims only) Forward-looking design brief
  preview.webp                     ← Gallery card thumbnail (captured by capture-previews.js)
```

---

## Simulations & Roadmap

For the full inventory of completed and planned simulations, series plans (Quantum,
Thermodynamics, Finance & Entropy), and prioritised next-up list, see **[ROADMAP.md](ROADMAP.md)**.

**Archived (not in gallery):** `_archive/phase-space-wrapper` (split into individual sims), `_archive/orbital-phase-space` (retired duplicate).

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
- `← Gallery` uses `galleryHref()`: derives the gallery root URL from the script's own absolute URL (`shared/nav.js` is always one level below root). Works at any nesting depth and on both GitHub Pages and Live Server.

### `index.html` (gallery)
- `SIM_REGISTRY` array of `{ slug, series }` objects — **must be updated when adding a new sim**
- `SIM_COLORS` object maps slug → CSS gradient for card accent bar — **update when adding a sim**
- Filter chips: Difficulty (All / Beginner / Intermediate / Advanced) and Topic (All / Chaos / Phase Space / Oscillator / Stochastic / Quantum)
- **Planned new topic chips** (require code changes to `index.html`):
  - `"Quantum Information"` — for qubit-bloch, bell-states, quantum-teleportation, bb84-crypto; tag value `"quantum information"`
  - `"Thermodynamics"` — for maxwell-boltzmann, entropy-microstates, maxwells-demon, carnot-engine, feynman-ratchet, etc.; tag value `"thermodynamics"`
  - Note: `laplace-demon` gets the existing `"chaos"` tag (not a thermo tag)
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

**Preview capture:** `scripts/capture-previews.js` hardcodes `http://localhost:8000` — the server **must** be running on port 8000 before running `node scripts/capture-previews.js <slug>`.

---

### Recently completed

- ✅ `maxwells-demon` — layout-c; top-level mode toggle (Demon Mode / Szilard Engine); Demon Mode: dual chamber with intelligent partition door, N=20–80 molecules, blue→red speed coloring, thermometer bars (T_C left / T_H right), N_mem-bit register fills on each demon pass, orange erasure flash + teal entropy bursts, running Σ S_erased counter, Freeze Demon toggle; Szilard Mode: 4-step state machine (Observe→Insert→Expand→Erase), animated piston, molecule trail, work progress meter, step diagram with progress bar, Landauer accounting (net = 0); three edu modes (Maxwell's Demon / Landauer / Shannon = Boltzmann); preview: `node scripts/capture-previews.js maxwells-demon`
- ✅ `carnot-engine` — layout-c; P-V diagram (4 animated strokes + cycle dot trail + filled area = W); Sankey energy flow (Q_H→W+Q_C, arrow widths ∝ energy, orange entropy-waste splinter); entropy scorecard (ΔS_hot, ΔS_cold, ΔS_total per cycle, W_lost = TC×ΔS); Reversible/Real Engine toggle; irreversibility slider δ (T_H_eff=T_H(1-δ), T_C_eff=TC(1+δ)); ghost Carnot cycle shown in grey dashes in real mode; Curzon-Ahlborn η_CA displayed; three edu modes (Carnot/Entropy & Waste/Arrow of Time); preview: `node scripts/capture-previews.js carnot-engine`
- ✅ `ideal-gas-laws` — layout-c; gas box with movable piston (V slider); particles colored blue→white→red by T; mode-switching right panel (Boyle: P/N vs V with isotherms; Charles: V vs T with isobars; Gay-Lussac: P/N vs T with isochores); current state = orange dot + crosshairs + teal trace; dashed current-curve overlay; P readout; three edu modes auto-set canonical params; preview: `node scripts/capture-previews.js ideal-gas-laws`

---

## Key Conventions

- **Canvas text readability:** all text drawn on the p5 canvas must be bright and legible — **never** use dim grays for user-facing labels.
  - Panel/plot titles: `fill(200, 215, 230)` — near-white
  - Tick values, secondary labels: `fill(155, 170, 190)` — readable mid-tone
  - Rotated axis labels: `fill(155, 170, 190)`
  - Data annotations (reference labels, event markers): use the series color at full alpha
  - **Do not use** `fill(65, 80, 100)`, `fill(80, 95, 115)`, or any darker gray for any text the user needs to read
- **Adding a new sim:** create `sims/<series>/<slug>/index.html`, `sketch.js`, `style.css`, `meta.json`; add `{ slug, series }` to `SIM_REGISTRY` and the slug to `SIM_COLORS` in root `index.html`; include `<script src="../../../shared/nav.js" defer></script>` and `<link rel="stylesheet" href="../../../shared/style.css">` in the sim's `<head>`
- **CSS changes:** put design tokens and reusable classes in `shared/style.css`; sim-specific overrides stay in the sim's own `style.css`
- **No frameworks, no build step** — keep it plain HTML/CSS/JS
- **p5.js CDN:** use `https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js` — all sims standardized on 1.9.4

### Thermodynamics series conventions (all layout-c sims)

**Color language:**
- Cold particles / low-energy: blue `rgb(50, 130, 220)`
- Hot particles / high-energy: red `rgb(220, 60, 50)`
- Medium-temperature / neutral: white `rgb(220, 220, 220)`
- Temperature gradient: interpolate blue → white → red mapped to 0 → v_rms → 2·v_rms
- Distribution / histogram: teal `rgba(45, 215, 135)` (consistent with quantum series)
- Theory / classical prediction curve: orange `rgb(255, 150, 50)` (consistent)
- Canvas background: `background(17, 24, 32)` (same as quantum series)

**Code patterns:** same as quantum series (`computeGeometry`, `readControls`, `updatePhysics`,
`EDU` object, `updateEduPanel`). Layout-c for all thermo sims.

**Gallery tag:** `"thermodynamics"` (exact string for chip filter match). Exception:
`laplace-demon` uses `"chaos"` — it is a complexity/chaos sim, not pure thermo.

**Maxwell's Demon note:** `maxwells-demon` combines two modes — Demon Mode and Szilard
Engine — in a single sim. Use a top-level mode toggle to switch between them. Each mode
has its own canvas geometry; call `computeGeometry()` on mode switch.

---

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
