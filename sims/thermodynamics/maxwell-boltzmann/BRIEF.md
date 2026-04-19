# Maxwell-Boltzmann Distribution — Sim Brief

## Concept & educational goal

The foundational simulation of the thermodynamics series. At equilibrium, particles in
a gas don't all move at the same speed — they follow a specific probability distribution
that depends only on temperature and mass. This distribution emerges spontaneously from
random elastic collisions; no one "sets" it. Maxwell (1860) derived it from probability
theory; Boltzmann (1872) showed it was the inevitable equilibrium state of any gas.

The "wow" moments:
1. **Emergence**: the distribution builds itself from random collisions — starting from
   all particles at the same speed, within seconds the histogram matches the theory curve
2. **Temperature drag**: slide the temperature up; the whole curve shifts right and
   flattens. Speed increases, but so does the spread — hotter gases are not just faster,
   they are more disordered
3. **The tail**: a few particles always have very high speeds. That fast tail is
   evaporation — the highest-energy particles escape, carrying away kinetic energy and
   cooling the rest
4. **Three special speeds**: v_p (most probable), ⟨v⟩ (mean), v_rms (root-mean-square)
   are all distinct and all shift together with temperature, but v_rms > ⟨v⟩ > v_p
   always — the distribution is asymmetric

---

## Physics

### Maxwell-Boltzmann speed distribution (3D gas)

```
f(v) = 4π (m / 2πkT)^(3/2) · v² · exp(−mv²/2kT)
```

Three characteristic speeds:
```
v_p  = √(2kT/m)           ← most probable (peak of f(v))
⟨v⟩  = √(8kT/πm)          ← mean speed
v_rms = √(3kT/m)          ← root-mean-square speed (from equipartition)
```
Ordering: v_p < ⟨v⟩ < v_rms, with ratios 1 : √(4/π) : √(3/2) ≈ 1 : 1.13 : 1.22.

### Equipartition theorem

Each quadratic degree of freedom carries ½kT of average energy:
```
½m⟨vₓ²⟩ = ½kT    (per component)
½m⟨v²⟩  = (3/2)kT  (3D total)
KE_total = (3/2)NkT
```
This defines temperature from kinetic energy: T = (2/3) · KE_total / (Nk).

### 2D simulation note

The on-screen particle gas is 2D (velocities have x and y components only). The 2D
speed distribution is:
```
f₂D(v) = (m/kT) · v · exp(−mv²/2kT)     ← Rayleigh distribution
```
with 2D characteristic speeds v_p(2D) = √(kT/m), ⟨v⟩₂D = √(πkT/2m).
The histogram panel shows the **3D M-B curve** as the theory overlay (with T measured
from the 2D simulation via T = KE_total/Nk, the 2D equipartition definition). The shapes
are qualitatively identical; the edu strip notes the 3D curve is what applies to real gases.

### Elastic collision in 2D

For two equal-mass point particles with velocities v₁ and v₂, collision normal n̂:
```
v₁′ = v₁ − ((v₁−v₂)·n̂) n̂
v₂′ = v₂ + ((v₁−v₂)·n̂) n̂
```
Only the component along the line of centres is exchanged; transverse components unchanged.
Energy and momentum are conserved exactly.

### Recommended default parameters

| Parameter | Default | Range |
|-----------|---------|-------|
| N particles | 80 | 20 – 200 |
| T (scaled) | 1.0 | 0.2 – 5.0 |
| m (mass) | 1.0 | 0.5 – 3.0 |
| Box size | fixed | — |

At defaults with T = 1, m = 1: v_p = √2 ≈ 1.41, ⟨v⟩ ≈ 1.60, v_rms = √3 ≈ 1.73.

---

## Canvas layout (layout-c)

```
┌──────────────────────────┬────────────────────────────┬──────────┐
│  GAS CHAMBER  (~48%)     │  SPEED DISTRIBUTION (~52%) │ controls │
│  bouncing particles      │  live histogram            │  (280px) │
│  colored by speed        │  + 3D M-B theory curve     │          │
│  T readout               │  + v_p, ⟨v⟩, v_rms markers │          │
├──────────────────────────┴────────────────────────────┴──────────┤
│  Educational strip (240px)                                        │
└───────────────────────────────────────────────────────────────────┘
```

### Gas chamber panel (left ~48%)

- Square box with elastic walls (specular reflection).
- N hard disks; radius r = 4px (visual), collision detection at distance 2r.
- **Color by speed**: linear gradient blue → white → red mapped to 0 → v_rms → 2·v_rms.
  - Cold (v < 0.5·v_rms): blue `rgb(50, 130, 220)`
  - Medium (v ≈ v_rms): white `rgb(220, 220, 220)`
  - Hot (v > 1.5·v_rms): red `rgb(220, 60, 50)`
  - Interpolate smoothly between these three anchor points.
- **Temperature readout**: top-left of panel, "T = 1.00" in teal. Updates live from
  T = KE_total/Nk.
- **Particle count**: "N = 80" top-right of panel.
- Optional: clicking inside the box adds a burst of energy (kick nearby particles)
  to the area under the cursor. Right-click (or shift-click) slows them.
- **Panel title**: "Particle Gas"

### Speed distribution panel (right ~52%)

- **X-axis**: speed v, from 0 to 4·v_rms(T). Tick marks at v_p, ⟨v⟩, v_rms.
  Rescales automatically when T changes (update tick labels too).
- **Y-axis**: probability density f(v), normalized so ∫f dv = 1.
- **Live histogram**: teal filled bars `rgba(45, 215, 135, 0.4)`, teal stroke. Updated
  every 15 frames by binning all current particle speeds into 30 equal-width bins.
- **Theory curve (3D M-B)**: orange `rgb(255, 150, 50)`, 2px stroke. Drawn analytically
  at the current T. Rebuilds when T changes.
- **Characteristic speed markers** (vertical dashed lines):
  - v_p (most probable): purple `rgb(170, 65, 255)`, dashed, labeled "v_p" above.
  - ⟨v⟩ (mean): accent blue `rgb(88, 166, 255)`, dashed, labeled "⟨v⟩" above.
  - v_rms: teal `rgb(45, 215, 135)`, dashed, labeled "v_rms" above.
- **KE readout below histogram**: "⟨KE⟩ = 1.51  ←  ³⁄₂kT = 1.50" (shows equipartition
  balance; numbers from simulation vs. theory). Teal for simulation, orange for theory.
- **Panel title**: "Speed Distribution"

---

## Controls (right panel, 280px)

```
PANEL-HEADING: Gas
  N = [value]   [slider 20 – 200, step 5]
  m = [value]   [slider 0.5 – 3.0, step 0.1]

PANEL-HEADING: Temperature
  T = [value]   [slider 0.2 – 5.0, step 0.05]
  [Heat] [Cool]                ← ±20% T step buttons
  [Reset speeds]               ← re-initialise all particles at v = √(2kT/m)

PANEL-HEADING: Display
  [Show v_p] [Show ⟨v⟩] [Show v_rms]   ← toggles for markers (all on by default)

PANEL-HEADING: Explore
  [Distribution] [Equipartition] [Evaporation]
```

Notes:
- N slider: changing N re-initialises the simulation with the new particle count.
- T slider: rescale all particle speeds by √(T_new/T_old) to match the new temperature
  instantaneously; this is equivalent to a sudden heating/cooling. The histogram then
  relaxes to the equilibrium distribution quickly (a few collision times).
- [Reset speeds]: assign all particles speed v_p = √(2kT/m) in random directions.
  Observe convergence to the M-B distribution in real time (beautiful demonstration of
  equilibration).

---

## Edu panels (three modes)

### 'distribution' (default)

- Heading: "Maxwell-Boltzmann Distribution"
- In 1860, James Clerk Maxwell asked: what is the probability that a gas molecule has
  speed v? He found a bell-shaped curve skewed toward higher speeds — not because of any
  rule imposed on individual particles, but because this is the overwhelmingly most
  probable distribution of speeds that conserves total energy. Boltzmann (1872) showed
  it is the unique equilibrium distribution: any other distribution relaxes toward it
  through collisions. Temperature is just the average kinetic energy.
- Equation block: `f(v) = 4π (m/2πkT)^(3/2) v² exp(−mv²/2kT)`
- Callout: The M-B distribution explains why gas escapes from balloons slowly but hydrogen
  escapes faster than air: at 300 K, v_rms(H₂) ≈ 1930 m/s vs. v_rms(N₂) ≈ 515 m/s.
  The lighter the molecule, the higher the tail probability above escape velocity.

### 'equipartition'

- Heading: "Equipartition of Energy"
- The equipartition theorem states that every quadratic degree of freedom in a thermal
  system carries exactly ½kT of average energy. For a monatomic gas in 3D, that is 3
  translational degrees of freedom → ½m⟨v²⟩ = (3/2)kT. This is the microscopic
  definition of temperature: hotter = faster average motion.
  The theorem extends to vibrations and rotations: diatomic molecules have 5 degrees
  of freedom (3 translation + 2 rotation) → ⟨E⟩ = (5/2)kT per molecule.
  This is why different gases have different heat capacities.
- Equation block: `½m⟨v²⟩ = (3/2)kT  →  v_rms = √(3kT/m)`
- Callout: The equipartition theorem correctly predicts the heat capacity of monatomic
  ideal gases (helium, argon). It *fails* for quantum systems at low temperature —
  vibrations of diatomic molecules are "frozen out" below their quantum energy ħω.
  This failure was one of the early clues that classical physics was incomplete.

### 'evaporation'

- Heading: "Evaporation & the High-Speed Tail"
- The high-speed tail of the M-B distribution is not a curiosity — it is why liquids
  evaporate. Molecules at the surface of a liquid can escape if they have enough kinetic
  energy to overcome the intermolecular attraction. Only those in the far tail of the
  speed distribution qualify. When those high-energy molecules leave, the average
  kinetic energy of the remaining molecules *drops* — evaporation cools.
  This is why sweating works, and why blowing on hot soup cools it: the escaping
  high-speed molecules carry disproportionately more energy than the average.
- Equation block: `Γ_evap ∝ exp(−ε/kT)`  ← Arrhenius rate: rate doubles every ~10 K
- Callout: Evaporative cooling of ultracold atomic gases (2001 Nobel Prize) uses exactly
  this principle: radio-frequency "scissors" cut off the high-energy tail of a trapped
  BEC, leaving the sample progressively colder until quantum degeneracy is reached.

---

## Color language (thermodynamics series — new)

| Element | RGB | Notes |
|---------|-----|-------|
| Cold particles | (50, 130, 220) | blue |
| Hot particles | (220, 60, 50) | red |
| Medium particles | (220, 220, 220) | white |
| Speed histogram (fill) | (45, 215, 135, 100) | teal dim |
| Speed histogram (stroke) | (45, 215, 135) | teal |
| M-B theory curve | (255, 150, 50) | orange |
| v_p marker | (170, 65, 255) | purple dashed |
| ⟨v⟩ marker | (88, 166, 255) | accent blue dashed |
| v_rms marker | (45, 215, 135) | teal dashed |
| Temperature readout | (45, 215, 135) | teal |
| Box walls | (50, 65, 85) | dark blue-grey |
| Background | `background(17, 24, 32)` | |
| Axes / dividers | (30, 38, 50) | dim |

This establishes the thermo series color convention: cold=blue, hot=red, theory=orange,
distribution=teal (consistent with quantum series theory/probability coloring).

---

## Reference sims

| What to copy | From |
|---|---|
| Layout, HTML, edu strip (layout-c) | `uncertainty-principle/index.html` |
| `computeGeometry`, `EDU`, `updateEduPanel` | `uncertainty-principle/sketch.js` |
| Two-panel canvas + divider | `uncertainty-principle/sketch.js` |

---

## Gallery registration

- `SIM_SLUGS`: add `'maxwell-boltzmann'`
- `SIM_COLORS`: `'maxwell-boltzmann': 'linear-gradient(90deg, #3282dc, #dc3c32)'`
  (blue → red: cold → hot)
- `meta.json` tags: `["thermodynamics", "statistical mechanics"]`
- `difficulty`: `"beginner"` — no quantum, no complex math, very visual

---

## Implementation notes

### Particle initialisation

Place N particles randomly (no overlap check needed if N ≤ 100 and box is large
relative to particle radii). Assign speeds from a Maxwell-Boltzmann distribution using
the Box-Muller transform for velocity components:
```javascript
function initParticles() {
  for (let i = 0; i < N; i++) {
    // Draw vx, vy from Gaussian with σ = √(kT/m)
    const sigma = Math.sqrt(kT / m);
    const vx = sigma * gaussianRandom();
    const vy = sigma * gaussianRandom();
    particles[i] = { x: ..., y: ..., vx, vy };
  }
}
function gaussianRandom() {
  // Box-Muller
  const u1 = Math.random(), u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
```

### Collision detection

Simple O(N²) pair checking each frame is fine for N ≤ 200 at 60 fps.
Detect overlap: `dist(p1, p2) < 2r`. If overlapping and approaching (dot product
check), apply elastic collision formula and separate particles by the overlap distance
to prevent sticking.

### Wall reflections

Reverse vx when particle hits left/right wall; reverse vy for top/bottom.
Apply at boundary: `if (x - r < 0) { x = r; vx = Math.abs(vx); }`

### Temperature control via speed rescaling

When T slider changes from T_old to T_new, rescale all velocities:
```javascript
const scale = Math.sqrt(T_new / T_old);
particles.forEach(p => { p.vx *= scale; p.vy *= scale; });
```
This instantaneously resets the kinetic energy but leaves the velocity *directions*
unchanged, so the distribution shape relaxes to equilibrium over the next ~N collision
times (usually < 1 second at simulation speed).

### Histogram update

Every 15 frames, bin all `v = sqrt(vx²+vy²)` values into 30 bins from 0 to 4·v_rms.
Normalize to probability density (bin_count / (N · Δv)). Draw bars.

### Theory curve normalisation

The theory curve f(v) is normalized to ∫f dv = 1 (analytical). Scale to match the
histogram normalisation (same y-axis units).

---

## Optional extensions

- **Heavy/light gas mix**: add a second particle type with different mass m₂; show how
  the two overlapping M-B curves have different peak positions. The lighter gas always
  has a higher tail — demonstrates mass-dependence of escape rates.
- **1D / 2D / 3D selector**: toggle between f₁D(v) ∝ exp(−mv²/2kT),
  f₂D(v) ∝ v·exp(−mv²/2kT), and f₃D(v) ∝ v²·exp(−mv²/2kT). Shows how dimensionality
  shifts the distribution peak.
- **Entropy live readout**: display S = k ln W (Boltzmann entropy) estimated from the
  velocity histogram, as a preview of the entropy-microstates sim.
