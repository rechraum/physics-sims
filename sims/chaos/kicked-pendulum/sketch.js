'use strict';

const EDU = {
  driven: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Driven Kicks (Strobe)</p>
        <p class="edu-description">
          This pendulum receives a short, periodic "kick" every T units of time.
          When the timing aligns with the motion, small nudges can add up and create
          large swings. The phase space on the right is a <strong>stroboscopic snapshot</strong>:
          each point is recorded only at the instant of a kick, revealing stable islands
          (regular motion) and scattered points (chaos).
        </p>
        <p class="edu-description">
          The islands form when the pendulum locks into a repeating rhythm with the kicks.
          Those resonances create closed loops in the map, while the scattered regions are
          the chaotic sea where nearby starting points diverge rapidly.
        </p>
        <div class="equation">
          theta'' + gamma theta' + sin(theta) = K &Sigma; delta(t - nT)
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">periodic drive</span>
          <span class="edu-concept-tag">Poincare section</span>
          <span class="edu-concept-tag">resonance</span>
          <span class="edu-concept-tag">chaos</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Swing analogy</p>
          <p>
            Pushing a swing at just the right moment is far more effective than a single
            big shove. The kick period T is that timing. Change T or K and the motion can
            flip between smooth, repeating loops and chaotic wandering.
          </p>
          <p>
            Try the <strong>Mixed islands</strong> preset (K = 1.05, T = 1.20) to see
            a textbook blend of islands and chaos.
          </p>
        </div>
      </div>
    </div>
  `,

  reference: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Reference (No Drive)</p>
        <p class="edu-description">
          With no kicks, a pendulum either oscillates back and forth or rotates all the way
          around. The red curve is the <strong>separatrix</strong> &mdash; the exact energy boundary
          between those two behaviors. Below it, trajectories are closed loops; above it,
          the pendulum spins continuously.
        </p>
        <p class="edu-description">
          In this reference mode the motion is perfectly symmetric, which makes it a clean
          baseline for understanding how kicks break the symmetry and create islands and chaos.
        </p>
        <div class="equation">
          E = 0.5 omega<sup>2</sup> + 1 - cos(theta)
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">phase space</span>
          <span class="edu-concept-tag">separatrix</span>
          <span class="edu-concept-tag">energy</span>
          <span class="edu-concept-tag">oscillation vs rotation</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Try this</p>
          <p>
            Turn damping off and start a few trajectories with different initial angles.
            The smooth curves show how energy alone sets the motion when no kicks are present.
          </p>
        </div>
      </div>
    </div>
  `,

  chaos: `
    <div class="edu-strip-content">
      <div class="edu-strip-main">
        <p class="panel-heading">Chaos + Damping</p>
        <p class="edu-description">
          Damping steadily removes energy, so trajectories spiral inward in phase space.
          With periodic kicks, the system can settle into repeating patterns called
          <strong>attractors</strong> &mdash; a blend of chaos and order.
        </p>
        <p class="edu-description">
          Attractors are interesting because they show how dissipation can turn a complicated
          chaotic sea into a smaller, stable pattern. The system forgets its starting point
          and converges onto the same shape.
        </p>
        <div class="equation">
          omega<sub>n+1</sub> = omega<sub>n</sub> e<sup>-gamma T</sup> + K sin(theta<sub>n</sub>)
        </div>
        <div class="edu-concepts">
          <span class="edu-concept-tag">dissipation</span>
          <span class="edu-concept-tag">attractor</span>
          <span class="edu-concept-tag">mixing</span>
          <span class="edu-concept-tag">sensitivity</span>
        </div>
      </div>
      <div class="edu-strip-aside">
        <div class="edu-callout">
          <p class="edu-callout-title">Turn the knobs</p>
          <p>
            Increase K to push the system toward chaos. Then enable damping to see how
            dissipation funnels the motion into smaller, repeating patterns.
          </p>
          <p>
            Try the <strong>Dissipative attractor</strong> preset (K = 1.30, T = 1.20,
            gamma = 0.03) for a compact, stable shape.
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

const kickedPendulumSketch = (p) => {
  let theta = 0;
  let omega = 0;
  let t = 0;
  let nextKickTime = 0;
  let lastKick = null;
  let kickFlash = 0;

  let isPaused = false;
  let isRunning = false;

  let mode = 'driven';
  let kickStrength = 1.0;
  let kickPeriod = 1.2;
  let dampingGamma = 0.0;
  let dampingEnabled = false;
  let kickMarkerEnabled = true;
  let presetMode = 'custom';

  let startButton, pauseButton, clearButton;
  let modeSelect;
  let presetSelect;
  let kickSlider, kickValueLabel;
  let periodSlider, periodValueLabel;
  let dampingSlider, dampingValueLabel, dampingToggle;
  let kickMarkerToggle;

  let g = {};
  let phasePaths = [];
  let currentPath = null;
  let pathIndex = 0;
  let pendulumColor = null;

  const dt = 0.02;
  const stepsPerFrame = 5;
  const omegaRange = 4.2;
  const maxStrobePoints = 2800;
  const maxContinuousPoints = 1800;

  let colors = {};
  let pathPalette = [];

  p.setup = function() {
    const container = document.getElementById('canvas-container');
    const canvas = p.createCanvas(container.clientWidth, container.clientHeight);
    canvas.parent('canvas-container');

    startButton = document.getElementById('pendulum-start-button');
    pauseButton = document.getElementById('pendulum-pause-button');
    clearButton = document.getElementById('pendulum-clear-button');
    modeSelect = document.getElementById('mode-select');
    presetSelect = document.getElementById('preset-select');
    kickSlider = document.getElementById('kick-slider');
    kickValueLabel = document.getElementById('kick-value');
    periodSlider = document.getElementById('period-slider');
    periodValueLabel = document.getElementById('period-value');
    dampingToggle = document.getElementById('damping-toggle');
    dampingSlider = document.getElementById('damping-slider');
    dampingValueLabel = document.getElementById('damping-value');
    kickMarkerToggle = document.getElementById('kick-marker-toggle');

    startButton.addEventListener('click', startSimulation);
    pauseButton.addEventListener('click', togglePause);
    clearButton.addEventListener('click', clearPhaseSpace);
    modeSelect.addEventListener('change', updateMode);
    presetSelect.addEventListener('change', updatePreset);
    kickSlider.addEventListener('input', updateKickValue);
    periodSlider.addEventListener('input', updatePeriodValue);
    dampingToggle.addEventListener('change', updateDampingToggle);
    dampingSlider.addEventListener('input', updateDampingValue);
    kickMarkerToggle.addEventListener('change', updateKickMarkerToggle);

    colors = {
      background: p.color(17, 24, 32),
      divider: p.color(48, 54, 61),
      axis: p.color(70, 80, 95),
      textBright: p.color(200, 215, 230),
      textDim: p.color(155, 170, 190),
      pendulum: p.color(88, 166, 255),
      separatrix: p.color(255, 120, 120),
      kick: p.color(255, 150, 50),
    };

    pathPalette = [
      p.color(45, 215, 135, 210),
      p.color(88, 166, 255, 210),
      p.color(255, 150, 50, 210),
      p.color(170, 65, 255, 210),
    ];

    updateKickValue();
    updatePeriodValue();
    updateDampingValue();
    updateDampingToggle();
    updateKickMarkerToggle();
    updatePreset();
    updateMode();
    computeGeometry();
    startSimulation();
  };

  p.windowResized = function() {
    const container = document.getElementById('canvas-container');
    p.resizeCanvas(container.clientWidth, container.clientHeight);
    computeGeometry();
  };

  p.draw = function() {
    p.background(colors.background);
    drawDivider();

    if (isRunning && !isPaused) {
      updatePendulum();
      if (kickFlash > 0) kickFlash -= 1;
    }

    drawPendulum();
    drawPhaseSpace();
    drawHeaders();
  };

  function computeGeometry() {
    const pad = 24;
    const midX = p.width * 0.5;
    g.left = {
      x0: pad,
      x1: midX - pad,
      y0: pad,
      y1: p.height - pad,
    };
    g.right = {
      x0: midX + pad,
      x1: p.width - pad,
      y0: pad,
      y1: p.height - pad,
    };

    const leftW = g.left.x1 - g.left.x0;
    const leftH = g.left.y1 - g.left.y0;
    g.pendulum = {
      cx: g.left.x0 + leftW * 0.5,
      cy: g.left.y0 + leftH * 0.55,
      len: Math.min(leftW, leftH) * 0.38,
    };

    g.phase = {
      x0: g.right.x0 + 16,
      x1: g.right.x1 - 16,
      y0: g.right.y0 + 26,
      y1: g.right.y1 - 24,
    };
    g.phase.cx = (g.phase.x0 + g.phase.x1) * 0.5;
    g.phase.cy = (g.phase.y0 + g.phase.y1) * 0.5;
  }

  function drawDivider() {
    p.stroke(colors.divider);
    p.strokeWeight(1);
    p.line(p.width * 0.5, 0, p.width * 0.5, p.height);
  }

  function resetPendulum() {
    theta = p.random(-p.PI, p.PI);
    omega = 0;
    t = 0;
    nextKickTime = kickPeriod;
    lastKick = null;
    kickFlash = 0;
    startNewPath();
  }

  function startNewPath() {
    const color = pathPalette[pathIndex % pathPalette.length];
    currentPath = { mode, color, points: [] };
    phasePaths.push(currentPath);
    pathIndex += 1;
    pendulumColor = color;
  }

  function updatePendulum() {
    for (let i = 0; i < stepsPerFrame; i += 1) {
      if (mode === 'reference') {
        stepForward(dt);
        t += dt;
        recordContinuousPoint();
      } else {
        advanceWithKicks(dt);
      }
    }
  }

  function advanceWithKicks(stepDt) {
    let remaining = stepDt;
    while (remaining > 0) {
      const timeToKick = nextKickTime - t;
      if (timeToKick <= 0) {
        applyKick();
        recordStrobePoint();
        nextKickTime += kickPeriod;
        continue;
      }

      const dtLocal = Math.min(remaining, timeToKick);
      stepForward(dtLocal);
      t += dtLocal;
      remaining -= dtLocal;

      if (Math.abs(t - nextKickTime) < 1e-6) {
        applyKick();
        recordStrobePoint();
        nextKickTime += kickPeriod;
      }
    }
  }

  function stepForward(stepDt) {
    const gamma = dampingEnabled ? dampingGamma : 0.0;
    omega += (-Math.sin(theta) - gamma * omega) * stepDt;
    theta += omega * stepDt;
    theta = wrapAngle(theta);
  }

  function applyKick() {
    const omegaBefore = omega;
    omega += kickStrength * Math.sin(theta);
    lastKick = { theta, omegaBefore, omegaAfter: omega };
    kickFlash = 16;
  }

  function recordStrobePoint() {
    if (!currentPath) return;
    currentPath.points.push({ theta, omega });
    if (currentPath.points.length > maxStrobePoints) {
      currentPath.points.shift();
    }
  }

  function recordContinuousPoint() {
    if (!currentPath) return;
    currentPath.points.push({ theta, omega });
    if (currentPath.points.length > maxContinuousPoints) {
      currentPath.points.shift();
    }
  }

  function drawPendulum() {
    const x = g.pendulum.cx + g.pendulum.len * Math.sin(theta);
    const y = g.pendulum.cy + g.pendulum.len * Math.cos(theta);

    p.stroke(colors.textBright);
    p.strokeWeight(2);
    p.line(g.pendulum.cx, g.pendulum.cy, x, y);

    drawPendulumHashMarks();

    p.noStroke();
    p.fill(pendulumColor || colors.pendulum);
    p.ellipse(x, y, 26, 26);

    p.fill(colors.textDim);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(12);
    const status = isPaused ? 'Paused' : (isRunning ? 'Running' : 'Idle');
    p.text(`Status: ${status}`, g.left.x0 + 6, g.left.y0 + 6);
    p.text(`Kick K: ${kickStrength.toFixed(2)}`, g.left.x0 + 6, g.left.y0 + 24);
    p.text(`Period T: ${kickPeriod.toFixed(2)}`, g.left.x0 + 6, g.left.y0 + 42);
    p.text(`Damping gamma: ${dampingEnabled ? dampingGamma.toFixed(3) : 'off'}`,
      g.left.x0 + 6, g.left.y0 + 60);
  }

  function drawPendulumHashMarks() {
    const angles = [-p.HALF_PI, 0, p.HALF_PI, p.PI];
    const labels = ['-pi/2', '0', 'pi/2', 'pi'];

    for (let i = 0; i < angles.length; i += 1) {
      const a = angles[i];
      const hx = g.pendulum.cx + (g.pendulum.len + 8) * Math.sin(a);
      const hy = g.pendulum.cy + (g.pendulum.len + 8) * Math.cos(a);
      const lx = g.pendulum.cx + (g.pendulum.len + 22) * Math.sin(a);
      const ly = g.pendulum.cy + (g.pendulum.len + 22) * Math.cos(a);

      p.stroke(colors.axis);
      p.strokeWeight(2);
      p.line(
        g.pendulum.cx + g.pendulum.len * Math.sin(a),
        g.pendulum.cy + g.pendulum.len * Math.cos(a),
        hx, hy
      );

      p.noStroke();
      p.fill(colors.textDim);
      p.textSize(11);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(labels[i], lx, ly);
    }
  }

  function drawPhaseSpace() {
    drawAxes();
    drawAxisTicks();

    if (mode === 'reference') {
      drawSeparatrix();
    }

    if (mode === 'reference') {
      drawContinuousPaths();
    } else {
      drawStrobePoints();
      drawKickJump();
    }

    drawCurrentMarker();
  }

  function drawAxes() {
    p.stroke(colors.axis);
    p.strokeWeight(1);
    p.line(g.phase.x0, g.phase.cy, g.phase.x1, g.phase.cy);
    p.line(g.phase.cx, g.phase.y0, g.phase.cx, g.phase.y1);

    p.noStroke();
    p.fill(colors.textDim);
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(11);
    p.text('theta (rad)', g.phase.cx, g.phase.y1 + 6);
    p.push();
    p.translate(g.phase.x0 - 26, g.phase.cy);
    p.rotate(-p.HALF_PI);
    p.text('omega (rad / time)', 0, 0);
    p.pop();
  }

  function drawAxisTicks() {
    const angles = [-p.PI, -p.HALF_PI, 0, p.HALF_PI, p.PI];
    const labels = ['-pi', '-pi/2', '0', 'pi/2', 'pi'];

    for (let i = 0; i < angles.length; i += 1) {
      const x = mapTheta(angles[i]);
      p.stroke(colors.axis);
      p.line(x, g.phase.cy - 4, x, g.phase.cy + 4);
      p.noStroke();
      p.fill(colors.textDim);
      p.textAlign(p.CENTER, p.TOP);
      p.textSize(10);
      p.text(labels[i], x, g.phase.cy + 8);
    }

    const omegaTicks = [-4, -2, 0, 2, 4];
    for (let j = 0; j < omegaTicks.length; j += 1) {
      const y = mapOmega(omegaTicks[j]);
      p.stroke(colors.axis);
      p.line(g.phase.cx - 4, y, g.phase.cx + 4, y);
      if (omegaTicks[j] !== 0) {
        p.noStroke();
        p.fill(colors.textDim);
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(10);
        p.text(omegaTicks[j].toFixed(0), g.phase.cx + 8, y);
      }
    }
  }

  function drawSeparatrix() {
    p.noFill();
    p.stroke(colors.separatrix);
    p.strokeWeight(2);
    p.drawingContext.setLineDash([5, 5]);

    p.beginShape();
    for (let angle = -p.PI; angle <= p.PI; angle += 0.01) {
      const omegaSep = 2 * Math.cos(angle / 2);
      p.vertex(mapTheta(angle), mapOmega(omegaSep));
    }
    p.endShape();

    p.beginShape();
    for (let angle = -p.PI; angle <= p.PI; angle += 0.01) {
      const omegaSep = -2 * Math.cos(angle / 2);
      p.vertex(mapTheta(angle), mapOmega(omegaSep));
    }
    p.endShape();

    p.drawingContext.setLineDash([]);
  }

  function drawContinuousPaths() {
    for (let i = 0; i < phasePaths.length; i += 1) {
      const path = phasePaths[i];
      if (path.points.length < 2) continue;
      p.stroke(path.color);
      p.strokeWeight(1.4);
      p.noFill();
      p.beginShape();
      let prevTheta = null;
      for (const point of path.points) {
        if (prevTheta !== null && Math.abs(point.theta - prevTheta) > p.PI) {
          p.endShape();
          p.beginShape();
        }
        prevTheta = point.theta;
        p.vertex(mapTheta(point.theta), mapOmega(point.omega));
      }
      p.endShape();
    }
  }

  function drawStrobePoints() {
    for (let i = 0; i < phasePaths.length; i += 1) {
      const path = phasePaths[i];
      p.stroke(path.color);
      p.strokeWeight(2);
      for (const point of path.points) {
        p.point(mapTheta(point.theta), mapOmega(point.omega));
      }
    }
  }

  function drawCurrentMarker() {
    const x = mapTheta(theta);
    const y = mapOmega(omega);
    if (x < g.phase.x0 || x > g.phase.x1 || y < g.phase.y0 || y > g.phase.y1) return;
    p.noStroke();
    p.fill(colors.textBright);
    p.ellipse(x, y, 6, 6);
  }

  function drawKickJump() {
    if (!kickMarkerEnabled || !lastKick || kickFlash <= 0) return;
    const x = mapTheta(lastKick.theta);
    const y0 = mapOmega(lastKick.omegaBefore);
    const y1 = mapOmega(lastKick.omegaAfter);
    const alpha = p.map(kickFlash, 0, 16, 0, 220);

    p.stroke(colors.kick.levels[0], colors.kick.levels[1], colors.kick.levels[2], alpha);
    p.strokeWeight(2.4);
    p.line(x, y0, x, y1);
  }

  function drawKickLabel() {
    if (!kickMarkerEnabled || kickFlash <= 0) return;
    const alpha = p.map(kickFlash, 0, 16, 0, 210);
    p.textSize(12);
    const label = 'kick';
    const x = g.left.x1 - p.textWidth(label) - 10;
    const y = g.left.y0 + 10;

    p.noStroke();
    p.fill(colors.kick.levels[0], colors.kick.levels[1], colors.kick.levels[2], alpha);
    p.textAlign(p.LEFT, p.TOP);
    p.text(label, x, y);
  }

  function drawHeaders() {
    p.noStroke();
    p.fill(colors.textBright);
    p.textSize(14);
    p.textAlign(p.CENTER, p.TOP);
    const title = mode === 'reference' ? 'Phase Space (Reference)' : 'Stroboscopic Phase Space';
    p.text(title, g.phase.cx, g.phase.y0 - 20);
    drawKickLabel();
  }

  function mapTheta(value) {
    return p.map(value, -p.PI, p.PI, g.phase.x0, g.phase.x1);
  }

  function mapOmega(value) {
    return p.map(value, -omegaRange, omegaRange, g.phase.y1, g.phase.y0);
  }

  function wrapAngle(angle) {
    return p.atan2(Math.sin(angle), Math.cos(angle));
  }

  function startSimulation() {
    isRunning = true;
    isPaused = false;
    resetPendulum();
    pauseButton.textContent = 'Pause';
  }

  function togglePause() {
    if (!isRunning) return;
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
  }

  function clearPhaseSpace() {
    phasePaths = [];
    currentPath = null;
    resetPendulum();
  }

  function updateMode() {
    mode = modeSelect.value;
    if (mode === 'chaos') {
      dampingToggle.checked = true;
    }
    updateDampingToggle();
    updateEduPanel(mode);
    clearPhaseSpace();
  }

  function updateKickValue() {
    kickStrength = parseFloat(kickSlider.value);
    kickValueLabel.textContent = kickStrength.toFixed(2);
    if (presetMode !== 'custom') setPresetSelect('custom');
  }

  function updatePeriodValue() {
    kickPeriod = parseFloat(periodSlider.value);
    periodValueLabel.textContent = kickPeriod.toFixed(2);
    if (presetMode !== 'custom') setPresetSelect('custom');
  }

  function updateDampingToggle() {
    dampingEnabled = dampingToggle.checked;
    dampingSlider.disabled = !dampingEnabled;
    updateDampingValue();
    if (presetMode !== 'custom') setPresetSelect('custom');
  }

  function updateDampingValue() {
    dampingGamma = parseFloat(dampingSlider.value);
    dampingValueLabel.textContent = dampingGamma.toFixed(3);
    if (presetMode !== 'custom') setPresetSelect('custom');
  }

  function updateKickMarkerToggle() {
    kickMarkerEnabled = kickMarkerToggle.checked;
  }

  function updatePreset() {
    const nextPreset = presetSelect.value;
    presetMode = nextPreset;

    if (nextPreset === 'custom') return;

    if (nextPreset === 'regular') {
      applyPreset({ k: 0.50, t: 1.20, dampingOn: false, gamma: 0.0, mode: 'driven' });
    } else if (nextPreset === 'mixed') {
      applyPreset({ k: 1.05, t: 1.20, dampingOn: false, gamma: 0.0, mode: 'driven' });
    } else if (nextPreset === 'chaotic') {
      applyPreset({ k: 2.40, t: 1.20, dampingOn: false, gamma: 0.0, mode: 'driven' });
    } else if (nextPreset === 'dissipative') {
      applyPreset({ k: 1.30, t: 1.20, dampingOn: true, gamma: 0.03, mode: 'chaos' });
    }
  }

  function applyPreset({ k, t, dampingOn, gamma, mode: nextMode }) {
    kickStrength = k;
    kickPeriod = t;
    dampingEnabled = dampingOn;
    dampingGamma = gamma;

    kickSlider.value = k.toFixed(2);
    kickValueLabel.textContent = k.toFixed(2);
    periodSlider.value = t.toFixed(2);
    periodValueLabel.textContent = t.toFixed(2);
    dampingToggle.checked = dampingOn;
    dampingSlider.disabled = !dampingOn;
    dampingSlider.value = gamma.toFixed(3);
    dampingValueLabel.textContent = gamma.toFixed(3);

    if (modeSelect.value !== nextMode) {
      modeSelect.value = nextMode;
      updateMode();
    } else {
      clearPhaseSpace();
    }
  }

  function setPresetSelect(value) {
    presetMode = value;
    presetSelect.value = value;
  }
};
