// ─────────────────────────────────────────────────────────────────────────────
// Uncertainty Principle — sketch.js
//
// Three modes (set via setMode()):
//   measure     : bouncing wave packet + interactive measurement + collapse
//   uncertainty : static dual-panel explore (default edu content)
//   fourier     : static dual-panel explore (fourier edu content)
//
// Physics (ħ = 1, natural units):
//   Gaussian  : Δx = σ,   Δp = 1/(2σ)      → product = 1/2 (minimum)
//   Two-peak  : Δx = σ√2, Δp = 1/(2σ)      → product = √2/2 > 1/2
//   Chirped   : Δx = σ,   Δp = √5/(2σ)     → product = √5/2 > 1/2
//
//   Bouncing packet: xc(t) = A·cos(ω·t),  pc(t) = −Aω·sin(ω·t)
//   Post-collapse spreading: σ(t) = σ₀·√(1 + (t/(2σ₀²))²)
//
// Color language (quantum series):
//   ψ real part  : accent blue  (88, 166, 255)
//   |ψ|² fill    : teal         (45, 215, 135, 35)
//   |ψ|² stroke  : teal         (45, 215, 135, 200)
//   Δ brackets   : purple       (170, 65, 255)
//   Background   : (17, 24, 32)
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Edu panel content
// ─────────────────────────────────────────────────────────────────────────────
const EDU = {

  measure: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Measurement &amp; Uncertainty</p>
        <p class="edu-description">
          The particle (teal) bounces as a Gaussian wave packet — it has a well-defined
          but nonzero spread in both position and momentum simultaneously.
          Choose what to measure and how precisely, then click <strong>Measure!</strong>
          The outcome is random, sampled from |&psi;|&sup2;. Watch both panels
          update: the measured variable collapses to your chosen resolution,
          and the conjugate variable immediately broadens to compensate.
        </p>
        <div class="equation">
          &Delta;x<sub>meas</sub> &thinsp;&middot;&thinsp; &Delta;p<sub>after</sub>
          &nbsp;=&nbsp; &hbar;/2
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">wave function collapse</span>
          <span class="edu-concept-tag">quantum measurement</span>
          <span class="edu-concept-tag">uncertainty principle</span>
          <span class="edu-concept-tag">Gaussian spreading</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Heisenberg&rsquo;s microscope</p>
          <p>
            To see an electron you must bounce a photon off it. A short-wavelength
            photon resolves position precisely (&Delta;x small) but delivers a large,
            uncertain momentum kick (&Delta;p large). A long-wavelength photon is
            gentle (small &Delta;p) but blurry (large &Delta;x). Move the
            <em>Precision</em> slider and watch the consequence play out in
            real time on both panels &mdash; before you even fire.
          </p>
        </div>
      </div>
    </div>
  `,

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
            transverse kick, driving the design of aberration-corrected optics.
          </p>
          <p>
            <strong>Particle accelerator beams:</strong> A tightly focused beam (small
            transverse &Delta;x) unavoidably has large angular spread (&Delta;p<sub>&perp;</sub>),
            traded off by beam optics.
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
          The <strong>Chirped</strong> shape demonstrates a key subtlety: two states can have
          identical |&psi;(x)|&sup2; yet different momentum spreads. The phase of the wave
          function &mdash; invisible in |&psi;|&sup2; &mdash; determines &Delta;p.
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
            <strong>Strickland &amp; Mourou</strong> built the world&rsquo;s most intense laser
            pulses by exploiting the time&ndash;frequency dual. A short pulse (small &Delta;t)
            necessarily has a broad spectrum. By <em>chirping</em> the pulse &mdash; stretching
            it so low frequencies lead and high frequencies trail &mdash; the peak power drops
            enough to amplify safely, then a grating recompresses it to femtosecond duration.
          </p>
          <p>
            <strong>MRI pulse shaping:</strong> RF pulses must excite a precise tissue slice
            without saturating neighbors. The time&ndash;bandwidth product bounds how sharply
            the excitation profile can be sculpted.
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
let mode  = 'measure';   // 'measure' | 'uncertainty' | 'fourier'
let shape = 'gaussian';  // explore mode shape
let sigma = 1.0;
let k0    = 0.0;

// Measure mode
let measureType  = 'position';  // 'position' | 'momentum'
let measurePrec  = 0.6;
let measurePhase = 'bouncing';  // 'bouncing' | 'collapsed'
let bounceT      = 0;
let collapseT    = 0;

// Saved at moment of firing
let preXc     = 0;
let prePc     = 0;
let xMeasured = 0;
let pMeasured = 0;

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const XMIN       = -5;
const XMAX       =  5;
const PMIN       = -6;
const PMAX       =  6;
const PLOT_STEP  =  2;    // px sampling interval

const BOUNCE_AMP   = 2.8;
const BOUNCE_OMEGA = 0.5;
const PART_SIGMA   = 0.7;  // particle wave packet width (fixed)

// ─────────────────────────────────────────────────────────────────────────────
// Canvas geometry
// ─────────────────────────────────────────────────────────────────────────────
let divX;
let posP, momP;
let pxScale, psiAmpScale;

function computeGeometry() {
  divX = floor(width * 0.5);

  const padX  = 18;
  const padT  = 40;
  const padB  = 30;
  const y0    = padT;
  const y1    = height - padB;
  const cy    = y0 + (y1 - y0) * 0.60;

  posP = { x0: padX,        x1: divX - padX, y0, y1, cy };
  momP = { x0: divX + padX, x1: width - padX, y0, y1, cy };

  pxScale     = (cy - y0) * 0.75;
  psiAmpScale = pxScale * 0.50;
}

// ─────────────────────────────────────────────────────────────────────────────
// p5 lifecycle
// ─────────────────────────────────────────────────────────────────────────────
function setup() {
  const cont = document.getElementById('canvas-container');
  createCanvas(cont.clientWidth, cont.clientHeight).parent('canvas-container');
  computeGeometry();
  textFont('Courier New');
  updateEduPanel('measure');
}

function windowResized() {
  const cont = document.getElementById('canvas-container');
  resizeCanvas(cont.clientWidth, cont.clientHeight);
  computeGeometry();
}

// ─────────────────────────────────────────────────────────────────────────────
// Physics — explore mode (analytical, normalized to peak = 1)
// ─────────────────────────────────────────────────────────────────────────────
function computeUncertainties() {
  let dx, dp;
  if (shape === 'gaussian') {
    dx = sigma;
    dp = 1 / (2 * sigma);
  } else if (shape === 'twopeak') {
    dx = sigma * Math.SQRT2;
    dp = 1 / (2 * sigma);
  } else {
    dx = sigma;
    dp = Math.sqrt(5) / (2 * sigma);
  }
  return { dx, dp, product: dx * dp };
}

function posDistNorm(x) {
  if (shape !== 'twopeak') {
    return Math.exp(-x * x / (2 * sigma * sigma));
  }
  const d = sigma;
  const A = Math.exp(-(x - d) * (x - d) / (4 * sigma * sigma));
  const B = Math.exp(-(x + d) * (x + d) / (4 * sigma * sigma));
  return (A + B) * (A + B) / (4 * Math.exp(-0.5));
}

function psiRealNorm(x) {
  if (shape === 'gaussian') {
    return Math.exp(-x * x / (4 * sigma * sigma)) * Math.cos(k0 * x);
  }
  if (shape === 'twopeak') {
    const d = sigma;
    const A = Math.exp(-(x - d) * (x - d) / (4 * sigma * sigma));
    const B = Math.exp(-(x + d) * (x + d) / (4 * sigma * sigma));
    return ((A + B) / (2 * Math.exp(-0.25))) * Math.cos(k0 * x);
  }
  const alpha = 1 / (sigma * sigma);
  return Math.exp(-x * x / (4 * sigma * sigma)) * Math.cos(k0 * x + alpha * x * x / 2);
}

function momDistNorm(p) {
  const dk = p - k0;
  if (shape === 'gaussian') {
    const dp = 1 / (2 * sigma);
    return Math.exp(-dk * dk / (2 * dp * dp));
  }
  if (shape === 'twopeak') {
    const d = sigma;
    const c = Math.cos(dk * d);
    return c * c * Math.exp(-dk * dk * sigma * sigma);
  }
  const alpha = 1 / (sigma * sigma);
  const dp2 = 1 / (4 * sigma * sigma) + alpha * alpha * sigma * sigma;
  return Math.exp(-dk * dk / (2 * dp2));
}

// ─────────────────────────────────────────────────────────────────────────────
// Physics — measure mode
// ─────────────────────────────────────────────────────────────────────────────
function getBounceCenters(t) {
  const xc = BOUNCE_AMP * Math.cos(BOUNCE_OMEGA * t);
  const pc = -BOUNCE_AMP * BOUNCE_OMEGA * Math.sin(BOUNCE_OMEGA * t);
  return { xc, pc };
}

function sampleGaussian(mu, sig) {
  const u1 = Math.random() || 1e-10;
  const u2 = Math.random();
  return mu + sig * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Free Gaussian spreading: σ(t) = σ₀√(1 + (t/(2σ₀²))²)
function spreadSigma(sigma0, tPhys) {
  return sigma0 * Math.sqrt(1 + Math.pow(tPhys / (2 * sigma0 * sigma0), 2));
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

  const ratio = product * 2;
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

function readMeasureControls() {
  measurePrec = +document.getElementById('measure-prec').value;
  document.getElementById('measure-prec-val').textContent = measurePrec.toFixed(2);
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing helpers — shared
// ─────────────────────────────────────────────────────────────────────────────
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

function drawAxisTicks(p, domMin, domMax, axisLabel) {
  const panW = p.x1 - p.x0;

  stroke(42, 50, 62);
  strokeWeight(1);
  line(p.x0, p.cy, p.x1, p.cy);
  line(p.x0, p.y1, p.x1, p.y1);

  const range = domMax - domMin;
  const tickSpacing = range <= 10 ? 2 : 3;
  textSize(9);
  textAlign(CENTER);

  for (let v = Math.ceil(domMin / tickSpacing) * tickSpacing; v <= domMax; v += tickSpacing) {
    const px = map(v, domMin, domMax, p.x0, p.x1);
    stroke(42, 50, 62);
    strokeWeight(1);
    line(px, p.y1 - 4, px, p.y1);
    noStroke();
    fill(65, 80, 100);
    text(v, px, p.y1 + 11);
  }

  noStroke();
  fill(80, 95, 115);
  textSize(9);
  textAlign(RIGHT);
  text(axisLabel, p.x1, p.y1 + 11);
  textAlign(LEFT);
}

// Standard teal filled distribution
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

// Standard teal stroke
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

// Dim dashed teal ghost (pre-measurement state)
function drawDistGhostTeal(p, distFn, domMin, domMax) {
  const panW = p.x1 - p.x0;
  drawingContext.setLineDash([2, 5]);
  stroke(45, 215, 135, 55);
  strokeWeight(1.5);
  noFill();
  beginShape();
  for (let px = 0; px <= panW; px += PLOT_STEP) {
    const v = distFn(map(px, 0, panW, domMin, domMax));
    vertex(p.x0 + px, p.cy - v * pxScale);
  }
  endShape();
  drawingContext.setLineDash([]);
}

// Dashed purple ghost (predicted post-measurement)
function drawDistGhostPurple(p, distFn, domMin, domMax) {
  const panW = p.x1 - p.x0;
  drawingContext.setLineDash([3, 4]);
  stroke(170, 65, 255, 130);
  strokeWeight(1.5);
  noFill();
  beginShape();
  for (let px = 0; px <= panW; px += PLOT_STEP) {
    const v = distFn(map(px, 0, panW, domMin, domMax));
    vertex(p.x0 + px, p.cy - v * pxScale);
  }
  endShape();
  drawingContext.setLineDash([]);
}

// ψ(x) real part for explore mode
function drawPsiReal(p) {
  const panW = p.x1 - p.x0;
  stroke(88, 166, 255);
  strokeWeight(1.5);
  noFill();
  beginShape();
  for (let px = 0; px <= panW; px += PLOT_STEP) {
    const x = map(px, 0, panW, XMIN, XMAX);
    vertex(p.x0 + px, p.cy - psiRealNorm(x) * psiAmpScale);
  }
  endShape();
}

// ψ(x) real part with custom function (measure mode)
function drawPsiRealFn(p, fn, domMin, domMax) {
  const panW = p.x1 - p.x0;
  stroke(88, 166, 255);
  strokeWeight(1.5);
  noFill();
  beginShape();
  for (let px = 0; px <= panW; px += PLOT_STEP) {
    const x = map(px, 0, panW, domMin, domMax);
    vertex(p.x0 + px, p.cy - fn(x) * psiAmpScale);
  }
  endShape();
}

// Double-arrow bracket at y spanning x1→x2 canvas px
function drawBracket(x1, x2, y, label) {
  if (x2 - x1 < 6) return;
  stroke(170, 65, 255);
  strokeWeight(1.5);
  line(x1, y, x2, y);
  const aw = 5;
  line(x1, y, x1 + aw, y - aw * 0.7);
  line(x1, y, x1 + aw, y + aw * 0.7);
  line(x2, y, x2 - aw, y - aw * 0.7);
  line(x2, y, x2 - aw, y + aw * 0.7);
  noStroke();
  fill(170, 65, 255);
  textSize(10);
  textAlign(CENTER);
  text(label, (x1 + x2) / 2, y - 7);
  textAlign(LEFT);
}

// Dashed vertical lines at domain center ± delta
function drawDeltaLines(p, domMin, domMax, center, delta) {
  const v1 = map(center - delta, domMin, domMax, p.x0, p.x1);
  const v2 = map(center + delta, domMin, domMax, p.x0, p.x1);
  drawingContext.setLineDash([3, 5]);
  stroke(170, 65, 255, 140);
  strokeWeight(1);
  if (v1 >= p.x0 && v1 <= p.x1) line(v1, p.y0 + 22, v1, p.y1 - 5);
  if (v2 >= p.x0 && v2 <= p.x1) line(v2, p.y0 + 22, v2, p.y1 - 5);
  drawingContext.setLineDash([]);
}

// Small status line below the divider
function drawStatusLine(msg) {
  noStroke();
  fill(75, 90, 110);
  textSize(9);
  textAlign(CENTER);
  text(msg, width / 2, posP.y1 - 8);
  textAlign(LEFT);
}

// ─────────────────────────────────────────────────────────────────────────────
// Explore mode panels
// ─────────────────────────────────────────────────────────────────────────────
function drawPositionPanel() {
  const { dx } = computeUncertainties();
  drawPanelTitle(posP, 'Position space   |\u03C8(x)|\u00B2');
  drawAxisTicks(posP, XMIN, XMAX, 'x');
  drawDistFill(posP, posDistNorm, XMIN, XMAX);
  drawPsiReal(posP);
  drawDistStroke(posP, posDistNorm, XMIN, XMAX);

  const dxPx = dx * (posP.x1 - posP.x0) / (XMAX - XMIN);
  const cxPx = (posP.x0 + posP.x1) / 2;
  drawBracket(cxPx - dxPx, cxPx + dxPx, posP.y0 + 14, '\u0394x');
  drawDeltaLines(posP, XMIN, XMAX, 0, dx);
}

function drawMomentumPanel() {
  const { dp } = computeUncertainties();
  drawPanelTitle(momP, 'Momentum space   |\u03C6(p)|\u00B2');
  drawAxisTicks(momP, PMIN, PMAX, 'p');
  drawDistFill(momP, momDistNorm, PMIN, PMAX);
  drawDistStroke(momP, momDistNorm, PMIN, PMAX);

  const dpPx = dp * (momP.x1 - momP.x0) / (PMAX - PMIN);
  const k0Px = map(k0, PMIN, PMAX, momP.x0, momP.x1);
  drawBracket(k0Px - dpPx, k0Px + dpPx, momP.y0 + 14, '\u0394p');
  drawDeltaLines(momP, PMIN, PMAX, k0, dp);
}

// ─────────────────────────────────────────────────────────────────────────────
// Measure mode — bouncing state
// ─────────────────────────────────────────────────────────────────────────────
function drawMeasureBouncingState() {
  const { xc, pc } = getBounceCenters(bounceT);
  const dp_part   = 1 / (2 * PART_SIGMA);

  // ── Position panel ────────────────────────────────────────────────────────
  const posFn    = x => Math.exp(-(x - xc) * (x - xc) / (2 * PART_SIGMA * PART_SIGMA));
  const psiRealB = x => Math.exp(-(x - xc) * (x - xc) / (4 * PART_SIGMA * PART_SIGMA))
                        * Math.cos(pc * (x - xc));

  drawPanelTitle(posP, 'Position space   |\u03C8(x)|\u00B2');
  drawAxisTicks(posP, XMIN, XMAX, 'x');
  drawDistFill(posP, posFn, XMIN, XMAX);
  drawPsiRealFn(posP, psiRealB, XMIN, XMAX);
  drawDistStroke(posP, posFn, XMIN, XMAX);

  // Δx bracket for particle
  const dxPxP = PART_SIGMA * (posP.x1 - posP.x0) / (XMAX - XMIN);
  const cxCanvas = map(xc, XMIN, XMAX, posP.x0, posP.x1);
  drawBracket(cxCanvas - dxPxP, cxCanvas + dxPxP, posP.y0 + 14, '\u0394x');

  // ── Momentum panel ────────────────────────────────────────────────────────
  const momFn = p => Math.exp(-(p - pc) * (p - pc) / (2 * dp_part * dp_part));

  drawPanelTitle(momP, 'Momentum space   |\u03C6(p)|\u00B2');
  drawAxisTicks(momP, PMIN, PMAX, 'p');
  drawDistFill(momP, momFn, PMIN, PMAX);
  drawDistStroke(momP, momFn, PMIN, PMAX);

  // Δp bracket for particle
  const dpPxP  = dp_part * (momP.x1 - momP.x0) / (PMAX - PMIN);
  const pcCanvas = map(pc, PMIN, PMAX, momP.x0, momP.x1);
  drawBracket(pcCanvas - dpPxP, pcCanvas + dpPxP, momP.y0 + 14, '\u0394p');

  // ── Measurement aperture overlay ──────────────────────────────────────────
  drawMeasureAperture(xc, pc);
}

function drawMeasureAperture(xc, pc) {
  if (measureType === 'position') {
    // Shaded aperture on position panel, centered at particle
    const halfW = measurePrec * (posP.x1 - posP.x0) / (XMAX - XMIN);
    const cx    = map(xc, XMIN, XMAX, posP.x0, posP.x1);
    const ax0   = max(posP.x0, cx - halfW);
    const ax1   = min(posP.x1, cx + halfW);

    noStroke();
    fill(170, 65, 255, 22);
    rect(ax0, posP.y0 + 20, ax1 - ax0, posP.y1 - posP.y0 - 20);

    drawingContext.setLineDash([4, 4]);
    stroke(170, 65, 255, 190);
    strokeWeight(1.5);
    line(ax0, posP.y0 + 20, ax0, posP.y1);
    line(ax1, posP.y0 + 20, ax1, posP.y1);
    drawingContext.setLineDash([]);

    noStroke(); fill(170, 65, 255, 210);
    textSize(9); textAlign(CENTER);
    text('\u03C3\u2098\u2091\u2090\u02E2 = ' + measurePrec.toFixed(2), cx, posP.y0 + 32);
    textAlign(LEFT);

    // Ghost predicted post-measurement momentum distribution
    const dp_after = 1 / (2 * measurePrec);
    const ghostFn  = p => Math.exp(-(p - pc) * (p - pc) / (2 * dp_after * dp_after));
    drawDistGhostPurple(momP, ghostFn, PMIN, PMAX);

    noStroke(); fill(170, 65, 255, 170);
    textSize(9); textAlign(CENTER);
    text('\u0394p \u2248 ' + dp_after.toFixed(2) + ' after', (momP.x0 + momP.x1) / 2, momP.y0 + 32);
    textAlign(LEFT);

  } else {
    // Shaded aperture on momentum panel
    const halfW = measurePrec * (momP.x1 - momP.x0) / (PMAX - PMIN);
    const cx    = map(pc, PMIN, PMAX, momP.x0, momP.x1);
    const ax0   = max(momP.x0, cx - halfW);
    const ax1   = min(momP.x1, cx + halfW);

    noStroke();
    fill(170, 65, 255, 22);
    rect(ax0, momP.y0 + 20, ax1 - ax0, momP.y1 - momP.y0 - 20);

    drawingContext.setLineDash([4, 4]);
    stroke(170, 65, 255, 190);
    strokeWeight(1.5);
    line(ax0, momP.y0 + 20, ax0, momP.y1);
    line(ax1, momP.y0 + 20, ax1, momP.y1);
    drawingContext.setLineDash([]);

    noStroke(); fill(170, 65, 255, 210);
    textSize(9); textAlign(CENTER);
    text('\u03C3\u2098\u2091\u2090\u02E2 = ' + measurePrec.toFixed(2), cx, momP.y0 + 32);
    textAlign(LEFT);

    // Ghost predicted post-measurement position distribution
    const dx_after = 1 / (2 * measurePrec);
    const ghostFn  = x => Math.exp(-(x - xc) * (x - xc) / (2 * dx_after * dx_after));
    drawDistGhostPurple(posP, ghostFn, XMIN, XMAX);

    noStroke(); fill(170, 65, 255, 170);
    textSize(9); textAlign(CENTER);
    text('\u0394x \u2248 ' + dx_after.toFixed(2) + ' after', (posP.x0 + posP.x1) / 2, posP.y0 + 32);
    textAlign(LEFT);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Measure mode — collapsed / spreading state
// ─────────────────────────────────────────────────────────────────────────────
function drawMeasureCollapsedState() {
  const T_SCALE = 0.35;  // wall-time → physics-time ratio
  const tPhys   = collapseT * T_SCALE;

  // Ghost distributions (pre-measurement)
  const prePosFn = x => Math.exp(-(x - preXc) * (x - preXc) / (2 * PART_SIGMA * PART_SIGMA));
  const preMomFn = p => {
    const dp = 1 / (2 * PART_SIGMA);
    return Math.exp(-(p - prePc) * (p - prePc) / (2 * dp * dp));
  };

  if (measureType === 'position') {
    // Post-measurement: spreading Gaussian in position, fixed in momentum
    const sigma_t  = spreadSigma(measurePrec, tPhys);
    const xCenter  = xMeasured + prePc * tPhys;
    const dp_after = 1 / (2 * measurePrec);

    const postPosFn = x => Math.exp(-(x - xCenter) * (x - xCenter) / (2 * sigma_t * sigma_t));
    const postMomFn = p => Math.exp(-(p - prePc) * (p - prePc) / (2 * dp_after * dp_after));

    // ψ real part for the spreading packet
    const psiRealPost = x => Math.exp(-(x - xCenter) * (x - xCenter) / (4 * sigma_t * sigma_t))
                              * Math.cos(prePc * (x - xMeasured));

    // Position panel
    drawPanelTitle(posP, 'Position space   |\u03C8(x)|\u00B2');
    drawAxisTicks(posP, XMIN, XMAX, 'x');
    drawDistGhostTeal(posP, prePosFn, XMIN, XMAX);
    drawDistFill(posP, postPosFn, XMIN, XMAX);
    drawPsiRealFn(posP, psiRealPost, XMIN, XMAX);
    drawDistStroke(posP, postPosFn, XMIN, XMAX);

    // Momentum panel
    drawPanelTitle(momP, 'Momentum space   |\u03C6(p)|\u00B2');
    drawAxisTicks(momP, PMIN, PMAX, 'p');
    drawDistGhostTeal(momP, preMomFn, PMIN, PMAX);
    drawDistFill(momP, postMomFn, PMIN, PMAX);
    drawDistStroke(momP, postMomFn, PMIN, PMAX);

    // Brackets
    const xCvs = map(xCenter, XMIN, XMAX, posP.x0, posP.x1);
    const dxBr = sigma_t * (posP.x1 - posP.x0) / (XMAX - XMIN);
    if (xCvs - dxBr >= posP.x0 - 2 && xCvs + dxBr <= posP.x1 + 2) {
      drawBracket(
        max(posP.x0 + 2, xCvs - dxBr),
        min(posP.x1 - 2, xCvs + dxBr),
        posP.y0 + 14,
        '\u0394x = ' + sigma_t.toFixed(2)
      );
    }
    const pCvs = map(prePc, PMIN, PMAX, momP.x0, momP.x1);
    const dpBr = dp_after * (momP.x1 - momP.x0) / (PMAX - PMIN);
    drawBracket(
      max(momP.x0 + 2, pCvs - dpBr),
      min(momP.x1 - 2, pCvs + dpBr),
      momP.y0 + 14,
      '\u0394p = ' + dp_after.toFixed(2)
    );

    // Δx·Δp readout (at t=0 it's ħ/2; Δx grows while Δp is fixed)
    const ratio = sigma_t * dp_after * 2;
    noStroke();
    fill(ratio < 1.08 ? color(88, 166, 255) : color(255, 150, 50));
    textSize(9); textAlign(CENTER);
    text('\u0394x\u00B7\u0394p = ' + ratio.toFixed(2) + ' \u0127/2', width / 2, posP.y1 - 8);
    textAlign(LEFT);

    const elapsed = collapseT < 0.5 ? 'Collapsed at x = ' + xMeasured.toFixed(2)
                                     : '\u0394x growing (spreading)  \u2014  \u0394p fixed';
    drawStatusLine(elapsed);

  } else {
    // Post-measurement: narrow Gaussian in momentum, wide in position
    const dx_after = 1 / (2 * measurePrec);

    const postPosFn = x => Math.exp(-(x - preXc) * (x - preXc) / (2 * dx_after * dx_after));
    const postMomFn = p => Math.exp(-(p - pMeasured) * (p - pMeasured) / (2 * measurePrec * measurePrec));

    // Position panel
    drawPanelTitle(posP, 'Position space   |\u03C8(x)|\u00B2');
    drawAxisTicks(posP, XMIN, XMAX, 'x');
    drawDistGhostTeal(posP, prePosFn, XMIN, XMAX);
    drawDistFill(posP, postPosFn, XMIN, XMAX);
    drawDistStroke(posP, postPosFn, XMIN, XMAX);

    // Momentum panel
    drawPanelTitle(momP, 'Momentum space   |\u03C6(p)|\u00B2');
    drawAxisTicks(momP, PMIN, PMAX, 'p');
    drawDistGhostTeal(momP, preMomFn, PMIN, PMAX);
    drawDistFill(momP, postMomFn, PMIN, PMAX);
    drawDistStroke(momP, postMomFn, PMIN, PMAX);

    // Brackets
    const xCvs = map(preXc, XMIN, XMAX, posP.x0, posP.x1);
    const dxBr = dx_after * (posP.x1 - posP.x0) / (XMAX - XMIN);
    drawBracket(
      max(posP.x0 + 2, xCvs - dxBr),
      min(posP.x1 - 2, xCvs + dxBr),
      posP.y0 + 14,
      '\u0394x = ' + dx_after.toFixed(2)
    );
    const pCvs = map(pMeasured, PMIN, PMAX, momP.x0, momP.x1);
    const dpBr = measurePrec * (momP.x1 - momP.x0) / (PMAX - PMIN);
    drawBracket(
      max(momP.x0 + 2, pCvs - dpBr),
      min(momP.x1 - 2, pCvs + dpBr),
      momP.y0 + 14,
      '\u0394p = ' + measurePrec.toFixed(2)
    );

    const ratio = dx_after * measurePrec * 2;
    noStroke();
    fill(ratio < 1.08 ? color(88, 166, 255) : color(255, 150, 50));
    textSize(9); textAlign(CENTER);
    text('\u0394x\u00B7\u0394p = ' + ratio.toFixed(2) + ' \u0127/2', width / 2, posP.y1 - 8);
    textAlign(LEFT);

    drawStatusLine('Collapsed at p = ' + pMeasured.toFixed(2) + '  \u2014  position now delocalized');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main draw loop
// ─────────────────────────────────────────────────────────────────────────────
function draw() {
  background(17, 24, 32);
  drawDivider();

  if (mode === 'measure') {
    readMeasureControls();
    if (measurePhase === 'bouncing') {
      bounceT += deltaTime / 1000;
      drawMeasureBouncingState();
    } else {
      collapseT += deltaTime / 1000;
      drawMeasureCollapsedState();
    }
  } else {
    readControls();
    drawPositionPanel();
    drawMomentumPanel();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Event handlers (called from HTML)
// ─────────────────────────────────────────────────────────────────────────────
function setMode(m) {
  mode = m;

  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('mode-btn-' + m);
  if (btn) btn.classList.add('active');

  const exploreControls = document.getElementById('explore-controls');
  const measureControls = document.getElementById('measure-controls');

  if (m === 'measure') {
    if (exploreControls) exploreControls.style.display = 'none';
    if (measureControls) measureControls.style.display = 'block';
    resetMeasure();
  } else {
    if (exploreControls) exploreControls.style.display = 'block';
    if (measureControls) measureControls.style.display = 'none';
    updateEduPanel(m);
  }
  updateEduPanel(m);
}

function setShape(s) {
  shape = s;
  document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('shape-btn-' + s);
  if (btn) btn.classList.add('active');
}

function setMeasureType(t) {
  measureType = t;
  document.querySelectorAll('.mtype-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('mtype-btn-' + t);
  if (btn) btn.classList.add('active');
}

function fireMeasure() {
  if (measurePhase !== 'bouncing') return;
  const { xc, pc } = getBounceCenters(bounceT);
  preXc = xc;
  prePc = pc;

  if (measureType === 'position') {
    xMeasured = sampleGaussian(xc, PART_SIGMA);
    xMeasured = Math.max(XMIN + 0.3, Math.min(XMAX - 0.3, xMeasured));
  } else {
    const dp_part = 1 / (2 * PART_SIGMA);
    pMeasured = sampleGaussian(pc, dp_part);
    pMeasured = Math.max(PMIN + 0.3, Math.min(PMAX - 0.3, pMeasured));
  }

  measurePhase = 'collapsed';
  collapseT    = 0;

  document.getElementById('fire-btn').style.display  = 'none';
  document.getElementById('reset-btn').style.display = 'block';
}

function resetMeasure() {
  measurePhase = 'bouncing';
  bounceT      = 0;
  collapseT    = 0;

  const fireBtn  = document.getElementById('fire-btn');
  const resetBtn = document.getElementById('reset-btn');
  if (fireBtn)  fireBtn.style.display  = 'block';
  if (resetBtn) resetBtn.style.display = 'none';
}
