// ─────────────────────────────────────────────────────────────────────────────
// Photoelectric Effect — sketch.js
//
// Canvas split:
//   LEFT  (0–44%)  : Apparatus — source, metal plate, collector, circuit
//   RIGHT (46–100%): Two stacked plots:
//                    Top:    KE_max vs wavelength
//                    Bottom: Photocurrent vs wavelength
//
// Both plots always show BOTH predictions (active model bright, inactive dimmed)
// so the contrast is always visible without toggling.
//
// Physics (all energies in eV):
//   E_photon     = hc/λ = 1239.8 eV·nm / λ_nm
//   KE_max       = max(0, E_photon − φ)          [Einstein, 1905]
//   λ_threshold  = 1239.8 / φ_eV  (nm)
//   Classical KE ∝ intensity (horizontal — independent of frequency)
//   Classical I  ∝ intensity (flat — no threshold frequency)
//   Quantum I    = 0 for λ > λ_thresh; ∝ intensity for λ ≤ λ_thresh
//
// Color language (consistent with quantum series):
//   Quantum curves / electrons : accent blue  (88, 166, 255)
//   Classical curves           : orange       (255, 150, 50)
//   Threshold marker           : purple       (170, 65, 255)
//   Photon particles           : wavelength color (lamToRGB)
//   Current readout            : teal         (45, 215, 135)
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

// ── Physical constant ─────────────────────────────────────────────────────────
const HC_EV_NM = 1239.8;   // hc/e — photon energy: E_eV = HC_EV_NM / λ_nm

// ── Metals (work functions φ in eV, plate RGB) ────────────────────────────────
const METALS = {
  cesium: { label: 'Cs', phi: 2.0, rgb: [175, 160, 140] },
  sodium: { label: 'Na', phi: 2.3, rgb: [205, 205, 185] },
  zinc:   { label: 'Zn', phi: 4.3, rgb: [138, 162, 165] },
  gold:   { label: 'Au', phi: 5.1, rgb: [212, 175,  55] },
};

// ── Wavelength axis range for plots ──────────────────────────────────────────
const P_LAM_MIN = 150;   // nm  (deep UV — energetic enough for all metals)
const P_LAM_MAX = 700;   // nm  (red)

// ── Simulation state ──────────────────────────────────────────────────────────
let mode      = 'quantum';   // 'classical' | 'quantum'
let metalKey  = 'cesium';
let lambdaNm  = 450;         // nm — set by slider
let intensity = 0.6;         // 0–1

// ── Derived physics (recomputed every frame) ──────────────────────────────────
let phi, threshLam, keMax, keClassical;

function updatePhysics() {
  phi         = METALS[metalKey].phi;
  threshLam   = HC_EV_NM / phi;                     // nm
  keMax       = Math.max(0, HC_EV_NM / lambdaNm - phi);  // quantum KE (eV)
  keClassical = intensity * phi * 0.75;              // classical "prediction" (eV)
}

// ── Particle pools ────────────────────────────────────────────────────────────
const PHOTON_RATE  = 7;     // photons/sec at intensity = 1
const MAX_PHOTONS  = 50;
const MAX_ELECTRONS = 35;
const MAX_ABSORBS  = 20;

let photons   = [];  // { x, y, vy, active }
let electrons = [];  // { x, y, vx, vy, ke, active }
let absorbs   = [];  // { x, y, alpha }  — absorbed-photon flash markers

let photonTimer = 0;  // seconds accumulated between spawns

// ── Classical energy accumulation ────────────────────────────────────────────
// Plate fills like a capacitor; emits an electron when it reaches φ.
let classAccum = 0;        // 0 → phi (eV)
const TAU_FULL = 3.5;      // seconds to fill at 100% intensity

// ── Ammeter (live smoothed current display) ───────────────────────────────────
let currentLevel = 0;      // 0–1, decays each frame, spikes on electron arrival

// ── Geometry (recomputed on setup / windowResized) ───────────────────────────
let divX;
let srcX, srcY;
let plateX, plateY0, plateY1;
let collX, collY0, collY1;
let wireY;
let plotX0, plotX1;
let keY0, keY1;
let curY0, curY1;

function computeGeometry() {
  divX    = width * 0.44;

  srcX    = width * 0.07;
  srcY    = height * 0.43;

  plateX  = width * 0.23;
  plateY0 = height * 0.22;
  plateY1 = height * 0.70;

  collX   = width * 0.38;
  collY0  = height * 0.22;
  collY1  = height * 0.70;

  wireY   = height * 0.80;

  plotX0  = divX + width * 0.04;
  plotX1  = width - 14;
  keY0    = height * 0.07;
  keY1    = height * 0.46;
  curY0   = height * 0.54;
  curY1   = height * 0.91;
}

// ── Wavelength → approximate perceived RGB (0–255 each) ──────────────────────
function lamToRGB(nm) {
  let r = 0, g = 0, b = 0;
  if      (nm < 380)  { r = 0.5; g = 0;   b = 1.0; }  // UV → violet proxy
  else if (nm < 440)  { r = (440 - nm) / 60; b = 1; }
  else if (nm < 490)  { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510)  { g = 1; b = (510 - nm) / 20; }
  else if (nm < 580)  { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645)  { r = 1; g = (645 - nm) / 65; }
  else                { r = 1; }
  let fade = 1;
  if      (nm < 380)  fade = 0.5;
  else if (nm < 420)  fade = 0.3 + 0.7 * (nm - 380) / 40;
  else if (nm > 680)  fade = 0.3 + 0.7 * (700 - nm) / 20;
  return [r * fade * 255, g * fade * 255, b * fade * 255];
}

// ── Educational content ───────────────────────────────────────────────────────
const EDU = {

  classical: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Classical Wave Model</p>
        <p class="edu-description">
          In the classical picture, light is a continuous electromagnetic wave. Its energy
          flows steadily into atoms at a rate proportional to <strong>intensity</strong>
          (wave amplitude squared). Any frequency, given enough time, should accumulate
          enough energy to overcome the work function φ and release an electron.
          The plate charges like a slow capacitor.
        </p>
        <p class="edu-description">
          This predicts: no threshold frequency; a time delay for dim light; and faster
          electrons from brighter light (KE ∝ intensity, not frequency).
          All three predictions are <em>wrong</em>.
        </p>
        <div class="edu-concepts">
          <span class="edu-concept-tag">wave model</span>
          <span class="edu-concept-tag">energy accumulation</span>
          <span class="edu-concept-tag">no threshold</span>
          <span class="edu-concept-tag">KE ∝ intensity</span>
          <span class="edu-concept-tag">equipartition failure</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Three failures of the wave model</p>
          <p>
            <strong>1. Threshold frequency:</strong> Experiment shows a strict cutoff ν₀ = φ/h.
            Below it: zero electrons, forever, regardless of intensity.
            Classical: any EM wave eventually works.
          </p>
          <p>
            <strong>2. Instantaneous emission:</strong> Electrons appear the moment light
            arrives, even at vanishingly low intensity. Classical: a time delay is required
            while energy accumulates — up to years for dim light on most metals.
          </p>
          <p>
            <strong>3. KE ∝ ν, not intensity:</strong> Brighter light produces <em>more</em>
            electrons, not faster ones. KE depends only on frequency.
            Classical predicts the opposite.
          </p>
        </div>
      </div>
    </div>
  `,

  quantum: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Einstein's Photon Model (1905)</p>
        <p class="edu-description">
          Einstein proposed that light arrives in discrete packets — <strong>photons</strong> —
          each carrying energy E&nbsp;=&nbsp;hν. An electron absorbs exactly one photon.
          If that photon's energy exceeds the work function φ, the electron is
          ejected instantly with:
        </p>
        <div class="equation">KE<sub>max</sub> = hν − φ = hc/λ − φ</div>
        <p class="edu-description">
          Below threshold (hν&nbsp;&lt;&nbsp;φ): the photon is absorbed as heat — no electron,
          no matter how many photons per second. Above threshold: emission is instantaneous
          and KE scales linearly with frequency. Intensity only controls how
          many photons arrive, not their energy.
        </p>
        <div class="edu-concepts">
          <span class="edu-concept-tag">photon E = hν</span>
          <span class="edu-concept-tag">threshold frequency</span>
          <span class="edu-concept-tag">KE = hν − φ</span>
          <span class="edu-concept-tag">work function</span>
          <span class="edu-concept-tag">instantaneous emission</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Real-world applications</p>
          <p>
            <strong>Image sensors (CCD / CMOS):</strong> Every pixel is a photodetector.
            Photons eject electrons from silicon (φ ≈ 1.1 eV); the charge is read as
            pixel brightness. Silicon sensors are blind to far-IR because hν &lt; 1.1 eV
            — the exact same threshold logic in your phone camera.
          </p>
          <p>
            <strong>Millikan's confirmation (1914–1916):</strong> Robert Millikan spent
            10 years trying to <em>disprove</em> Einstein's photon hypothesis. His careful
            KE vs. frequency measurements produced a straight line with slope
            h = 6.57×10<sup>−34</sup> J·s — within 0.5% of the modern value.
            He won the 1923 Nobel Prize for proving the theory he had tried to refute.
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
// p5 lifecycle
// ─────────────────────────────────────────────────────────────────────────────
function setup() {
  const cont = document.getElementById('canvas-container');
  const cnv  = createCanvas(cont.clientWidth, cont.clientHeight);
  cnv.parent('canvas-container');
  textFont('Courier New');
  computeGeometry();
  updateEduPanel(mode);
}

function windowResized() {
  const cont = document.getElementById('canvas-container');
  resizeCanvas(cont.clientWidth, cont.clientHeight);
  computeGeometry();
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM read / write
// ─────────────────────────────────────────────────────────────────────────────
function readControls() {
  const sl = document.getElementById('lam-slider');
  if (sl) lambdaNm  = +sl.value;
  const si = document.getElementById('int-slider');
  if (si) intensity = +si.value / 100;

  document.getElementById('lam-val').textContent = lambdaNm;
  document.getElementById('int-val').textContent = Math.round(intensity * 100);

  // Color swatch
  const [sr, sg, sb] = lamToRGB(lambdaNm);
  const sw = document.getElementById('lam-swatch');
  if (sw) sw.style.background =
    `rgb(${Math.round(sr)},${Math.round(sg)},${Math.round(sb)})`;
}

function updateReadouts() {
  const ePhoto  = (HC_EV_NM / lambdaNm).toFixed(2);
  const tLam    = Math.round(threshLam);
  const keStr   = keMax > 0 ? keMax.toFixed(2) + ' eV' : '0 (below threshold)';

  const eEl = document.getElementById('ephoton-readout');
  const tEl = document.getElementById('thresh-readout');
  const kEl = document.getElementById('ke-readout');

  if (eEl) eEl.innerHTML = `E<sub>photon</sub> = ${ePhoto} eV`;
  if (tEl) tEl.innerHTML = `&lambda;<sub>thresh</sub> = ${tLam} nm`;
  if (kEl) kEl.innerHTML = `KE<sub>max</sub> = ${keStr}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main draw loop
// ─────────────────────────────────────────────────────────────────────────────
function draw() {
  background(17, 24, 32);
  readControls();
  updatePhysics();
  updateReadouts();

  // Ammeter decays each frame
  currentLevel *= 0.965;

  const dt = deltaTime / 1000;  // seconds

  drawApparatus(dt);
  drawPlots();
}

// ═════════════════════════════════════════════════════════════════════════════
// APPARATUS PANEL
// ═════════════════════════════════════════════════════════════════════════════
function drawApparatus(dt) {
  // Soft vertical divider
  stroke(30, 38, 50);
  strokeWeight(1);
  line(divX, 0, divX, height);

  // Panel label
  noStroke();
  fill(60, 72, 90);
  textSize(8);
  textAlign(RIGHT);
  text('Apparatus', divX - 8, height * 0.97);
  textAlign(LEFT);

  // Dispatch by mode
  if (mode === 'classical') {
    drawClassicalWave();
    updateClassicalAccum(dt);
    drawPlateWithGlowAndBar();
  } else {
    drawPlate();             // plain plate (no glow bar)
    spawnAndMovePhotons(dt);
  }

  updateAndDrawElectrons(dt);
  drawAbsorbs();
  drawSource();
  drawCollector();
  drawCircuit();
  drawAmmeter();
  drawApparatusLabels();
}

// ── Light source ──────────────────────────────────────────────────────────────
function drawSource() {
  const [lr, lg, lb] = lamToRGB(lambdaNm);
  const glowA = 30 + intensity * 70;

  noStroke();
  for (let r = 5; r >= 1; r--) {
    fill(lr, lg, lb, glowA * r / 5 * 0.35);
    ellipse(srcX, srcY, r * 24, r * 24);
  }
  fill(lr, lg, lb, 180 + intensity * 60);
  noStroke();
  ellipse(srcX, srcY, 16, 16);

  // Small rays
  stroke(lr, lg, lb, 100 + intensity * 80);
  strokeWeight(1);
  for (let a = 0; a < 360; a += 45) {
    if (a > 270 || a < 90) continue;  // only right-facing rays
    const rad = a * Math.PI / 180;
    line(srcX + Math.cos(rad) * 10, srcY + Math.sin(rad) * 10,
         srcX + Math.cos(rad) * 18, srcY + Math.sin(rad) * 18);
  }
}

// ── Metal plate (quantum mode — static) ───────────────────────────────────────
function drawPlate() {
  const [mr, mg, mb] = METALS[metalKey].rgb;
  const pw = 10;
  noStroke();
  fill(mr, mg, mb, 220);
  rect(plateX - pw / 2, plateY0, pw, plateY1 - plateY0, 2);
}

// ── Metal plate (classical mode — glow + accumulation fill) ──────────────────
function drawPlateWithGlowAndBar() {
  const [mr, mg, mb] = METALS[metalKey].rgb;
  const pw    = 10;
  const pH    = plateY1 - plateY0;
  const frac  = constrain(classAccum / phi, 0, 1);

  // Glow halo behind plate (orange, grows with accumulation)
  const glowA = frac * 70 * intensity;
  if (glowA > 1) {
    noStroke();
    for (let r = 6; r >= 1; r--) {
      fill(255, 100 + frac * 120, 20, glowA * r / 6 * 0.28);
      rect(plateX - pw / 2 - r * 6, plateY0 - r * 4,
           pw + r * 12, pH + r * 8, 4);
    }
  }

  // Base plate
  noStroke();
  fill(mr, mg, mb, 200);
  rect(plateX - pw / 2, plateY0, pw, pH, 2);

  // Energy fill — rises from bottom, orange→yellow as it approaches φ
  if (frac > 0.005) {
    const fillH = pH * frac;
    const fillR = lerp(100, 255, frac);
    const fillG = lerp(60,  180, frac * (1 - frac * 0.4));
    noStroke();
    fill(fillR, fillG, 20, 190);
    rect(plateX - pw / 2, plateY1 - fillH, pw, fillH, 0, 0, 2, 2);
  }

  // Percentage label below plate
  if (frac > 0.02) {
    noStroke();
    fill(255, 150, 50, 190);
    textSize(8);
    textAlign(CENTER);
    text(Math.round(frac * 100) + '%', plateX, plateY1 + 13);
    textAlign(LEFT);
  }
}

// ── Classical energy accumulation logic ───────────────────────────────────────
function updateClassicalAccum(dt) {
  if (intensity < 0.002) return;
  const chargeRate = phi / TAU_FULL;  // eV/sec at intensity = 1
  classAccum += chargeRate * intensity * dt;

  // Clamp and emit when full
  if (classAccum >= phi) {
    classAccum -= phi;
    spawnElectron(plateX, random(plateY0 + 20, plateY1 - 20), keClassical);
  }
}

// ── Classical wave animation ───────────────────────────────────────────────────
function drawClassicalWave() {
  const [lr, lg, lb] = lamToRGB(lambdaNm);
  // Number of visual cycles scales with frequency (shorter λ → more cycles)
  const nu_THz   = 299792 / lambdaNm;
  const nCycles  = map(nu_THz, 400, 2000, 2.5, 7.0);
  const wLen_px  = (plateX - srcX - 18) / nCycles;
  const amp      = map(intensity, 0, 1, 5, 22);
  const phase    = frameCount * 0.07;

  stroke(lr, lg, lb, 140 + intensity * 70);
  strokeWeight(1.5);
  noFill();
  beginShape();
  for (let x = srcX + 12; x <= plateX - 6; x += 2) {
    const f    = (x - srcX) / (plateX - srcX);
    const env  = Math.sin(f * Math.PI) * 0.7 + 0.3;
    const y    = srcY + Math.sin((x / wLen_px + phase) * TWO_PI) * amp * env;
    vertex(x, y);
  }
  endShape();
}

// ── Quantum photon particles ───────────────────────────────────────────────────
function spawnAndMovePhotons(dt) {
  // Spawn
  const interval = 1.0 / (PHOTON_RATE * Math.max(intensity, 0.01));
  photonTimer += dt;
  if (photonTimer >= interval && photons.length < MAX_PHOTONS) {
    photonTimer -= interval;
    photons.push({
      x:  srcX + 12,
      y:  srcY + random(-10, 10),
      vy: random(-0.3, 0.3) * (plateY1 - plateY0) * 0.08,
      active: true
    });
  }

  const vx = (plateX - srcX) / 0.75;  // crosses in ~0.75 s
  const [lr, lg, lb] = lamToRGB(lambdaNm);

  for (const p of photons) {
    if (!p.active) continue;
    p.x += vx * dt;
    p.y += p.vy * dt;

    // Trail + dot
    noStroke();
    fill(lr, lg, lb, 55);
    ellipse(p.x - 7, p.y, 5, 5);
    fill(lr, lg, lb, 210);
    ellipse(p.x, p.y, 6, 6);

    if (p.x >= plateX - 5) {
      p.active = false;
      handlePhotonHit(p.y);
    }
  }
  photons = photons.filter(p => p.active);
}

function handlePhotonHit(hitY) {
  if (keMax > 0) {
    spawnElectron(plateX, hitY, keMax);
  } else {
    // Absorbed: flash marker
    if (absorbs.length < MAX_ABSORBS) {
      absorbs.push({ x: plateX, y: hitY, alpha: 1 });
    }
  }
}

// ── Absorption flash (quantum, below threshold) ───────────────────────────────
function drawAbsorbs() {
  const [lr, lg, lb] = lamToRGB(lambdaNm);
  for (const a of absorbs) {
    noStroke();
    fill(lr, lg, lb, a.alpha * 170);
    ellipse(a.x, a.y, 11 * a.alpha, 11 * a.alpha);
    a.alpha -= 0.04;
  }
  absorbs = absorbs.filter(a => a.alpha > 0);
}

// ── Electron particles ─────────────────────────────────────────────────────────
function spawnElectron(x, y, ke) {
  if (electrons.length >= MAX_ELECTRONS) return;
  // Max possible KE: at λ=150nm with cesium
  const MAX_KE   = HC_EV_NM / 150 - 2.0;
  const speedFac = map(ke, 0, MAX_KE, 0.55, 1.45);
  const baseV    = (collX - plateX) * speedFac;
  electrons.push({
    x:      x + 5,
    y,
    vx:     baseV,
    vy:     random(-28, 28),
    ke,
    active: true
  });
}

function updateAndDrawElectrons(dt) {
  for (const e of electrons) {
    if (!e.active) continue;
    e.x += e.vx * dt;
    e.y += e.vy * dt;

    // Color: dim blue for low KE, bright blue-white for high KE
    const t  = constrain(e.ke / 4, 0, 1);
    const er = lerp(100, 215, t);
    const eg = lerp(140, 230, t);

    noStroke();
    fill(er, eg, 255, 55);
    ellipse(e.x - 5, e.y, 6, 6);
    fill(er, eg, 255, 220);
    ellipse(e.x, e.y, 5, 5);

    if (e.x >= collX - 3) {
      e.active = false;
      currentLevel = Math.min(1, currentLevel + 0.2);
    }
    if (e.y < plateY0 - 20 || e.y > plateY1 + 20) e.active = false;
  }
  electrons = electrons.filter(e => e.active);
}

// ── Collector plate ────────────────────────────────────────────────────────────
function drawCollector() {
  noStroke();
  fill(115, 130, 142, 200);
  rect(collX - 3, collY0, 6, collY1 - collY0, 2);
}

// ── Circuit wires ─────────────────────────────────────────────────────────────
function drawCircuit() {
  stroke(50, 62, 76);
  strokeWeight(1.5);
  line(plateX, plateY1, plateX, wireY);
  line(plateX, wireY, collX, wireY);
  line(collX, wireY, collX, collY1);
}

// ── Ammeter (simple bar gauge) ────────────────────────────────────────────────
function drawAmmeter() {
  const ammX = (plateX + collX) / 2;
  const ammY = wireY + 3;
  const ammH = 36;
  const ammW = 20;

  // Body
  stroke(50, 62, 76);
  strokeWeight(1);
  fill(20, 28, 40);
  ellipse(ammX, ammY + ammH / 2, ammW, ammH);

  // Fill
  if (currentLevel > 0.005) {
    noStroke();
    fill(45, 215, 135, 160 + currentLevel * 70);
    const bw = ammW * 0.5;
    const fh = (ammH * 0.75) * currentLevel;
    const by = ammY + ammH * 0.85 - fh;
    rect(ammX - bw / 2, by, bw, fh);
  }

  // "A" symbol
  noStroke();
  fill(90, 105, 120);
  textSize(7);
  textAlign(CENTER);
  text('A', ammX, ammY + ammH / 2 + 3);

  // Percentage
  fill(45, 215, 135, 180);
  textSize(7);
  text(Math.round(currentLevel * 100) + '%', ammX, ammY + ammH + 11);
  textAlign(LEFT);
}

// ── Apparatus labels ──────────────────────────────────────────────────────────
function drawApparatusLabels() {
  const [mr, mg, mb] = METALS[metalKey].rgb;
  noStroke();

  // Source label
  fill(80, 95, 112);
  textSize(8);
  textAlign(CENTER);
  text('light\nsource', srcX, srcY + 22);

  // Plate label
  fill(mr, mg, mb, 180);
  text(METALS[metalKey].label + ' plate', plateX, plateY0 - 17);
  fill(80, 95, 112);
  text('\u03c6 = ' + METALS[metalKey].phi + ' eV', plateX, plateY0 - 7);
  text('\u03bb\u209c = ' + Math.round(threshLam) + ' nm', plateX, plateY1 + 25);

  // Collector label
  fill(80, 95, 112);
  text('collector', collX, collY0 - 7);

  // Mode annotation at top of apparatus
  fill(60, 75, 92);
  textSize(9);
  textAlign(LEFT);
  if (mode === 'classical') {
    text('Classical: continuous wave', srcX, height * 0.11);
  } else {
    const aboveThresh = lambdaNm <= threshLam;
    fill(aboveThresh ? [88, 166, 255] : [200, 80, 80]);
    text(aboveThresh
      ? 'Quantum: \u03bb \u2264 \u03bb\u209c \u2192 electrons ejected'
      : 'Quantum: \u03bb > \u03bb\u209c \u2192 no emission',
      srcX, height * 0.11);
  }

  textAlign(LEFT);
}

// ═════════════════════════════════════════════════════════════════════════════
// PLOTS PANEL
// Both curves shown on every plot: active model = bright; inactive = dimmed.
// ═════════════════════════════════════════════════════════════════════════════
function drawPlots() {
  drawKEPlot();
  drawCurrentPlot();
}

// ── Helper: draw axes, labels, visible band; returns lamToX mapper ────────────
function plotAxes(x0, x1, y0, y1, title, xLabel, yLabel) {
  // Subtle background
  noStroke();
  fill(13, 18, 24, 110);
  rect(x0, y0, x1 - x0, y1 - y0, 3);

  // Axes
  stroke(42, 50, 62);
  strokeWeight(1);
  line(x0, y0, x0, y1);
  line(x0, y1, x1, y1);

  // Title
  noStroke();
  fill(80, 95, 112);
  textSize(9);
  textAlign(RIGHT);
  text(title, x1, y0 - 3);

  // X label
  textAlign(CENTER);
  text(xLabel, (x0 + x1) / 2, y1 + 20);

  // Y label (rotated)
  push();
  translate(x0 - 28, (y0 + y1) / 2);
  rotate(-HALF_PI);
  textAlign(CENTER);
  text(yLabel, 0, 0);
  pop();

  const lamToX = nm => map(nm, P_LAM_MIN, P_LAM_MAX, x0, x1);
  return lamToX;
}

// ── Helper: pixel-by-pixel visible spectrum band ──────────────────────────────
function drawVisibleBand(lamFn, y0, y1) {
  const vLo = 380, vHi = 700;
  for (let nm = Math.max(P_LAM_MIN, vLo); nm <= Math.min(P_LAM_MAX, vHi); nm++) {
    const [vr, vg, vb] = lamToRGB(nm);
    stroke(vr, vg, vb, 45);
    strokeWeight(1);
    line(lamFn(nm), y0, lamFn(nm), y1);
  }
}

// ── Helper: x-axis wavelength ticks ──────────────────────────────────────────
function drawLamTicks(lamFn, y1) {
  for (const nm of [200, 300, 400, 500, 600, 700]) {
    if (nm < P_LAM_MIN || nm > P_LAM_MAX) continue;
    const tx = lamFn(nm);
    stroke(42, 50, 62);
    strokeWeight(1);
    line(tx, y1, tx, y1 + 4);
    noStroke();
    fill(72, 86, 104);
    textSize(8);
    textAlign(CENTER);
    text(nm, tx, y1 + 13);
  }
}

// ── Helper: threshold vertical dashed line ────────────────────────────────────
function drawThresholdLine(lamFn, y0, y1, labelOffset) {
  if (threshLam < P_LAM_MIN || threshLam > P_LAM_MAX) return;
  const tx = lamFn(threshLam);
  drawingContext.setLineDash([4, 5]);
  stroke(170, 65, 255, 170);
  strokeWeight(1);
  line(tx, y0, tx, y1);
  drawingContext.setLineDash([]);
  noStroke();
  fill(170, 65, 255, 170);
  textSize(8);
  const rightSide = threshLam > (P_LAM_MIN + P_LAM_MAX) / 2;
  textAlign(rightSide ? RIGHT : LEFT);
  text('\u03bb\u209c=' + Math.round(threshLam) + 'nm',
    rightSide ? tx - 4 : tx + 4, y0 + labelOffset);
  textAlign(LEFT);
}

// ── Helper: current-wavelength marker (colored dashed line + dot) ─────────────
function drawLamMarker(lamFn, y0, y1, dotY) {
  const cx = lamFn(lambdaNm);
  const [lr, lg, lb] = lamToRGB(lambdaNm);
  drawingContext.setLineDash([3, 4]);
  stroke(lr, lg, lb, 160);
  strokeWeight(1.5);
  line(cx, y0, cx, y1);
  drawingContext.setLineDash([]);
  noStroke();
  fill(lr, lg, lb, 220);
  ellipse(cx, dotY, 7, 7);
}

// ─────────────────────────────────────────────────────────────────────────────
// Top plot: KE_max vs wavelength
//   Quantum : KE = max(0, hc/λ − φ)  — decreasing curve, zero below thresh
//   Classical: KE = intensity × φ × 0.75 — horizontal line (no λ dependence)
// ─────────────────────────────────────────────────────────────────────────────
function drawKEPlot() {
  const lamFn  = plotAxes(plotX0, plotX1, keY0, keY1,
    'KE\u2098\u2090\u2093 vs Wavelength', 'Wavelength (nm)', 'KE (eV)');

  const KE_MAX_AXIS = 7;
  const keToY = ke => map(ke, 0, KE_MAX_AXIS, keY1, keY0);

  drawVisibleBand(lamFn, keY0, keY1);

  // Y-axis ticks
  textAlign(RIGHT);
  for (let ev = 0; ev <= KE_MAX_AXIS; ev += 2) {
    const ty = keToY(ev);
    stroke(42, 50, 62); strokeWeight(1);
    line(plotX0 - 3, ty, plotX0, ty);
    noStroke(); fill(72, 86, 104); textSize(8);
    text(ev, plotX0 - 5, ty + 3);
  }

  drawLamTicks(lamFn, keY1);
  drawThresholdLine(lamFn, keY0, keY1, 10);

  const STEP = 3;
  const qAlpha = mode === 'quantum' ? 210 : 75;
  const cAlpha = mode === 'classical' ? 200 : 70;

  // ── Quantum KE curve ─────────────────────────────────────────────────────
  noStroke();
  fill(45, 215, 135, qAlpha * 0.13);
  beginShape();
  vertex(plotX0, keY1);
  for (let nm = P_LAM_MIN; nm <= P_LAM_MAX; nm += STEP) {
    vertex(lamFn(nm), keToY(Math.max(0, HC_EV_NM / nm - phi)));
  }
  vertex(plotX1, keY1);
  endShape(CLOSE);

  stroke(88, 166, 255, qAlpha);
  strokeWeight(mode === 'quantum' ? 2 : 1);
  noFill();
  beginShape();
  for (let nm = P_LAM_MIN; nm <= P_LAM_MAX; nm += STEP) {
    vertex(lamFn(nm), keToY(Math.max(0, HC_EV_NM / nm - phi)));
  }
  endShape();

  // Quantum legend
  stroke(88, 166, 255, qAlpha); strokeWeight(mode === 'quantum' ? 2 : 1); noFill();
  line(plotX0 + 4, keY0 + 10, plotX0 + 22, keY0 + 10);
  noStroke(); fill(88, 166, 255, qAlpha); textSize(8); textAlign(LEFT);
  text('KE = hc/\u03bb \u2212 \u03c6  (quantum)', plotX0 + 26, keY0 + 13);

  // ── Classical KE — horizontal line ───────────────────────────────────────
  const ky = keToY(keClassical);
  stroke(255, 150, 50, cAlpha);
  strokeWeight(mode === 'classical' ? 2 : 1);
  if (mode === 'quantum') drawingContext.setLineDash([6, 5]);
  line(plotX0 + 2, ky, plotX1 - 2, ky);
  drawingContext.setLineDash([]);

  noStroke(); fill(255, 150, 50, cAlpha); textSize(8); textAlign(LEFT);
  text('KE \u221d intensity  (classical, \u03bb-independent)', plotX0 + 5, ky - 4);

  // Classical legend
  stroke(255, 150, 50, cAlpha); strokeWeight(mode === 'classical' ? 2 : 1);
  if (mode === 'quantum') drawingContext.setLineDash([6, 5]);
  noFill(); line(plotX0 + 4, keY0 + 22, plotX0 + 22, keY0 + 22);
  drawingContext.setLineDash([]);
  noStroke(); fill(255, 150, 50, cAlpha); textSize(8);
  text('classical prediction', plotX0 + 26, keY0 + 25);

  // Current-λ markers: one dot per model at current wavelength
  const qDotY = keToY(constrain(keMax,       0, KE_MAX_AXIS));
  const cDotY = keToY(constrain(keClassical, 0, KE_MAX_AXIS));
  drawLamMarker(lamFn, keY0, keY1, mode === 'quantum' ? qDotY : cDotY);
  // Secondary dot for the other model (smaller)
  const cx = lamFn(lambdaNm);
  if (mode === 'quantum') {
    noStroke(); fill(255, 150, 50, 90); ellipse(cx, cDotY, 5, 5);
  } else {
    noStroke(); fill(88, 166, 255, 90); ellipse(cx, qDotY, 5, 5);
  }

  textAlign(LEFT);
}

// ─────────────────────────────────────────────────────────────────────────────
// Bottom plot: Photocurrent vs wavelength
//   Quantum : step function — 0 for λ > λ_thresh; ∝ intensity for λ ≤ λ_thresh
//   Classical: flat at intensity level (no threshold — any λ produces current)
// ─────────────────────────────────────────────────────────────────────────────
function drawCurrentPlot() {
  const lamFn = plotAxes(plotX0, plotX1, curY0, curY1,
    'Photocurrent vs Wavelength', 'Wavelength (nm)', 'Current (norm.)');

  const curToY = c => map(c, 0, 1, curY1, curY0);

  drawVisibleBand(lamFn, curY0, curY1);

  // Y-axis ticks
  textAlign(RIGHT);
  for (const cv of [0, 0.25, 0.5, 0.75, 1.0]) {
    const ty = curToY(cv);
    stroke(42, 50, 62); strokeWeight(1);
    line(plotX0 - 3, ty, plotX0, ty);
    noStroke(); fill(72, 86, 104); textSize(8);
    text(cv.toFixed(2), plotX0 - 5, ty + 3);
  }

  drawLamTicks(lamFn, curY1);
  drawThresholdLine(lamFn, curY0, curY1, 10);

  const STEP  = 3;
  const qAlpha = mode === 'quantum'   ? 210 : 75;
  const cAlpha = mode === 'classical' ? 200 : 70;

  // ── Quantum step function ─────────────────────────────────────────────────
  noStroke();
  fill(45, 215, 135, qAlpha * 0.13);
  beginShape();
  vertex(plotX0, curY1);
  for (let nm = P_LAM_MIN; nm <= P_LAM_MAX; nm += STEP) {
    const cur = nm <= threshLam ? intensity : 0;
    vertex(lamFn(nm), curToY(cur));
  }
  vertex(plotX1, curY1);
  endShape(CLOSE);

  stroke(88, 166, 255, qAlpha);
  strokeWeight(mode === 'quantum' ? 2 : 1);
  noFill();
  beginShape();
  for (let nm = P_LAM_MIN; nm <= P_LAM_MAX; nm += STEP) {
    vertex(lamFn(nm), curToY(nm <= threshLam ? intensity : 0));
  }
  endShape();

  // "no emission" annotation in the zero region
  if (threshLam < P_LAM_MAX - 60) {
    noStroke(); fill(72, 86, 104, qAlpha * 0.9); textSize(8); textAlign(CENTER);
    text('no emission', (lamFn(threshLam) + plotX1) / 2, (curY0 + curY1) / 2);
  }

  // Quantum legend
  stroke(88, 166, 255, qAlpha); strokeWeight(mode === 'quantum' ? 2 : 1); noFill();
  line(plotX0 + 4, curY0 + 10, plotX0 + 22, curY0 + 10);
  noStroke(); fill(88, 166, 255, qAlpha); textSize(8); textAlign(LEFT);
  text('quantum: step at \u03bb\u209c', plotX0 + 26, curY0 + 13);

  // ── Classical flat line ───────────────────────────────────────────────────
  const cy = curToY(intensity);
  stroke(255, 150, 50, cAlpha);
  strokeWeight(mode === 'classical' ? 2 : 1);
  if (mode === 'quantum') drawingContext.setLineDash([6, 5]);
  line(plotX0 + 2, cy, plotX1 - 2, cy);
  drawingContext.setLineDash([]);

  noStroke(); fill(255, 150, 50, cAlpha); textSize(8); textAlign(LEFT);
  text('classical: I \u221d intensity, no \u03bb\u209c', plotX0 + 5, cy - 4);

  // Classical legend
  stroke(255, 150, 50, cAlpha); strokeWeight(mode === 'classical' ? 2 : 1);
  if (mode === 'quantum') drawingContext.setLineDash([6, 5]);
  noFill(); line(plotX0 + 4, curY0 + 22, plotX0 + 22, curY0 + 22);
  drawingContext.setLineDash([]);
  noStroke(); fill(255, 150, 50, cAlpha); textSize(8);
  text('classical prediction', plotX0 + 26, curY0 + 25);

  // Current-λ markers
  const qCur = lambdaNm <= threshLam ? intensity : 0;
  const cCur = intensity;
  const qDotY = curToY(constrain(qCur, 0, 1));
  const cDotY = curToY(constrain(cCur, 0, 1));
  drawLamMarker(lamFn, curY0, curY1, mode === 'quantum' ? qDotY : cDotY);
  const cx = lamFn(lambdaNm);
  if (mode === 'quantum') {
    noStroke(); fill(255, 150, 50, 90); ellipse(cx, cDotY, 5, 5);
  } else {
    noStroke(); fill(88, 166, 255, 90); ellipse(cx, qDotY, 5, 5);
  }

  textAlign(LEFT);
}

// ═════════════════════════════════════════════════════════════════════════════
// UI CALLBACKS (called from HTML)
// ═════════════════════════════════════════════════════════════════════════════
function setMode(m) {
  mode = m;
  // Clear all particles and accumulation on mode switch
  photons      = [];
  electrons    = [];
  absorbs      = [];
  photonTimer  = 0;
  classAccum   = 0;
  currentLevel = 0;

  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('mode-btn-' + m);
  if (btn) btn.classList.add('active');

  updateEduPanel(m);
}

function setMetal(key) {
  metalKey     = key;
  classAccum   = 0;
  electrons    = [];
  absorbs      = [];

  document.querySelectorAll('.metal-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('metal-btn-' + key);
  if (btn) btn.classList.add('active');
}
