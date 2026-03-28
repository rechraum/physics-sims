// ─────────────────────────────────────────────────────────────────────────────
// Double-Slit Experiment — sketch.js
//
// Physics (ħ = 1, natural units; L = 4, y ∈ [-5, +5]):
//   Interference:  I(y) = I₀ · sinc²(β) · cos²(δ/2)
//     β = π·a·y / (λ·L)        single-slit phase
//     δ = 2π·d·y / (λ·L)       double-slit path-difference phase
//   Which-way:     I_ww(y) = sinc²(β₊) + sinc²(β₋)
//     β± = π·a·(y ∓ d/2) / (λ·L)
//   Sampling: precomputed 2000-bin CDF; binary-search on Math.random()
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Static edu content
// ─────────────────────────────────────────────────────────────────────────────
const EDU = {

  waveparticle: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Wave-Particle Duality</p>
        <p class="edu-description">
          Each particle arrives as a single dot &mdash; purely particle-like. Yet the
          accumulated pattern forms <strong>interference fringes</strong> that can only
          arise from a wave passing through <em>both</em> slits simultaneously. The
          particle interferes with itself. Switch to <em>Particle</em> mode and watch
          the fringe pattern emerge from apparent randomness. This experiment, performed
          with single electrons by Tonomura (1989), is routinely voted the
          &ldquo;most beautiful experiment in physics.&rdquo;
        </p>
        <div class="equation">I(y) = I&#x2080;&thinsp;&middot;&thinsp;sinc&sup2;(&beta;)&thinsp;&middot;&thinsp;cos&sup2;(&delta;/2)</div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">wave-particle duality</span>
          <span class="edu-concept-tag">self-interference</span>
          <span class="edu-concept-tag">Tonomura 1989</span>
          <span class="edu-concept-tag">Born rule</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Real experiments</p>
          <p>
            Tonomura (1989) built up an electron interference pattern dot-by-dot with a
            field-emission gun &mdash; exactly as simulated here. Single-photon double-slit
            experiments have been performed since the 1980s. Neutron interference at
            ILL Grenoble achieves fringe spacings of micrometres with de Broglie
            wavelengths &sim;10<sup>&minus;10</sup>&thinsp;m.
          </p>
        </div>
      </div>
    </div>
  `,

  complementarity: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Complementarity &amp; Which-Way</p>
        <p class="edu-description">
          Bohr&rsquo;s <strong>complementarity principle</strong>: path information
          (which slit) and interference are mutually exclusive. Click
          <em>Which-Way &rarr; On</em> to activate a detector that tags each particle
          with its slit. The fringes instantly collapse into two featureless blobs.
          No matter how gentle the detection, any which-way information destroys
          coherence. The visibility V and which-way knowledge K trade off exactly:
        </p>
        <div class="equation">V&sup2; + K&sup2; &le; 1</div>
        <p class="edu-description" style="font-size:0.82rem;margin-top:4px">
          V = 1 (full fringes, no which-way) &harr; K = 1 (full which-way, no fringes).
        </p>
        <div class="edu-concepts">
          <span class="edu-concept-tag">complementarity</span>
          <span class="edu-concept-tag">which-way</span>
          <span class="edu-concept-tag">decoherence</span>
          <span class="edu-concept-tag">quantum eraser</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Quantum eraser (Scully &amp; Dr&uuml;hl 1982)</p>
          <p>
            Mark each slit with orthogonal polarisations &mdash; fringes vanish.
            Insert a polariser at 45&deg; to <em>erase</em> the which-way tag
            and fringes reappear in post-selected data. Wheeler&rsquo;s delayed-choice
            version shows the choice can be made <em>after</em> the particle has
            already passed the slits, ruling out any classical pre-determination.
          </p>
        </div>
      </div>
    </div>
  `,

  math: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">The Double-Slit Formula</p>
        <p class="edu-description">
          The intensity factorises: a <strong>single-slit envelope</strong> (sinc&sup2;,
          controlled by slit width a) modulates <strong>double-slit fringes</strong>
          (cos&sup2;, spacing &lambda;L/d). <strong>Missing orders</strong> occur when
          d/a is an integer: an interference maximum coincides with a diffraction zero.
          At defaults (d=2, a=0.5, d/a=4), every 4th fringe vanishes.
        </p>
        <div class="equation">I = I&#x2080;&thinsp;&middot;&thinsp;sinc&sup2;(&pi;ay/&lambda;L)&thinsp;&middot;&thinsp;cos&sup2;(&pi;dy/&lambda;L)</div>
        <p class="edu-description" style="font-size:0.82rem;margin-top:4px">
          Slit width a &rarr; position uncertainty &Delta;y &asymp; a. By HUP,
          &Delta;p<sub>y</sub> &ge; &hbar;/(2a) &mdash; exactly the half-width &lambda;/a
          of the diffraction envelope. The envelope <em>is</em> the uncertainty principle.
        </p>
        <div class="edu-concepts">
          <span class="edu-concept-tag">sinc envelope</span>
          <span class="edu-concept-tag">missing orders</span>
          <span class="edu-concept-tag">uncertainty principle</span>
          <span class="edu-concept-tag">Fraunhofer diffraction</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Connection to Uncertainty Principle sim</p>
          <p>
            The sinc&sup2; envelope is the single-slit far-field pattern. Narrow slit
            (small a, sharp &Delta;y) &rarr; broad envelope (large &Delta;p). The
            double-slit adds a cos&sup2; fringe pattern within that envelope.
            Both sims share the same underlying physics: position&ndash;momentum
            Fourier duality.
          </p>
        </div>
      </div>
    </div>
  `

};

function updateEduPanel(m) {
  const el = document.getElementById('sim-edu');
  if (!el) return;
  if (EDU[m]) el.innerHTML = EDU[m];
}

// ─────────────────────────────────────────────────────────────────────────────
// Physical constants
// ─────────────────────────────────────────────────────────────────────────────
const L_FIXED = 4.0;   // slit-to-screen distance (fixed)
const YRANGE  = 5.0;   // display ±5 physical units

// ─────────────────────────────────────────────────────────────────────────────
// Mutable state
// ─────────────────────────────────────────────────────────────────────────────
let lambda        = 0.50;
let slitD         = 2.0;
let slitA         = 0.50;
let displayMode   = 'wave';      // 'wave' | 'particle'
let whichWay      = false;
let particleSpeed = 50;          // particles / second
let eduMode       = 'waveparticle';

// CDF (rebuilt on param / which-way change)
const CDF_N  = 2000;
const cdf    = new Float32Array(CDF_N);
let cdfDirty = true;

// Dot ring buffer (max 3000; after that accumulate histogram only)
const MAX_DOTS    = 3000;
const dotYArr     = new Float32Array(MAX_DOTS);
const dotXFrac    = new Float32Array(MAX_DOTS);  // random x scatter fraction [0,1]
let dotHead       = 0;
let dotCount      = 0;
let totalCount    = 0;

// Histogram
const HIST_N = 100;
const hist   = new Int32Array(HIST_N);
let histMax  = 0;

// In-flight particles  [{t0, ySlit, yScreen, dur}]
let inFlight = [];

// Wave graphics buffer
let waveBuffer = null;
let waveDirty  = true;

// Geometry (populated in computeGeometry)
let G = {};

// Particle emit timing
let lastEmitT = -1;

// ─────────────────────────────────────────────────────────────────────────────
// Physics helpers
// ─────────────────────────────────────────────────────────────────────────────
function sinc(x) {
  return (Math.abs(x) < 1e-8) ? 1.0 : Math.sin(x) / x;
}

function intensity(y) {
  if (whichWay) {
    const b1 = Math.PI * slitA * (y - slitD * 0.5) / (lambda * L_FIXED);
    const b2 = Math.PI * slitA * (y + slitD * 0.5) / (lambda * L_FIXED);
    return sinc(b1) * sinc(b1) + sinc(b2) * sinc(b2);
  }
  const beta  = Math.PI * slitA * y / (lambda * L_FIXED);
  const delta = 2.0 * Math.PI * slitD * y / (lambda * L_FIXED);
  const s = sinc(beta);
  const c = Math.cos(delta * 0.5);
  return s * s * c * c;
}

function buildCDF() {
  let sum = 0;
  for (let i = 0; i < CDF_N; i++) {
    const y = -YRANGE + 2.0 * YRANGE * i / (CDF_N - 1);
    sum += intensity(y);
    cdf[i] = sum;
  }
  const inv = 1.0 / (sum || 1.0);
  for (let i = 0; i < CDF_N; i++) cdf[i] *= inv;
  cdfDirty = false;
}

function sampleY() {
  const r = Math.random();
  let lo = 0, hi = CDF_N - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cdf[mid] < r) lo = mid + 1;
    else hi = mid;
  }
  return -YRANGE + 2.0 * YRANGE * lo / (CDF_N - 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Geometry
// ─────────────────────────────────────────────────────────────────────────────
function computeGeometry() {
  const padT = 38, padB = 28, padX = 12;
  const divX   = floor(width * 0.55);
  const cy     = floor((padT + height - padB) / 2);
  const yScale = (height - padT - padB) / (2.0 * YRANGE);

  // Apparatus panel
  const appX0     = padX;
  const appX1     = divX - padX;
  const barrierPx = appX0 + floor((appX1 - appX0) * 0.42);
  const sourcePx  = appX0 + 18;

  // Screen panel
  const scrnX0 = divX + padX;
  const scrnX1 = width - padX;
  const scrnW  = scrnX1 - scrnX0;

  G = { divX, cy, yScale, padT, padB,
        appX0, appX1, barrierPx, sourcePx,
        scrnX0, scrnX1, scrnW };
}

// ─────────────────────────────────────────────────────────────────────────────
// Wave map (p5.Graphics buffer, rebuilt only on param / which-way change)
// ─────────────────────────────────────────────────────────────────────────────
function buildWaveBuffer() {
  if (waveBuffer) { waveBuffer.remove(); waveBuffer = null; }
  waveBuffer = createGraphics(width, height);
  waveBuffer.clear();
  waveBuffer.noStroke();

  const { barrierPx, appX1, cy, yScale, padT, padB } = G;
  const regionW = appX1 - barrierPx;
  if (regionW <= 0) { waveDirty = false; return; }

  // Find approximate max intensity for normalization (coarse scan)
  let maxI = 0.01;
  for (let ix = 1; ix <= 16; ix++) {
    for (let iy = 0; iy <= 20; iy++) {
      const xP = ix / 16 * L_FIXED;
      const yP = -YRANGE + iy / 20 * 2 * YRANGE;
      const r1 = Math.sqrt(xP * xP + (yP - slitD * 0.5) ** 2) + 0.02;
      const r2 = Math.sqrt(xP * xP + (yP + slitD * 0.5) ** 2) + 0.02;
      let I;
      if (whichWay) {
        I = 1 / r1 + 1 / r2;
      } else {
        const phi1 = 2 * Math.PI * r1 / lambda;
        const phi2 = 2 * Math.PI * r2 / lambda;
        const re = Math.cos(phi1) / Math.sqrt(r1) + Math.cos(phi2) / Math.sqrt(r2);
        const im = Math.sin(phi1) / Math.sqrt(r1) + Math.sin(phi2) / Math.sqrt(r2);
        I = re * re + im * im;
      }
      if (I > maxI) maxI = I;
    }
  }

  const STEP = 5;
  for (let px = barrierPx; px < appX1; px += STEP) {
    for (let py = padT; py < height - padB; py += STEP) {
      const xP = ((px - barrierPx) / regionW) * L_FIXED;
      const yP = (py - cy) / yScale;

      const r1 = Math.sqrt(xP * xP + (yP - slitD * 0.5) ** 2) + 0.02;
      const r2 = Math.sqrt(xP * xP + (yP + slitD * 0.5) ** 2) + 0.02;

      let I;
      if (whichWay) {
        I = 1 / r1 + 1 / r2;
      } else {
        const phi1 = 2 * Math.PI * r1 / lambda;
        const phi2 = 2 * Math.PI * r2 / lambda;
        const re = Math.cos(phi1) / Math.sqrt(r1) + Math.cos(phi2) / Math.sqrt(r2);
        const im = Math.sin(phi1) / Math.sqrt(r1) + Math.sin(phi2) / Math.sqrt(r2);
        I = re * re + im * im;
      }

      const t = Math.min(I / maxI, 1.0);
      if (t < 0.025) continue;
      waveBuffer.fill(45, 215, 135, t * 205);
      waveBuffer.rect(px, py, STEP, STEP);
    }
  }

  waveDirty = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Read HTML controls each frame; dirty-flag on change
// ─────────────────────────────────────────────────────────────────────────────
function readControls() {
  const lEl = document.getElementById('lambda-slider');
  const dEl = document.getElementById('d-slider');
  const aEl = document.getElementById('a-slider');
  const sEl = document.getElementById('speed-slider');
  if (!lEl) return;

  const newL = parseFloat(lEl.value);
  const newD = parseFloat(dEl.value);
  const newA = parseFloat(aEl.value);

  let changed = false;
  if (newL !== lambda) { lambda = newL; changed = true; }
  if (newD !== slitD)  { slitD  = newD; changed = true; }
  if (newA !== slitA)  { slitA  = newA; changed = true; }

  if (changed) {
    cdfDirty  = true;
    waveDirty = true;
    document.getElementById('lambda-val').textContent = lambda.toFixed(2);
    document.getElementById('d-val').textContent      = slitD.toFixed(1);
    document.getElementById('a-val').textContent      = slitA.toFixed(2);
  }

  if (sEl) {
    const newSpd = parseFloat(sEl.value);
    if (newSpd !== particleSpeed) {
      particleSpeed = newSpd;
      document.getElementById('speed-val').textContent = Math.round(particleSpeed);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// p5 lifecycle
// ─────────────────────────────────────────────────────────────────────────────
function setup() {
  const cont = document.getElementById('canvas-container');
  createCanvas(cont.clientWidth, cont.clientHeight).parent('canvas-container');
  computeGeometry();
  textFont('Courier New');
  buildCDF();
  buildWaveBuffer();
  updateEduPanel('waveparticle');
}

function windowResized() {
  const cont = document.getElementById('canvas-container');
  resizeCanvas(cont.clientWidth, cont.clientHeight);
  computeGeometry();
  waveDirty = true;
}

function draw() {
  readControls();
  if (cdfDirty)  buildCDF();
  if (waveDirty) buildWaveBuffer();

  background(17, 24, 32);

  drawApparatus();
  drawScreen();
  drawDivider();

  if (displayMode === 'particle') {
    emitParticles();
    updateAndDrawFlight();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Apparatus panel
// ─────────────────────────────────────────────────────────────────────────────
function drawApparatus() {
  const { appX0, appX1, barrierPx, sourcePx, cy, yScale, padT, padB } = G;

  // Panel title
  noStroke(); fill(139, 148, 158); textSize(10); textAlign(LEFT, BOTTOM);
  text(displayMode === 'wave' ? 'Wave propagation' : 'Particle paths', appX0 + 2, padT - 4);

  // Wave interference map (wave mode only)
  if (displayMode === 'wave' && waveBuffer) {
    image(waveBuffer, 0, 0);
  }

  // Animated expanding arcs from source (wave mode; clipped to source region)
  if (displayMode === 'wave') {
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(appX0, padT, barrierPx - appX0, height - padT - padB);
    drawingContext.clip();

    const arcStep = max(lambda * yScale * 1.0, 8);
    const maxR    = barrierPx - sourcePx + 10;
    const tOff    = (frameCount * 1.5) % arcStep;

    noFill(); strokeWeight(1);
    for (let r = tOff; r < maxR; r += arcStep) {
      const alpha = map(r, 0, maxR, 190, 12);
      stroke(45, 215, 135, alpha);
      arc(sourcePx, cy, r * 2, r * 2, -HALF_PI * 0.72, HALF_PI * 0.72);
    }

    drawingContext.restore();
  }

  // Source dot with glow
  noStroke();
  for (let s = 5; s >= 1; s--) {
    fill(88, 166, 255, 32 * s);
    ellipse(sourcePx, cy, s * 5.5, s * 5.5);
  }
  fill(88, 166, 255);
  ellipse(sourcePx, cy, 7, 7);

  // Barrier
  const slitHalfA = slitA * 0.5 * yScale;
  const slit1CY   = cy - slitD * 0.5 * yScale;
  const slit2CY   = cy + slitD * 0.5 * yScale;
  const bW        = 7;

  fill(50, 65, 85); noStroke();
  // Top block (above slit 1)
  rect(barrierPx - bW * 0.5, 0, bW, slit1CY - slitHalfA);
  // Middle block (between slits)
  const midTop = slit1CY + slitHalfA;
  const midBot = slit2CY - slitHalfA;
  if (midBot > midTop) {
    rect(barrierPx - bW * 0.5, midTop, bW, midBot - midTop);
  }
  // Bottom block (below slit 2)
  rect(barrierPx - bW * 0.5, slit2CY + slitHalfA, bW,
       height - (slit2CY + slitHalfA));

  // Slit edge highlights
  stroke(45, 215, 135, 70); strokeWeight(0.5); noFill();
  [slit1CY, slit2CY].forEach(scy => {
    line(barrierPx - bW, scy - slitHalfA, barrierPx + bW, scy - slitHalfA);
    line(barrierPx - bW, scy + slitHalfA, barrierPx + bW, scy + slitHalfA);
  });

  // Which-way detector indicator
  if (whichWay) {
    // Purple glow line on barrier
    stroke(170, 65, 255, 55); strokeWeight(5); noFill();
    line(barrierPx, 0, barrierPx, height);

    // Detector symbols
    noStroke(); fill(170, 65, 255, 210);
    textSize(9); textAlign(CENTER, BOTTOM);
    text('\u25CE', barrierPx, slit1CY - slitHalfA - 3);
    text('\u25CE', barrierPx, slit2CY + slitHalfA + 14);

    textSize(8); textAlign(CENTER, BOTTOM);
    text('DETECTOR', barrierPx, slit1CY - slitHalfA - 14);
  }

  // Labels
  noStroke(); fill(139, 148, 158); textSize(9); textAlign(CENTER, TOP);
  text('source', sourcePx, padT + 2);
  text('slits', barrierPx, padT + 2);
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen panel
// ─────────────────────────────────────────────────────────────────────────────
function drawScreen() {
  const { scrnX0, scrnX1, scrnW, cy, yScale, padT } = G;

  // Panel title
  noStroke(); fill(139, 148, 158); textSize(10); textAlign(LEFT, BOTTOM);
  text('Detection screen \u2014 N = ' + totalCount, scrnX0, padT - 4);

  // Zero line
  stroke(30, 38, 50); strokeWeight(1); noFill();
  line(scrnX0, cy, scrnX1, cy);

  // Y-axis tick labels
  noStroke(); fill(139, 148, 158); textSize(9); textAlign(RIGHT, CENTER);
  for (let y = -4; y <= 4; y += 2) {
    const py = cy + y * yScale;
    text(y > 0 ? '+' + y : String(y), scrnX0 + 20, py);
    stroke(30, 38, 50); strokeWeight(0.5); noFill();
    line(scrnX0 + 22, py, scrnX0 + 26, py);
    noStroke(); fill(139, 148, 158);
  }

  // Histogram bars (right 55% of panel, from scrnX1 leftward)
  drawHistogram();

  // Theory curve (overlaid on histogram)
  drawTheoryCurve();

  // Accumulated dots (left 35% of panel, scattered)
  const dotBandX0 = scrnX0 + 28;
  const dotBandW  = scrnW * 0.35;
  noStroke();
  for (let i = 0; i < dotCount; i++) {
    const py = cy + dotYArr[i] * yScale;
    const px = dotBandX0 + dotXFrac[i] * dotBandW;
    fill(45, 215, 135, 120);
    ellipse(px, py, 3, 3);
  }
}

function drawHistogram() {
  const { scrnX1, scrnW, cy, yScale } = G;
  if (histMax === 0) return;
  const maxBarW = scrnW * 0.55;
  noStroke();
  for (let i = 0; i < HIST_N; i++) {
    if (hist[i] === 0) continue;
    const y0 = -YRANGE + 2 * YRANGE * i       / HIST_N;
    const y1 = -YRANGE + 2 * YRANGE * (i + 1) / HIST_N;
    const py0 = cy + y0 * yScale;
    const py1 = cy + y1 * yScale;
    const barH = Math.abs(py1 - py0);
    const barW = (hist[i] / histMax) * maxBarW;
    fill(45, 215, 135, 55);
    rect(scrnX1 - barW, Math.min(py0, py1), barW, barH);
  }
}

function drawTheoryCurve() {
  const { scrnX1, scrnW, cy, yScale } = G;
  const maxBarW = scrnW * 0.55;

  // Find peak intensity for normalization
  let maxI = 1e-12;
  for (let i = 0; i <= 400; i++) {
    const y = -YRANGE + 2 * YRANGE * i / 400;
    const v = intensity(y);
    if (v > maxI) maxI = v;
  }

  stroke(whichWay ? color(255, 150, 50) : color(88, 166, 255));
  strokeWeight(2); noFill();

  beginShape();
  for (let i = 0; i <= 500; i++) {
    const y  = -YRANGE + 2 * YRANGE * i / 500;
    const py = cy + y * yScale;
    const px = scrnX1 - (intensity(y) / maxI) * maxBarW;
    vertex(px, py);
  }
  endShape();
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel divider
// ─────────────────────────────────────────────────────────────────────────────
function drawDivider() {
  stroke(30, 38, 50); strokeWeight(1);
  line(G.divX, 0, G.divX, height);
}

// ─────────────────────────────────────────────────────────────────────────────
// Particle system
// ─────────────────────────────────────────────────────────────────────────────
function emitParticles() {
  if (cdfDirty) return;
  const now = millis() * 0.001;
  if (lastEmitT < 0) { lastEmitT = now; return; }

  const interval = 1.0 / particleSpeed;
  let emitted = 0;
  while (now - lastEmitT >= interval && emitted < 12) {
    lastEmitT += interval;
    emitted++;

    const yScreen = sampleY();

    // Visual exit slit: proportional to single-slit amplitude at sampled y
    const p1 = sinc(Math.PI * slitA * (yScreen - slitD * 0.5) / (lambda * L_FIXED));
    const p2 = sinc(Math.PI * slitA * (yScreen + slitD * 0.5) / (lambda * L_FIXED));
    const p1sq = p1 * p1, p2sq = p2 * p2;
    const ySlit = (Math.random() < p1sq / (p1sq + p2sq + 1e-12))
                ? -slitD * 0.5 : slitD * 0.5;

    inFlight.push({ t0: now, ySlit, yScreen, dur: 0.28 });
  }
}

function updateAndDrawFlight() {
  const { barrierPx, appX1, cy, yScale } = G;
  const now = millis() * 0.001;

  for (let i = inFlight.length - 1; i >= 0; i--) {
    const p = inFlight[i];
    const t = now - p.t0;

    if (t >= p.dur) {
      detectParticle(p.yScreen);
      inFlight.splice(i, 1);
      continue;
    }

    const frac    = t / p.dur;
    const px      = lerp(G.barrierPx + 4, appX1, frac);
    const pyStart = cy + p.ySlit   * yScale;
    const pyEnd   = cy + p.yScreen * yScale;
    const py      = lerp(pyStart, pyEnd, frac);

    noStroke();
    for (let s = 4; s >= 1; s--) {
      fill(88, 166, 255, 48 * s);
      ellipse(px, py, s * 3, s * 3);
    }
    fill(88, 166, 255);
    ellipse(px, py, 5, 5);
  }
}

function detectParticle(y) {
  if (dotCount < MAX_DOTS) {
    dotYArr[dotHead]  = y;
    dotXFrac[dotHead] = Math.random();
    dotHead++;
    dotCount++;
  }
  totalCount++;

  // Always accumulate histogram
  const i = Math.floor((y + YRANGE) / (2 * YRANGE) * HIST_N);
  if (i >= 0 && i < HIST_N) {
    hist[i]++;
    if (hist[i] > histMax) histMax = hist[i];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Button handlers (called from HTML onclick)
// ─────────────────────────────────────────────────────────────────────────────
function setDisplayMode(m) {
  displayMode = m;
  document.querySelectorAll('.dispmode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('dispmode-btn-' + m).classList.add('active');
  const sr = document.getElementById('speed-row');
  if (sr) sr.style.display = (m === 'particle') ? '' : 'none';
  lastEmitT = -1;
}

function setWhichWay(on) {
  whichWay = on;
  document.querySelectorAll('.ww-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('ww-btn-' + (on ? 'on' : 'off')).classList.add('active');
  cdfDirty  = true;
  waveDirty = true;
  clearScreen();
}

function clearScreen() {
  dotCount   = 0;
  dotHead    = 0;
  totalCount = 0;
  hist.fill(0);
  histMax  = 0;
  inFlight = [];
  lastEmitT = -1;
}

function setEduMode(m) {
  eduMode = m;
  document.querySelectorAll('.edu-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('edu-btn-' + m).classList.add('active');
  updateEduPanel(m);
}
