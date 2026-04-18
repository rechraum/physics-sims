// ─────────────────────────────────────────────────────────────────────────────
// Carnot Engine — sketch.js
//
// Physics (N=1, k=1 throughout):
//   4-stroke ideal gas cycle: isothermal expansion → adiabatic expansion →
//   isothermal compression → adiabatic compression
//   η_Carnot = 1 − T_C/T_H
//   Irreversible model: T_H_eff = T_H(1−δ), T_C_eff = T_C(1+δ)
//   ΔS_total = −Q_H/T_H + Q_C/T_C  (0 ideal, >0 real)
//   η_CA = 1 − √(T_C/T_H)  (max-power Curzon-Ahlborn efficiency)
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

// ── Constants ──────────────────────────────────────────────────────────────────
const GAMMA    = 5 / 3;      // monatomic ideal gas
const R_EXPAND = 2.5;        // V_B / V_A (expansion ratio)
const N_CURVE  = 60;         // points per stroke curve

// ── Edu content ────────────────────────────────────────────────────────────────
const EDU = {

  carnot: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">The Carnot Engine</p>
        <p class="edu-description">
          <strong>Temperature</strong> is the average kinetic energy of molecules. <strong>Heat</strong>
          flows when two objects at different temperatures touch &mdash; always from hot to cold, never
          the reverse. An <strong>engine</strong> sits between a hot source and a cold sink, letting heat
          flow &ldquo;downhill&rdquo; through it while capturing some as <strong>useful work</strong>
          (a turning shaft, a moving piston, electricity).
        </p>
        <p class="edu-description">
          Sadi Carnot (1824) asked: what is the maximum fraction of Q<sub>H</sub> that can
          become work? His answer &mdash; &eta;&thinsp;=&thinsp;1&thinsp;&minus;&thinsp;T<sub>C</sub>/T<sub>H</sub>
          &mdash; depends only on reservoir temperatures. Raise T<sub>H</sub> or lower T<sub>C</sub>
          to extract more work from the same fuel. This bound cannot be beaten &mdash; it follows
          directly from the second law of thermodynamics.
        </p>
        <div class="equation">
          &eta;<sub>Carnot</sub> = 1 &minus; T<sub>C</sub>/T<sub>H</sub>
          &nbsp;&nbsp; W<sub>net</sub> = Q<sub>H</sub> &minus; Q<sub>C</sub>
        </div>
        <div class="param-hint param-hint-teal">
          T<sub>H</sub>&thinsp;=&thinsp;600&thinsp;K, T<sub>C</sub>&thinsp;=&thinsp;300&thinsp;K,
          Reversible mode &mdash; &eta;&thinsp;=&thinsp;50%.
          The teal dot traces the P-V cycle. Adjust T<sub>H</sub>/T<sub>C</sub> to see
          efficiency change.
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">Carnot cycle</span>
          <span class="edu-concept-tag">thermodynamic efficiency</span>
          <span class="edu-concept-tag">P-V diagram</span>
          <span class="edu-concept-tag">second law</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Real power plants</p>
          <p>
            A coal power plant operates between ~600&deg;C (873&thinsp;K) and ~30&deg;C (303&thinsp;K)
            &mdash; a Carnot ceiling of 65%. Modern supercritical plants reach ~45%, close to the
            Curzon-Ahlborn maximum-power efficiency of ~41%. The gap is friction, heat leaks, and
            finite-speed heat exchange. A car engine (T<sub>H</sub>&thinsp;&asymp;&thinsp;2000&thinsp;K)
            has a Carnot ceiling of 85%; real engines achieve 25&ndash;35%.
          </p>
        </div>
      </div>
    </div>
  `,

  entropy: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Entropy: the Cost of Irreversibility</p>
        <p class="edu-description">
          <strong>Entropy</strong> is what you create whenever a process is irreversible &mdash;
          whenever you cannot run it backward and recover everything. Friction creates entropy.
          Heat leaking across a large temperature gap creates entropy. Every joule of entropy
          created is a joule of work you <em>could have extracted but didn&rsquo;t</em>.
          Entropy is not just disorder &mdash; it is <em>lost opportunity</em>.
        </p>
        <p class="edu-description">
          In the Entropy Scorecard (right panel), watch &Delta;S<sub>total</sub>. It is
          exactly zero in Reversible mode &mdash; the engine is a perfect entropy conduit,
          passing what the hot source loses to the cold sink unchanged. Switch to Real Engine:
          &Delta;S<sub>total</sub> turns positive every cycle. The &ldquo;Work lost&rdquo; line
          shows exactly how much work was sacrificed: W<sub>lost</sub>&thinsp;=&thinsp;T<sub>C</sub>&thinsp;&times;&thinsp;&Delta;S<sub>irr</sub>.
        </p>
        <div class="equation">
          &Delta;S<sub>total</sub> = &minus;Q<sub>H</sub>/T<sub>H</sub> + Q<sub>C</sub>/T<sub>C</sub>
          &nbsp;&ge;&nbsp; 0
          &nbsp;&nbsp; W<sub>lost</sub> = T<sub>C</sub>&thinsp;&middot;&thinsp;&Delta;S<sub>irr</sub>
        </div>
        <div class="param-hint param-hint-teal">
          T<sub>H</sub>&thinsp;=&thinsp;600&thinsp;K, T<sub>C</sub>&thinsp;=&thinsp;300&thinsp;K,
          Real Engine, &delta;&thinsp;=&thinsp;0.25.
          &eta;<sub>real</sub>&thinsp;&lt;&thinsp;&eta;<sub>Carnot</sub>. The orange
          &Delta;S<sub>total</sub> shows entropy produced each cycle.
          Drag the &delta; slider toward 0 to approach reversibility.
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">entropy production</span>
          <span class="edu-concept-tag">irreversibility</span>
          <span class="edu-concept-tag">Gouy-Stodola theorem</span>
          <span class="edu-concept-tag">Curzon-Ahlborn</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Gouy-Stodola theorem (1889)</p>
          <p>
            The work lost in any process equals T<sub>C</sub> times the entropy generated.
            This gives engineers a direct monetary value for irreversibility: every unit of
            entropy created in a power plant is kilowatt-hours not sold. The Curzon-Ahlborn
            efficiency &eta;<sub>CA</sub>&thinsp;=&thinsp;1&thinsp;&minus;&thinsp;&radic;(T<sub>C</sub>/T<sub>H</sub>)
            is the efficiency at <em>maximum power output</em> &mdash; what real engines
            optimise for, not maximum efficiency.
          </p>
        </div>
      </div>
    </div>
  `,

  arrowtime: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Why You Can&rsquo;t Run It Backward</p>
        <p class="edu-description">
          The laws of physics at the microscopic level are <strong>time-symmetric</strong>: a video
          of molecules colliding played backward is perfectly valid physics. Yet a video of an
          engine running backward &mdash; heat flowing from cold to hot, exhaust becoming fuel
          &mdash; is never observed. Why?
        </p>
        <p class="edu-description">
          The Carnot cycle <em>can</em> be run in reverse: it becomes a
          <strong>refrigerator</strong>, pumping heat from cold to hot by consuming work. But that
          requires a work input &mdash; it doesn&rsquo;t happen spontaneously. The reason is entropy.
          Running the engine forward conserves entropy (ideal) or creates it (real). Running a
          <em>real</em> irreversible engine backward would <em>decrease</em> entropy &mdash;
          overwhelmingly improbable for the same statistical reasons as in Entropy &amp; Microstates:
          the &ldquo;backward&rdquo; trajectory is 1 microstate in 10<sup>N</sup> forward ones.
          The arrow of time is not built into microscopic laws &mdash; it <em>emerges</em> from
          the second law.
        </p>
        <div class="equation">
          &Delta;S<sub>universe</sub> &ge; 0 &nbsp;&larr;&nbsp; the arrow of time
          &nbsp;&nbsp; Refrigerator: W<sub>in</sub> = Q<sub>H</sub> &minus; Q<sub>C</sub> &gt; 0
        </div>
        <div class="param-hint param-hint-teal">
          T<sub>H</sub>&thinsp;=&thinsp;800&thinsp;K, T<sub>C</sub>&thinsp;=&thinsp;200&thinsp;K,
          Reversible mode &mdash; &eta;&thinsp;=&thinsp;75%.
          &Delta;S<sub>total</sub>&thinsp;=&thinsp;0: a perfect entropy conduit. Switch to
          Real Engine and raise &delta; to see the arrow of time in action: entropy
          accumulates and cannot be undone.
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">arrow of time</span>
          <span class="edu-concept-tag">time-reversal symmetry</span>
          <span class="edu-concept-tag">refrigerator</span>
          <span class="edu-concept-tag">second law</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Black holes &amp; the arrow of time</p>
          <p>
            Black holes are the ultimate thermodynamic objects. Stephen Hawking showed a black
            hole has entropy proportional to its surface area (Bekenstein-Hawking entropy).
            Black hole evaporation via Hawking radiation is thermodynamic &mdash; the
            universe&rsquo;s entropy still increases. Even at the most extreme scales,
            &Delta;S<sub>universe</sub>&thinsp;&ge;&thinsp;0 holds.
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

// ── State ──────────────────────────────────────────────────────────────────────
let TH = 600, TC = 300;
let engineMode = 'reversible';  // 'reversible' | 'real'
let delta      = 0.25;
let cycleSpeedMult = 1.0;
let paused     = false;
let eduMode    = 'carnot';

// Physics (N=1, k=1)
let TH_eff, TC_eff;
let VA, VB, VC, VD, PA, PB, PC, PD;          // actual cycle state points
let gVA, gVB, gVC, gVD, gPA, gPB, gPC, gPD;  // ideal (ghost) cycle state points
let QH, QC, WNet, etaCarnot, etaCA, etaReal;
let dS_hot, dS_cold, dS_total;
let Vmin, Vmax, Pmin, Pmax;                   // P-V axis ranges

// Animation
let cycleT  = 0;      // position in cycle [0, 4)
let cycleCount     = 0;
let totalWorkAccum = 0;

const TRAIL_LEN  = 40;
const PULSE_FRAMES = 30;
let trail      = [];
let pulseTimer = 0;

// Geometry
let g = {};

// ── Physics computation ────────────────────────────────────────────────────────
function statePoints(Th, Tc) {
  const vA = 1.0;
  const vB = vA * R_EXPAND;
  const expR = Math.pow(Th / Tc, 1 / (GAMMA - 1));  // (TH/TC)^(3/2)
  const vC = vB * expR;
  const vD = vA * expR;
  return {
    vA, vB, vC, vD,
    pA: Th / vA,
    pB: Th / vB,
    pC: Tc / vC,
    pD: Tc / vD,
  };
}

function computePhysics() {
  TH_eff = (engineMode === 'real') ? TH * (1 - delta) : TH;
  TC_eff = (engineMode === 'real') ? TC * (1 + delta) : TC;
  // Guard against degenerate case
  if (TC_eff >= TH_eff * 0.99) TC_eff = TH_eff * 0.99;

  const sp  = statePoints(TH_eff, TC_eff);
  VA = sp.vA; VB = sp.vB; VC = sp.vC; VD = sp.vD;
  PA = sp.pA; PB = sp.pB; PC = sp.pC; PD = sp.pD;

  const gsp = statePoints(TH, TC);
  gVA = gsp.vA; gVB = gsp.vB; gVC = gsp.vC; gVD = gsp.vD;
  gPA = gsp.pA; gPB = gsp.pB; gPC = gsp.pC; gPD = gsp.pD;

  // Energy (N=1, k=1)
  QH   = TH_eff * Math.log(R_EXPAND);
  QC   = TC_eff * Math.log(R_EXPAND);
  WNet = QH - QC;

  etaCarnot = 1 - TC / TH;
  etaCA     = 1 - Math.sqrt(TC / TH);
  etaReal   = (QH > 1e-9) ? WNet / QH : 0;

  // Entropy balance (reservoirs at actual TH, TC)
  dS_hot   = -QH / TH;
  dS_cold  =  QC / TC;
  dS_total = dS_hot + dS_cold;

  // P-V axis ranges: include both cycles plus margins
  const allV = [VA, VB, VC, VD, gVA, gVB, gVC, gVD];
  const allP = [PA, PB, PC, PD, gPA, gPB, gPC, gPD];
  const m = 0.14;
  Vmin = Math.min(...allV) * (1 - m);
  Vmax = Math.max(...allV) * (1 + m);
  Pmin = Math.min(...allP) * (1 - m);
  Pmax = Math.max(...allP) * (1 + m);
}

// ── Geometry ───────────────────────────────────────────────────────────────────
function computeGeometry() {
  const cW = width, cH = height;
  const divX = Math.floor(cW * 0.55);

  // P-V diagram panel (left)
  g.pvL  = 54;
  g.pvR  = divX - 14;
  g.pvT  = 26;
  g.pvB  = cH - 40;
  g.divX = divX;

  // Right panel: engine diagram top ~54%, scorecard bottom ~46%
  const rL   = divX + 14;
  const rR   = cW - 10;
  const midY = Math.floor(cH * 0.53);

  g.engL = rL; g.engR = rR;
  g.engT = 8;  g.engB = midY - 8;

  g.scL = rL; g.scR = rR;
  g.scT = midY + 6; g.scB = cH - 6;

  g.rightDivY = midY;
}

// ── P-V coordinate helpers ─────────────────────────────────────────────────────
function vToX(v) {
  return g.pvL + (g.pvR - g.pvL) * (v - Vmin) / (Vmax - Vmin);
}
function pToY(p) {
  return g.pvB - (g.pvB - g.pvT) * (p - Pmin) / (Pmax - Pmin);
}

// Get (V, P) at cycle parameter t ∈ [0, 4)
function getCycleVP(t) {
  const s = Math.min(3, Math.floor(t));
  const u = t - Math.floor(t);
  let V, P;
  if (s === 0) {               // A→B  isothermal at TH_eff
    V = VA + (VB - VA) * u;
    P = TH_eff / V;
  } else if (s === 1) {        // B→C  adiabatic expansion
    V = VB + (VC - VB) * u;
    P = (PB * Math.pow(VB, GAMMA)) / Math.pow(V, GAMMA);
  } else if (s === 2) {        // C→D  isothermal at TC_eff
    V = VC + (VD - VC) * u;
    P = TC_eff / V;
  } else {                     // D→A  adiabatic compression
    V = VD + (VA - VD) * u;
    P = (PD * Math.pow(VD, GAMMA)) / Math.pow(V, GAMMA);
  }
  return { V, P };
}

// Sample one stroke as [[sx, sy], ...] for the given state-points
function sampleStroke(s, vA_, vB_, vC_, vD_, pA_, pB_, pC_, pD_, Th, Tc) {
  const pts = [];
  for (let i = 0; i <= N_CURVE; i++) {
    const u = i / N_CURVE;
    let V, P;
    if (s === 0) {
      V = vA_ + (vB_ - vA_) * u;
      P = Th / V;
    } else if (s === 1) {
      V = vB_ + (vC_ - vB_) * u;
      P = (pB_ * Math.pow(vB_, GAMMA)) / Math.pow(V, GAMMA);
    } else if (s === 2) {
      V = vC_ + (vD_ - vC_) * u;
      P = Tc / V;
    } else {
      V = vD_ + (vA_ - vD_) * u;
      P = (pD_ * Math.pow(vD_, GAMMA)) / Math.pow(V, GAMMA);
    }
    pts.push([vToX(V), pToY(P)]);
  }
  return pts;
}

// ── Draw helpers ───────────────────────────────────────────────────────────────
function drawStrokeCurve(pts, r, g_, b, alpha, sw, dashed) {
  stroke(r, g_, b, alpha);
  strokeWeight(sw);
  noFill();
  if (dashed) drawingContext.setLineDash([5, 4]);
  beginShape();
  for (const [sx, sy] of pts) vertex(sx, sy);
  endShape();
  if (dashed) drawingContext.setLineDash([]);
}

function drawFilledCycle(vA_, vB_, vC_, vD_, pA_, pB_, pC_, pD_, Th, Tc, alpha) {
  fill(45, 215, 135, alpha);
  noStroke();
  beginShape();
  for (let s = 0; s < 4; s++) {
    const pts = sampleStroke(s, vA_, vB_, vC_, vD_, pA_, pB_, pC_, pD_, Th, Tc);
    for (const [sx, sy] of pts) vertex(sx, sy);
  }
  endShape(CLOSE);
}

// ── Draw: P-V diagram ─────────────────────────────────────────────────────────
function drawPVDiagram() {
  const pvW = g.pvR - g.pvL;
  const pvH = g.pvB - g.pvT;

  // ── Axes ──
  stroke(50, 65, 85); strokeWeight(1); noFill();
  line(g.pvL, g.pvB, g.pvR, g.pvB);  // V axis
  line(g.pvL, g.pvT, g.pvL, g.pvB);  // P axis

  // Tick marks — V axis
  textSize(9); fill(155, 170, 190); noStroke(); textAlign(CENTER, TOP);
  const nVticks = 5;
  for (let i = 0; i <= nVticks; i++) {
    const v = Vmin + (Vmax - Vmin) * i / nVticks;
    const sx = vToX(v);
    stroke(50, 65, 85); strokeWeight(1);
    line(sx, g.pvB, sx, g.pvB + 4);
    noStroke(); fill(155, 170, 190);
    text(v.toFixed(1), sx, g.pvB + 6);
  }
  // Tick marks — P axis
  textAlign(RIGHT, CENTER);
  const nPticks = 5;
  for (let i = 0; i <= nPticks; i++) {
    const p = Pmin + (Pmax - Pmin) * i / nPticks;
    const sy = pToY(p);
    stroke(50, 65, 85); strokeWeight(1);
    line(g.pvL - 4, sy, g.pvL, sy);
    noStroke(); fill(155, 170, 190);
    text(p.toFixed(0), g.pvL - 6, sy);
  }

  // Axis labels
  noStroke(); textSize(10); fill(155, 170, 190);
  textAlign(CENTER, BOTTOM);
  text('Volume V  (N=1, k=1)', g.pvL + pvW * 0.5, g.pvB + 28);
  push();
  translate(g.pvL - 40, g.pvT + pvH * 0.5);
  rotate(-HALF_PI);
  textAlign(CENTER, BOTTOM);
  text('Pressure P', 0, 0);
  pop();

  // ── Ghost cycle (ideal) shown in irreversible mode ──
  if (engineMode === 'real') {
    const alpha = 80;
    for (let s = 0; s < 4; s++) {
      const pts = sampleStroke(s, gVA, gVB, gVC, gVD, gPA, gPB, gPC, gPD, TH, TC);
      drawStrokeCurve(pts, 80, 95, 115, alpha, 1.2, true);
    }
    // Ghost state points
    const ghostPts = [
      [vToX(gVA), pToY(gPA)], [vToX(gVB), pToY(gPB)],
      [vToX(gVC), pToY(gPC)], [vToX(gVD), pToY(gPD)]
    ];
    for (const [sx, sy] of ghostPts) {
      fill(80, 95, 115, 90); noStroke();
      circle(sx, sy, 6);
    }
  }

  // ── Filled interior (net work area) ──
  drawFilledCycle(VA, VB, VC, VD, PA, PB, PC, PD, TH_eff, TC_eff, 18);

  // ── Stroke curves ──
  const STROKE_COLORS = [
    [220, 60,  50,  255],   // A→B  red
    [255, 150, 50,  255],   // B→C  orange
    [50,  130, 220, 255],   // C→D  blue
    [88,  166, 255, 255],   // D→A  accent blue
  ];
  for (let s = 0; s < 4; s++) {
    const pts = sampleStroke(s, VA, VB, VC, VD, PA, PB, PC, PD, TH_eff, TC_eff);
    const [r, gr, b, a] = STROKE_COLORS[s];
    drawStrokeCurve(pts, r, gr, b, a, 2.0, false);
  }

  // ── State points A, B, C, D ──
  const statePts = [
    { V: VA, P: PA, label: 'A', ox: -12, oy: -10 },
    { V: VB, P: PB, label: 'B', ox:   6, oy: -10 },
    { V: VC, P: PC, label: 'C', ox:   6, oy:   8 },
    { V: VD, P: PD, label: 'D', ox: -14, oy:   8 },
  ];
  for (const { V, P, label, ox, oy } of statePts) {
    const sx = vToX(V), sy = pToY(P);
    fill(220, 220, 220); noStroke();
    circle(sx, sy, 8);
    fill(200, 215, 230); textSize(11); textAlign(CENTER, CENTER);
    text(label, sx + ox, sy + oy);
  }

  // ── Stroke labels (midpoints) ──
  const strokeLabels = [
    { s: 0, label: 'Isothermal (T_H)', ox: -5, oy: -13 },
    { s: 1, label: 'Adiabatic \u2193',  ox: 10, oy:   0 },
    { s: 2, label: 'Isothermal (T_C)', ox:  0, oy:  13 },
    { s: 3, label: 'Adiabatic \u2191',  ox:-10, oy:   0 },
  ];
  const strokeCols = [[220,60,50],[255,150,50],[50,130,220],[88,166,255]];
  for (const { s, label, ox, oy } of strokeLabels) {
    const { V, P } = getCycleVP(s + 0.5);
    const sx = vToX(V), sy = pToY(P);
    const [r, gr, b] = strokeCols[s];
    fill(r, gr, b, 200); noStroke(); textSize(9); textAlign(CENTER, CENTER);
    text(label, sx + ox, sy + oy);
  }

  // ── "W = X.X k" label inside area ──
  {
    const cx = (vToX(VA) + vToX(VC)) * 0.5;
    const cy = (pToY(PA) + pToY(PC)) * 0.5;
    fill(45, 215, 135, 180); noStroke(); textSize(10); textAlign(CENTER, CENTER);
    text(`W = ${WNet.toFixed(2)} k`, cx, cy);
  }

  // ── Animated trail ──
  noStroke();
  for (let i = 0; i < trail.length; i++) {
    const t_ = i / trail.length;
    fill(45, 215, 135, t_ * 180);
    circle(trail[i].x, trail[i].y, t_ * 7 + 1);
  }

  // ── Animated cycle dot ──
  const { V: dotV, P: dotP } = getCycleVP(cycleT);
  const dotX = vToX(dotV), dotY = pToY(dotP);
  const pulse = (pulseTimer > 0) ? 1 + (pulseTimer / PULSE_FRAMES) * 0.6 : 1.0;
  fill(45, 215, 135); noStroke();
  circle(dotX, dotY, 10 * pulse);
  fill(255, 255, 255, 200);
  circle(dotX, dotY, 4);

  // ── Panel title + current state readout ──
  fill(200, 215, 230); noStroke(); textSize(11); textAlign(LEFT, TOP);
  text('P-V Diagram', g.pvL, 8);

  const { V: curV, P: curP } = getCycleVP(cycleT);
  const curT = (cycleT < 1 || (cycleT >= 3 && cycleT < 4)) ? TH_eff : TC_eff;
  fill(45, 215, 135); textSize(10); textAlign(LEFT, TOP);
  text(`P = ${curP.toFixed(1)}   V = ${curV.toFixed(2)}   T = ${curT.toFixed(0)} K`,
       g.pvL, g.pvB + 14);
}

// ── Draw: vertical divider ────────────────────────────────────────────────────
function drawDivider() {
  stroke(30, 38, 50); strokeWeight(1);
  line(g.divX, 0, g.divX, height);
}

// ── Draw: horizontal divider in right panel ───────────────────────────────────
function drawHorizDivider() {
  stroke(30, 38, 50); strokeWeight(1);
  line(g.engL, g.rightDivY, g.engR, g.rightDivY);
}

// ── Draw: engine / Sankey diagram ─────────────────────────────────────────────
function drawEngineDiagram() {
  const cx  = (g.engL + g.engR) * 0.5;
  const engH = g.engB - g.engT;
  const engW = g.engR - g.engL;

  // Sankey widths proportional to energy
  const maxW   = Math.min(56, engW * 0.44);
  const arrW_QH = maxW;
  const arrW_QC = Math.max(6, maxW * (QC / QH));
  const arrH_W  = Math.max(6, maxW * (WNet / Math.max(QH, 0.01)));
  const wArrowLen = Math.min(engW * 0.40, 64);

  // Pulse on cycle completion
  const pf = pulseTimer > 0 ? (pulseTimer / PULSE_FRAMES) : 0;

  // Vertical layout
  const hotH      = 24;
  const coldH     = 24;
  const boxH      = 38;
  const boxW      = 52;
  const qhArrH    = 36;
  const qcArrH    = 34;
  const totalH    = hotH + qhArrH + boxH + qcArrH + coldH;
  const startY    = g.engT + (engH - totalH) * 0.5;

  const hotY      = startY;
  const qhY       = hotY + hotH;
  const boxY      = qhY + qhArrH;
  const qcY       = boxY + boxH;
  const coldY     = qcY + qcArrH;

  // Hot reservoir
  stroke(220, 60, 50, 140); strokeWeight(1.2);
  fill(220, 60, 50, 28 + pf * 20);
  rect(cx - engW * 0.30, hotY, engW * 0.60, hotH, 3);
  noStroke(); fill(220, 60, 50, 220);
  textSize(9.5); textAlign(CENTER, CENTER);
  text(`HOT RESERVOIR  T_H = ${TH} K`, cx, hotY + hotH * 0.5);

  // Q_H arrow
  fill(220, 60, 50, 180 + pf * 50); noStroke();
  rect(cx - arrW_QH * 0.5, qhY, arrW_QH, qhArrH, 2);
  // Arrow tip
  triangle(cx - arrW_QH * 0.5 - 4, qhY + qhArrH - 4,
           cx + arrW_QH * 0.5 + 4, qhY + qhArrH - 4,
           cx, qhY + qhArrH + 8);
  // Label
  fill(220, 215, 200); textSize(9); textAlign(LEFT, CENTER);
  text(`Q_H = ${QH.toFixed(2)} kT`, cx + arrW_QH * 0.5 + 8, qhY + qhArrH * 0.5);

  // Engine box
  stroke(100, 120, 145, 200); strokeWeight(1.3);
  fill(26, 36, 48);
  rect(cx - boxW * 0.5, boxY, boxW, boxH, 4);
  noStroke(); fill(190, 205, 220); textSize(10); textAlign(CENTER, CENTER);
  text('ENGINE', cx, boxY + boxH * 0.5);

  // Work arrow (rightward)
  const wAlpha = 200 + pf * 55;
  fill(45, 215, 135, wAlpha); noStroke();
  const wArrY = boxY + (boxH - arrH_W) * 0.5;
  rect(cx + boxW * 0.5, wArrY, wArrowLen, arrH_W, 2);
  triangle(cx + boxW * 0.5 + wArrowLen - 2,  wArrY - 4,
           cx + boxW * 0.5 + wArrowLen - 2,  wArrY + arrH_W + 4,
           cx + boxW * 0.5 + wArrowLen + 10, wArrY + arrH_W * 0.5);
  // W label + eta
  const etaDisp  = (engineMode === 'real') ? etaReal : etaCarnot;
  const etaColor = (engineMode === 'real') ? [255, 150, 50] : [45, 215, 135];
  fill(45, 215, 135, 230); textSize(9); textAlign(LEFT, BOTTOM);
  text(`W = ${WNet.toFixed(2)} kT`, cx + boxW * 0.5 + wArrowLen + 14, wArrY + arrH_W * 0.5 - 1);
  fill(...etaColor); textSize(14); textAlign(LEFT, TOP);
  text(`η = ${(etaDisp * 100).toFixed(1)}%`, cx + boxW * 0.5 + wArrowLen + 14, wArrY + arrH_W * 0.5);

  // Show Carnot ceiling in real mode
  if (engineMode === 'real') {
    fill(155, 170, 190); textSize(8.5); textAlign(LEFT, TOP);
    text(`Carnot: ${(etaCarnot * 100).toFixed(1)}%`, cx + boxW * 0.5 + wArrowLen + 14, wArrY + arrH_W * 0.5 + 18);
    text(`η_CA: ${(etaCA * 100).toFixed(1)}%`, cx + boxW * 0.5 + wArrowLen + 14, wArrY + arrH_W * 0.5 + 30);
  }

  // Q_C arrow — ideal portion (blue)
  const idealQC    = TC * Math.log(R_EXPAND);
  const idealArrW  = Math.max(6, maxW * (idealQC / QH));
  fill(50, 130, 220, 180); noStroke();
  rect(cx - idealArrW * 0.5, qcY, idealArrW, qcArrH, 2);

  // Entropy waste splinter (orange extra portion in real mode)
  if (engineMode === 'real' && arrW_QC > idealArrW + 2) {
    const wasteW = arrW_QC - idealArrW;
    fill(255, 150, 50, 160); noStroke();
    rect(cx + idealArrW * 0.5, qcY, wasteW, qcArrH, 0, 2, 2, 0);
  }

  // Q_C arrow tip
  fill(50, 130, 220, 160); noStroke();
  triangle(cx - arrW_QC * 0.5 - 4, qcY + qcArrH - 4,
           cx + arrW_QC * 0.5 + 4, qcY + qcArrH - 4,
           cx, qcY + qcArrH + 8);
  fill(180, 205, 230); textSize(9); textAlign(LEFT, CENTER);
  text(`Q_C = ${QC.toFixed(2)} kT`, cx + arrW_QC * 0.5 + 8, qcY + qcArrH * 0.5);
  if (engineMode === 'real') {
    fill(255, 150, 50, 200); textSize(8.5); textAlign(LEFT, CENTER);
    text(`ΔS_irr = ${Math.max(0, dS_total).toFixed(3)} k`,
         cx + arrW_QC * 0.5 + 8, qcY + qcArrH * 0.5 + 12);
  }

  // Cold reservoir
  stroke(50, 130, 220, 140); strokeWeight(1.2);
  fill(50, 130, 220, 28 + pf * 10);
  rect(cx - engW * 0.30, coldY, engW * 0.60, coldH, 3);
  noStroke(); fill(50, 130, 220, 220);
  textSize(9.5); textAlign(CENTER, CENTER);
  text(`COLD RESERVOIR  T_C = ${TC} K`, cx, coldY + coldH * 0.5);

  // Panel title
  fill(200, 215, 230); noStroke(); textSize(11); textAlign(LEFT, TOP);
  text('Energy Flow', g.engL, 8);
}

// ── Draw: entropy scorecard ───────────────────────────────────────────────────
function drawScorecard() {
  const tx  = g.scL + 8;
  let   ty  = g.scT + 14;
  const lh  = 16;

  noStroke(); textAlign(LEFT, CENTER);

  // Title
  fill(200, 215, 230); textSize(11);
  text('Entropy Balance (per cycle)', tx, ty); ty += lh + 4;

  // ΔS_hot
  fill(50, 130, 220); textSize(10.5);
  text(`ΔS_hot  = ${dS_hot.toFixed(3)} k`, tx, ty); ty += lh;

  // ΔS_cold
  fill(220, 60, 50); textSize(10.5);
  text(`ΔS_cold = +${dS_cold.toFixed(3)} k`, tx, ty); ty += lh;

  // Divider
  stroke(50, 65, 85); strokeWeight(1);
  line(tx, ty - 2, g.scR - 8, ty - 2); ty += 4;
  noStroke();

  // ΔS_total
  const isIdeal = Math.abs(dS_total) < 0.001;
  const stColor = (engineMode === 'real' && !isIdeal)
    ? [255, 150, 50] : [45, 215, 135];
  fill(...stColor); textSize(11);
  const stSign = dS_total >= 0 ? '+' : '';
  text(`ΔS_total = ${stSign}${dS_total.toFixed(3)} k`, tx, ty); ty += lh;

  // Work lost (real mode only)
  if (engineMode === 'real' && dS_total > 0.001) {
    const wLost = TC * dS_total;
    fill(255, 150, 50, 200); textSize(9.5);
    text(`W_lost = TC × ΔS = ${wLost.toFixed(3)} kT`, tx, ty);
  }
  ty += lh + 4;

  // Divider
  stroke(50, 65, 85); strokeWeight(1);
  line(tx, ty - 2, g.scR - 8, ty - 2); ty += 4;
  noStroke();

  // Cycle count + total work
  fill(155, 170, 190); textSize(10);
  text(`Cycles: ${cycleCount}`, tx, ty); ty += lh;
  fill(45, 215, 135, 200); textSize(10);
  text(`Total W: ${totalWorkAccum.toFixed(2)} kT`, tx, ty);
}

// ── Controls ───────────────────────────────────────────────────────────────────
function readControls() {
  let newTH    = parseInt(document.getElementById('ctrl-th').value);
  let newTC    = parseInt(document.getElementById('ctrl-tc').value);
  const newDelta = parseFloat(document.getElementById('ctrl-delta').value);
  const spSlider = parseInt(document.getElementById('ctrl-speed').value);
  cycleSpeedMult = spSlider * 0.5;  // 1→0.5×, 4→2.0×, 8→4.0×

  // Clamp TC < TH − 10
  const maxTC = newTH - 10;
  if (newTC > maxTC) {
    newTC = maxTC;
    document.getElementById('ctrl-tc').value = newTC;
  }

  document.getElementById('val-th').textContent    = newTH;
  document.getElementById('val-tc').textContent    = newTC;
  document.getElementById('val-delta').textContent = newDelta.toFixed(2);
  document.getElementById('val-speed').textContent = cycleSpeedMult.toFixed(1);

  TH = newTH; TC = newTC; delta = newDelta;
  computePhysics();

  // Update efficiency displays
  document.getElementById('val-eta-carnot').textContent = (etaCarnot * 100).toFixed(1);
  if (engineMode === 'real') {
    const el = document.getElementById('eta-real-display');
    if (el) {
      el.innerHTML = `&eta;<sub>real</sub> = ${(etaReal * 100).toFixed(1)}%<br>` +
        `&eta;<sub>CA</sub> = ${(etaCA * 100).toFixed(1)}%`;
    }
  }
}

function setEngineMode(m) {
  engineMode = m;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`mode-btn-${m}`);
  if (btn) btn.classList.add('active');
  const sec = document.getElementById('irrev-section');
  if (sec) sec.style.display = (m === 'real') ? '' : 'none';
  computePhysics();
}

function togglePause() {
  paused = !paused;
  const btn = document.getElementById('btn-playpause');
  if (btn) btn.textContent = paused ? '▶ Play' : '⏸ Pause';
}

function stepStroke() {
  paused = true;
  const btn = document.getElementById('btn-playpause');
  if (btn) btn.textContent = '▶ Play';
  // Advance to end of current stroke
  const next = Math.floor(cycleT) + 1;
  if (next >= 4) {
    completeCycle();
    cycleT = 0;
  } else {
    cycleT = next;
  }
}

function completeCycle() {
  cycleCount++;
  totalWorkAccum += WNet;
  pulseTimer = PULSE_FRAMES;
}

function setSimState(th, tc, mode, d) {
  TH = th; TC = tc; engineMode = mode; delta = d;
  cycleT = 0; cycleCount = 0; totalWorkAccum = 0;
  trail = []; pulseTimer = 0;
  paused = false;
  const pauseBtn = document.getElementById('btn-playpause');
  if (pauseBtn) pauseBtn.textContent = '⏸ Pause';

  // Sync sliders
  const ctrlTH = document.getElementById('ctrl-th');
  const ctrlTC = document.getElementById('ctrl-tc');
  const ctrlD  = document.getElementById('ctrl-delta');
  if (ctrlTH) ctrlTH.value = th;
  if (ctrlTC) ctrlTC.value = tc;
  if (ctrlD)  ctrlD.value  = d;

  setEngineMode(mode);
  computePhysics();
}

function setEduMode(m) {
  eduMode = m;
  document.querySelectorAll('.edu-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`edu-btn-${m}`);
  if (btn) btn.classList.add('active');

  if (m === 'carnot') {
    setSimState(600, 300, 'reversible', 0.25);
  } else if (m === 'entropy') {
    setSimState(600, 300, 'real', 0.25);
  } else if (m === 'arrowtime') {
    setSimState(800, 200, 'reversible', 0.15);
  }
  updateEduPanel(m);
}

// ── p5 lifecycle ───────────────────────────────────────────────────────────────
function setup() {
  const container = document.getElementById('canvas-container');
  const cnv = createCanvas(container.offsetWidth, container.offsetHeight);
  cnv.parent('canvas-container');
  textFont('monospace');
  computePhysics();
  computeGeometry();
  setEduMode('carnot');
  frameRate(60);
}

function windowResized() {
  const container = document.getElementById('canvas-container');
  resizeCanvas(container.offsetWidth, container.offsetHeight);
  computeGeometry();
}

function draw() {
  background(17, 24, 32);
  readControls();
  computeGeometry();

  // Advance cycle
  if (!paused) {
    const baseSpeed = 0.25;  // full cycles per second at 1×
    cycleT += baseSpeed * cycleSpeedMult * (deltaTime / 1000);
    if (cycleT >= 4) {
      cycleT -= 4;
      completeCycle();
    }
  }

  // Update trail
  const { V: dotV, P: dotP } = getCycleVP(cycleT);
  trail.push({ x: vToX(dotV), y: pToY(dotP) });
  if (trail.length > TRAIL_LEN) trail.shift();

  if (pulseTimer > 0) pulseTimer--;

  // Draw panels
  drawPVDiagram();
  drawDivider();
  drawEngineDiagram();
  drawHorizDivider();
  drawScorecard();
}
