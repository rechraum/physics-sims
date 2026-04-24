# Log-Wealth Mixing — Sim Brief

## Concept & educational goal

This sim makes the entropy link visual by pairing a portfolio ensemble with a two-color
mixing gas. The finance side shows log-wealth spreading; the thermo side shows color
concentrations diffusing toward equilibrium. The middle distribution panel highlights that
both are the same mathematical story: diffusion broadens a distribution and increases
entropy over time.

This should feel like a companion to `entropy-microstates` rather than a replacement.
Use similar styling, typography, and the same idea of an entropy gauge so learners
recognize the concept when it appears in a new context.

The "wow" moments:
1. The log-wealth histogram widens with time, just like the mixing histogram flattens.
2. Entropy increases even when the average (arithmetic mean) looks stable.
3. The same diffusion equation governs both panels; only the labels change.

---

## Physics / math

Finance (log-returns):
```
log(V_T) ~ N((mu - sigma^2/2)T, sigma^2 T)
```
Diffusion view:
```
variance grows linearly: Var(log V) = sigma^2 T
```

Mixing entropy (two colors):
```
S_mix = - sum_i p_i log p_i
```
For a 50/50 mix, entropy is maximal. The system approaches that state as mixing proceeds.

Key bridge statement:
```
Diffusion rate in finance (sigma^2) ~ mixing rate in gas (D)
```

---

## Canvas layout (layout-c)

```
┌──────────────────────────┬───────────────────────┬──────────────────────────┐
│  PORTFOLIO ENSEMBLE       │  DISTRIBUTIONS        │  TWO-COLOR MIXING GAS     │
│  log-scale paths          │  log(V) + mixing      │  particles, barrier,      │
│  arithmetic/geometric     │  histograms + entropy │  entropy gauge            │
├──────────────────────────┴───────────────────────┴──────────────────────────┤
│  Educational strip (240px)                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### Left: portfolio ensemble
- N paths (faint purple).
- Arithmetic vs geometric mean lines (gold vs blue).
- Log-scale y-axis with labeled ticks.
- Draggable time marker.

### Center: distributions
- Top: histogram of log(V) at current time.
- Bottom: histogram of color concentration in bins (mixing).
- Overlaid markers showing mean and variance for both.
- Two-line entropy readout with aligned equals:
  "S_mix = ..." and "Var(log V) = ...".

### Right: mixing gas
- Box split by a vertical barrier for first few seconds, then removed.
- Blue particles left, red particles right.
- As mixing proceeds, show a live entropy gauge (same style as entropy-microstates).

---

## Controls

```
PANEL-HEADING: Returns
  mu (avg return) [slider]
  sigma (volatility) [slider]
  T (years) [slider]
  N paths [slider]

PANEL-HEADING: Mixing
  D (diffusion rate) [slider]
  Barrier time [slider]
  Reset mix [button]

PANEL-HEADING: Explore
  [Jensen] [Entropy] [Diffusion]
```

---

## Edu modes

- **Jensen**: volatility drag and geometric mean.
- **Entropy**: mixing entropy and irreversibility.
- **Diffusion**: same equation, different labels; variance grows linearly in both.

---

## Color language

- Portfolio arithmetic mean: gold `rgb(255, 195, 50)`
- Portfolio geometric mean: blue `rgb(88, 166, 255)`
- Ensemble paths: purple low alpha
- Mixing: blue vs red particles
- Entropy gauge: teal `rgb(45, 215, 135)`
- Background: `background(17, 24, 32)`
