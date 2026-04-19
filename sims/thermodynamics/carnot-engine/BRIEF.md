# Carnot Engine — Sim Brief

## Concept & educational goal

The Carnot engine is the gold standard of thermodynamic efficiency — and the proof that
no engine can ever be perfectly efficient. Built from two simple ideas: (1) heat naturally
flows from hot to cold, and (2) you can only extract useful work from that flow. Nicolas
Carnot (1824) showed that the maximum possible efficiency depends only on the temperatures
of the hot and cold reservoirs — not on the fuel, the working fluid, or the engineering.
That maximum is η = 1 − T_C/T_H. Anything less efficient is wasting energy. Anything more
efficient is impossible.

The second key insight: real engines are always less efficient than Carnot because real
processes are *irreversible*. Friction, finite-speed heat transfer, turbulence — all
generate entropy that cannot be recaptured as work. This sim makes that comparison concrete:
toggle between ideal (Carnot) and real (irreversible) modes and watch entropy accumulate
as waste heat.

**Layperson variables glossary** (shown prominently on canvas):
- **Temperature T** — average kinetic energy of molecules; measured in Kelvin (K). T = 0 K
  means no molecular motion — absolute zero.
- **Heat Q** — energy transferred because of a temperature difference. Q_H is heat drawn
  from the hot source (your "fuel"); Q_C is heat dumped to the cold sink (your "exhaust").
- **Work W** — energy delivered as useful mechanical output (e.g., turning a shaft, moving
  a piston). W = Q_H − Q_C.
- **Efficiency η** — fraction of fuel energy turned into useful work: η = W/Q_H.
- **Entropy S** — a measure of dispersal, disorder, or "lost opportunity to do work."
  Whenever a process is irreversible, entropy is created. Created entropy = wasted work.
- **Pressure P, Volume V** — for a gas engine: P is the force the gas exerts per unit area;
  V is how much space the gas occupies. The P-V diagram traces the full thermodynamic cycle.

The "wow" moments:
1. **The efficiency ceiling**: no matter what, η < 1 − T_C/T_H. A car engine (T_H ≈ 2000 K,
   T_C ≈ 300 K) has a Carnot ceiling of ~85%; real gasoline engines achieve ~25–35%.
2. **Reversibility = efficiency**: the Carnot cycle achieves its bound *only* because every
   step is perfectly reversible — no friction, infinitely slow heat exchange. Real-world
   speed and friction destroy efficiency.
3. **Entropy as waste**: in the entropy scorecard, ΔS_total = 0 for ideal mode. Switch to
   irreversible mode — ΔS_total immediately turns positive and grows each cycle. That
   positive entropy is exactly the work you lost.
4. **Curzon-Ahlborn tradeoff**: the most efficient engine produces zero power (infinitely slow).
   Real engines trade efficiency for power. The Curzon-Ahlborn efficiency η_CA = 1 − √(T_C/T_H)
   is the efficiency at *maximum power output* — remarkably close to real power plants.

---

## Physics

### The Carnot cycle (ideal gas, monatomic: γ = 5/3)

Four states: A → B → C → D → A. All processes use an ideal gas (PV = NkT).

**Stroke 1 — Isothermal expansion (A→B, temperature T_H)**
Gas expands in contact with the hot reservoir; temperature stays constant.
```
P(V) = NkT_H / V       (hyperbola)
Q_H = NkT_H ln(V_B/V_A)   (heat absorbed from hot source)
W_AB = Q_H              (all heat → work at constant T)
```

**Stroke 2 — Adiabatic expansion (B→C, no heat exchange)**
Gas expands with the hot reservoir removed; temperature drops from T_H to T_C.
```
PV^γ = const            T drops: T_C/T_H = (V_B/V_C)^(γ−1)
W_BC = NkΔT / (γ−1)    (work from cooling)
```

**Stroke 3 — Isothermal compression (C→D, temperature T_C)**
Gas compressed against the cold reservoir; temperature stays constant.
```
P(V) = NkT_C / V
Q_C = NkT_C ln(V_C/V_D)    (heat dumped to cold sink — always > 0)
W_CD = −Q_C
```

**Stroke 4 — Adiabatic compression (D→A, no heat exchange)**
Gas compressed back to starting state; temperature rises from T_C to T_H.
```
PV^γ = const
W_DA = −NkΔT / (γ−1)
```

**Net work and efficiency:**
```
W_net = Q_H − Q_C
η_Carnot = W_net / Q_H = 1 − T_C/T_H = 1 − Q_C/Q_H
```

**Entropy balance (ideal, reversible):**
```
ΔS_hot  = −Q_H / T_H   (hot reservoir loses entropy)
ΔS_cold = +Q_C / T_C   (cold reservoir gains entropy)
ΔS_total = ΔS_hot + ΔS_cold = 0     ← reversible: no entropy created
```

### Irreversible engine

Model: heat is transferred at a finite rate across a temperature gap δT. The working
fluid absorbs heat at T_H − δT (not T_H) and rejects at T_C + δT (not T_C). This
generates irreversible entropy:
```
ΔS_irr = Q_H (1/(T_H − δT) − 1/T_H) + Q_C (1/(T_C + δT) − 1/T_C) > 0
```
Efficiency is reduced:
```
η_real < η_Carnot
```
At the irreversibility slider maximum (δT → T_H−T_C), the engine degrades to
pure heat conduction with zero net work.

**Curzon-Ahlborn efficiency (maximum power output):**
```
η_CA = 1 − √(T_C / T_H)
```
For T_H = 800 K, T_C = 300 K: η_Carnot = 62.5%, η_CA = 38.7%.
Real coal plants typically operate near η_CA — they are optimized for power, not efficiency.

### Recommended defaults

| Parameter | Default | Range |
|-----------|---------|-------|
| T_H | 600 K | 400–1200 K |
| T_C | 300 K | 100–500 K (must be < T_H) |
| N (mol. equiv.) | 1.0 | 0.5–3.0 |
| Mode | Reversible | Reversible / Irreversible |
| Irreversibility δT/ΔT | 0 | 0–0.4 |

---

## Canvas layout (layout-c)

```
┌────────────────────────────────┬──────────────────────────┬──────────┐
│  P-V DIAGRAM  (~55%)           │  ENGINE DIAGRAM  (~45%)  │ controls │
│  animated cycle dot + paths    │  Sankey energy flow      │  (280px) │
│  stroke labels, state points   │  ── ── ── ── ── ──        │          │
│  current P, V, T readout       │  ENTROPY SCORECARD       │          │
│                                │  Q_H / W / Q_C / ΔS     │          │
├────────────────────────────────┴──────────────────────────┴──────────┤
│  Educational strip (240px)                                             │
└────────────────────────────────────────────────────────────────────────┘
```

### P-V diagram panel (left ~55%)

- X-axis: Volume V (arbitrary units). Y-axis: Pressure P.
- **Four strokes** drawn as smooth curves:
  - A→B: red curve (isothermal at T_H) — labeled "Isothermal expansion (T_H)"
  - B→C: orange curve (adiabatic expansion) — labeled "Adiabatic expansion"
  - C→D: blue curve (isothermal at T_C) — labeled "Isothermal compression (T_C)"
  - D→A: accent-blue curve (adiabatic compression) — labeled "Adiabatic compression"
- **State points** A, B, C, D: filled circles (white, 6px) with letter labels.
- **Animated cycle dot**: bright teal dot traces the current position on the cycle.
  Leaves a fading teal trail (last 30 frames). Moves at constant arc-length speed.
- **Filled interior**: the area enclosed by the cycle is filled `rgba(45, 215, 135, 0.08)`.
  This area = net work W_net. Label inside: "W = [value] kT".
- **Current state readouts** (top-left of panel, teal):
  "P = [val]   V = [val]   T = [val] K"
- **Irreversible mode**: the cycle shrinks (less enclosed area = less work). Dim the
  original Carnot cycle in grey dashed lines as a ghost for comparison.
- **Panel title**: "P-V Diagram"

### Engine diagram panel (right ~45%, top ~55%)

A schematic showing energy flow — designed to be immediately readable by a layperson:

```
  [HOT RESERVOIR  T_H]
         |
      Q_H ↓  (red arrow, width ∝ Q_H)
         |
    ┌─────────┐
    │  ENGINE │ ──→  W (teal arrow, width ∝ W_net, rightward)
    └─────────┘
         |
      Q_C ↓  (blue arrow, width ∝ Q_C)
         |
  [COLD RESERVOIR  T_C]
```

- Arrows are **Sankey-style**: width is proportional to energy magnitude.
- Animate: arrows pulse with each cycle completion.
- Label each arrow with its value: "Q_H = 3.2 kT", "W = 1.3 kT", "Q_C = 1.9 kT".
- Ideal mode: W arrow is large, Q_C arrow is smaller (high efficiency).
- Irreversible mode: W arrow shrinks, Q_C arrow grows. Add a small orange "ΔS_waste"
  splinter off the Q_C arrow, labeled "entropy produced".
- Show η prominently: large text "η = 42%" between W arrow and right edge.
  Below it, dim text: "Carnot max: η = [η_Carnot]%".
  In irreversible mode, show both: "η_real = X%  |  η_Carnot = Y%  |  η_CA = Z%"

### Entropy scorecard (right ~45%, bottom ~45%)

A running tally updated each cycle:

```
  ΔS_hot    =  −1.60 k   (blue, per-cycle)
  ΔS_cold   =  +1.60 k   (red, per-cycle)
  ─────────────────────
  ΔS_total  =   0.00 k   ← teal (ideal) or orange (irreversible, > 0)

  Cycles:  [count]
  Net W:   [cumulative work]
```

In irreversible mode, ΔS_total > 0 and the value glows orange. A small indicator below
it reads: "Work lost to entropy = [ΔS_total × T_C] kT". This closes the loop: every unit
of entropy created costs real work.

---

## Controls (right panel, 280px)

```
PANEL-HEADING: Reservoirs
  T_H = [value K]   [slider 400–1200 K, step 10]
  T_C = [value K]   [slider 100–500 K, step 10]
  η_Carnot = [computed, teal, read-only]

PANEL-HEADING: Engine Mode
  [Reversible (Carnot)]  [Real Engine]

=== Real Engine only ===
PANEL-HEADING: Irreversibility
  δT/ΔT = [value]  [slider 0–0.40, step 0.01]
  η_real = [computed, orange, read-only]
  η_CA   = [computed, dim, read-only]

PANEL-HEADING: Playback
  [▶ Auto]  [⏸ Pause]  [⏭ Step stroke]
  Speed  [slider 0.5× – 4×]

PANEL-HEADING: Explore
  [Carnot] [Entropy & Waste] [Arrow of Time]
```

Notes:
- T_C slider max is clamped to T_H − 10 K to prevent T_C ≥ T_H.
- T_H/T_C changes take effect on the next cycle start (don't interrupt mid-stroke).
- [Step stroke]: advance one stroke (A→B, B→C, C→D, or D→A) per click. Helpful for
  slowing down to explain each step.

---

## Edu panels (three modes)

### 'carnot' (default)

- Heading: "The Carnot Engine"
- **Temperature** is the average kinetic energy of the molecules in a substance. **Heat**
  is energy that flows when two things at different temperatures touch — it always flows
  from hot to cold, never the reverse. An **engine** works by sitting between a hot source
  and a cold sink, letting heat flow "downhill" through it, and capturing some of that
  flow as **useful work** — a turning shaft, a moving piston, electricity.
  Sadi Carnot (1824) asked: what is the maximum fraction of Q_H that can become work? His
  answer: η = 1 − T_C/T_H. Higher hot temperature or lower cold temperature → more work
  extractable from the same fuel. This bound cannot be beaten — it follows from the second
  law of thermodynamics. Real engines fall short because real processes are not perfectly
  reversible.
- Equation block:
  `η_Carnot = 1 − T_C/T_H = W_net/Q_H`
  `W_net = Q_H − Q_C`
- Callout: A coal power plant operates between ~600°C (873 K) and ~30°C (303 K) — a
  Carnot ceiling of 65%. Modern supercritical plants reach ~45%, close to the Curzon-Ahlborn
  maximum-power efficiency of ~41%. The gap is friction, heat leaks, and finite cycle speed.

### 'entropy' (Entropy & Waste)

- Heading: "Entropy: the Cost of Irreversibility"
- **Entropy** is what you are creating whenever a process is irreversible — whenever you
  can't simply run it backward and recover everything. Friction creates entropy (hot friction
  surfaces cool the surroundings; you can't un-warm them). Heat leaking across a large
  temperature gap creates entropy (energy spreads out; you can't concentrate it again without
  paying a cost). Every joule of entropy created corresponds to a joule of work you *could*
  have extracted but didn't. Entropy is not just disorder — it is lost opportunity.
  In an ideal Carnot engine, no entropy is created (ΔS_total = 0). The engine is a
  perfect conduit for entropy: what the hot source loses, the cold sink gains. In a real
  engine, irreversibilities create extra entropy — and the scorecard shows that cost
  directly: wasted work = ΔS_irr × T_C.
- Equation block:
  `ΔS_total = −Q_H/T_H + Q_C/T_C ≥ 0   (second law)`
  `W_lost = T_C · ΔS_irr`
- Callout: The Gouy-Stodola theorem (1889): the work lost in any process equals T_C times
  the entropy generated. This gives engineers a direct monetary value for irreversibility:
  every unit of entropy created in a power plant is kilowatt-hours not sold.

### 'arrowtime' (Arrow of Time)

- Heading: "Why You Can't Run It Backward"
- The laws of physics at the microscopic level are **time-symmetric**: a video of molecules
  colliding played backward is perfectly valid physics. Yet a video of an engine running
  backward — heat flowing from cold to hot, exhaust becoming fuel — is never observed. Why?
  The Carnot cycle *can* be run in reverse: it becomes a refrigerator, pumping heat from
  cold to hot by consuming work. But that requires a work input — it does not happen
  spontaneously. The reason is entropy. Running the engine forward generates (or conserves)
  entropy. Running a *real* (irreversible) engine backward would *decrease* entropy — which
  is overwhelmingly improbable for the same statistical reasons we saw in Entropy & Microstates:
  the "backward" trajectory is one microstate out of an astronomically larger set of
  "forward" trajectories.
  The arrow of time is not written into the microscopic laws. It emerges from the
  statistics of large numbers — the same second law that sets the Carnot efficiency.
- Equation block:
  `ΔS_universe ≥ 0   ←  this is the arrow of time`
  `Refrigerator: W_in = Q_H − Q_C > 0   (work always required)`
- Callout: Black holes are the ultimate thermodynamic objects. Stephen Hawking showed that
  a black hole has entropy proportional to its surface area (Bekenstein-Hawking entropy).
  Black hole evaporation via Hawking radiation is a thermodynamic process — the universe's
  entropy still increases. Even at the most extreme scales, the arrow of time holds.

---

## Color language

| Element | RGB | Notes |
|---------|-----|-------|
| Stroke A→B (isothermal at T_H) | (220, 60, 50) | red — hot |
| Stroke B→C (adiabatic expand) | (255, 150, 50) | orange — cooling |
| Stroke C→D (isothermal at T_C) | (50, 130, 220) | blue — cold |
| Stroke D→A (adiabatic compress) | (88, 166, 255) | accent blue — warming |
| Cycle dot (animated) | (45, 215, 135) | teal |
| Cycle trail | (45, 215, 135, 100) | teal dim |
| Enclosed area fill | (45, 215, 135, 20) | teal very dim |
| State points A, B, C, D | (220, 220, 220) | near-white |
| Q_H arrow (Sankey) | (220, 60, 50) | red |
| W arrow (Sankey) | (45, 215, 135) | teal |
| Q_C arrow (Sankey) | (50, 130, 220) | blue |
| Entropy waste splinter | (255, 150, 50) | orange |
| η display (ideal) | (45, 215, 135) | teal |
| η display (real) | (255, 150, 50) | orange |
| ΔS_total (ideal, = 0) | (45, 215, 135) | teal |
| ΔS_total (real, > 0) | (255, 150, 50) | orange |
| Ghost Carnot cycle (irrev. mode) | (80, 95, 115) | dim grey dashed |
| Background | `background(17, 24, 32)` | |
| Axes / dividers | (30, 38, 50) | dim |

---

## Reference sims

| What to copy | From |
|---|---|
| Layout, HTML, edu strip | `entropy-microstates/index.html` |
| `computeGeometry`, `EDU`, `updateEduPanel` | `uncertainty-principle/sketch.js` |
| Color conventions (cold/hot) | `maxwell-boltzmann/sketch.js` |
| Mode toggle | `maxwells-demon/sketch.js` (once built) or `quantum-tunneling/sketch.js` |

---

## Gallery registration

- `SIM_SLUGS`: add `'carnot-engine'`
- `SIM_COLORS`: `'carnot-engine': 'linear-gradient(90deg, #dc3c32, #2de2c0)'`
  (red → teal: heat → work)
- `meta.json` tags: `["thermodynamics", "statistical mechanics"]`
- `difficulty`: `"beginner"` — very visual, no prior physics required, layperson-glossary on canvas

---

## Implementation notes

### P-V curve computation

Use a parametric sweep over t ∈ [0, 1] for each stroke. With N=1 (normalised units):

```javascript
// Stroke 1: Isothermal expansion A→B
// PA = TH/VA, VB = VA * r_expand (e.g., r_expand = 2.5)
function pvIsothermal(V, T) { return T / V; }

// Stroke 2: Adiabatic B→C
// PB*VB^γ = PC*VC^γ; VC = VB * (TH/TC)^(1/(γ-1))
const GAMMA = 5/3;
function pvAdiabat(V, PrefVrefGamma) { return PrefVrefGamma / Math.pow(V, GAMMA); }

// Stroke 3: Isothermal compression C→D
// VD = VC / r_expand * (TC/TH)  [by Carnot constraint VD/VA = TC/TH * VA/VB ... derive]
// Simpler: VD = VA * TC/TH * r_expand ... actually:
// The Carnot constraint: VB/VA = VC/VD (ensures ΔS = 0)
// So VD = VA * VC/VB

// Stroke 4: Adiabatic compression D→A
// Returns to state A.
```

Pre-compute all 4 state points (A, B, C, D) from T_H, T_C, V_A, r_expand. Then
sample each stroke with 50 points for the drawn curve.

For the animated dot: store total arc length of the cycle; advance by `speed * dt`
each frame; binary-search current stroke and position.

### Sankey arrow rendering

Draw each arrow as a filled rounded rectangle:
```javascript
// width = energy value / Q_H * maxArrowWidth
// height = fixedThickness (e.g. 12px)
// vertical stack: Q_H block, engine box, W → right, Q_C block
function drawSankeyArrow(x, y, w, h, col, label) {
  fill(col); noStroke();
  rect(x, y, w, h, 4);  // rounded
  fill(220, 220, 220); textSize(11);
  text(label, x + w + 5, y + h/2 + 4);
}
```

### Entropy scorecard update

Recompute per-cycle values each time the cycle dot completes one full revolution:
```javascript
const deltaS_hot  = -Q_H / T_H;
const deltaS_cold = +Q_C / T_C;
const deltaS_irr  = deltaS_hot + deltaS_cold;  // 0 in ideal mode, > 0 in real
const W_lost = T_C * deltaS_irr;
```

### Irreversible mode model

When `irreversibility` slider = δ (0–0.40):
```javascript
const T_H_eff = T_H * (1 - delta);   // engine absorbs at lower T
const T_C_eff = T_C * (1 + delta);   // engine rejects at higher T
// Recalculate Q_H, Q_C, W with T_H_eff, T_C_eff
// Sankey arrows update; cycle shrinks on PV diagram
// deltaS_irr = -Q_H/T_H_eff + Q_C/T_C_eff > 0
```

---

## Optional extensions

- **Refrigerator mode**: run the cycle in reverse (reverse the animation). Work arrow
  reverses direction (input), heat flows from cold to hot. Shows COP = Q_C/W. Bridges
  directly to Carnot irreversibility discussion.
- **Stirling cycle overlay**: show the Stirling cycle on the same P-V diagram for
  comparison — it also achieves Carnot efficiency but via two isothermals + two
  isochores. Shows that Carnot efficiency is not unique to the Carnot cycle shape.
- **Otto cycle**: add a third cycle mode (two adiabatics + two isochores) representing
  the gasoline engine; show why η_Otto = 1 − (V_min/V_max)^(γ−1) < η_Carnot.
- **Historical timeline annotation**: a small panel showing Carnot (1824), Clausius
  (1850, coined "entropy"), Kelvin (1851, second law), Boltzmann (1877, S = k ln W)
  as a horizontal strip — connecting this sim to the broader series arc.
