# Uncertainty Principle — Sim Brief

## Concept & educational goal

Visualize Heisenberg's uncertainty principle Δx·Δp ≥ ħ/2 as a **live, interactive
trade-off**: dragging the σ_x slider squeezes the position-space wave packet and
simultaneously broadens its momentum-space Fourier transform — and vice versa.
The Gaussian is the unique minimum-uncertainty state where equality holds.
Non-Gaussian shapes show Δx·Δp strictly greater than ħ/2.

The "wow" moment: a single slider controls two panels simultaneously, making the
trade-off visceral rather than abstract.

---

## Physics (natural units: ħ = 1)

All distributions computed analytically — no FFT needed.

**Gaussian (minimum uncertainty):**
- ψ(x) = (2πσ²)^(-1/4) · exp(−x²/(4σ²)) · exp(ik₀x)
- |ψ(x)|² = Gaussian, std dev Δx = σ
- |φ(p)|² = Gaussian centered at k₀, std dev Δp = 1/(2σ)
- Product: Δx·Δp = **1/2** (minimum, shown as "= ħ/2")

**Two-peak (above minimum):**
- ψ(x) ∝ [exp(−(x−d)²/(4σ²)) + exp(−(x+d)²/(4σ²))] · exp(ik₀x)
- |ψ(x)|²: two bumps separated by 2d
- |φ(p)|²: cos²((p−k₀)·d) · exp(−(p−k₀)²·σ²) — Gaussian envelope with interference fringes
- Δx ≈ √(σ²+d²), Δp ≈ 1/(2σ) — product > 1/2
- Educational payoff: the two separated peaks create **fringes in momentum space**,
  exactly like a double-slit. Same math, same phenomenon.

**Chirped Gaussian (above minimum):**
- ψ(x) ∝ exp(−x²/(4σ²)) · exp(i(k₀x + α·x²/2)) — position-dependent phase
- |ψ(x)|²: same Gaussian position distribution as standard (same Δx)
- |φ(p)|²: broader Gaussian with std dev Δp = √(1/(4σ²) + α²σ²) > 1/(2σ)
- Product > 1/2 even though the position distribution looks identical
- Educational payoff: you can't tell from |ψ|² alone whether the state is near-minimum —
  the phase matters. Used in chirped-pulse amplification (Nobel 2018).

For all shapes: d = σ (peak separation equals envelope width) is a good default for two-peak.
Chirp parameter α = 1/σ² gives a visible but not extreme broadening.

---

## Canvas layout (layout-c)

```
┌─────────────────────────────┬──────────────────────────┬──────────┐
│  Position space  (left 47%) │  Momentum space (mid 47%)│ controls │
│  x-axis, |ψ(x)|², ψ real   │  p-axis, |φ(p)|², |φ|   │  (280px) │
├─────────────────────────────┴──────────────────────────┴──────────┤
│  Educational strip (full width, 240px)                             │
└────────────────────────────────────────────────────────────────────┘
```

**Position panel (left ~47% of canvas):**
- x-axis: −4σ_max to +4σ_max (fixed domain, e.g., −5 to +5 in natural units)
- |ψ(x)|²: teal fill (45,215,135,~35α) + teal stroke (2px)
- ψ(x) real part: accent blue (88,166,255), 1.5px stroke, drawn on same axis
- ψ(x) zero-line: dim axis at midheight
- Δx bracket: horizontal double-arrow centered at ⟨x⟩=0, spanning ±Δx
  - Purple (170,65,255), drawn above the distribution, labeled "Δx"
- ±Δx lines: dashed purple verticals at x = ±σ
- Panel title: "Position space  |ψ(x)|²"

**Momentum panel (right ~47% of canvas, excluding controls):**
- p-axis: −4σ_p_max to +4σ_p_max (rescales with σ to keep distribution visible — or fix domain)
  - Recommended: fix p domain at −6 to +6 (natural units). At small σ, distribution is wide; large σ, narrow. Both always fit.
- |φ(p)|²: teal fill + teal stroke
- Δp bracket: same style as Δx, labeled "Δp"
- ±Δp lines: dashed purple at p = k₀ ± Δp
- Panel title: "Momentum space  |φ(p)|²"

**Vertical divider** between panels: `stroke(30, 38, 50); strokeWeight(1)`

---

## Controls (right panel)

```
PANEL-HEADING: Wave Packet
  σ_x = [value]     [slider 0.3 – 2.5, step 0.05]  ← drives both panels live

PANEL-HEADING: Central Momentum
  k₀ = [value]      [slider −3 – +3, step 0.1]      ← shifts momentum peak only

PANEL-HEADING: Shape
  [Gaussian] [Two-peak] [Chirped]                    ← .shape-btn, active = teal

PANEL-HEADING: Readouts
  [energy-info pill] Δx = X.XX
  [energy-info pill] Δp = X.XX
  [energy-info pill] Δx·Δp = X.XX ħ/2              ← accent blue if ≈1.00, orange if >1.05
```

The Δx·Δp pill color-shifts: **blue** (= minimum) for Gaussian, **orange** (above minimum)
for two-peak and chirped — immediate visual feedback.

---

## Edu panels (two modes: 'uncertainty' and 'fourier')

Mode buttons in panel: **Principle** | **Fourier Dual**

**'uncertainty' panel (default):**
- Heading: "Heisenberg Uncertainty Principle"
- Explain position/momentum trade-off; Gaussian as minimum; Δx·Δp ≥ ħ/2
- Equation block: `Δx · Δp ≥ ħ/2`
- Callout (aside): electron microscope (high Δp → small Δx resolves atoms);
  particle accelerator beam focusing

**'fourier' panel:**
- Heading: "The Fourier Dual"
- Uncertainty is pure mathematics — any wave's spatial width and frequency spread
  are Fourier conjugates; same inequality holds for sound (Δt·Δν ≥ 1/4π)
- Equation block: `Δt · Δν ≥ 1/4π  (same inequality, time-frequency)`
- Callout: chirped-pulse amplification (Nobel 2018, Strickland & Mourou);
  short laser pulses necessarily have broad spectra; MRI pulse shaping

---

## Color language (identical to quantum series)

| Element | RGB | Notes |
|---------|-----|-------|
| ψ(x) real part | (88, 166, 255) | accent blue |
| |ψ|² / |φ|² fill | (45, 215, 135, 35) | teal, low alpha |
| |ψ|² / |φ|² stroke | (45, 215, 135, 200) | teal, solid |
| Δ brackets & dashed lines | (170, 65, 255) | purple |
| Classical / above-minimum | (255, 150, 50) | orange |
| Canvas background | `background(17, 24, 32)` | same as all sims |
| Axes / gridlines | (42, 50, 62) | dim |

---

## Reference sims

| What to copy | From |
|---|---|
| Layout, panel structure, HTML | `particle-in-a-box/index.html` |
| Mode-sensitive edu panel pattern | `particle-in-a-box/sketch.js` |
| Dual-panel canvas split + geometry | `blackbody-radiation/sketch.js` (`drawCavity` / `drawSpectrum`) |
| Color conventions & draw loop | Any quantum sim sketch.js |

---

## Gallery registration

- `SIM_SLUGS`: add `'uncertainty-principle'`
- `SIM_COLORS`: `'uncertainty-principle': 'linear-gradient(90deg, #a855f7, #2de2c0)'`
  (purple → teal, reflecting the dual-space theme)

---

## Implementation notes

- Compute everything analytically each frame — no DFT/FFT required
- y-scale both panels to the peak of |ψ|² (or normalize to 1); use a fixed scale
  that remains valid across the σ_x range
- ψ(x) real part oscillates rapidly for large k₀ — cap display at k₀ ≤ 3 so the
  oscillations remain visually legible (≥4 cycles visible across panel width)
- For two-peak shape: fix d = σ_x (separation tracks envelope width). This keeps
  the fringes visible at all σ_x values.
- For chirped shape: fix α = 1/σ_x² so the broadening is always moderate and visible
- The Δx·Δp product should be computed from the analytical expressions, not from
  numerical moments of the plotted distributions (more accurate, no sampling noise)
