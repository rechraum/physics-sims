// ─────────────────────────────────────────────────────────────────────────────
// Entropy & Microstates — sketch.js
//
// Physics (k = 1 throughout):
//   W = N! / (n₁! · n₂! · … · nₘ!)   multinomial coefficient
//   S = ln W  (displayed in units of k)
//   S_eq = N ln M   (equilibrium, ideal uniform distribution)
//   Step: pick random particle, move to random cell
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

// ── Color palette ──────────────────────────────────────────────────────────────
const PARTICLE_COLORS = [
  [88, 166, 255], [45, 215, 135], [255, 150, 50],  [170, 65, 255],
  [255, 80, 100], [0,  210, 210], [255, 220, 60],  [150, 255, 100],
];

// ── Edu content ────────────────────────────────────────────────────────────────
const EDU = {

  boltzmann: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">S = k ln W</p>
        <p class="edu-description">
          Ludwig Boltzmann (1877) gave entropy a microscopic definition: it is proportional to
          the logarithm of the number of ways a macroscopic state can be arranged at the atomic
          level. A <strong>macrostate</strong> is defined by what you can measure (here: how many
          particles are in each region). A <strong>microstate</strong> is the exact position of
          every particle. W is the count of microstates compatible with the macrostate.
          The logarithm is crucial: it converts multiplication of independent systems into
          addition of their entropies. S(A+B)&nbsp;=&nbsp;S(A)&nbsp;+&nbsp;S(B) requires S&nbsp;&prop;&nbsp;ln&thinsp;W.
        </p>
        <div class="equation">S = k ln W &nbsp;&nbsp; k = 1.38 &times; 10<sup>&minus;23</sup> J/K</div>
        <div class="param-hint param-hint-teal">
          N&thinsp;=&thinsp;20, M&thinsp;=&thinsp;16, all particles in corner (W&thinsp;=&thinsp;1, S&thinsp;=&thinsp;0).
          Watch W and S grow as particles disperse. S<sub>eq</sub>&thinsp;=&thinsp;N ln M&thinsp;&asymp;&thinsp;55.5k.
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">Boltzmann entropy</span>
          <span class="edu-concept-tag">microstates</span>
          <span class="edu-concept-tag">macrostates</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Boltzmann&rsquo;s gravestone</p>
          <p>
            Boltzmann&rsquo;s formula S&thinsp;=&thinsp;k&thinsp;ln&thinsp;W is carved on his gravestone
            in Vienna. He fought for atomism &mdash; the idea that matter is made of discrete
            particles &mdash; his entire career. The concept was controversial; many physicists
            believed atoms were mathematical fictions. Boltzmann died in 1906, before atomic
            theory was fully accepted.
          </p>
        </div>
      </div>
    </div>
  `,

  arrowtime: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">The Arrow of Time is Just Counting</p>
        <p class="edu-description">
          Why does time have a direction? Why does a drop of ink spread but never spontaneously
          reconcentrate? The second law says entropy increases &mdash; but that law is statistical,
          not fundamental. The microscopic equations of physics are time-reversible. A video of
          particles colliding played backward is equally valid physics. Yet you never see gases unmix.
          The reason: the unmixed state has W&thinsp;=&thinsp;1 (all in one corner). The mixed state
          has W&nbsp;&asymp;&nbsp;M<sup>N</sup>. With N&thinsp;=&thinsp;20 and M&thinsp;=&thinsp;16,
          that ratio is 10<sup>24</sup>. The system is not <em>prevented</em> from returning; it
          simply never randomly finds its way to the 1&#8209;in&#8209;10<sup>24</sup> microstate.
        </p>
        <div class="equation">
          P(return to corner) = 1/M<sup>N</sup> &nbsp;&rarr;&nbsp;
          expected wait &asymp; M<sup>N</sup> / &nu;
        </div>
        <div class="param-hint param-hint-teal">
          N&thinsp;=&thinsp;20, M&thinsp;=&thinsp;16, corner start.
          P(return) = 1/16<sup>20</sup> &asymp; 10<sup>&minus;24</sup>.
          Expected wait &asymp; 10<sup>5</sup> &times; age of the universe.
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">arrow of time</span>
          <span class="edu-concept-tag">irreversibility</span>
          <span class="edu-concept-tag">second law</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Time-reversal symmetry</p>
          <p>
            If you watched this simulation run for the age of the universe, you would still
            expect to wait ~10<sup>5</sup> more universe&#8209;lifetimes to see all 20 particles
            spontaneously return to one corner. The arrow of time is the statistics of very
            large numbers.
          </p>
        </div>
      </div>
    </div>
  `,

  equilibrium: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Equilibrium as Maximum Entropy</p>
        <p class="edu-description">
          A system at equilibrium is not &ldquo;at rest&rdquo; &mdash; it constantly changes
          microstate. What makes equilibrium special is that almost all microstates look similar:
          roughly equal occupancy. The system visits all compatible microstates with equal
          probability (the <strong>ergodic hypothesis</strong>). Because there are so many more
          even&#8209;distribution microstates than uneven ones, the system almost always looks
          equilibrated. At equilibrium, S is maximised. Releasing a constraint &mdash; e.g.,
          expanding the box &mdash; lets W grow and S increases. This is the origin of spontaneous
          expansion when a gas fills a vacuum.
        </p>
        <div class="equation">
          S<sub>eq</sub> = kN ln M &nbsp;&nbsp;&nbsp;
          &Delta;S = Nk ln(V<sub>f</sub>/V<sub>i</sub>)
        </div>
        <div class="param-hint param-hint-teal">
          N&thinsp;=&thinsp;20, M&thinsp;=&thinsp;16, corner start. S climbs to S<sub>eq</sub>&thinsp;=&thinsp;N&thinsp;ln&thinsp;M.
          Click <strong>Expand</strong> to watch S<sub>eq</sub> jump when M doubles
          (&Delta;S&thinsp;=&thinsp;Nk&thinsp;ln&thinsp;2).
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">equilibrium</span>
          <span class="edu-concept-tag">ergodic hypothesis</span>
          <span class="edu-concept-tag">maximum entropy</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Statistical mechanics</p>
          <p>
            Boltzmann, Gibbs, and Maxwell showed that macroscopic laws like PV&thinsp;=&thinsp;NkT
            and the Carnot efficiency &eta;&thinsp;=&thinsp;1&thinsp;&minus;&thinsp;T<sub>C</sub>/T<sub>H</sub>
            are derived consequences of counting microstates &mdash; not separate axioms.
            Thermodynamics emerges from statistics.
          </p>
        </div>
      </div>
    </div>
  `,
};

function updateEduPanel(m) {
  const el = document.getElementById('sim-edu');
  if (el && EDU[m]) el.innerHTML = EDU[m];
}

// ── Log-factorial table (exact up to 70, Stirling beyond) ─────────────────────
const LOG_FACT = [0, 0];
for (let i = 2; i <= 70; i++) LOG_FACT.push(LOG_FACT[i - 1] + Math.log(i));

function logFactorial(n) {
  if (n <= 1) return 0;
  if (n <= 70) return LOG_FACT[n];
  return n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n);
}

function computeLogW() {
  const total = counts.reduce((a, b) => a + b, 0);
  let lw = logFactorial(total);
  for (const ni of counts) lw -= logFactorial(ni);
  return Math.max(0, lw);
}

// ── Simulation state ───────────────────────────────────────────────────────────
let N        = 20;
let M        = 16;
let speed    = 15;
let paused   = false;
let eduMode  = 'boltzmann';
let prevN    = 20;

let counts    = [];    // counts[i] = particles in cell i
let particles = [];    // {cell, rx, ry, colorIdx}  rx,ry in [0,1] within cell

const MAX_HISTORY = 300;
let S_history    = [];
let logW_history = [];
let expandEvents = [];   // {totalStep, label}
let totalSteps   = 0;
let stepAccum    = 0;

let currentLogW = 0;
let S_eq        = N * Math.log(M);

// Flash effect for new cells after Expand
const FLASH_MAX = 50;
let flashTimer = 0;
let flashCells = [];

// S_eq / W_eq reference line flash on Expand / Compress
const SEQ_FLASH_MAX = 40;
let seqFlashTimer   = 0;

// Elapsed simulation time and per-step history
let totalTime    = 0;
let time_history = [];

// ── Geometry ───────────────────────────────────────────────────────────────────
let g = {};

function computeGeometry() {
  const cW = width, cH = height;
  const divX = Math.floor(cW * 0.50);

  // Grid panel (left half)
  const TITLE_H    = 22;
  const READOUT_H  = 52;
  const gPad = { L: 16, R: 14, T: 4, B: 8 };

  g.gridX0     = gPad.L;
  g.gridY0     = TITLE_H + gPad.T;
  g.gridX1     = divX - gPad.R;
  g.gridY1     = cH - READOUT_H - gPad.B;
  g.gridW      = g.gridX1 - g.gridX0;
  g.gridH      = g.gridY1 - g.gridY0;
  g.titleMidX  = (gPad.L + divX - gPad.R) / 2;
  g.titleY     = TITLE_H - 4;
  g.readoutY   = cH - READOUT_H + 10;

  // Plot panel (right half), split ~52% / 48%
  const pL = 48, pR = 12, pT = 16, pB = 24;  // pB includes space for time-axis labels
  const midY = Math.floor(cH * 0.52);
  const gap  = 14;

  g.pS = { x0: divX + pL, y0: pT,        x1: cW - pR, y1: midY - gap };
  g.pW = { x0: divX + pL, y0: midY + gap, x1: cW - pR, y1: cH  - pB  };

  g.divX = divX;
}

// ── Grid helpers ───────────────────────────────────────────────────────────────
function gridShape(m) {
  if (m ===  4) return { rows: 2, cols: 2 };
  if (m ===  8) return { rows: 2, cols: 4 };
  if (m === 16) return { rows: 4, cols: 4 };
  if (m === 32) return { rows: 4, cols: 8 };
  return { rows: 4, cols: 4 };
}

function getParticleRadius() {
  const { rows, cols } = gridShape(M);
  const cw = g.gridW / cols;
  const ch = g.gridH / rows;
  return Math.max(3, Math.min(5, Math.min(cw, ch) * 0.065));
}

// ── Grid init ──────────────────────────────────────────────────────────────────
function initGrid(mode) {
  counts    = new Array(M).fill(0);
  particles = [];
  for (let i = 0; i < N; i++) {
    const cell = (mode === 'corner') ? 0 : Math.floor(Math.random() * M);
    counts[cell]++;
    particles.push({ cell, rx: Math.random(), ry: Math.random(), colorIdx: i % 8 });
  }
  currentLogW = computeLogW();
  S_eq        = N * Math.log(M);
  S_history    = [currentLogW];
  logW_history = [currentLogW / Math.LN10];
  expandEvents = [];
  totalSteps   = 0;
  stepAccum    = 0;
  totalTime    = 0;
  time_history = [0];
}

// ── Simulation step ────────────────────────────────────────────────────────────
function doStep() {
  const pi      = Math.floor(Math.random() * N);
  const oldCell = particles[pi].cell;
  const newCell = Math.floor(Math.random() * M);
  if (oldCell !== newCell) {
    counts[oldCell]--;
    counts[newCell]++;
    particles[pi].cell = newCell;
    particles[pi].rx   = Math.random();
    particles[pi].ry   = Math.random();
  }
  currentLogW = computeLogW();
  totalSteps++;

  S_history.push(currentLogW);
  logW_history.push(currentLogW / Math.LN10);
  totalTime += 1 / Math.max(speed, 1);
  time_history.push(totalTime);
  if (S_history.length > MAX_HISTORY) {
    S_history.shift();
    logW_history.shift();
    time_history.shift();
  }

  // Drop events that have scrolled off the history window
  expandEvents = expandEvents.filter(ev => totalSteps - ev.totalStep < MAX_HISTORY);
}

// ── Expand / Compress ──────────────────────────────────────────────────────────
function doExpand() {
  if (M >= 32) return;
  const oldM = M;
  M     = M * 2;
  S_eq  = N * Math.log(M);
  counts = [...counts, ...new Array(oldM).fill(0)];

  flashCells = Array.from({ length: oldM }, (_, i) => i + oldM);
  flashTimer = FLASH_MAX;

  seqFlashTimer = SEQ_FLASH_MAX;
  expandEvents.push({ totalStep: totalSteps, label: 'Expand' });

  const sel = document.getElementById('ctrl-m');
  if (sel) sel.value = M;
  syncExpandButtons();
}

function doCompress() {
  if (M <= 4) return;
  const oldM = M;
  M    = M / 2;
  S_eq = N * Math.log(M);

  const newCounts = counts.slice(0, M);
  for (let i = M; i < oldM; i++) {
    let rem = counts[i];
    while (rem > 0) {
      newCounts[Math.floor(Math.random() * M)]++;
      rem--;
    }
  }
  counts = newCounts;

  for (const p of particles) {
    if (p.cell >= M) {
      p.cell = Math.floor(Math.random() * M);
      p.rx   = Math.random();
      p.ry   = Math.random();
    }
  }

  seqFlashTimer = SEQ_FLASH_MAX;
  expandEvents.push({ totalStep: totalSteps, label: 'Compress' });

  const sel = document.getElementById('ctrl-m');
  if (sel) sel.value = M;
  syncExpandButtons();
}

function syncExpandButtons() {
  const btnE = document.getElementById('btn-expand');
  const btnC = document.getElementById('btn-compress');
  if (btnE) btnE.disabled = M >= 32;
  if (btnC) btnC.disabled = M <= 4;
}

// ── Controls ───────────────────────────────────────────────────────────────────
function readControls() {
  const newN   = parseInt(document.getElementById('ctrl-n').value);
  const newSpd = parseInt(document.getElementById('ctrl-speed').value);

  document.getElementById('val-n').textContent     = newN;
  document.getElementById('val-speed').textContent = newSpd;

  speed = newSpd;

  if (newN !== prevN) {
    N     = newN;
    prevN = N;
    initGrid('corner');
  }
}

function onMChange() {
  const newM = parseInt(document.getElementById('ctrl-m').value);
  if (newM !== M) {
    M    = newM;
    S_eq = N * Math.log(M);
    initGrid('corner');
    syncExpandButtons();
  }
}

function resetCorner() { initGrid('corner'); }
function resetRandom()  { initGrid('random'); }

function togglePause() {
  paused = !paused;
  const btn = document.getElementById('btn-pause');
  if (btn) btn.textContent = paused ? 'Resume' : 'Pause';
}

function setSimState(n_val, m_val, spd_val, initMode) {
  N     = n_val;
  M     = m_val;
  speed = spd_val;
  prevN = n_val;
  S_eq  = N * Math.log(M);

  const ctrlN   = document.getElementById('ctrl-n');
  const ctrlM   = document.getElementById('ctrl-m');
  const ctrlSpd = document.getElementById('ctrl-speed');
  if (ctrlN)   { ctrlN.value   = n_val;  document.getElementById('val-n').textContent     = n_val;  }
  if (ctrlM)     ctrlM.value   = m_val;
  if (ctrlSpd) { ctrlSpd.value = spd_val; document.getElementById('val-speed').textContent = spd_val; }

  initGrid(initMode);
  syncExpandButtons();
}

function setEduMode(m) {
  eduMode = m;
  document.querySelectorAll('.edu-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`edu-btn-${m}`);
  if (btn) btn.classList.add('active');

  setSimState(20, 16, 15, 'corner');
  updateEduPanel(m);
}

// ── Format helpers ─────────────────────────────────────────────────────────────
function formatW(lw) {
  if (lw <= 0) return 'W = 1';
  const log10W = lw / Math.LN10;
  if (lw > 50) return `W = 10^${log10W.toFixed(1)}`;
  return `W = ${Math.exp(lw).toExponential(2)}`;
}

// ── Rolling statistics ─────────────────────────────────────────────────────────
function rollingStats(arr, n) {
  const s = arr.slice(-n);
  if (s.length < 2) return { mean: s[0] || 0, std: 0 };
  const mean = s.reduce((a, b) => a + b, 0) / s.length;
  const std  = Math.sqrt(s.reduce((a, b) => a + (b - mean) ** 2, 0) / (s.length - 1));
  return { mean, std };
}

// ── Draw: divider ──────────────────────────────────────────────────────────────
function drawDivider() {
  stroke(30, 38, 50); strokeWeight(1);
  line(g.divX, 0, g.divX, height);
}

// ── Draw: grid panel ───────────────────────────────────────────────────────────
function drawGridPanel() {
  const { rows, cols } = gridShape(M);
  const cellW = g.gridW / cols;
  const cellH = g.gridH / rows;

  // Title
  noStroke(); fill(200, 215, 230); textSize(11); textAlign(CENTER);
  text(`Microstate Grid — N = ${N}, M = ${M}`, g.titleMidX, g.titleY);

  // Cells
  for (let i = 0; i < M; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx  = g.gridX0 + col * cellW;
    const cy  = g.gridY0 + row * cellH;
    const ni  = counts[i];

    const allHere  = (ni === N && N > 0);
    const flashing = (flashTimer > 0 && flashCells.includes(i));

    if (allHere) {
      fill(255, 150, 50, 45);
      stroke(255, 150, 50, 160); strokeWeight(1.5);
    } else if (flashing) {
      const a = (flashTimer / FLASH_MAX);
      fill(45, 215, 135, a * 80);
      stroke(45, 215, 135, a * 200); strokeWeight(1.5);
    } else if (ni > 0) {
      fill(45, 215, 135, (ni / N) * 0.5 * 255);
      stroke(30, 38, 50); strokeWeight(1);
    } else {
      fill(20, 28, 38);
      stroke(30, 38, 50); strokeWeight(1);
    }
    rect(cx + 1, cy + 1, cellW - 2, cellH - 2, 3);

    // Occupancy count
    if (ni > 0) {
      noStroke();
      fill(200, 215, 235, 220);
      textSize(Math.max(8, Math.min(11, cellH * 0.18)));
      textAlign(RIGHT, BOTTOM);
      text(ni, cx + cellW - 4, cy + cellH - 3);
    }
  }

  // Particle dots
  const r = getParticleRadius();
  noStroke();
  for (const p of particles) {
    const col    = p.cell % cols;
    const row    = Math.floor(p.cell / cols);
    const cx     = g.gridX0 + col * cellW;
    const cy     = g.gridY0 + row * cellH;
    const margin = r + 2;
    const aw     = Math.max(1, cellW - 2 * margin);
    const ah     = Math.max(1, cellH - 2 * margin);
    const px     = cx + margin + p.rx * aw;
    const py     = cy + margin + p.ry * ah;
    const [cr, cg, cb] = PARTICLE_COLORS[p.colorIdx];
    fill(cr, cg, cb);
    circle(px, py, r * 2);
  }

  // W / S readout
  const s        = currentLogW;
  const isMinE   = counts.some(c => c === N) && N > 0;
  const isEquil  = s > 1 && Math.abs(s - S_eq) < S_eq * 0.025 + 0.5;

  noStroke(); textSize(12); textAlign(LEFT);
  fill(88, 166, 255);   // blue — matches log₁₀(W) trace
  text(formatW(currentLogW), g.gridX0, g.readoutY);

  if (isMinE) {
    fill(255, 150, 50);
    text('S = 0 — minimum entropy', g.gridX0, g.readoutY + 18);
  } else {
    fill(45, 215, 135);
    const sLabel = isEquil
      ? `S = ${s.toFixed(1)} k  \u2248 S\u2091\u1D63`
      : `S = ${s.toFixed(1)} k`;
    text(sLabel, g.gridX0, g.readoutY + 18);
  }
}

// ── Draw: plot panel ───────────────────────────────────────────────────────────
function drawPlotPanel() {
  const seqLabel = `S\u2091\u1D63 = ${S_eq.toFixed(1)}k`;
  const weqLabel = `W\u2091\u1D63 = 10^${(S_eq / Math.LN10).toFixed(1)}`;
  drawSubPlot(g.pS, S_history,    S_eq,             [45, 215, 135], 'S(t)',             'S [k]',          seqLabel, currentLogW,            true,  false);
  drawSubPlot(g.pW, logW_history, S_eq / Math.LN10, [88, 166, 255], 'log\u2081\u2080(W)', 'log\u2081\u2080 W', weqLabel, currentLogW / Math.LN10, false, true);
}

// drawSubPlot — shared renderer for S(t) and log₁₀(W) traces
//   showSigma    : draw ±σ fluctuation band (S plot only)
//   showTimeAxis : draw labelled time X-axis (bottom plot only)
function drawSubPlot(p, history, refVal, traceColor, title, yLabel, refLabel,
                     currentVal, showSigma, showTimeAxis) {
  const { x0, y0, x1, y1 } = p;
  const ph  = y1 - y0;
  const len = history.length;

  const histMax = len > 0 ? Math.max(...history) : 0;
  const yMax    = Math.max(refVal * 1.15, histMax * 1.1, 1);

  // ── Title ──────────────────────────────────────────────────────────────────
  noStroke(); fill(200, 215, 230); textSize(10); textAlign(LEFT);
  text(title, x0, y0 - 4);

  // ── Axes ───────────────────────────────────────────────────────────────────
  stroke(55, 65, 80); strokeWeight(1);
  line(x0, y0, x0, y1);
  line(x0, y1, x1, y1);

  // ── σ band — equilibrium fluctuations (S plot only) ────────────────────────
  // Amplitude ∝ √N: increase N → narrower band → thermodynamic limit
  if (showSigma && len >= 25) {
    const stats  = rollingStats(history, Math.min(80, len));
    const fadeIn = constrain((len - 25) / 40, 0, 1);
    const nearEq = stats.mean > refVal * 0.60;   // only show near equilibrium
    if (stats.std > 0.1 && fadeIn > 0 && nearEq) {
      const yMid   = map(stats.mean, 0, yMax, y1, y0);
      const halfPx = (stats.std / yMax) * ph;
      const yTop   = constrain(yMid - halfPx, y0, y1);
      const yBot   = constrain(yMid + halfPx, y0, y1);
      // Shaded band
      noStroke(); fill(45, 215, 135, fadeIn * 20);
      rect(x0, yTop, x1 - x0, yBot - yTop);
      // Dashed border lines
      drawingContext.setLineDash([4, 5]);
      stroke(45, 215, 135, fadeIn * 75); strokeWeight(1);
      line(x0, yTop, x1, yTop);
      line(x0, yBot, x1, yBot);
      drawingContext.setLineDash([]);
      // Label — shows amplitude and hints at √N dependence
      noStroke(); fill(45, 215, 135, fadeIn * 160);
      textSize(8); textAlign(RIGHT);
      text(`\u03C3 = ${stats.std.toFixed(1)}k  (\u221aN: try N\u2191\u2193)`, x1, yTop - 2);
    }
  }

  // ── S_eq / W_eq reference line (flashes when M changes) ────────────────────
  if (refVal > 0) {
    const ry = map(refVal, 0, yMax, y1, y0);
    if (ry >= y0 && ry <= y1) {
      const flash = seqFlashTimer / SEQ_FLASH_MAX;
      drawingContext.setLineDash([5, 5]);
      stroke(255, 150 + flash * 55, 50 + flash * 30); strokeWeight(1.5 + flash * 1.5);
      line(x0, ry, x1, ry);
      drawingContext.setLineDash([]);
      noStroke(); fill(255, 170, 70); textSize(9); textAlign(RIGHT);
      text(refLabel, x1, ry - 3);
    }
  }

  // ── Expand / Compress event markers ────────────────────────────────────────
  for (const ev of expandEvents) {
    const stepsAgo = totalSteps - ev.totalStep;
    const histPos  = len - 1 - stepsAgo;
    if (histPos >= 0 && histPos < len) {
      const evX = len < 2 ? x0 : map(histPos, 0, len - 1, x0, x1);
      drawingContext.setLineDash([3, 4]);
      stroke(255, 150, 50, 160); strokeWeight(1);
      line(evX, y0, evX, y1);
      drawingContext.setLineDash([]);
      noStroke(); fill(255, 150, 50, 200); textSize(8); textAlign(CENTER);
      text(ev.label, evX, y0 + 8);
    }
  }

  // ── Trace ──────────────────────────────────────────────────────────────────
  if (len > 1) {
    stroke(...traceColor); strokeWeight(1.5); noFill();
    beginShape();
    for (let i = 0; i < len; i++) {
      const px = map(i, 0, len - 1, x0, x1);
      const py = map(history[i], 0, yMax, y1, y0);
      vertex(px, constrain(py, y0, y1));
    }
    endShape();
  }

  // ── Current-value indicator: dashed horizon + dot at trace tip ─────────────
  // Visually ties the grid readout (same color) to the graph position
  if (len > 0) {
    const curY = constrain(map(currentVal, 0, yMax, y1, y0), y0, y1);
    drawingContext.setLineDash([3, 6]);
    stroke(...traceColor, 65); strokeWeight(1);
    line(x0, curY, x1, curY);
    drawingContext.setLineDash([]);
    noStroke(); fill(...traceColor);
    circle(x1, curY, 5);
  }

  // ── Y-axis ticks ───────────────────────────────────────────────────────────
  const nTicks = 4;
  for (let t = 0; t <= nTicks; t++) {
    const val = (yMax / nTicks) * t;
    const ty  = map(val, 0, yMax, y1, y0);
    stroke(55, 65, 80); strokeWeight(1);
    line(x0 - 3, ty, x0, ty);
    noStroke(); fill(155, 170, 190); textSize(8); textAlign(RIGHT);
    text(val.toFixed(0), x0 - 5, ty + 3);
  }

  // ── Y-axis label (rotated) ─────────────────────────────────────────────────
  push();
  translate(x0 - 34, y0 + ph / 2);
  rotate(-HALF_PI);
  noStroke(); fill(155, 170, 190); textSize(8); textAlign(CENTER);
  text(yLabel, 0, 0);
  pop();

  // ── Time X-axis (bottom plot only) ─────────────────────────────────────────
  // Elapsed time in seconds = steps / speed; updates live as speed slider moves
  if (showTimeAxis) {
    const tLen = time_history.length;
    noStroke(); fill(155, 170, 190); textSize(8); textAlign(RIGHT);
    text('t (s) \u2192', x1, y1 + 15);

    if (tLen >= 2) {
      const tStart = time_history[0];
      const tEnd   = time_history[tLen - 1];
      const tSpan  = tEnd - tStart;
      if (tSpan > 0.01) {
        // Choose a nice tick interval
        const rough = tSpan / 5;
        const mag   = Math.pow(10, Math.floor(Math.log10(rough)));
        let tickInt = mag;
        for (const m of [1, 2, 5, 10]) {
          if (m * mag >= rough) { tickInt = m * mag; break; }
        }
        const tFirst = Math.ceil(tStart / tickInt) * tickInt;
        for (let ti = tFirst; ti <= tEnd + tickInt * 0.01; ti += tickInt) {
          const xFrac = (ti - tStart) / tSpan;
          const tx    = map(xFrac, 0, 1, x0, x1);
          if (tx < x0 - 1 || tx > x1 + 1) continue;
          stroke(55, 65, 80); strokeWeight(1);
          line(tx, y1, tx, y1 + 4);
          noStroke(); fill(155, 170, 190); textSize(8); textAlign(CENTER);
          const lbl = tSpan < 5 ? ti.toFixed(1) : tSpan < 60 ? ti.toFixed(0)
                      : ti >= 1000 ? `${(ti / 1000).toFixed(1)}k` : ti.toFixed(0);
          text(lbl, tx, y1 + 15);
        }
      }
    }
  }
}

// ── p5 lifecycle ───────────────────────────────────────────────────────────────
function setup() {
  const cont = document.getElementById('canvas-container');
  createCanvas(cont.clientWidth, cont.clientHeight).parent('canvas-container');
  textFont('Courier New');
  computeGeometry();
  S_eq = N * Math.log(M);
  initGrid('corner');
  updateEduPanel('boltzmann');
  syncExpandButtons();
}

function windowResized() {
  const cont = document.getElementById('canvas-container');
  resizeCanvas(cont.clientWidth, cont.clientHeight);
  computeGeometry();
}

function draw() {
  background(17, 24, 32);

  readControls();

  if (!paused) {
    stepAccum += speed / max(frameRate(), 1);
    const steps = Math.floor(stepAccum);
    stepAccum -= steps;
    for (let s = 0; s < Math.min(steps, 30); s++) doStep();
  }

  if (flashTimer > 0) flashTimer--;
  if (seqFlashTimer > 0) seqFlashTimer--;

  drawDivider();
  drawGridPanel();
  drawPlotPanel();
}
