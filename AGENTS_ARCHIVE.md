# Physics Simulations — Session Archive

Detailed notes from past sessions. Current conventions and next steps live in `AGENTS.md`.

---

## Session: Gallery + nav infrastructure

- **Gallery portal** (`index.html`) — data-driven card grid, fetches `meta.json` per sim, difficulty + topic filter chips, search input, skeleton loading state. Requires HTTP server (not `file://`).
- **`shared/nav.js`** — self-injects fixed overlay nav bar (44px, glass blur) + collapsible About panel (slides from right) into every sim. Reads `./meta.json`; renders description, physics concept tags, key equations (from `equations` array — HTML allowed, not escaped), controls list, difficulty/library badges.
- **`galleryHref()` fix** — prior `parts.length <= 1` condition caused Live Server to reload the sim instead of navigating to gallery. Corrected to `parts.length >= 1` returning `'../'`.
- **`404.html`**, **`.nojekyll`** created.

## Session: Per-sim UI/layout overhaul

All 11 existing sims migrated to unified layout system:

- **`layout-a`** (canvas left, 280px panel right): lorenz-attractor, energy-landscape, gravity-well, three-body, double-pendulum-array, tunable-mass-damper, oscillator-phase-space
- **`layout-b`** (canvas top, 240px strip bottom): kicked-pendulum, diffusion-levy-flights, relational-network, dripping-faucet, wave-interference
  - `wave-interference` uses a custom full-width horizontal control strip (`.wave-controls-bar`, `.ctrl-section`) — use this pattern when layout-b needs more than 4–5 controls.
- Nav bar offset: all sims got `padding-top: 44px` on body. Full-window sims with `position: absolute` controls needed individual adjustments: `oscillator-phase-space` → CSS offset; `tunable-mass-damper` → all 6 `createSlider()` `.position()` y-values +44px in sketch.js; `gravity-well` → `display: flex` + `padding-top: 44px; box-sizing: border-box`.
- **p5 DOM controls moved to HTML** for tunable-mass-damper (6 sliders) and relational-network (buttons, divs, sliders).
- **`double-pendulum-array` converted to instance mode** — wrapped in `const sketch = (p) => {}; new p5(sketch)`. Physics functions use `Math.*` directly; all p5 API calls prefixed with `p.`.
- **`dripping-faucet`** — full dark-theme overhaul of inline canvas drawing colors.
- **`nav.js` `populateEduPanel()`** — auto-populates `#sim-edu` from meta.json. Skips if `#sim-edu` has pre-existing static content.

## Session: Preview thumbnails + p5.js standardization

- **`preview.webp`** captured via Puppeteer (`scripts/capture-previews.js`). Script now accepts optional slug args: `node scripts/capture-previews.js wave-interference` re-captures one sim.
- **p5.js standardized to 1.9.4** across all sims via cdnjs CDN.

## Session: Wave interference sim + educational infrastructure

- **`wave-interference`** — three modes: Continuous (live standing wave), Snapshot (time-scrub slider), Pulse (Gaussian-windowed pulses that collide and pass through). Superposition curve uses per-segment interference colormap: teal = constructive+, purple = constructive−, red = destructive. Colormap only renders in Pulse mode where both Gaussian envelopes exceed 4% of peak. Analytical amplitude envelope and node/antinode markers.
- **Quantum filter chip** added to gallery.
- **`equations` array** added to `meta.json` schema; nav.js About panel renders a "Key Equations" section.
- **`.edu-callout` / `.edu-callout-title`** promoted to `shared/style.css`.
- **`.edu-strip-content` / `.edu-strip-main` / `.edu-strip-aside`** added to shared for two-column edu strip layouts.

## Session: Particle in a Box + layout-c

- **`particle-in-a-box`** — Eigenstate mode (ψ_n, |ψ_n|² for n=1–6, energy level diagram in canvas right margin) + Superposition mode (animate |ψ(x,t)|² = ½ψ_n1² + ½ψ_n2² + ψ_n1·ψ_n2·cos(ΔE·ω·t), quantum beating). ΔE bracket + label in superposition mode. Pause + animation speed control.
- **`layout-c`** introduced — three-area grid: canvas top-left, 280px controls top-right, full-width 240px edu strip bottom. All quantum sims use this.
- **Mode-sensitive edu panel pattern** — pre-populate `#sim-edu` with `<span></span>` to block nav.js; define `const EDU = { mode: \`html\` }` in sketch.js; call `updateEduPanel(m)` from `setup()` and on mode change.

## Session: Blackbody Radiation

- **`blackbody-radiation`** — canvas split: left 42% = cavity visualization (temperature-reactive glow via Planckian locus piecewise RGB, static standing-wave modes n=1–4, pinhole with dashed ray fan, temperature color swatch strip); right 58% = spectrum plot (Planck + Rayleigh-Jeans curves vs 100–3000 nm, colored visible-spectrum band, Wien peak marker in purple dashed, divergence arrow + "→∞").
- Three spectrum modes: Classical / Both / Quantum — each with its own edu panel.
- Temperature slider uses sqrt mapping (300–15000 K) to prevent low-T range being cramped.
- Four preset buttons: Room 300K, Bulb 2700K, Sun 5778K, Blue★ 15000K.
- `bbColor(T)` function: Bartlett/Helland piecewise RGB for Planckian locus.

## Session: Photoelectric Effect

- **`photoelectric-effect`** — left panel: animated apparatus (light source → metal plate → collector → ammeter). Quantum mode: discrete photon particles colored by wavelength; below-threshold photons → absorption flash, zero electrons. Classical mode: animated sine wave (cycle count scales with ν) + energy accumulation fill bar that rises from plate bottom + orange glow halo; electron emits when bar reaches φ.
- Both plots always show both model predictions — active = full alpha, inactive = ~75 alpha with dashed stroke. Top: KE_max vs wavelength (quantum hyperbola vs classical horizontal). Bottom: current vs wavelength (quantum step function vs classical flat).
- Metal selector: Cs φ=2.0 eV λ_thresh=620 nm (red light fails — dramatic), Na 2.3 eV, Zn 4.3 eV, Au 5.1 eV.
- **Tag fix**: `blackbody-radiation` and `particle-in-a-box` meta.json tags corrected `"quantum"` → `"quantum mechanics"` to match gallery filter chip exact-match value.

## Session: Uncertainty Principle

### Core sim (first commit)

- **`uncertainty-principle`** — layout-c, dual-panel canvas: position space (left ~50%) and momentum space (right ~50%) split by a vertical divider. Three wave packet shapes computed analytically each frame (no FFT):
  - *Gaussian*: Δx=σ, Δp=1/(2σ), product=1/2 (minimum); product pill shows in accent blue
  - *Two-peak*: Δx=σ√2, Δp=1/(2σ); momentum space shows cos²·Gaussian interference fringes (double-slit in momentum space)
  - *Chirped*: Δx=σ, Δp=√5/(2σ) using α=1/σ²; same position distribution as Gaussian but broader momentum; the phase is invisible in |ψ|² — only momentum space reveals it
- Controls: σ_x slider (0.3–2.5), k₀ slider (−3 to +3), three shape buttons (teal active state), three readout pills (Δx, Δp, Δx·Δp). Product pill shifts blue→orange when ratio > 1.03.
- Two edu modes: *Principle* (uncertainty trade-off, electron microscope callout) and *Fourier Dual* (chirped-pulse amplification Nobel 2018, MRI pulse shaping).

### Measure mode (second commit)

Three-act interactive measurement mode added as the default landing mode:

- **Act 1 — Bouncing**: wave packet with `xc(t) = A·cos(ωt)`, `pc(t) = −Aω·sin(ωt)`. ψ(x) real part drawn using `cos(pc·(x−xc))` — oscillation frequency ∝ momentum (visible de Broglie relation). Δx/Δp brackets follow the packet live.
- **Act 2 — Aperture**: purple shaded band tracks the particle on the measured panel in real time. Dashed purple ghost on the conjugate panel shows the predicted post-measurement distribution as the slider moves (before firing).
- **Act 3 — Fire**: `measurePhase` transitions: `bouncing` → `collapsed_frozen` (paused at t=0) → (click Restart) → `collapsed_evolving` (σ(t) spreading begins). Outcome sampled via Box-Muller from N(xc, σ_particle²). Dim teal ghost of pre-measurement state retained on both panels for comparison.
- **Spreading physics**: `σ(t) = σ₀·√(1 + (t/(2σ₀²))²)` for free Gaussian; position mean drifts at prePc; momentum distribution is fixed.
- **Dynamic edu strip** cycles through 3 states:
  1. `'measure'` (bouncing): static HTML explaining de Broglie chirp and Heisenberg microscope
  2. `'measure_frozen'`: dynamic HTML generated at fire time, includes measured value and Born rule callout
  3. `'measure_evolving'`: dynamic HTML with σ(t) formula and "measurement doesn't maintain knowledge" callout

### UI/UX pass (third commit)

- **Canvas legend** drawn in lower-left of position panel (below zero-line, in Gaussian tail region): colored line samples + labels for ψ(x) real part, |ψ|², and pre-measurement ghost (last only shown in collapsed state).
- **Text sizes** increased: panel titles 12px, bracket labels 11px, status/aperture labels 10px; HTML panel font sizes increased via CSS overrides.
- **Bottom overlap fixed**: padB bumped to 44px; Δx·Δp product drawn at `height−22`, status line at `height−7`, separated by axis tick label row.
- **Precision slider label** updates contextually on measureType change: label switches between `Δx` / `Δp`; hint text swaps between `'coarse x ← → sharp x · Δp=1/(2Δx)'` and momentum equivalent. Update triggered in `setMeasureType(t)`.
- **Box walls**: subtle dashed lines at `x = ±BOUNCE_AMP` on position panel visualize the bounce boundaries.
- **Explore mode** also receives `drawBottomInfo()` status line (shape description + product).
- **`btn-restart`** styled in accent blue (distinct from teal fire button); `width:100%` on both action buttons for full-panel tap targets.

### Key code patterns established

- `measurePhase` state machine (`bouncing | collapsed_frozen | collapsed_evolving`) — `collapseT` only advances in `collapsed_evolving`
- Dynamic edu HTML via functions (`getMeasureFrozenHTML()`, `getMeasureEvolvingHTML()`) called at state transitions, not pre-authored in the `EDU` object
- `drawLegend(includeGhost)` — toggles the ghost legend entry based on phase
- `drawBottomInfo(ratio, msg)` — unified product + status renderer at canvas bottom
