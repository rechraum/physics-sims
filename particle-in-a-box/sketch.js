// ─────────────────────────────────────────────────────────────────────────────
// Particle in a Box — sketch.js
//
// Two modes:
//   eigenstate    : show ψ_n(x) and/or |ψ_n|² for a single quantum number n
//   superposition : animate |ψ(x,t)|² for an equal superposition of n₁ and n₂
//
// Physics (infinite square well, normalized units: E₁ = 1, ħ = 1)
//   ψ_n(x) = sin(n·π·x/L)   (shape factor; max = 1)
//   E_n    = n²              (in units of E₁)
//
// Superposition (equal weights):
//   |ψ(x,t)|² = ½ψ_n1² + ½ψ_n2² + ψ_n1·ψ_n2·cos(ΔE·ω·t)
//   ΔE = n₂² − n₁²  →  probability density oscillates at this beat frequency
//
// Color language (matches wave-interference quantum palette):
//   ψ > 0 lobe : accent blue  (88, 166, 255)   ← same as Wave A
//   ψ < 0 lobe : purple       (170, 65, 255)    ← same as constructive−
//   |ψ|²       : teal         (45, 215, 135)    ← same as constructive+
//   n₁ curves  : faded blue   (88, 166, 255)
//   n₂ curves  : faded orange (255, 150, 50)    ← same as Wave B
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Edu panel content — HTML strings written into #sim-edu on mode change.
// nav.js skips #sim-edu because the HTML pre-populates it with a placeholder.
// ─────────────────────────────────────────────────────────────────────────────
const EDU = {

  eigenstate: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Eigenstate</p>
        <p class="edu-description">
          A particle confined between two infinitely high walls can only exist in states
          with specific, quantized energies E<sub>n</sub>&nbsp;=&nbsp;n²E<sub>1</sub>.
          These <em>eigenstates</em> are the fundamental standing waves of the system —
          the quantum equivalent of a guitar string's harmonics.
        </p>
        <p class="edu-description">
          Each eigenstate ψ<sub>n</sub>(x) fits exactly <em>n</em> half-wavelengths
          inside the box and has <em>n</em>&minus;1 interior <strong>nodes</strong> —
          points where ψ&nbsp;=&nbsp;0 and the particle is never found.
          The wavefunction's sign (blue&nbsp;vs.&nbsp;purple) has no direct observable
          meaning; only |ψ|² is physical — the probability density of locating the
          particle at position x.
        </p>
        <div class="edu-concepts">
          <span class="edu-concept-tag">energy quantization</span>
          <span class="edu-concept-tag">wave function</span>
          <span class="edu-concept-tag">probability density</span>
          <span class="edu-concept-tag">nodes</span>
          <span class="edu-concept-tag">infinite square well</span>
        </div>
      </div>
    </div>
  `,

  superposition: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Superposition</p>
        <p class="edu-description">
          A superposition of two eigenstates is not a stationary state — its probability
          density <strong>oscillates in time</strong> at a beat frequency set by the
          energy difference between the two levels:
        </p>
        <div class="equation">
          |ψ(x,t)|² = ½ψ<sub>1</sub>² + ½ψ<sub>2</sub>² + ψ<sub>1</sub>ψ<sub>2</sub>&thinsp;cos(ΔE·t/ħ)
        </div>
        <p class="edu-description">
          The cross-term beats at frequency ΔE/ħ — identical in structure to acoustic
          beats when two notes of slightly different pitch are played together.
          A larger energy gap means a faster oscillation.
        </p>
        <div class="edu-concepts">
          <span class="edu-concept-tag">quantum beating</span>
          <span class="edu-concept-tag">time evolution</span>
          <span class="edu-concept-tag">ΔE/ħ</span>
          <span class="edu-concept-tag">maser</span>
          <span class="edu-concept-tag">NMR / MRI</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Real-world examples</p>
          <p>
            <strong>Ammonia maser (1953):</strong> The NH₃ molecule has two mirror-image
            configurations — nitrogen above or below the plane of its three hydrogens.
            The true energy eigenstates are their symmetric and antisymmetric combinations,
            so a freshly prepared molecule is always in a superposition. The energy
            splitting ΔE&nbsp;≈&nbsp;10<sup>−5</sup>&thinsp;eV drives the nitrogen atom
            to invert ~23.8&nbsp;billion times per second. Gordon, Zeiger, and Townes
            amplified this oscillation to build the world's first maser.
          </p>
          <p>
            <strong>NMR / MRI:</strong> A proton in a magnetic field has spin-up and
            spin-down energy eigenstates. A radio-frequency pulse tips the spin into a
            superposition, which then precesses at the Larmor frequency ω&nbsp;=&nbsp;ΔE/ħ —
            the exact same formula as above, in a two-level system instead of a box.
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

// ── State ─────────────────────────────────────────────────────────────────────
let mode   = 'eigenstate';
let t      = 0;       // animation time (seconds)
let paused = false;

// ── Parameters (read from DOM each frame) ─────────────────────────────────────
let nState    = 1;
let n1        = 1, n2 = 2;
let animSpeed = 1.0;
let showPsi   = true;
let showPsi2  = true;
let showLevels = true;

// ── Physics constants ─────────────────────────────────────────────────────────
// Base angular frequency: at speed×1 the n₁=1, n₂=2 beating period ≈ 2.1 s
const OMEGA_BASE = Math.PI / 2;  // rad/s  (T₁ = 4 s at speed×1)
const N_MAX      = 6;
const STEP       = 2;            // px sampling interval for curves

// ── Canvas geometry (set in setup / windowResized) ────────────────────────────
let boxX0, boxX1, boxW, boxCy, boxTopY, boxBotY;
let lvlX0, lvlX1, lvlY0, lvlY1;

function computeGeometry() {
  boxX0   = width  * 0.08;
  boxX1   = width  * 0.62;
  boxW    = boxX1 - boxX0;
  boxCy   = height * 0.50;
  boxTopY = height * 0.15;
  boxBotY = height * 0.85;

  lvlX0 = width  * 0.73;
  lvlX1 = width  * 0.97;
  lvlY0 = height * 0.11;
  lvlY1 = height * 0.89;
}

// Visual amplitude scale for ψ curves (in canvas pixels)
function psiScale() { return height * 0.175; }

// ── Cached colors ─────────────────────────────────────────────────────────────
let cWall, cAxis, cFloor, cLevelDim, cLevelAcc;

// ─────────────────────────────────────────────────────────────────────────────
// p5 lifecycle
// ─────────────────────────────────────────────────────────────────────────────
function setup() {
  const cont = document.getElementById('canvas-container');
  const cnv  = createCanvas(cont.clientWidth, cont.clientHeight);
  cnv.parent('canvas-container');
  computeGeometry();
  textFont('Courier New');

  cWall     = color(190, 210, 235, 200);
  cAxis     = color(48,   54,  61);
  cFloor    = color(48,   60,  80, 80);
  cLevelDim = color(52,   64,  82);
  cLevelAcc = color(88,  166, 255);

  updateEduPanel('eigenstate');
}

function windowResized() {
  const cont = document.getElementById('canvas-container');
  resizeCanvas(cont.clientWidth, cont.clientHeight);
  computeGeometry();
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM helpers
// ─────────────────────────────────────────────────────────────────────────────
function readControls() {
  nState    = +document.getElementById('n-state').value;
  n1        = +document.getElementById('n1').value;
  n2        = +document.getElementById('n2').value;
  animSpeed = +document.getElementById('speed').value;
  showPsi    = document.getElementById('show-psi').checked;
  showPsi2   = document.getElementById('show-psi2').checked;
  showLevels = document.getElementById('show-levels').checked;

  document.getElementById('n-state-val').textContent = nState;
  document.getElementById('n1-val').textContent      = n1;
  document.getElementById('n2-val').textContent      = n2;
  document.getElementById('speed-val').textContent   = animSpeed.toFixed(1) + '\u00D7';

  const info = document.getElementById('energy-display');
  if (mode === 'eigenstate') {
    info.innerHTML = `E = ${nState * nState} E&#x2081; &nbsp;(n = ${nState})`;
  } else {
    const dE = Math.abs(n2 * n2 - n1 * n1);
    info.innerHTML = dE === 0
      ? '\u0394E = 0 &nbsp;(same state)'
      : `\u0394E = ${dE} E&#x2081; &nbsp;\u2192 beats at ${dE}\u03C9&#x2080;`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Physics
// ─────────────────────────────────────────────────────────────────────────────
// Shape factor: sin(n·π·f) where f ∈ [0,1] is fractional position in the well
function psiN(n, f) { return Math.sin(n * Math.PI * f); }

// Energy in units of E₁
function En(n) { return n * n; }

// ─────────────────────────────────────────────────────────────────────────────
// Drawing: infinite square well walls
// ─────────────────────────────────────────────────────────────────────────────
function drawBox() {
  // Zero-line (ψ = 0 axis inside well)
  stroke(cAxis);
  strokeWeight(1);
  line(boxX0, boxCy, boxX1, boxCy);

  // Floor of well (visual bottom boundary)
  stroke(cFloor);
  strokeWeight(1);
  line(boxX0, boxBotY, boxX1, boxBotY);

  // Walls
  stroke(cWall);
  strokeWeight(3);
  line(boxX0, boxTopY, boxX0, boxBotY);
  line(boxX1, boxTopY, boxX1, boxBotY);

  // Hatching outside walls (convention for infinite potential)
  drawWallHatch(boxX0, -1);
  drawWallHatch(boxX1, +1);

  // Position labels
  noStroke();
  fill(95, 108, 126);
  textSize(10);
  textAlign(CENTER);
  text('x = 0', boxX0, boxBotY + 18);
  text('x = L', boxX1, boxBotY + 18);
  textAlign(LEFT);
}

function drawWallHatch(wallX, dir) {
  const hatchLen = 13;
  const step     = 9;
  stroke(red(cWall), green(cWall), blue(cWall), 85);
  strokeWeight(1);
  for (let y = boxTopY; y <= boxBotY + step; y += step) {
    line(wallX, y, wallX + dir * hatchLen, y - hatchLen * 0.65);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing: ψ_n(x) with sign coloring
//   positive lobe → accent blue  (88, 166, 255)
//   negative lobe → purple       (170, 65, 255)
// alpha controls opacity (220 = full, 100 = faded background)
// ─────────────────────────────────────────────────────────────────────────────
function drawPsiSigned(n, alpha) {
  const sc = psiScale();
  strokeWeight(2.5);
  noFill();
  let prevVal = psiN(n, 0) * sc;

  for (let px = STEP; px <= boxW; px += STEP) {
    const f   = px / boxW;
    const val = psiN(n, f) * sc;
    const mid = (prevVal + val) * 0.5;  // sign sampled at segment midpoint
    stroke(mid >= 0 ? color(88, 166, 255, alpha) : color(170, 65, 255, alpha));
    line(boxX0 + px - STEP, boxCy - prevVal, boxX0 + px, boxCy - val);
    prevVal = val;
  }
}

// Flat-color ψ curve (for superposition background components)
function drawPsiFlat(n, r, g, b, alpha) {
  const sc = psiScale();
  stroke(r, g, b, alpha);
  strokeWeight(1.5);
  noFill();
  beginShape();
  for (let px = 0; px <= boxW; px += STEP) {
    vertex(boxX0 + px, boxCy - psiN(n, px / boxW) * sc);
  }
  endShape();
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing: |ψ_n|² probability density (teal fill + stroke)
// ─────────────────────────────────────────────────────────────────────────────
function drawPsi2(n) {
  const sc = psiScale();

  noStroke();
  fill(45, 215, 135, 38);
  beginShape();
  vertex(boxX0, boxCy);
  for (let px = 0; px <= boxW; px += STEP) {
    const v = psiN(n, px / boxW);
    vertex(boxX0 + px, boxCy - v * v * sc);
  }
  vertex(boxX1, boxCy);
  endShape();

  stroke(45, 215, 135, 200);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let px = 0; px <= boxW; px += STEP) {
    const v = psiN(n, px / boxW);
    vertex(boxX0 + px, boxCy - v * v * sc);
  }
  endShape();
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing: animated |ψ(x,t)|² for equal superposition of n₁ and n₂
//
//   |ψ|² = ½ψ_n1² + ½ψ_n2² + ψ_n1·ψ_n2·cos(ΔE·ω·t)
//
// When n₁ = n₂ this reduces to ψ_n1² (static eigenstate — expected).
// ─────────────────────────────────────────────────────────────────────────────
function drawSuperPsi2(curT) {
  const sc  = psiScale();
  const phi = (En(n2) - En(n1)) * OMEGA_BASE * animSpeed * curT;

  noStroke();
  fill(45, 215, 135, 38);
  beginShape();
  vertex(boxX0, boxCy);
  for (let px = 0; px <= boxW; px += STEP) {
    const f   = px / boxW;
    const p1  = psiN(n1, f), p2 = psiN(n2, f);
    const rho = Math.max(0, 0.5 * p1 * p1 + 0.5 * p2 * p2 + p1 * p2 * Math.cos(phi));
    vertex(boxX0 + px, boxCy - rho * sc);
  }
  vertex(boxX1, boxCy);
  endShape();

  stroke(45, 215, 135, 210);
  strokeWeight(2.5);
  noFill();
  beginShape();
  for (let px = 0; px <= boxW; px += STEP) {
    const f   = px / boxW;
    const p1  = psiN(n1, f), p2 = psiN(n2, f);
    const rho = Math.max(0, 0.5 * p1 * p1 + 0.5 * p2 * p2 + p1 * p2 * Math.cos(phi));
    vertex(boxX0 + px, boxCy - rho * sc);
  }
  endShape();
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing: energy level diagram (right portion of canvas)
// ─────────────────────────────────────────────────────────────────────────────
function drawEnergyLevels() {
  if (!showLevels) return;

  const Emax = En(N_MAX) + 4;          // headroom above n=6
  const eToY = E => map(E, 0, Emax, lvlY1, lvlY0);

  const midX  = (lvlX0 + lvlX1) * 0.5;
  const wellW = (lvlX1 - lvlX0) * 0.50;
  const lx0   = midX - wellW * 0.5;
  const lx1   = midX + wellW * 0.5;

  // Background outline
  noFill();
  stroke(36, 48, 64);
  strokeWeight(1);
  rect(lvlX0, lvlY0, lvlX1 - lvlX0, lvlY1 - lvlY0, 3);

  // Well wall silhouettes inside diagram
  stroke(50, 66, 88);
  strokeWeight(1);
  line(lx0, lvlY0 + 5, lx0, lvlY1 - 5);
  line(lx1, lvlY0 + 5, lx1, lvlY1 - 5);

  // Diagram title
  noStroke();
  fill(88, 100, 120);
  textSize(9);
  textAlign(CENTER);
  text('Energy', (lvlX0 + lvlX1) * 0.5, lvlY0 - 5);

  // Energy levels
  for (let n = 1; n <= N_MAX; n++) {
    const y  = eToY(En(n));
    let col, lw;

    if (mode === 'eigenstate' && n === nState) {
      col = color(88, 166, 255);  lw = 2.5;
    } else if (mode === 'superposition' && n === n1) {
      col = color(88, 166, 255);  lw = 2.5;
    } else if (mode === 'superposition' && n === n2) {
      col = color(255, 150, 50);  lw = 2.5;
    } else {
      col = cLevelDim;  lw = 1;
    }

    stroke(col);
    strokeWeight(lw);
    line(lx0 + 3, y, lx1 - 3, y);

    noStroke();
    fill(lw > 1 ? col : color(65, 80, 100));
    textSize(9);
    textAlign(LEFT);
    text('n=' + n, lvlX0 + 4, y - 2);
    textAlign(RIGHT);
    text(En(n) + 'E\u2081', lvlX1 - 3, y - 2);
  }

  // ΔE bracket in superposition mode when n₁ ≠ n₂
  if (mode === 'superposition' && n1 !== n2) {
    const y1  = eToY(En(n1));
    const y2  = eToY(En(n2));
    const bx  = lx1 + 8;

    drawingContext.setLineDash([3, 4]);
    stroke(170, 65, 255, 140);
    strokeWeight(1);
    line(bx, y1, bx, y2);
    drawingContext.setLineDash([]);

    // Tick marks
    stroke(170, 65, 255, 170);
    strokeWeight(1.5);
    const d1 = y2 < y1 ? -5 : 5;
    line(bx - 3, y1 + d1, bx, y1);
    line(bx + 3, y1 + d1, bx, y1);
    const d2 = y2 < y1 ? 5 : -5;
    line(bx - 3, y2 + d2, bx, y2);
    line(bx + 3, y2 + d2, bx, y2);

    // ΔE label
    noStroke();
    fill(170, 65, 255, 180);
    textSize(8);
    textAlign(LEFT);
    text('\u0394E=' + Math.abs(En(n2) - En(n1)), bx + 4, (y1 + y2) * 0.5 + 3);
  }

  textAlign(LEFT);
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing: canvas labels and legend
// ─────────────────────────────────────────────────────────────────────────────
function drawLabels() {
  noStroke();
  textAlign(LEFT);

  const lx  = boxX0 + 8;
  const ly0 = boxTopY + 14;
  let   ly  = ly0;

  if (mode === 'eigenstate') {
    // Title above well
    fill(135, 145, 160);
    textSize(10);
    textAlign(CENTER);
    text('n = ' + nState + '   E = ' + En(nState) + ' E\u2081',
         (boxX0 + boxX1) * 0.5, boxTopY - 8);

    // Legend
    textSize(9);
    textAlign(LEFT);
    if (showPsi) {
      fill(88, 166, 255);  text('\u2014\u2014 \u03C8(x) > 0', lx, ly);  ly += 14;
      fill(170, 65, 255);  text('\u2014\u2014 \u03C8(x) < 0', lx, ly);  ly += 14;
    }
    if (showPsi2) {
      fill(45, 215, 135);  text('\u2014\u2014 |\u03C8|\u00B2',  lx, ly);
    }
  } else {
    // Superposition title
    const dE = Math.abs(En(n2) - En(n1));
    fill(135, 145, 160);
    textSize(10);
    textAlign(CENTER);
    text('n\u2081=' + n1 + '  \u2295  n\u2082=' + n2 +
         '   \u0394E = ' + dE + ' E\u2081',
         (boxX0 + boxX1) * 0.5, boxTopY - 8);

    textSize(9);
    textAlign(LEFT);
    if (showPsi) {
      fill(88,  166, 255, 160);  text('\u2014\u2014 \u03C8' + n1 + '(x)', lx, ly);  ly += 14;
      fill(255, 150,  50, 160);  text('\u2014\u2014 \u03C8' + n2 + '(x)', lx, ly);  ly += 14;
    }
    fill(45, 215, 135);
    text('\u2014\u2014 |\u03C8(t)|\u00B2  (oscillating)', lx, ly);

    // Paused indicator
    if (paused) {
      fill(200, 100, 50);
      textAlign(CENTER);
      textSize(10);
      text('PAUSED', (boxX0 + boxX1) * 0.5, boxTopY + 28);
    }
  }

  textAlign(LEFT);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main draw loop
// ─────────────────────────────────────────────────────────────────────────────
function draw() {
  background(17, 24, 32);
  readControls();

  if (mode === 'superposition' && !paused) {
    t += deltaTime / 1000;
  }

  drawBox();

  if (mode === 'eigenstate') {
    if (showPsi)    drawPsiSigned(nState, 220);
    if (showPsi2)   drawPsi2(nState);
    drawEnergyLevels();

  } else {
    // Superposition: faded component curves behind animated |ψ(t)|²
    if (showPsi) {
      drawPsiFlat(n1, 88, 166, 255, 95);
      drawPsiFlat(n2, 255, 150, 50, 95);
    }
    if (showPsi2) drawSuperPsi2(t);
    drawEnergyLevels();
  }

  drawLabels();
}

// ─────────────────────────────────────────────────────────────────────────────
// Mode switching (called from HTML)
// ─────────────────────────────────────────────────────────────────────────────
function setMode(m) {
  mode   = m;
  t      = 0;
  paused = false;

  document.getElementById('eigenstate-controls').style.display =
    m === 'eigenstate' ? 'block' : 'none';
  document.getElementById('superposition-controls').style.display =
    m === 'superposition' ? 'block' : 'none';

  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('mode-btn-' + m);
  if (btn) btn.classList.add('active');

  updateEduPanel(m);

  const pauseBtn = document.getElementById('pause-btn');
  if (pauseBtn) pauseBtn.textContent = '\u23F8 Pause';
}

function togglePause() {
  paused = !paused;
  const btn = document.getElementById('pause-btn');
  if (btn) btn.textContent = paused ? '\u25B6 Resume' : '\u23F8 Pause';
}
