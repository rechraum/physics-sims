# Maxwell's Demon — Sim Brief

## Concept & educational goal

The central thought experiment connecting thermodynamics and information theory. A "demon"
watches individual molecules and operates a trapdoor, apparently creating a temperature
gradient from nothing — a violation of the second law. For nearly a century this paradox
stood. Szilard (1929) formalized it as a minimal single-molecule engine. Landauer (1961)
resolved it: *erasing* the demon's memory costs exactly kT ln 2 per bit — precisely the
work the demon extracts. Shannon's information entropy and Boltzmann's thermodynamic
entropy are the same formula. Information is physical.

Two modes tell the complete historical story:
1. **Demon Mode** — Maxwell's original setup: a partition with a trapdoor separates hot
   and cold molecules, building a temperature gradient from thermal equilibrium
2. **Szilard Mode** — the single-molecule engine: observe which half a molecule is in,
   insert a piston, extract kT ln 2 of work. Then erase the memory — and pay it back

The "wow" moments:
1. **Demon mode**: the temperature difference grows without any external energy input.
   The second law appears to be violated in real time.
2. **Memory fills up**: when the demon's 1-bit memory is full and must be erased, the
   entropy cost appears — the second law is restored.
3. **Szilard mode**: a single molecule expanding against a piston extracts exactly kT ln 2
   of work — a measurable, calculable amount from *one bit of information*.
4. **The identity**: Shannon's H = −Σ p log₂ p and Boltzmann's S/k = −Σ p ln p are the
   same formula (up to the base of the logarithm). Information *is* thermodynamic entropy.

---

## Physics

### Maxwell's Demon (1867): sorting molecules

A box of gas at temperature T is divided by a partition with a small door. The demon
watches each molecule approaching the door:
- If a molecule from the left side is fast (KE > average), open the door: it moves right.
- If a molecule from the right side is slow, open the door: it moves left.

Result: right side heats (T_H), left side cools (T_C). Entropy of the gas:
```
ΔS_gas = Q · (1/T_C − 1/T_H) < 0
```
This *decreases* the gas entropy — apparently without expending work.

### Szilard Engine (1929): one molecule, one bit

A box contains exactly one molecule at temperature T. Steps:
1. **Observe**: demon measures which half (L or R) the molecule is in. Acquires 1 bit.
2. **Insert piston**: on the side *without* the molecule — massless, no work done.
3. **Expand**: molecule pushes piston across the full box. Work extracted (isothermal):
   ```
   W_extracted = kT ln 2
   ```
4. **Reset (erase)**: demon must reset its 1-bit memory (e.g., reset a binary flag to 0).
   This is irreversible compression of information. Landauer's principle:
   ```
   W_erase ≥ kT ln 2
   ```
   W_erase = W_extracted → net work = 0. Second law preserved.

### Landauer's erasure principle (1961)

Erasing one bit of information in a system at temperature T costs at minimum:
```
W_erase ≥ kT ln 2 ≈ 2.87 × 10⁻²¹ J  at T = 300 K
```
This is not a technological limitation — it is a fundamental thermodynamic bound.
The Szilard engine extracts exactly this amount; erasure returns it. There is no free lunch.

### The information-entropy identity

Boltzmann entropy (thermodynamic):
```
S = −k Σᵢ pᵢ ln pᵢ
```
Shannon information entropy (information theory, 1948):
```
H = −Σᵢ pᵢ log₂ pᵢ   (bits)
```
Conversion: S = k ln 2 · H. They are the same quantity. The demon's 1-bit memory has
entropy H = 1 bit = k ln 2 in thermodynamic units. Erasing it raises the thermodynamic
entropy of the environment by exactly k ln 2 — restoring the second law.

---

## Canvas layout (layout-c)

Two distinct canvas configurations, selected by mode toggle:

### Mode A — Maxwell's Demon
```
┌──────────────────────────────────────┬────────────────────┬──────────┐
│  DUAL CHAMBER  (~62%)               │  MEMORY  (~38%)    │ controls │
│  [Cold]  |door|  [Hot]              │  bit register      │  (280px) │
│  colored molecules + speed trail    │  entropy cost bar  │          │
│  T_C / T_H gauges                   │  S_memory counter  │          │
├──────────────────────────────────────┴────────────────────┴──────────┤
│  Educational strip (240px)                                             │
└────────────────────────────────────────────────────────────────────────┘
```

**Dual chamber (left ~62%):**
- Two equally-sized chambers separated by a vertical partition.
- N = 40–60 molecules, initialised at the same temperature (all same speed, random directions).
- Partition has a small door (gap ~2× particle radius) at the vertical midpoint.
- The demon opens/closes the door each frame based on the approaching molecule's speed:
  - Fast molecule approaching from the left: door opens (passes right). Door glow: red.
  - Slow molecule approaching from right: door opens (passes left). Door glow: blue.
  - All other cases: door stays closed.
- Molecules colored by speed (blue cold → red hot), matching maxwell-boltzmann convention.
- **Temperature gauges**: vertical thermometer bars on the outer walls of each chamber.
  T_C on left (blue fill), T_H on right (red fill). Computed from average KE per side.
  - Labels: "T_C = 0.72" (left, blue), "T_H = 1.41" (right, red).
- **Panel title**: "Maxwell's Demon — ΔT = [T_H − T_C]"

**Memory panel (right ~38% of canvas, within canvas area):**
- **Bit register**: a row of N_mem = 8 small square cells. Each cell displays "1" or "0"
  (teal for 1, dim for 0). Each demon operation writes 1 bit; cells fill left to right.
- **"Memory full" event**: when all 8 cells are 1, the register must be erased. Flash the
  entire register orange, then clear all cells to 0. Show an animated entropy "burst":
  small teal sparks flying from the register toward the right wall (heat dumped).
- **Entropy cost counter**: "Σ S_erased = [value] k" — running total of kT ln 2 per
  erasure event. Teal text.
- **Panel title**: "Demon Memory"

### Mode B — Szilard Engine
```
┌──────────────────────────────────────────────────────────┬──────────┐
│  SZILARD CYCLE  (~75% canvas width)                      │ controls │
│  Step-by-step box animation + cycle diagram              │  (280px) │
├──────────────────────────────────────────────────────────┴──────────┤
│  Educational strip (240px)                                            │
└────────────────────────────────────────────────────────────────────────┘
```

**Szilard cycle panel (full canvas width, ~75% of total canvas area):**

Left portion (~55%): animated box
- Square box with one molecule bouncing inside.
- Molecule is a glowing teal dot; trail shows recent path.
- Box is divided horizontally by a thin dashed partition (not solid — represents the
  observation boundary).

Right portion (~45%): cycle diagram
- Four-step cycle shown as a horizontal flow:
  `[OBSERVE] → [INSERT] → [EXPAND] → [ERASE]`
  - Current step is highlighted (bright, white border).
  - Completed steps shown dim.

**Step animations:**

*Step 1 — Observe:* Demon eye icon appears over the box. Molecule's half highlighted
(left = teal, right = orange). Bit display lights up: "Bit = L" or "Bit = R". Duration: 0.6 s.

*Step 2 — Insert piston:* A solid piston (grey rectangle) slides in from the correct
side (the side without the molecule). Duration: 0.4 s. The molecule continues bouncing
in its half.

*Step 3 — Expand:* Piston slowly moves toward the opposite wall as the molecule pushes
it. Work meter on the right fills: "W = [value] kT ln 2". Teal progress bar fills
from 0 to kT ln 2. Duration: 1.0 s.

*Step 4 — Erase:* Piston disappears. Bit display shows erasure: the bit cell flashes
orange, then resets to "0". Entropy cost meter: "−W_erase = kT ln 2" in orange.
Counter below: "Net = 0". Duration: 0.6 s.

After Step 4, the cycle loops.

Buttons: [▶ Auto] [⏸ Step] — auto runs at ~1 cycle/3 s; step advances one step per click.

---

## Controls (right panel, 280px)

```
PANEL-HEADING: Mode
  [Demon Mode] [Szilard Engine]

=== Demon Mode controls ===
PANEL-HEADING: Simulation
  N molecules [slider 20 – 80, step 5]
  T₀ = [value]  [slider 0.5 – 2.0]   ← initial temperature
  [Reset]

PANEL-HEADING: Demon
  Memory size [slider 1 – 16 bits]    ← cells before forced erasure
  [Freeze demon]                       ← stop sorting; watch gas re-mix

=== Szilard Mode controls ===
PANEL-HEADING: Engine
  T = [value]  [slider 0.5 – 2.0]
  [▶ Auto]  [⏸ Step]
  Speed  [slider 0.5× – 3×]

=== Shared ===
PANEL-HEADING: Explore
  [Maxwell's Demon] [Landauer] [Shannon = Boltzmann]
```

Notes:
- [Freeze demon]: opens the door randomly instead of intelligently. The temperature
  gradient immediately starts to collapse (regression to equilibrium). Dramatic visual.
- Mode toggle clears all state and re-initialises.

---

## Edu panels (three modes)

### 'demon' (default)

- Heading: "Maxwell's Demon"
- In 1867, James Clerk Maxwell proposed a thought experiment: a tiny "demon" watches
  molecules at a partition and opens a door for fast ones in one direction, slow ones
  in the other. The result is spontaneous separation of hot and cold — entropy decreases
  without any work input. This appeared to violate the second law of thermodynamics, and
  no one could explain why it didn't for nearly a century.
  Leo Szilard (1929) sharpened the paradox: even a single-molecule version extracts
  kT ln 2 of work per measurement cycle. The demon must store information about each
  molecule's position — and that storage, he argued, was the key.
- Equation block: `W_extracted = kT ln 2  ←  one bit of information`
- Callout: Modern Maxwell's Demon experiments have been realised in colloidal particles
  (Toyabe et al. 2010) and electron systems (Koski et al. 2014). They confirm that
  information extraction converts to work at exactly the Landauer rate.

### 'landauer'

- Heading: "Landauer's Principle: Erasure is Physical"
- Rolf Landauer (1961) resolved Maxwell's paradox. The demon's measurement is free —
  observing does not cost entropy. But *erasing* the memory record does. Resetting a
  1-bit memory from an unknown state (0 or 1) to a known state (0) must dissipate at
  least kT ln 2 of heat into the environment. The second law is saved not by the
  measurement but by the reset.
  Charles Bennett (1982) extended this: reversible computation is possible in principle
  (no erasure = no heat cost). But any *logically irreversible* operation — AND, NAND,
  RESET — costs kT ln 2 per bit erased. This sets a fundamental lower bound on the
  energy cost of computation.
- Equation block: `W_erase ≥ kT ln 2 ≈ 2.87 × 10⁻²¹ J  at T = 300 K`
- Callout: Today's best transistors dissipate ~10⁵ times the Landauer limit per
  operation. As Moore's law continues, Landauer dissipation may become a practical
  engineering constraint within 10–20 years.

### 'shannon'

- Heading: "Shannon Entropy = Boltzmann Entropy"
- In 1948, Claude Shannon derived the unique measure of information uncertainty for a
  probability distribution over N outcomes. It took exactly the form Boltzmann had
  written for thermodynamic entropy in 1877 — with k replaced by a units factor:
  S = k ln 2 · H.
  This is not a coincidence. Physical entropy IS uncertainty about microscopic state.
  A molecule in a two-compartment Szilard box has 1 bit of positional uncertainty;
  when the demon resolves that uncertainty, it decreases the physical entropy by kT ln 2.
  When the demon's memory is erased, that uncertainty is dumped back into the heat bath.
  The "information" the demon holds is literally a thermodynamic quantity.
- Equation block:
  `H = −Σ pᵢ log₂ pᵢ     (Shannon, bits)`
  `S = −k Σ pᵢ ln pᵢ     (Boltzmann, J/K)`
  `S = k ln 2 · H`
- Callout: This deep connection underlies modern quantum information theory, where von
  Neumann entropy S = −k Tr(ρ ln ρ) is the quantum extension of both formulas, and
  quantum error correction is fundamentally a fight against thermodynamic entropy increase.

---

## Color language

| Element | RGB | Notes |
|---------|-----|-------|
| Cold molecules | (50, 130, 220) | blue |
| Hot molecules | (220, 60, 50) | red |
| Demon door (opens fast) | (220, 60, 50) | red glow |
| Demon door (opens slow) | (50, 130, 220) | blue glow |
| T_C gauge fill | (50, 130, 220) | blue |
| T_H gauge fill | (220, 60, 50) | red |
| Memory bit cells (1) | (45, 215, 135) | teal |
| Memory bit cells (0) | (30, 38, 50) | dim |
| Erasure flash | (255, 150, 50) | orange |
| Entropy cost counter | (45, 215, 135) | teal |
| Szilard molecule | (45, 215, 135) | teal glow |
| Szilard piston | (140, 150, 165) | grey |
| Work meter fill | (45, 215, 135) | teal |
| Erasure cost display | (255, 150, 50) | orange |
| Current cycle step | (255, 255, 255) | white border |
| Background | `background(17, 24, 32)` | |
| Partition wall | (50, 65, 85) | dark blue-grey |

---

## Reference sims

| What to copy | From |
|---|---|
| Layout, HTML, edu strip | `maxwell-boltzmann/index.html` (once built) or `uncertainty-principle/index.html` |
| Molecule simulation (bouncing, elastic) | `maxwell-boltzmann/sketch.js` |
| `computeGeometry`, `EDU`, `updateEduPanel` | `uncertainty-principle/sketch.js` |
| Mode toggle pattern | `quantum-tunneling/sketch.js` (`displayWave`/`compareMode`) |
| Color convention (cold/hot) | `maxwell-boltzmann` (thermo series) |

---

## Gallery registration

- `SIM_SLUGS`: add `'maxwells-demon'`
- `SIM_COLORS`: `'maxwells-demon': 'linear-gradient(90deg, #3282dc, #a855f7)'`
  (blue → purple: thermo → information)
- `meta.json` tags: `["thermodynamics", "information theory", "statistical mechanics"]`
- `difficulty`: `"advanced"`

---

## Implementation notes

### Demon decision logic (Demon Mode)

Each frame, find all molecules within ~3× door_width of the door position. For each:
- If molecule is on the left side and moving rightward: fast = (speed > avg_speed)
- If molecule is on the right side and moving leftward: slow = (speed < avg_speed)
- If condition met, open door for this molecule (mark it `demon_pass = true`)
- Other molecules that reach the door gap while `demon_pass` is active are blocked
  by reverting their x-velocity

Track door state (open/closed) and animate it (a small gap appears/closes).

After each molecule passes, write 1 bit to the memory register. When register is
full (all cells = 1), trigger erasure animation, reset to all-0, increment entropy counter.

Average speed update: recompute `avg_speed = sqrt(2 * totalKE / N / m)` every 30 frames.

### Szilard cycle state machine

```javascript
const STEPS = ['observe', 'insert', 'expand', 'erase'];
let stepIndex = 0;
let stepTimer = 0;   // frames elapsed in current step
const STEP_DURATION = { observe: 36, insert: 24, expand: 60, erase: 36 };  // at 60fps

function advanceStep() {
  stepTimer = 0;
  stepIndex = (stepIndex + 1) % 4;
  if (stepIndex === 0) cycleCount++;
}
```

State `moleculeHalf` ('L' or 'R') is set at the start of the 'observe' step (random
or use the molecule's actual current x-position in the box).

### Entropy counter

```javascript
// Demon Mode
let erasureCount = 0;
let S_erased_total = 0;  // in units of k
// On erasure event:
erasureCount++;
S_erased_total += memorySize * Math.log(2);  // kT ln 2 per bit × memorySize bits
```

---

## Optional extensions

- **Freeze demon / reverse**: when frozen, the gas re-thermalises; temperature gradient
  collapses. Shows the spontaneous direction of entropy increase when information is lost.
- **Quantum Szilard engine**: toggle to a quantum variant where the molecule is in a
  superposition of both halves simultaneously. Measurement collapses the superposition —
  bridges to the Bell's inequality and measurement discussions.
- **Energy accounting panel**: running tally of W_extracted, W_erase, and net W showing
  they balance to machine precision — a live verification of Landauer's principle.
- **Noise / imperfect demon**: slider for demon error rate ε ∈ [0,1]; occasionally
  opens the door for the "wrong" molecule. Shows the temperature gradient decrease with
  increasing error rate; entropy accounting still balances.
