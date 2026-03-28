// ─────────────────────────────────────────────────────────────────────────────
// Uncertainty Principle — sketch.js
//
// Modes: 'measure' | 'uncertainty' | 'fourier'
// Measure sub-phases: 'bouncing' | 'collapsed_frozen' | 'collapsed_evolving'
//
// Physics (ħ = 1):
//   Bouncing: xc(t) = A·cos(ωt),  pc(t) = −Aω·sin(ωt)
//   Spreading: σ(t) = σ₀·√(1 + (t/(2σ₀²))²)
//   Gaussian: Δx=σ, Δp=1/(2σ), product=1/2 (minimum)
//   Two-peak: Δx=σ√2, Δp=1/(2σ), product=√2/2
//   Chirped:  Δx=σ,  Δp=√5/(2σ), product=√5/2
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Static edu content
// ─────────────────────────────────────────────────────────────────────────────
const EDU = {

  measure: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Measurement &amp; Uncertainty</p>
        <p class="edu-description">
          The teal wave packet bounces between the dashed walls. Watch the blue
          curve (&psi;(x) real part): it oscillates <em>faster</em> near the centre
          and becomes a smooth hump at the turning points. That is the
          <strong>de&nbsp;Broglie relation</strong> made visible &mdash;
          oscillation frequency &prop; momentum (p&nbsp;=&nbsp;&hbar;k), so
          the wavefunction looks &ldquo;chirped&rdquo; (rapidly oscillating)
          when the particle is moving fast, and flat when it is momentarily
          stationary at the wall.
        </p>
        <p class="edu-description">
          Choose a measurement type and precision, then click
          <strong>&#x25B6;&thinsp;Measure!</strong>
          The outcome is drawn randomly from |&psi;|&sup2;. Both panels update
          simultaneously &mdash; measured variable collapses, conjugate broadens.
        </p>
        <div class="equation">
          &Delta;x &thinsp;&middot;&thinsp; &Delta;p &nbsp;&ge;&nbsp; &hbar;/2
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">de Broglie relation</span>
          <span class="edu-concept-tag">wave packet</span>
          <span class="edu-concept-tag">quantum measurement</span>
          <span class="edu-concept-tag">Born rule</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Heisenberg&rsquo;s microscope</p>
          <p>
            To see an electron, you must scatter a photon off it. Short wavelength
            &rarr; precise position (small &Delta;x) but large momentum kick
            (&Delta;p large). Long wavelength &rarr; gentle (&Delta;p small) but
            blurry (&Delta;x large). Move the Precision slider and watch the
            aperture and ghost consequence update <em>before</em> you fire.
          </p>
        </div>
      </div>
    </div>
  `,

  uncertainty: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Heisenberg Uncertainty Principle</p>
        <p class="edu-description">
          Squeezing the wave packet in position (small &sigma;<sub>x</sub>) forces
          its Fourier transform in momentum space to spread &mdash; and vice versa.
          This is not a measurement limitation; it is a fundamental property of waves.
          The <strong>Gaussian</strong> achieves the minimum product exactly.
        </p>
        <div class="equation">
          &Delta;x &thinsp;&middot;&thinsp; &Delta;p &nbsp;&ge;&nbsp; &hbar;/2
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">wave packet</span>
          <span class="edu-concept-tag">Fourier transform</span>
          <span class="edu-concept-tag">minimum uncertainty</span>
          <span class="edu-concept-tag">Gaussian state</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Real-world consequences</p>
          <p>
            <strong>Electron microscope:</strong> Imaging atoms (&lt;0.1&thinsp;nm)
            requires &Delta;x &lt; 0.1&thinsp;nm, forcing a large transverse kick
            &Delta;p &ge; &hbar;/(2&Delta;x).
          </p>
          <p>
            <strong>Accelerator beams:</strong> Tight focusing (small &Delta;x at
            the collision point) unavoidably creates angular spread (&Delta;p<sub>&perp;</sub>).
          </p>
        </div>
      </div>
    </div>
  `,

  fourier: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">The Fourier Dual</p>
        <p class="edu-description">
          The uncertainty relation is pure mathematics. Any wave obeys the same
          conjugate inequality: spatial width and spectral width of its Fourier
          transform cannot both be small. In the time&ndash;frequency domain:
        </p>
        <div class="equation">
          &Delta;t &thinsp;&middot;&thinsp; &Delta;&nu; &nbsp;&ge;&nbsp; 1/(4&pi;)
        </div>
        <p class="edu-description">
          The <strong>Chirped</strong> shape shows a key subtlety: two states can
          have identical |&psi;(x)|&sup2; yet different momentum spreads. The
          phase &mdash; invisible in |&psi;|&sup2; &mdash; determines &Delta;p.
        </p>
        <div class="edu-concepts">
          <span class="edu-concept-tag">time&ndash;bandwidth product</span>
          <span class="edu-concept-tag">chirp</span>
          <span class="edu-concept-tag">conjugate variables</span>
          <span class="edu-concept-tag">Nobel 2018</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Chirped-pulse amplification (Nobel 2018)</p>
          <p>
            Strickland &amp; Mourou built the world&rsquo;s most intense laser pulses
            by exploiting the time&ndash;frequency dual. A short pulse (small &Delta;t)
            necessarily has a broad spectrum. Chirping stretches it in time so it can
            be amplified safely, then a grating recompresses it to femtosecond duration.
          </p>
        </div>
      </div>
    </div>
  `
};

// Dynamic edu content — generated at fire/restart time
function getMeasureFrozenHTML() {
  const isPosn  = measureType === 'position';
  const outcome = (isPosn ? xMeasured : pMeasured).toFixed(2);
  const varSym  = isPosn ? 'x' : 'p';
  const conjSym = isPosn ? 'p' : 'x';
  const sig0    = measurePrec.toFixed(2);
  const sigConj = (1 / (2 * measurePrec)).toFixed(2);
  return `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Wave Function Collapsed</p>
        <p class="edu-description">
          The particle was found at <strong>${varSym}&nbsp;=&nbsp;${outcome}</strong>.
          The ${isPosn ? 'position' : 'momentum'} distribution snapped to
          &sigma;&nbsp;=&nbsp;${sig0} (your chosen precision), and the conjugate
          variable was immediately forced to
          &Delta;${conjSym}&nbsp;=&nbsp;${sigConj}&thinsp;&mdash;&thinsp;so
          &Delta;x&thinsp;&middot;&thinsp;&Delta;p&nbsp;=&nbsp;&hbar;/2 exactly.
        </p>
        <p class="edu-description">
          Dim dashed curves show the <em>pre-measurement</em> state for comparison.
          Click <strong>&#x25B6;&thinsp;Restart</strong> to watch the
          ${isPosn ? 'position packet spread' : 'momentum eigenstate evolve'} in time.
        </p>
        <div class="equation">
          &Delta;x<sub>after</sub> &middot; &Delta;p<sub>after</sub> = &hbar;/2
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">wave function collapse</span>
          <span class="edu-concept-tag">Born rule</span>
          <span class="edu-concept-tag">minimum uncertainty</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">The Born rule</p>
          <p>
            The outcome ${varSym}&nbsp;=&nbsp;${outcome} was sampled randomly
            from |&psi;|&sup2; &mdash; the Born rule. Had you repeated this
            measurement many times on identical wave packets, outcomes would
            cluster near the centre of the distribution, weighted by |&psi;|&sup2;.
          </p>
          <p>
            A sharper &sigma; constrains the outcome window more tightly, but forces
            an even larger spread on ${conjSym}.
          </p>
        </div>
      </div>
    </div>`;
}

function getMeasureEvolvingHTML() {
  const isPosn = measureType === 'position';
  const sig0   = measurePrec.toFixed(2);
  return `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Free Evolution After Measurement</p>
        <p class="edu-description">
          ${isPosn
            ? `The position packet is spreading. Precise position measurement
               creates a narrow Gaussian — but quantum mechanics immediately disperses
               it. Width grows as &sigma;(t)&nbsp;=&nbsp;${sig0}&thinsp;&radic;(1+(t/2&sigma;<sub>0</sub><sup>2</sup>)<sup>2</sup>).
               The <strong>momentum distribution is fixed</strong>: measurement set &Delta;p
               and free evolution conserves it. &Delta;x&thinsp;&middot;&thinsp;&Delta;p
               climbs above &hbar;/2 as the packet spreads.`
            : `After a momentum measurement, position is delocalized. The position
               distribution is wide and stays wide — a sharp momentum eigenstate
               spreads uniformly in position. The <strong>momentum distribution
               is fixed</strong> at the measured value.`
          }
        </p>
        <div class="equation">
          &sigma;(t) = &sigma;<sub>0</sub>&thinsp;&radic;(1 + (t&thinsp;/&thinsp;2&sigma;<sub>0</sub><sup>2</sup>)<sup>2</sup>)
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">Gaussian spreading</span>
          <span class="edu-concept-tag">free particle</span>
          <span class="edu-concept-tag">uncertainty growth</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Measurement doesn&rsquo;t maintain knowledge</p>
          <p>
            Measurement gives you one instant of position (or momentum) knowledge.
            Immediately after, the wave function evolves and position uncertainty
            grows. You cannot continuously track a quantum particle without
            repeated measurements &mdash; each of which disturbs the conjugate
            variable again.
          </p>
          <p>Hit <strong>&#x21A9;&thinsp;Reset</strong> to try a different precision.</p>
        </div>
      </div>
    </div>`;
}

function updateEduPanel(m) {
  const el = document.getElementById('sim-edu');
  if (!el) return;
  if (m === 'measure_frozen')   { el.innerHTML = getMeasureFrozenHTML();   return; }
  if (m === 'measure_evolving') { el.innerHTML = getMeasureEvolvingHTML(); return; }
  if (EDU[m]) el.innerHTML = EDU[m];
}

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────
let mode  = 'measure';
let shape = 'gaussian';
let sigma = 1.0;
let k0    = 0.0;

let measureType  = 'position';
let measurePrec  = 0.6;
let measurePhase = 'bouncing';   // 'bouncing'|'collapsed_frozen'|'collapsed_evolving'
let bounceT      = 0;
let collapseT    = 0;
let preXc        = 0, prePc = 0;
let xMeasured    = 0, pMeasured = 0;

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const XMIN       = -5,  XMAX = 5;
const PMIN       = -6,  PMAX = 6;
const PLOT_STEP  = 2;
const BOUNCE_AMP   = 2.8;
const BOUNCE_OMEGA = 0.5;
const PART_SIGMA   = 0.7;

// ─────────────────────────────────────────────────────────────────────────────
// Geometry
// ─────────────────────────────────────────────────────────────────────────────
let divX, posP, momP, pxScale, psiAmpScale;

function computeGeometry() {
  divX = floor(width * 0.5);
  const padX = 18, padT = 42, padB = 44;
  const y0 = padT, y1 = height - padB;
  const cy = y0 + (y1 - y0) * 0.60;
  posP = { x0: padX,        x1: divX - padX, y0, y1, cy };
  momP = { x0: divX + padX, x1: width - padX, y0, y1, cy };
  pxScale     = (cy - y0) * 0.75;
  psiAmpScale = pxScale * 0.50;
}

// ─────────────────────────────────────────────────────────────────────────────
// p5 lifecycle
// ─────────────────────────────────────────────────────────────────────────────
function setup() {
  const cont = document.getElementById('canvas-container');
  createCanvas(cont.clientWidth, cont.clientHeight).parent('canvas-container');
  computeGeometry();
  textFont('Courier New');
  updateEduPanel('measure');
}

function windowResized() {
  const cont = document.getElementById('canvas-container');
  resizeCanvas(cont.clientWidth, cont.clientHeight);
  computeGeometry();
}

// ─────────────────────────────────────────────────────────────────────────────
// Physics — explore mode
// ─────────────────────────────────────────────────────────────────────────────
function computeUncertainties() {
  let dx, dp;
  if (shape === 'gaussian') {
    dx = sigma; dp = 1 / (2 * sigma);
  } else if (shape === 'twopeak') {
    dx = sigma * Math.SQRT2; dp = 1 / (2 * sigma);
  } else {
    dx = sigma; dp = Math.sqrt(5) / (2 * sigma);
  }
  return { dx, dp, product: dx * dp };
}

function posDistNorm(x) {
  if (shape !== 'twopeak') return Math.exp(-x * x / (2 * sigma * sigma));
  const d = sigma;
  const A = Math.exp(-(x-d)*(x-d) / (4*sigma*sigma));
  const B = Math.exp(-(x+d)*(x+d) / (4*sigma*sigma));
  return (A+B)*(A+B) / (4*Math.exp(-0.5));
}

function psiRealNorm(x) {
  if (shape === 'gaussian') return Math.exp(-x*x/(4*sigma*sigma)) * Math.cos(k0*x);
  if (shape === 'twopeak') {
    const d = sigma;
    const A = Math.exp(-(x-d)*(x-d)/(4*sigma*sigma));
    const B = Math.exp(-(x+d)*(x+d)/(4*sigma*sigma));
    return ((A+B)/(2*Math.exp(-0.25))) * Math.cos(k0*x);
  }
  const alpha = 1/(sigma*sigma);
  return Math.exp(-x*x/(4*sigma*sigma)) * Math.cos(k0*x + alpha*x*x/2);
}

function momDistNorm(p) {
  const dk = p - k0;
  if (shape === 'gaussian') {
    const dp = 1/(2*sigma);
    return Math.exp(-dk*dk/(2*dp*dp));
  }
  if (shape === 'twopeak') {
    const c = Math.cos(dk*sigma);
    return c*c * Math.exp(-dk*dk*sigma*sigma);
  }
  const alpha = 1/(sigma*sigma);
  const dp2 = 1/(4*sigma*sigma) + alpha*alpha*sigma*sigma;
  return Math.exp(-dk*dk/(2*dp2));
}

// ─────────────────────────────────────────────────────────────────────────────
// Physics — measure mode
// ─────────────────────────────────────────────────────────────────────────────
function getBounceCenters(t) {
  return {
    xc: BOUNCE_AMP * Math.cos(BOUNCE_OMEGA * t),
    pc: -BOUNCE_AMP * BOUNCE_OMEGA * Math.sin(BOUNCE_OMEGA * t)
  };
}

function sampleGaussian(mu, sig) {
  const u1 = Math.random() || 1e-10;
  return mu + sig * Math.sqrt(-2*Math.log(u1)) * Math.cos(2*Math.PI*Math.random());
}

function spreadSigma(sigma0, tPhys) {
  return sigma0 * Math.sqrt(1 + Math.pow(tPhys/(2*sigma0*sigma0), 2));
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM helpers
// ─────────────────────────────────────────────────────────────────────────────
function readControls() {
  sigma = +document.getElementById('sigma-x').value;
  k0    = +document.getElementById('k0').value;
  document.getElementById('sigma-x-val').textContent = sigma.toFixed(2);
  document.getElementById('k0-val').textContent      = k0.toFixed(1);
  const { dx, dp, product } = computeUncertainties();
  document.getElementById('delta-x-val').textContent = dx.toFixed(3);
  document.getElementById('delta-p-val').textContent = dp.toFixed(3);
  const ratio = product * 2;
  const span  = document.getElementById('delta-xp-val');
  span.textContent = ratio.toFixed(3) + ' \u0127/2';
  const pill = document.getElementById('delta-xp-pill');
  if (ratio < 1.03) {
    pill.style.color = '#58a6ff'; pill.style.borderColor = 'rgba(88,166,255,0.35)';
  } else {
    pill.style.color = 'rgb(255,150,50)'; pill.style.borderColor = 'rgba(255,150,50,0.45)';
  }
}

function readMeasureControls() {
  measurePrec = +document.getElementById('measure-prec').value;
  document.getElementById('measure-prec-val').textContent = measurePrec.toFixed(2);
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing helpers
// ─────────────────────────────────────────────────────────────────────────────
function drawDivider() {
  stroke(30, 38, 50); strokeWeight(1);
  line(divX, 0, divX, height);
}

function drawPanelTitle(p, title) {
  noStroke(); fill(130, 145, 165); textSize(12); textAlign(CENTER);
  text(title, (p.x0+p.x1)/2, p.y0 - 10);
  textAlign(LEFT);
}

function drawAxisTicks(p, domMin, domMax, axisLabel) {
  stroke(42,50,62); strokeWeight(1);
  line(p.x0, p.cy, p.x1, p.cy);
  line(p.x0, p.y1, p.x1, p.y1);
  const tickSpacing = (domMax-domMin) <= 10 ? 2 : 3;
  textSize(9); textAlign(CENTER);
  for (let v = Math.ceil(domMin/tickSpacing)*tickSpacing; v <= domMax; v += tickSpacing) {
    const px = map(v, domMin, domMax, p.x0, p.x1);
    stroke(42,50,62); strokeWeight(1); line(px, p.y1-4, px, p.y1);
    noStroke(); fill(65,80,100); text(v, px, p.y1+11);
  }
  noStroke(); fill(80,95,115); textSize(9); textAlign(RIGHT);
  text(axisLabel, p.x1, p.y1+11);
  textAlign(LEFT);
}

function drawDistFill(p, fn, domMin, domMax) {
  const panW = p.x1-p.x0;
  noStroke(); fill(45,215,135,35); beginShape();
  vertex(p.x0, p.cy);
  for (let px = 0; px <= panW; px += PLOT_STEP)
    vertex(p.x0+px, p.cy - fn(map(px,0,panW,domMin,domMax))*pxScale);
  vertex(p.x1, p.cy); endShape(CLOSE);
}

function drawDistStroke(p, fn, domMin, domMax) {
  const panW = p.x1-p.x0;
  stroke(45,215,135,200); strokeWeight(2); noFill(); beginShape();
  for (let px = 0; px <= panW; px += PLOT_STEP)
    vertex(p.x0+px, p.cy - fn(map(px,0,panW,domMin,domMax))*pxScale);
  endShape();
}

function drawDistGhostTeal(p, fn, domMin, domMax) {
  const panW = p.x1-p.x0;
  drawingContext.setLineDash([2,5]);
  stroke(45,215,135,55); strokeWeight(1.5); noFill(); beginShape();
  for (let px = 0; px <= panW; px += PLOT_STEP)
    vertex(p.x0+px, p.cy - fn(map(px,0,panW,domMin,domMax))*pxScale);
  endShape(); drawingContext.setLineDash([]);
}

function drawDistGhostPurple(p, fn, domMin, domMax) {
  const panW = p.x1-p.x0;
  drawingContext.setLineDash([3,4]);
  stroke(170,65,255,130); strokeWeight(1.5); noFill(); beginShape();
  for (let px = 0; px <= panW; px += PLOT_STEP)
    vertex(p.x0+px, p.cy - fn(map(px,0,panW,domMin,domMax))*pxScale);
  endShape(); drawingContext.setLineDash([]);
}

function drawPsiRealFn(p, fn, domMin, domMax) {
  const panW = p.x1-p.x0;
  stroke(88,166,255); strokeWeight(1.5); noFill(); beginShape();
  for (let px = 0; px <= panW; px += PLOT_STEP)
    vertex(p.x0+px, p.cy - fn(map(px,0,panW,domMin,domMax))*psiAmpScale);
  endShape();
}

function drawBracket(x1, x2, y, label) {
  if (x2-x1 < 6) return;
  stroke(170,65,255); strokeWeight(1.5);
  line(x1,y,x2,y);
  const aw=5;
  line(x1,y,x1+aw,y-aw*0.7); line(x1,y,x1+aw,y+aw*0.7);
  line(x2,y,x2-aw,y-aw*0.7); line(x2,y,x2-aw,y+aw*0.7);
  noStroke(); fill(170,65,255); textSize(11); textAlign(CENTER);
  text(label, (x1+x2)/2, y-7);
  textAlign(LEFT);
}

function drawDeltaLines(p, domMin, domMax, center, delta) {
  const v1 = map(center-delta, domMin, domMax, p.x0, p.x1);
  const v2 = map(center+delta, domMin, domMax, p.x0, p.x1);
  drawingContext.setLineDash([3,5]);
  stroke(170,65,255,140); strokeWeight(1);
  if (v1>=p.x0&&v1<=p.x1) line(v1, p.y0+24, v1, p.y1-5);
  if (v2>=p.x0&&v2<=p.x1) line(v2, p.y0+24, v2, p.y1-5);
  drawingContext.setLineDash([]);
}

// Legend drawn in lower-left of position panel (below zero-line)
function drawLegend(includeGhost) {
  const lx  = posP.x0 + 8;
  const lyBase = posP.cy + (posP.y1 - posP.cy) * 0.72;
  const spc = 14, len = 16;
  let ly = lyBase;

  // ψ(x) — accent blue
  stroke(88,166,255); strokeWeight(1.5); line(lx, ly, lx+len, ly);
  noStroke(); fill(88,166,255,190); textSize(9); textAlign(LEFT);
  text('\u03C8(x) real part', lx+len+4, ly+3);
  ly += spc;

  // |ψ|² — teal
  stroke(45,215,135,200); strokeWeight(2); line(lx, ly, lx+len, ly);
  noStroke(); fill(45,215,135,190);
  text('|\u03C8|\u00B2  /  |\u03C6|\u00B2', lx+len+4, ly+3);
  ly += spc;

  if (includeGhost) {
    drawingContext.setLineDash([2,4]);
    stroke(45,215,135,60); strokeWeight(1.5); line(lx, ly, lx+len, ly);
    drawingContext.setLineDash([]);
    noStroke(); fill(45,215,135,110);
    text('pre-measurement', lx+len+4, ly+3);
  }
  textAlign(LEFT);
}

// Box walls (subtle dashed lines at ±BOUNCE_AMP on position panel)
function drawBounceWalls() {
  const wL = map(-BOUNCE_AMP, XMIN, XMAX, posP.x0, posP.x1);
  const wR = map( BOUNCE_AMP, XMIN, XMAX, posP.x0, posP.x1);
  drawingContext.setLineDash([2,7]);
  stroke(48,62,82); strokeWeight(1);
  line(wL, posP.y0+26, wL, posP.y1);
  line(wR, posP.y0+26, wR, posP.y1);
  drawingContext.setLineDash([]);
}

// Product + status area at canvas bottom
function drawBottomInfo(ratio, statusMsg) {
  // Δx·Δp centered, just below axis tick labels
  const byProd = height - 22;
  const byStatus = height - 7;
  noStroke();
  fill(ratio < 1.03 ? color(88,166,255) : color(255,150,50));
  textSize(10); textAlign(CENTER);
  text('\u0394x\u00B7\u0394p = ' + ratio.toFixed(2) + ' \u0127/2', width/2, byProd);
  fill(72,88,108); textSize(9);
  text(statusMsg, width/2, byStatus);
  textAlign(LEFT);
}

// ─────────────────────────────────────────────────────────────────────────────
// Explore mode panels
// ─────────────────────────────────────────────────────────────────────────────
function drawPositionPanel() {
  const { dx } = computeUncertainties();
  drawPanelTitle(posP, 'Position space   |\u03C8(x)|\u00B2');
  drawAxisTicks(posP, XMIN, XMAX, 'x');
  drawDistFill(posP, posDistNorm, XMIN, XMAX);
  drawPsiRealFn(posP, psiRealNorm, XMIN, XMAX);
  drawDistStroke(posP, posDistNorm, XMIN, XMAX);
  drawLegend(false);
  const dxPx = dx*(posP.x1-posP.x0)/(XMAX-XMIN);
  const cxPx = (posP.x0+posP.x1)/2;
  drawBracket(cxPx-dxPx, cxPx+dxPx, posP.y0+16, '\u0394x');
  drawDeltaLines(posP, XMIN, XMAX, 0, dx);
}

function drawMomentumPanel() {
  const { dp } = computeUncertainties();
  drawPanelTitle(momP, 'Momentum space   |\u03C6(p)|\u00B2');
  drawAxisTicks(momP, PMIN, PMAX, 'p');
  drawDistFill(momP, momDistNorm, PMIN, PMAX);
  drawDistStroke(momP, momDistNorm, PMIN, PMAX);
  const dpPx = dp*(momP.x1-momP.x0)/(PMAX-PMIN);
  const k0Px = map(k0, PMIN, PMAX, momP.x0, momP.x1);
  drawBracket(k0Px-dpPx, k0Px+dpPx, momP.y0+16, '\u0394p');
  drawDeltaLines(momP, PMIN, PMAX, k0, dp);
}

// ─────────────────────────────────────────────────────────────────────────────
// Measure mode — bouncing
// ─────────────────────────────────────────────────────────────────────────────
function drawMeasureBouncingState() {
  const { xc, pc } = getBounceCenters(bounceT);
  const dp_part = 1/(2*PART_SIGMA);
  const posFn   = x => Math.exp(-(x-xc)*(x-xc)/(2*PART_SIGMA*PART_SIGMA));
  const psiRB   = x => Math.exp(-(x-xc)*(x-xc)/(4*PART_SIGMA*PART_SIGMA)) * Math.cos(pc*(x-xc));
  const momFn   = p => Math.exp(-(p-pc)*(p-pc)/(2*dp_part*dp_part));

  // Position panel
  drawPanelTitle(posP, 'Position space   |\u03C8(x)|\u00B2');
  drawAxisTicks(posP, XMIN, XMAX, 'x');
  drawBounceWalls();
  drawDistFill(posP, posFn, XMIN, XMAX);
  drawPsiRealFn(posP, psiRB, XMIN, XMAX);
  drawDistStroke(posP, posFn, XMIN, XMAX);
  drawLegend(false);

  // Δx bracket for particle
  const dxPx = PART_SIGMA*(posP.x1-posP.x0)/(XMAX-XMIN);
  const cxCvs = map(xc, XMIN, XMAX, posP.x0, posP.x1);
  drawBracket(cxCvs-dxPx, cxCvs+dxPx, posP.y0+16, '\u0394x');

  // Momentum panel
  drawPanelTitle(momP, 'Momentum space   |\u03C6(p)|\u00B2');
  drawAxisTicks(momP, PMIN, PMAX, 'p');
  drawDistFill(momP, momFn, PMIN, PMAX);
  drawDistStroke(momP, momFn, PMIN, PMAX);
  const dpPx = dp_part*(momP.x1-momP.x0)/(PMAX-PMIN);
  const pcCvs = map(pc, PMIN, PMAX, momP.x0, momP.x1);
  drawBracket(pcCvs-dpPx, pcCvs+dpPx, momP.y0+16, '\u0394p');

  // Aperture overlay
  drawMeasureAperture(xc, pc);

  // Bottom info
  drawBottomInfo(PART_SIGMA*dp_part*2, 'Set precision and fire \u2014 outcome is random, sampled from |\u03C8|\u00B2');
}

function drawMeasureAperture(xc, pc) {
  if (measureType === 'position') {
    const hw   = measurePrec*(posP.x1-posP.x0)/(XMAX-XMIN);
    const cx   = map(xc, XMIN, XMAX, posP.x0, posP.x1);
    const ax0  = max(posP.x0, cx-hw), ax1 = min(posP.x1, cx+hw);
    noStroke(); fill(170,65,255,22);
    rect(ax0, posP.y0+22, ax1-ax0, posP.y1-posP.y0-22);
    drawingContext.setLineDash([4,4]);
    stroke(170,65,255,190); strokeWeight(1.5);
    line(ax0, posP.y0+22, ax0, posP.y1);
    line(ax1, posP.y0+22, ax1, posP.y1);
    drawingContext.setLineDash([]);
    noStroke(); fill(170,65,255,210); textSize(10); textAlign(CENTER);
    text('\u03C3_meas = '+measurePrec.toFixed(2), cx, posP.y0+34);
    textAlign(LEFT);

    const dp_after = 1/(2*measurePrec);
    drawDistGhostPurple(momP, p => Math.exp(-(p-pc)*(p-pc)/(2*dp_after*dp_after)), PMIN, PMAX);
    noStroke(); fill(170,65,255,175); textSize(10); textAlign(CENTER);
    text('\u0394p \u2248 '+dp_after.toFixed(2)+' after', (momP.x0+momP.x1)/2, momP.y0+34);
    textAlign(LEFT);
  } else {
    const hw   = measurePrec*(momP.x1-momP.x0)/(PMAX-PMIN);
    const cx   = map(pc, PMIN, PMAX, momP.x0, momP.x1);
    const ax0  = max(momP.x0, cx-hw), ax1 = min(momP.x1, cx+hw);
    noStroke(); fill(170,65,255,22);
    rect(ax0, momP.y0+22, ax1-ax0, momP.y1-momP.y0-22);
    drawingContext.setLineDash([4,4]);
    stroke(170,65,255,190); strokeWeight(1.5);
    line(ax0, momP.y0+22, ax0, momP.y1);
    line(ax1, momP.y0+22, ax1, momP.y1);
    drawingContext.setLineDash([]);
    noStroke(); fill(170,65,255,210); textSize(10); textAlign(CENTER);
    text('\u03C3_meas = '+measurePrec.toFixed(2), cx, momP.y0+34);
    textAlign(LEFT);

    const dx_after = 1/(2*measurePrec);
    drawDistGhostPurple(posP, x => Math.exp(-(x-xc)*(x-xc)/(2*dx_after*dx_after)), XMIN, XMAX);
    noStroke(); fill(170,65,255,175); textSize(10); textAlign(CENTER);
    text('\u0394x \u2248 '+dx_after.toFixed(2)+' after', (posP.x0+posP.x1)/2, posP.y0+34);
    textAlign(LEFT);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Measure mode — collapsed (frozen or evolving)
// ─────────────────────────────────────────────────────────────────────────────
function drawMeasureCollapsedState() {
  const T_SCALE = 0.35;
  const tPhys   = collapseT * T_SCALE;
  const prePosFn = x => Math.exp(-(x-preXc)*(x-preXc)/(2*PART_SIGMA*PART_SIGMA));
  const preMomFn = p => { const dp=1/(2*PART_SIGMA); return Math.exp(-(p-prePc)*(p-prePc)/(2*dp*dp)); };

  if (measureType === 'position') {
    const sigma_t  = spreadSigma(measurePrec, tPhys);
    const xCenter  = xMeasured + prePc*tPhys;
    const dp_after = 1/(2*measurePrec);
    const postPosFn = x => Math.exp(-(x-xCenter)*(x-xCenter)/(2*sigma_t*sigma_t));
    const postMomFn = p => Math.exp(-(p-prePc)*(p-prePc)/(2*dp_after*dp_after));
    const psiPost   = x => Math.exp(-(x-xCenter)*(x-xCenter)/(4*sigma_t*sigma_t)) * Math.cos(prePc*(x-xMeasured));

    drawPanelTitle(posP, 'Position space   |\u03C8(x)|\u00B2');
    drawAxisTicks(posP, XMIN, XMAX, 'x');
    drawBounceWalls();
    drawDistGhostTeal(posP, prePosFn, XMIN, XMAX);
    drawDistFill(posP, postPosFn, XMIN, XMAX);
    drawPsiRealFn(posP, psiPost, XMIN, XMAX);
    drawDistStroke(posP, postPosFn, XMIN, XMAX);
    drawLegend(true);

    drawPanelTitle(momP, 'Momentum space   |\u03C6(p)|\u00B2');
    drawAxisTicks(momP, PMIN, PMAX, 'p');
    drawDistGhostTeal(momP, preMomFn, PMIN, PMAX);
    drawDistFill(momP, postMomFn, PMIN, PMAX);
    drawDistStroke(momP, postMomFn, PMIN, PMAX);

    // Brackets
    const xCvs = map(xCenter, XMIN, XMAX, posP.x0, posP.x1);
    const dxBr = sigma_t*(posP.x1-posP.x0)/(XMAX-XMIN);
    drawBracket(max(posP.x0+2,xCvs-dxBr), min(posP.x1-2,xCvs+dxBr),
                posP.y0+16, '\u0394x='+sigma_t.toFixed(2));
    const pCvs = map(prePc, PMIN, PMAX, momP.x0, momP.x1);
    const dpBr = dp_after*(momP.x1-momP.x0)/(PMAX-PMIN);
    drawBracket(max(momP.x0+2,pCvs-dpBr), min(momP.x1-2,pCvs+dpBr),
                momP.y0+16, '\u0394p='+dp_after.toFixed(2));

    const ratio   = sigma_t*dp_after*2;
    const statusMsg = measurePhase === 'collapsed_frozen'
      ? 'Collapsed at x\u202F=\u202F'+xMeasured.toFixed(2)+'\u2003\u2014\u2003click \u25B6 Restart to watch spreading'
      : '\u0394x spreading\u2003\u2014\u2003\u0394p fixed';
    drawBottomInfo(ratio, statusMsg);

  } else {
    const dx_after  = 1/(2*measurePrec);
    const postPosFn = x => Math.exp(-(x-preXc)*(x-preXc)/(2*dx_after*dx_after));
    const postMomFn = p => Math.exp(-(p-pMeasured)*(p-pMeasured)/(2*measurePrec*measurePrec));

    drawPanelTitle(posP, 'Position space   |\u03C8(x)|\u00B2');
    drawAxisTicks(posP, XMIN, XMAX, 'x');
    drawDistGhostTeal(posP, prePosFn, XMIN, XMAX);
    drawDistFill(posP, postPosFn, XMIN, XMAX);
    drawDistStroke(posP, postPosFn, XMIN, XMAX);
    drawLegend(true);

    drawPanelTitle(momP, 'Momentum space   |\u03C6(p)|\u00B2');
    drawAxisTicks(momP, PMIN, PMAX, 'p');
    drawDistGhostTeal(momP, preMomFn, PMIN, PMAX);
    drawDistFill(momP, postMomFn, PMIN, PMAX);
    drawDistStroke(momP, postMomFn, PMIN, PMAX);

    const xCvs = map(preXc, XMIN, XMAX, posP.x0, posP.x1);
    const dxBr = dx_after*(posP.x1-posP.x0)/(XMAX-XMIN);
    drawBracket(max(posP.x0+2,xCvs-dxBr), min(posP.x1-2,xCvs+dxBr),
                posP.y0+16, '\u0394x='+dx_after.toFixed(2));
    const pCvs = map(pMeasured, PMIN, PMAX, momP.x0, momP.x1);
    const dpBr = measurePrec*(momP.x1-momP.x0)/(PMAX-PMIN);
    drawBracket(max(momP.x0+2,pCvs-dpBr), min(momP.x1-2,pCvs+dpBr),
                momP.y0+16, '\u0394p='+measurePrec.toFixed(2));

    const ratio = dx_after*measurePrec*2;
    const statusMsg = measurePhase === 'collapsed_frozen'
      ? 'Collapsed at p\u202F=\u202F'+pMeasured.toFixed(2)+'\u2003\u2014\u2003position now delocalized'
      : 'Position delocalized\u2003\u2014\u2003\u0394p fixed';
    drawBottomInfo(ratio, statusMsg);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main draw loop
// ─────────────────────────────────────────────────────────────────────────────
function draw() {
  background(17, 24, 32);
  drawDivider();
  if (mode === 'measure') {
    readMeasureControls();
    if (measurePhase === 'bouncing') {
      bounceT += deltaTime / 1000;
      drawMeasureBouncingState();
    } else {
      if (measurePhase === 'collapsed_evolving') collapseT += deltaTime / 1000;
      drawMeasureCollapsedState();
    }
  } else {
    readControls();
    drawPositionPanel();
    drawMomentumPanel();
    const { product } = computeUncertainties();
    drawBottomInfo(product*2, shape === 'gaussian' ? 'Gaussian: minimum uncertainty state' :
                              shape === 'twopeak'  ? 'Two-peak: above minimum (\u0394x\u00B7\u0394p > \u0127/2)' :
                                                     'Chirped: above minimum (\u0394x\u00B7\u0394p > \u0127/2)');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Event handlers
// ─────────────────────────────────────────────────────────────────────────────
function setMode(m) {
  mode = m;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('mode-btn-'+m);
  if (btn) btn.classList.add('active');
  const expCtrl  = document.getElementById('explore-controls');
  const measCtrl = document.getElementById('measure-controls');
  if (m === 'measure') {
    if (expCtrl)  expCtrl.style.display  = 'none';
    if (measCtrl) measCtrl.style.display = 'block';
    resetMeasure();
  } else {
    if (expCtrl)  expCtrl.style.display  = 'block';
    if (measCtrl) measCtrl.style.display = 'none';
    updateEduPanel(m);
  }
}

function setShape(s) {
  shape = s;
  document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('shape-btn-'+s);
  if (btn) btn.classList.add('active');
}

function setMeasureType(t) {
  measureType = t;
  document.querySelectorAll('.mtype-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('mtype-btn-'+t);
  if (btn) btn.classList.add('active');
  // Update slider label and hint
  const varLbl = document.getElementById('prec-var-label');
  const hint   = document.getElementById('prec-hint');
  if (varLbl) varLbl.textContent = t === 'position' ? '\u0394x' : '\u0394p';
  if (hint) hint.innerHTML = t === 'position'
    ? 'coarse x &larr;&ensp;&rarr; sharp x &ensp;&middot;&ensp; &Delta;p&thinsp;=&thinsp;1/(2&Delta;x)'
    : 'coarse p &larr;&ensp;&rarr; sharp p &ensp;&middot;&ensp; &Delta;x&thinsp;=&thinsp;1/(2&Delta;p)';
}

function fireMeasure() {
  if (measurePhase !== 'bouncing') return;
  const { xc, pc } = getBounceCenters(bounceT);
  preXc = xc; prePc = pc;
  if (measureType === 'position') {
    xMeasured = Math.max(XMIN+0.3, Math.min(XMAX-0.3, sampleGaussian(xc, PART_SIGMA)));
  } else {
    const dp_part = 1/(2*PART_SIGMA);
    pMeasured = Math.max(PMIN+0.3, Math.min(PMAX-0.3, sampleGaussian(pc, dp_part)));
  }
  measurePhase = 'collapsed_frozen';
  collapseT    = 0;
  document.getElementById('fire-btn').style.display    = 'none';
  document.getElementById('restart-btn').style.display = 'block';
  document.getElementById('reset-btn').style.display   = 'block';
  updateEduPanel('measure_frozen');
}

function restartEvolution() {
  if (measurePhase !== 'collapsed_frozen') return;
  measurePhase = 'collapsed_evolving';
  collapseT    = 0;
  document.getElementById('restart-btn').style.display = 'none';
  updateEduPanel('measure_evolving');
}

function resetMeasure() {
  measurePhase = 'bouncing';
  bounceT = collapseT = 0;
  const fire    = document.getElementById('fire-btn');
  const restart = document.getElementById('restart-btn');
  const reset   = document.getElementById('reset-btn');
  if (fire)    fire.style.display    = 'block';
  if (restart) restart.style.display = 'none';
  if (reset)   reset.style.display   = 'none';
  updateEduPanel('measure');
}
