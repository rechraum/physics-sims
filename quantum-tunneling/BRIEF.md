# Quantum Tunneling — Sim Brief

## Concept & educational goal

Demonstrate that a quantum particle can pass through a potential barrier even when its
energy is *less* than the barrier height — a result that has no classical analogue. The
same particle classically would be 100% reflected.

The "wow" moments:
1. **Evanescent tail**: the wave function is non-zero *inside* the classically forbidden
   region; it decays exponentially rather than being zero, so a thin-enough barrier leaks
2. **Smooth transmission**: T rises continuously from ~0 to 1 as E increases through V₀;
   there is no sharp classical cutoff
3. **Above-barrier resonance**: for E > V₀, T oscillates and hits T = 1 at specific
   energies (constructive interference of reflections inside the barrier) — a result that
   is also non-classical
4. **Exponential sensitivity**: doubling the barrier width squares the suppression — users
   can watch T collapse to near-zero just by dragging the width slider

---

## Physics (natural units: ħ = 1, 2m = 1 → k = √E)

### Rectangular barrier, analytic solution

Barrier at x = 0 to x = L, height V₀. Particle energy E.

```
Region 1 (x < 0):     ψ₁ = A·e^{ikx} + B·e^{-ikx}     k  = √E
Region 2 (0 < x < L): ψ₂ = C·e^{+ux} + D·e^{-ux}      u  = √(V₀−E)  [E < V₀]
                            C·e^{iqx} + D·e^{-iqx}      q  = √(E−V₀)  [E > V₀]
Region 3 (x > L):     ψ₃ = F·e^{ikx}                   (transmitted only)
```

Set **F = 1** and solve boundary conditions at x = 0 and x = L backwards to find A, B,
C, D. Normalize display amplitude by dividing by |A|, so the incident wave always has
unit amplitude.

```
Transmission:   T = 1 / |A|²
Reflection:     R = |B/A|²    (verify T + R = 1)
```

**E < V₀ (below barrier) — evanescent tunneling:**

```
T = 1 / [ 1 + (k² + u²)² · sinh²(uL) / (4k²u²) ]
```

At small T (thick/tall barrier): T ≈ 16k²u²/(k²+u²)² · e^{−2uL} — exponential in L.

**E > V₀ (above barrier) — resonance:**

```
T = 1 / [ 1 + (k² − q²)² · sin²(qL) / (4k²q²) ]
```

T = 1 (perfect transmission) when sin(qL) = 0, i.e. qL = nπ — these are the resonance
peaks. Fringe spacing in E is ΔE = π²/(2mL²) = π²/L² (with 2m=1).

**Connection to prior sims:**
- Double-slit barrier width a → slit position uncertainty Δy ≈ a; similarly, barrier
  width L → position uncertainty Δx inside barrier; by HUP, Δp ≥ 1/(2L), meaning the
  particle's momentum uncertainty can "reach" the other side if L is small enough.
- The resonance condition qL = nπ is identical to the particle-in-a-box quantization
  condition — the barrier acts as a finite well and supports quasi-bound states.

### Recommended default parameters

| Parameter | Default | Range | Notes |
|-----------|---------|-------|-------|
| V₀ | 1.0 | fixed display, adjustable | barrier height |
| E | 0.6 | 0.05 – 1.95 | in units of V₀ = 1; default below barrier |
| L | 2.0 | 0.5 – 5.0 | barrier width |
| x display | [-8, L+8] | fixed | 8 units of free space each side |

At defaults (E=0.6V₀, L=2): T ≈ 0.04 — visible but small transmission; clearly below
barrier. Moving E → 0.9V₀ gives T ≈ 0.3. At E = V₀ exactly, T = 1/(1 + L²/4) ≈ 0.5.

---

## Canvas layout (layout-c)

```
┌─────────────────────────────────────────┬────────────────────┬──────────┐
│  WAVE FUNCTION  (~58%)                  │  TRANSMISSION (~42%)│ controls │
│  animated ψ(x,t) + |ψ|² + barrier      │  T(E) curve        │  (280px) │
│                                         │  quantum + classical│          │
├─────────────────────────────────────────┴────────────────────┴──────────┤
│  Educational strip (240px)                                                │
└───────────────────────────────────────────────────────────────────────────┘
```

### Wave function panel (left ~58% of canvas)

X-axis = position x. Y-axis = amplitude ψ.

- **Barrier**: filled rectangle from x=0 to x=L spanning the full panel height. Color:
  `(40, 52, 68)` — dark slate, distinct from background `(17, 24, 32)`. Top-edge label
  "V₀" and bottom-edge label showing current T value.
- **Classically forbidden overlay** (E < V₀ only): a dim purple tint
  `rgba(170, 65, 255, 18)` over the barrier region to signal the forbidden zone.
- **|ψ(x)|² probability density**: teal filled area `rgba(45, 215, 135, 35)` with
  teal stroke `rgba(45, 215, 135, 180)`, drawn continuously across all three regions.
  This is the key visual — observe amplitude 1+R interference pattern left of barrier,
  exponential decay inside (E < V₀), and flat T plateau on the right.
- **Re[ψ(x,t)]**: animated blue curve `rgb(88, 166, 255)`, 1.5px stroke. Time evolution
  via phase factor e^{−iωt} (ω = E) computed analytically per-frame. This makes the
  incident wave visually travel rightward, reflected wave leftward, and shows the
  evanescent tail oscillate in place with decaying amplitude. Cap animation speed at
  a fixed visual frequency (not proportional to E — just use `frameCount * 0.04` for
  the time variable) so the wave is always legible.
- **Incident / reflected / transmitted region labels**: small dim text in each region
  above the wavefunction. "incident + reflected", "evanescent" (E < V₀) or "partial
  wave" (E > V₀), "transmitted".
- **Classical turning-point markers**: dim vertical dashes at x=0 and x=L in orange
  `rgb(255, 150, 50)`, only visible when E < V₀.
- **Y-axis zero line**: `stroke(30, 38, 50); strokeWeight(1)`.
- **Panel title**: "Wave function — T = [value]  R = [value]"

### Transmission panel (right ~42% of canvas)

X-axis = E/V₀ (0 to ~2). Y-axis = T (0 to 1).

- **Quantum T(E) curve**: teal `rgb(45, 215, 135)`, 2px stroke. Computed over 500
  points. Shows the smooth rise below V₀ and oscillatory resonances above.
- **Classical step**: orange `rgb(255, 150, 50)`, 2px stroke, dashed. T=0 for E<V₀,
  T=1 for E≥V₀. Drawn as two horizontal segments with a vertical jump at E=V₀.
- **Current E marker**: vertical accent-blue line `rgb(88, 166, 255)`, 1px, at the
  current E/V₀ position. Horizontal dot on the quantum curve at the current T value.
- **Resonance tick marks**: tiny teal ticks on the x-axis at each resonance energy
  E_n = V₀ + (nπ/L)² for n=1,2,3,… that fall within the display range.
- **V₀ line**: vertical dim dashed line at E/V₀ = 1 separating the sub- and
  above-barrier regions. Label "V₀" at top.
- **Axes**: T=0 baseline, T=1 ceiling, E/V₀ labels at 0, 0.5, 1.0, 1.5, 2.0.
- **Panel title**: "Transmission T(E)"

### Vertical divider

`stroke(30, 38, 50); strokeWeight(1)` between panels.

---

## Controls (right panel, 280px)

```
PANEL-HEADING: Energy
  E/V₀ = [value]  [slider 0.05 – 1.95, step 0.01]
  readout: "T = [value]  R = [value]"

PANEL-HEADING: Barrier
  L = [value]  [slider 0.5 – 5.0, step 0.1]   ← width
  V₀ = [value] [slider 0.5 – 3.0, step 0.1]   ← height (rescales E/V₀ range)

PANEL-HEADING: Display
  [ψ(x)] [|ψ|²] [Both]                         ← wave function display toggle
  [▶ Animate] / [⏸ Pause]                       ← time animation toggle

PANEL-HEADING: Compare
  [Quantum] [Classical] [Both]                  ← T(E) panel display mode

PANEL-HEADING: Explore
  [Evanescent] [Resonance] [Applications]       ← edu strip mode
```

Notes:
- The **T and R readout** updates live — this is the key quantitative output.
- When **Classical** is selected in Compare, the T(E) panel draws only the step function
  and the current-E marker shows T=0 or T=1; the wave function panel still shows the
  quantum wavefunction (always interesting to contrast).
- When **Both** is selected, both curves show simultaneously (quantum full opacity,
  classical 75% alpha or dashed).

---

## Edu panels (three modes)

### 'evanescent' (default)

- Heading: "Quantum Tunneling"
- Below the barrier, the Schrödinger equation yields exponentially decaying solutions
  inside the barrier — the *evanescent* wave. Unlike classical mechanics (T = 0), the
  wave function leaks through, and if the barrier is thin enough, a particle emerges on
  the other side. This is not energy conservation violation: the particle is never
  "inside" the barrier in a localized sense — the wave function simply extends through.
- Equation block: `T ≈ e^{−2uL} · prefactor,  u = √(V₀−E)`
- Callout: Alpha decay (Gamow 1928) — the first application of tunneling. An α particle
  is confined in a nucleus by the strong force but tunnels through the Coulomb barrier.
  Half-lives spanning 10⁻⁷ s to 10¹⁷ years are explained by the exponential factor alone.

### 'resonance'

- Heading: "Above-Barrier Resonance"
- For E > V₀, the particle is classically free to pass — yet T is not always 1. The
  barrier acts as a partial reflector on both faces, and reflections from x=0 and x=L
  interfere. When the barrier width is exactly a half-integer number of wavelengths
  (qL = nπ), the reflections cancel and T = 1 exactly. This is the quantum analog of
  the Fabry-Pérot etalon in optics.
- Equation block: `T = 1  when  qL = nπ,  q = √(E−V₀)`
- Callout: Ramsauer-Townsend effect (1921) — anomalously high transmission of slow
  electrons through noble-gas atoms. The atom's potential well acts as the "barrier" and
  electrons at the resonance energy pass through almost without scattering. First
  experimental confirmation of wave mechanics for material particles.

### 'applications'

- Heading: "Tunneling in Technology & Nature"
- Tunneling is not a curiosity — it underlies:
  - **STM** (Binnig & Rohrer, Nobel 1986): tip-sample tunnel current ∝ e^{−2κd} is
    exponentially sensitive to tip height d; sub-ångström vertical resolution.
  - **Flash memory / NAND**: electrons tunnel through a thin oxide (~10 nm) under
    an applied field (Fowler-Nordheim tunneling) to charge the floating gate.
  - **Nuclear fusion in stars**: proton-proton fusion in the Sun occurs at temperatures
    too low to classically overcome the Coulomb barrier — tunneling closes the gap.
  - **Josephson junction**: Cooper pairs tunnel between two superconductors; the
    oscillation frequency is f = 2eV/h, used in the most precise voltage standards.
- Equation block: `T_STM ∝ exp(−2d√(2mφ)/ħ)` where φ = work function
- Callout: In an STM, a 1 Å change in tip height changes the tunnel current by ~10×.

---

## Color language (continues quantum series)

| Element | RGB | Notes |
|---------|-----|-------|
| Re[ψ(x,t)] animated curve | (88, 166, 255) | accent blue |
| \|ψ\|² fill | (45, 215, 135, 35) | teal, dim |
| \|ψ\|² stroke | (45, 215, 135, 180) | teal |
| Quantum T(E) curve | (45, 215, 135) | teal |
| Classical T(E) | (255, 150, 50) | orange |
| Current-E marker | (88, 166, 255) | accent blue |
| Barrier fill | (40, 52, 68) | dark slate |
| Forbidden-zone tint | (170, 65, 255, 18) | purple, very dim |
| Classical turning-point lines | (255, 150, 50) | orange dashed |
| Background | `background(17, 24, 32)` | |
| Axes / dividers | (30, 38, 50) | dim |

---

## Reference sims

| What to copy | From |
|---|---|
| Layout, HTML structure, edu strip pattern | `uncertainty-principle/index.html` |
| `computeGeometry`, `EDU`, `updateEduPanel` | `uncertainty-principle/sketch.js` |
| Two-panel canvas + divider | `uncertainty-principle/sketch.js` |
| Dual-model plot (quantum vs classical) | `photoelectric-effect/sketch.js` |
| Color conventions | any quantum sim |

---

## Gallery registration

- `SIM_SLUGS`: add `'quantum-tunneling'`
- `SIM_COLORS`: `'quantum-tunneling': 'linear-gradient(90deg, #58a6ff, #a855f7)'`
  (blue → purple, forbidden-zone palette)

---

## Implementation notes

### Analytic wave function (fast, exact — no FFT or finite-difference needed)

Compute the complex coefficients A, B, C, D, F analytically from boundary conditions.
Set F = 1, then work backward from x = L to x = 0. All arithmetic is 2D real (store
complex numbers as `{re, im}` pairs). Recompute only when E, V₀, or L changes.

```
// E < V₀:  u = sqrt(V₀ - E),  ψ₂ = Ce^{ux} + De^{-ux}
// E > V₀:  q = sqrt(E - V₀),  ψ₂ = Ce^{iqx} + De^{-iqx}  (treat u = iq)
// In both cases, use the same complex arithmetic; e^{iuL} handles both.
```

At each display x-point per frame:
```
if x < 0:         ψ = A·e^{ikx+iωt_vis} + B·e^{-ikx-iωt_vis}   [Re part only]
if 0 ≤ x ≤ L:    ψ = C·e^{ux-iωt_vis} + D·e^{-ux-iωt_vis}      [evanescent: real ×cos]
if x > L:         ψ = F·e^{ikx-iωt_vis}                          [Re part only]
```

where `t_vis = frameCount * 0.04` — a fixed visual time variable independent of E,
so the wave speed doesn't vary wildly as E changes.

Normalize all amplitudes by dividing by `|A|` so incident amplitude = 1.

### T(E) curve

Precompute 500-point T(E) array from E=0 to 2·V₀ whenever L or V₀ changes. Store as
a Float32Array. Rebuild via `tCurveDirty` flag. Draw directly from the array — no
per-frame recomputation.

### State & dirty flags

```javascript
let E = 0.6, V₀ = 1.0, L = 2.0;
let coeff = {};            // {A, B, C, D, F, T, R, k, u} — rebuilt on E/V₀/L change
let coeffDirty = true;
let tCurve = new Float32Array(500);
let tCurveDirty = true;    // rebuilt on L or V₀ change only
let animating = true;
let tVis = 0;              // visual time, advances each frame when animating=true
let displayWave = 'both';  // 'psi' | 'prob' | 'both'
let compareMode = 'both';  // 'quantum' | 'classical' | 'both'
```

### Edge case: E very close to V₀

At E = V₀ exactly, u → 0 and the `sinh(uL)/uL → 1` limit applies:
`T(E=V₀) = 1 / (1 + L²/4)`. Handle the `u < 1e-6` case explicitly in the T formula
to avoid division-by-zero.

### Performance

- `buildCoeff()`: ~10 arithmetic ops — essentially free; call every time E/V₀/L changes.
- `buildTCurve()`: 500 iterations × ~10 ops ≈ fast; call only on L or V₀ change.
- `draw()`: ~400 x-points for wave function, each ~5 trig ops ≈ ~2000 ops/frame. Fine.

---

## Optional extensions (implement if time permits)

- **Wave packet mode**: launch a Gaussian wave packet `ψ(x,0) ∝ e^{ik₀x−(x−x₀)²/4σ²}`
  and evolve it in time. Can be done analytically by superposing plane-wave solutions
  weighted by a Gaussian envelope in k-space: `ψ(x,t) = ∫ g(k)·ψ_k(x)·e^{−iEt} dk`
  sampled at ~200 k-values. Shows the wave packet splitting into reflected + transmitted
  pulses, and the transmitted pulse emerging delayed and attenuated.
- **Finite well**: toggle to `V₀ < 0` (potential well instead of barrier) — shows bound
  state resonances, connecting to particle-in-a-box. Same formulas apply with V₀ < 0.
- **Step potential** (L → ∞): an infinitely thick barrier; T → 0 for E < V₀ and the
  above-barrier oscillations vanish. Shows the smooth quantum transition vs classical step.

---

## Future UX improvements (backlog)

- **Decay-length annotation**: when E < V₀, draw a small horizontal bracket inside the
  barrier spanning one decay length 1/u = 1/√(V₀−E) from the left face, labeled "1/u".
  Makes the exponential sensitivity to u immediately visible.
- **de Broglie wavelength annotation**: draw a small horizontal bracket on the left side
  of the wave panel spanning one wavelength λ = 2π/k, labeled "λ = 2π/k". Connects
  wave oscillations to the energy readout.
- **Amplitude labels**: annotate the wave panel with small teal labels "T" (transmitted
  flat region) and "1+R" (interference envelope peak) so users can read off the values
  directly from the |ψ|² shape.
- **Phase display mode**: add a "Phase" toggle to show arg(ψ(x)) as a background heatmap
  or a wrapped polar indicator per region, revealing the evanescent region's pure-imaginary
  character vs the oscillatory phase advance outside.
- **T annotation on T(E) curve**: when hovering near the current E marker, show a small
  T = value tooltip next to the dot on the T(E) curve (in addition to the HTML readout).
- **Resonance number label**: for each resonance tick on the T(E) x-axis, show a tiny
  "n=1", "n=2"… label so users can count and predict the resonance positions.
- **Preset buttons**: "Thin barrier (L=0.5)", "Strong suppression (L=4)", "At resonance"
  quick-set buttons to jump to illustrative parameter combinations.
- **Energy color map**: already implemented (blue→purple→orange as E/V₀ goes 0→1→2);
  consider also applying the color to the barrier top-edge indicator or the T-panel
  current-E column background tint to reinforce the regime encoding.
