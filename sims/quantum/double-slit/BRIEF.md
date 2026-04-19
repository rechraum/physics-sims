# Double-Slit Experiment — Sim Brief

## Concept & educational goal

Demonstrate wave-particle duality through the canonical double-slit experiment.
Single particles (photons or electrons) are fired one at a time; each lands as a
single dot, yet the accumulated pattern reveals interference fringes that could
only arise from a wave passing through **both** slits simultaneously.

The "wow" moments:
1. **Buildup**: dots appear random, then the fringe pattern emerges from the noise
2. **Which-way**: one click activates a "which-slit" detector — the fringes
   instantly collapse into two featureless blobs
3. **Sliders drive the fringes**: changing λ, d, or a updates the pattern in real
   time, and the intensity-profile panel shows the match between theory and
   accumulated data

---

## Physics (natural units: λ, d, a, L all in the same length unit)

### Fraunhofer (far-field) intensity

```
I(y) = I₀ · sinc²(β) · cos²(δ/2)

β = π·a·y / (λ·L)          — single-slit phase parameter
δ = 2π·d·y / (λ·L)         — double-slit path-difference phase
sinc(x) = sin(x)/x          — note: sinc(0) = 1
```

- **Fringe positions (bright):** y_m = m·λ·L/d (m = 0, ±1, ±2, …)
- **Diffraction envelope zeros:** y_m = m·λ·L/a (m = ±1, ±2, …)
- **Missing orders:** when d/a is an integer, an interference maximum coincides
  with a diffraction zero and the fringe vanishes. Slider defaults that expose
  this: d=2.0, a=0.5 → d/a=4, so every 4th fringe disappears.

### Which-way (incoherent sum)

When the which-slit detector is on, the two slits contribute independently
(no cross-term):

```
I_ww(y) = sinc²(β₊) + sinc²(β₋)
β₊ = π·a·(y − d/2) / (λ·L)
β₋ = π·a·(y + d/2) / (λ·L)
```

This is two separate single-slit diffraction blobs, one centred on each slit's
geometric shadow. The coherent cos² term is absent.

### Particle-by-particle accumulation

Sample screen coordinate y from the normalised distribution I(y)/∫I(y)dy
using the precomputed CDF (build once per parameter change via O(N) scan,
N ≈ 2000 bins). Each sample produces one dot.

### Recommended default parameters

| Parameter | Default | Range | Notes |
|-----------|---------|-------|-------|
| λ | 0.50 | 0.2 – 1.0 | visible ~3–7 fringes at defaults |
| d | 2.0 | 0.5 – 4.0 | slit centre-to-centre |
| a | 0.5 | 0.1 – 1.0 | individual slit width |
| L | 4.0 | fixed | slit-to-screen distance |
| Screen y | ±5 | fixed | display range |

At defaults: fringe spacing = λL/d = 1.0 unit; 5 fringes visible each side.
First diffraction zero at y = λL/a = 4.0 → visible envelope falloff.

---

## Canvas layout (layout-c)

```
┌──────────────────────────────────────┬────────────────────┬──────────┐
│  APPARATUS  (~55%)                   │  SCREEN  (~45%)    │ controls │
│  source → slits → wave propagation  │  accumulated hits  │  (280px) │
│                                      │  + theory curve    │          │
├──────────────────────────────────────┴────────────────────┴──────────┤
│  Educational strip (240px)                                             │
└────────────────────────────────────────────────────────────────────────┘
```

### Apparatus panel (left ~55% of canvas)

Horizontal layout (X = distance from source, Y = transverse position):

- **Source**: glowing dot at left edge (`x = 0`); in wave mode, show concentric
  arcs expanding right; in particle mode, emit a small bright particle dot on
  each fire event
- **Slit barrier**: vertical dark rectangle centered at `x = L/3`; two gaps of
  height `a`, centres at `y = ±d/2`. Barrier drawn in `(50, 65, 85)`.
- **Interference region** (`x > slit barrier`): in wave mode, draw the
  2D intensity map `I(x,y)` using two Huygens sources at each slit centre.
  Each pixel colored by intensity:
  - High: teal `(45, 215, 135)` — constructive
  - Zero: background `(17, 24, 32)` — destructive
  - Blend: intermediate teal, scaled by local `I/I₀`
- **Particle flight** (particle mode): when a particle fires, animate a brief
  glowing dot traveling from the slit it "exits" to the right edge of this
  panel, arriving at the sampled y position. Duration ≈ 0.25s. Colour:
  accent blue `(88, 166, 255)`.
- **Panel title**: "Wave propagation" (wave mode) / "Particle paths" (particle mode)

The particle's exit slit in particle mode: randomly assign slit 1 or slit 2
with probability proportional to the single-slit amplitude at the sampled y.
(This is a visual choice only — the physics is encoded in the full I(y) sample.)

### Screen panel (right ~45% of canvas)

Y-axis = screen position (same physical scale as apparatus panel Y-axis).
X-axis = intensity / normalised hit count (horizontal bars).

- **Accumulated dots**: draw each detected particle as a dim teal dot (`rgba(45,215,135,120)`, 2px radius) at its y position. Stack dots leftward from the right edge, or scatter them in a narrow band. Max 3000 dots; after that, continue accumulating into the histogram only.
- **Histogram**: teal filled bars, bin height proportional to hit count, drawn from right edge leftward.
- **Theory curve**: accent blue `(88, 166, 255)`, 2px stroke, drawn as a smooth I(y) curve normalised to match histogram scale.
- **Which-way**: theory curve switches to orange `(255, 150, 50)`, dashed; shows two-blob pattern.
- **Panel title**: "Detection screen — N = [count] particles"
- **Vertical zero-line**: divides screen panel at y=0.

### Vertical divider

Between panels: `stroke(30, 38, 50); strokeWeight(1)`

---

## Controls (right panel, 280px)

```
PANEL-HEADING: Particle
  λ = [value]  [slider 0.2 – 1.0, step 0.02]

PANEL-HEADING: Slits
  d = [value]  [slider 0.5 – 4.0, step 0.1]   ← separation
  a = [value]  [slider 0.1 – 1.0, step 0.05]  ← width

PANEL-HEADING: Simulation
  [Wave] [Particle]                            ← display mode btns
  Speed  [slider 1 – 200 particles/s]          ← particle mode only
  [Clear] button

PANEL-HEADING: Which-Way
  [Off] [On]                                   ← which-slit detector
  Hint: "Measuring which slit destroys interference"

PANEL-HEADING: Explore
  [Wave-Particle] [Complementarity] [Math]     ← edu strip mode
```

---

## Edu panels (three modes)

### 'waveparticle' (default)

- Heading: "Wave-Particle Duality"
- Each particle arrives as a single dot (particle) but the pattern builds up
  as an interference fringe (wave). The particle interferes with itself.
- This experiment, done with single electrons (Tonomura 1989), is routinely
  voted the "most beautiful experiment in physics."
- Equation block: `I(y) = I₀ · sinc²(β) · cos²(δ/2)`
- Callout: Tonomura electron double-slit; single-photon experiments; neutron
  interference (ILL Grenoble)

### 'complementarity'

- Heading: "Complementarity & Which-Way"
- Bohr's complementarity principle: path information (which slit) and
  interference are mutually exclusive. Any measurement that tells you which
  slit the particle used — however gentle — destroys the fringes.
- Equation block: `V² + K² ≤ 1` (visibility V and which-way knowledge K)
- Callout: quantum eraser experiments (Scully & Drühl 1982); Aspect's loop-hole-
  free Bell tests; Wheeler's delayed-choice experiment

### 'math'

- Heading: "The Double-Slit Formula"
- I(y) factorises into single-slit envelope × double-slit interference.
  Shows why missing orders occur (d/a = integer).
- Equation: `I = I₀ · sinc²(πa·y/λL) · cos²(πd·y/λL)`
- Link to uncertainty principle: slit width `a` → position uncertainty `Δy ≈ a`;
  by HUP, `Δp_y ≥ ħ/(2a)`, which is exactly the half-width of the diffraction
  envelope `λ/a`. The diffraction envelope IS the uncertainty principle in action.
- Callout: This is why the slits in the Uncertainty Principle sim produced
  fringes in momentum space — same physics, same formula.

---

## Color language (matches quantum series)

| Element | RGB | Notes |
|---------|-----|-------|
| Particle in flight | (88, 166, 255) | accent blue |
| Constructive region / histogram | (45, 215, 135) | teal |
| Detected dot | (45, 215, 135, 120) | teal, dim |
| Theory curve (interference) | (88, 166, 255) | accent blue |
| Theory curve (which-way) | (255, 150, 50) | orange |
| Which-way indicator | (170, 65, 255) | purple |
| Slit barrier | (50, 65, 85) | dark blue-grey |
| Background | `background(17, 24, 32)` | |
| Axes / dividers | (30, 38, 50) | dim |

---

## Reference sims

| What to copy | From |
|---|---|
| Layout, HTML structure | `uncertainty-principle/index.html` |
| `computeGeometry`, `EDU`, `updateEduPanel` pattern | `uncertainty-principle/sketch.js` |
| Two-panel canvas split + divider | `uncertainty-principle/sketch.js` |
| Circular wave visualization (two sources) | `wave-interference/sketch.js` |
| Color conventions | any quantum sim |

---

## Gallery registration

- `SIM_SLUGS`: add `'double-slit'`
- `SIM_COLORS`: `'double-slit': 'linear-gradient(90deg, #2de2c0, #58a6ff)'`
  (teal → blue, wave-particle duality)

---

## Implementation notes

- **CDF sampling**: precompute a 2000-bin CDF array of I(y) on every parameter
  change; sample by binary search on Math.random(). Rebuild only when λ, d, a,
  or which-way state changes — not every frame.
- **Apparatus wave map**: sample on a coarse grid (4px × 4px pixels) each frame
  using `I_apparatus(x,y) = |A₁e^{iφ₁} + A₂e^{iφ₂}|²` where phases are computed
  from path lengths to each slit. Cache the grid as a p5.Graphics buffer and
  redraw only on parameter change.
- **Particle flight animation**: maintain an array of in-flight particles
  `{t0, ySlit, yScreen, slitSide}`. Each frame advance `t = now - t0`; draw at
  `lerp(xSlit, xScreen, t/0.25)`. Remove when `t > 0.25s`.
- **Dot accumulation**: store detected y-positions as a Float32Array (ring buffer,
  max 3000). Draw each dot once at detection; after ring wraps, redraw all dots
  from the array every frame (fast, ~3000 × 2px circles).
- **Missing-orders indicator**: when `round(d/a)` is integer and a slit-a slider
  moves, briefly flash a purple label "⚠ missing order at n=±[d/a]".
- **Performance**: wave map (if expensive) can be replaced with a prerendered
  `p5.Graphics` updated only on param change, not every frame.

---

## Optional extensions (implement if time permits)

- **Partial which-way**: a slider from 0→1 controlling the "detector strength";
  interpolates between full interference and full which-way pattern. Demonstrates
  continuous complementarity.
- **Single vs. double slit toggle**: button to block one slit — removes the
  cos² factor, leaving just the sinc² envelope.
- **Particle count statistics**: show a small χ² or Pearson r between histogram
  and theory curve as it converges.
