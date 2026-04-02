// ─────────────────────────────────────────────────────────────────────────────
// Maxwell-Boltzmann Distribution — sketch.js
//
// Physics (k = 1 throughout):
//   3D M-B speed distribution: f(v) = 4π(m/2πT)^(3/2) v² exp(−mv²/2T)
//   Characteristic speeds: v_p = √(2T/m), ⟨v⟩ = √(8T/πm), v_rms = √(3T/m)
//   2D simulation temperature: T_sim = (1/N) Σ ½mv²  (equipartition: KE_avg = T)
//   Elastic equal-mass collision: exchange velocity components along line of centres
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Edu content
// ─────────────────────────────────────────────────────────────────────────────
const EDU = {

  distribution: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Maxwell-Boltzmann Distribution</p>
        <p class="edu-description">
          In 1860, James Clerk Maxwell asked: what is the probability that a gas molecule has
          speed v? He found a characteristic skewed curve &mdash; not because of any rule
          imposed on individual particles, but because this is the overwhelmingly most probable
          distribution of speeds that conserves total energy. Boltzmann (1872) showed it is
          the <strong>unique equilibrium distribution</strong>: any other distribution relaxes
          toward it through collisions. Temperature is just the average kinetic energy.
          Watch the live histogram converge to the orange theory curve as particles collide.
        </p>
        <div class="equation">
          f(v) = 4&pi; (m/2&pi;kT)<sup>3/2</sup> v<sup>2</sup> exp(&minus;mv<sup>2</sup>/2kT)
        </div>
        <div class="param-hint param-hint-teal">
          Parameters reset to N&thinsp;=&thinsp;80, T&thinsp;=&thinsp;1.0, m&thinsp;=&thinsp;1.0.
          Click <strong>&circlearrowleft;&thinsp;Reset speeds</strong> to see the distribution
          build itself from uniform initial conditions.
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">Maxwell-Boltzmann</span>
          <span class="edu-concept-tag">equilibration</span>
          <span class="edu-concept-tag">kinetic theory</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Balloon physics</p>
          <p>
            The M-B distribution explains why gas escapes from balloons slowly but hydrogen
            escapes faster than air. At 300&thinsp;K:
            v<sub>rms</sub>(H<sub>2</sub>) &asymp; 1930&thinsp;m/s vs.
            v<sub>rms</sub>(N<sub>2</sub>) &asymp; 515&thinsp;m/s.
            The lighter the molecule, the higher the probability above any given escape speed.
          </p>
        </div>
      </div>
    </div>
  `,

  equipartition: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Equipartition of Energy</p>
        <p class="edu-description">
          The equipartition theorem states that every quadratic degree of freedom in a thermal
          system carries exactly &frac12;kT of average energy. For a monatomic gas in 3D,
          that is 3 translational degrees of freedom &rarr;
          &frac12;m&lang;v<sup>2</sup>&rang;&nbsp;=&nbsp;&frac32;kT.
          This is the <strong>microscopic definition of temperature</strong>: hotter = faster
          average motion. Watch the KE readout below the histogram &mdash; ⟨KE⟩ from the
          simulation tracks the theory value &frac32;kT as you adjust the temperature slider.
        </p>
        <div class="equation">
          &frac12;m&lang;v<sup>2</sup>&rang; = &frac32;kT &nbsp;&rarr;&nbsp;
          v<sub>rms</sub> = &radic;(3kT/m)
        </div>
        <div class="param-hint param-hint-teal">
          Parameters reset to N&thinsp;=&thinsp;80, T&thinsp;=&thinsp;1.0,
          m&thinsp;=&thinsp;1.0. Drag the T slider and watch the KE readout update
          in real time. Note: this is a 2D simulation &mdash; ⟨KE⟩ per particle &asymp;&thinsp;T
          (2&thinsp;DOF), while the 3D theory gives &frac32;kT.
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">equipartition theorem</span>
          <span class="edu-concept-tag">degrees of freedom</span>
          <span class="edu-concept-tag">temperature</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Heat capacity failure</p>
          <p>
            Equipartition correctly predicts the heat capacity of monatomic ideal gases
            (helium, argon). It <em>fails</em> for quantum systems at low temperature &mdash;
            vibrations of diatomic molecules are &ldquo;frozen out&rdquo; below their quantum
            energy &hbar;&omega;. This was one of the early clues that classical physics
            was incomplete.
          </p>
        </div>
      </div>
    </div>
  `,

  evaporation: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Evaporation &amp; the High-Speed Tail</p>
        <p class="edu-description">
          The high-speed tail of the M-B distribution is why liquids evaporate. Molecules
          at the surface of a liquid can escape only if they have enough kinetic energy to
          overcome intermolecular attraction. Only those in the far tail qualify. When those
          high-energy molecules leave, the average kinetic energy of those remaining
          <em>drops</em> &mdash; evaporation <strong>cools</strong>.
          At higher T (set here to 3.5), the tail is fatter: more particles
          exceed any given escape speed, and evaporation is exponentially faster.
        </p>
        <div class="equation">
          &Gamma;<sub>evap</sub> &prop; exp(&minus;&epsilon;/kT)
          &nbsp;&nbsp; &larr;&nbsp; Arrhenius rate
        </div>
        <div class="param-hint param-hint-teal">
          Parameters set to T&thinsp;=&thinsp;3.5 to emphasize the high-speed tail.
          Compare the orange curve to T&thinsp;=&thinsp;1.0 &mdash; the peak shifts
          right and the tail probability at large v rises dramatically.
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">evaporation</span>
          <span class="edu-concept-tag">high-speed tail</span>
          <span class="edu-concept-tag">Arrhenius rate</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Laser cooling</p>
          <p>
            Evaporative cooling of ultracold atoms (2001 Nobel Prize) uses exactly this
            principle: radio-frequency &ldquo;scissors&rdquo; cut off the high-energy tail
            of a trapped gas, leaving the sample progressively colder until quantum
            degeneracy is reached &mdash; temperatures below 100&thinsp;nanokelvin.
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
let particles = [];
let N       = 80;
let T       = 1.0;
let massM   = 1.0;
let T_prev  = 1.0;   // for velocity rescaling

let showVp    = true;
let showVmean = true;
let showVrms  = true;
let eduMode   = 'distribution';
let colorMap  = 'thermal';   // 'thermal' | 'blackbody' | 'rainbow'

const N_BINS     = 30;
let histBins     = new Array(N_BINS).fill(0);
let histFrame    = 0;
const HIST_EVERY = 15;

const RADIUS = 4;
const DT     = 0.5;

// ─────────────────────────────────────────────────────────────────────────────
// Geometry
// ─────────────────────────────────────────────────────────────────────────────
let g = {};

function computeGeometry() {
  const W = width, H = height;
  const divX = floor(W * 0.48);

  // Square gas box centred in the left region
  const boxPad  = 28;
  const titleH  = 22;
  const boxSize = Math.min(divX - boxPad * 2, H - boxPad * 2 - titleH);
  const boxL    = floor((divX - boxSize) / 2);
  const boxT    = floor(titleH + (H - titleH - boxSize) / 2);

  g.divX = divX;
  g.box  = { L: boxL, T: boxT, R: boxL + boxSize, B: boxT + boxSize, size: boxSize };

  // Histogram panel
  const hPad = { L: 22, R: 14, T: 32, B: 54 };
  g.hist = {
    x0: divX + hPad.L,
    x1: W    - hPad.R,
    y0: hPad.T,
    y1: H    - hPad.B,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Particle physics
// ─────────────────────────────────────────────────────────────────────────────
function gaussianRandom() {
  const u1 = Math.random() || 1e-10;
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * Math.random());
}

function initParticles() {
  particles = [];
  const sigma = Math.sqrt(T / massM);
  const { L, T: bT, R, B, size } = g.box;
  for (let i = 0; i < N; i++) {
    const x  = L + RADIUS + Math.random() * (size - 2 * RADIUS);
    const y  = bT + RADIUS + Math.random() * (size - 2 * RADIUS);
    const vx = sigma * gaussianRandom();
    const vy = sigma * gaussianRandom();
    particles.push({ x, y, vx, vy });
  }
  T_prev = T;
  histBins.fill(0);
}

function doResetSpeeds() {
  // All particles at speed v_p = sqrt(2T/m) in random directions
  const vp = Math.sqrt(2 * T / massM);
  for (const p of particles) {
    const angle = Math.random() * TWO_PI;
    p.vx = vp * Math.cos(angle);
    p.vy = vp * Math.sin(angle);
  }
  histBins.fill(0);
}

function rescaleToT(T_new) {
  if (T_prev <= 0) return;
  const scale = Math.sqrt(T_new / T_prev);
  for (const p of particles) {
    p.vx *= scale;
    p.vy *= scale;
  }
  T_prev = T_new;
}

function updatePhysics() {
  const { L, T: bT, R, B } = g.box;

  // Move + wall reflect
  for (const p of particles) {
    p.x += p.vx * DT;
    p.y += p.vy * DT;
    if (p.x - RADIUS < L) { p.x = L + RADIUS;  p.vx =  Math.abs(p.vx); }
    if (p.x + RADIUS > R) { p.x = R - RADIUS;  p.vx = -Math.abs(p.vx); }
    if (p.y - RADIUS < bT){ p.y = bT + RADIUS; p.vy =  Math.abs(p.vy); }
    if (p.y + RADIUS > B) { p.y = B  - RADIUS; p.vy = -Math.abs(p.vy); }
  }

  // O(N²) elastic collisions
  const minDist = 2 * RADIUS;
  const minDist2 = minDist * minDist;
  for (let i = 0; i < particles.length - 1; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const p1 = particles[i], p2 = particles[j];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < minDist2 && d2 > 0) {
        // Check if approaching
        const dvx = p1.vx - p2.vx;
        const dvy = p1.vy - p2.vy;
        const dot = dvx * dx + dvy * dy;  // (v1-v2)·(r2-r1)
        if (dot > 0) {
          // Equal-mass elastic collision: v1' = v1 - ((v1-v2)·(r1-r2)/|r1-r2|²)(r1-r2)
          // simplifies to: Δv1 = -(dot/d²)(dx, dy), Δv2 = +(dot/d²)(dx, dy)
          const imp = dot / d2;
          p1.vx -= imp * dx;
          p1.vy -= imp * dy;
          p2.vx += imp * dx;
          p2.vy += imp * dy;
          // Separate to prevent sticking
          const d       = Math.sqrt(d2);
          const overlap = (minDist - d) * 0.5;
          const nx = dx / d, ny = dy / d;
          p1.x -= overlap * nx;
          p1.y -= overlap * ny;
          p2.x += overlap * nx;
          p2.y += overlap * ny;
        }
      }
    }
  }
}

function measureTemp() {
  if (particles.length === 0) return T;
  let ke = 0;
  for (const p of particles) ke += 0.5 * massM * (p.vx * p.vx + p.vy * p.vy);
  return ke / particles.length; // 2D: ⟨KE⟩ = T (per particle, k=1)
}

function updateHistogram() {
  const vRms = Math.sqrt(3 * T / massM);
  const vMax = 4 * vRms;
  const dv   = vMax / N_BINS;
  histBins.fill(0);
  const n = particles.length || 1;
  for (const p of particles) {
    const v   = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const bin = Math.floor(v / dv);
    if (bin < N_BINS) histBins[bin]++;
  }
  // Normalise to probability density: bin_count / (N * dv)
  for (let i = 0; i < N_BINS; i++) histBins[i] /= (n * dv);
}

// ─────────────────────────────────────────────────────────────────────────────
// Theory curve
// ─────────────────────────────────────────────────────────────────────────────
function mbTheory(v, T_val, m_val) {
  if (v <= 0) return 0;
  const A = 4 * Math.PI * Math.pow(m_val / (2 * Math.PI * T_val), 1.5);
  return A * v * v * Math.exp(-m_val * v * v / (2 * T_val));
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM / controls
// ─────────────────────────────────────────────────────────────────────────────
function readControls() {
  const newN = parseInt(document.getElementById('ctrl-n').value);
  const newT = parseFloat(document.getElementById('ctrl-t').value);
  const newM = parseFloat(document.getElementById('ctrl-m').value);

  document.getElementById('val-n').textContent = newN;
  document.getElementById('val-t').textContent = newT.toFixed(2);
  document.getElementById('val-m').textContent = newM.toFixed(1);

  // Mass change → reinit (changes speed distribution shape)
  if (Math.abs(newM - massM) > 0.001) {
    massM = newM;
    initParticles();
    return;
  }

  // N change → reinit
  if (newN !== N) {
    N = newN;
    initParticles();
    return;
  }

  // T change → rescale velocities
  if (Math.abs(newT - T) > 0.005) {
    T_prev = T;
    T = newT;
    rescaleToT(T);
  }
}

function setSliders(n_val, t_val, m_val) {
  document.getElementById('ctrl-n').value = n_val;
  document.getElementById('ctrl-t').value = t_val;
  document.getElementById('ctrl-m').value = m_val;
  document.getElementById('val-n').textContent = n_val;
  document.getElementById('val-t').textContent = parseFloat(t_val).toFixed(2);
  document.getElementById('val-m').textContent = parseFloat(m_val).toFixed(1);

  const mChanged = Math.abs(m_val - massM) > 0.001;
  const nChanged = n_val !== N;
  const tChanged = Math.abs(t_val - T) > 0.005;

  if (tChanged && !mChanged && !nChanged) {
    T_prev = T;
    T = t_val;
    rescaleToT(T);
  }
  if (mChanged) massM = m_val;
  if (nChanged) N = n_val;
  if (mChanged || nChanged) { initParticles(); return; }
  if (tChanged) return; // rescaled above
}

function heatCool(factor) {
  let newT = T * factor;
  newT = Math.max(0.2, Math.min(5.0, newT));
  document.getElementById('ctrl-t').value = newT;
  document.getElementById('val-t').textContent = newT.toFixed(2);
  T_prev = T;
  T = newT;
  rescaleToT(T);
}

function setEduMode(m) {
  eduMode = m;
  // Update button states
  document.querySelectorAll('.edu-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`edu-btn-${m}`);
  if (btn) btn.classList.add('active');
  // Canonical parameter sets
  if (m === 'distribution')  setSliders(80, 1.0, 1.0);
  if (m === 'equipartition') setSliders(80, 1.0, 1.0);
  if (m === 'evaporation')   setSliders(80, 3.5, 1.0);
  updateEduPanel(m);
}

function toggleMarker(which) {
  if (which === 'vp')    { showVp    = !showVp;    document.getElementById('btn-vp').classList.toggle('active',    showVp);    }
  if (which === 'vmean') { showVmean = !showVmean;  document.getElementById('btn-vmean').classList.toggle('active', showVmean); }
  if (which === 'vrms')  { showVrms  = !showVrms;   document.getElementById('btn-vrms').classList.toggle('active',  showVrms);  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Color map helpers
// ─────────────────────────────────────────────────────────────────────────────

// Tanner Helland blackbody approximation — T in Kelvin [1000, 40000]
function kelvinToRGB(T_K) {
  const T = Math.max(1000, Math.min(40000, T_K)) / 100;
  let r, g, b;
  r = T <= 66 ? 255
              : Math.min(255, Math.max(0, 329.698727446 * Math.pow(T - 60, -0.1332047592)));
  g = T <= 66 ? Math.min(255, Math.max(0, 99.4708025861 * Math.log(T) - 161.1195681661))
              : Math.min(255, Math.max(0, 288.1221695283 * Math.pow(T - 60, -0.0755148492)));
  b = T >= 66 ? 255
    : T <= 19 ? 0
              : Math.min(255, Math.max(0, 138.5177312231 * Math.log(T - 10) - 305.0447927307));
  return [r, g, b];
}

// Hue [0–360] → RGB via HSL (S=0.9, L=0.55)
function hueToRGB(hue) {
  const s = 0.90, l = 0.55;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let r, g, b;
  if      (hue < 60)  { r = c; g = x; b = 0; }
  else if (hue < 120) { r = x; g = c; b = 0; }
  else if (hue < 180) { r = 0; g = c; b = x; }
  else if (hue < 240) { r = 0; g = x; b = c; }
  else if (hue < 300) { r = x; g = 0; b = c; }
  else                { r = c; g = 0; b = x; }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing helpers
// ─────────────────────────────────────────────────────────────────────────────

// Dispatcher — routes to the active color map
function particleColor(v, vRmsCur) {
  if (colorMap === 'blackbody') return particleColorBlackbody(v, vRmsCur);
  if (colorMap === 'rainbow')   return particleColorRainbow(v, vRmsCur);
  return particleColorThermal(v, vRmsCur);
}

// Thermal: cold blue → white → hot red (original thermo-series map)
function particleColorThermal(v, vRmsCur) {
  const t = v / vRmsCur;
  let r, g, b;
  if (t <= 1) {
    const f = constrain(t, 0, 1);
    r = lerp(50,  220, f);
    g = lerp(130, 220, f);
    b = lerp(220, 220, f);
  } else {
    const f = constrain(t - 1, 0, 1);
    r = lerp(220, 220, f);
    g = lerp(220, 60,  f);
    b = lerp(220, 50,  f);
  }
  return [r, g, b];
}

// Blackbody: maps speed to an equivalent blackbody temperature (1000 K – 10000 K)
// Slow particles → dark red/orange (ember); fast → white → blue-white (star)
function particleColorBlackbody(v, vRmsCur) {
  const t   = constrain(v / (2 * vRmsCur), 0, 1);
  const T_K = 1000 + t * 9000;   // 1000 K (cool) → 10000 K (hot star)
  return kelvinToRGB(T_K);
}

// Rainbow: slow = violet/blue, fast = red (visible-spectrum order)
function particleColorRainbow(v, vRmsCur) {
  const t   = constrain(v / (2 * vRmsCur), 0, 1);
  const hue = (1 - t) * 270;    // 270° violet → 0° red
  return hueToRGB(hue);
}

function setColorMap(val) {
  colorMap = val;
}

function drawGasChamber() {
  const { L, T: bT, R, B } = g.box;
  const midX = (L + R) / 2;

  // Panel title
  noStroke(); fill(130, 145, 165); textSize(12); textAlign(CENTER);
  text('Particle Gas', midX, bT - 12);
  textAlign(LEFT);

  // Box walls
  stroke(50, 65, 85); strokeWeight(1.5); noFill();
  rect(L, bT, R - L, B - bT);

  const T_sim = measureTemp();
  const vRmsCur = Math.sqrt(3 * T_sim / massM);

  // Temperature readout (top-left inside box)
  noStroke(); fill(45, 215, 135); textSize(11); textAlign(LEFT);
  text(`T = ${T_sim.toFixed(2)}`, L + 7, bT + 16);

  // Particle count (top-right inside box)
  fill(130, 145, 165); textAlign(RIGHT);
  text(`N = ${particles.length}`, R - 7, bT + 16);
  textAlign(LEFT);

  // Particles
  noStroke();
  for (const p of particles) {
    const v = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const [r, gc, bc] = particleColor(v, vRmsCur);
    fill(r, gc, bc);
    circle(p.x, p.y, RADIUS * 2);
  }
}

function drawHistogram() {
  const { x0, x1, y0, y1 } = g.hist;
  const panW = x1 - x0;
  const panH = y1 - y0;

  // Use slider T for stable x-axis range; measured T for theory overlay
  const T_sim  = measureTemp();
  const vRms   = Math.sqrt(3 * T / massM);
  const vMax   = 4 * vRms;
  const vp     = Math.sqrt(2 * T_sim / massM);
  const vmean  = Math.sqrt(8 * T_sim / (Math.PI * massM));
  const vRmsSim = Math.sqrt(3 * T_sim / massM);

  // Scale: theory peak maps to 85% of panel height
  const fPeak = mbTheory(Math.sqrt(2 * T_sim / massM), T_sim, massM);
  const yScale = fPeak > 0 ? (panH * 0.85) / fPeak : 1;

  // Panel title
  noStroke(); fill(130, 145, 165); textSize(12); textAlign(CENTER);
  text('Speed Distribution', (x0 + x1) / 2, y0 - 10);
  textAlign(LEFT);

  // Axes
  stroke(42, 50, 62); strokeWeight(1);
  line(x0, y0, x0, y1);
  line(x0, y1, x1, y1);

  // Histogram bars — colored by speed using the same blue→white→red map as particles
  const barW = panW / N_BINS;
  strokeWeight(0.7);
  for (let i = 0; i < N_BINS; i++) {
    const barH = histBins[i] * yScale;
    if (barH < 0.5) continue;
    const vCenter = (i + 0.5) * (vMax / N_BINS);
    const [r, gc, bc] = particleColor(vCenter, vRmsSim);
    fill(r, gc, bc, 120);
    stroke(r, gc, bc, 200);
    rect(x0 + i * barW, y1 - barH, barW, barH);
  }

  // Theory curve (3D M-B) using measured T_sim
  stroke(255, 150, 50); strokeWeight(2); noFill();
  beginShape();
  for (let px = 0; px <= panW; px += 2) {
    const v  = map(px, 0, panW, 0, vMax);
    const fy = mbTheory(v, T_sim, massM) * yScale;
    vertex(x0 + px, y1 - fy);
  }
  endShape();

  // Characteristic speed markers (dashed verticals)
  function drawMarker(v, r, gc, bc, label) {
    const px = map(v, 0, vMax, x0, x1);
    if (px < x0 || px > x1) return;
    drawingContext.setLineDash([4, 5]);
    stroke(r, gc, bc); strokeWeight(1.5);
    line(px, y0 + 6, px, y1);
    drawingContext.setLineDash([]);
    noStroke(); fill(r, gc, bc); textSize(10); textAlign(CENTER);
    text(label, px, y0 + 4);
  }

  if (showVp)    drawMarker(vp,      170, 65,  255, 'v\u209A');
  if (showVmean) drawMarker(vmean,   88,  166, 255, '\u27E8v\u27E9');
  if (showVrms)  drawMarker(vRmsSim, 45,  215, 135, 'v\u1D63\u2098\u209B');

  // X-axis ticks and labels
  textSize(9); textAlign(CENTER);
  const nTicks = 5;
  for (let i = 0; i <= nTicks; i++) {
    const v  = (vMax / nTicks) * i;
    const px = map(v, 0, vMax, x0, x1);
    stroke(42, 50, 62); strokeWeight(1);
    line(px, y1, px, y1 + 4);
    noStroke(); fill(65, 80, 100);
    text(v.toFixed(1), px, y1 + 13);
  }
  noStroke(); fill(80, 95, 115); textSize(9); textAlign(RIGHT);
  text('v', x1, y1 + 13);
  textAlign(LEFT);

  // Y-axis label
  push();
  translate(x0 - 14, y0 + panH * 0.5);
  rotate(-HALF_PI);
  noStroke(); fill(80, 95, 115); textSize(9); textAlign(CENTER);
  text('f(v)', 0, 0);
  pop();

  // KE readout below histogram
  const keAvg = measureTemp();   // ⟨KE⟩ per particle from simulation
  const ke3D  = 1.5 * T;        // ³⁄₂kT (3D theory, k=1)
  textSize(10); textAlign(LEFT); noStroke();
  fill(45, 215, 135);
  text(`\u27E8KE\u27E9 = ${keAvg.toFixed(3)}`, x0, y1 + 30);
  fill(100, 115, 135);
  text('  \u2190  ', x0 + 90, y1 + 30);
  fill(255, 150, 50);
  text(`\u00BE kT = ${ke3D.toFixed(3)}`, x0 + 108, y1 + 30);
  // Subtle note
  fill(60, 75, 95); textSize(8);
  text('(2D sim: \u27E8KE\u27E9 \u2248 T; 3D gas: \u27E8KE\u27E9 = \u00BEkT)', x0, y1 + 43);
}

function drawDivider() {
  stroke(30, 38, 50); strokeWeight(1);
  line(g.divX, 0, g.divX, height);
}

// ─────────────────────────────────────────────────────────────────────────────
// Mouse interaction — click in box to kick nearby particles
// ─────────────────────────────────────────────────────────────────────────────
function mousePressed() {
  const { L, T: bT, R, B } = g.box;
  if (mouseX < L || mouseX > R || mouseY < bT || mouseY > B) return;
  const kickRadius = 40;
  const kickStrength = 0.8;
  const cool = mouseButton === RIGHT || keyIsDown(SHIFT);
  for (const p of particles) {
    const dx = p.x - mouseX, dy = p.y - mouseY;
    const d2 = dx * dx + dy * dy;
    if (d2 < kickRadius * kickRadius && d2 > 0) {
      const d = Math.sqrt(d2);
      const factor = cool ? (1 - kickStrength * (1 - d / kickRadius))
                           : (1 + kickStrength * (1 - d / kickRadius));
      p.vx *= factor;
      p.vy *= factor;
    }
  }
}

function contextMenu(e) { e.preventDefault(); }

// ─────────────────────────────────────────────────────────────────────────────
// p5 lifecycle
// ─────────────────────────────────────────────────────────────────────────────
function setup() {
  const cont = document.getElementById('canvas-container');
  createCanvas(cont.clientWidth, cont.clientHeight).parent('canvas-container');
  textFont('Courier New');
  computeGeometry();
  initParticles();
  updateEduPanel('distribution');
  // Disable right-click context menu on canvas for kick interaction
  const cvs = document.querySelector('#canvas-container canvas');
  if (cvs) cvs.addEventListener('contextmenu', contextMenu);
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

  histFrame++;
  if (histFrame >= HIST_EVERY) {
    updateHistogram();
    histFrame = 0;
  }

  drawDivider();
  drawGasChamber();
  drawHistogram();
}
