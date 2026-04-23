# Physics Simulations — Roadmap

## Series Overview

| Series | Gallery tag | Status |
|--------|-------------|--------|
| Chaos & Dynamics | `"chaos"`, `"phase space"` | established |
| Quantum Mechanics | `"quantum mechanics"` | in progress |
| Quantum Information | `"quantum information"` | planned |
| Thermodynamics | `"thermodynamics"` | in progress |
| Finance & Entropy | `"finance"` | planned |

---

## Completed Simulations

| Slug | Title | Series | Notes |
|------|-------|--------|-------|
| `diffusion-levy-flights` | Lévy Flights & Brownian Motion | Chaos | |
| `double-pendulum-array` | Double Pendulum Chaos | Chaos | |
| `dripping-faucet` | Dripping Faucet & the Logistic Map | Chaos | Canvas API (no p5) |
| `energy-landscape` | Energy Landscape Explorer | Chaos | sub-sim of phase-space-wrapper |
| `gravity-well` | Gravity Well & Orbital Phase Space | Chaos | sub-sim |
| `kicked-pendulum` | Kicked Pendulum | Chaos | sub-sim |
| `lorenz-attractor` | Lorenz Attractor | Chaos | WEBGL |
| `oscillator-phase-space` | Harmonic Oscillator Phase Space | Chaos | sub-sim |
| `relational-network` | Relational Network Dynamics | Chaos | |
| `three-body` | Three-Body Problem | Chaos | sub-sim |
| `tunable-mass-damper` | Tuned Mass Damper | Chaos | |
| `wave-interference` | Wave Interference | Quantum | series kickoff |
| `particle-in-a-box` | Particle in a Box | Quantum | layout-c introduced |
| `blackbody-radiation` | Blackbody Radiation | Quantum | |
| `photoelectric-effect` | Photoelectric Effect | Quantum | |
| `uncertainty-principle` | Uncertainty Principle | Quantum | Measure mode, wave-packet collapse |
| `double-slit` | Double-Slit Experiment | Quantum | λ→RGB colormap, which-way mode |
| `quantum-tunneling` | Quantum Tunneling | Quantum | analytic rectangular-barrier, T(E) curve |
| `maxwell-boltzmann` | Maxwell-Boltzmann Distribution | Thermo | thermo series #1 |
| `entropy-microstates` | Entropy & Microstates | Thermo | thermo series #2 |
| `maxwells-demon` | Maxwell's Demon | Thermo | thermo series #3; Demon Mode + Szilard Engine; Landauer accounting |
| `carnot-engine` | Carnot Engine | Thermo | thermo series #4; P-V diagram, Sankey, entropy scorecard, reversible/real modes |
| `ideal-gas-laws` | Ideal Gas Laws | Thermo | beginner foundations; piston chamber; Boyle/Charles/Gay-Lussac with mode-switching diagram |

**Archived:** `_archive/phase-space-wrapper` (split into individual sims), `_archive/orbital-phase-space` (retired duplicate).

---

## Next Up

### Thermodynamics series (build in order)

| # | Slug | Title | Difficulty | Status |
|---|------|-------|------------|--------|

### Quantum series (continuing)

| Slug | Title | Difficulty | Notes |
|------|-------|------------|-------|
| `bell-inequality` | Bell's Inequality & CHSH Test | intermediate | BRIEF written |
| `quantum-eraser` | Quantum Eraser | intermediate | BRIEF written |

---

## Medium-term

### Thermodynamics series — foundations (build before non-eq)

These onboarding sims help laypersons build intuition for P, V, T, Q, W before
tackling Carnot. Consider building 1–2 of these alongside or before `carnot-engine`.

| Slug | Title | Difficulty | Concept |
|------|-------|------------|---------|
| `thermodynamic-work` | Work, Heat & the First Law | beginner | First law ΔU = Q − W; piston-cylinder animation; different paths between same endpoints give different W — introduces path-dependence of work/heat |

### Thermodynamics series — non-equilibrium arc

| Slug | Title | Difficulty | Concept |
|------|-------|------------|---------|
| `feynman-ratchet` | Feynman Ratchet | intermediate | Thermal noise + asymmetry; why equilibrium fluctuations can't be rectified; connects to Maxwell's Demon |
| `reaction-diffusion` | Reaction-Diffusion & Turing Patterns | intermediate | Activator-inhibitor dynamics; non-equilibrium self-organisation; dissipative structures (Prigogine) |
| `fluctuation-theorems` | Fluctuation Theorems (Jarzynski) | advanced | Work distributions far from equilibrium; ⟨e^{−W/kT}⟩ = e^{−ΔF/kT}; arrow of time quantified; bridges thermo and information theory |
| `laplace-demon` | Laplace's Demon | intermediate | Determinism vs. chaos; demon tries to reverse time but sensitivity defeats it — **tag: "chaos"**, not "thermodynamics"; companion to double-pendulum, lorenz-attractor |

### Quantum series (remaining)

| Slug | Title | Difficulty |
|------|-------|------------|
| `quantum-harmonic-oscillator` | Quantum Harmonic Oscillator | intermediate |
| `stern-gerlach` | Stern-Gerlach Experiment | intermediate |
| `mach-zehnder` | Mach-Zehnder Interferometer | intermediate |
| `quantum-zeno` | Quantum Zeno Effect | intermediate |
| `hydrogen-orbitals` | Hydrogen Atom Orbitals | advanced |

### Quantum Information series (new gallery chip "quantum information")

| Slug | Title | Difficulty |
|------|-------|------------|
| `qubit-bloch` | Qubit & Bloch Sphere | beginner |
| `bell-states` | Bell States & Entanglement | intermediate |
| `quantum-teleportation` | Quantum Teleportation | intermediate |
| `bb84-crypto` | BB84 Quantum Cryptography | intermediate |

---

## Finance & Entropy series (new — gallery tag: "finance")

Motivation: the mathematics of irreversibility in thermodynamics and the mathematics of
volatility in finance are the same. This series targets visitors with a finance background,
revealing that their familiar tools are thermodynamic in disguise.

**Series arc:** start with the most accessible surprise (volatility drag = entropy
production), build to the Black-Scholes / heat-equation identity, and end with Kelly
criterion as Carnot efficiency.

| # | Slug | Title | Difficulty | Core insight |
|---|------|-------|------------|-------------|
| 1 | `volatility-drag` | Volatility Drag & Entropy | beginner | Geometric mean = arithmetic mean − σ²/2. The σ²/2 "drag" is Jensen's inequality — identical in form to thermodynamic entropy production. Simulate two investors: one compounds at arithmetic rate, one at geometric rate. The gap widens every year: that gap *is* the entropy cost of a log-normal distribution. |
| 2 | `log-wealth-mixing` | Log-Wealth Mixing & Entropy | intermediate | Pair portfolio path diffusion with a two-color mixing gas. A shared distribution panel shows log-wealth spread alongside mixing entropy, making the entropy link visual rather than symbolic. |
| 3 | `black-scholes-heat` | Black-Scholes as Diffusion | intermediate | The Black-Scholes PDE is the heat equation under a change of variables. Show the same diffusion process side-by-side: heat spreading in a rod (left), option price decaying to expiry (right). Same math, different interpretation. Risk-neutral drift = reference-frame shift, analogous to a Galilean boost. |
| 4 | `barrier-ruin` | Barrier Ruin & First Passage | intermediate | Absorbing boundaries create irreversible outcomes. Compare portfolio drawdown barriers with diffusion-to-wall first-passage statistics. Tail risk dominates ruin probability. |
| 5 | `rebalancing-demon` | Rebalancing Bonus & Information Cost | intermediate | Rebalancing boosts geometric growth by reducing variance, but requires information. Pair with a Maxwell-style demon and Landauer erasure cost ledger. |
| 6 | `kelly-carnot` | Kelly Criterion & Optimal Growth | intermediate | The Kelly criterion (bet fraction f* = p − q) maximises long-run geometric growth — it is the "Carnot efficiency" of compounding. Show the efficiency-vs-power tradeoff: over-betting (above Kelly) is like running a real engine beyond η_CA — more power per bet, less long-run growth. Log-utility = thermodynamic free energy. |
| 7 | `free-energy-loss` | Free Energy Loss (Concept) | advanced | Conceptual bridge: arithmetic return as total energy, geometric return as usable free energy once entropy is accounted for. Brief intentionally conservative; needs refinement before full build. |

**Key mathematical connections (visible in the sims):**

| Thermodynamics | Finance |
|---|---|
| Entropy production rate (irreversibility) | Volatility drag σ²/2 |
| Carnot efficiency η = 1 − T_C/T_H | Kelly criterion f* = p − q |
| Curzon-Ahlborn (max power, not max η) | Risk/return tradeoff (max Sharpe ≠ max Kelly) |
| Ito correction: d(ln S) = (μ − σ²/2)dt + σdW | Same σ²/2 term as in Black-Scholes |
| Partition function / free energy | Risk-neutral option price |
| Jarzynski equality / Esscher transform | Measure change in risk-neutral pricing |
| Log-normal Maxwell-Boltzmann tail | Log-normal asset returns |

---

## Longer-term

- **Three.js upgrade** for `lorenz-attractor` — better camera/performance than p5.WEBGL
- **Knowledge Map** — navigable D3.js force-directed graph; spec in `tools/knowledge-map/plan.md`
- **Historical Timeline** — SVG page placing sims at discovery year; spec in `knowledge-map/plan.md`
- **Gallery filter chips** — add "Quantum Information", "Thermodynamics", "Finance" chips to `index.html`
- **Link from personal site**

---

## Site Features Backlog

- **Gallery filter chips** — add "Quantum Information", "Thermodynamics", "Finance" chips; tag values must match exactly: `"quantum information"`, `"thermodynamics"`, `"finance"`
- **Per-sim physics review** — audit correctness: `tunable-mass-damper` (damping ratio), `gravity-well` (orbit energy conservation)
- **`equations` field** — add to remaining sim `meta.json` files
