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

## Session: Double-Slit Experiment

### Core sim

- **`double-slit`** — layout-c; left panel (~55%) apparatus, right panel (~45%) detection screen.
- **Apparatus panel**: animated expanding arcs from source (clipped to source region via `drawingContext.save/clip/restore`); 2D Huygens wave map in the interference region (p5.Graphics buffer, 5px grid, rebuilt on λ/d/a/whichWay change); slit barrier with top/mid/bottom fill blocks + slit-edge highlights; which-way mode shows purple detector glyph + glow line.
- **Screen panel**: accumulated dot scatter (≤3000, using `Float32Array dotYArr` + `dotXFrac` ring buffer; dots fixed in left 35% of panel); histogram (`Int32Array`, 100 bins, bars from right edge leftward); analytic theory curve (blue for interference, orange for which-way), both normalized to same `maxBarW`.
- **Physics**: Fraunhofer `I(y) = sinc²(β)·cos²(δ/2)` with `β=πay/λL, δ=2πdy/λL`. Which-way: incoherent `sinc²(β₊)+sinc²(β₋)`. 2000-bin CDF rebuilt on param change; binary-search sampling via `sampleY()`.
- **Particle mode**: `inFlight` array `[{t0, ySlit, yScreen, dur}]`; exit slit chosen proportional to single-slit amplitude at sampled y (visual only); 0.28s flight from slit to `appX1`; cap 12 emits per frame; `lastEmitT = -1` sentinel prevents burst on mode switch.
- **Three edu modes**: `waveparticle` (Tonomura), `complementarity` (V²+K²≤1, quantum eraser, delayed-choice), `math` (missing orders, HUP = diffraction envelope).
- **Which-way** resets dot/histogram/inFlight and forces CDF + wave buffer rebuild.

### Color mapping pass

- **`lambdaRGB()`**: maps `lambda ∈ [0.2, 1.0]` → HSV hue `270°→0°` (violet→blue→cyan→green→yellow→orange→red) via in-place HSV→RGB conversion. S=0.85, V=0.95.
- Applied to: source glow, expanding arcs, wave buffer pixels, in-flight particle trails, accumulated dots, histogram bars. Color computed once per call site (hoisted above loops).
- Theory curve color left as fixed blue/orange (physics indicator, not particle wavelength).
- Wave buffer rebuilt on every λ change (already tracked by `waveDirty` in `readControls()`), so the interference map recolors instantly.
- `drawBottomInfo(ratio, msg)` — unified product + status renderer at canvas bottom

## Session: Maxwell-Boltzmann Distribution (thermodynamics series #1)

### Core sim

- **`maxwell-boltzmann`** — layout-c; first thermodynamics-series sim. Two-panel canvas: left ~48% = gas chamber (square box), right ~52% = speed distribution panel. Separated by vertical divider.
- **Gas chamber**: N hard disks (radius 4px) in a square elastic-wall box. O(N²) pair collision detection each frame — feasible at N ≤ 200, 60 fps. Equal-mass elastic collision formula: `imp = (dv·dr)/|dr|²`; velocity components along line of centres exchanged; overlap separation applied. Wall reflection reverses the relevant velocity component.
- **Particle initialization**: Box-Muller transform draws `vx, vy` from Gaussian with σ = √(T/m), giving the 2D Rayleigh speed distribution at equilibrium. `doResetSpeeds()` assigns all particles speed `v_p = √(2T/m)` in random directions — the "wow" demo of equilibration from monospeed.
- **Temperature control**: T slider change → `rescaleToT(T_new)` scales all velocities by √(T_new/T_old) instantaneously. Mass or N change → full `initParticles()`. Heat/Cool buttons ±20% with clamp to [0.2, 5.0].
- **Speed histogram**: 30 bins from 0 to 4·v_rms (slider T), updated every 15 frames. Normalised to probability density `bin_count/(N·dv)`. Theory overlay: analytic 3D M-B `f(v) = 4π(m/2πT)^(3/2) v² exp(−mv²/2T)` using measured T_sim. Both scaled so theory peak = 85% panel height.
- **Characteristic speed markers**: `v_p` (purple dashed), `⟨v⟩` (blue dashed), `v_rms` (teal dashed); each toggleable via Display buttons.
- **KE readout**: `⟨KE⟩` from simulation (= T in 2D, k=1) vs `³⁄₂kT` (3D theory); shows the 2D/3D distinction with a dim annotation.
- **Click interaction**: left-click inside box kicks nearby particles (r=40px); Shift+click or right-click cools them.
- **Three edu modes**: Distribution / Equipartition / Evaporation; each calls `setSliders()` to auto-set canonical params and shows a `.param-hint-teal` block. Evaporation sets T=3.5 to emphasise the high-speed tail.
- **Thermodynamics filter chip** added to gallery `index.html`; gallery color `#3282dc → #dc3c32` (blue → red).

### Color map pass (follow-up commit)

- **Histogram bars** changed from flat teal to per-bar color matching the active particle color map (each bar samples its center speed through `particleColor()`). Creates a direct visual link between the particle chamber and the histogram.
- **Three color maps** selectable via `<select>` dropdown:
  - *Thermal* (default): blue `rgb(50,130,220)` → white `rgb(220,220,220)` → red `rgb(220,60,50)`, pivot at v_rms
  - *Blackbody*: Tanner Helland Kelvin→RGB approximation; maps speed to 1000–10000 K (dark ember → sunlight white → blue-white star). Ties visually to the `blackbody-radiation` sim.
  - *Rainbow*: HSL hue sweep 270°→0° (violet → blue → green → yellow → red), S=0.9, L=0.55. Each speed bin gets a distinct perceptually-uniform color.
- `particleColor()` is now a dispatcher calling `particleColorThermal()`, `particleColorBlackbody()`, or `particleColorRainbow()`. `kelvinToRGB()` and `hueToRGB()` are standalone helpers.
- CSS: `.colormap-select` styled to match dark theme (custom SVG chevron, var(--bg-panel) background, accent border on hover).

### Key code decisions

- Used slider T (not measured T) for histogram x-axis range and bin widths — prevents the axis from jittering while the gas equilibrates
- `imp = dot/d2` (not `dot` alone) in collision — the scalar `dot = (v1−v2)·(r2−r1)` mixes velocity and position units; dividing by d² gives the correct normal-component velocity exchange
- `T_prev` tracks the last-applied T so `rescaleToT` is idempotent when called repeatedly at the same value
