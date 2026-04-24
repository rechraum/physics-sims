// ─────────────────────────────────────────────────────────────────────────────
// Log-Wealth Mixing - sketch.js
//
// Finance: log-wealth diffusion under multiplicative noise.
// Physics: two-color mixing gas with a simple entropy proxy.
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

const EDU = {
  diffusion: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Diffusion in Log-Wealth Space</p>
        <p class="edu-description">
          A multiplicative return process becomes an additive random walk once you
          take the logarithm. Each path on the left is a log-wealth trajectory driven
          by the same kind of noise that spreads a particle distribution in space.
        </p>
        <div class="equation">
          d(ln W) = (mu - sigma<sup>2</sup>/2) dt + sigma dW
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">log returns</span>
          <span class="edu-concept-tag">diffusion</span>
          <span class="edu-concept-tag">volatility</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Finance intuition</p>
          <p>
            Increasing sigma widens the distribution just like increasing particle
            speed. The mean drifts with mu, but the width is set by volatility.
          </p>
        </div>
      </div>
    </div>
  `,
  mixing: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Two-Color Mixing</p>
        <p class="edu-description">
          The right panel starts with blue on the left and red on the right. Motion
          alone erases that memory. The distribution panel measures how quickly
          the two colors interleave.
        </p>
        <div class="equation">
          S<sub>mix</sub> = (S<sub>blue</sub> + S<sub>red</sub>) / 2
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">mixing</span>
          <span class="edu-concept-tag">irreversibility</span>
          <span class="edu-concept-tag">entropy</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Same story, new language</p>
          <p>
            Spreading in space and spreading in log-wealth are the same mathematics.
            The units differ, the diffusion does not.
          </p>
        </div>
      </div>
    </div>
  `,
  entropy: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Entropy as Distribution Width</p>
        <p class="edu-description">
          Entropy here is not an abstract symbol. It is the width of a distribution.
          When the histogram of log-wealth flattens and the colors mix, the entropy
          bars rise together.
        </p>
        <div class="equation">
          S = -sum p<sub>i</sub> ln p<sub>i</sub>
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">Shannon entropy</span>
          <span class="edu-concept-tag">mixing entropy</span>
          <span class="edu-concept-tag">dispersion</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Financial lens</p>
          <p>
            The log-wealth spread is the entropy cost of volatility. It grows even
            if the expected return stays unchanged.
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

let eduMode = 'diffusion';
let running = true;

let mu = 0.06;
let sigma = 0.20;
let numPaths = 120;
let maxSteps = 180;
let stepIndex = 0;
const DT = 0.2;

let particleCount = 200;
let particleSpeed = 1.2;

let lastNumPaths = numPaths;
let lastMaxSteps = maxSteps;
let lastParticleCount = particleCount;

let paths = [];
let particles = [];
let meanPath = [];
let globalMin = 0;
let globalMax = 0;
let lastMixEntropy = 0;
let lastWealthEntropy = 0;

const MAX_DRAW_STEPS = 160;
const MAX_DRAW_VERTICES = 180;
let loopEnabled = true;
const WEALTH_BINS = 14;
const MIX_BINS = 16;

let g = {};

function setup() {
  const container = document.getElementById('canvas-container');
  const canvas = createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent('canvas-container');

  bindControls();
  resetSimulation();
  updateEduPanel(eduMode);
}

function windowResized() {
  const container = document.getElementById('canvas-container');
  resizeCanvas(container.clientWidth, container.clientHeight);
  computeGeometry();
}

function draw() {
  readControls();
  if (running) {
    updateFinance();
    updateMixing();
  }

  background(17, 24, 32);
  computeGeometry();
  drawFinancePanel();
  drawDistributionPanel();
  drawMixingPanel();
}

// ── Controls ───────────────────────────────────────────────────────────────
function bindControls() {
  const btnRun = document.getElementById('btn-run');
  const btnReset = document.getElementById('btn-reset');

  btnRun.addEventListener('click', () => {
    if (stepIndex >= maxSteps - 1) {
      resetSimulation();
      running = true;
    } else {
      running = !running;
    }
    btnRun.textContent = running ? 'Pause' : 'Resume';
  });

  btnReset.addEventListener('click', () => {
    resetSimulation();
    running = true;
    btnRun.textContent = 'Pause';
  });
}

function readControls() {
  mu = parseFloat(document.getElementById('ctrl-mu').value);
  sigma = parseFloat(document.getElementById('ctrl-sigma').value);
  numPaths = parseInt(document.getElementById('ctrl-paths').value, 10);
  maxSteps = parseInt(document.getElementById('ctrl-steps').value, 10);
  particleCount = parseInt(document.getElementById('ctrl-particles').value, 10);
  particleSpeed = parseFloat(document.getElementById('ctrl-speed').value);
  loopEnabled = document.getElementById('ctrl-loop').checked;

  document.getElementById('val-mu').textContent = mu.toFixed(3);
  document.getElementById('val-sigma').textContent = sigma.toFixed(2);
  document.getElementById('val-paths').textContent = numPaths;
  document.getElementById('val-steps').textContent = maxSteps;
  document.getElementById('val-particles').textContent = particleCount;
  document.getElementById('val-speed').textContent = particleSpeed.toFixed(1);

  if (numPaths !== lastNumPaths || maxSteps !== lastMaxSteps) {
    lastNumPaths = numPaths;
    lastMaxSteps = maxSteps;
    resetFinance();
  }

  if (particleCount !== lastParticleCount) {
    lastParticleCount = particleCount;
    resetMixing();
  }
}

function setEduMode(mode) {
  eduMode = mode;
  updateEduPanel(mode);
  document.querySelectorAll('.edu-btn').forEach(btn => btn.classList.remove('active'));
  const active = document.getElementById(`edu-btn-${mode}`);
  if (active) active.classList.add('active');
}

// ── Simulation reset ───────────────────────────────────────────────────────
function resetSimulation() {
  resetFinance();
  resetMixing();
  computeGeometry();
}

function resetFinance() {
  stepIndex = 0;
  paths = Array.from({ length: numPaths }, () => [0]);
  meanPath = [0];
  globalMin = 0;
  globalMax = 0;
}

function resetMixing() {
  particles = [];
  for (let i = 0; i < particleCount; i += 1) {
    const isBlue = i < particleCount / 2;
    const xSpan = isBlue ? 0.48 : 0.48;
    const xOffset = isBlue ? 0.02 : 0.50;
    const px = (xOffset + Math.random() * xSpan);
    const py = 0.08 + Math.random() * 0.84;

    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x: px,
      y: py,
      vx: Math.cos(angle),
      vy: Math.sin(angle),
      type: isBlue ? 'blue' : 'red'
    });
  }
}

// ── Finance update ─────────────────────────────────────────────────────────
function updateFinance() {
  if (stepIndex >= maxSteps - 1) {
    if (loopEnabled) {
      resetSimulation();
      running = true;
      const btnRun = document.getElementById('btn-run');
      btnRun.textContent = 'Pause';
    } else {
      running = false;
      const btnRun = document.getElementById('btn-run');
      btnRun.textContent = 'Resume';
    }
    return;
  }

  const drift = (mu - 0.5 * sigma * sigma) * DT;
  const diffusion = sigma * Math.sqrt(DT);
  let sum = 0;

  for (let i = 0; i < paths.length; i += 1) {
    const last = paths[i][paths[i].length - 1];
    const next = last + drift + diffusion * randomGaussian();
    paths[i].push(next);
    sum += next;
    if (next < globalMin) globalMin = next;
    if (next > globalMax) globalMax = next;
  }
  meanPath.push(sum / paths.length);
  stepIndex += 1;
}

// ── Mixing update ──────────────────────────────────────────────────────────
function updateMixing() {
  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];
    p.x += p.vx * 0.005 * particleSpeed;
    p.y += p.vy * 0.005 * particleSpeed;

    if (p.x < 0.02) { p.x = 0.02; p.vx *= -1; }
    if (p.x > 0.98) { p.x = 0.98; p.vx *= -1; }
    if (p.y < 0.06) { p.y = 0.06; p.vy *= -1; }
    if (p.y > 0.94) { p.y = 0.94; p.vy *= -1; }
  }
}

// ── Geometry ───────────────────────────────────────────────────────────────
function computeGeometry() {
  const gap = 18;
  const usableW = width - gap * 4;
  const wFinance = Math.floor(usableW * 0.54);
  const wDist = Math.floor(usableW * 0.20);
  const wMix = usableW - wFinance - wDist;
  const y = gap;
  const h = height - gap * 2;

  g.finance = { x: gap, y, w: wFinance, h };
  g.dist = { x: gap + wFinance + gap, y, w: wDist, h };
  g.mix = { x: gap + wFinance + gap + wDist + gap, y, w: wMix, h };
}

// ── Drawing helpers ───────────────────────────────────────────────────────
function panelFrame(panel) {
  noFill();
  stroke(48, 54, 61);
  rect(panel.x, panel.y, panel.w, panel.h, 10);
}

function drawFinancePanel() {
  const p = g.finance;
  panelFrame(p);

  const pad = { l: 46, r: 16, t: 28, b: 32 };
  const x0 = p.x + pad.l;
  const x1 = p.x + p.w - pad.r;
  const y0 = p.y + pad.t;
  const y1 = p.y + p.h - pad.b;

  const minV = globalMin - 0.15;
  const maxV = globalMax + 0.15;

  stroke(70, 80, 94);
  line(x0, y1, x1, y1);
  line(x0, y0, x0, y1);

  noStroke();
  fill(200, 215, 230);
  textSize(13);
  text('Log-wealth paths', x0, p.y + 18);

  fill(155, 170, 190);
  textSize(11);
  text('time', (x0 + x1) * 0.5 - 12, y1 + 22);
  text('log W', x0 - 36, y0 - 8);

  const steps = Math.max(2, maxSteps - 1);
  const tailLen = Math.min(MAX_DRAW_STEPS, meanPath.length);
  const startIndex = Math.max(0, meanPath.length - tailLen);
  const vertexStride = Math.max(1, Math.ceil(tailLen / MAX_DRAW_VERTICES));
  const deltaScale = Math.max(0.0001, (globalMax - globalMin) * 0.35);
  strokeWeight(1.1);
  for (let i = 0; i < paths.length; i += 1) {
    const len = paths[i].length;
    const start = Math.max(0, len - tailLen);
    let prevX = null;
    let prevY = null;
    for (let s = start; s < len; s += vertexStride) {
      const x = map(s, start, len - 1, x0, x1);
      const y = map(paths[i][s], minV, maxV, y1, y0);
      if (prevX !== null && s < meanPath.length) {
        const delta = paths[i][s] - meanPath[s];
        const c = colorForDelta(delta, deltaScale);
        stroke(c.r, c.g, c.b, 120);
        line(prevX, prevY, x, y);
      }
      prevX = x;
      prevY = y;
    }
  }

  stroke(45, 215, 135, 200);
  strokeWeight(2);
  beginShape();
  for (let s = startIndex; s < meanPath.length; s += vertexStride) {
    const x = map(s, startIndex, meanPath.length - 1, x0, x1);
    const y = map(meanPath[s], minV, maxV, y1, y0);
    vertex(x, y);
  }
  endShape();

  const tickCount = 4;
  noStroke();
  fill(155, 170, 190);
  textSize(10);
  for (let i = 0; i <= tickCount; i += 1) {
    const t = i / tickCount;
    const y = lerp(y1, y0, t);
    const val = lerp(minV, maxV, t);
    text(val.toFixed(1), x0 - 38, y + 3);
  }
}

function drawDistributionPanel() {
  const p = g.dist;
  panelFrame(p);

  const pad = { l: 16, r: 16, t: 28, b: 26 };
  const x0 = p.x + pad.l;
  const x1 = p.x + p.w - pad.r;
  const y0 = p.y + pad.t;
  const y1 = p.y + p.h - pad.b;

  fill(200, 215, 230);
  noStroke();
  textSize(13);
  text('Distributions', x0, p.y + 18);

  const values = new Array(paths.length);
  for (let i = 0; i < paths.length; i += 1) {
    values[i] = paths[i][paths[i].length - 1];
  }
  const bins = WEALTH_BINS;
  const hist = new Array(bins).fill(0);
  const stepsNow = Math.max(1, stepIndex);
  const meanNow = (mu - 0.5 * sigma * sigma) * DT * stepsNow;
  const stdMax = Math.max(0.0001, sigma * Math.sqrt(DT * Math.max(1, maxSteps - 1)));
  const minV = meanNow - 3.0 * stdMax;
  const maxV = meanNow + 3.0 * stdMax;
  const span = Math.max(0.0001, maxV - minV);

  for (let i = 0; i < values.length; i += 1) {
    let idx = Math.floor((values[i] - minV) / span * bins);
    idx = Math.min(bins - 1, Math.max(0, idx));
    hist[idx] += 1;
  }

  const barW = (x1 - x0) / bins;
  const bandGap = 18;
  const entropyBandH = 68;
  const topArea = {
    y0: y0 + 12,
    y1: y0 + Math.floor((y1 - y0 - entropyBandH - bandGap * 2) * 0.48)
  };
  const entropyBand = {
    y0: topArea.y1 + bandGap,
    y1: topArea.y1 + bandGap + entropyBandH
  };
  const bottomArea = {
    y0: entropyBand.y1 + bandGap,
    y1
  };

  const histTop = topArea.y0 + 14;
  const histBottom = topArea.y1;
  const histHeight = Math.max(10, histBottom - histTop);
  const maxProb = Math.max(...hist) / Math.max(1, values.length);
  for (let i = 0; i < bins; i += 1) {
    const prob = hist[i] / Math.max(1, values.length);
    const h = map(prob, 0, maxProb, 0, histHeight);
    const x = x0 + i * barW;
    fill(45, 215, 135, 170);
    noStroke();
    rect(x + 2, histBottom - h, barW - 4, h, 3);
  }

  lastWealthEntropy = computeEntropy(hist);
  lastMixEntropy = computeMixEntropy();

  const barY = entropyBand.y0 + 18;
  const barGap = 22;
  const barH = 8;
  const barWMax = x1 - x0;

  fill(155, 170, 190);
  textSize(11);
  text('Wealth entropy', x0, entropyBand.y0 + 10);
  text('Mixing entropy', x0, entropyBand.y0 + 10 + barGap + 6);

  noStroke();
  fill(45, 215, 135, 200);
  rect(x0, barY, barWMax * lastWealthEntropy, barH, 4);

  fill(255, 195, 50, 200);
  rect(x0, barY + barGap, barWMax * lastMixEntropy, barH, 4);

  fill(155, 170, 190);
  textSize(10);
  text(lastWealthEntropy.toFixed(2), x1 - 26, barY + 7);
  text(lastMixEntropy.toFixed(2), x1 - 26, barY + barGap + 7);

  fill(155, 170, 190);
  textSize(11);
  text('Log-wealth', x0, topArea.y0 + 2);
  text('Mixing profile', x0, bottomArea.y0 + 2);

  drawMixingDistribution(x0, x1, bottomArea.y0 + 14, bottomArea.y1);
}

function drawMixingDistribution(x0, x1, y0, y1) {
  const bins = MIX_BINS;
  const blueBins = new Array(bins).fill(0);
  const redBins = new Array(bins).fill(0);
  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];
    let idx = Math.floor(p.x * bins);
    idx = Math.min(bins - 1, Math.max(0, idx));
    if (p.type === 'blue') blueBins[idx] += 1;
    else redBins[idx] += 1;
  }

  const fractionBins = new Array(bins).fill(0);
  for (let i = 0; i < bins; i += 1) {
    const total = blueBins[i] + redBins[i];
    if (total === 0) continue;
    const fracBlue = blueBins[i] / total;
    let idx = Math.floor(fracBlue * bins);
    idx = Math.min(bins - 1, Math.max(0, idx));
    fractionBins[idx] += 1;
  }

  const maxCount = Math.max(...fractionBins, 1);
  const barW = (x1 - x0) / bins;
  const height = Math.max(10, y1 - y0);

  for (let i = 0; i < bins; i += 1) {
    const x = x0 + i * barW;
    const count = fractionBins[i];
    const h = map(count, 0, maxCount, 0, height);
    const fracBlue = (i + 0.5) / bins;
    const r = Math.round(220 * (1 - fracBlue) + 50 * fracBlue);
    const g = Math.round(60 * (1 - fracBlue) + 130 * fracBlue);
    const b = Math.round(50 * (1 - fracBlue) + 220 * fracBlue);

    noStroke();
    fill(r, g, b, 190);
    rect(x + 2, y1 - h, barW - 4, h, 3);
  }
}

function colorForDelta(delta, scale) {
  const t = Math.max(-1, Math.min(1, delta / scale));
  const neutral = { r: 210, g: 220, b: 230 };
  const blue = { r: 50, g: 130, b: 220 };
  const red = { r: 220, g: 60, b: 50 };
  if (t < 0) {
    const u = -t;
    return {
      r: Math.round(lerp(neutral.r, blue.r, u)),
      g: Math.round(lerp(neutral.g, blue.g, u)),
      b: Math.round(lerp(neutral.b, blue.b, u))
    };
  }
  return {
    r: Math.round(lerp(neutral.r, red.r, t)),
    g: Math.round(lerp(neutral.g, red.g, t)),
    b: Math.round(lerp(neutral.b, red.b, t))
  };
}

function drawMixingPanel() {
  const p = g.mix;
  panelFrame(p);

  const pad = { l: 16, r: 16, t: 28, b: 16 };
  const x0 = p.x + pad.l;
  const x1 = p.x + p.w - pad.r;
  const y0 = p.y + pad.t;
  const y1 = p.y + p.h - pad.b;

  fill(200, 215, 230);
  noStroke();
  textSize(13);
  text('Mixing box', x0, p.y + 18);

  stroke(70, 80, 94);
  noFill();
  rect(x0, y0, x1 - x0, y1 - y0, 8);

  for (let i = 0; i < particles.length; i += 1) {
    const part = particles[i];
    const px = lerp(x0, x1, part.x);
    const py = lerp(y0, y1, part.y);

    if (part.type === 'blue') {
      fill(50, 130, 220, 200);
    } else {
      fill(220, 60, 50, 200);
    }
    noStroke();
    circle(px, py, 5);
  }

  fill(155, 170, 190);
  textSize(11);
  text(`S_mix = ${lastMixEntropy.toFixed(2)}`, x0, y1 + 16);
}

// ── Computations ───────────────────────────────────────────────────────────
function computeEntropy(hist) {
  const total = hist.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  let s = 0;
  for (let i = 0; i < hist.length; i += 1) {
    if (hist[i] === 0) continue;
    const p = hist[i] / total;
    s -= p * Math.log(p);
  }
  return s / Math.log(hist.length);
}

function computeMixEntropy() {
  let blueLeft = 0;
  let blueRight = 0;
  let redLeft = 0;
  let redRight = 0;

  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];
    const isLeft = p.x < 0.5;
    if (p.type === 'blue') {
      if (isLeft) blueLeft += 1; else blueRight += 1;
    } else {
      if (isLeft) redLeft += 1; else redRight += 1;
    }
  }

  const blueTotal = blueLeft + blueRight;
  const redTotal = redLeft + redRight;
  const blueEntropy = entropyBinary(blueLeft, blueTotal);
  const redEntropy = entropyBinary(redLeft, redTotal);
  return 0.5 * (blueEntropy + redEntropy);
}

function entropyBinary(leftCount, total) {
  if (total === 0) return 0;
  const pLeft = leftCount / total;
  const pRight = 1 - pLeft;
  let s = 0;
  if (pLeft > 0) s -= pLeft * Math.log(pLeft);
  if (pRight > 0) s -= pRight * Math.log(pRight);
  return s / Math.log(2);
}
