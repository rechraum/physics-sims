// ─────────────────────────────────────────────────────────────────────────────
// Maxwell's Demon — sketch.js
//
// Physics (k = 1 throughout):
//   Demon Mode: demon sorts fast molecules right, slow molecules left.
//     T_C = (1/N_L) Σ ½v²   T_H = (1/N_R) Σ ½v²
//     Each molecule passing writes 1 bit. On erasure: W_erase = N_mem × ln 2.
//   Szilard Engine: 4-step cycle (Observe → Insert → Expand → Erase)
//     W_extracted = T ln 2   W_erase = T ln 2   Net = 0
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Edu content
// ─────────────────────────────────────────────────────────────────────────────
const EDU = {

  demon: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Maxwell's Demon</p>
        <p class="edu-description">
          In 1867, James Clerk Maxwell proposed a thought experiment: a tiny &ldquo;demon&rdquo;
          watches molecules at a partition and opens a door for fast ones moving right, slow ones
          moving left. The result is spontaneous separation of hot and cold &mdash; entropy decreases
          without any work input. This <em>appeared</em> to violate the second law of thermodynamics,
          and no one could explain why it didn&rsquo;t for nearly a century.
          Leo Szilard (1929) sharpened the paradox: even a single-molecule version extracts
          kT&thinsp;ln&thinsp;2 of work per measurement cycle. The demon must store information about
          each molecule&rsquo;s position &mdash; and that storage, he argued, was the key.
        </p>
        <div class="equation">
          W<sub>extracted</sub> = kT ln 2 &nbsp;&larr;&nbsp; one bit of information
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">Maxwell's Demon</span>
          <span class="edu-concept-tag">second law</span>
          <span class="edu-concept-tag">information</span>
          <span class="edu-concept-tag">Szilard engine</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Experimental realisation</p>
          <p>
            Modern Maxwell&rsquo;s Demon experiments have been realised in colloidal particles
            (Toyabe et al.&thinsp;2010) and electron systems (Koski et al.&thinsp;2014).
            They confirm that information extraction converts to work at exactly the Landauer
            rate &mdash; kT&thinsp;ln&thinsp;2 per bit extracted.
          </p>
        </div>
      </div>
    </div>
  `,

  landauer: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Landauer&rsquo;s Principle: Erasure is Physical</p>
        <p class="edu-description">
          Rolf Landauer (1961) resolved Maxwell&rsquo;s paradox. The demon&rsquo;s measurement
          is free &mdash; observing does not cost entropy. But <em>erasing</em> the memory record
          does. Resetting a 1-bit memory from an unknown state to a known state must dissipate
          at least kT&thinsp;ln&thinsp;2 of heat into the environment. The second law is saved
          not by the measurement but by the reset.
          Charles Bennett (1982) extended this: reversible computation is possible in principle
          (no erasure = no heat cost). But any <em>logically irreversible</em> operation
          &mdash; AND, NAND, RESET &mdash; costs kT&thinsp;ln&thinsp;2 per bit erased. This
          sets a fundamental lower bound on the energy cost of computation.
        </p>
        <div class="equation">
          W<sub>erase</sub> &ge; kT ln 2 &asymp; 2.87 &times; 10<sup>&minus;21</sup> J &nbsp; at T = 300 K
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">Landauer's principle</span>
          <span class="edu-concept-tag">erasure</span>
          <span class="edu-concept-tag">reversible computing</span>
          <span class="edu-concept-tag">Bennett</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Transistors and the Landauer limit</p>
          <p>
            Today&rsquo;s best transistors dissipate roughly 10<sup>5</sup> times the Landauer
            limit per operation. As Moore&rsquo;s law continues and transistors shrink toward
            atomic scale, Landauer dissipation may become a practical engineering constraint
            within 10&ndash;20 years &mdash; a hard thermodynamic floor on computation energy.
          </p>
        </div>
      </div>
    </div>
  `,

  shannon: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Shannon Entropy = Boltzmann Entropy</p>
        <p class="edu-description">
          In 1948, Claude Shannon derived the unique measure of information uncertainty for a
          probability distribution over N outcomes. It took exactly the form Boltzmann had
          written for thermodynamic entropy in 1877 &mdash; with k replaced by a units factor.
          This is not a coincidence. Physical entropy <em>is</em> uncertainty about microscopic
          state. A molecule in a two-compartment Szilard box has 1&thinsp;bit of positional
          uncertainty; when the demon resolves that uncertainty, it decreases the physical
          entropy by kT&thinsp;ln&thinsp;2. When the demon&rsquo;s memory is erased, that
          uncertainty is dumped back into the heat bath. The
          &ldquo;information&rdquo; the demon holds is literally a thermodynamic quantity.
        </p>
        <div class="equation">
          H = &minus;&Sigma; p<sub>i</sub> log<sub>2</sub> p<sub>i</sub> &nbsp;(Shannon, bits)<br>
          S = &minus;k &Sigma; p<sub>i</sub> ln p<sub>i</sub> &nbsp;(Boltzmann, J/K)<br>
          S = k ln 2 &middot; H
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">Shannon entropy</span>
          <span class="edu-concept-tag">Boltzmann entropy</span>
          <span class="edu-concept-tag">information is physical</span>
          <span class="edu-concept-tag">von Neumann</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Quantum information</p>
          <p>
            This deep connection underlies modern quantum information theory, where von&thinsp;Neumann
            entropy S&thinsp;=&thinsp;&minus;k&thinsp;Tr(&rho;&thinsp;ln&thinsp;&rho;) is the quantum
            extension of both formulas. Quantum error correction is fundamentally a fight against
            thermodynamic entropy increase &mdash; information and energy are two faces of the same coin.
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

// ─────────────────────────────────────────────────────────────────────────────
// Simulation state
// ─────────────────────────────────────────────────────────────────────────────
let simMode  = 'demon';   // 'demon' | 'szilard'
let eduMode  = 'demon';

// ── Demon Mode ────────────────────────────────────────────────────────────────
let particles    = [];
let N            = 40;
let T0           = 1.0;
let demonFrozen  = false;
let memSize      = 8;
let memBits      = [];
let erasureCount = 0;
let S_erased     = 0;       // running total, units of k
let erasureFlash = 0;       // frames remaining for orange flash
let demonDoorFlash = 0;     // frames remaining for door-close animation
let entropyBursts = [];     // animated spark objects {x,y,vx,vy,alpha}
let avgSpeed     = 1.0;
let avgSpeedTimer = 0;
let demonSpeed   = 1.0;

const RADIUS       = 4;
const DT           = 0.5;
const DOOR_HALF_H  = 14;    // half-height of door gap in px
const AVG_INTERVAL = 30;    // frames between avgSpeed recalculation

// ── Szilard Mode ──────────────────────────────────────────────────────────────
const SZ_STEPS = ['observe', 'insert', 'expand', 'erase'];
const SZ_LABELS = { observe: 'OBSERVE', insert: 'INSERT', expand: 'EXPAND', erase: 'ERASE' };
const SZ_BASE_DUR = { observe: 36, insert: 24, expand: 60, erase: 36 };

let szStepIndex  = 0;
let szStepTimer  = 0;
let szStepProg   = 0;       // 0→1 progress within current step
let szMolHalf    = 'L';     // which half molecule is in (set on observe end)
let szAutoMode   = true;
let szT          = 1.0;
let szSpeed      = 1.0;
let szCycleCount = 0;
let szWorkProg   = 0;       // 0→1 during expand step
let szBitLit     = false;   // bit is set (after observe)
let szBitFlash   = 0;       // frames remaining for orange erase flash
let szPistonX    = 0;
let szPistonVisible = false;
let szStepPlaying = false;  // true while a step's animation is running in step mode
const SZ_TRAIL_LEN = 24;
let szTrail      = [];
let szMol        = { x: 0, y: 0, vx: 2.0, vy: 1.5 };

// ── Geometry ──────────────────────────────────────────────────────────────────
let g = {};

// ─────────────────────────────────────────────────────────────────────────────
// Geometry computation
// ─────────────────────────────────────────────────────────────────────────────
function computeGeometry() {
  const W = width, H = height;

  if (simMode === 'demon') {
    const memW   = floor(W * 0.38);
    const chamW  = W - memW;

    // Outer thermometer columns, then chamber walls
    const thermBarW = 10;
    const thermGap  = 4;
    const padT = 30, padB = 12, padInR = 8;

    g.chamberL   = thermBarW + thermGap * 2;
    g.chamberR   = chamW - padInR;
    g.chamberT   = padT;
    g.chamberB   = H - padB;
    g.partX      = floor((g.chamberL + g.chamberR) / 2);
    g.doorY      = floor((g.chamberT + g.chamberB) / 2);

    g.thermLx    = thermGap;
    g.thermRx    = g.chamberR + thermGap;
    g.thermW     = thermBarW;
    g.thermT     = g.chamberT;
    g.thermH     = g.chamberB - g.chamberT;

    g.memX       = chamW + 8;
    g.memW       = memW - 16;
    g.memT       = padT;
    g.memH       = H - padT - padB;
  } else {
    // Szilard: left 55% box, right 45% step diagram
    const splitX   = floor(W * 0.55);
    const boxPad   = 28;
    const boxAvailW = splitX - boxPad * 2;
    const boxAvailH = H - boxPad * 2 - 50;
    const boxSize   = min(boxAvailW, boxAvailH);

    g.szBox = {
      L: floor((splitX - boxSize) / 2),
      T: floor((H - boxSize) / 2 + 10),
      W: boxSize,
      H: boxSize,
    };
    g.szBox.R  = g.szBox.L + g.szBox.W;
    g.szBox.B  = g.szBox.T + g.szBox.H;
    g.szBox.cx = g.szBox.L + floor(g.szBox.W / 2);
    g.szBox.cy = g.szBox.T + floor(g.szBox.H / 2);

    g.stepX  = splitX + 8;
    g.stepW  = W - splitX - 16;
    g.stepT  = 20;
    g.stepH  = H - 40;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Color helper (thermo series: cold blue → white → hot red)
// ─────────────────────────────────────────────────────────────────────────────
function particleColor(v, vRmsRef) {
  const t = v / max(vRmsRef, 0.001);
  let r, gr, b;
  if (t <= 1) {
    const f = constrain(t, 0, 1);
    r = lerp(50,  220, f);
    gr = lerp(130, 220, f);
    b = lerp(220, 220, f);
  } else {
    const f = constrain(t - 1, 0, 1);
    r = lerp(220, 220, f);
    gr = lerp(220, 60,  f);
    b = lerp(220, 50,  f);
  }
  return [r, gr, b];
}

// ─────────────────────────────────────────────────────────────────────────────
// Demon Mode — physics
// ─────────────────────────────────────────────────────────────────────────────
function initDemon() {
  particles     = [];
  memBits       = new Array(memSize).fill(0);
  erasureCount  = 0;
  S_erased      = 0;
  erasureFlash  = 0;
  demonDoorFlash = 0;
  entropyBursts = [];
  avgSpeedTimer = 0;

  if (demonFrozen) {
    demonFrozen = false;
    const btn = document.getElementById('btn-freeze');
    if (btn) { btn.textContent = 'Freeze Demon'; btn.classList.remove('active'); }
  }

  const speed = sqrt(2 * T0);
  const { chamberL, chamberR, chamberT, chamberB, partX } = g;
  const pad = RADIUS + 2;

  for (let i = 0; i < N; i++) {
    const side = (i % 2 === 0) ? 'L' : 'R';
    const xMin = side === 'L' ? chamberL + pad : partX + pad;
    const xMax = side === 'L' ? partX - pad    : chamberR - pad;
    const x    = xMin + Math.random() * (xMax - xMin);
    const y    = chamberT + pad + Math.random() * (chamberB - chamberT - 2 * pad);
    const ang  = Math.random() * TWO_PI;
    particles.push({ x, y, vx: speed * cos(ang), vy: speed * sin(ang), side });
  }
  avgSpeed = speed;
}

function writeBit() {
  const idx = memBits.indexOf(0);
  if (idx >= 0) memBits[idx] = 1;
  if (memBits.every(b => b === 1)) triggerErasure();
}

function triggerErasure() {
  erasureCount++;
  S_erased    += memSize * Math.log(2);
  erasureFlash = 40;
  spawnEntropyBurst();
  memBits.fill(0);
}

function spawnEntropyBurst() {
  const cx = g.memX + g.memW * 0.5;
  const cy = g.memT + 50;
  for (let i = 0; i < 12; i++) {
    entropyBursts.push({
      x: cx + (Math.random() - 0.5) * 40,
      y: cy + (Math.random() - 0.5) * 16,
      vx: 1.5 + Math.random() * 2.5,
      vy: (Math.random() - 0.5) * 2.5,
      alpha: 230,
    });
  }
}

function updateDemonPhysics() {
  const { chamberL, chamberR, chamberT, chamberB, partX, doorY } = g;

  // Move
  for (const p of particles) {
    p.x += p.vx * DT * demonSpeed;
    p.y += p.vy * DT * demonSpeed;
  }

  // Wall and partition collisions
  for (const p of particles) {
    // Top / bottom
    if (p.y - RADIUS < chamberT) { p.y = chamberT + RADIUS; p.vy =  abs(p.vy); }
    if (p.y + RADIUS > chamberB) { p.y = chamberB - RADIUS; p.vy = -abs(p.vy); }

    if (p.side === 'L') {
      // Outer left wall
      if (p.x - RADIUS < chamberL) { p.x = chamberL + RADIUS; p.vx = abs(p.vx); }
      // Partition (from left)
      if (p.x + RADIUS > partX) {
        const inDoor = abs(p.y - doorY) <= DOOR_HALF_H;
        const speed  = sqrt(p.vx * p.vx + p.vy * p.vy);
        const allow  = inDoor && (demonFrozen
          ? Math.random() < 0.5
          : (speed > avgSpeed && p.vx > 0));
        if (allow) {
          p.side = 'R';
          p.x    = max(p.x, partX + RADIUS);
          writeBit();
        } else {
          if (inDoor) demonDoorFlash = 20;
          p.x  = partX - RADIUS;
          p.vx = -abs(p.vx);
        }
      }
    } else {
      // Outer right wall
      if (p.x + RADIUS > chamberR) { p.x = chamberR - RADIUS; p.vx = -abs(p.vx); }
      // Partition (from right)
      if (p.x - RADIUS < partX) {
        const inDoor = abs(p.y - doorY) <= DOOR_HALF_H;
        const speed  = sqrt(p.vx * p.vx + p.vy * p.vy);
        const allow  = inDoor && (demonFrozen
          ? Math.random() < 0.5
          : (speed < avgSpeed && p.vx < 0));
        if (allow) {
          p.side = 'L';
          p.x    = min(p.x, partX - RADIUS);
          writeBit();
        } else {
          if (inDoor) demonDoorFlash = 20;
          p.x  = partX + RADIUS;
          p.vx = abs(p.vx);
        }
      }
    }
  }

  // O(N²) elastic collisions (same-side only)
  const minD = 2 * RADIUS, minD2 = minD * minD;
  for (let i = 0; i < particles.length - 1; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      if (particles[i].side !== particles[j].side) continue;
      const p1 = particles[i], p2 = particles[j];
      const dx = p2.x - p1.x, dy = p2.y - p1.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < minD2 && d2 > 0) {
        const dot = (p1.vx - p2.vx) * dx + (p1.vy - p2.vy) * dy;
        if (dot > 0) {
          const imp = dot / d2;
          p1.vx -= imp * dx; p1.vy -= imp * dy;
          p2.vx += imp * dx; p2.vy += imp * dy;
          const d  = sqrt(d2), ov = (minD - d) * 0.5;
          p1.x -= ov * dx / d; p1.y -= ov * dy / d;
          p2.x += ov * dx / d; p2.y += ov * dy / d;
        }
      }
    }
  }

  // Recompute avgSpeed periodically
  avgSpeedTimer++;
  if (avgSpeedTimer >= AVG_INTERVAL) {
    let sum = 0;
    for (const p of particles) sum += p.vx * p.vx + p.vy * p.vy;
    avgSpeed = sqrt(sum / max(particles.length, 1));
    avgSpeedTimer = 0;
  }

  // Entropy burst animation
  entropyBursts = entropyBursts.filter(b => b.alpha > 0);
  for (const b of entropyBursts) {
    b.x += b.vx; b.y += b.vy; b.alpha -= 5;
  }
  if (erasureFlash > 0) erasureFlash--;
  if (demonDoorFlash > 0) demonDoorFlash--;
}

// ─────────────────────────────────────────────────────────────────────────────
// Demon Mode — drawing
// ─────────────────────────────────────────────────────────────────────────────
function drawDualChamber() {
  const { chamberL, chamberR, chamberT, chamberB, partX, doorY,
          thermLx, thermRx, thermW, thermT, thermH } = g;

  // Measure temperatures per side
  let keL = 0, nL = 0, keR = 0, nR = 0;
  for (const p of particles) {
    const ke = 0.5 * (p.vx * p.vx + p.vy * p.vy);
    if (p.side === 'L') { keL += ke; nL++; } else { keR += ke; nR++; }
  }
  const T_C = nL > 0 ? keL / nL : T0;
  const T_H = nR > 0 ? keR / nR : T0;

  // Global vRms for particle coloring
  const totalKE = keL + keR;
  const totalN  = nL + nR;
  const T_avg   = totalN > 0 ? totalKE / totalN : T0;
  const vRmsRef = sqrt(2 * T_avg);

  // Panel title
  const dT = (T_H - T_C).toFixed(2);
  noStroke(); fill(200, 215, 230); textSize(12); textAlign(CENTER, BASELINE);
  text(`Maxwell\u2019s Demon  \u2014  \u0394T = ${dT}`,
       (chamberL + chamberR) / 2, chamberT - 10);
  textAlign(LEFT, BASELINE);

  // Thermometer bars (outer walls)
  const T_ref = max(T_H * 1.1, T0 * 2);
  // Background tracks
  fill(20, 28, 38); stroke(40, 52, 68); strokeWeight(1);
  rect(thermLx, thermT, thermW, thermH, 3);
  rect(thermRx, thermT, thermW, thermH, 3);
  // Fills
  noStroke();
  const fillC = constrain(T_C / T_ref, 0, 1) * thermH;
  fill(50, 130, 220);
  rect(thermLx, thermT + thermH - fillC, thermW, fillC, 0, 0, 3, 3);
  const fillH = constrain(T_H / T_ref, 0, 1) * thermH;
  fill(220, 60, 50);
  rect(thermRx, thermT + thermH - fillH, thermW, fillH, 0, 0, 3, 3);

  // Thermometer labels
  textSize(9); textAlign(CENTER, TOP);
  fill(50, 130, 220);
  text(`T_C = ${T_C.toFixed(2)}`, thermLx + thermW / 2, chamberB + 3);
  fill(220, 60, 50);
  text(`T_H = ${T_H.toFixed(2)}`, thermRx + thermW / 2, chamberB + 3);
  textAlign(LEFT, BASELINE);

  // Chamber walls
  noFill(); stroke(50, 65, 85); strokeWeight(1.5);
  rect(chamberL, chamberT, chamberR - chamberL, chamberB - chamberT);

  // Partition (two halves separated by door gap)
  stroke(50, 65, 85); strokeWeight(2);
  line(partX, chamberT, partX, doorY - DOOR_HALF_H);
  line(partX, doorY + DOOR_HALF_H, partX, chamberB);

  // Door gap — bracket marks + animated close panels
  const bw = 5;
  if (demonDoorFlash > 0) {
    // frames 20→14: door slides shut (closeProg 0→1); 14→8: held; 8→0: fade
    const closeProg  = demonDoorFlash > 14 ? (20 - demonDoorFlash) / 6 : 1.0;
    const fadeAlpha  = demonDoorFlash <= 8 ? (demonDoorFlash / 8) * 240 : 240;
    const panelH     = DOOR_HALF_H * closeProg;
    noStroke(); fill(45, 215, 135, fadeAlpha * 0.65);
    rect(partX - 3, doorY - DOOR_HALF_H,          6, panelH, 1);  // top slides down
    rect(partX - 3, doorY + DOOR_HALF_H - panelH, 6, panelH, 1);  // bottom slides up
    stroke(45, 215, 135, fadeAlpha); strokeWeight(2); noFill();
    line(partX - bw, doorY - DOOR_HALF_H, partX + bw, doorY - DOOR_HALF_H);
    line(partX - bw, doorY + DOOR_HALF_H, partX + bw, doorY + DOOR_HALF_H);
  } else if (erasureFlash > 0) {
    stroke(255, 150, 50, 200); strokeWeight(2); noFill();
    line(partX - bw, doorY - DOOR_HALF_H, partX + bw, doorY - DOOR_HALF_H);
    line(partX - bw, doorY + DOOR_HALF_H, partX + bw, doorY + DOOR_HALF_H);
  } else {
    stroke(45, 215, 135, 80); strokeWeight(1); noFill();
    line(partX - bw, doorY - DOOR_HALF_H, partX + bw, doorY - DOOR_HALF_H);
    line(partX - bw, doorY + DOOR_HALF_H, partX + bw, doorY + DOOR_HALF_H);
  }

  // Particles
  noStroke();
  for (const p of particles) {
    const v = sqrt(p.vx * p.vx + p.vy * p.vy);
    const [r, gr, b] = particleColor(v, vRmsRef);
    fill(r, gr, b);
    circle(p.x, p.y, RADIUS * 2);
  }

  // N readouts inside each chamber
  textSize(10); noStroke();
  fill(155, 170, 190); textAlign(LEFT, TOP);
  text(`N = ${nL}`, chamberL + 6, chamberT + 5);
  textAlign(RIGHT, TOP);
  text(`N = ${nR}`, chamberR - 6, chamberT + 5);
  textAlign(LEFT, BASELINE);
}

function drawMemoryPanel() {
  const { memX, memW, memT } = g;

  // Panel divider
  stroke(30, 38, 50); strokeWeight(1);
  line(memX - 8, 0, memX - 8, height);

  // Title
  noStroke(); fill(200, 215, 230); textSize(12); textAlign(CENTER, BASELINE);
  text('Demon Memory', memX + memW / 2, memT + 14);

  // Subtitle
  fill(100, 115, 135); textSize(9); textAlign(CENTER, BASELINE);
  text('each partition crossing writes 1 bit', memX + memW / 2, memT + 27);
  textAlign(LEFT, BASELINE);

  // Bit register
  const nBits    = memBits.length;
  const cellSize = min(floor((memW - 4) / max(nBits, 1)) - 3, 28);
  const totalW   = nBits * (cellSize + 3) - 3;
  const regX     = memX + (memW - totalW) / 2;
  const regY     = memT + 38;

  for (let i = 0; i < nBits; i++) {
    const cx = regX + i * (cellSize + 3);
    if (erasureFlash > 20) {
      fill(200, 100, 20); stroke(255, 150, 50); strokeWeight(1);
    } else if (memBits[i] === 1) {
      fill(20, 80, 60); stroke(45, 215, 135); strokeWeight(1);
    } else {
      fill(22, 30, 42); stroke(40, 52, 68); strokeWeight(1);
    }
    rect(cx, regY, cellSize, cellSize, 3);
    noStroke();
    if (erasureFlash > 20) {
      fill(255, 200, 100);
    } else if (memBits[i] === 1) {
      fill(45, 215, 135);
    } else {
      fill(50, 65, 85);
    }
    textSize(max(9, min(cellSize - 6, 14))); textAlign(CENTER, CENTER);
    text(memBits[i], cx + cellSize / 2, regY + cellSize / 2);
    textAlign(LEFT, BASELINE);
  }

  // Memory fill progress bar
  const bitsSet = memBits.filter(b => b === 1).length;
  const barX    = memX + 4;
  const barY    = regY + cellSize + 8;
  const barW    = memW - 8;
  const barH    = 6;
  fill(22, 30, 42); stroke(40, 52, 68); strokeWeight(1);
  rect(barX, barY, barW, barH, 3);
  const fillFrac = nBits > 0 ? bitsSet / nBits : 0;
  if (fillFrac > 0) {
    noStroke();
    fill(45, 215, 135, erasureFlash > 0 ? 100 : 200);
    rect(barX, barY, barW * fillFrac, barH, 3);
  }
  noStroke(); fill(100, 115, 135); textSize(9); textAlign(RIGHT, TOP);
  text(`${bitsSet}/${nBits} bits filled`, memX + memW - 4, barY + barH + 3);
  textAlign(LEFT, BASELINE);

  // ── Explanatory text ──────────────────────────────────────────────────────
  const lx = memX + 4;
  const rx = lx + memW - 8;
  let cy = barY + barH + 24;

  // Why must the demon remember?
  fill(45, 215, 135); textSize(10); noStroke();
  text('Why must the demon remember?', lx, cy); cy += 16;
  fill(155, 170, 190); textSize(9);
  text('The demon can only sort molecules by', lx, cy); cy += 13;
  text('knowing each one\u2019s speed. Every sorting', lx, cy); cy += 13;
  text('decision writes 1 bit here. Without', lx, cy); cy += 13;
  text('memory it would open the door randomly', lx, cy); cy += 13;
  text('\u2014 no sorting, no \u0394T, no entropy drop.', lx, cy); cy += 19;

  // Separator
  stroke(30, 38, 50); strokeWeight(1);
  line(lx, cy, rx, cy); cy += 14;

  // Cumulative entropy released
  fill(45, 215, 135); textSize(13); noStroke();
  text(`\u03A3 S_erase = ${S_erased.toFixed(2)} k`, lx, cy); cy += 18;
  fill(100, 115, 135); textSize(9);
  text('Total entropy released to the environment', lx, cy); cy += 13;
  text('across all erasure events (units of k).', lx, cy); cy += 19;

  fill(155, 170, 190); textSize(11); noStroke();
  text(`Erasures: ${erasureCount}`, lx, cy); cy += 15;
  fill(100, 115, 135); textSize(9);
  text('When memory fills \u2192 all bits reset to 0.', lx, cy); cy += 13;
  text('Cost: W_erase \u2265 N_bits \u00D7 kT ln 2.', lx, cy); cy += 13;
  text('This heat cancels W_extracted: net = 0,', lx, cy); cy += 13;
  text('preserving the second law.', lx, cy); cy += 19;

  // Landauer bound
  stroke(30, 38, 50); strokeWeight(1);
  line(lx, cy, rx, cy); cy += 12;
  noStroke(); fill(100, 115, 135); textSize(9);
  text('Landauer minimum per erasure cycle:', lx, cy); cy += 13;
  fill(155, 170, 190); textSize(10);
  text(`W_erase \u2265 ${memSize} \u00D7 ln 2 \u00D7 k`, lx, cy); cy += 13;
  fill(100, 115, 135); textSize(9);
  text(`      = ${(memSize * Math.log(2)).toFixed(3)} k`, lx, cy); cy += 20;

  // Frozen indicator
  if (demonFrozen) {
    fill(130, 80, 20, 120); noStroke();
    rect(memX, cy, memW, 18, 3);
    fill(255, 150, 50, 200); textSize(10); textAlign(CENTER, CENTER);
    text('DEMON FROZEN \u2014 door opens randomly', memX + memW / 2, cy + 9);
    textAlign(LEFT, BASELINE);
  }

  // Entropy burst sparks
  noStroke();
  for (const b of entropyBursts) {
    fill(45, 215, 135, b.alpha);
    circle(b.x, b.y, 5);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Szilard Mode — physics
// ─────────────────────────────────────────────────────────────────────────────
function initSzilard() {
  szStepIndex  = 0;
  szStepTimer  = 0;
  szStepProg   = 0;
  szMolHalf    = 'L';
  szCycleCount = 0;
  szWorkProg   = 0;
  szBitLit     = false;
  szBitFlash   = 0;
  szPistonVisible = false;
  szStepPlaying = false;
  szTrail      = [];

  const { szBox } = g;
  szMol = {
    x:  szBox.L + szBox.W * 0.3,
    y:  szBox.T + szBox.H * 0.5,
    vx: 2.2,
    vy: 1.6,
  };
}

function updateSzilardStep() {
  const step = SZ_STEPS[szStepIndex];
  const dur  = max(1, round(SZ_BASE_DUR[step] / szSpeed));

  if (szAutoMode) {
    szStepTimer++;
    szStepProg = min(szStepTimer / dur, 1);
    if (szStepTimer >= dur) advanceSzStep();
  } else if (szStepPlaying) {
    // Step mode: play through this step's animation then pause
    szStepTimer++;
    szStepProg = min(szStepTimer / dur, 1);
    if (szStepTimer >= dur) szStepPlaying = false;
  } else {
    // Step mode, animation done: hold at end-of-step position
    szStepProg = min(szStepTimer / dur, 1);
  }

  updatePistonFromProgress(szStepProg);

  if (szBitFlash > 0) szBitFlash--;
}

function advanceSzStep() {
  const prev = SZ_STEPS[szStepIndex];

  if (prev === 'observe') {
    szMolHalf = szMol.x < g.szBox.cx ? 'L' : 'R';
    szBitLit  = true;
  }
  if (prev === 'erase') {
    szCycleCount++;
    szBitLit  = false;
  }

  szStepIndex = (szStepIndex + 1) % 4;
  szStepTimer = 0;
  szStepProg  = 0;
  szWorkProg  = 0;
  szTrail     = [];

  if (SZ_STEPS[szStepIndex] === 'erase') szBitFlash = 30;
}

function updatePistonFromProgress(t) {
  const step = SZ_STEPS[szStepIndex];
  const { L, R, cx } = g.szBox;

  if (step === 'insert') {
    szPistonVisible = true;
    szPistonX = szMolHalf === 'L' ? lerp(R, cx, t) : lerp(L, cx, t);
  } else if (step === 'expand') {
    szPistonVisible = true;
    szPistonX  = szMolHalf === 'L' ? lerp(cx, R, t) : lerp(cx, L, t);
    szWorkProg = constrain(t, 0, 1);
  } else if (step === 'erase') {
    szPistonVisible = false;
    szWorkProg      = 1;
  } else {
    szPistonVisible = false;
    szWorkProg      = 0;
  }
}

function updateSzMolecule() {
  // In step mode during OBSERVE the molecule is held still while the demon measures
  if (!szAutoMode && SZ_STEPS[szStepIndex] === 'observe') return;

  // Determine x bounds based on step and piston position
  const step = SZ_STEPS[szStepIndex];
  const { L, R, T: bT, B: bB } = g.szBox;
  let xL = L + RADIUS, xR = R - RADIUS;

  if ((step === 'insert' || step === 'expand') && szPistonVisible) {
    if (szMolHalf === 'L') xR = szPistonX - RADIUS - 1;
    else                    xL = szPistonX + RADIUS + 1;
  }
  xL = max(xL, L + RADIUS);
  xR = min(xR, R - RADIUS);

  szMol.x += szMol.vx * DT * szSpeed;
  szMol.y += szMol.vy * DT * szSpeed;

  if (szMol.x < xL) { szMol.x = xL; szMol.vx =  abs(szMol.vx); }
  if (szMol.x > xR) { szMol.x = xR; szMol.vx = -abs(szMol.vx); }
  if (szMol.y < bT + RADIUS) { szMol.y = bT + RADIUS; szMol.vy =  abs(szMol.vy); }
  if (szMol.y > bB - RADIUS) { szMol.y = bB - RADIUS; szMol.vy = -abs(szMol.vy); }

  szTrail.push({ x: szMol.x, y: szMol.y });
  if (szTrail.length > SZ_TRAIL_LEN) szTrail.shift();
}

// ─────────────────────────────────────────────────────────────────────────────
// Szilard Mode — drawing
// ─────────────────────────────────────────────────────────────────────────────
function drawSzilardBox() {
  const { szBox } = g;
  const { L, R, T: bT, B: bB, cx, cy, W: bW, H: bH } = szBox;

  // Box walls
  noFill(); stroke(50, 65, 85); strokeWeight(2);
  rect(L, bT, bW, bH);

  // Dashed centerline (observation boundary)
  drawingContext.setLineDash([6, 5]);
  stroke(45, 215, 135, 50); strokeWeight(1);
  line(cx, bT, cx, bB);
  drawingContext.setLineDash([]);

  // Half labels (L / R)
  noStroke(); fill(45, 215, 135, 60); textSize(28); textAlign(CENTER, CENTER);
  text('L', (L + cx) / 2, cy);
  text('R', (cx + R) / 2, cy);
  textAlign(LEFT, BASELINE);

  // Piston
  if (szPistonVisible) {
    fill(100, 115, 135, 220); stroke(140, 155, 170); strokeWeight(1.5);
    const pw = 10;
    rect(szPistonX - pw / 2, bT + 4, pw, bH - 8, 2);
  }

  // Molecule trail
  noStroke();
  for (let i = 0; i < szTrail.length; i++) {
    const a = (i / szTrail.length) * 140;
    fill(45, 215, 135, a);
    circle(szTrail[i].x, szTrail[i].y, 4);
  }

  // Molecule glow + core
  const step = SZ_STEPS[szStepIndex];
  noStroke(); fill(45, 215, 135, 40);
  circle(szMol.x, szMol.y, RADIUS * 5);
  fill(45, 215, 135, 180);
  circle(szMol.x, szMol.y, RADIUS * 2.5);
  fill(200, 240, 220);
  circle(szMol.x, szMol.y, RADIUS);

  // Dashed force arrow + label during expansion
  // Piston advances quasi-statically via molecule pressure (averaged over many bounces)
  if (step === 'expand' && szPistonVisible) {
    const dir = szMolHalf === 'L' ? 1 : -1;
    const ax1 = szMol.x + dir * (RADIUS + 4);
    const ax2 = szPistonX - dir * 5;
    const arrowLen = dir * (ax2 - ax1);
    if (arrowLen > 14) {
      drawingContext.setLineDash([3, 4]);
      stroke(45, 215, 135, 110); strokeWeight(1.5);
      line(ax1, szMol.y, ax2, szMol.y);
      drawingContext.setLineDash([]);
      fill(45, 215, 135, 110); noStroke();
      triangle(ax2, szMol.y - 4, ax2 + dir * 8, szMol.y, ax2, szMol.y + 4);
      // Label floated above the arrow midpoint
      const midX = (ax1 + ax2) / 2;
      fill(45, 215, 135, 160); textSize(9); textAlign(CENTER, BASELINE);
      text('molecule exerts pressure', midX, szMol.y - 9);
      textAlign(LEFT, BASELINE);
    } else {
      // Molecule is right against piston — show label at box top instead
      noStroke(); fill(45, 215, 135, 130); textSize(9); textAlign(CENTER, TOP);
      text('molecule exerts pressure', cx, bT + 5);
      textAlign(LEFT, BASELINE);
    }
  }

  // Step-mode overlay inside the box during OBSERVE
  if (step === 'observe' && !szAutoMode) {
    const msg = szStepPlaying
      ? 'demon observing\u2026'
      : 'molecule frozen \u2014 click Step \u25B6 to record';
    fill(22, 30, 42, 200); noStroke();
    rect(L + 1, bT + 1, bW - 2, 20, 2);
    fill(45, 215, 135); textSize(9); textAlign(CENTER, CENTER);
    text(msg, cx, bT + 11);
    textAlign(LEFT, BASELINE);
  }

  // Bit display (top of box)
  const bitLabel = !szBitLit ? 'Bit = ?' : (szMolHalf === 'L' ? 'Bit = L' : 'Bit = R');
  const bitColor = szBitFlash > 0 ? [255, 150, 50] : szBitLit ? [45, 215, 135] : [80, 95, 115];
  noStroke(); fill(...bitColor); textSize(11); textAlign(CENTER, BASELINE);
  text(bitLabel, cx, bT - 5);

  // Work meter (during expand/erase)
  if (step === 'expand' || step === 'erase') {
    const W_val = szT * Math.log(2) * szWorkProg;
    const meterY = bB + 12, meterW = bW - 20, meterH = 8;
    const meterX = L + 10;
    fill(22, 30, 42); stroke(40, 52, 68); strokeWeight(1);
    rect(meterX, meterY, meterW, meterH, 3);
    if (szWorkProg > 0) {
      noStroke(); fill(45, 215, 135, step === 'erase' ? 120 : 220);
      rect(meterX, meterY, meterW * szWorkProg, meterH, 3);
    }
    noStroke();
    if (step === 'erase') {
      fill(255, 150, 50); textSize(10); textAlign(LEFT, TOP);
      text(`W\u208B\u209A\u209B\u209A = kT ln 2 = ${(szT * Math.log(2)).toFixed(3)} k`, meterX, meterY + meterH + 4);
      fill(45, 215, 135); textAlign(RIGHT, TOP);
      text('Net = 0', meterX + meterW, meterY + meterH + 4);
    } else {
      fill(45, 215, 135); textSize(10); textAlign(LEFT, TOP);
      text(`W = ${W_val.toFixed(3)} k`, meterX, meterY + meterH + 4);
    }
    textAlign(LEFT, BASELINE);
  }

  // Panel title
  noStroke(); fill(200, 215, 230); textSize(12); textAlign(CENTER, BASELINE);
  text('Szilard Engine  T = ' + szT.toFixed(1), cx, bT - 36);
  textAlign(LEFT, BASELINE);
}

function drawStepDiagram() {
  const { stepX, stepW, stepT, stepH } = g;
  const step = SZ_STEPS[szStepIndex];

  // Title
  noStroke(); fill(200, 215, 230); textSize(12); textAlign(CENTER, BASELINE);
  text('Cycle Steps', stepX + stepW / 2, stepT + 14);
  textAlign(LEFT, BASELINE);

  // ── Status window ──────────────────────────────────────────────────────────
  const swX = stepX + 4;
  const swY = stepT + 22;
  const swW = stepW - 8;
  const swH = 96;

  fill(18, 26, 38); stroke(50, 65, 85); strokeWeight(1);
  rect(swX, swY, swW, swH, 4);

  // Header
  noStroke(); fill(80, 95, 115); textSize(8); textAlign(LEFT, TOP);
  text('ENGINE STATUS', swX + 6, swY + 5);

  // Vertical divider separating icon from bit cell
  const divX = swX + swW - 54;
  stroke(35, 45, 60); strokeWeight(1);
  line(divX, swY + 14, divX, swY + swH - 2);

  // ── Left: per-step icon ───────────────────────────────────────────────────
  const iconCX = swX + (swW - 54) / 2;
  const iconCY = swY + 50;

  if (step === 'observe') {
    const pulse = 180 + sin(frameCount * 0.12) * 55;
    const gR = 11;
    noFill(); stroke(45, 215, 135, pulse); strokeWeight(2);
    circle(iconCX, iconCY - 2, gR * 2);
    stroke(45, 215, 135, pulse); strokeWeight(2.5);
    line(iconCX + gR * 0.7, iconCY - 2 + gR * 0.7,
         iconCX + gR * 1.55, iconCY - 2 + gR * 1.55);
  } else if (step === 'insert') {
    // Piston bar with inward arrow
    fill(90, 105, 125); noStroke();
    rect(iconCX - 4, iconCY - 13, 8, 26, 2);
    stroke(120, 135, 155); strokeWeight(1.5); noFill();
    line(iconCX - 20, iconCY, iconCX - 6, iconCY);
    fill(120, 135, 155); noStroke();
    triangle(iconCX - 6, iconCY - 4, iconCX, iconCY, iconCX - 6, iconCY + 4);
  } else if (step === 'expand') {
    // Outward double arrows (animated)
    const pulse = 160 + sin(frameCount * 0.10) * 60;
    stroke(45, 215, 135, pulse); strokeWeight(2); noFill();
    line(iconCX + 4, iconCY, iconCX + 16, iconCY);
    line(iconCX - 4, iconCY, iconCX - 16, iconCY);
    fill(45, 215, 135, pulse); noStroke();
    triangle(iconCX + 16, iconCY - 4, iconCX + 22, iconCY, iconCX + 16, iconCY + 4);
    triangle(iconCX - 16, iconCY - 4, iconCX - 22, iconCY, iconCX - 16, iconCY + 4);
  } else { // erase
    const flashPulse = szBitFlash > 0 ? 200 + sin(frameCount * 0.2) * 55 : 120;
    const xr = szBitFlash > 0 ? 255 : 120;
    const xg = szBitFlash > 0 ? 150 :  60;
    const xb = szBitFlash > 0 ?  50 :  20;
    stroke(xr, xg, xb, flashPulse); strokeWeight(2.5); noFill();
    line(iconCX - 10, iconCY - 10, iconCX + 10, iconCY + 10);
    line(iconCX + 10, iconCY - 10, iconCX - 10, iconCY + 10);
  }

  // ── Right: 1-bit memory cell ──────────────────────────────────────────────
  const bitCellSize = 28;
  const bitX = divX + (54 - bitCellSize) / 2;
  const bitY = swY + 20;

  if (szBitFlash > 0) {
    fill(200, 100, 20); stroke(255, 150, 50); strokeWeight(1.5);
  } else if (szBitLit) {
    fill(20, 80, 60); stroke(45, 215, 135); strokeWeight(1.5);
  } else {
    fill(22, 30, 42); stroke(40, 52, 68); strokeWeight(1);
  }
  rect(bitX, bitY, bitCellSize, bitCellSize, 4);

  noStroke();
  if (szBitFlash > 0) {
    fill(255, 200, 100);
  } else if (szBitLit) {
    fill(45, 215, 135);
  } else {
    fill(50, 65, 85);
  }
  textSize(13); textAlign(CENTER, CENTER);
  text(szBitLit ? '1' : '0', bitX + bitCellSize / 2, bitY + bitCellSize / 2);

  noStroke(); fill(80, 95, 115); textSize(8); textAlign(CENTER, BASELINE);
  text('1 bit', divX + 27, bitY + bitCellSize + 11);

  // ── Status text ───────────────────────────────────────────────────────────
  const statusMain = {
    observe: 'Observing \u2014 measurement is free',
    insert:  'Piston inserted \u2014 zero work',
    expand:  szWorkProg > 0.01
      ? 'Work extracted: ' + (szT * Math.log(2) * szWorkProg).toFixed(3) + ' k'
      : 'Expanding\u2026',
    erase:   szBitFlash > 0 ? 'Erasing memory\u2026' : 'Bit reset \u2014 cost: kT ln 2',
  };
  const statusSub = {
    observe: 'Bit = ' + (szBitLit ? (szMolHalf === 'L' ? 'L' : 'R') : '?'),
    insert:  'Confined to ' + (szBitLit ? szMolHalf : '?') + ' half',
    expand:  'Isothermal: bath replenishes',
    erase:   '\u2265 kT ln 2 = ' + (szT * Math.log(2)).toFixed(3) + ' k',
  };
  const mainR = step === 'erase' ? (szBitFlash > 0 ? 255 : 220) : (step === 'expand' ? 45 : step === 'observe' ? 45 : 155);
  const mainG = step === 'erase' ? (szBitFlash > 0 ? 150 : 100) : (step === 'expand' ? 215 : step === 'observe' ? 215 : 170);
  const mainB = step === 'erase' ? (szBitFlash > 0 ?  50 :  80) : (step === 'expand' ? 135 : step === 'observe' ? 135 : 190);

  noStroke(); fill(mainR, mainG, mainB); textSize(9); textAlign(LEFT, BASELINE);
  text(statusMain[step], swX + 6, swY + swH - 19);
  fill(60, 75, 95); textSize(8);
  text(statusSub[step], swX + 6, swY + swH - 7);
  textAlign(LEFT, BASELINE);

  // ── Cycle step boxes ──────────────────────────────────────────────────────
  const n           = SZ_STEPS.length;
  const arrowW      = 14;
  const boxW        = floor((stepW - (n - 1) * arrowW - 8) / n);
  const boxH        = min(56, floor(stepH * 0.28));
  const startX      = stepX + 4;
  const boxY        = swY + swH + 12;

  for (let i = 0; i < n; i++) {
    const bx       = startX + i * (boxW + arrowW);
    const isActive = i === szStepIndex;
    const isDone   = i < szStepIndex || (szStepIndex === 0 && i === n - 1 && szCycleCount > 0);

    if (isActive) {
      fill(25, 38, 55); stroke(200, 215, 230); strokeWeight(2);
    } else if (isDone) {
      fill(20, 32, 48); stroke(50, 130, 80); strokeWeight(1);
    } else {
      fill(18, 26, 38); stroke(40, 52, 68); strokeWeight(1);
    }
    rect(bx, boxY, boxW, boxH, 4);

    const col = isActive ? [200, 215, 230] : isDone ? [45, 215, 135] : [90, 105, 125];
    noStroke(); fill(...col);
    textSize(isActive ? 10 : 9); textAlign(CENTER, CENTER);
    text(SZ_LABELS[SZ_STEPS[i]], bx + boxW / 2, boxY + boxH * 0.4);

    fill(...(isActive ? [155, 170, 190] : [90, 105, 125])); textSize(8);
    text(`${i + 1}`, bx + boxW / 2, boxY + boxH * 0.72);
    textAlign(LEFT, BASELINE);

    if (i < n - 1) {
      const ax = bx + boxW + 1;
      const ay = boxY + boxH / 2;
      fill(50, 65, 85); noStroke();
      triangle(ax, ay - 4, ax + arrowW - 4, ay, ax, ay + 4);
    }

    if (isActive && szAutoMode) {
      const pbW = (boxW - 8) * szStepProg;
      fill(45, 215, 135, 60); noStroke();
      rect(bx + 4, boxY + boxH - 6, pbW, 4, 2);
    }
  }

  // Stats below step boxes
  const statsY = boxY + boxH + 18;
  const lh = 17;
  noStroke(); textAlign(LEFT, BASELINE);

  fill(45, 215, 135); textSize(10);
  text(`W extracted = ${(szT * Math.log(2)).toFixed(3)} kT per cycle`, stepX + 4, statsY);
  fill(255, 150, 50); textSize(10);
  text(`W erased    = ${(szT * Math.log(2)).toFixed(3)} kT per cycle`, stepX + 4, statsY + lh);
  fill(45, 215, 135); textSize(10);
  text('Net work    = 0.000 kT  \u2713 Second law', stepX + 4, statsY + lh * 2);

  fill(100, 115, 135); textSize(9);
  text(`Landauer: W\u208B\u209A \u2265 kT ln 2 = ${(szT * Math.log(2)).toFixed(4)}`, stepX + 4, statsY + lh * 3);

  fill(155, 170, 190); textSize(11);
  text(`Cycles: ${szCycleCount}`, stepX + 4, statsY + lh * 4 + 4);

  // Current step description box
  const descMap = {
    observe: [
      'The demon watches the molecule and records',
      'which half (L or R) it is in right now.',
      'Observation is thermodynamically free \u2014',
      'looking costs no energy. One bit is written',
      'to memory: "molecule is on the Left side."',
    ],
    insert: [
      'A massless piston slides in from the empty',
      'half. Since nothing opposes it, no work is',
      'done. The molecule is now confined to one',
      'half of the box, ready to push back against',
      'the piston. (Real pistons have mass; idealised.)',
    ],
    expand: [
      'The confined molecule bounces off the piston',
      'and pushes it to the far wall. This is an',
      'isothermal expansion: the gas extracts work',
      'W = kT ln 2 from the heat bath. Temperature',
      'stays constant because the bath replenishes it.',
    ],
    erase: [
      'To repeat the cycle the demon must reset its',
      '1-bit memory to a known blank state.',
      'Landauer\u2019s principle: erasing 1 bit costs',
      'at least kT ln 2 of heat to the environment.',
      'This exactly cancels W_extracted. Net = 0. \u2713',
    ],
  };
  const descLines = descMap[step];
  const lineH  = 14;
  const descY  = statsY + lh * 5 + 10;
  const descBoxH = descLines.length * lineH + 14;
  fill(22, 30, 42); stroke(45, 215, 135, 80); strokeWeight(1);
  rect(stepX + 2, descY - 14, stepW - 4, descBoxH, 3);
  noStroke(); fill(155, 170, 190); textSize(10);
  for (let i = 0; i < descLines.length; i++) {
    textAlign(LEFT, TOP);
    text(descLines[i], stepX + 8, descY - 6 + i * lineH);
  }
  textAlign(LEFT, BASELINE);
}

// ─────────────────────────────────────────────────────────────────────────────
// Controls
// ─────────────────────────────────────────────────────────────────────────────
function readControls() {
  if (simMode === 'demon') {
    const newN   = parseInt(document.getElementById('ctrl-n').value);
    const newT0  = parseFloat(document.getElementById('ctrl-t0').value);
    const newMem = parseInt(document.getElementById('ctrl-memsize').value);
    const newSp  = parseFloat(document.getElementById('ctrl-demon-speed').value);

    document.getElementById('val-n').textContent        = newN;
    document.getElementById('val-t0').textContent       = newT0.toFixed(1);
    document.getElementById('val-memsize').textContent  = newMem;
    document.getElementById('val-demon-speed').textContent = newSp.toFixed(1);

    N  = newN;
    T0 = newT0;
    demonSpeed = newSp;
    if (newMem !== memSize) {
      memSize = newMem;
      memBits = new Array(memSize).fill(0);
    }
  } else {
    const newT  = parseFloat(document.getElementById('ctrl-sz-t').value);
    const newSp = parseFloat(document.getElementById('ctrl-sz-speed').value);
    szT = newT;
    szSpeed = newSp;
    document.getElementById('val-sz-t').textContent    = newT.toFixed(1);
    document.getElementById('val-sz-speed').textContent = newSp.toFixed(1);
  }
}

function setSimMode(m) {
  simMode = m;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  const modeBtn = document.getElementById(`mode-btn-${m}`);
  if (modeBtn) modeBtn.classList.add('active');

  document.getElementById('demon-controls').style.display   = (m === 'demon')   ? '' : 'none';
  document.getElementById('szilard-controls').style.display = (m === 'szilard') ? '' : 'none';

  computeGeometry();
  if (m === 'demon')   initDemon();
  if (m === 'szilard') initSzilard();
}

function setEduMode(m) {
  eduMode = m;
  document.querySelectorAll('.edu-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`edu-btn-${m}`);
  if (btn) btn.classList.add('active');
  updateEduPanel(m);
}

function resetDemon() {
  initDemon();
}

function toggleFreeze() {
  demonFrozen = !demonFrozen;
  const btn = document.getElementById('btn-freeze');
  if (btn) {
    btn.textContent = demonFrozen ? 'Thaw Demon' : 'Freeze Demon';
    btn.classList.toggle('active', demonFrozen);
  }
}

function szilardAutoBtn() {
  szAutoMode = true;
  document.getElementById('btn-sz-auto').classList.add('active');
  document.getElementById('btn-sz-step').classList.remove('active');
}

function szilardStepBtn() {
  if (szAutoMode) {
    // Switch to step mode — pause where the animation is, don't advance
    szAutoMode    = false;
    szStepPlaying = false;
    document.getElementById('btn-sz-auto').classList.remove('active');
    document.getElementById('btn-sz-step').classList.add('active');
  } else if (!szStepPlaying) {
    // Animation finished (or we're in static OBSERVE) — advance to next step
    advanceSzStep();
    szStepPlaying = true;
    updatePistonFromProgress(szStepProg);
  }
  // Clicks while szStepPlaying is true are ignored — animation in progress
}

// ─────────────────────────────────────────────────────────────────────────────
// p5 lifecycle
// ─────────────────────────────────────────────────────────────────────────────
function setup() {
  const cont = document.getElementById('canvas-container');
  createCanvas(cont.clientWidth, cont.clientHeight).parent('canvas-container');
  textFont('Courier New');
  computeGeometry();
  initDemon();
  setEduMode('demon');
  frameRate(60);
}

function windowResized() {
  const cont = document.getElementById('canvas-container');
  resizeCanvas(cont.clientWidth, cont.clientHeight);
  computeGeometry();
  if (simMode === 'demon')   initDemon();
  if (simMode === 'szilard') initSzilard();
}

function draw() {
  background(17, 24, 32);
  readControls();

  if (simMode === 'demon') {
    updateDemonPhysics();
    drawDualChamber();
    drawMemoryPanel();
  } else {
    updateSzilardStep();
    updateSzMolecule();
    drawSzilardBox();
    drawStepDiagram();
  }
}
