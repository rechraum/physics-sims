'use strict';

const EDU = {
  drag: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Volatility Drag Intuition</p>
        <p class="edu-description">
          Two investors can share the same arithmetic mean return <strong>μ</strong>, but the one
          with larger volatility <strong>σ</strong> compounds more slowly. The growth rate that matters
          over time is the geometric/log rate:
          <strong>g ≈ μ − σ²/2</strong>.
        </p>
        <div class="equation">
          g &asymp; &mu; - &sigma;<sup>2</sup>/2
        </div>
        <div class="param-hint param-hint-teal">
          Parameters set to &mu;=8%, &sigma;=15%, years=30.
          Increase <strong>&sigma;</strong> and watch the orange drag area widen.
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Why this surprises people</p>
          <p>
            Arithmetic averages add returns. Wealth compounds multiplicatively.
            Multiplicative noise penalizes growth because log is concave (Jensen).
          </p>
        </div>
      </div>
    </div>
  `,

  entropy: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Entropy Analogy</p>
        <p class="edu-description">
          The term &sigma;<sup>2</sup>/2 is an <em>irreversibility cost</em>:
          once randomness broadens outcomes, you cannot recover the lost compound growth
          just by averaging. This is mathematically analogous to entropy production.
        </p>
        <div class="equation">
          d ln(S) = (&mu; - &sigma;<sup>2</sup>/2)dt + &sigma; dW
        </div>
        <div class="param-hint param-hint-teal">
          Parameters set to &mu;=8%, &sigma;=35%, years=30.
          Compare teal (arithmetic benchmark) vs blue (geometric expectation).
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Thermo parallel</p>
          <p>
            In thermodynamics, entropy production is the gap between reversible ideal and real process.
            Here, volatility drag is the gap between arithmetic ideal and geometric reality.
          </p>
        </div>
      </div>
    </div>
  `,

  applications: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Applications</p>
        <p class="edu-description">
          Portfolio construction, leverage sizing, and retirement projections all depend on geometric growth,
          not arithmetic averages. Reducing volatility can improve long-horizon outcomes even if average return stays constant.
        </p>
        <div class="equation">
          Long-run wealth &propto; exp(g t), &nbsp; g = E[d ln(S)]/dt
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Try this</p>
          <p>
            Keep &mu; fixed, sweep &sigma;, and resample paths.
            Observe that path noise changes, but the drag term tracks the average compounding penalty.
          </p>
        </div>
      </div>
    </div>
  `,
};

let mu = 0.08;
let sigma = 0.15;
let years = 30;
let eduMode = 'drag';

let g = {};
let path = [];
let lastKey = '';

const W0 = 100;

function updateEduPanel(m) {
  const el = document.getElementById('sim-edu');
  if (el && EDU[m]) el.innerHTML = EDU[m];
}

function computeGeometry() {
  const W = width;
  const H = height;
  g.plot = {
    x0: 58,
    y0: 36,
    x1: W - 24,
    y1: H - 86,
  };
  g.plot.w = g.plot.x1 - g.plot.x0;
  g.plot.h = g.plot.y1 - g.plot.y0;
}

function gaussian() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function readControls() {
  const newMu = parseFloat(document.getElementById('ctrl-mu').value);
  const newSigma = parseFloat(document.getElementById('ctrl-sigma').value);
  const newYears = parseInt(document.getElementById('ctrl-years').value, 10);

  document.getElementById('val-mu').textContent = `${(newMu * 100).toFixed(1)}%`;
  document.getElementById('val-sigma').textContent = `${(newSigma * 100).toFixed(1)}%`;
  document.getElementById('val-years').textContent = `${newYears}`;

  const drag = 0.5 * newSigma * newSigma;
  const gRate = newMu - drag;
  document.getElementById('val-drag').textContent = `${(drag * 100).toFixed(1)}%`;
  document.getElementById('val-g').textContent = `${(gRate * 100).toFixed(1)}%`;

  mu = newMu;
  sigma = newSigma;
  years = newYears;
}

function rebuildPath() {
  path = [];
  let sample = W0;
  for (let t = 0; t <= years; t++) {
    const a = W0 * Math.pow(1 + mu, t);
    const gRate = mu - 0.5 * sigma * sigma;
    const ge = W0 * Math.exp(gRate * t);
    if (t > 0) {
      const eps = gaussian();
      // μ here is the arithmetic-mean return control; with Δt = 1 year,
      // the per-step log drift uses the Itō/Jensen correction μ - σ²/2.
      sample *= Math.exp(gRate + sigma * eps);
      sample = max(sample, 1e-3);
    }
    path.push({ t, arith: a, geo: ge, sample });
  }
}

function setSliders(muVal, sigmaVal, yearsVal) {
  document.getElementById('ctrl-mu').value = muVal;
  document.getElementById('ctrl-sigma').value = sigmaVal;
  document.getElementById('ctrl-years').value = yearsVal;
  lastKey = '';
}

function setEduMode(m) {
  eduMode = m;
  document.querySelectorAll('.edu-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`edu-btn-${m}`);
  if (btn) btn.classList.add('active');

  if (m === 'drag') setSliders(0.08, 0.15, 30);
  if (m === 'entropy') setSliders(0.08, 0.35, 30);
  updateEduPanel(m);
}

function resetPath() {
  lastKey = '';
}

function drawAxes(yMax) {
  const { x0, y0, x1, y1 } = g.plot;
  stroke(42, 50, 62);
  strokeWeight(1);
  line(x0, y0, x0, y1);
  line(x0, y1, x1, y1);

  noStroke();
  fill(200, 215, 230);
  textSize(12);
  textAlign(CENTER);
  text('Volatility Drag: Arithmetic vs Geometric Compounding', (x0 + x1) * 0.5, y0 - 12);

  fill(155, 170, 190);
  textSize(11);
  text('Years', (x0 + x1) * 0.5, y1 + 28);

  push();
  translate(x0 - 38, (y0 + y1) * 0.5);
  rotate(-HALF_PI);
  text('Wealth Index', 0, 0);
  pop();

  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const f = i / yTicks;
    const y = lerp(y1, y0, f);
    const v = yMax * f;
    stroke(27, 34, 44);
    line(x0, y, x1, y);
    noStroke();
    fill(155, 170, 190);
    textAlign(RIGHT, CENTER);
    text(v.toFixed(0), x0 - 8, y);
  }
}

function drawCurves() {
  if (path.length < 2) return;
  const { x0, y0, x1, y1, w, h } = g.plot;
  let yMax = W0;
  for (const p of path) yMax = max(yMax, p.arith, p.geo, p.sample);
  yMax *= 1.1;

  drawAxes(yMax);

  const toX = t => x0 + (t / years) * w;
  const toY = y => y1 - (y / yMax) * h;

  noStroke();
  fill(245, 158, 11, 42);
  beginShape();
  for (const p of path) vertex(toX(p.t), toY(p.arith));
  for (let i = path.length - 1; i >= 0; i--) vertex(toX(path[i].t), toY(path[i].geo));
  endShape(CLOSE);

  noFill();
  strokeWeight(2.2);
  stroke(255, 150, 50);
  beginShape();
  for (const p of path) vertex(toX(p.t), toY(p.arith));
  endShape();

  stroke(88, 166, 255);
  beginShape();
  for (const p of path) vertex(toX(p.t), toY(p.geo));
  endShape();

  stroke(180, 188, 202, 160);
  strokeWeight(1.4);
  beginShape();
  for (const p of path) vertex(toX(p.t), toY(p.sample));
  endShape();

  const last = path[path.length - 1];
  const gap = last.arith - last.geo;
  const drag = 0.5 * sigma * sigma;
  const gRate = mu - drag;

  noStroke();
  fill(255, 150, 50);
  textAlign(LEFT);
  textSize(11);
  text('Arithmetic benchmark', x0 + 6, y0 + 14);
  fill(88, 166, 255);
  text('Geometric expectation', x0 + 6, y0 + 30);
  fill(180, 188, 202);
  text('One stochastic sample path', x0 + 6, y0 + 46);

  fill(245, 158, 11);
  textAlign(RIGHT);
  text(`Drag term σ²/2 = ${(drag * 100).toFixed(2)}%`, x1, y0 + 14);
  text(`g ≈ ${(gRate * 100).toFixed(2)}%`, x1, y0 + 30);
  text(`Gap at year ${years}: ${gap.toFixed(1)}`, x1, y0 + 46);
}

function setup() {
  const host = document.getElementById('canvas-container');
  const c = createCanvas(host.clientWidth, host.clientHeight);
  c.parent('canvas-container');
  computeGeometry();
  updateEduPanel(eduMode);
}

function windowResized() {
  const host = document.getElementById('canvas-container');
  resizeCanvas(host.clientWidth, host.clientHeight);
  computeGeometry();
}

function draw() {
  background(17, 24, 32);
  readControls();
  const key = `${mu.toFixed(4)}|${sigma.toFixed(4)}|${years}`;
  if (key !== lastKey) {
    rebuildPath();
    lastKey = key;
  }
  drawCurves();
}
