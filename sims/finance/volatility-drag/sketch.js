// ─────────────────────────────────────────────────────────────────────────────
// Volatility Drag — sketch.js
//
// Finance/physics links:
//   g = mu - sigma^2 / 2  (geometric mean)
//   V_arith = V0 * exp(mu * T)
//   V_geom  = V0 * exp(g  * T)
//   log(V_T) ~ N((mu - sigma^2/2)T, sigma^2 T)
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Edu content
// ─────────────────────────────────────────────────────────────────────────────
const EDU = {

  jensen: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Jensen's Inequality &amp; Volatility Drag</p>
        <p class="edu-description">
          Compounding is a curved function: multiplying by (1 + r) each year is not
          the same as adding the average return. Jensen's inequality says the
          average of a curved function is less than the function of the average.
          The exact cost is the drag term &sigma;<sup>2</sup>/2 per year.
          Over long horizons, that gap compounds just like a negative return.
        </p>
        <div class="equation">
          g = &mu; &minus; &sigma;<sup>2</sup>/2
          &nbsp;&nbsp; V<sub>geom</sub> = V<sub>0</sub> e<sup>gT</sup>
        </div>
        <div class="param-hint param-hint-teal">
          Default: &mu; = 10%, &sigma; = 20%, T = 25 years.
          The geometric mean is 8% even though the arithmetic mean is 10%.
          The red shaded gap is the volatility tax.
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">Jensen's inequality</span>
          <span class="edu-concept-tag">geometric mean</span>
          <span class="edu-concept-tag">compounding</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Diversification</p>
          <p>
            Lowering volatility raises the geometric return without changing the
            arithmetic average. This is why diversification and rebalancing can
            improve long-run growth even if the average return stays the same.
          </p>
        </div>
      </div>
    </div>
  `,

  entropy: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Volatility is Entropy</p>
        <p class="edu-description">
          The same &sigma;<sup>2</sup>/2 term appears in stochastic calculus and in
          entropy production. A volatile portfolio diffuses like a gas: each year is
          a random kick, and the distribution of wealth spreads out over time.
          The drag is the cost of that irreversibility.
        </p>
        <div class="equation">
          d(ln S) = (&mu; &minus; &sigma;<sup>2</sup>/2) dt + &sigma; dW
        </div>
        <div class="param-hint param-hint-teal">
          Increase &sigma; while holding &mu; fixed. The geometric mean drops even
          though the arithmetic mean does not. Volatility is entropy in disguise.
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">Ito correction</span>
          <span class="edu-concept-tag">entropy production</span>
          <span class="edu-concept-tag">diffusion</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Heat engine analogy</p>
          <p>
            In thermodynamics, entropy measures the part of energy you cannot
            turn into work. In finance, &sigma;<sup>2</sup>/2 is the part of return
            you cannot turn into long-run growth.
          </p>
        </div>
      </div>
    </div>
  `,

  lognormal: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">The Log-Normal Distribution</p>
        <p class="edu-description">
          After T years, portfolio values follow a log-normal distribution.
          The arithmetic mean sits in the right tail, while the geometric mean
          is the peak and the median. On a log scale, the growth lines appear
          straight and the drag gap becomes obvious.
        </p>
        <div class="equation">
          log(V<sub>T</sub>) ~ N((&mu; &minus; &sigma;<sup>2</sup>/2)T, &sigma;<sup>2</sup>T)
        </div>
        <div class="param-hint param-hint-teal">
          Drag the time marker on the left panel to compare arithmetic vs
          geometric values at different horizons.
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">log-normal</span>
          <span class="edu-concept-tag">median vs mean</span>
          <span class="edu-concept-tag">distribution shift</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Misleading averages</p>
          <p>
            A small number of spectacular outcomes can pull the mean far to the
            right. Most investors experience the geometric mean, not the average.
          </p>
        </div>
      </div>
    </div>
  `,

  models: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Distribution Models</p>
        <p class="edu-description">
          This sim lets you pick how annual log-returns are distributed. The choice changes
          how often extreme outcomes occur and whether the distribution is symmetric.
          The mean return and volatility are held fixed so you can see how <em>shape</em>
          affects typical outcomes.
        </p>
        <div class="equation">
          Selected model: <span id="edu-model-name">Log-normal</span>
        </div>
        <div class="param-hint param-hint-teal">
          Log-normal is the classic baseline. Skew-normal tilts the distribution (more
          downside or upside). Student-t adds fat tails, making rare crashes and booms
          more common than a normal curve would predict. Use the Skew and Tail sliders
          to see how asymmetry and tail thickness reshape the curve.
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">skew</span>
          <span class="edu-concept-tag">fat tails</span>
          <span class="edu-concept-tag">model risk</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Why it matters</p>
          <p>
            Two markets can share the same mean and volatility but behave very differently.
            Skew changes how often big losses happen; fat tails make extreme events far more
            likely. This is why risk management cares about the <em>shape</em> of returns,
            not just their average and variance.
          </p>
        </div>
      </div>
    </div>
  `,
};

function updateEduPanel(mode) {
  const el = document.getElementById('sim-edu');
  if (el && EDU[mode]) el.innerHTML = EDU[mode];
}

// ─────────────────────────────────────────────────────────────────────────────
// Simulation state
// ─────────────────────────────────────────────────────────────────────────────
let muPct = 10.0;
let sigmaPct = 20.0;
let TYears = 25;
let showEnsemble = true;
let NPaths = 50;
let modelKey = 'lognormal';
let skewAlpha = 4.0;
let tailDf = 4;

const V0 = 1000;
let paths = [];
let arithPath = [];
let geomPath = [];
let pathDirty = true;

let timeMarker = TYears * (2 / 3);
let draggingMarker = false;

// ─────────────────────────────────────────────────────────────────────────────
// Geometry
// ─────────────────────────────────────────────────────────────────────────────
let g = {};

function computeGeometry() {
  const W = width, H = height;
  const leftW = Math.floor(W * 0.55);

  g.left = { x0: 38, x1: leftW - 16, y0: 40, y1: H - 52 };
  g.right = { x0: leftW + 20, x1: W - 22, y0: 40, y1: H - 52 };
  g.left.W = g.left.x1 - g.left.x0;
  g.left.H = g.left.y1 - g.left.y0;
  g.right.W = g.right.x1 - g.right.x0;
  g.right.H = g.right.y1 - g.right.y0;
  g.divX = leftW;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────
function gaussianRandom() {
  const u1 = Math.random() || 1e-10;
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * Math.random());
}

function erf(x) {
  const sign = x >= 0 ? 1 : -1;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * Math.abs(x));
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);
  return sign * y;
}

function normalCdf(x) {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function normalPdf(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function skewNormalSample(alpha) {
  const delta = alpha / Math.sqrt(1 + alpha * alpha);
  const u0 = gaussianRandom();
  const u1 = gaussianRandom();
  const z = delta * Math.abs(u0) + Math.sqrt(1 - delta * delta) * u1;
  const mean = delta * Math.sqrt(2 / Math.PI);
  const variance = 1 - (2 * delta * delta) / Math.PI;
  return (z - mean) / Math.sqrt(variance);
}

function skewNormalPdf(z, alpha) {
  const delta = alpha / Math.sqrt(1 + alpha * alpha);
  const mean = delta * Math.sqrt(2 / Math.PI);
  const variance = 1 - (2 * delta * delta) / Math.PI;
  const std = Math.sqrt(variance);
  const zRaw = z * std + mean;
  const pdfRaw = 2 * normalPdf(zRaw) * normalCdf(alpha * zRaw);
  return pdfRaw * std;
}

function chiSquareSample(df) {
  let sum = 0;
  for (let i = 0; i < df; i++) {
    const n = gaussianRandom();
    sum += n * n;
  }
  return sum;
}

function studentTSample(df) {
  const z = gaussianRandom();
  const v = chiSquareSample(df);
  const t = z / Math.sqrt(v / df);
  const variance = df / (df - 2);
  return t / Math.sqrt(variance);
}

function studentTPdf(z, df) {
  const variance = df / (df - 2);
  const std = Math.sqrt(variance);
  const zRaw = z * std;
  const coeff = gamma((df + 1) / 2) / (Math.sqrt(df * Math.PI) * gamma(df / 2));
  const pdfRaw = coeff * Math.pow(1 + (zRaw * zRaw) / df, -(df + 1) / 2);
  return pdfRaw * std;
}

function gamma(x) {
  const p = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    0.000009984369578019572,
    0.00000015056327351493116,
  ];
  if (x < 0.5) {
    return Math.PI / (Math.sin(Math.PI * x) * gamma(1 - x));
  }
  x -= 1;
  let a = p[0];
  const g = 7;
  for (let i = 1; i < p.length; i++) {
    a += p[i] / (x + i);
  }
  const t = x + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, x + 0.5) * Math.exp(-t) * a;
}

function sampleZ() {
  if (modelKey === 'skew') return skewNormalSample(skewAlpha);
  if (modelKey === 'fattail') return studentTSample(tailDf);
  return gaussianRandom();
}

function pdfZ(z) {
  if (modelKey === 'skew') return skewNormalPdf(z, skewAlpha);
  if (modelKey === 'fattail') return studentTPdf(z, tailDf);
  return normalPdf(z);
}

function logReturn(mu, sigma) {
  return (mu - (sigma * sigma) / 2) + sigma * sampleZ();
}

function logYtoCanvas(V, Vmin, Vmax, yTop, yBot) {
  const frac = (Math.log(V) - Math.log(Vmin)) / (Math.log(Vmax) - Math.log(Vmin));
  return yBot - frac * (yBot - yTop);
}

function formatPct(v) {
  return (v * 100).toFixed(1);
}

function formatMoney(v) {
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}k`;
  return `$${v.toFixed(0)}`;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// ─────────────────────────────────────────────────────────────────────────────
// Paths
// ─────────────────────────────────────────────────────────────────────────────
function generatePaths() {
  const mu = muPct / 100;
  const sigma = sigmaPct / 100;
  const gMean = mu - (sigma * sigma) / 2;

  arithPath = new Array(TYears + 1);
  geomPath = new Array(TYears + 1);

  for (let t = 0; t <= TYears; t++) {
    arithPath[t] = V0 * Math.exp(mu * t);
    geomPath[t] = V0 * Math.exp(gMean * t);
  }

  paths = [];
  for (let i = 0; i < NPaths; i++) {
    const path = new Array(TYears + 1);
    path[0] = V0;
    for (let t = 1; t <= TYears; t++) {
      path[t] = path[t - 1] * Math.exp(logReturn(mu, sigma));
    }
    paths.push(path);
  }

  if (timeMarker > TYears) timeMarker = TYears;
  pathDirty = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Controls
// ─────────────────────────────────────────────────────────────────────────────
function readControls() {
  const muEl = document.getElementById('ctrl-mu');
  const sigmaEl = document.getElementById('ctrl-sigma');
  const tEl = document.getElementById('ctrl-t');
  const nEl = document.getElementById('ctrl-n');
  const modelEl = document.getElementById('ctrl-model');
  const skewEl = document.getElementById('ctrl-skew');
  const dfEl = document.getElementById('ctrl-df');

  const newMu = parseFloat(muEl.value);
  const newSigma = parseFloat(sigmaEl.value);
  const newT = parseInt(tEl.value, 10);
  const newN = parseInt(nEl.value, 10);
  const newModel = modelEl.value;
  const newSkew = parseFloat(skewEl.value);
  const newDf = parseInt(dfEl.value, 10);

  const changed = (newMu !== muPct) || (newSigma !== sigmaPct) || (newT !== TYears)
    || (newN !== NPaths) || (newModel !== modelKey)
    || (newSkew !== skewAlpha) || (newDf !== tailDf);

  muPct = newMu;
  sigmaPct = newSigma;
  TYears = newT;
  NPaths = newN;
  modelKey = newModel;
  skewAlpha = newSkew;
  tailDf = newDf;

  document.getElementById('val-mu').textContent = muPct.toFixed(1);
  document.getElementById('val-sigma').textContent = sigmaPct.toFixed(0);
  document.getElementById('val-t').textContent = TYears;
  document.getElementById('val-n').textContent = NPaths;
  document.getElementById('val-skew').textContent = skewAlpha.toFixed(1);
  document.getElementById('val-df').textContent = tailDf;

  const gMean = muPct / 100 - Math.pow(sigmaPct / 100, 2) / 2;
  const gVal = document.getElementById('val-g');
  const gWrap = gVal.closest('.g-readout');
  gVal.textContent = (gMean * 100).toFixed(1);

  const warn = document.getElementById('g-warning');
  if (gMean < 0) {
    gWrap.classList.add('g-negative');
    warn.style.display = 'block';
  } else {
    gWrap.classList.remove('g-negative');
    warn.style.display = 'none';
  }

  updateModelHint();
  updateModelControls();

  if (changed) pathDirty = true;
}

function updateModelHint() {
  const hint = document.getElementById('model-hint');
  const eduName = document.getElementById('edu-model-name');
  if (!hint) return;
  if (modelKey === 'lognormal') {
    hint.textContent = 'Symmetric log-returns. Classic baseline; thin tails.';
    if (eduName) eduName.textContent = 'Log-normal';
  } else if (modelKey === 'skew') {
    hint.textContent = 'Asymmetric log-returns. Negative skew = crash risk; positive = lottery upside.';
    if (eduName) eduName.textContent = 'Skew-normal';
  } else {
    hint.textContent = 'Fat tails. Lower df = more extreme events than normal.';
    if (eduName) eduName.textContent = 'Student-t';
  }
}

function updateModelControls() {
  const skewGroup = document.getElementById('ctrl-skew')?.closest('.control-group');
  const dfGroup = document.getElementById('ctrl-df')?.closest('.control-group');
  const skewInput = document.getElementById('ctrl-skew');
  const dfInput = document.getElementById('ctrl-df');
  if (skewGroup && skewInput) {
    const active = modelKey === 'skew';
    skewInput.disabled = !active;
    skewGroup.classList.toggle('disabled', !active);
  }
  if (dfGroup && dfInput) {
    const active = modelKey === 'fattail';
    dfInput.disabled = !active;
    dfGroup.classList.toggle('disabled', !active);
  }
}

function toggleEnsemble() {
  showEnsemble = !showEnsemble;
  const btn = document.getElementById('btn-ensemble');
  if (showEnsemble) {
    btn.classList.add('active');
    btn.textContent = 'Hide Ensemble';
  } else {
    btn.classList.remove('active');
    btn.textContent = 'Show Ensemble';
  }
}

function resimulatePaths() {
  pathDirty = true;
}

function setEduMode(mode) {
  updateEduPanel(mode);
  const buttons = document.querySelectorAll('.edu-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  const active = document.getElementById(`edu-btn-${mode}`);
  if (active) active.classList.add('active');
  updateModelHint();
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing helpers
// ─────────────────────────────────────────────────────────────────────────────
function drawDivider() {
  stroke(48, 60, 78);
  strokeWeight(1);
  line(g.divX, 24, g.divX, height - 24);
}

function drawLeftAxes(Vmin, Vmax) {
  const { x0, x1, y0, y1 } = g.left;
  stroke(30, 38, 50);
  strokeWeight(1);
  line(x0, y1, x1, y1);
  line(x0, y0, x0, y1);

  const ticks = buildLogTicks(Vmin, Vmax);
  fill(155, 170, 190);
  noStroke();
  textSize(11);
  textAlign(RIGHT, CENTER);
  for (const v of ticks) {
    const y = logYtoCanvas(v, Vmin, Vmax, y0, y1);
    stroke(30, 38, 50);
    line(x0 - 4, y, x1, y);
    noStroke();
    text(formatMoney(v), x0 + 6, y);
  }

  fill(200, 215, 230);
  textAlign(LEFT, CENTER);
  textSize(13);
  text('Portfolio Growth (log scale)', x0, y0 - 16);

  textSize(11);
  fill(155, 170, 190);
  textAlign(CENTER, TOP);
  text('Years', (x0 + x1) / 2, y1 + 10);
}

function buildLogTicks(Vmin, Vmax) {
  const ticks = [];
  const bases = [1, 2, 5];
  const minPow = Math.floor(Math.log10(Vmin));
  const maxPow = Math.ceil(Math.log10(Vmax));
  for (let p = minPow; p <= maxPow; p++) {
    for (const b of bases) {
      const v = b * Math.pow(10, p);
      if (v >= Vmin * 0.999 && v <= Vmax * 1.001) ticks.push(v);
    }
  }
  return ticks;
}

function drawRightAxes() {
  const { x0, x1, y0, y1 } = g.right;
  stroke(30, 38, 50);
  strokeWeight(1);
  line(x0, y1, x1, y1);
  line(x0, y0, x0, y1);

  fill(200, 215, 230);
  noStroke();
  textSize(13);
  textAlign(LEFT, CENTER);
  text('Annual Return Distribution', x0, y0 - 16);
}

function drawEnsemble(Vmin, Vmax) {
  if (!showEnsemble) return;
  const { x0, x1, y0, y1 } = g.left;
  const T = TYears;
  stroke(170, 65, 255, 30);
  strokeWeight(1);
  for (const path of paths) {
    noFill();
    beginShape();
    for (let t = 0; t <= T; t++) {
      const x = x0 + (x1 - x0) * (t / T);
      const y = logYtoCanvas(path[t], Vmin, Vmax, y0, y1);
      vertex(x, y);
    }
    endShape();
  }
}

function drawMeanPaths(Vmin, Vmax) {
  const { x0, x1, y0, y1 } = g.left;
  const T = TYears;

  // Shaded drag region
  noStroke();
  fill(220, 55, 75, 38);
  beginShape();
  for (let t = 0; t <= T; t++) {
    const x = x0 + (x1 - x0) * (t / T);
    const y = logYtoCanvas(arithPath[t], Vmin, Vmax, y0, y1);
    vertex(x, y);
  }
  for (let t = T; t >= 0; t--) {
    const x = x0 + (x1 - x0) * (t / T);
    const y = logYtoCanvas(geomPath[t], Vmin, Vmax, y0, y1);
    vertex(x, y);
  }
  endShape(CLOSE);

  // Arithmetic mean
  stroke(255, 195, 50);
  strokeWeight(2.5);
  noFill();
  beginShape();
  for (let t = 0; t <= T; t++) {
    const x = x0 + (x1 - x0) * (t / T);
    const y = logYtoCanvas(arithPath[t], Vmin, Vmax, y0, y1);
    vertex(x, y);
  }
  endShape();

  // Geometric mean
  stroke(88, 166, 255);
  strokeWeight(2.5);
  noFill();
  beginShape();
  for (let t = 0; t <= T; t++) {
    const x = x0 + (x1 - x0) * (t / T);
    const y = logYtoCanvas(geomPath[t], Vmin, Vmax, y0, y1);
    vertex(x, y);
  }
  endShape();

  // Labels at right edge
  const ax = x1 + 6;
  const yA = logYtoCanvas(arithPath[T], Vmin, Vmax, y0, y1);
  const yG = logYtoCanvas(geomPath[T], Vmin, Vmax, y0, y1);
  noStroke();
  textSize(11);
  textAlign(LEFT, CENTER);
  fill(255, 195, 50);
  text(`Arithmetic mean (${formatPct(muPct / 100)}%)`, ax, yA);
  fill(88, 166, 255);
  text(`Geometric mean (${formatPct(muPct / 100 - Math.pow(sigmaPct / 100, 2) / 2)}%)`, ax, yG);

  // Drag brace annotation
  stroke(220, 55, 75);
  strokeWeight(1.5);
  const bx = x1 - 4;
  line(bx, yA, bx, yG);
  line(bx, yA, bx - 8, yA);
  line(bx, yG, bx - 8, yG);
  noStroke();
  fill(220, 55, 75);
  textAlign(RIGHT, BOTTOM);
  const dragPct = ((arithPath[T] / geomPath[T]) - 1) * 100;
  text(`Drag after ${T}y: ${dragPct.toFixed(1)}%`, bx - 10, yA - 6);
}

function drawTimeMarker(Vmin, Vmax) {
  const { x0, x1, y0, y1 } = g.left;
  const t = clamp(timeMarker, 0, TYears);
  const x = x0 + (x1 - x0) * (t / TYears);
  const vA = V0 * Math.exp((muPct / 100) * t);
  const vG = V0 * Math.exp((muPct / 100 - Math.pow(sigmaPct / 100, 2) / 2) * t);

  stroke(45, 215, 135);
  strokeWeight(1.2);
  drawingContext.setLineDash([6, 5]);
  line(x, y0, x, y1);
  drawingContext.setLineDash([]);

  const yA = logYtoCanvas(vA, Vmin, Vmax, y0, y1);
  const yG = logYtoCanvas(vG, Vmin, Vmax, y0, y1);
  noStroke();
  fill(45, 215, 135);
  textSize(11);
  textAlign(RIGHT, BOTTOM);
  text(`Year ${t.toFixed(1)}`, x - 6, y0 + 12);
  textAlign(RIGHT, TOP);
  text(`A: ${formatMoney(vA)}  G: ${formatMoney(vG)}`, x - 6, y0 + 22);

  stroke(45, 215, 135);
  strokeWeight(2);
  line(x - 4, yA, x + 4, yA);
  line(x - 4, yG, x + 4, yG);
}

function drawReturnDistribution() {
  const { x0, x1, y0, y1, W, H } = g.right;
  const mu = muPct / 100;
  const sigma = sigmaPct / 100;
  const muLog = mu - (sigma * sigma) / 2;
  const xMin = -2.0;
  const xMax = 2.0;

  const pdfMax = pdfZ(0) / sigma;

  function pdf(x) {
    const z = (x - muLog) / sigma;
    return pdfZ(z) / sigma;
  }

  // Curve fill
  noStroke();
  fill(170, 65, 255, 80);
  beginShape();
  vertex(x0, y1);
  for (let i = 0; i <= 200; i++) {
    const x = xMin + (xMax - xMin) * (i / 200);
    const yVal = pdf(x);
    const px = x0 + (x1 - x0) * ((x - xMin) / (xMax - xMin));
    const py = y1 - (yVal / pdfMax) * (H * 0.85);
    vertex(px, py);
  }
  vertex(x1, y1);
  endShape(CLOSE);

  // Curve stroke
  stroke(170, 65, 255);
  strokeWeight(1.5);
  noFill();
  beginShape();
  for (let i = 0; i <= 200; i++) {
    const x = xMin + (xMax - xMin) * (i / 200);
    const yVal = pdf(x);
    const px = x0 + (x1 - x0) * ((x - xMin) / (xMax - xMin));
    const py = y1 - (yVal / pdfMax) * (H * 0.85);
    vertex(px, py);
  }
  endShape();

  // Mean markers
  const xGeo = x0 + (x1 - x0) * ((muLog - xMin) / (xMax - xMin));
  const xArith = x0 + (x1 - x0) * ((mu - xMin) / (xMax - xMin));

  stroke(88, 166, 255);
  strokeWeight(2);
  line(xGeo, y0, xGeo, y1);
  stroke(255, 195, 50);
  line(xArith, y0, xArith, y1);

  noStroke();
  textSize(11);
  textAlign(CENTER, BOTTOM);
  fill(255, 195, 50);
  text('Arithmetic mean', xArith, y0 - 18);
  fill(88, 166, 255);
  text('Geometric mean', xGeo, y0 - 4);

  // Drag annotation
  stroke(220, 55, 75);
  strokeWeight(1.5);
  const yArrow = y0 + 20;
  line(xGeo, yArrow, xArith, yArrow);
  line(xGeo, yArrow, xGeo + 6, yArrow - 4);
  line(xGeo, yArrow, xGeo + 6, yArrow + 4);
  line(xArith, yArrow, xArith - 6, yArrow - 4);
  line(xArith, yArrow, xArith - 6, yArrow + 4);
  noStroke();
  fill(220, 55, 75);
  const dragVal = (sigma * sigma / 2) * 100;
  textAlign(LEFT, CENTER);
  text(`Drag = ${dragVal.toFixed(2)}%`, xArith + 10, yArrow);

  // X-axis ticks
  fill(155, 170, 190);
  textAlign(CENTER, TOP);
  for (let k = -2.0; k <= 2.0001; k += 0.5) {
    const x = k;
    const px = x0 + (x1 - x0) * ((x - xMin) / (xMax - xMin));
    stroke(30, 38, 50);
    line(px, y1, px, y1 + 6);
    noStroke();
    text(`${(x * 100).toFixed(0)}%`, px, y1 + 8);
  }

  fill(45, 215, 135);
  textAlign(LEFT, TOP);
  const noteX = x1 + 10;
  const noteY = y0 + 10;
  text('sigma^2/2  = Ito correction\n           = entropy production', noteX, noteY);
}

// ─────────────────────────────────────────────────────────────────────────────
// Interaction
// ─────────────────────────────────────────────────────────────────────────────
function mousePressed() {
  const { x0, x1, y0, y1 } = g.left;
  if (mouseX < x0 || mouseX > x1 || mouseY < y0 || mouseY > y1) return;
  draggingMarker = true;
  const t = (mouseX - x0) / (x1 - x0);
  timeMarker = clamp(t, 0, 1) * TYears;
}

function mouseDragged() {
  if (!draggingMarker) return;
  const { x0, x1 } = g.left;
  const t = (mouseX - x0) / (x1 - x0);
  timeMarker = clamp(t, 0, 1) * TYears;
}

function mouseReleased() {
  draggingMarker = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// p5 lifecycle
// ─────────────────────────────────────────────────────────────────────────────
function setup() {
  const cont = document.getElementById('canvas-container');
  createCanvas(cont.clientWidth, cont.clientHeight).parent('canvas-container');
  textFont('Courier New');
  computeGeometry();
  updateEduPanel('jensen');
  updateModelHint();
  updateModelControls();
  generatePaths();
}

function windowResized() {
  const cont = document.getElementById('canvas-container');
  resizeCanvas(cont.clientWidth, cont.clientHeight);
  computeGeometry();
  pathDirty = true;
}

function draw() {
  background(17, 24, 32);

  readControls();
  if (pathDirty) generatePaths();

  const Vmin = V0 / 2;
  const Vmax = Math.max(arithPath[TYears] * 2, V0 * 2);

  drawDivider();
  drawLeftAxes(Vmin, Vmax);
  drawRightAxes();
  drawEnsemble(Vmin, Vmax);
  drawMeanPaths(Vmin, Vmax);
  drawTimeMarker(Vmin, Vmax);
  drawReturnDistribution();
}
