// ─────────────────────────────────────────────────────────────────────────────
// Quantum Tunneling — sketch.js
//
// Physics (natural units ħ=1, 2m=1 → k=√E):
//   Rectangular barrier [0, L], height V₀
//   Region 1: A·e^{ikx} + B·e^{-ikx}   (k = √E)
//   Region 2: C·e^{ux}  + D·e^{-ux}    (u = √(V₀−E), E < V₀)
//          or C·e^{iqx} + D·e^{-iqx}    (q = √(E−V₀), E > V₀)
//   Region 3: F·e^{ikx}  (F=1, solve backward → A,B,C,D)
//   T = 1/|A|²,  R = |B/A|²
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Edu content
// ─────────────────────────────────────────────────────────────────────────────
const EDU = {

  evanescent: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Quantum Tunneling</p>
        <p class="edu-description">
          Below the barrier (E &lt; V&#x2080;), the Schr&ouml;dinger equation yields an
          <em>exponentially decaying</em> solution inside the barrier &mdash; the
          <strong>evanescent wave</strong>. Unlike classical mechanics (T&nbsp;=&nbsp;0),
          the wave function leaks through. If the barrier is thin enough, a particle emerges
          on the other side. This is not an energy violation: the particle is never localized
          inside the barrier; the wave simply <em>extends</em> through it.
        </p>
        <div class="equation">T &asymp; e<sup>&minus;2uL</sup> &middot; prefactor &ensp;&#x2014;&ensp; u = &radic;(V&#x2080;&minus;E)</div>
        <p class="param-hint">
          &#x21BA;&thinsp; Sliders set to E/V&#x2080;&thinsp;=&thinsp;0.60, L&thinsp;=&thinsp;2 &mdash;
          evanescent regime. Drag <strong>L</strong> rightward and watch T
          collapse exponentially; drag <strong>E/V&#x2080;</strong> toward 1 to see T rise.
        </p>
        <div class="edu-concepts">
          <span class="edu-concept-tag">evanescent wave</span>
          <span class="edu-concept-tag">forbidden region</span>
          <span class="edu-concept-tag">exponential decay</span>
          <span class="edu-concept-tag">quantum tunneling</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Alpha decay &mdash; Gamow (1928)</p>
          <p>
            An &alpha; particle is trapped in a nucleus by the strong force but tunnels
            through the Coulomb barrier. Half-lives spanning 10<sup>&minus;7</sup>&thinsp;s
            to 10<sup>17</sup>&thinsp;years are explained by the single exponential factor
            e<sup>&minus;2uL</sup> alone &mdash; the first application of quantum tunneling.
          </p>
        </div>
      </div>
    </div>
  `,

  resonance: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Above-Barrier Resonance</p>
        <p class="edu-description">
          For E &gt; V&#x2080;, the particle is classically free to pass &mdash; yet T is not
          always 1. Reflections from each face of the barrier interfere. When the barrier width
          is exactly a half-integer number of wavelengths (qL&nbsp;=&nbsp;n&pi;), reflections
          cancel and T&nbsp;=&nbsp;1 exactly. This is the quantum analogue of the
          <strong>Fabry&ndash;P&eacute;rot etalon</strong> in optics.
        </p>
        <div class="equation">T = 1 &ensp;when&ensp; qL = n&pi;,&ensp; q = &radic;(E&minus;V&#x2080;)</div>
        <p class="param-hint param-hint-teal">
          &#x21BA;&thinsp; Sliders set to L&thinsp;=&thinsp;4, E/V&#x2080;&thinsp;&asymp;&thinsp;1.62 &mdash;
          the n&thinsp;=&thinsp;1 resonance (qL&thinsp;=&thinsp;&pi;). The dot on the T(E) curve sits at
          T&thinsp;=&thinsp;1. Nudge <strong>E/V&#x2080;</strong> slightly left or right and T
          drops immediately. Drag <strong>L</strong> to shift the resonance energy.
        </p>
        <div class="edu-concepts">
          <span class="edu-concept-tag">above-barrier resonance</span>
          <span class="edu-concept-tag">Fabry&ndash;P&eacute;rot</span>
          <span class="edu-concept-tag">constructive interference</span>
          <span class="edu-concept-tag">quasi-bound states</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Ramsauer&ndash;Townsend effect (1921)</p>
          <p>
            Slow electrons passing through noble-gas atoms show anomalously high transmission
            at specific energies. The atom&rsquo;s potential well acts as the &ldquo;barrier&rdquo;;
            electrons at a resonance energy pass through almost without scattering &mdash;
            one of the first experimental confirmations of wave mechanics for matter.
          </p>
        </div>
      </div>
    </div>
  `,

  applications: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Tunneling in Technology &amp; Nature</p>
        <p class="edu-description">
          Tunneling underlies some of the most important phenomena in modern science:
          <strong>STM</strong> (Nobel 1986) &mdash; tip current &prop; e<sup>&minus;2&kappa;d</sup>
          gives sub-&aring;ngstr&ouml;m height resolution;
          <strong>Flash memory</strong> &mdash; electrons tunnel through ~10&thinsp;nm oxide
          (Fowler&ndash;Nordheim) to charge the floating gate;
          <strong>Nuclear fusion in stars</strong> &mdash; protons tunnel the Coulomb barrier
          at temperatures too low to classically overcome it;
          <strong>Josephson junction</strong> &mdash; Cooper pairs tunnel between superconductors,
          enabling the most precise voltage standards.
        </p>
        <div class="equation">T<sub>STM</sub> &prop; exp(&minus;2d&radic;(2m&phi;)/&hbar;) &ensp;&#x2014;&ensp; &phi; = work function</div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">STM</span>
          <span class="edu-concept-tag">flash memory</span>
          <span class="edu-concept-tag">stellar fusion</span>
          <span class="edu-concept-tag">Josephson junction</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">STM resolution</p>
          <p>
            In a scanning tunnelling microscope, a 1&thinsp;&aring; change in tip&ndash;sample
            distance changes the tunnel current by roughly 10&times;. This exponential
            sensitivity is why STM can image individual atoms &mdash; and why precise
            vibration isolation is essential.
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
let E = 0.6, V0 = 1.0, L = 2.0;
let coeff = { A:{re:1,im:0}, B:{re:0,im:0}, C:{re:1,im:0}, D:{re:0,im:0},
              k:0, u:0, q:0, T:0, R:1, aboveBarrier:false };
let coeffDirty = true;

let tCurve = new Float32Array(500);
let tCurveDirty = true;

let animating  = true;
let tVis       = 0;
let displayWave = 'both';   // 'psi' | 'prob' | 'both'
let compareMode = 'both';   // 'quantum' | 'classical' | 'both'
let eduMode     = 'evanescent';

let prevE = -1, prevV0 = -1, prevL = -1;

// ─────────────────────────────────────────────────────────────────────────────
// Energy color map: blue (tunneling) → purple (at barrier) → orange (above)
// Applied to the E marker and curve dot in the T(E) panel.
// ─────────────────────────────────────────────────────────────────────────────
function energyColor() {
  const t = Math.min(E / V0 / 2, 1);   // 0 = E→0,  0.5 = E=V₀,  1 = E=2V₀
  if (t < 0.5) {
    const s = t * 2;
    return [Math.round(88 + 82*s), Math.round(166 - 101*s), 255];
    // (88,166,255) blue → (170,65,255) purple
  }
  const s = (t - 0.5) * 2;
  return [Math.round(170 + 85*s), Math.round(65 + 85*s), Math.round(255 - 205*s)];
  // (170,65,255) purple → (255,150,50) orange
}

// ─────────────────────────────────────────────────────────────────────────────
// Physics
// ─────────────────────────────────────────────────────────────────────────────

// Scalar T for any E, V0, L (handles all cases)
function computeT(e, v0, l) {
  if (e <= 0) return 0;
  const k = Math.sqrt(e);
  if (Math.abs(e - v0) < 1e-5) {
    return 1 / (1 + l * l / 4);     // limit as u→0
  }
  if (e < v0) {
    const u  = Math.sqrt(v0 - e);
    const sh = Math.sinh(u * l);
    return 1 / (1 + (k*k + u*u)*(k*k + u*u) * sh*sh / (4*k*k*u*u));
  }
  const q  = Math.sqrt(e - v0);
  const sn = Math.sin(q * l);
  return 1 / (1 + (k*k - q*q)*(k*k - q*q) * sn*sn / (4*k*k*q*q));
}

// Build complex coefficients A, B, C, D (F=1). Normalize displays by 1/|A|.
function buildCoeff() {
  const Tv = computeT(E, V0, L);
  const k  = Math.sqrt(Math.max(E, 1e-8));
  const cikL = { re: Math.cos(k*L), im: Math.sin(k*L) };
  let A, B, C, D;

  if (E >= V0 - 1e-5) {
    // ── Above barrier (or at it) ─────────────────────────────────────────────
    const q = E > V0 + 1e-5 ? Math.sqrt(E - V0) : 1e-4;
    const ciqL  = { re: Math.cos(q*L), im:  Math.sin(q*L) };
    const cmiqL = { re: Math.cos(q*L), im: -Math.sin(q*L) };
    const ratio = k / q;

    // α = cikL·(1+k/q)/2,  β = cikL·(1-k/q)/2
    const alpha = { re: cikL.re*(1+ratio)/2, im: cikL.im*(1+ratio)/2 };
    const beta  = { re: cikL.re*(1-ratio)/2, im: cikL.im*(1-ratio)/2 };

    // C = α·e^{-iqL},  D = β·e^{iqL}
    C = { re: alpha.re*cmiqL.re - alpha.im*cmiqL.im,
          im: alpha.re*cmiqL.im + alpha.im*cmiqL.re };
    D = { re: beta.re*ciqL.re - beta.im*ciqL.im,
          im: beta.re*ciqL.im + beta.im*ciqL.re };

    // A = [C(1+q/k) + D(1-q/k)]/2,  B = [C(1-q/k) + D(1+q/k)]/2
    const qk = q / k;
    A = { re: (C.re*(1+qk) + D.re*(1-qk))/2,
          im: (C.im*(1+qk) + D.im*(1-qk))/2 };
    B = { re: (C.re*(1-qk) + D.re*(1+qk))/2,
          im: (C.im*(1-qk) + D.im*(1+qk))/2 };

    coeff = { A, B, C, D, k, u: 0, q, T: Tv, R: 1-Tv, aboveBarrier: true };

  } else {
    // ── Below barrier (tunneling) ────────────────────────────────────────────
    const u   = Math.sqrt(Math.max(V0 - E, 1e-10));
    const euL = Math.exp(Math.min(u * L, 500));  // cap to avoid Infinity
    const emL = 1 / euL;
    const uok = u / k;   // u/k  (real)
    const kou = k / u;   // k/u  (real)

    // From BCs at x=L:
    // C = cikL·(1 + ik/u)/(2·euL)
    // D = cikL·(1 - ik/u)·euL/2
    // (1+ik/u): real=1, imag=kou
    // (1-ik/u): real=1, imag=-kou
    // C = cikL * {re:1, im:kou} / (2*euL)
    C = { re: (cikL.re - cikL.im*kou) / (2*euL),
          im: (cikL.im + cikL.re*kou) / (2*euL) };
    // D = cikL * {re:1, im:-kou} * euL/2
    D = { re: (cikL.re + cikL.im*kou) * euL / 2,
          im: (cikL.im - cikL.re*kou) * euL / 2 };

    // From BCs at x=0:
    // A-B = (-iu/k)(C-D): -i*(C-D) = {re:(C-D).im, im:-(C-D).re}, scale by u/k
    const CpD = { re: C.re+D.re, im: C.im+D.im };
    const CmD = { re: C.re-D.re, im: C.im-D.im };
    // (-iu/k)*(C-D) = {re: CmD.im*uok, im: -CmD.re*uok}
    const delta = { re: CmD.im*uok, im: -CmD.re*uok };
    A = { re: (CpD.re + delta.re)/2, im: (CpD.im + delta.im)/2 };
    B = { re: (CpD.re - delta.re)/2, im: (CpD.im - delta.im)/2 };

    coeff = { A, B, C, D, k, u, q: 0, T: Tv, R: 1-Tv, aboveBarrier: false };
  }

  coeffDirty = false;
}

// Precompute T(E) from E=0 to 2·V0 (500 pts)
function buildTCurve() {
  const eMax = 2 * V0;
  for (let i = 0; i < 500; i++) {
    tCurve[i] = computeT(eMax * i / 499, V0, L);
  }
  tCurveDirty = false;
}

// Returns {re_spatial, im_spatial, prob} (unnormalized, F=1)
// re_spatial and im_spatial are the real/imag parts of ψ_spatial(x) (no time factor)
function psiSpatial(x) {
  const { A, B, C, D, k, u, q, aboveBarrier } = coeff;
  if (x < 0) {
    // A·e^{ikx} + B·e^{-ikx}
    const ck = Math.cos(k*x), sk = Math.sin(k*x);
    const re = A.re*ck - A.im*sk + B.re*ck + B.im*sk;
    const im = A.re*sk + A.im*ck - B.re*sk + B.im*ck;
    return { re, im, prob: re*re + im*im };
  }
  if (x <= L) {
    let re, im;
    if (aboveBarrier) {
      const cq = Math.cos(q*x), sq = Math.sin(q*x);
      re = C.re*cq - C.im*sq + D.re*cq + D.im*sq;
      im = C.re*sq + C.im*cq - D.re*sq + D.im*cq;
    } else {
      const eux  = Math.exp(Math.min( u*x, 500));
      const emux = Math.exp(Math.max(-u*x, -500));
      re = C.re*eux + D.re*emux;
      im = C.im*eux + D.im*emux;
    }
    return { re, im, prob: re*re + im*im };
  }
  // x > L: F·e^{ikx} = e^{ikx}
  const ck = Math.cos(k*x), sk = Math.sin(k*x);
  return { re: ck, im: sk, prob: 1 };
}

// ─────────────────────────────────────────────────────────────────────────────
// Geometry
// ─────────────────────────────────────────────────────────────────────────────
let waveP = {}, tP = {}, divX = 0;

function computeGeometry() {
  divX = Math.floor(width * 0.58);
  const padT = 38, padB = 22;
  const h0 = padT, h1 = height - padB;
  const hh = h1 - h0;

  waveP = { x0: 0, x1: divX, y0: h0, y1: h1, h: hh,
            cy: h0 + hh * 0.5, ampScale: hh * 0.22 };

  // T panel inner bounds
  const tPadL = 34, tPadR = 10, tPadB = 22;
  tP = {
    x0: divX + 1, x1: width,
    y0: h0, y1: h1,
    ix0: divX + 1 + tPadL, ix1: width - tPadR,
    iy0: h0 + 4, iy1: h1 - tPadB,
  };
  tP.iw = tP.ix1 - tP.ix0;
  tP.ih = tP.iy1 - tP.iy0;
}

// Map physical x → canvas x (wave panel)
function wx(xPhys) {
  const xMin = -8, xMax = L + 8;
  return map(xPhys, xMin, xMax, waveP.x0 + 6, waveP.x1 - 6);
}

// Map amplitude → canvas y (wave panel, centered)
function wy(amp) { return waveP.cy - amp * waveP.ampScale; }

// Map E/V0 ratio → canvas x (T panel)
function tx(eRatio) { return map(eRatio, 0, 2, tP.ix0, tP.ix1); }

// Map T → canvas y (T panel)
function ty(Tv) { return map(Tv, 0, 1, tP.iy1, tP.iy0); }

// ─────────────────────────────────────────────────────────────────────────────
// p5 lifecycle
// ─────────────────────────────────────────────────────────────────────────────
function setup() {
  const cont = document.getElementById('canvas-container');
  createCanvas(cont.clientWidth, cont.clientHeight).parent('canvas-container');
  computeGeometry();
  textFont('Courier New');
  updateEduPanel('evanescent');
}

function windowResized() {
  const cont = document.getElementById('canvas-container');
  resizeCanvas(cont.clientWidth, cont.clientHeight);
  computeGeometry();
}

// ─────────────────────────────────────────────────────────────────────────────
// Controls
// ─────────────────────────────────────────────────────────────────────────────
function readControls() {
  const eRatio = parseFloat(document.getElementById('e-slider').value);
  const newV0  = parseFloat(document.getElementById('v0-slider').value);
  const newL   = parseFloat(document.getElementById('l-slider').value);
  const newE   = eRatio * newV0;

  document.getElementById('e-val').textContent  = eRatio.toFixed(2);
  document.getElementById('v0-val').textContent = newV0.toFixed(1);
  document.getElementById('l-val').textContent  = newL.toFixed(1);

  if (newE !== prevE || newV0 !== prevV0 || newL !== prevL) {
    const lvChanged = newL !== prevL || newV0 !== prevV0;
    E = newE; V0 = newV0; L = newL;
    coeffDirty = true;
    if (lvChanged) tCurveDirty = true;
    prevE = E; prevV0 = V0; prevL = L;
  }
}

function setDisplayWave(m) {
  displayWave = m;
  ['psi','prob','both'].forEach(id => {
    document.getElementById('wave-btn-'+id).classList.toggle('active', id === m);
  });
}

function setCompareMode(m) {
  compareMode = m;
  ['quantum','classical','both'].forEach(id => {
    document.getElementById('cmp-btn-'+id).classList.toggle('active', id === m);
  });
}

// Set slider values and force readControls to re-detect them next frame
function setSliders(eRatio, v0, l) {
  document.getElementById('e-slider').value = eRatio;
  document.getElementById('v0-slider').value = v0;
  document.getElementById('l-slider').value = l;
  prevE = prevV0 = prevL = -1;   // force dirty detection next frame
}

function setEduMode(m) {
  eduMode = m;
  ['evanescent','resonance','applications'].forEach(id => {
    document.getElementById('edu-btn-'+id).classList.toggle('active', id === m);
  });
  // Auto-set parameters so the sim immediately shows the described phenomenon
  if (m === 'evanescent') {
    setSliders(0.60, 1.0, 2.0);   // default tunneling regime
  } else if (m === 'resonance') {
    // n=1 resonance: qL=π → E_res = V₀+(π/L)² = 1+(π/4)² ≈ 1.617
    setSliders(1.62, 1.0, 4.0);
  }
  // 'applications': leave current params as-is
  updateEduPanel(m);
}

function toggleAnimate() {
  animating = !animating;
  document.getElementById('anim-btn').textContent = animating ? '⏸ Pause' : '▶ Animate';
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing — wave function panel
// ─────────────────────────────────────────────────────────────────────────────
function drawWavePanel() {
  const { x0, x1, y0, y1, cy, ampScale } = waveP;
  const Amod2 = coeff.A.re*coeff.A.re + coeff.A.im*coeff.A.im;
  const Amod  = Math.sqrt(Amod2);
  const belowBarrier = !coeff.aboveBarrier;

  // Barrier rectangle
  const bx0 = wx(0), bx1 = wx(L);
  noStroke();
  fill(40, 52, 68);
  rect(bx0, y0, bx1 - bx0, y1 - y0);

  // Forbidden zone tint (E < V0)
  if (belowBarrier) {
    fill(170, 65, 255, 18);
    rect(bx0, y0, bx1 - bx0, y1 - y0);
  }

  // Zero line
  stroke(30, 38, 50);
  strokeWeight(1);
  line(x0, cy, x1, cy);

  // Classical turning-point dashes (E < V0)
  if (belowBarrier) {
    stroke(255, 150, 50, 100);
    strokeWeight(1);
    drawingContext.setLineDash([4, 4]);
    line(bx0, y0, bx0, y1);
    line(bx1, y0, bx1, y1);
    drawingContext.setLineDash([]);
  }

  // ── |ψ|² probability density ──────────────────────────────────────────────
  if (displayWave !== 'psi') {
    const steps = Math.min(Math.floor(x1 - x0), 400);
    // Filled area
    noStroke();
    fill(45, 215, 135, 35);
    beginShape();
    vertex(x0 + 6, cy);
    for (let s = 0; s <= steps; s++) {
      const cx_ = map(s, 0, steps, x0 + 6, x1 - 6);
      const xp  = map(cx_, x0 + 6, x1 - 6, -8, L + 8);
      const psi = psiSpatial(xp);
      const prob = psi.prob / Amod2;
      vertex(cx_, cy - prob * ampScale);
    }
    vertex(x1 - 6, cy);
    endShape(CLOSE);
    // Stroke
    stroke(45, 215, 135, 180);
    strokeWeight(1.5);
    noFill();
    beginShape();
    for (let s = 0; s <= steps; s++) {
      const cx_ = map(s, 0, steps, x0 + 6, x1 - 6);
      const xp  = map(cx_, x0 + 6, x1 - 6, -8, L + 8);
      const psi = psiSpatial(xp);
      const prob = psi.prob / Amod2;
      vertex(cx_, cy - prob * ampScale);
    }
    endShape();
  }

  // ── Re[ψ(x,t)] animated curve ─────────────────────────────────────────────
  if (displayWave !== 'prob') {
    const cosT = Math.cos(E * tVis);
    const sinT = Math.sin(E * tVis);
    const steps = Math.min(Math.floor(x1 - x0), 400);
    stroke(88, 166, 255);
    strokeWeight(1.5);
    noFill();
    beginShape();
    for (let s = 0; s <= steps; s++) {
      const cx_ = map(s, 0, steps, x0 + 6, x1 - 6);
      const xp  = map(cx_, x0 + 6, x1 - 6, -8, L + 8);
      const psi = psiSpatial(xp);
      // Re[ψ(x,t)] = Re[ψ_spatial(x) · e^{−iEt}]
      const re_anim = (psi.re * cosT + psi.im * sinT) / Amod;
      vertex(cx_, wy(re_anim));
    }
    endShape();
  }

  // ── Panel title ───────────────────────────────────────────────────────────
  noStroke();
  fill(175, 190, 210);
  textSize(10);
  textAlign(LEFT, TOP);
  const tStr = coeff.T.toFixed(3), rStr = coeff.R.toFixed(3);
  text('Wave function \u2014 T\u202f=\u202f' + tStr + '\u2003R\u202f=\u202f' + rStr, x0 + 8, y0 + 2);

  // ── Region labels (below title) ───────────────────────────────────────────
  fill(130, 148, 170);
  textSize(9);
  textAlign(CENTER, TOP);
  const regionY = y0 + 18;
  const leftMid    = (x0 + 6 + bx0) / 2;
  const rightMid   = (bx1 + x1 - 6) / 2;
  const barrierMid = (bx0 + bx1) / 2;
  text('incident + reflected', leftMid, regionY);
  text('transmitted', rightMid, regionY);
  if (bx1 - bx0 > 44) {
    text(belowBarrier ? 'evanescent' : 'partial wave', barrierMid, regionY);
  }

  // ── V₀ label at top of barrier ────────────────────────────────────────────
  fill(165, 180, 200);
  textSize(9);
  textAlign(LEFT, TOP);
  text('V\u2080', bx1 + 3, y0 + 4);

  // ── Wave panel legend (lower-left, below zero line) ───────────────────────
  drawWaveLegend(x0, y1, cy);
}

// ─────────────────────────────────────────────────────────────────────────────
// Legends
// ─────────────────────────────────────────────────────────────────────────────
function drawWaveLegend(x0, y1, cy) {
  const lx   = x0 + 10;
  const lyBot = cy + (y1 - cy) * 0.82;
  const spc  = 13, len = 14;
  let ly = lyBot;
  textSize(9); textAlign(LEFT, CENTER);

  if (displayWave !== 'prob') {
    stroke(88, 166, 255); strokeWeight(1.5);
    line(lx, ly, lx + len, ly);
    noStroke(); fill(88, 166, 255, 200);
    text('Re[\u03C8(x,t)]', lx + len + 4, ly);
    ly += spc;
  }
  if (displayWave !== 'psi') {
    stroke(45, 215, 135, 200); strokeWeight(2);
    line(lx, ly, lx + len, ly);
    noStroke(); fill(45, 215, 135, 200);
    text('|\u03C8(x)|\u00B2  prob. density', lx + len + 4, ly);
  }
  textAlign(LEFT, TOP);
}

function drawTLegend() {
  const lx  = tP.ix0 + 4;
  const ly0 = tP.iy1 - 36;
  const spc = 13, len = 14;
  let ly = ly0;
  textSize(9); textAlign(LEFT, CENTER);

  if (compareMode !== 'classical') {
    stroke(45, 215, 135, 200); strokeWeight(2); noFill();
    line(lx, ly, lx + len, ly);
    noStroke(); fill(45, 215, 135, 200);
    text('Quantum T(E)', lx + len + 4, ly);
    ly += spc;
  }
  if (compareMode !== 'quantum') {
    drawingContext.setLineDash([4, 3]);
    stroke(255, 150, 50, 180); strokeWeight(1.5); noFill();
    line(lx, ly, lx + len, ly);
    drawingContext.setLineDash([]);
    noStroke(); fill(255, 150, 50, 190);
    text('Classical (step)', lx + len + 4, ly);
  }
  textAlign(LEFT, TOP);
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing — transmission T(E) panel
// ─────────────────────────────────────────────────────────────────────────────
function drawTPanel() {
  const { ix0, ix1, iy0, iy1, iw, ih } = tP;
  const eRatio = E / V0;

  // ── Axes ──────────────────────────────────────────────────────────────────
  stroke(30, 38, 50);
  strokeWeight(1);
  line(ix0, iy1, ix1, iy1);  // x-axis (T=0)
  line(ix0, iy0, ix0, iy1);  // y-axis

  // T=1 ceiling
  stroke(30, 38, 50);
  strokeWeight(1);
  drawingContext.setLineDash([3, 4]);
  line(ix0, iy0, ix1, iy0);
  drawingContext.setLineDash([]);

  // ── V₀ divider at E/V0 = 1 ────────────────────────────────────────────────
  const vx = tx(1);
  stroke(80, 95, 115, 120);
  strokeWeight(1);
  drawingContext.setLineDash([4, 4]);
  line(vx, iy0, vx, iy1);
  drawingContext.setLineDash([]);
  noStroke(); fill(140, 158, 180);
  textSize(9); textAlign(CENTER, TOP);
  text('V\u2080', vx, iy0 + 2);

  // ── Classical step function ────────────────────────────────────────────────
  if (compareMode !== 'quantum') {
    const alpha = compareMode === 'classical' ? 220 : 140;
    stroke(255, 150, 50, alpha);
    strokeWeight(2);
    drawingContext.setLineDash([5, 4]);
    noFill();
    // T=0 for E<V0
    line(ix0, ty(0), vx, ty(0));
    // jump
    line(vx, ty(0), vx, ty(1));
    // T=1 for E>V0
    line(vx, ty(1), ix1, ty(1));
    drawingContext.setLineDash([]);
  }

  // ── Quantum T(E) curve ─────────────────────────────────────────────────────
  if (compareMode !== 'classical') {
    const alpha = compareMode === 'quantum' ? 220 : 200;
    stroke(45, 215, 135, alpha);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let i = 0; i < 500; i++) {
      const ex = map(i, 0, 499, ix0, ix1);
      const Tv = tCurve[i];
      vertex(ex, ty(Tv));
    }
    endShape();
  }

  // ── Resonance tick marks ───────────────────────────────────────────────────
  stroke(45, 215, 135, 140);
  strokeWeight(1);
  for (let n = 1; n <= 20; n++) {
    const En = V0 + (n * Math.PI / L) * (n * Math.PI / L);
    const er = En / V0;
    if (er > 2) break;
    const rx = tx(er);
    line(rx, iy1, rx, iy1 - 5);
  }

  // ── Current E marker (energy-mapped color) ────────────────────────────────
  const markerX = tx(eRatio);
  const [er, eg, eb] = energyColor();
  stroke(er, eg, eb, 200);
  strokeWeight(1);
  line(markerX, iy0, markerX, iy1);

  // Dot on quantum curve
  const dotT = computeT(E, V0, L);
  const dotY = ty(dotT);
  noStroke();
  fill(er, eg, eb);
  ellipse(markerX, dotY, 8, 8);

  // ── Axis labels ────────────────────────────────────────────────────────────
  noStroke(); fill(140, 158, 178);
  textSize(9); textAlign(CENTER, TOP);
  [0, 0.5, 1.0, 1.5, 2.0].forEach(v => {
    text(v.toFixed(1), tx(v), iy1 + 3);
  });
  textAlign(RIGHT, CENTER);
  [0, 0.5, 1.0].forEach(v => {
    text(v.toFixed(1), ix0 - 3, ty(v));
  });

  // Axis titles
  fill(155, 170, 190);
  textSize(9);
  textAlign(CENTER, BOTTOM);
  text('E / V\u2080', (ix0 + ix1) / 2, iy1 + 20);
  textAlign(LEFT, TOP);
  text('T', ix0 - 2, iy0);

  // Panel title
  textSize(10); textAlign(LEFT, TOP);
  fill(175, 190, 210);
  text('Transmission T(E)', tP.ix0, tP.y0 + 2);

  drawTLegend();
}

// ─────────────────────────────────────────────────────────────────────────────
// Main draw loop
// ─────────────────────────────────────────────────────────────────────────────
function draw() {
  readControls();
  if (coeffDirty) buildCoeff();
  if (tCurveDirty) buildTCurve();

  if (animating) tVis += 0.04;

  // Update T/R readout
  const tDisp = coeff.T, rDisp = coeff.R;
  document.getElementById('tr-readout').textContent =
    'T = ' + tDisp.toFixed(3) + '\u2003R = ' + rDisp.toFixed(3);

  background(17, 24, 32);

  drawWavePanel();

  // Divider
  stroke(30, 38, 50);
  strokeWeight(1);
  line(divX, 0, divX, height);

  drawTPanel();
}
