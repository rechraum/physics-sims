# Entropy & Microstates — Sim Brief

## Concept & educational goal

Boltzmann's great insight: entropy is not a vague measure of "disorder" — it is a precise
count of possibilities. S = k ln W, where W is the number of distinct microscopic
configurations (microstates) that produce the same observable state (macrostate). The
second law is not a fundamental law; it is statistics. High-entropy states are simply
more probable because there are vastly more microstates compatible with them.

This sim makes that counting concrete and visual. Particles occupy cells in a grid;
W is computed exactly; entropy is watched growing and plateauing in real time.

The "wow" moments:
1. **W explodes on expansion**: release particles from a corner into the full grid —
   W jumps by a factor of (M_new/M_old)^N and entropy leaps discontinuously upward
2. **Spontaneous return is impossible**: with N = 30 particles and M = 16 cells, the
   probability of all particles spontaneously returning to one cell is
   W_corner/W_total = 16^(−30) ≈ 10^(−36). The sim counts how long you'd expect to
   wait: the age of the universe is ~4 × 10¹⁷ seconds.
3. **The equilibrium is everywhere**: at equilibrium, the system visits a new
   microstate every step; almost all of them look roughly the same (evenly distributed)
   because there are so many more even-distribution microstates than bunched ones
4. **Stirling visualised**: for large N, ln(N!) ≈ N ln N − N — watch the approximation
   converge as you increase N

---

## Physics

### Boltzmann entropy

For N distinguishable particles distributed among M equal cells with nᵢ particles
in cell i (Σnᵢ = N):
```
W = N! / (n₁! · n₂! · … · nₘ!)     ← multinomial coefficient
S = k ln W
```
At equilibrium (nᵢ = N/M for all i, i.e. uniform distribution):
```
W_eq ≈ M^N / (N/M)!^M  →  ln W_eq ≈ N ln M   (for large N, equal cells)
S_eq = kN ln M
```

### Irreversibility from counting

The probability of finding all N particles in one specific cell (microstate "all in
corner") vs. finding them anywhere:
```
P(all in cell 1) = 1/M^N
```
For N = 30, M = 16:  P = 16^(−30) ≈ 10^(−36)

At one microstate visit per simulation step (e.g., 30 steps/second):
```
Expected wait time = M^N / rate = 16^30 / 30 ≈ 3 × 10^34 seconds
                                                ≈ 7 × 10^23 times the age of the universe
```

### Expansion entropy jump

When the accessible volume doubles (M → 2M) with N particles:
```
ΔS = Nk ln(2M/M) = Nk ln 2
```
For N = 30: ΔS = 30k ln 2 ≈ 20.8k. This is a discrete, abrupt increase — the system
instantly has access to 2^30 ≈ 10^9 times more microstates.

### Stirling's approximation

```
ln(N!) ≈ N ln N − N     for N >> 1
```
Error < 1% for N ≥ 20. For small N (N ≤ 10), compute exact factorials.

### Recommended default parameters

| Parameter | Default | Range |
|-----------|---------|-------|
| N particles | 20 | 5 – 60 |
| M cells | 16 (4×4 grid) | 4, 8, 16, 32 |
| Steps/second | 15 | 1 – 60 |
| Initial state | all in top-left | — |

At defaults (N=20, M=16): S_eq = 20k ln 16 = 80k ln 2 ≈ 55.5k. W_eq ≈ 2^80 ≈ 10^24.

---

## Canvas layout (layout-c)

```
┌────────────────────────────────┬──────────────────────────┬──────────┐
│  MICROSTATE GRID  (~50%)       │  ENTROPY PLOT  (~50%)    │ controls │
│  M-cell grid + N particles     │  S(t) time trace         │  (280px) │
│  W display                     │  + W(t) log scale        │          │
│  S = k ln W display            │  + S_eq reference        │          │
├────────────────────────────────┴──────────────────────────┴──────────┤
│  Educational strip (240px)                                             │
└────────────────────────────────────────────────────────────────────────┘
```

### Microstate grid panel (left ~50%)

- Grid of M cells. Default 4×4 = 16 cells; 2×2, 2×4, 4×8 options available.
- Each cell is a rounded rectangle with a subtle border `(30, 38, 50)`.
- **Particle dots**: each particle is a small filled circle (radius 5–6px, smaller for
  larger N). Colors: 8 distinct saturated hues, cycling (so particles in the same cell
  are distinguishable by color).
- **Cell occupancy tint**: cells with more particles have a brighter teal background
  tint `rgba(45, 215, 135, n_i/N × 0.5)`. Empty cells are dark.
- **Macrostate label**: in each cell, show the particle count n_i in small grey text.
  Omit if cell is empty.

**Large readout below the grid:**
- "W = 1.26 × 10¹²" — computed exactly for small N, Stirling approx for N > 25.
  Color: teal.
- "S = 28.4 k" — displayed in teal, below W.
- When W = 1 (all particles in one cell): "S = 0 — minimum entropy" displayed in
  orange, cell glows orange.
- When S ≈ S_eq: "S ≈ S_eq — equilibrium" displayed in teal.

**Panel title**: "Microstate Grid — N = [N], M = [M]"

### Entropy plot panel (right ~50%)

Two traces stacked (split ~55% / 45%):

**Upper trace — S(t):**
- X-axis: time (last 300 steps shown, scrolling).
- Y-axis: S in units of k. Range 0 to S_eq × 1.1.
- **S(t) trace**: teal line, 1.5px. Running history.
- **S_eq reference**: orange dashed horizontal line at S_eq = kN ln M. Labeled "S_eq".
- **S = 0 line**: dim grey at y = 0.
- After an [Expand] event, S_eq jumps to a new (higher) value; draw the new reference
  line and annotate "Expanded: ΔS = Nk ln 2".
- **Panel title**: "S(t)"

**Lower trace — W(t):**
- X-axis: same time window.
- Y-axis: log₁₀(W). Range 0 to log₁₀(W_eq) × 1.1.
- **W(t) trace**: accent blue `rgb(88, 166, 255)`, 1.5px.
- **W_eq reference**: orange dashed. Labeled "W_eq".
- **Panel title**: "log₁₀(W) — counting microstates"

### Vertical divider

`stroke(30, 38, 50); strokeWeight(1)` between panels.

---

## Controls (right panel, 280px)

```
PANEL-HEADING: System
  N = [value]   [slider 5 – 60, step 1]
  M cells       [select: 4 | 8 | 16 | 32]

PANEL-HEADING: Initial State
  [Reset: all in corner]     ← puts all N particles in cell (0,0)
  [Reset: random]            ← random distribution

PANEL-HEADING: Operations
  [Expand] ← doubles M (adds empty cells on the right/bottom)
  [Compress] ← halves M (moves particles from removed cells into remaining)

PANEL-HEADING: Simulation
  Speed  [slider 1 – 60 steps/s]
  [Pause / Resume]

PANEL-HEADING: Explore
  [Boltzmann] [Arrow of Time] [Equilibrium]
```

Notes:
- **Step logic**: each step, pick a random particle, move it to a random adjacent or
  non-adjacent cell (two variants possible; "non-adjacent random" is simpler and shows
  equilibration faster; prefer this for default).
- **Expand**: immediately double the cell count (add empty cells). S_eq jumps; entropy
  trace shows the leap. W_eq readout and reference line update.
- **Compress**: halve the cell count. Particles in removed cells are randomly redistributed
  into remaining cells. S_eq drops; entropy decreases (demonstrates reversible compression
  if done carefully, but shows the work cost in the process).

---

## Edu panels (three modes)

### 'boltzmann' (default)

- Heading: "S = k ln W"
- Ludwig Boltzmann (1877) gave entropy a microscopic definition: it is proportional to
  the logarithm of the number of ways a macroscopic state can be arranged at the atomic
  level. A "macrostate" is defined by what you can measure (here: how many particles are
  in each region). A "microstate" is the exact position of every particle. W is the count
  of microstates compatible with the macrostate.
  The logarithm is crucial: it converts multiplication of independent systems into
  addition of their entropies. S(A+B) = S(A) + S(B) requires S ∝ ln W.
- Equation block: `S = k ln W      k = 1.38 × 10⁻²³ J/K`
- Callout: Boltzmann's formula is carved on his gravestone in Vienna. He fought for
  atomism — the idea that matter was made of discrete particles — his entire career.
  The concept was controversial; many physicists of his time believed atoms were
  mathematical fictions. Boltzmann died in 1906, before atomic theory was fully accepted.

### 'arrowtime'

- Heading: "The Arrow of Time is Just Counting"
- Why does time have a direction? Why does a drop of ink spread but never spontaneously
  reconcentrate? The second law says entropy increases — but that law is statistical,
  not fundamental.
  The microscopic equations of physics are time-reversible. A video of particles
  colliding played backward is equally valid physics. Yet you never see gases unmix.
  The reason: the unmixed state has W = 1 (all particles in one corner). The mixed
  state has W ≈ M^N. With N = 30 and M = 16, that ratio is 10^36. The system is not
  prevented from returning; it simply never randomly finds its way to the 1-in-10^36
  microstate.
- Equation block: `P(return to corner) = 1/M^N  →  expected wait ~ M^N / ν`
- Callout: If you watched this simulation for the age of the universe, you would still
  expect to wait ~10^18 more universe-lifetimes to see all 20 particles spontaneously
  return to one corner. The arrow of time is the statistics of very large numbers.

### 'equilibrium'

- Heading: "Equilibrium as Maximum Entropy"
- A system at equilibrium is not "at rest" — it is constantly changing microstate.
  What makes equilibrium special is that almost all microstates look similar: roughly
  equal occupancy. The system visits all compatible microstates with equal probability
  (the ergodic hypothesis). Because there are so many more even-distribution microstates
  than uneven ones, the system almost always looks equilibrated.
  At equilibrium, S is maximised. If you constrain the system further — e.g., by
  confining particles to half the box — you reduce the number of available microstates.
  Releasing that constraint lets W grow and S increases. This is the origin of the
  spontaneous expansion observed when a gas fills a vacuum.
- Equation block:
  `S_eq = kN ln M   (ideal, M equal cells, N particles)`
  `ΔS = Nk ln(V_f/V_i)   (continuous ideal gas expansion)`
- Callout: Statistical mechanics (Boltzmann, Gibbs, Maxwell) provides the microscopic
  foundation for thermodynamics. Macroscopic laws like PV = NkT and the Carnot efficiency
  η = 1 − T_C/T_H are derived consequences of counting microstates, not separate axioms.

---

## Color language

| Element | RGB | Notes |
|---------|-----|-------|
| Cell occupancy tint | (45, 215, 135, variable) | teal, scales with n_i/N |
| Particle dots | 8-hue cycle | distinguishable within cells |
| W readout | (45, 215, 135) | teal |
| S readout | (45, 215, 135) | teal |
| S = 0 / minimum state | (255, 150, 50) | orange |
| S(t) trace | (45, 215, 135) | teal |
| W(t) trace | (88, 166, 255) | accent blue |
| S_eq reference line | (255, 150, 50) | orange dashed |
| Expand annotation | (255, 150, 50) | orange label |
| Cell borders | (30, 38, 50) | dim |
| Background | `background(17, 24, 32)` | |
| Axes / dividers | (30, 38, 50) | dim |

8-hue particle color cycle (all saturated, legible on dark background):
```
[rgb(88,166,255), rgb(45,215,135), rgb(255,150,50), rgb(170,65,255),
 rgb(255,80,100), rgb(0,210,210),  rgb(255,220,60), rgb(150,255,100)]
```

---

## Reference sims

| What to copy | From |
|---|---|
| Layout, HTML, edu strip | `maxwell-boltzmann/index.html` (once built) or `uncertainty-principle/index.html` |
| `computeGeometry`, `EDU`, `updateEduPanel` | `uncertainty-principle/sketch.js` |
| Two-panel canvas + time trace pattern | `quantum-tunneling/sketch.js` (T(E) panel) |
| Color conventions | `maxwell-boltzmann` (thermo series) |

---

## Gallery registration

- `SIM_SLUGS`: add `'entropy-microstates'`
- `SIM_COLORS`: `'entropy-microstates': 'linear-gradient(90deg, #2de2c0, #58a6ff)'`
  (teal → blue: entropy → counting)
- `meta.json` tags: `["thermodynamics", "statistical mechanics"]`
- `difficulty`: `"intermediate"`

---

## Implementation notes

### W computation

For N ≤ 25: compute exact factorials (BigInt or precomputed log-factorials).
For N > 25: use Stirling:
```javascript
function logW(counts) {
  // counts = [n0, n1, ..., nM-1], sum = N
  const N = counts.reduce((a, b) => a + b, 0);
  let result = logFactorial(N);
  for (const ni of counts) result -= logFactorial(ni);
  return result;   // returns ln(W)
}
function logFactorial(n) {
  if (n <= 1) return 0;
  if (n <= 20) return Math.log(precomputedFactorial[n]);
  // Stirling
  return n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n);
}
```
Display W as `Math.exp(logW)` with scientific notation: `toExponential(2)`. For
very large logW (logW > 50), display "W = 10^[logW/ln10]".

### Step function

Each simulation step: pick a random particle index i, pick a random cell j, move
particle i to cell j. Update the counts array, recompute logW, append to history arrays.

With [Reset: all in corner]: set counts[0] = N, counts[j>0] = 0. Reset history.

### Time trace

Keep rolling arrays `S_history[]` and `logW_history[]` of last 300 values. Draw
using `beginShape()` / `vertex()` for performance.

### Expand operation

When [Expand] is clicked:
1. Double the grid size: if 4×4 (M=16), switch to 4×8 (M=32). New cells start empty.
2. Recompute S_eq = N * Math.log(M_new).
3. Animate: flash the new empty cells briefly (teal outline) to make the expansion visible.
4. Record an "expand event" timestamp; draw a vertical dashed line on the S(t) trace at
   that point, labeled "Expand".

### Compress operation

When [Compress] is clicked:
1. Halve M. For each particle in a cell that no longer exists, move it to a random
   remaining cell (random reassignment, conserves N).
2. This can *decrease* S — which is fine and educational. Update S_eq reference.
3. Annotate trace with "Compress" vertical line.

---

## Optional extensions

- **Two-species gas**: N/2 blue particles + N/2 red particles, initially separated. Track
  the entropy of mixing: ΔS_mix = Nk ln 2 when the partition is removed. Makes the
  "entropy of mixing" concept (Gibbs paradox) tangible.
- **Boltzmann H-theorem mode**: track H(t) = Σ nᵢ ln nᵢ (Boltzmann's H function,
  which decreases as entropy increases) — visualise the historical H-theorem.
- **Number of microstates vs. macrostates**: add a second display showing the *number
  of distinct macrostates* (partitions of N into M bins) alongside W. Illustrates that
  most macrostates have very small W; only the equilibrium macrostate has W ≈ W_total.
