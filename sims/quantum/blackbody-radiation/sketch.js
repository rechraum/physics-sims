// ─────────────────────────────────────────────────────────────────────────────
// Blackbody Radiation — sketch.js
//
// Canvas is split into two regions:
//   LEFT  (0 – 42% width)  : Cavity visualization — oven box, pinhole, glow,
//                             static standing-wave mode shapes inside
//   RIGHT (44% – 100%)     : Spectrum plot — Planck and/or Rayleigh-Jeans
//                             curves vs wavelength, visible-spectrum band,
//                             Wien peak marker, divergence annotation
//
// Physics (SI):
//   Planck spectral radiance:   B(λ,T) = 2hc²/λ⁵ · 1/(exp(hc/λkT)−1)
//   Rayleigh–Jeans:             B_RJ(λ,T) = 2ckT/λ⁴
//   Wien displacement:          λ_max = b/T,  b = 2.898e-3 m·K
//   Stefan–Boltzmann total:     P ∝ σT⁴
//
// Spectrum mode (set by HTML buttons):
//   'classical'  — only Rayleigh-Jeans (orange), divergence arrow
//   'both'       — both curves; Planck solid, RJ dashed
//   'quantum'    — only Planck (blue/teal)
//
// Color language (consistent with quantum series):
//   Planck curve : accent blue  (88, 166, 255)
//   RJ curve     : orange       (255, 150, 50)
//   Filled area  : teal         (45, 215, 135)
//   Cavity glow  : temperature-dependent RGB via bbColor()
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

// ── Physical constants ────────────────────────────────────────────────────────
const H  = 6.626e-34;   // Planck constant  J·s
const C  = 2.998e8;     // speed of light   m/s
const KB = 1.381e-23;   // Boltzmann const  J/K
const B_WIEN = 2.898e-3; // Wien displacement constant  m·K
const SIGMA  = 5.67e-8;  // Stefan-Boltzmann  W/(m²·K⁴)

// Wavelength axis: 100 nm (UV) – 3000 nm (mid-IR), in metres
const LAM_MIN = 100e-9;
const LAM_MAX = 3000e-9;
const LAM_VIS_LO = 380e-9;
const LAM_VIS_HI = 700e-9;

// Temperature slider uses a sqrt mapping so the interesting range isn't cramped
// slider value s ∈ [0,1000] → T = (s/1000)² × (T_MAX−T_MIN) + T_MIN
const T_MIN  = 300;
const T_MAX  = 15000;

// ── State ─────────────────────────────────────────────────────────────────────
let tempK        = 5778;
let spectrumMode = 'both';   // 'classical' | 'both' | 'quantum'
let showVisible  = true;
let showWien     = true;
let showModes    = true;

// ── Canvas geometry (recomputed on resize) ────────────────────────────────────
let cavX0, cavX1, cavY0, cavY1;   // cavity bounding box
let spX0,  spX1,  spY0,  spY1;   // spectrum plot area
let dividerX;

function computeGeometry() {
  dividerX = width * 0.43;

  // Cavity: occupies left region with margin
  const mg = 14;
  cavX0 = mg;
  cavX1 = dividerX - mg;
  cavY0 = height * 0.10;
  cavY1 = height * 0.88;

  // Spectrum: right region with axis margins
  spX0 = dividerX + width * 0.04;
  spX1 = width - 18;
  spY0 = height * 0.10;
  spY1 = height * 0.82;
}

// ── Educational content ───────────────────────────────────────────────────────
const EDU = {
  classical: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">The Ultraviolet Catastrophe</p>
        <p class="edu-description">
          In classical physics, every electromagnetic mode inside a cavity is in thermal
          equilibrium and — by the <strong>equipartition theorem</strong> — carries average
          energy kT regardless of its frequency. Because the number of modes grows as ν²,
          the total radiated power diverges:
        </p>
        <div class="equation">B<sub>RJ</sub>(λ,T) = 2ckT / λ⁴ → ∞ as λ → 0</div>
        <p class="edu-description">
          Rayleigh and Jeans derived this law in 1900. It matches experiment at long
          wavelengths but rockets to infinity in the ultraviolet — a failure so stark it
          was called the <em>ultraviolet catastrophe</em> by Paul Ehrenfest in 1911.
        </p>
        <div class="edu-concepts">
          <span class="edu-concept-tag">equipartition theorem</span>
          <span class="edu-concept-tag">Rayleigh–Jeans law</span>
          <span class="edu-concept-tag">ultraviolet catastrophe</span>
          <span class="edu-concept-tag">mode density ∝ ν²</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Why does it diverge?</p>
          <p>
            A cavity supports standing waves at every frequency. At frequency ν, the number
            of distinct standing-wave modes per unit volume per unit frequency is
            g(ν) = 8πν²/c³. In the classical picture each gets ½kT of kinetic
            energy and ½kT of potential energy — total kT — so the spectral energy
            density grows without bound as ν → ∞.
          </p>
          <p>
            Planck's key insight: if energy can only be exchanged in discrete chunks
            E = hν, high-frequency modes are <em>frozen out</em> because a single
            quantum costs more than the available thermal energy kT.
          </p>
        </div>
      </div>
    </div>
  `,

  both: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Classical vs. Quantum Radiation</p>
        <p class="edu-description">
          The two curves agree at long wavelengths (low frequencies) where hν ≪ kT and
          quantization barely matters. They diverge dramatically in the ultraviolet:
          the classical curve soars to infinity while Planck's law falls to zero
          because high-frequency modes are exponentially suppressed.
        </p>
        <div class="equation">B<sub>Planck</sub> / B<sub>RJ</sub> = (hc/λkT) · e<sup>hc/λkT</sup> / (e<sup>hc/λkT</sup>−1)</div>
        <p class="edu-description">
          This ratio → 1 as λ → ∞ (quantum ≈ classical), and → 0 as λ → 0
          (quantum kills the catastrophe). The crossover happens near λ ≈ hc/kT —
          drag the temperature slider to watch the Wien peak shift and both curves rescale.
        </p>
        <div class="edu-concepts">
          <span class="edu-concept-tag">Planck's law</span>
          <span class="edu-concept-tag">Rayleigh–Jeans</span>
          <span class="edu-concept-tag">long-wavelength agreement</span>
          <span class="edu-concept-tag">E = hν</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Planck's desperate act (1900)</p>
          <p>
            Max Planck called his own quantization assumption "an act of desperation."
            He fitted the formula empirically first, then worked backwards to find a
            physical justification — that oscillators could only absorb or emit energy
            in integer multiples of hν.
          </p>
          <p>
            Einstein went further in 1905: light itself is quantized into photons.
            The photoelectric effect — electrons ejected by light below a threshold
            frequency regardless of intensity — only makes sense if each photon
            carries energy E = hν, not a continuous wave.
          </p>
        </div>
      </div>
    </div>
  `,

  quantum: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Planck's Law</p>
        <p class="edu-description">
          Planck resolved the catastrophe by assuming electromagnetic energy is exchanged
          only in discrete quanta of size E&nbsp;=&nbsp;hν. The resulting spectral
          radiance has a smooth peak and falls to zero at both extremes:
        </p>
        <div class="equation">B(λ,T) = 2hc² / λ⁵ · 1 / (e<sup>hc/λkT</sup> − 1)</div>
        <p class="edu-description">
          The peak shifts to shorter wavelengths as temperature rises (Wien's law:
          λ<sub>max</sub> = 2.898&thinsp;mm·K / T). The total power under the curve
          scales as T⁴ (Stefan–Boltzmann). Every star, every glowing object, and
          the 2.7 K cosmic microwave background all follow this curve.
        </p>
        <div class="edu-concepts">
          <span class="edu-concept-tag">Planck's law</span>
          <span class="edu-concept-tag">Wien displacement</span>
          <span class="edu-concept-tag">Stefan–Boltzmann T⁴</span>
          <span class="edu-concept-tag">cosmic microwave background</span>
          <span class="edu-concept-tag">photon</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Real-world blackbodies</p>
          <p>
            <strong>The Sun (5778 K):</strong> Peak emission near 500 nm — green light —
            but the broad spectrum looks white. Our eyes evolved to be most sensitive
            near this peak.
          </p>
          <p>
            <strong>Cosmic microwave background (2.725 K):</strong> The afterglow of the
            Big Bang, now redshifted to microwave frequencies. The most perfect blackbody
            spectrum ever measured, with temperature variations of only ±0.0001 K that
            seeded all cosmic structure.
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

// ── Temperature mapping (sqrt scale on slider) ────────────────────────────────
function sliderToTemp(s) {
  const t = s / 1000;   // 0–1
  return Math.round(T_MIN + t * t * (T_MAX - T_MIN));
}

function tempToSlider(T) {
  return Math.round(Math.sqrt((T - T_MIN) / (T_MAX - T_MIN)) * 1000);
}

// ── Planck spectral radiance B(λ,T) in W·sr⁻¹·m⁻³ ───────────────────────────
function planck(lam, T) {
  const x = (H * C) / (lam * KB * T);
  if (x > 700) return 0;   // prevent overflow
  return (2 * H * C * C) / (Math.pow(lam, 5) * (Math.exp(x) - 1));
}

// ── Rayleigh-Jeans ────────────────────────────────────────────────────────────
function rayleighJeans(lam, T) {
  return (2 * C * KB * T) / Math.pow(lam, 4);
}

// ── Blackbody perceived color (approximate) ───────────────────────────────────
// Returns [r, g, b] in 0–255 range for a blackbody at temperature T.
// Uses a piecewise approximation calibrated to the standard color-temperature curve.
function bbColor(T) {
  let r, g, b;

  // Red channel
  if (T <= 6600) {
    r = 255;
  } else {
    r = 329.698727446 * Math.pow((T / 100) - 60, -0.1332047592);
    r = constrain(r, 0, 255);
  }

  // Green channel
  if (T <= 6600) {
    g = 99.4708025861 * Math.log(T / 100) - 161.1195681661;
    g = constrain(g, 0, 255);
  } else {
    g = 288.1221695283 * Math.pow((T / 100) - 60, -0.0755148492);
    g = constrain(g, 0, 255);
  }

  // Blue channel
  if (T >= 6600) {
    b = 255;
  } else if (T <= 1900) {
    b = 0;
  } else {
    b = 138.5177312231 * Math.log(T / 100 - 10) - 305.0447927307;
    b = constrain(b, 0, 255);
  }

  return [r, g, b];
}

// ── Visible spectrum hue at wavelength (nm) → [r,g,b] ─────────────────────────
function visColor(lam_nm) {
  let r = 0, g = 0, b = 0;
  if      (lam_nm >= 380 && lam_nm < 440) { r = (440 - lam_nm) / 60; b = 1; }
  else if (lam_nm >= 440 && lam_nm < 490) { g = (lam_nm - 440) / 50; b = 1; }
  else if (lam_nm >= 490 && lam_nm < 510) { g = 1; b = (510 - lam_nm) / 20; }
  else if (lam_nm >= 510 && lam_nm < 580) { r = (lam_nm - 510) / 70; g = 1; }
  else if (lam_nm >= 580 && lam_nm < 645) { r = 1; g = (645 - lam_nm) / 65; }
  else if (lam_nm >= 645 && lam_nm <= 700) { r = 1; }
  // fade at edges
  let fade = 1;
  if      (lam_nm >= 380 && lam_nm < 420) fade = 0.3 + 0.7 * (lam_nm - 380) / 40;
  else if (lam_nm >= 680 && lam_nm <= 700) fade = 0.3 + 0.7 * (700 - lam_nm) / 20;
  return [r * fade * 255, g * fade * 255, b * fade * 255];
}

// ── Wavelength → x pixel in spectrum plot ────────────────────────────────────
function lamToX(lam) {
  return map(lam, LAM_MIN, LAM_MAX, spX0, spX1);
}

// ── Compute peak Planck value for y-axis scaling ─────────────────────────────
function planckPeak(T) {
  const lPeak = B_WIEN / T;
  return planck(lPeak, T);
}

// ── p5 setup ─────────────────────────────────────────────────────────────────
function setup() {
  const cont = document.getElementById('canvas-container');
  const cnv  = createCanvas(cont.clientWidth, cont.clientHeight);
  cnv.parent('canvas-container');
  textFont('Courier New');
  computeGeometry();

  // Sync slider to initial tempK
  const sl = document.getElementById('temp-slider');
  if (sl) sl.value = tempToSlider(tempK);

  updateEduPanel(spectrumMode);
  updateReadouts();
}

function windowResized() {
  const cont = document.getElementById('canvas-container');
  resizeCanvas(cont.clientWidth, cont.clientHeight);
  computeGeometry();
}

// ── DOM read/write ────────────────────────────────────────────────────────────
function readControls() {
  const sl = document.getElementById('temp-slider');
  if (sl) tempK = sliderToTemp(+sl.value);

  showVisible = document.getElementById('show-visible').checked;
  showWien    = document.getElementById('show-wien').checked;
  showModes   = document.getElementById('show-modes').checked;

  document.getElementById('temp-val').textContent = tempK.toLocaleString();
}

function updateReadouts() {
  const lPeak_nm = Math.round((B_WIEN / tempK) * 1e9);
  const pNorm    = Math.pow(tempK / 5778, 4).toFixed(2);

  const wEl = document.getElementById('wien-readout');
  const pEl = document.getElementById('power-readout');
  if (wEl) wEl.innerHTML = `&lambda;<sub>max</sub> = ${lPeak_nm} nm`;
  if (pEl) pEl.innerHTML = `P &prop; T&sup4; = ${pNorm} &times; P<sub>&#x2609;</sub>`;
}

// ── Main draw ─────────────────────────────────────────────────────────────────
function draw() {
  background(17, 24, 32);
  readControls();
  updateReadouts();

  drawCavity();
  drawSpectrum();
}

// ═════════════════════════════════════════════════════════════════════════════
// CAVITY PANEL
// ═════════════════════════════════════════════════════════════════════════════
function drawCavity() {
  const cw = cavX1 - cavX0;
  const ch = cavY1 - cavY0;
  const cx = (cavX0 + cavX1) / 2;
  const cy = (cavY0 + cavY1) / 2;

  const [br, bg, bb] = bbColor(tempK);
  const glowAlpha = map(tempK, 300, 15000, 8, 90);

  // ── Outer glow behind cavity ─────────────────────────────────────────────
  noStroke();
  for (let i = 6; i >= 1; i--) {
    fill(br, bg, bb, glowAlpha * (i / 6) * 0.5);
    const pad = i * 9;
    rect(cavX0 - pad, cavY0 - pad, cw + pad * 2, ch + pad * 2, 6);
  }

  // ── Interior cavity fill ─────────────────────────────────────────────────
  // Dark interior with subtle warm tint
  const intBrightness = map(tempK, 300, 15000, 4, 40);
  fill(intBrightness * (br / 255), intBrightness * (bg / 255), intBrightness * (bb / 255));
  noStroke();
  rect(cavX0, cavY0, cw, ch);

  // ── Standing-wave mode shapes inside cavity ──────────────────────────────
  if (showModes) drawCavityModes(br, bg, bb);

  // ── Cavity walls ─────────────────────────────────────────────────────────
  const wallBright = map(tempK, 300, 15000, 55, 160);
  stroke(wallBright * (br / 255) * 0.6 + 40,
         wallBright * (bg / 255) * 0.6 + 40,
         wallBright * (bb / 255) * 0.6 + 40);
  strokeWeight(3);
  noFill();

  // Top, left, bottom walls (solid)
  line(cavX0, cavY0, cavX1, cavY0);                        // top
  line(cavX0, cavY0, cavX0, cavY1);                        // left
  line(cavX0, cavY1, cavX1, cavY1);                        // bottom

  // Right wall with pinhole gap in the middle
  const phHalfH = ch * 0.035;   // pinhole half-height
  line(cavX1, cavY0, cavX1, cy - phHalfH);                 // right top segment
  line(cavX1, cy + phHalfH, cavX1, cavY1);                 // right bottom segment

  // ── Pinhole: emitted beam rays ───────────────────────────────────────────
  const rayAlpha = map(tempK, 300, 15000, 20, 130);
  const rayLen   = (width - cavX1) * 0.55;
  const nRays    = 7;

  for (let i = 0; i < nRays; i++) {
    const frac   = (i / (nRays - 1)) - 0.5;    // -0.5 to 0.5
    const angle  = frac * 0.55;                  // spread angle (radians)
    const x1     = cavX1 + 1;
    const y1     = cy;
    const x2     = x1 + Math.cos(angle) * rayLen;
    const y2     = y1 + Math.sin(angle) * rayLen;

    const fade = 1 - Math.abs(frac) * 1.4;
    stroke(br, bg, bb, rayAlpha * fade);
    strokeWeight(i === 3 ? 2 : 1);             // center ray slightly thicker
    drawingContext.setLineDash([4, 6]);
    line(x1, y1, x2, y2);
    drawingContext.setLineDash([]);
  }

  // ── Temperature label ────────────────────────────────────────────────────
  noStroke();
  fill(br, bg, bb, 200);
  textSize(11);
  textAlign(CENTER);
  text('T = ' + tempK.toLocaleString() + ' K', cx, cavY0 - 7);

  // ── "Pinhole" label ──────────────────────────────────────────────────────
  fill(120, 130, 145);
  textSize(9);
  textAlign(LEFT);
  text('pinhole', cavX1 + 5, cy - phHalfH - 4);

  // ── Color swatch strip at bottom ─────────────────────────────────────────
  const swY  = cavY1 + 8;
  const swH  = 7;
  const swW  = cw;
  // Gradient from dark (cold) left to bbColor (hot) right — actually just a swatch
  for (let px = 0; px < swW; px++) {
    const t = px / swW;
    const [sr, sg, sb] = bbColor(T_MIN + t * t * (T_MAX - T_MIN));
    stroke(sr, sg, sb, 160);
    strokeWeight(1);
    line(cavX0 + px, swY, cavX0 + px, swY + swH);
  }
  // Indicator tick on the swatch
  const tickX = cavX0 + map(tempToSlider(tempK), 0, 1000, 0, swW);
  stroke(255, 255, 255, 200);
  strokeWeight(1.5);
  line(tickX, swY - 2, tickX, swY + swH + 2);

  noStroke();
  fill(95, 108, 126);
  textSize(8);
  textAlign(LEFT);
  text('300 K', cavX0, swY + swH + 11);
  textAlign(RIGHT);
  text('15 000 K', cavX1, swY + swH + 11);

  textAlign(LEFT);
}

// ── Static standing-wave mode shapes inside cavity ───────────────────────────
function drawCavityModes(br, bg, bb) {
  const cw   = cavX1 - cavX0;
  const ch   = cavY1 - cavY0;
  const nModes = 4;

  // Divide cavity height into bands for each mode
  const bandH  = ch / (nModes + 1);
  const ampMax = bandH * 0.32;

  // Mode wave color: tinted with bb color but kept dim
  const waveAlpha = map(tempK, 300, 15000, 50, 140);

  for (let n = 1; n <= nModes; n++) {
    const bandCy = cavY0 + bandH * n;

    // Mode label on the left inside wall
    noStroke();
    fill(br, bg, bb, waveAlpha * 0.7);
    textSize(8);
    textAlign(LEFT);
    text('n=' + n, cavX0 + 4, bandCy + 3);

    // Standing wave: amplitude × sin(n·π·x/L)
    stroke(br, bg, bb, waveAlpha);
    strokeWeight(1);
    noFill();
    beginShape();
    const STEP = 3;
    for (let px = 0; px <= cw; px += STEP) {
      const f   = px / cw;
      const val = Math.sin(n * Math.PI * f) * ampMax;
      vertex(cavX0 + px, bandCy - val);
    }
    endShape();

    // Axis line (very dim)
    stroke(br, bg, bb, waveAlpha * 0.2);
    strokeWeight(1);
    line(cavX0, bandCy, cavX1, bandCy);
  }

  textAlign(LEFT);
}

// ═════════════════════════════════════════════════════════════════════════════
// SPECTRUM PANEL
// ═════════════════════════════════════════════════════════════════════════════
function drawSpectrum() {
  const sw = spX1 - spX0;
  const sh = spY1 - spY0;

  // ── Visible spectrum band ─────────────────────────────────────────────────
  if (showVisible) {
    const visX0 = lamToX(LAM_VIS_LO);
    const visX1 = lamToX(LAM_VIS_HI);
    noStroke();
    // Draw pixel-by-pixel band
    for (let px = visX0; px <= visX1; px++) {
      const lam_nm = map(px, spX0, spX1, LAM_MIN * 1e9, LAM_MAX * 1e9);
      const [vr, vg, vb] = visColor(lam_nm);
      fill(vr, vg, vb, 55);
      rect(px, spY0, 1, sh);
    }
    // Bracket labels
    noStroke();
    fill(130, 140, 155);
    textSize(8);
    textAlign(CENTER);
    text('visible', (visX0 + visX1) / 2, spY0 - 4);
  }

  // ── Compute y-scale from Planck peak ─────────────────────────────────────
  const yScale = planckPeak(tempK);   // peak B(λ,T) in W/sr/m³

  // ── Helper: B value → canvas y ───────────────────────────────────────────
  // We cap at 2× Planck peak for the axis top
  const yTop  = yScale * 2.2;
  function bToY(b) {
    return map(b, 0, yTop, spY1, spY0);
  }

  // ── Axes ─────────────────────────────────────────────────────────────────
  stroke(48, 54, 61);
  strokeWeight(1);
  line(spX0, spY0, spX0, spY1);  // y axis
  line(spX0, spY1, spX1, spY1);  // x axis

  // X-axis ticks: 250, 500, 750, 1000, 1500, 2000, 2500 nm
  const tickLams = [250, 500, 750, 1000, 1500, 2000, 2500];
  noStroke();
  fill(80, 90, 105);
  textSize(8);
  textAlign(CENTER);
  for (const nm of tickLams) {
    const tx = lamToX(nm * 1e-9);
    if (tx < spX0 || tx > spX1) continue;
    stroke(48, 54, 61);
    strokeWeight(1);
    line(tx, spY1, tx, spY1 + 4);
    noStroke();
    text(nm, tx, spY1 + 13);
  }

  // Axis labels
  fill(95, 108, 126);
  textSize(9);
  textAlign(CENTER);
  text('Wavelength (nm)', (spX0 + spX1) / 2, spY1 + 24);

  push();
  translate(spX0 - 30, (spY0 + spY1) / 2);
  rotate(-HALF_PI);
  textAlign(CENTER);
  text('Spectral radiance', 0, 0);
  pop();

  // Plot area title
  noStroke();
  fill(95, 108, 126);
  textSize(9);
  textAlign(RIGHT);
  text('Blackbody Spectrum  T = ' + tempK.toLocaleString() + ' K', spX1, spY0 - 4);

  // ── Rayleigh-Jeans curve ─────────────────────────────────────────────────
  if (spectrumMode === 'classical' || spectrumMode === 'both') {
    const alpha = spectrumMode === 'both' ? 160 : 220;
    const STEP  = 2;

    // Filled area (clipped to plot)
    noStroke();
    fill(255, 150, 50, spectrumMode === 'both' ? 18 : 35);
    beginShape();
    vertex(spX0, spY1);
    for (let px = 0; px <= sw; px += STEP) {
      const lam = map(px, 0, sw, LAM_MIN, LAM_MAX);
      const b   = rayleighJeans(lam, tempK);
      const y   = constrain(bToY(b), spY0 - 1, spY1);
      vertex(spX0 + px, y);
    }
    vertex(spX1, spY1);
    endShape(CLOSE);

    // Stroke
    stroke(255, 150, 50, alpha);
    strokeWeight(spectrumMode === 'both' ? 1.5 : 2);
    if (spectrumMode === 'both') drawingContext.setLineDash([6, 5]);
    noFill();
    beginShape();
    for (let px = 0; px <= sw; px += STEP) {
      const lam = map(px, 0, sw, LAM_MIN, LAM_MAX);
      const b   = rayleighJeans(lam, tempK);
      const y   = constrain(bToY(b), spY0 - 30, spY1);
      vertex(spX0 + px, y);
    }
    endShape();
    drawingContext.setLineDash([]);

    // Divergence arrow where RJ hits top of plot
    // Find first x where bToY(RJ) ≤ spY0
    for (let px = sw; px >= 0; px -= STEP) {
      const lam = map(px, 0, sw, LAM_MIN, LAM_MAX);
      if (bToY(rayleighJeans(lam, tempK)) <= spY0 + 5) {
        const ax = spX0 + px;
        stroke(255, 150, 50, alpha);
        strokeWeight(1.5);
        line(ax, spY0, ax, spY0 - 16);
        // arrowhead
        fill(255, 150, 50, alpha);
        noStroke();
        triangle(ax, spY0 - 22, ax - 4, spY0 - 14, ax + 4, spY0 - 14);
        // "→∞" label
        textSize(9);
        textAlign(CENTER);
        fill(255, 150, 50, alpha);
        text('\u2192\u221E', ax, spY0 - 25);
        break;
      }
    }

    // Legend entry
    noStroke();
    fill(255, 150, 50, alpha);
    textSize(9);
    textAlign(LEFT);
    if (spectrumMode === 'both') drawingContext.setLineDash([5, 4]);
    stroke(255, 150, 50, alpha);
    strokeWeight(1.5);
    noFill();
    line(spX0 + 4, spY0 + 10, spX0 + 22, spY0 + 10);
    drawingContext.setLineDash([]);
    noStroke();
    fill(255, 150, 50, alpha);
    text('Rayleigh–Jeans (classical)', spX0 + 26, spY0 + 13);
  }

  // ── Planck curve ─────────────────────────────────────────────────────────
  if (spectrumMode === 'quantum' || spectrumMode === 'both') {
    const alpha = 220;
    const STEP  = 2;
    const legY  = spectrumMode === 'both' ? spY0 + 24 : spY0 + 10;

    // Filled area
    noStroke();
    fill(45, 215, 135, 30);
    beginShape();
    vertex(spX0, spY1);
    for (let px = 0; px <= sw; px += STEP) {
      const lam = map(px, 0, sw, LAM_MIN, LAM_MAX);
      const b   = planck(lam, tempK);
      vertex(spX0 + px, bToY(b));
    }
    vertex(spX1, spY1);
    endShape(CLOSE);

    // Stroke (Planck in accent blue)
    stroke(88, 166, 255, alpha);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let px = 0; px <= sw; px += STEP) {
      const lam = map(px, 0, sw, LAM_MIN, LAM_MAX);
      const b   = planck(lam, tempK);
      vertex(spX0 + px, bToY(b));
    }
    endShape();

    // Legend
    stroke(88, 166, 255, alpha);
    strokeWeight(2);
    noFill();
    line(spX0 + 4, legY, spX0 + 22, legY);
    noStroke();
    fill(88, 166, 255, alpha);
    textSize(9);
    textAlign(LEFT);
    text('Planck (quantum)', spX0 + 26, legY + 3);
  }

  // ── Wien peak marker ─────────────────────────────────────────────────────
  if (showWien) {
    const lPeak = B_WIEN / tempK;
    const px    = lamToX(lPeak);
    const bPeak = planck(lPeak, tempK);
    const py    = bToY(bPeak);

    if (px >= spX0 && px <= spX1 && py >= spY0 && py <= spY1) {
      // Vertical dashed line
      drawingContext.setLineDash([4, 5]);
      stroke(170, 65, 255, 170);
      strokeWeight(1);
      line(px, py, px, spY1);
      drawingContext.setLineDash([]);

      // Dot at peak
      fill(170, 65, 255, 210);
      noStroke();
      ellipse(px, py, 7, 7);

      // Label
      const lPeak_nm = Math.round(lPeak * 1e9);
      textSize(9);
      textAlign(px > spX0 + sw * 0.7 ? RIGHT : LEFT);
      fill(170, 65, 255, 200);
      const labelX = px > spX0 + sw * 0.7 ? px - 6 : px + 6;
      text('\u03bb\u2098\u2090\u2093 = ' + lPeak_nm + ' nm', labelX, py - 6);
    }
  }

  textAlign(LEFT);
}

// ═════════════════════════════════════════════════════════════════════════════
// MODE / PRESET SWITCHING (called from HTML)
// ═════════════════════════════════════════════════════════════════════════════
function setSpectrumMode(m) {
  spectrumMode = m;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('mode-btn-' + m);
  if (btn) btn.classList.add('active');
  updateEduPanel(m);
}

function setPreset(T) {
  tempK = T;
  const sl = document.getElementById('temp-slider');
  if (sl) sl.value = tempToSlider(T);

  // Update preset button highlight
  const labels = { 300: 'Room', 2700: 'Bulb', 5778: 'Sun', 15000: 'Blue★' };
  document.querySelectorAll('.preset-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.trim() === (labels[T] || ''));
  });
}
