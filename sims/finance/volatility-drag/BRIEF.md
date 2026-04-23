# Volatility Drag & Entropy — Sim Brief

## Concept & educational goal

Every investor has heard "average 10% per year." Almost no one realises that the *average*
return and the *actual* return of a compounding portfolio are different numbers — and the
gap between them is determined by volatility. This hidden tax is called **volatility drag**,
and its formula, σ²/2, is identical to the entropy production term in thermodynamics, the
Itô correction in stochastic calculus, and Jensen's inequality applied to logarithms.

Two investors start with $1,000. Both are told the arithmetic average return is μ. But the
market is volatile (σ > 0). Investor A compounds at the arithmetic rate each year. Investor B
actually experiences the volatile market. After 20 years, Investor B has noticeably less
money — and the gap has nothing to do with bad luck. It is geometric, structural, and
inevitable.

**Layperson variables glossary** (shown prominently on canvas):
- **Return r** — the percentage gain or loss in one year. If you start with $100 and end
  with $110, your return is 10%.
- **Arithmetic mean μ** — simple average return: add up all yearly returns and divide.
  The headline number quoted by most funds and advisors.
- **Geometric mean g** — your *actual* compound return: the constant annual rate that
  produces your observed end wealth. Always ≤ μ.
- **Volatility σ** — how much returns jump around year to year. Low σ = steady;
  high σ = wild swings. Measured as the standard deviation of annual returns.
- **Volatility drag** — the gap between arithmetic and geometric mean: g = μ − σ²/2.
  Higher volatility → bigger drag, even with the same average.
- **Log-normal distribution** — the bell curve that describes a portfolio's value after many
  compounding periods. Its peak is at the *geometric* mean, not the arithmetic mean.
- **Jensen's inequality** — the mathematical law that causes the drag. For any curved
  (convex) function, the average of outputs is *less than* the output of the average.
  Compounding is such a function: E[e^X] > e^{E[X]}.

The "wow" moments:
1. **σ = 0: no drag** — both investors finish identically. Increase σ and the gap
   appears immediately, widening every year.
2. **Drag can exceed the return** — at σ = 50% and μ = 10%, the geometric mean is
   10% − 12.5% = −2.5%. A positive average return that *still loses money over time*.
3. **The distribution shifts left** — on the return distribution panel, the teal geometric
   mean marker sits to the left of the gold arithmetic mean marker, and the gap equals
   exactly σ²/2. This is Jensen's inequality made visible.
4. **Entropy link appears** — the same σ²/2 term is the irreversibility cost in Itô's
   lemma, the entropy production in a diffusing log-normal process. Volatility is entropy.

---

## Physics

### Arithmetic vs geometric compounding

For a portfolio with i.i.d. log-normally distributed annual returns:

```
Annual log-return:  x ~ N(μ − σ²/2,  σ²)

Arithmetic mean:    E[r] = μ          (per year, simple)
Geometric mean:     g    = μ − σ²/2   (per year, compound)
```

After T years, expected portfolio value:
```
Arithmetic path:   V_arith(T) = V_0 · e^(μ · T)          ← mean of the distribution
Geometric path:    V_geom(T)  = V_0 · e^((μ − σ²/2) · T)  ← median = typical outcome
```

The two are related by Jensen's inequality:
```
E[e^X] = e^{E[X] + σ²/2}     (for X ~ N(μ, σ²))
```

The drag term σ²/2 is also the Itô correction in stochastic calculus:
```
d(ln S) = (μ − σ²/2) dt + σ dW    ← the actual geometric return
```

### Ensemble of paths

Simulate N paths using discrete annual log-returns x_i ~ N(μ − σ²/2, σ²):
```
V_t = V_0 · exp(Σ_{i=1}^{t} x_i)
```

The arithmetic mean path follows E[V_t] = V_0 · e^{μt}.
The geometric mean path follows V_0 · e^{gt} = median of the log-normal distribution.

At each time T, the distribution of log(V_T) is:
```
log(V_T) ~ N((μ − σ²/2) · T,  σ² · T)
```

### Return distribution (right panel)

Single-period log-return density (shown per year):
```
f(x) = (1 / σ√(2π)) · exp(−(x − (μ − σ²/2))² / (2σ²))
```

Arithmetic mean location on this curve: x = μ (always to the right of the peak).
Geometric mean location: x = μ − σ²/2 (the peak itself — the most likely outcome).
The gap between them is always exactly σ²/2.

### Recommended default parameters

| Parameter | Default | Range |
|-----------|---------|-------|
| μ (arithmetic mean) | 10% | 0%–30% |
| σ (volatility) | 20% | 5%–80% |
| T (time horizon) | 25 years | 1–50 years |
| N paths | 50 | toggle on/off |

---

## Canvas layout (layout-c)

```
┌──────────────────────────────────┬──────────────────────────┬──────────┐
│  PORTFOLIO GROWTH  (~55%)        │  RETURN DISTRIBUTION     │ controls │
│  log-scale time series           │  (~45%)                  │  (280px) │
│  ensemble paths + mean lines     │  bell curve, mean markers│          │
│  shaded drag gap                 │  drag = σ²/2 annotation  │          │
├──────────────────────────────────┴──────────────────────────┴──────────┤
│  Educational strip (240px)                                               │
└──────────────────────────────────────────────────────────────────────────┘
```

### Portfolio growth panel (left ~55%)

- **X-axis**: Time in years (0 to T). Labelled every 5 years.
- **Y-axis**: Portfolio value on a **log scale** (e.g., $1k → $1M). Log scale makes
  compound growth appear as straight lines — crucial for seeing the drag clearly.
- **Ensemble paths** (N paths): drawn first as faint purple lines
  `rgba(170, 65, 255, 0.12)`. Each path is a random realisation of the volatile market.
- **Arithmetic mean path**: thick gold curve `rgb(255, 195, 50)`, 2.5px. Labelled
  "Arithmetic mean (μ = X%)" at the right terminus.
- **Geometric mean path**: thick accent-blue curve `rgb(88, 166, 255)`, 2.5px. Labelled
  "Geometric mean (μ − σ²/2 = X%)" at right terminus.
- **Drag shading**: the region between the two mean lines is filled with a low-alpha
  crimson `rgba(220, 55, 75, 0.15)`. At the right edge, a brace annotation:
  "Drag after T yr: [value]%".
- **Current time marker**: thin vertical teal dashed line that the user can drag
  horizontally to explore different time horizons; readout above shows current
  arithmetic vs geometric values at that year.
- **Panel title**: "Portfolio Growth (log scale)"

### Return distribution panel (right ~45%)

- **X-axis**: Annual log-return x, from (μ − 4σ) to (μ + 4σ). Tick marks every σ.
- **Y-axis**: Probability density (unlabelled — we care about shape, not scale).
- **Bell curve fill**: purple `rgba(170, 65, 255, 0.3)` fill beneath the curve, purple
  stroke `rgb(170, 65, 255)` 1.5px. This is the distribution of single-period returns.
- **Geometric mean marker**: vertical accent-blue line `rgb(88, 166, 255)`, 2px solid,
  at x = μ − σ²/2. Label above: "Geometric mean (most likely)".
- **Arithmetic mean marker**: vertical gold line `rgb(255, 195, 50)`, 2px solid,
  at x = μ. Label above: "Arithmetic mean (average)".
- **Drag annotation**: horizontal double-headed arrow between the two markers, label:
  "Drag = σ²/2 = [value]%". Colour: crimson `rgb(220, 55, 75)`.
- **Entropy connection callout** (small text, teal, bottom-right of panel):
  "σ²/2 = Itô correction = entropy production"
- **Panel title**: "Annual Return Distribution"

---

## Controls (right panel, 280px)

```
PANEL-HEADING: Returns
  μ (avg return)  [slider 0%–30%, step 0.5%]
  σ (volatility)  [slider 5%–80%, step 1%]
  g = μ − σ²/2 = [computed, accent-blue, read-only]

PANEL-HEADING: Horizon
  T (years)  [slider 1–50, step 1]

PANEL-HEADING: Paths
  [Show Ensemble]  ← toggle, default ON
  N = [slider 10–200, step 10]
  [Resimulate]

PANEL-HEADING: Explore
  [Jensen's Inequality]  [Entropy Cost]  [Log-Normal]
```

Notes:
- When σ is large enough that g < 0, show a small orange warning: "Geometric mean is
  negative — volatile assets lose money on average even with μ > 0."
- [Resimulate] regenerates all N random paths without changing parameters — shows
  different realisations of the same market.
- The g readout turns orange when g < 0, teal when g > 0.

---

## Edu panels (three modes)

### 'jensen' (default)

- Heading: "Jensen's Inequality & Volatility Drag"
- When you flip a coin for $1 up or $1 down, your average is break-even. But your average
  *wealth* after compounding many flips is *less* than break-even. The culprit is the shape
  of the compounding function: multiplying by (1+r) is a *curved* function of r. Jensen's
  inequality says: for any curved (convex) function, the *average of outputs* is less than
  the *output of the average*. Compounding is convex: E[1+r]^T > (E[1+r])^T is false — it's
  the other way. The exact cost is σ²/2 per year, and it compounds just like a negative
  return: over 25 years at σ=20%, a fund advertising 10% average actually delivers only
  8% geometric — losing 40% of the promised terminal wealth.
- Equation block:
  `g = μ − σ²/2`
  `E[V_T] = V_0 · e^{μT}`   `  Typical V_T = V_0 · e^{gT}`
- Callout: The drag is symmetric in a surprising way: high-return, high-volatility assets
  are no better than moderate-return, low-volatility assets if their geometric means are
  equal. This is why diversification improves geometric returns — reducing σ always
  increases g for the same μ.

### 'entropy'

- Heading: "Volatility is Entropy"
- The term σ²/2 appears in three places simultaneously: (1) Jensen's inequality, as the
  cost of convex averaging; (2) Itô's lemma in stochastic calculus, as the correction
  between log-price dynamics and price dynamics; and (3) thermodynamic entropy production
  for a diffusing log-normal distribution. These are not coincidences — they are the same
  mathematical fact viewed from three disciplines. A volatile portfolio is a **diffusing
  gas**: each annual return is a random kick, and the distribution of wealth spreads out
  over time like molecules dispersing. The drag is the price of that irreversibility: just
  as entropy measures how much of a heat engine's input is "wasted" as disorder, σ²/2
  measures how much of an investor's average return is "wasted" as variance.
  The connection to Maxwell-Boltzmann: log-normal returns have the same mathematical form
  as the Maxwell-Boltzmann speed distribution. High-σ portfolio = hotter gas.
- Equation block:
  `d(ln S) = (μ − σ²/2) dt + σ dW`    ← Itô's lemma
  `Entropy production rate ∝ σ²/2`
- Callout: This is why volatility-targeting strategies work: holding volatility constant
  over time maximises the geometric return for a given drift μ. It is the financial
  analogue of the Carnot prescription: run the engine at optimal speed to minimise entropy
  production.

### 'lognormal'

- Heading: "The Log-Normal Distribution"
- After T years, your portfolio's value follows a **log-normal distribution**: the
  logarithm of your wealth is normally distributed. This means the most likely outcome
  (the peak of the distribution) is *below* the average — because a small number of
  spectacular outcomes pull the mean to the right. As T grows, the distribution spreads
  wider on a linear scale. On a log scale (as in the left panel), it spreads uniformly —
  which is why log scale is the natural way to view long-run portfolio growth. The
  arithmetic mean is always the *right-tail average*; the geometric mean is the *typical*
  (median) investor's experience.
- Equation block:
  `log(V_T) ~ N((μ − σ²/2)·T,  σ²·T)`
  `Median(V_T) = V_0 · e^{(μ − σ²/2)·T} = V_0 · e^{gT}`
- Callout: A fund can report a true 15% arithmetic average annual return over 20 years
  while delivering a *negative* geometric return — if σ is large enough. Regulators in many jurisdictions now require disclosure of
  both arithmetic and geometric (time-weighted) returns.

---

## Color language

| Element | RGB | Notes |
|---------|-----|-------|
| Arithmetic mean path | (255, 195, 50) | gold — the "advertised" number |
| Geometric mean path | (88, 166, 255) | accent blue — the actual outcome |
| Ensemble paths | (170, 65, 255) | purple, low alpha (0.12) |
| Drag shading (gap) | (220, 55, 75) | crimson, very low alpha (0.15) |
| Drag annotation arrow | (220, 55, 75) | crimson |
| Return distribution fill | (170, 65, 255) | purple, alpha 0.30 |
| Geometric mean marker | (88, 166, 255) | accent blue vertical line |
| Arithmetic mean marker | (255, 195, 50) | gold vertical line |
| Entropy callout text | (45, 215, 135) | teal — thermo bridge |
| g readout (positive) | (45, 215, 135) | teal |
| g readout (negative) | (255, 150, 50) | orange warning |
| Background | `background(17, 24, 32)` | |
| Axes / dividers | (30, 38, 50) | dim |

---

## Reference sims

| What to copy | From |
|---|---|
| Layout, HTML structure, edu strip | `carnot-engine/index.html` |
| `computeGeometry`, `EDU`, `updateEduPanel` | `uncertainty-principle/sketch.js` |
| Log-normal path simulation | `maxwell-boltzmann/sketch.js` (distribution drawing) |
| Draggable time-marker | `carnot-engine/sketch.js` (cycle dot interaction) |
| Mode toggle | `maxwells-demon/sketch.js` |

---

## Gallery registration

- `SIM_SLUGS`: add `'volatility-drag'`
- `SIM_COLORS`: `'volatility-drag': 'linear-gradient(90deg, #ffc332, #58a6ff)'`
  (gold → accent blue: arithmetic illusion → geometric reality)
- `meta.json` tags: `["finance", "thermodynamics", "statistical mechanics"]`
- `difficulty`: `"beginner"`

---

## Implementation notes

### Generating log-normal paths

Use Box-Muller or the p5 randomGaussian() function:
```javascript
// Per year, per path:
function logReturn(mu, sigma) {
  return (mu - sigma**2 / 2) + sigma * randomGaussian(0, 1);
}

function generatePath(mu, sigma, T, V0) {
  let path = [V0];
  for (let t = 1; t <= T; t++) {
    path.push(path[t-1] * Math.exp(logReturn(mu, sigma)));
  }
  return path;
}
```

The arithmetic mean path is deterministic: `V_arith[t] = V0 * Math.exp(mu * t)`.
The geometric mean path is deterministic: `V_geom[t]  = V0 * Math.exp((mu - sigma**2/2) * t)`.
Only the ensemble paths are stochastic.

### Log-scale mapping

Map Y (portfolio value) to canvas coordinates:
```javascript
function logYtoCanvas(V, Vmin, Vmax, yTop, yBot) {
  const frac = (Math.log(V) - Math.log(Vmin)) / (Math.log(Vmax) - Math.log(Vmin));
  return yBot - frac * (yBot - yTop);
}
```
Set Vmin = V0 / 2 and Vmax = V_arith[T] * 2 to give breathing room.

### Distribution curve

Draw the Gaussian PDF on the right panel:
```javascript
const mu_log = mu - sigma**2 / 2;   // peak location = geometric mean
function pdf(x) {
  return Math.exp(-(x - mu_log)**2 / (2 * sigma**2)) / (sigma * Math.sqrt(2*Math.PI));
}
```
Sample 200 points across ±4σ from μ. Scale Y to fill the panel height.

### Drag annotation

The drag brace on the left panel: draw at x = canvasX(T) and span from
`logYtoCanvas(V_arith[T], ...)` to `logYtoCanvas(V_geom[T], ...)`. Use a vertical
bracket shape (two horizontal nubs + vertical line). Label: "Drag: [V_arith[T] - V_geom[T]]
= [((V_arith[T]/V_geom[T]) - 1)*100]%".

---

## Optional extensions

- **Rebalancing bonus**: add a third path showing a rebalanced two-asset portfolio
  (stocks + cash, rebalanced annually). The rebalancing bonus (~σ²/4 per year) partially
  offsets drag — demonstrating that diversification and rebalancing are free lunches.
- **Historical data mode**: import annual S&P 500 returns and show real arithmetic vs
  geometric mean, letting the user compare theory to actual market history.
- **Sharpe ratio overlay**: show iso-Sharpe curves on a (μ, σ) space panel; the Sharpe
  ratio maximiser is different from the Kelly criterion maximiser (next sim).
- **Leverage slider**: allow μ and σ to scale by a leverage factor L; show how leverage
  amplifies both return and drag, with the optimal leverage being f* = Kelly fraction.
