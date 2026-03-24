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
| `tunable-mass-damper` | Tuned Mass Damper | p5.js 1.9.4 | intermediate |
| `wave-interference` | Wave Interference | p5.js 1.9.4 | beginner |
| `particle-in-a-box` | Particle in a Box | p5.js 1.9.4 | intermediate |

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
- `← Gallery` uses `galleryHref()`: returns `'../'` when `parts.length >= 1`, `'./'` only at true root. This handles both GitHub Pages (`/physics-sims/sim-slug/`) and Live Server (`/sim-slug/`) correctly — the prior `parts.length <= 1` condition caused Live Server to reload the sim page instead of navigating to the gallery.

### `index.html` (gallery)
- Hardcoded `SIM_SLUGS` array — **must be updated when adding a new sim**
- `SIM_COLORS` object maps slug → CSS gradient for card accent bar — **update when adding a sim**
- Filter chips: Difficulty (All / Beginner / Intermediate / Advanced) and Topic (All / Chaos / Phase Space / Oscillator / Stochastic / Quantum)
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

### Completed: Per-sim UI/layout overhaul ✅

All 11 sims now use the unified layout system defined in `shared/style.css`:

**Layout system** (`.sim-wrapper.layout-a` / `.layout-b`):
- `layout-a` — canvas fills left, 280px panel on right (good for tall/square canvases): lorenz-attractor, energy-landscape, gravity-well, three-body, double-pendulum-array, tunable-mass-damper, oscillator-phase-space
- `layout-b` — canvas fills top, 240px panel strip at bottom (good for wide canvases): kicked-pendulum, diffusion-levy-flights, relational-network, dripping-faucet, wave-interference
  - `wave-interference` uses a **custom horizontal control strip** — overrides the default 50/50 controls/edu split with a full-width flex row of labelled sections (`.wave-controls-bar`, `.ctrl-section`). Use this pattern for sims needing more than 4–5 controls in layout-b.
- `layout-c` — canvas top-left, 280px controls panel top-right, **full-width educational strip at bottom** (240px, scrollable): particle-in-a-box. Best for sims with rich educational content (equations, callouts). Use for quantum series sims going forward.
  - HTML structure: `.sim-canvas-area` + `.sim-panel` (controls only, no `.sim-edu-section`) + `.sim-edu-strip#sim-edu` as a sibling of `.sim-panel` inside `.sim-wrapper`
  - edu strip uses `.edu-strip-content` → `.edu-strip-main` + optional `.edu-strip-aside` for two-column layout
- Panel has two sections: `.sim-controls-section` (controls) + `.sim-edu-section` (educational content auto-populated from meta.json by nav.js)
  - In layout-c, `.sim-edu-section` is replaced by `.sim-edu-strip` outside the panel

**Controls migration**: All p5 DOM controls moved to HTML:
- `tunable-mass-damper`: 6 `createSlider()` calls → HTML `<input type="range">` elements; `displaySliderValues()` removed (labels in HTML); canvas parented to `#canvas-container`
- `relational-network`: `createButton()`, `createDiv()`, `createSlider()` → HTML controls with `addEventListener`; canvas parented to `#canvas-container`
- `double-pendulum-array`: canvas parented to `#canvas-container` (was appending to body)
- `oscillator-phase-space`: canvas resized to fill container div (was `windowWidth × windowHeight`); dynamic oscillator sliders still created via native DOM in Oscillator class

**nav.js**: Added `populateEduPanel()` — auto-populates `#sim-edu` from meta.json description + physics concept tags. Skips if `#sim-edu` has static content (dripping-faucet has handwritten edu panel).

**dripping-faucet**: Full dark-theme overhaul of inline canvas drawing colors (axes, labels, points now use design token colors); faucet div and droplets updated to dark theme.

### Completed: Preview images, p5.js upgrades, instance mode conversion ✅

- **Preview images** — `preview.webp` captured via Puppeteer (`scripts/capture-previews.js`); gallery cards display thumbnails on load. Re-run the script (with local server running) to refresh images. Now accepts optional slug args: `node scripts/capture-previews.js wave-interference` re-captures a single sim without running all 12.
- **p5.js standardized to 1.9.4** — all 12 sims on 1.9.4 via cdnjs.
- **`double-pendulum-array` converted to instance mode** — `DoublePendulumArray.js` wrapped in `const sketch = (p) => { ... }; new p5(sketch)`. Physics functions (`derivatives`, `rk4Step`, `DoublePendulumSim`) use `Math.*` directly; all p5 API calls prefixed with `p.`.

### Completed: Wave interference sim + quantum mechanics series kickoff ✅

- **`wave-interference`** — beginner-difficulty sim with three modes: Continuous (live standing wave), Snapshot (time-scrub slider), and Pulse (Gaussian-windowed pulses from each end that collide and pass through). Superposition curve uses a per-segment interference colormap (teal = constructive+, purple = constructive−, red = destructive). In Pulse mode the colormap only renders where both Gaussian envelopes exceed 4% of peak, so isolated pulses show as plain blue/orange. Includes analytical amplitude envelope and node/antinode markers.
- **Gallery**: Quantum topic filter chip added; wave-interference card registered with cyan→purple gradient.

### Completed: Particle in a Box sim + educational infrastructure ✅

- **`particle-in-a-box`** — intermediate-difficulty sim. Two modes: Eigenstate (show ψ_n and/or |ψ_n|² for n=1–6 with canvas energy level diagram) and Superposition (animate |ψ(x,t)|² = ½ψ_n1² + ½ψ_n2² + ψ_n1·ψ_n2·cos(ΔE·ω·t), showing quantum beating). Color language deliberately extends wave-interference: ψ>0 in accent blue, ψ<0 in purple, |ψ|² in teal, n₁/n₂ background curves in blue/orange. Energy level diagram drawn in canvas right margin; ΔE bracket + label in superposition mode. Pause button and animation speed control.
- **Mode-sensitive edu panel** — `#sim-edu` content swaps between Eigenstate and Superposition HTML on every mode change via `updateEduPanel(m)` in sketch.js. Pattern: pre-populate `#sim-edu` with a placeholder child so nav.js skips auto-population; JS owns the content from `setup()` onward. Superposition panel uses two-column strip layout with physical examples (ammonia maser, NMR/MRI) in a `.edu-callout` aside.
- **`layout-c`** added to `shared/style.css` — three-area grid: canvas top-left, 280px controls panel top-right, full-width 240px edu strip spanning the bottom. Use for quantum sims and any future sim with rich inline educational content. See Layout Compatibility Notes above for HTML structure.
- **Educational content infrastructure** — `equations` array added to `meta.json` schema; nav.js About panel now renders a "Key Equations" section with `.equation` blocks (HTML allowed in values, not escaped). `.edu-callout` / `.edu-callout-title` promoted from sim-specific to `shared/style.css`. `.equation` background changed to `--bg-panel` for contrast on any background. `.edu-strip-content` / `.edu-strip-main` / `.edu-strip-aside` added to shared for two-column edu strip layouts.
- **`wave-interference` meta.json** — `equations` array added (4 equations); demonstrates the new About panel feature with no code changes to the sim itself.
- **Note**: `preview.webp` not yet captured for `particle-in-a-box` — run `node scripts/capture-previews.js particle-in-a-box` with a local server running.

### Completed: Blackbody Radiation sim ✅

- **`blackbody-radiation`** — intermediate-difficulty sim. Canvas split into two regions: left (42%) is a cavity/oven visualization with temperature-reactive glow color (via piecewise RGB approximation of the Planckian locus), static standing-wave mode shapes (n=1–4) inside the cavity, a pinhole with dashed emitted-ray fan, and a temperature color swatch strip. Right (58%) is the spectrum plot — Planck and/or Rayleigh-Jeans curves vs. wavelength (100–3000 nm), colored visible-spectrum band, Wien peak marker (purple dashed), divergence arrow + "→∞" annotation on the RJ curve.
- **Three spectrum modes**: Classical (Rayleigh-Jeans only, solid orange), Both (Planck solid blue + RJ dashed orange — side-by-side comparison is the educational core), Quantum (Planck only). Each mode has its own edu panel content.
- **Controls**: Temperature slider with sqrt mapping (300–15 000 K, so low-T detail isn't cramped); four preset buttons (Room 300K, Bulb 2700K, Sun 5778K, Blue★ 15000K); visibility toggles for the visible band, Wien marker, and cavity modes; readout pills for λ_max and P ∝ T⁴ normalized to solar.
- **Color language**: Planck in accent blue (88,166,255), RJ in orange (255,150,50), filled area in teal (45,215,135), Wien marker in purple (170,65,255) — all consistent with prior quantum sims. Cavity glow uses `bbColor(T)` (Neil Bartlett / Tanner Helland piecewise algorithm for approximate blackbody color).
- **Edu panels**: Three mode-sensitive panels. Classical explains equipartition + mode density divergence. Both compares the ratio and Planck's fitting-first approach. Quantum covers Wien's law, Stefan-Boltzmann, and real-world examples (Sun, CMB).
- **Gallery**: Added to `SIM_SLUGS` and `SIM_COLORS` in index.html (orange→red gradient). `preview.webp` not yet captured — run `node scripts/capture-previews.js blackbody-radiation` with local server running.

### Completed: Photoelectric Effect sim ✅

- **`photoelectric-effect`** — intermediate-difficulty sim. Left panel: animated apparatus (light source → metal plate → collector → ammeter circuit). Quantum mode shows discrete colored photon particles; below-threshold photons produce an absorption flash (no electron). Classical mode shows animated sine wave + energy accumulation fill bar + glow on the plate; electrons emit periodically as the bar fills to φ.
- **Both plots always show both model predictions**: active model is bright, inactive is dimmed. Top plot: KE_max vs wavelength — quantum hyperbolic curve (KE = hc/λ − φ, zero below threshold) vs classical horizontal line (KE ∝ intensity, λ-independent). Bottom plot: current vs wavelength — quantum step function (zero above λ_thresh, flat below) vs classical flat line (no threshold). A colored dashed marker tracks the current wavelength on both plots with dots on both curves.
- **Metal selector**: Cs (φ=2.0 eV, λ_thresh=620 nm — red light barely fails), Na (2.3 eV, 540 nm), Zn (4.3 eV, 289 nm — UV only), Au (5.1 eV, 244 nm — deep UV). Cesium default is the most dramatic because its threshold is inside the visible spectrum.
- **Mode-sensitive edu panels**: Classical explains the three failures of the wave model (threshold, instantaneous emission, KE∝ν not intensity). Quantum covers Einstein's photoelectric equation with real-world callouts (CCD/CMOS sensors, Millikan's confirmation).
- **Gallery**: Added to `SIM_SLUGS` and `SIM_COLORS` in index.html (purple→blue gradient). `preview.webp` not yet captured — run `node scripts/capture-previews.js photoelectric-effect` with local server.
- **Tag fix**: `blackbody-radiation` and `particle-in-a-box` meta.json tags corrected from `"quantum"` to `"quantum mechanics"` to match the gallery filter chip's exact-match value (`data-value="quantum mechanics"`). All four quantum sims now appear when the Quantum chip is active.

### Next steps

### Medium-term

- **Quantum mechanics series** — `wave-interference` (beginner), `particle-in-a-box` (intermediate), `blackbody-radiation` (intermediate), `photoelectric-effect` (intermediate) done; next: quantum tunneling (wave packet / Crank-Nicolson), double-slit experiment
- **Gallery filter tags** — additional topic chips if needed (e.g., "gravity", "engineering", "network")
- **Per-sim physics review** — audit correctness (integration method, parameter ranges). Priority: `tunable-mass-damper` (coupled equations, damping ratio), `gravity-well` (orbit energy conservation)
- **Educational content expansion** — infrastructure complete (equations in About panel, layout-c, edu-callout, mode-sensitive edu panel). Remaining: add `equations` to remaining sim meta.json files; consider richer descriptions for classical sims

### Longer-term

- **New simulations** — candidates: fluid simulation, N-body gravity, spring-mass lattice, bifurcation explorer
- **Three.js upgrade for `lorenz-attractor`** — currently uses `p5.WEBGL`; Three.js would give better camera controls and performance
- **Move sims to `/sims/` subfolder** — cleaner repo structure; requires updating `SIM_SLUGS`, `galleryHref()`, and all relative asset paths
- **Link from personal site** — embed gallery or link card on owner's main GitHub Pages site

---

## Key Conventions

- **Adding a new sim:** create `<slug>/index.html`, `sketch.js`, `style.css`, `meta.json`; add slug to `SIM_SLUGS` and `SIM_COLORS` in root `index.html`; include `<script src="../shared/nav.js" defer></script>` in the sim's `<head>`
- **CSS changes:** put design tokens and reusable classes in `shared/style.css`; sim-specific overrides stay in the sim's own `style.css`
- **No frameworks, no build step** — keep it plain HTML/CSS/JS
- **p5.js CDN:** use `https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js` — all sims standardized on 1.9.4
