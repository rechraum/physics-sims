// ─────────────────────────────────────────────────────────────────────────────
// Uncertainty Principle — sketch.js
//
// Two physics panels side by side:
//   Left  : Position space  |ψ(x)|²  +  ψ(x) real part
//   Right : Momentum space  |φ(p)|²
//
// Three wave packet shapes (all computed analytically, ħ = 1):
//   gaussian  : Δx = σ, Δp = 1/(2σ)     → Δx·Δp = 1/2  (minimum)
//   twopeak   : Δx = σ√2, Δp = 1/(2σ)   → Δx·Δp = √2/2 > 1/2
//   chirped   : Δx = σ, Δp = √5/(2σ)    → Δx·Δp = √5/2 > 1/2
//
// Color language (quantum series):
//   ψ(x) real part  : accent blue  (88, 166, 255)
//   |ψ|² / |φ|² fill: teal         (45, 215, 135, 35)
//   |ψ|² / |φ|² edge: teal         (45, 215, 135, 200)
//   Δ brackets/lines : purple       (170, 65, 255)
//   Above-minimum    : orange       (255, 150, 50)
//   Background       : (17, 24, 32)
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Edu panel content
// ─────────────────────────────────────────────────────────────────────────────
const EDU = {

  uncertainty: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Heisenberg Uncertainty Principle</p>
        <p class="edu-description">
          A quantum particle cannot simultaneously have a precise position <em>and</em> a
          precise momentum. Squeezing the wave packet in position (small &sigma;<sub>x</sub>)
          forces its Fourier transform in momentum space to spread wide &mdash; and vice versa.
          This is not a measurement limitation; it is a fundamental property of waves.
        </p>
        <p class="edu-description">
          The <strong>Gaussian</strong> wave packet achieves the minimum product exactly.
          Any other shape gives a strictly larger product. Try Two-peak or Chirped above.
        </p>
        <div class="equation">
          &Delta;x &thinsp;&middot;&thinsp; &Delta;p &nbsp;&ge;&nbsp; &hbar;/2
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">wave packet</span>
          <span class="edu-concept-tag">Fourier transform</span>
          <span class="edu-concept-tag">minimum uncertainty</span>
          <span class="edu-concept-tag">Gaussian state</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Real-world consequences</p>
          <p>
            <strong>Electron microscope:</strong> To image atoms (~0.1&nbsp;nm) the electron
            must be localized to &Delta;x &lt; 0.1&nbsp;nm. The uncertainty principle then
            demands &Delta;p &ge; &hbar;/(2&Delta;x) &mdash; the electron acquires a large
            transverse kick, which limits practical resolution and drives the design of
            aberration-corrected optics.
          </p>
          <p>
            <strong>Particle accelerator beams:</strong> A tightly focused beam (small
            transverse &Delta;x at the collision point) unavoidably has large angular
            spread (&Delta;p<sub>&perp;</sub>), traded off by beam optics.
          </p>
        </div>
      </div>
    </div>
  `,

  fourier: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">The Fourier Dual</p>
        <p class="edu-description">
          The uncertainty relation is pure mathematics. Any wave &mdash; light, sound, water &mdash;
          obeys the same conjugate inequality: the spatial width and the spectral width of its
          Fourier transform cannot both be arbitrarily small. In the time&ndash;frequency domain:
        </p>
        <div class="equation">
          &Delta;t &thinsp;&middot;&thinsp; &Delta;&nu; &nbsp;&ge;&nbsp; 1/(4&pi;)
        </div>
        <p class="edu-description">
          The <strong>Chirped</strong> shape above demonstrates a key subtlety: two states can
          have identical position distributions |&psi;(x)|&sup2; yet different Fourier transforms.
          The phase of the wave function &mdash; invisible in |&psi;|&sup2; &mdash; determines
          the momentum spread. Only by probing both spaces do you see the difference.
        </p>
        <div class="edu-concepts">
          <span class="edu-concept-tag">time&ndash;bandwidth product</span>
          <span class="edu-concept-tag">chirp</span>
          <span class="edu-concept-tag">conjugate variables</span>
          <span class="edu-concept-tag">Nobel 2018</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Chirped-pulse amplification (Nobel 2018)</p>
          <p>
            <strong>Strickland &amp; Mourou</strong> built the world&rsquo;s most intense
            laser pulses by exploiting the time&ndash;frequency dual. A short pulse
            (small &Delta;t) necessarily has a broad spectrum (&Delta;&nu; large). By
            <em>chirping</em> the pulse &mdash; stretching it in time so low frequencies
            lead and high frequencies trail &mdash; the peak power drops enough to amplify
            it safely, then a grating recompresses it to femtosecond duration.
          </p>
          <p>
            <strong>MRI pulse shaping:</strong> Radio-frequency pulses in MRI must
            excite a precise slice of tissue (&Delta;x small in frequency space) without
            saturating neighboring tissue. The time&ndash;bandwidth product bounds how
            sharply the excitation profile can be sculpted.
          </p>
        </div>
      </div>
    </div>
  `
};

function updateEduPanel(m) {
  const el = document.getElementById('sim-edu');
  if (el && EDU[m]) el.innerHTML = EDU[m];
}

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────
let eduMode = 'uncertainty';
let shape   = 'gaussian';   // 'gaussian' | 'twopeak' | 'chirped'
let sigma   = 1.0;
let k0      = 0.0;

// ─────────────────────────────────────────────────────────────────────────────
// Canvas geometry (recomputed on resize)
// ─────────────────────────────────────────────────────────────────────────────
const XMIN = -5, XMAX = 5;  // position domain (natural units)
const PMIN = -6, PMAX = 6;  // momentum domain

let divX;             // vertical divider x (canvas pixels)
let posP, momP;       // panel objects {x0, x1, y0, y1, cy}
let pxScale;          // pixels per unit amplitude (for distributions)
let psiAmpScale;      // pixels per unit amplitude (for ψ real part)

function computeGeometry() {
  divX = floor(width * 0.5);

  const padX = 18;
  const padT = 40;   // top: panel title + small margin
  const padB = 30;   // bottom: x-axis tick labels
  const zyFrac = 0.60;  // zero-line is 60% down from y0 toward y1

  const y0 = padT;
  const y1 = height - padB;
  const cy = y0 + (y1 - y0) * zyFrac;

  posP = { x0: padX,        x1: divX - padX, y0, y1, cy };
  momP = { x0: divX + padX, x1: width - padX, y0, y1, cy };

  // Scale: at σ=1 a normalized peak (value=1) fills 75% of the space above cy
  pxScale    = (cy - y0) * 0.75;
  psiAmpScale = pxScale * 0.50;  // ψ real part at half the density scale
}

// ─────────────────────────────────────────────────────────────────────────────
// p5 lifecycle
// ─────────────────────────────────────────────────────────────────────────────
function setup() {
  const cont = document.getElementById('canvas-container');
  createCanvas(cont.clientWidth, cont.clientHeight).parent('canvas-container');
  computeGeometry();
  textFont('Courier New');
  updateEduPanel('uncertainty');
}

function windowResized() {
  const cont = document.getElementById('canvas-container');
  resizeCanvas(cont.clientWidth, cont.clientHeight);
  computeGeometry();
}

// ─────────────────────────────────────────────────────────────────────────────
// Physics — analytical distributions (all normalized so peak = 1)
// ─────────────────────────────────────────────────────────────────────────────
function computeUncertainties() {
  let dx, dp;
  const alpha = 1 / (sigma * sigma);  // chirp parameter

  if (shape === 'gaussian') {
    dx = sigma;
    dp = 1 / (2 * sigma);
  } else if (shape === 'twopeak') {
    // d = σ; Δx ≈ √(σ²+d²) = σ√2; Δp = 1/(2σ)
    dx = sigma * Math.SQRT2;
    dp = 1 / (2 * sigma);
  } else {
    // chirped: same Δx as Gaussian, broader Δp
    dx = sigma;
    dp = Math.sqrt(1 / (4 * sigma * sigma) + alpha * alpha * sigma * sigma);
    // = sqrt(5) / (2σ) when α = 1/σ²
  }
  return { dx, dp, product: dx * dp };
}

// Position density — normalized to peak = 1
function posDistNorm(x) {
  if (shape === 'gaussian' || shape === 'chirped') {
    return Math.exp(-x * x / (2 * sigma * sigma));
  }
  // twopeak: |ψ(x)|² ∝ [G(x-d) + G(x+d)]²  where d=σ
  const d = sigma;
  const A = Math.exp(-(x - d) * (x - d) / (4 * sigma * sigma));
  const B = Math.exp(-(x + d) * (x + d) / (4 * sigma * sigma));
  const unnorm = (A + B) * (A + B);
  // peak at x=0: [2·exp(-d²/(4σ²))]² = 4·exp(-1/2) (with d=σ)
  return unnorm / (4 * Math.exp(-0.5));
}

// ψ(x) real part — normalized so envelope peak = 1
function psiRealNorm(x) {
  if (shape === 'gaussian') {
    return Math.exp(-x * x / (4 * sigma * sigma)) * Math.cos(k0 * x);
  }
  if (shape === 'twopeak') {
    const d = sigma;
    const A = Math.exp(-(x - d) * (x - d) / (4 * sigma * sigma));
    const B = Math.exp(-(x + d) * (x + d) / (4 * sigma * sigma));
    // Envelope peak at x=0: 2·exp(-d²/(4σ²)) = 2·exp(-0.25) (with d=σ)
    return ((A + B) / (2 * Math.exp(-0.25))) * Math.cos(k0 * x);
  }
  // chirped: position-dependent phase
  const alpha = 1 / (sigma * sigma);
  return Math.exp(-x * x / (4 * sigma * sigma)) * Math.cos(k0 * x + alpha * x * x / 2);
}

// Momentum density — normalized to peak = 1
function momDistNorm(p) {
  const dk = p - k0;
  if (shape === 'gaussian') {
    const dp = 1 / (2 * sigma);
    return Math.exp(-dk * dk / (2 * dp * dp));
  }
  if (shape === 'twopeak') {
    // |φ(p)|² ∝ cos²((p-k₀)·d) · exp(-(p-k₀)²·σ²)  with d=σ
    const d = sigma;
    const c = Math.cos(dk * d);
    return c * c * Math.exp(-dk * dk * sigma * sigma);
  }
  // chirped: broader Gaussian
  const alpha = 1 / (sigma * sigma);
  const dp2 = 1 / (4 * sigma * sigma) + alpha * alpha * sigma * sigma;
  return Math.exp(-dk * dk / (2 * dp2));
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM helpers
// ─────────────────────────────────────────────────────────────────────────────
function readControls() {
  sigma = +document.getElementById('sigma-x').value;
  k0    = +document.getElementById('k0').value;

  document.getElementById('sigma-x-val').textContent = sigma.toFixed(2);
  document.getElementById('k0-val').textContent      = k0.toFixed(1);

  const { dx, dp, product } = computeUncertainties();
  document.getElementById('delta-x-val').textContent = dx.toFixed(3);
  document.getElementById('delta-p-val').textContent = dp.toFixed(3);

  // Ratio to minimum (ħ/2 = 0.5 in natural units)
  const ratio = product * 2;   // = Δx·Δp / (ħ/2)
  const span  = document.getElementById('delta-xp-val');
  span.textContent = ratio.toFixed(3) + ' \u0127/2';

  const pill = document.getElementById('delta-xp-pill');
  if (ratio < 1.03) {
    pill.style.color       = '#58a6ff';
    pill.style.borderColor = 'rgba(88,166,255,0.35)';
  } else {
    pill.style.color       = 'rgb(255,150,50)';
    pill.style.borderColor = 'rgba(255,150,50,0.45)';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing helpers
// ─────────────────────────────────────────────────────────────────────────────
const PLOT_STEP = 2;  // px sampling interval for curves

function drawDivider() {
  stroke(30, 38, 50);
  strokeWeight(1);
  line(divX, 0, divX, height);
}

function drawPanelTitle(p, title) {
  noStroke();
  fill(120, 135, 155);
  textSize(10);
  textAlign(CENTER);
  text(title, (p.x0 + p.x1) / 2, p.y0 - 8);
  textAlign(LEFT);
}

// Axis ticks and zero-line for one panel
// domMin..domMax = physical coordinate range
// centerDom = physical value at canvas horizontal center of panel
function drawAxisTicks(p, domMin, domMax, centerLabel) {
  const panW = p.x1 - p.x0;

  // Zero-line (ψ = 0 axis inside panel)
  stroke(42, 50, 62);
  strokeWeight(1);
  line(p.x0, p.cy, p.x1, p.cy);

  // Bottom axis baseline
  stroke(42, 50, 62);
  line(p.x0, p.y1, p.x1, p.y1);

  // Tick marks and labels
  const range = domMax - domMin;
  const tickSpacing = range <= 10 ? 2 : 3;
  noStroke();
  fill(70, 85, 105);
  textSize(9);
  textAlign(CENTER);

  for (let v = Math.ceil(domMin / tickSpacing) * tickSpacing; v <= domMax; v += tickSpacing) {
    const px = map(v, domMin, domMax, p.x0, p.x1);
    stroke(42, 50, 62);
    strokeWeight(1);
    line(px, p.y1 - 4, px, p.y1);
    noStroke();
    fill(70, 85, 105);
    text(v, px, p.y1 + 11);
  }

  // Axis label
  fill(85, 100, 120);
  textSize(9);
  textAlign(RIGHT);
  text(centerLabel, p.x1, p.y1 + 11);
  textAlign(LEFT);
}

// Draw filled teal distribution (normalized peak → pxScale pixels)
function drawDistFill(p, distFn, domMin, domMax) {
  const panW = p.x1 - p.x0;
  noStroke();
  fill(45, 215, 135, 35);
  beginShape();
  vertex(p.x0, p.cy);
  for (let px = 0; px <= panW; px += PLOT_STEP) {
    const v = distFn(map(px, 0, panW, domMin, domMax));
    vertex(p.x0 + px, p.cy - v * pxScale);
  }
  vertex(p.x1, p.cy);
  endShape(CLOSE);
}

function drawDistStroke(p, distFn, domMin, domMax) {
  const panW = p.x1 - p.x0;
  stroke(45, 215, 135, 200);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let px = 0; px <= panW; px += PLOT_STEP) {
    const v = distFn(map(px, 0, panW, domMin, domMax));
    vertex(p.x0 + px, p.cy - v * pxScale);
  }
  endShape();
}

// Draw ψ(x) real part (accent blue)
function drawPsiReal(p) {
  const panW = p.x1 - p.x0;
  stroke(88, 166, 255);
  strokeWeight(1.5);
  noFill();
  beginShape();
  for (let px = 0; px <= panW; px += PLOT_STEP) {
    const x = map(px, 0, panW, XMIN, XMAX);
    const v = psiRealNorm(x);
    vertex(p.x0 + px, p.cy - v * psiAmpScale);
  }
  endShape();
}

// Draw double-arrow bracket + label at a given y, spanning x1 to x2 (canvas px)
function drawBracket(x1, x2, y, label) {
  if (abs(x2 - x1) < 4) return;  // too small to draw
  stroke(170, 65, 255);
  strokeWeight(1.5);
  // Horizontal shaft
  line(x1, y, x2, y);
  // Left arrowhead
  const aw = 5;
  line(x1, y, x1 + aw, y - aw * 0.7);
  line(x1, y, x1 + aw, y + aw * 0.7);
  // Right arrowhead
  line(x2, y, x2 - aw, y - aw * 0.7);
  line(x2, y, x2 - aw, y + aw * 0.7);
  // Label above center
  noStroke();
  fill(170, 65, 255);
  textSize(10);
  textAlign(CENTER);
  text(label, (x1 + x2) / 2, y - 7);
  textAlign(LEFT);
}

// Draw dashed vertical lines at x = center ± delta (domain units) within panel
function drawDeltaLines(p, domMin, domMax, center, delta) {
  const vx1 = map(center - delta, domMin, domMax, p.x0, p.x1);
  const vx2 = map(center + delta, domMin, domMax, p.x0, p.x1);
  drawingContext.setLineDash([3, 5]);
  stroke(170, 65, 255, 150);
  strokeWeight(1);
  if (vx1 >= p.x0 && vx1 <= p.x1) line(vx1, p.y0 + 5, vx1, p.y1 - 5);
  if (vx2 >= p.x0 && vx2 <= p.x1) line(vx2, p.y0 + 5, vx2, p.y1 - 5);
  drawingContext.setLineDash([]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main panels
// ─────────────────────────────────────────────────────────────────────────────
function drawPositionPanel() {
  const { dx } = computeUncertainties();

  drawPanelTitle(posP, 'Position space   |\u03C8(x)|\u00B2');
  drawAxisTicks(posP, XMIN, XMAX, 'x');

  drawDistFill(posP, posDistNorm, XMIN, XMAX);
  drawPsiReal(posP);   // ψ real part behind the density stroke
  drawDistStroke(posP, posDistNorm, XMIN, XMAX);

  // Δx bracket: above the distribution, spanning ±Δx around x=0
  const dxPx = dx * (posP.x1 - posP.x0) / (XMAX - XMIN);
  const cxPx = (posP.x0 + posP.x1) / 2;  // x=0 is at canvas center of panel
  drawBracket(cxPx - dxPx, cxPx + dxPx, posP.y0 + 14, '\u0394x');

  drawDeltaLines(posP, XMIN, XMAX, 0, dx);
}

function drawMomentumPanel() {
  const { dp } = computeUncertainties();

  drawPanelTitle(momP, 'Momentum space   |\u03C6(p)|\u00B2');
  drawAxisTicks(momP, PMIN, PMAX, 'p');

  drawDistFill(momP, momDistNorm, PMIN, PMAX);
  drawDistStroke(momP, momDistNorm, PMIN, PMAX);

  // Δp bracket: centered at k₀, spanning ±Δp
  const dpPx   = dp * (momP.x1 - momP.x0) / (PMAX - PMIN);
  const k0Px   = map(k0, PMIN, PMAX, momP.x0, momP.x1);
  drawBracket(k0Px - dpPx, k0Px + dpPx, momP.y0 + 14, '\u0394p');

  drawDeltaLines(momP, PMIN, PMAX, k0, dp);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main draw loop
// ─────────────────────────────────────────────────────────────────────────────
function draw() {
  background(17, 24, 32);
  readControls();
  drawDivider();
  drawPositionPanel();
  drawMomentumPanel();
}

// ─────────────────────────────────────────────────────────────────────────────
// Mode switching (called from HTML)
// ─────────────────────────────────────────────────────────────────────────────
function setShape(s) {
  shape = s;
  document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('shape-btn-' + s);
  if (btn) btn.classList.add('active');
}

function setEduMode(m) {
  eduMode = m;
  document.querySelectorAll('.edu-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('edu-btn-' + m);
  if (btn) btn.classList.add('active');
  updateEduPanel(m);
}
