// ─────────────────────────────────────────────────────────────────────────────
// Wave Interference — sketch.js
//
// Three modes
//   continuous : infinite counter-propagating sine waves → standing wave
//   snapshot   : same as continuous but time is frozen; scrub with slider
//   pulse      : Gaussian-windowed pulses launched from each end; they pass
//                through each other, demonstrating linear superposition
//
// Superposition curve is colored by a constructive/destructive colormap:
//   teal/green  = constructive (positive)
//   purple      = constructive (negative)
//   red         = destructive
//
// Wave equations
//   A: y_A(x,t) = A_A · sin(kx − ωt)           (travels right)
//   B: y_B(x,t) = A_B · sin(kx + ωt + φ)       (travels left, phase offset φ)
//   superposition: y = y_A + y_B
//
// Envelope (analytical, continuous/snapshot only)
//   y = C(x)·cos(ωt) + S(x)·sin(ωt)
//   C(x) = A_A·sin(kx) + A_B·sin(kx+φ)
//   S(x) = −A_A·cos(kx) + A_B·cos(kx+φ)
//   E(x) = √(C² + S²)   ← max amplitude at x over all t
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

// ── State ─────────────────────────────────────────────────────────────────────
let mode = 'continuous';
let t = 0;           // continuous / snapshot time (seconds)
let snapshotT = 0;

let pulseT = 0;
let pulseRunning = false;

// ── Parameters (read from DOM each frame) ─────────────────────────────────────
let ampA    = 70;   // 0–100  (% of maxAmpPx)
let ampB    = 70;
let phaseB  = 0;   // radians (0–2π)
let waveLen = 200; // wavelength in canvas-pixels
let speed   = 80;  // px / second

// ── Display toggles ───────────────────────────────────────────────────────────
let showComponents = true;
let showEnvelope   = false;
let showNodes      = false;

// ── Drawing constants ─────────────────────────────────────────────────────────
const STEP = 2;  // horizontal sampling interval (px) for curve rendering

// ── Cached p5 colors ──────────────────────────────────────────────────────────
let cA, cB, cAxis, cEnv, cNode;

// ─────────────────────────────────────────────────────────────────────────────
// p5 lifecycle
// ─────────────────────────────────────────────────────────────────────────────
function setup() {
  const cont = document.getElementById('canvas-container');
  const cnv  = createCanvas(cont.clientWidth, cont.clientHeight);
  cnv.parent('canvas-container');

  cA    = color(88,  166, 255, 140);  // blue   – Wave A
  cB    = color(255, 150,  50, 140);  // orange – Wave B
  cAxis = color(48,   54,  61);       // ≈ --border
  cEnv  = color(80,  215, 110, 120);  // dashed green envelope
  cNode = color(200,  90,  90, 190);  // dashed red node markers
}

function windowResized() {
  const cont = document.getElementById('canvas-container');
  resizeCanvas(cont.clientWidth, cont.clientHeight);
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM helpers
// ─────────────────────────────────────────────────────────────────────────────
function readControls() {
  ampA    = +document.getElementById('amp-a').value;
  ampB    = +document.getElementById('amp-b').value;
  phaseB  = +document.getElementById('phase-b').value;
  waveLen = +document.getElementById('wavelength').value;
  speed   = +document.getElementById('speed').value;

  document.getElementById('amp-a-val').textContent =
    ampA + '%';
  document.getElementById('amp-b-val').textContent =
    ampB + '%';
  document.getElementById('phase-b-val').textContent =
    (phaseB / Math.PI).toFixed(2) + 'π';
  document.getElementById('wavelength-val').textContent =
    waveLen + ' px';
  document.getElementById('speed-val').textContent =
    speed + ' px/s';

  showComponents = document.getElementById('show-components').checked;
  showEnvelope   = document.getElementById('show-envelope').checked;
  showNodes      = document.getElementById('show-nodes').checked;

  if (mode === 'snapshot') {
    const period  = waveLen / speed;
    const frac    = +document.getElementById('snapshot-t').value;
    snapshotT     = frac * period;
    document.getElementById('snapshot-t-val').textContent =
      Math.round(frac * 100) + '%';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Wave math
// ─────────────────────────────────────────────────────────────────────────────

// Maximum visual amplitude in canvas pixels
function maxAmpPx() { return height * 0.40; }

// Continuous wave functions — return y in pixels (+up)
function yA(x, time) {
  const k = TWO_PI / waveLen;
  const w = (TWO_PI * speed) / waveLen;
  return (ampA / 100) * maxAmpPx() * sin(k * x - w * time);
}

function yB(x, time) {
  const k = TWO_PI / waveLen;
  const w = (TWO_PI * speed) / waveLen;
  return (ampB / 100) * maxAmpPx() * sin(k * x + w * time + phaseB);
}

// ─────────────────────────────────────────────────────────────────────────────
// Pulse math (Gaussian-windowed sinusoid)
// ─────────────────────────────────────────────────────────────────────────────
function pSigma()     { return waveLen * 1.25; }
function pCenterA(pt) { return -3 * pSigma() + speed * pt; }
function pCenterB(pt) { return width + 3 * pSigma() - speed * pt; }

function pyA(x, pt) {
  const c = pCenterA(pt), s = pSigma(), k = TWO_PI / waveLen;
  return (ampA / 100) * maxAmpPx() *
         exp(-pow(x - c, 2) / (2 * s * s)) *
         sin(k * (x - c));
}

function pyB(x, pt) {
  const c = pCenterB(pt), s = pSigma(), k = TWO_PI / waveLen;
  return (ampB / 100) * maxAmpPx() *
         exp(-pow(x - c, 2) / (2 * s * s)) *
         sin(-k * (x - c) + phaseB);
}

// Automatically loop pulse once both pulses have fully exited the canvas
function tickPulse() {
  if (!pulseRunning) return;
  pulseT += deltaTime / 1000;
  const s = pSigma();
  if (pCenterA(pulseT) > width + 3 * s && pCenterB(pulseT) < -3 * s) {
    pulseT = 0;  // loop
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Envelope  (analytical — valid for continuous / snapshot modes only)
// ─────────────────────────────────────────────────────────────────────────────
function envelopeAt(x) {
  const k  = TWO_PI / waveLen;
  const AA = (ampA / 100) * maxAmpPx();
  const AB = (ampB / 100) * maxAmpPx();
  const C  =  AA * sin(k * x) + AB * sin(k * x + phaseB);
  const S  = -AA * cos(k * x) + AB * cos(k * x + phaseB);
  return sqrt(C * C + S * S);
}

// ─────────────────────────────────────────────────────────────────────────────
// Interference colormap
//   constructiveness c = |y_total| / (|y_A| + |y_B|)   ∈ [0, 1]
//   c ≈ 0  → destructive  →  red
//   c ≈ 1, y_total > 0  →  constructive (+)  →  teal/green
//   c ≈ 1, y_total < 0  →  constructive (−)  →  purple
// ─────────────────────────────────────────────────────────────────────────────
function iColor(va, vb, vt) {
  const maxP = abs(va) + abs(vb);
  if (maxP < 0.4) return color(38, 44, 56);  // silence — no wave activity
  const c = abs(vt) / maxP;                  // 0=destructive → 1=constructive
  if (vt >= 0) {
    return lerpColor(color(210, 40, 45), color(45, 255, 135), c);  // red → teal
  } else {
    return lerpColor(color(210, 40, 45), color(170, 65, 255), c);  // red → purple
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing helpers
// ─────────────────────────────────────────────────────────────────────────────
const cy = () => height / 2;  // canvas y center

function drawAxis() {
  stroke(cAxis);
  strokeWeight(1);
  line(0, cy(), width, cy());
}

// Draw the two semi-transparent component waves
function drawComponents(fA, fB) {
  if (!showComponents) return;
  const mid = cy();

  stroke(cA); strokeWeight(1.5); noFill();
  beginShape();
  for (let x = 0; x <= width; x += STEP) vertex(x, mid - fA(x));
  endShape();

  stroke(cB); strokeWeight(1.5); noFill();
  beginShape();
  for (let x = 0; x <= width; x += STEP) vertex(x, mid - fB(x));
  endShape();
}

// Draw superposition with per-segment interference colormap
function drawSuperposition(fA, fB) {
  const mid   = cy();
  strokeWeight(2.5);
  let prevTot = fA(0) + fB(0);

  for (let x = STEP; x <= width; x += STEP) {
    const va = fA(x), vb = fB(x), vt = va + vb;
    // Color sampled at segment midpoint for smooth transitions
    const mva = fA(x - STEP / 2);
    const mvb = fB(x - STEP / 2);
    const mvt = (prevTot + vt) / 2;
    stroke(iColor(mva, mvb, mvt));
    line(x - STEP, mid - prevTot, x, mid - vt);
    prevTot = vt;
  }
}

// Draw superposition in pulse mode — colormap only rendered where BOTH Gaussian
// envelopes have significant amplitude, so isolated pulses show as plain blue/orange
// and the interference coloring only appears in the actual overlap zone.
const PULSE_OVERLAP_THRESH = 0.04;  // fraction of Gaussian peak (0–1)

function drawSuperpositionPulse(fA, fB) {
  const mid = cy();
  const s   = pSigma();
  const cA_pos = pCenterA(pulseT);
  const cB_pos = pCenterB(pulseT);
  strokeWeight(2.5);
  let prevTot = fA(0) + fB(0);

  for (let x = STEP; x <= width; x += STEP) {
    const va = fA(x), vb = fB(x), vt = va + vb;

    // Normalized Gaussian envelope values (0–1) for each pulse at this x
    const envA = exp(-pow(x - cA_pos, 2) / (2 * s * s));
    const envB = exp(-pow(x - cB_pos, 2) / (2 * s * s));

    if (envA > PULSE_OVERLAP_THRESH && envB > PULSE_OVERLAP_THRESH) {
      // In the overlap zone — draw colormap
      const mva = fA(x - STEP / 2);
      const mvb = fB(x - STEP / 2);
      const mvt = (prevTot + vt) / 2;
      stroke(iColor(mva, mvb, mvt));
      line(x - STEP, mid - prevTot, x, mid - vt);
    }

    prevTot = vt;
  }
}

// Dashed envelope curves (continuous / snapshot only)
function drawEnvelopeCurves() {
  if (!showEnvelope || mode === 'pulse') return;
  const mid = cy();
  stroke(cEnv); strokeWeight(1); noFill();
  drawingContext.setLineDash([5, 7]);

  beginShape();
  for (let x = 0; x <= width; x += STEP) vertex(x, mid - envelopeAt(x));
  endShape();
  beginShape();
  for (let x = 0; x <= width; x += STEP) vertex(x, mid + envelopeAt(x));
  endShape();

  drawingContext.setLineDash([]);
}

// Node markers: scan for local minima of E(x) below a threshold
function drawNodeMarkers() {
  if (!showNodes || mode === 'pulse') return;
  const maxE = ((ampA + ampB) / 200) * maxAmpPx();
  if (maxE < 1) return;
  const thresh = maxE * 0.10;

  let prev = envelopeAt(0);
  let curr = envelopeAt(2);

  for (let x = 4; x < width - 2; x += 2) {
    const next = envelopeAt(x);
    if (curr < prev && curr < next && curr < thresh) {
      const nx = x - 2;
      drawingContext.setLineDash([3, 5]);
      stroke(cNode); strokeWeight(1);
      line(nx, 44, nx, height - 10);
      drawingContext.setLineDash([]);
      fill(cNode); noStroke();
      textFont('Courier New');
      textSize(9); textAlign(CENTER);
      text('N', nx, 38);
      noFill();
    }
    prev = curr;
    curr = next;
  }
  drawingContext.setLineDash([]);
}

// Canvas labels and color-key legend
function drawLabels() {
  noStroke(); textFont('Courier New');

  // Wave direction labels (only when components visible)
  if (showComponents) {
    const topY = cy() - maxAmpPx() - 10;
    textSize(10); textAlign(LEFT);
    fill(cA);
    text('Wave A  →', 12, topY - 14);
    fill(cB);
    text('← Wave B', 12, topY - 2);
  }

  // Superposition color key (top-right)
  const lx = width - 152, ly = 14;
  textSize(9); textAlign(LEFT);
  fill(45, 255, 135);  text('▬ constructive (+)', lx, ly);
  fill(170, 65, 255);  text('▬ constructive (−)', lx, ly + 13);
  fill(210, 40, 45);   text('▬ destructive',         lx, ly + 26);

  // Mode hint at top-center
  fill(140, 148, 158);
  textSize(10); textAlign(CENTER);
  if (mode === 'pulse') {
    text('PULSE — waves pass through each other unchanged', width / 2, 16);
  } else if (mode === 'snapshot') {
    text('SNAPSHOT — scrub the time slider to explore the interference pattern', width / 2, 16);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main draw loop
// ─────────────────────────────────────────────────────────────────────────────
function draw() {
  background(17, 24, 32);  // --bg-canvas #111820
  readControls();

  if (mode === 'continuous') {
    t += deltaTime / 1000;
    const fA = x => yA(x, t), fB = x => yB(x, t);
    drawAxis();
    drawComponents(fA, fB);
    drawSuperposition(fA, fB);
    drawEnvelopeCurves();
    drawNodeMarkers();

  } else if (mode === 'snapshot') {
    const fA = x => yA(x, snapshotT), fB = x => yB(x, snapshotT);
    drawAxis();
    drawComponents(fA, fB);
    drawSuperposition(fA, fB);
    drawEnvelopeCurves();
    drawNodeMarkers();

  } else if (mode === 'pulse') {
    tickPulse();
    const fA = x => pyA(x, pulseT), fB = x => pyB(x, pulseT);
    drawAxis();
    drawSuperpositionPulse(fA, fB);  // drawn first so components render on top
    drawComponents(fA, fB);
  }

  drawLabels();
}

// ─────────────────────────────────────────────────────────────────────────────
// Mode switching (called from HTML)
// ─────────────────────────────────────────────────────────────────────────────
function setMode(m) {
  mode = m;
  if (m === 'continuous') t = 0;
  if (m === 'pulse')      { pulseT = 0; pulseRunning = false; }

  // Show/hide snapshot time scrub
  document.getElementById('snapshot-row').style.display =
    m === 'snapshot' ? 'block' : 'none';

  // Show/hide pulse launch + pause buttons
  document.getElementById('pulse-launch').style.display =
    m === 'pulse' ? 'block' : 'none';
  document.getElementById('pulse-pause').style.display =
    m === 'pulse' ? 'block' : 'none';

  // Dim envelope & node controls in pulse mode
  const dimClass = 'ctrl-disabled';
  ['env-row', 'node-row'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle(dimClass, m === 'pulse');
  });

  // Active button highlight
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('mode-btn-' + m);
  if (btn) btn.classList.add('active');
}

function launchPulse() {
  pulseT = 0;
  pulseRunning = true;
  const btn = document.getElementById('pulse-pause');
  if (btn) btn.textContent = '⏸ Pause';
}

function togglePause() {
  pulseRunning = !pulseRunning;
  const btn = document.getElementById('pulse-pause');
  if (btn) btn.textContent = pulseRunning ? '⏸ Pause' : '▶ Resume';
}
