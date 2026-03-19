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
| `orbital-phase-space` | Orbital Mechanics & Phase Space | p5.js 1.6.0 | intermediate |
| `oscillator-phase-space` | Harmonic Oscillator Phase Space | p5.js 1.6.0 | beginner |
| `phase-space-wrapper` | Phase Space Collection | p5.js 1.6.0 | intermediate |
| `relational-network` | Relational Network Dynamics | p5.js 1.6.0 | intermediate |
| `tunable-mass-damper` | Tuned Mass Damper | p5.js 1.4.2 | intermediate |

`phase-space-wrapper` is a multi-sim container holding: 1D Oscillator, Kicked Pendulum, Gravity Well, Three-Body Problem, Energy Landscape, Lorenz Attractor (WebGL via `p5.WEBGL`).

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
- `← Gallery` resolves to `../` (one level up), correct for all current sims at root level

### `index.html` (gallery)
- Hardcoded `SIM_SLUGS` array — **must be updated when adding a new sim**
- `SIM_COLORS` object maps slug → CSS gradient for card accent bar — **update when adding a sim**
- Filter chips: Difficulty (All / Beginner / Intermediate / Advanced) and Topic (All / Chaos / Phase Space / Oscillator / Stochastic)
- Live search across title, description, concepts, tags

---

## Layout Compatibility Notes

Some sims use **full-window absolute positioning** (canvas fills 100vw × 100vh, controls are `position: absolute`):
- `oscillator-phase-space` — controls float top-left with `position: absolute`
- `tunable-mass-damper` — canvas fills window, sliders are inside sketch
- `orbital-phase-space` — canvas fills window
- `double-pendulum-array` — canvas fills window

For these, `nav.js` uses `position: fixed` overlay — it does **not** push content down. The top 44px of these canvases is visually overlaid by the nav bar. This is a known, acceptable trade-off for now; per-sim layout improvements are in the roadmap.

Sims with **standard flow layout** (explicit canvas sizes, scrollable page):
- `diffusion-levy-flights`, `dripping-faucet`, `phase-space-wrapper`

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

### Immediate / Near-term

- **Review and test live site** — check each sim loads correctly on `rechraum.github.io/physics-sims/`, verify nav bar and About panel work across all 8
- **Fix full-window sim layouts** — for sims where the nav bar overlays the top of the canvas, add a proper top offset (e.g., `padding-top: 44px` on body + adjust `createCanvas` height by `44` in the sketch, or shift the p5 canvas down in the DOM)
- **Add preview images** — add a `preview.png` (or `.webp`) to each sim folder; update gallery cards to show a thumbnail. `meta.json` already has a `preview_image` field stub ready to use
- **Gallery filter tags** — expand the topic chip list to cover more of the actual tags in `meta.json` (e.g., "gravity", "engineering", "network")
- **Clean up stale files** — `phase-space-wrapper/styleOld.css`, `oscillator-phase-space/test.html` can be deleted

### Medium-term

- **Per-sim physics review** — audit each simulation for correctness (numerical integration method, parameter ranges, edge cases). Priority candidates: `orbital-phase-space` (check orbit conservation), `tunable-mass-damper` (verify coupled equations and damping ratio)
- **Educational content expansion** — add equations and deeper explanations to each `meta.json` or a companion `notes.md` per sim. The About panel in `nav.js` is already wired to display this; it just needs richer content
- **Upgrade p5.js versions** — `diffusion-levy-flights` and `tunable-mass-damper` still use p5.js 1.4.x; standardize all to 1.9.x (latest stable). Test carefully — some p5 APIs changed between 1.4 and 1.9
- **Improve `phase-space-wrapper`** — currently a monolithic multi-sim page; consider whether to split into individual sim pages or keep as a collection. The wrapper pattern works but makes deep-linking and nav harder

### Longer-term

- **New simulations** — candidates discussed: wave interference, fluid simulation, N-body gravity, spring-mass lattice, bifurcation explorer (generalized)
- **Three.js upgrade for 3D sims** — `LorenzAttractor.js` currently uses `p5.WEBGL`; migrating to Three.js would give better camera controls, lighting, and performance
- **Move sims to `/sims/` subfolder** — cleaner repo structure; requires updating `SIM_SLUGS` paths in gallery, `galleryHref()` in `nav.js`, and all relative asset references
- **Link from personal site** — embed gallery or link card on the owner's main GitHub Pages personal site

---

## Key Conventions

- **Adding a new sim:** create `<slug>/index.html`, `sketch.js`, `style.css`, `meta.json`; add slug to `SIM_SLUGS` and `SIM_COLORS` in root `index.html`; include `<script src="../shared/nav.js" defer></script>` in the sim's `<head>`
- **CSS changes:** put design tokens and reusable classes in `shared/style.css`; sim-specific overrides stay in the sim's own `style.css`
- **No frameworks, no build step** — keep it plain HTML/CSS/JS
- **p5.js CDN:** use `https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js` (or newer) — no local copies
