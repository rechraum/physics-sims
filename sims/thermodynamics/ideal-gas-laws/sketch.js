// ─────────────────────────────────────────────────────────────────────────────
// Ideal Gas Laws — sketch.js
//
// Physics (k = 1 throughout):
//   Ideal gas law: PV = NkT  →  P = N·T/V
//   Boyle:      P₁V₁ = P₂V₂  (T, N fixed — isothermal)
//   Charles:    V/T = const   (P, N fixed — isobaric)
//   Gay-Lussac: P/T = const   (V, N fixed — isochoric)
//
// Diagram axes:
//   Boyle    — P/N (= T/V) vs V  — isotherms are hyperbolas
//   Charles  — V vs T            — isobars are lines through origin
//   Gay-Lussac — P/N vs T        — isochores are lines through origin
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Edu content
// ─────────────────────────────────────────────────────────────────────────────
const EDU = {

  boyle: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Boyle's Law &mdash; Isothermal Compression</p>
        <p class="edu-description">
          At constant temperature and molecule count, pressure and volume are
          <strong>inversely proportional</strong>: double the pressure and the volume halves.
          Robert Boyle discovered this in 1662 by systematically compressing air in a
          J-shaped tube. On the P/N&thinsp;&ndash;&thinsp;V diagram, isothermal paths
          trace <em>hyperbolas</em> &mdash; each curve is a contour of constant&thinsp;T.
          Drag the <strong>V slider</strong> left and right to trace one.
        </p>
        <div class="equation">
          PV = NkT &nbsp;&rarr;&nbsp; P<sub>1</sub>V<sub>1</sub> = P<sub>2</sub>V<sub>2</sub>
          &nbsp; (T, N fixed)
        </div>
        <div class="param-hint param-hint-teal">
          Parameters set to N&thinsp;=&thinsp;50, T&thinsp;=&thinsp;2.0, V&thinsp;=&thinsp;1.5.
          Drag the <strong>V slider</strong> &mdash; the orange dot traces the T&thinsp;=&thinsp;2
          hyperbola. The teal trace shows your path on the diagram.
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">Boyle&rsquo;s law</span>
          <span class="edu-concept-tag">isothermal</span>
          <span class="edu-concept-tag">PV = const</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Scuba diving</p>
          <p>
            A diver&rsquo;s lungs hold air at ambient pressure.
            At 10&thinsp;m depth the pressure is 2&thinsp;atm, so the air volume halves
            (Boyle&rsquo;s law). Surfacing without exhaling lets the gas re-expand &mdash;
            the risk of pulmonary barotrauma is Boyle&rsquo;s law in life-or-death form.
          </p>
        </div>
      </div>
    </div>
  `,

  charles: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Charles&rsquo;s Law &mdash; Isobaric Expansion</p>
        <p class="edu-description">
          At constant pressure and molecule count, volume is <strong>proportional to
          absolute temperature</strong>.
          Jacques Charles discovered this in 1787: heat a gas held at fixed pressure and
          it expands; cool it and it contracts. The V&thinsp;&ndash;&thinsp;T diagram shows
          <em>straight lines through the origin</em> &mdash; each line is a contour of
          constant P/N. Drag the <strong>T slider</strong> while keeping V fixed, then
          also vary V proportionally to trace a Charles path (horizontal on the diagram).
        </p>
        <div class="equation">
          V / T = Nk / P = const &nbsp; (P, N fixed)
        </div>
        <div class="param-hint param-hint-teal">
          Parameters set to N&thinsp;=&thinsp;50, T&thinsp;=&thinsp;2.0, V&thinsp;=&thinsp;1.5
          (P/N&thinsp;=&thinsp;1.33). Drag <strong>T</strong> and <strong>V</strong>
          together proportionally to trace the P/N&thinsp;=&thinsp;1.33 isobar (orange dot
          moves horizontally).
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">Charles&rsquo;s law</span>
          <span class="edu-concept-tag">isobaric</span>
          <span class="edu-concept-tag">V/T = const</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Hot-air balloon</p>
          <p>
            A balloon envelope is open at the bottom &mdash; pressure stays atmospheric.
            Heating the trapped air increases its volume (Charles&rsquo;s law), lowering
            its density below that of the cooler surrounding air.
            The resulting buoyancy lifts the balloon; cooling brings it down.
          </p>
        </div>
      </div>
    </div>
  `,

  gay_lussac: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Gay-Lussac&rsquo;s Law &mdash; Isochoric Heating</p>
        <p class="edu-description">
          At constant volume and molecule count, pressure is <strong>proportional to
          absolute temperature</strong>.
          Joseph Louis Gay-Lussac discovered this in 1809: lock the piston so the gas
          can&rsquo;t expand, then heat it &mdash; molecules hit the walls harder and more
          often, so pressure climbs in direct proportion to T.
          On the P/N&thinsp;&ndash;&thinsp;T diagram, isochoric paths are
          <em>straight lines through the origin</em>.
          Drag the <strong>T slider</strong> while leaving V alone.
        </p>
        <div class="equation">
          P / T = Nk / V = const &nbsp; (V, N fixed)
        </div>
        <div class="param-hint param-hint-teal">
          Parameters set to N&thinsp;=&thinsp;50, V&thinsp;=&thinsp;1.0, T&thinsp;=&thinsp;2.0.
          Drag the <strong>T slider</strong> &mdash; the orange dot moves along the
          V&thinsp;=&thinsp;1 isochore (slope = 1/V = 1). Watch the particle colour
          shift from blue to red as temperature rises.
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">Gay-Lussac&rsquo;s law</span>
          <span class="edu-concept-tag">isochoric</span>
          <span class="edu-concept-tag">P/T = const</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Pressure cooker</p>
          <p>
            A sealed pressure cooker has fixed volume. Heating the water and steam inside
            raises the pressure above 1&thinsp;atm (Gay-Lussac&rsquo;s law), which raises
            water&rsquo;s boiling point to ~120&thinsp;&deg;C.
            Food cooks noticeably faster &mdash; every 10&thinsp;&deg;C roughly doubles
            most reaction rates.
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
let N    = 50;
let Tgas = 2.0;
let V    = 1.5;

const V_MIN = 0.5, V_MAX = 3.0;
const T_MIN = 0.5, T_MAX = 4.0;
const N_MIN = 10,  N_MAX = 80;

let eduMode = 'boyle';

// Particles (visual — wall bouncing only, no inter-particle collisions)
let particles = [];
const RADIUS = 3.5;
const DT     = 0.55;

// Diagram trace
const MAX_TRACE = 300;
let diagTrace = []; // {v, t, pn} snapshots

// ─────────────────────────────────────────────────────────────────────────────
// Geometry
// ─────────────────────────────────────────────────────────────────────────────
let g = {};

function computeGeometry() {
  const W = width, H = height;
  g.divX = floor(W * 0.46);

  const boxH   = floor(H * 0.70);
  const boxTop = floor((H - boxH) / 2);

  // Piston x-range: minPX at V_MIN, maxPX at V_MAX
  const pistonMinX = 56;
  const pistonMaxX = g.divX - 18;
  const pistonX    = pistonXforV(V, pistonMinX, pistonMaxX);

  g.box = { L: 18, T: boxTop, B: boxTop + boxH, pX: pistonX, minPX: pistonMinX, maxPX: pistonMaxX };

  // Diagram panel (right side)
  const dp = { L: 50, R: 14, T: 28, B: 50 };
  g.diag = {
    x0: g.divX + dp.L, x1: W - dp.R,
    y0: dp.T,           y1: H - dp.B,
  };
  g.diag.W = g.diag.x1 - g.diag.x0;
  g.diag.H = g.diag.y1 - g.diag.y0;
}

function pistonXforV(v_val, minPX, maxPX) {
  return floor(minPX + (maxPX - minPX) * (v_val - V_MIN) / (V_MAX - V_MIN));
}

// ─────────────────────────────────────────────────────────────────────────────
// Particles
// ─────────────────────────────────────────────────────────────────────────────
function thermalSpeed() {
  return Math.sqrt(Tgas);
}

// Blue (cold) → white (mid) → red (hot)
function thermalRGB() {
  const t = constrain((Tgas - T_MIN) / (T_MAX - T_MIN), 0, 1);
  let r, gr, b;
  if (t <= 0.5) {
    const f = t * 2;
    r = lerp(50, 220, f); gr = lerp(130, 220, f); b = 220;
  } else {
    const f = (t - 0.5) * 2;
    r = 220; gr = lerp(220, 60, f); b = lerp(220, 50, f);
  }
  return [r, gr, b];
}

function initParticles() {
  particles = [];
  const { L, T: bT, B, pX } = g.box;
  const innerW = max(pX - L - 2 * RADIUS, 1);
  const innerH = max(B  - bT - 2 * RADIUS, 1);
  const spd = thermalSpeed();
  const np  = min(N, 70);
  for (let i = 0; i < np; i++) {
    const x = L  + RADIUS + Math.random() * innerW;
    const y = bT + RADIUS + Math.random() * innerH;
    const a = Math.random() * TWO_PI;
    particles.push({ x, y, vx: spd * cos(a), vy: spd * sin(a) });
  }
}

function rescaleParticlesForV(V_new) {
  const { L, minPX, maxPX } = g.box;
  const oldPX = g.box.pX;
  const newPX = pistonXforV(V_new, minPX, maxPX);
  const oldW  = max(oldPX - L, 1);
  const newW  = max(newPX - L, 1);
  const scale = newW / oldW;
  for (const p of particles) {
    p.x = L + (p.x - L) * scale;
    p.x = constrain(p.x, L + RADIUS, newPX - RADIUS);
  }
  g.box.pX = newPX;
}

function rescaleParticlesForT(T_new) {
  const scale = Math.sqrt(T_new / max(Tgas, 0.01));
  for (const p of particles) { p.vx *= scale; p.vy *= scale; }
}

function updatePhysics() {
  const { L, T: bT, B, pX } = g.box;
  for (const p of particles) {
    p.x += p.vx * DT;
    p.y += p.vy * DT;
    if (p.x - RADIUS < L)  { p.x = L  + RADIUS; p.vx =  abs(p.vx); }
    if (p.x + RADIUS > pX) { p.x = pX - RADIUS; p.vx = -abs(p.vx); }
    if (p.y - RADIUS < bT) { p.y = bT + RADIUS; p.vy =  abs(p.vy); }
    if (p.y + RADIUS > B)  { p.y = B  - RADIUS; p.vy = -abs(p.vy); }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Controls
// ─────────────────────────────────────────────────────────────────────────────
function readControls() {
  const newN = parseInt(document.getElementById('ctrl-n').value);
  const newT = parseFloat(document.getElementById('ctrl-t').value);
  const newV = parseFloat(document.getElementById('ctrl-v').value);

  document.getElementById('val-n').textContent = newN;
  document.getElementById('val-t').textContent = newT.toFixed(2);
  document.getElementById('val-v').textContent = newV.toFixed(2);

  const P_val = newN * newT / newV;
  document.getElementById('val-p').textContent  = P_val.toFixed(1);
  document.getElementById('val-pn').textContent = (newT / newV).toFixed(3);

  // N changed — reinit
  if (newN !== N) {
    N = newN;
    initParticles();
    return;
  }
  // V changed — rescale particles, update piston
  if (abs(newV - V) > 0.005) {
    rescaleParticlesForV(newV);
    V = newV;
  }
  // T changed — rescale speeds
  if (abs(newT - Tgas) > 0.005) {
    rescaleParticlesForT(newT);
    Tgas = newT;
  }
}

function setSliders(n_val, t_val, v_val) {
  document.getElementById('ctrl-n').value = n_val;
  document.getElementById('ctrl-t').value = t_val;
  document.getElementById('ctrl-v').value = v_val;
  document.getElementById('val-n').textContent = n_val;
  document.getElementById('val-t').textContent = parseFloat(t_val).toFixed(2);
  document.getElementById('val-v').textContent = parseFloat(v_val).toFixed(2);

  N = n_val;
  // Update piston for new V before reinit
  if (abs(v_val - V) > 0.005) {
    g.box.pX = pistonXforV(v_val, g.box.minPX, g.box.maxPX);
    V = v_val;
  }
  Tgas = t_val;
  initParticles();
  diagTrace = [];
}

function setEduMode(m) {
  eduMode = m;
  document.querySelectorAll('.edu-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`edu-btn-${m}`);
  if (btn) btn.classList.add('active');

  if (m === 'boyle')      setSliders(50, 2.0, 1.5);
  if (m === 'charles')    setSliders(50, 2.0, 1.5);
  if (m === 'gay_lussac') setSliders(50, 2.0, 1.0);

  updateEduPanel(m);
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing helpers
// ─────────────────────────────────────────────────────────────────────────────
function drawDivider() {
  stroke(30, 38, 50); strokeWeight(1);
  line(g.divX, 0, g.divX, height);
}

function drawChamber() {
  const { L, T: bT, B, pX } = g.box;
  const midX = floor((L + pX) / 2);

  // Panel title
  noStroke(); fill(200, 215, 230); textSize(12); textAlign(CENTER);
  text('Gas Chamber', midX, bT - 12);
  textAlign(LEFT);

  // Fixed walls
  stroke(50, 65, 85); strokeWeight(1.5); noFill();
  line(L, bT, L, B);
  line(L, bT, pX + 2, bT);
  line(L, B,  pX + 2, B);

  // Piston — blue highlight
  stroke(88, 140, 210); strokeWeight(3.5);
  line(pX, bT, pX, B);
  // Piston grip marks
  const midPY = (bT + B) / 2;
  stroke(88, 140, 210, 140); strokeWeight(1.5);
  for (let dy = -18; dy <= 18; dy += 9) {
    line(pX - 4, midPY + dy, pX + 1, midPY + dy);
  }

  // Particles
  noStroke();
  const [cr, cg, cb] = thermalRGB();
  fill(cr, cg, cb, 210);
  for (const p of particles) {
    circle(p.x, p.y, RADIUS * 2);
  }

  // Readouts inside box
  textSize(10); textAlign(LEFT); noStroke();
  fill(45, 215, 135, 180);
  const P_val = N * Tgas / V;
  text(`P = ${P_val.toFixed(1)}`, L + 6, bT + 16);
  fill(155, 170, 190, 160); textAlign(RIGHT);
  text(`N = ${N}`, pX - 6, bT + 16);
  textAlign(LEFT);

  // State readouts below box
  const readY = B + 22;
  textSize(11); noStroke();
  fill(45, 215, 135);  text(`P = ${P_val.toFixed(2)}`,  L,       readY);
  fill(155, 170, 190); text(`V = ${V.toFixed(2)}`,       L + 72,  readY);
  fill(220, 120, 50);  text(`T = ${Tgas.toFixed(2)}`,    L + 144, readY);
  fill(155, 170, 190); text(`N = ${N}`,                  L + 216, readY);

  // Temperature annotation (particle color legend)
  const legendY = readY + 18;
  fill(50, 130, 220); textSize(9);
  text('cold', L, legendY);
  fill(220, 220, 220);
  text('warm', L + 32, legendY);
  fill(220, 60, 50);
  text('hot', L + 68, legendY);
  fill(60, 75, 95);
  text('(particle colour tracks T)', L + 92, legendY);
}

// ─── Boyle diagram: P/N vs V ─────────────────────────────────────────────────
function drawBoyleDiagram() {
  const { x0, x1, y0, y1, W: panW, H: panH } = g.diag;
  const V_lo = 0.35, V_hi = 3.3;
  const PN_lo = 0.0,  PN_hi = 9.2;

  function mapVx(v)   { return map(v,    V_lo,  V_hi,  x0, x1); }
  function mapPNy(pn) { return map(pn,   PN_lo, PN_hi, y1, y0); }

  // Title
  noStroke(); fill(200, 215, 230); textSize(12); textAlign(CENTER);
  text('P/N  vs  Volume', (x0 + x1) / 2, y0 - 10);
  textAlign(LEFT);

  // Axes
  stroke(42, 50, 62); strokeWeight(1);
  line(x0, y0, x0, y1);
  line(x0, y1, x1, y1);

  // Reference isotherms T = 0.5, 2.0, 4.0
  const isoTs = [
    { T: 0.5, r: 50,  gr: 130, b: 220 },
    { T: 2.0, r: 170, gr: 175, b: 185 },
    { T: 4.0, r: 220, gr: 75,  b: 50  },
  ];
  for (const iso of isoTs) {
    stroke(iso.r, iso.gr, iso.b, 80); strokeWeight(1.2); noFill();
    beginShape();
    for (let px = 0; px <= panW; px += 3) {
      const v  = map(px, 0, panW, V_lo, V_hi);
      const pn = iso.T / v;
      if (pn < PN_lo || pn > PN_hi) continue;
      vertex(x0 + px, mapPNy(pn));
    }
    endShape();
    // Label
    const lv = V_hi * 0.85;
    const lpn = iso.T / lv;
    if (lpn >= PN_lo && lpn <= PN_hi) {
      noStroke(); fill(iso.r, iso.gr, iso.b, 120); textSize(9); textAlign(LEFT);
      text(`T=${iso.T}`, mapVx(lv) + 3, mapPNy(lpn) - 3);
    }
  }

  // Current isotherm (dashed)
  drawingContext.setLineDash([5, 5]);
  stroke(255, 190, 60, 180); strokeWeight(1.5); noFill();
  beginShape();
  for (let px = 0; px <= panW; px += 3) {
    const v  = map(px, 0, panW, V_lo, V_hi);
    const pn = Tgas / v;
    if (pn < PN_lo || pn > PN_hi) continue;
    vertex(x0 + px, mapPNy(pn));
  }
  endShape();
  drawingContext.setLineDash([]);

  // Trace
  if (diagTrace.length > 1) {
    stroke(45, 215, 135, 110); strokeWeight(1.5); noFill();
    beginShape();
    for (const pt of diagTrace) {
      const cx = mapVx(pt.v);
      const cy = mapPNy(pt.v > 0 ? pt.t / pt.v : PN_hi);
      if (cy >= y0 && cy <= y1) vertex(cx, cy);
    }
    endShape();
  }

  // State point
  const cur_pn = Tgas / V;
  const cx = mapVx(V);
  const cy = mapPNy(cur_pn);
  // Crosshairs
  stroke(255, 150, 50, 110); strokeWeight(0.8);
  drawingContext.setLineDash([3, 4]);
  line(x0, cy, cx, cy);
  line(cx, y1, cx, cy);
  drawingContext.setLineDash([]);
  noStroke(); fill(255, 150, 50);
  circle(cx, cy, 11);

  // Axes ticks + labels
  textSize(9); textAlign(CENTER);
  const nVticks = 5;
  for (let i = 0; i <= nVticks; i++) {
    const v  = V_lo + i * (V_hi - V_lo) / nVticks;
    const px = mapVx(v);
    stroke(42, 50, 62); strokeWeight(1);
    line(px, y1, px, y1 + 4);
    noStroke(); fill(155, 170, 190);
    text(v.toFixed(1), px, y1 + 13);
  }
  noStroke(); fill(155, 170, 190); textSize(9); textAlign(RIGHT);
  text('V', x1, y1 + 13);

  const nPticks = 5;
  for (let i = 0; i <= nPticks; i++) {
    const pn = PN_lo + i * (PN_hi - PN_lo) / nPticks;
    const py = mapPNy(pn);
    stroke(42, 50, 62); strokeWeight(1);
    line(x0 - 4, py, x0, py);
    noStroke(); fill(155, 170, 190); textSize(9); textAlign(RIGHT);
    text(pn.toFixed(1), x0 - 6, py + 3);
  }

  push();
  translate(x0 - 36, y0 + panH * 0.5);
  rotate(-HALF_PI);
  noStroke(); fill(155, 170, 190); textSize(9); textAlign(CENTER);
  text('P / N', 0, 0);
  pop();
}

// ─── Charles diagram: V vs T ─────────────────────────────────────────────────
function drawCharlesDiagram() {
  const { x0, x1, y0, y1, W: panW, H: panH } = g.diag;
  const T_lo = 0.3, T_hi = 4.3;
  const V_lo = 0.0, V_hi = 3.4;

  function mapTx(t)  { return map(t, T_lo, T_hi, x0, x1); }
  function mapVy(v)  { return map(v, V_lo, V_hi, y1, y0); }

  // Title
  noStroke(); fill(200, 215, 230); textSize(12); textAlign(CENTER);
  text('Volume  vs  Temperature', (x0 + x1) / 2, y0 - 10);
  textAlign(LEFT);

  // Axes
  stroke(42, 50, 62); strokeWeight(1);
  line(x0, y0, x0, y1);
  line(x0, y1, x1, y1);

  // Isobars: V = (P/N_ref) * T  for P/N = 0.5, 1.0, 1.5, 2.5
  const isobars = [
    { pn: 0.5,  r: 50,  gr: 130, b: 220 },
    { pn: 1.33, r: 170, gr: 175, b: 185 },
    { pn: 2.5,  r: 220, gr: 75,  b: 50  },
  ];
  for (const iso of isobars) {
    stroke(iso.r, iso.gr, iso.b, 80); strokeWeight(1.2); noFill();
    beginShape();
    for (let px = 0; px <= panW; px += 4) {
      const t = map(px, 0, panW, T_lo, T_hi);
      const v = iso.pn * t;
      if (v < V_lo || v > V_hi) continue;
      vertex(x0 + px, mapVy(v));
    }
    endShape();
    // Label at right edge
    const lt = T_hi * 0.85;
    const lv = iso.pn * lt;
    if (lv >= V_lo && lv <= V_hi) {
      noStroke(); fill(iso.r, iso.gr, iso.b, 120); textSize(9); textAlign(LEFT);
      text(`P/N=${iso.pn.toFixed(2)}`, mapTx(lt) + 3, mapVy(lv) - 3);
    }
  }

  // Current isobar (dashed) — P/N = Tgas/V
  const cur_pn = Tgas / V;
  drawingContext.setLineDash([5, 5]);
  stroke(255, 190, 60, 180); strokeWeight(1.5); noFill();
  beginShape();
  for (let px = 0; px <= panW; px += 4) {
    const t = map(px, 0, panW, T_lo, T_hi);
    const v = cur_pn * t;
    if (v < V_lo || v > V_hi) continue;
    vertex(x0 + px, mapVy(v));
  }
  endShape();
  drawingContext.setLineDash([]);

  // Trace
  if (diagTrace.length > 1) {
    stroke(45, 215, 135, 110); strokeWeight(1.5); noFill();
    beginShape();
    for (const pt of diagTrace) {
      const cx = mapTx(pt.t);
      const cy = mapVy(pt.v);
      if (cy >= y0 && cy <= y1 && cx >= x0 && cx <= x1) vertex(cx, cy);
    }
    endShape();
  }

  // State point
  const cx = mapTx(Tgas);
  const cy = mapVy(V);
  stroke(255, 150, 50, 110); strokeWeight(0.8);
  drawingContext.setLineDash([3, 4]);
  line(x0, cy, cx, cy);
  line(cx, y1, cx, cy);
  drawingContext.setLineDash([]);
  noStroke(); fill(255, 150, 50);
  circle(cx, cy, 11);

  // Axes ticks + labels
  textSize(9); textAlign(CENTER);
  const nTticks = 5;
  for (let i = 0; i <= nTticks; i++) {
    const t  = T_lo + i * (T_hi - T_lo) / nTticks;
    const px = mapTx(t);
    stroke(42, 50, 62); strokeWeight(1);
    line(px, y1, px, y1 + 4);
    noStroke(); fill(155, 170, 190);
    text(t.toFixed(1), px, y1 + 13);
  }
  noStroke(); fill(155, 170, 190); textSize(9); textAlign(RIGHT);
  text('T', x1, y1 + 13);

  const nVticks = 5;
  for (let i = 0; i <= nVticks; i++) {
    const v  = V_lo + i * (V_hi - V_lo) / nVticks;
    const py = mapVy(v);
    stroke(42, 50, 62); strokeWeight(1);
    line(x0 - 4, py, x0, py);
    noStroke(); fill(155, 170, 190); textSize(9); textAlign(RIGHT);
    text(v.toFixed(1), x0 - 6, py + 3);
  }

  push();
  translate(x0 - 36, y0 + panH * 0.5);
  rotate(-HALF_PI);
  noStroke(); fill(155, 170, 190); textSize(9); textAlign(CENTER);
  text('V', 0, 0);
  pop();
}

// ─── Gay-Lussac diagram: P/N vs T ────────────────────────────────────────────
function drawGayLussacDiagram() {
  const { x0, x1, y0, y1, W: panW, H: panH } = g.diag;
  const T_lo  = 0.3, T_hi  = 4.3;
  const PN_lo = 0.0, PN_hi = 9.2;

  function mapTx(t)   { return map(t,  T_lo,  T_hi,  x0, x1); }
  function mapPNy(pn) { return map(pn, PN_lo, PN_hi, y1, y0); }

  // Title
  noStroke(); fill(200, 215, 230); textSize(12); textAlign(CENTER);
  text('P/N  vs  Temperature', (x0 + x1) / 2, y0 - 10);
  textAlign(LEFT);

  // Axes
  stroke(42, 50, 62); strokeWeight(1);
  line(x0, y0, x0, y1);
  line(x0, y1, x1, y1);

  // Isochores: P/N = T/V_iso  (lines through origin, slope = 1/V_iso)
  const isochores = [
    { V_iso: 3.0, r: 50,  gr: 130, b: 220 },
    { V_iso: 1.5, r: 170, gr: 175, b: 185 },
    { V_iso: 0.75, r: 220, gr: 75,  b: 50 },
  ];
  for (const iso of isochores) {
    stroke(iso.r, iso.gr, iso.b, 80); strokeWeight(1.2); noFill();
    beginShape();
    for (let px = 0; px <= panW; px += 4) {
      const t  = map(px, 0, panW, T_lo, T_hi);
      const pn = t / iso.V_iso;
      if (pn < PN_lo || pn > PN_hi) continue;
      vertex(x0 + px, mapPNy(pn));
    }
    endShape();
    // Label
    const lt = T_hi * 0.75;
    const lpn = lt / iso.V_iso;
    if (lpn >= PN_lo && lpn <= PN_hi) {
      noStroke(); fill(iso.r, iso.gr, iso.b, 120); textSize(9); textAlign(LEFT);
      text(`V=${iso.V_iso}`, mapTx(lt) + 3, mapPNy(lpn) - 3);
    }
  }

  // Current isochore (dashed)
  drawingContext.setLineDash([5, 5]);
  stroke(255, 190, 60, 180); strokeWeight(1.5); noFill();
  beginShape();
  for (let px = 0; px <= panW; px += 4) {
    const t  = map(px, 0, panW, T_lo, T_hi);
    const pn = t / V;
    if (pn < PN_lo || pn > PN_hi) continue;
    vertex(x0 + px, mapPNy(pn));
  }
  endShape();
  drawingContext.setLineDash([]);

  // Trace
  if (diagTrace.length > 1) {
    stroke(45, 215, 135, 110); strokeWeight(1.5); noFill();
    beginShape();
    for (const pt of diagTrace) {
      const cx = mapTx(pt.t);
      const cy = mapPNy(pt.v > 0 ? pt.t / pt.v : PN_hi);
      if (cy >= y0 && cy <= y1 && cx >= x0 && cx <= x1) vertex(cx, cy);
    }
    endShape();
  }

  // State point
  const cur_pn = Tgas / V;
  const cx = mapTx(Tgas);
  const cy = mapPNy(cur_pn);
  stroke(255, 150, 50, 110); strokeWeight(0.8);
  drawingContext.setLineDash([3, 4]);
  line(x0, cy, cx, cy);
  line(cx, y1, cx, cy);
  drawingContext.setLineDash([]);
  noStroke(); fill(255, 150, 50);
  circle(cx, cy, 11);

  // Axes ticks + labels
  textSize(9); textAlign(CENTER);
  const nTticks = 5;
  for (let i = 0; i <= nTticks; i++) {
    const t  = T_lo + i * (T_hi - T_lo) / nTticks;
    const px = mapTx(t);
    stroke(42, 50, 62); strokeWeight(1);
    line(px, y1, px, y1 + 4);
    noStroke(); fill(155, 170, 190);
    text(t.toFixed(1), px, y1 + 13);
  }
  noStroke(); fill(155, 170, 190); textSize(9); textAlign(RIGHT);
  text('T', x1, y1 + 13);

  const nPticks = 5;
  for (let i = 0; i <= nPticks; i++) {
    const pn = PN_lo + i * (PN_hi - PN_lo) / nPticks;
    const py = mapPNy(pn);
    stroke(42, 50, 62); strokeWeight(1);
    line(x0 - 4, py, x0, py);
    noStroke(); fill(155, 170, 190); textSize(9); textAlign(RIGHT);
    text(pn.toFixed(1), x0 - 6, py + 3);
  }

  push();
  translate(x0 - 36, y0 + panH * 0.5);
  rotate(-HALF_PI);
  noStroke(); fill(155, 170, 190); textSize(9); textAlign(CENTER);
  text('P / N', 0, 0);
  pop();
}

// ─────────────────────────────────────────────────────────────────────────────
// p5 lifecycle
// ─────────────────────────────────────────────────────────────────────────────
function setup() {
  const cont = document.getElementById('canvas-container');
  createCanvas(cont.clientWidth, cont.clientHeight).parent('canvas-container');
  textFont('Courier New');
  computeGeometry();
  initParticles();
  setEduMode('boyle');
}

function windowResized() {
  const cont = document.getElementById('canvas-container');
  resizeCanvas(cont.clientWidth, cont.clientHeight);
  computeGeometry();
  initParticles();
}

function draw() {
  background(17, 24, 32);

  readControls();
  updatePhysics();

  // Record state for trace (every 3 frames to avoid over-density)
  if (frameCount % 3 === 0) {
    diagTrace.push({ v: V, t: Tgas });
    if (diagTrace.length > MAX_TRACE) diagTrace.shift();
  }

  drawDivider();
  drawChamber();

  if (eduMode === 'boyle')      drawBoyleDiagram();
  else if (eduMode === 'charles')    drawCharlesDiagram();
  else if (eduMode === 'gay_lussac') drawGayLussacDiagram();
}
