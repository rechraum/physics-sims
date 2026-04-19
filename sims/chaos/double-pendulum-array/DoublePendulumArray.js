const sketch = (p) => {
  // Parameters and UI elements
  let gridRes = 50;
  let simSpeed = 1;
  let simulations = [];
  let canvasWidth = 700;
  let canvasHeight = 700;
  // margins for drawing axes and labels
  let marginLeft = 50;
  let marginTop = 50;
  let drawingWidth = canvasWidth - marginLeft - 20;
  let drawingHeight = canvasHeight - marginTop - 50;
  let lowColor, midColor, highColor;

  const g = 1;               // gravity
  const d0 = 1e-6;           // initial perturbation magnitude
  const renormInterval = 0.05; // time interval (in seconds) between renormalizations

  // UI DOM elements (p5.Element wrappers)
  let startButton, gridSlider, speedSlider, gridValSpan, speedValSpan;
  let visColorCheckbox, visStickCheckbox;

  p.setup = function() {
    const cnv = p.createCanvas(canvasWidth, canvasHeight);
    cnv.parent('canvas-container');
    p.colorMode(p.HSB, 360, 100, 100);
    p.noStroke();

    // Set up blackbody colors in RGB mode
    p.push();
    p.colorMode(p.RGB);
    lowColor  = p.color(150, 0,   0);    // Dark red for low lambda
    midColor  = p.color(255, 100, 0);    // Orange for mid-range
    highColor = p.color(255, 255, 224);  // Light yellow for high lambda
    p.pop();

    // Get UI elements from the HTML page
    startButton      = p.select('#startButton');
    gridSlider       = p.select('#gridSlider');
    speedSlider      = p.select('#speedSlider');
    gridValSpan      = p.select('#gridVal');
    speedValSpan     = p.select('#speedVal');
    visColorCheckbox = p.select('#visColor');
    visStickCheckbox = p.select('#visStick');

    startButton.mousePressed(initializeSimulations);

    gridSlider.input(() => {
      gridRes = parseInt(gridSlider.value());
      gridValSpan.html(gridRes);
      const gv2 = document.getElementById('gridVal2');
      if (gv2) gv2.textContent = gridRes;
      initializeSimulations();
    });

    speedSlider.input(() => {
      simSpeed = parseFloat(speedSlider.value());
      speedValSpan.html(simSpeed);
    });

    initializeSimulations();
  };

  p.draw = function() {
    // Effective time step based on simSpeed and frame delta
    let dt = simSpeed * (p.deltaTime / 1000);

    // Update each simulation in the grid
    for (let sim of simulations) {
      sim.update(dt);
    }

    // Draw background and axes
    p.background(30);
    drawAxes();

    let cellW = drawingWidth / gridRes;
    let cellH = drawingHeight / gridRes;

    // Color representation: map Lyapunov exponent to blackbody color
    if (visColorCheckbox.checked()) {
      for (let i = 0; i < gridRes; i++) {
        for (let j = 0; j < gridRes; j++) {
          let sim = simulations[i * gridRes + j];
          let lambda = sim.lambda !== undefined ? sim.lambda : 0;
          lambda = p.constrain(lambda, 0, 2);
          p.fill(blackbodyColor(lambda));
          let x = marginLeft + j * cellW;
          // Invert vertical so θ₂ increases upward
          let y = marginTop + (gridRes - 1 - i) * cellH;
          p.rect(x, y, cellW, cellH);
        }
      }
    }

    // Stick figure representation: draw each pendulum in its cell
    if (visStickCheckbox.checked()) {
      for (let i = 0; i < gridRes; i++) {
        for (let j = 0; j < gridRes; j++) {
          let sim = simulations[i * gridRes + j];
          let x = marginLeft + j * cellW;
          let y = marginTop + (gridRes - 1 - i) * cellH;
          let cx = x + cellW / 2;
          let cy = y + cellH / 2;
          let scaleFactor = 0.8 * Math.min(cellW, cellH) / 2;

          let s = sim.state;
          let x1 = cx + scaleFactor * p.sin(s.a1);
          let y1 = cy + scaleFactor * p.cos(s.a1);
          let x2 = x1 + scaleFactor * p.sin(s.a2);
          let y2 = y1 + scaleFactor * p.cos(s.a2);

          p.stroke(0);
          p.strokeWeight(1);
          p.line(cx, cy, x1, y1);
          p.line(x1, y1, x2, y2);
          p.noStroke();
          p.fill(0);
          p.ellipse(cx, cy, 2, 2);
          p.ellipse(x1, y1, 2, 2);
          p.ellipse(x2, y2, 2, 2);
        }
      }
    }
  };

  // Draw axes with tick marks and labels for the initial conditions (-π to π)
  function drawAxes() {
    p.stroke(200);
    p.strokeWeight(1);
    p.fill(200);
    p.textSize(12);
    p.textAlign(p.CENTER, p.CENTER);

    // X-axis (θ₁) along the bottom of the grid
    let x0 = marginLeft;
    let y0 = marginTop + drawingHeight;
    p.line(x0, y0, marginLeft + drawingWidth, y0);
    for (let t of [-p.PI, 0, p.PI]) {
      let x = p.map(t, -p.PI, p.PI, marginLeft, marginLeft + drawingWidth);
      p.line(x, y0 - 5, x, y0 + 5);
      p.noStroke();
      p.text(p.nf(t, 1, 2), x, y0 + 15);
      p.stroke(200);
    }
    p.noStroke();
    p.text("θ₁ (radians)", marginLeft + drawingWidth / 2, y0 + 30);

    // Y-axis (θ₂) along the left side of the grid
    let xa = marginLeft;
    let ya = marginTop;
    p.line(xa, ya, xa, marginTop + drawingHeight);
    for (let t of [-p.PI, 0, p.PI]) {
      let y = p.map(t, -p.PI, p.PI, marginTop + drawingHeight, marginTop);
      p.line(xa - 5, y, xa + 5, y);
      p.noStroke();
      p.text(p.nf(t, 1, 2), xa - 20, y);
      p.stroke(200);
    }
    p.noStroke();
    p.push();
    p.translate(marginLeft - 40, marginTop + drawingHeight / 2);
    p.rotate(-p.PI / 2);
    p.text("θ₂ (radians)", 0, 0);
    p.pop();
  }

  // (Re)initialize the array of simulations
  function initializeSimulations() {
    simulations = [];
    for (let i = 0; i < gridRes; i++) {
      for (let j = 0; j < gridRes; j++) {
        let theta1 = p.map(j, 0, gridRes - 1, -p.PI, p.PI);
        let theta2 = p.map(i, 0, gridRes - 1, -p.PI, p.PI);
        simulations.push(new DoublePendulumSim(theta1, theta2));
      }
    }
  }

  function blackbodyColor(lambda) {
    // lambda in [0,2]: [0,1] → lowColor→midColor, [1,2] → midColor→highColor
    if (lambda < 1) {
      return p.lerpColor(lowColor, midColor, lambda);
    } else {
      return p.lerpColor(midColor, highColor, lambda - 1);
    }
  }

  // -----------------------
  // DoublePendulumSim Class
  // -----------------------
  // Each instance simulates a double pendulum with two copies:
  // one with base initial conditions and one with a tiny perturbation.
  // Uses RK4 integration; every renormInterval seconds it computes a
  // local finite-time Lyapunov exponent and renormalizes the perturbed state.
  class DoublePendulumSim {
    constructor(theta1, theta2) {
      this.state     = { a1: theta1,      a2: theta2, a1_v: 0, a2_v: 0 };
      this.statePert = { a1: theta1 + d0, a2: theta2, a1_v: 0, a2_v: 0 };
      this.lyapSum        = 0;
      this.totalTime      = 0;
      this.timeSinceRenorm = 0;
      this.lambda         = 0;
    }

    update(dt) {
      this.state     = rk4Step(this.state,     dt);
      this.statePert = rk4Step(this.statePert, dt);
      this.timeSinceRenorm += dt;

      let d1 = this.statePert.a1   - this.state.a1;
      let d2 = this.statePert.a2   - this.state.a2;
      let d3 = this.statePert.a1_v - this.state.a1_v;
      let d4 = this.statePert.a2_v - this.state.a2_v;
      let delta = Math.sqrt(d1*d1 + d2*d2 + d3*d3 + d4*d4);

      if (this.timeSinceRenorm >= renormInterval) {
        this.lyapSum   += Math.log(delta / d0);
        this.totalTime += this.timeSinceRenorm;
        this.lambda     = this.lyapSum / this.totalTime;

        // Renormalize the perturbed state so separation returns to d0
        let scale = d0 / delta;
        this.statePert.a1   = this.state.a1   + d1 * scale;
        this.statePert.a2   = this.state.a2   + d2 * scale;
        this.statePert.a1_v = this.state.a1_v + d3 * scale;
        this.statePert.a2_v = this.state.a2_v + d4 * scale;

        this.timeSinceRenorm = 0;
      }
    }
  }

  // -----------------------
  // RK4 Integration
  // -----------------------
  // State: { a1, a2, a1_v, a2_v } — angles and angular velocities
  // for a double pendulum with m1=m2=1, L1=L2=1.
  // Pure math — uses Math.* so no p5 instance needed.

  function derivatives(s) {
    let denom = 2 - Math.cos(2 * (s.a1 - s.a2));

    let a1_a = (-g * (2 * Math.sin(s.a1) + Math.sin(s.a1 - 2 * s.a2)) -
                2 * Math.sin(s.a1 - s.a2) * (s.a2_v * s.a2_v + s.a1_v * s.a1_v * Math.cos(s.a1 - s.a2)))
                / denom;

    let a2_a = (2 * Math.sin(s.a1 - s.a2) *
                (2 * s.a1_v * s.a1_v + 2 * g * Math.cos(s.a1) + s.a2_v * s.a2_v * Math.cos(s.a1 - s.a2)))
                / denom;

    return { da1: s.a1_v, da2: s.a2_v, da1_v: a1_a, da2_v: a2_a };
  }

  function rk4Step(s, dt) {
    let k1 = derivatives(s);
    let s2 = {
      a1:   s.a1   + k1.da1   * dt / 2,
      a2:   s.a2   + k1.da2   * dt / 2,
      a1_v: s.a1_v + k1.da1_v * dt / 2,
      a2_v: s.a2_v + k1.da2_v * dt / 2
    };
    let k2 = derivatives(s2);
    let s3 = {
      a1:   s.a1   + k2.da1   * dt / 2,
      a2:   s.a2   + k2.da2   * dt / 2,
      a1_v: s.a1_v + k2.da1_v * dt / 2,
      a2_v: s.a2_v + k2.da2_v * dt / 2
    };
    let k3 = derivatives(s3);
    let s4 = {
      a1:   s.a1   + k3.da1   * dt,
      a2:   s.a2   + k3.da2   * dt,
      a1_v: s.a1_v + k3.da1_v * dt,
      a2_v: s.a2_v + k3.da2_v * dt
    };
    let k4 = derivatives(s4);

    return {
      a1:   s.a1   + dt/6 * (k1.da1   + 2*k2.da1   + 2*k3.da1   + k4.da1),
      a2:   s.a2   + dt/6 * (k1.da2   + 2*k2.da2   + 2*k3.da2   + k4.da2),
      a1_v: s.a1_v + dt/6 * (k1.da1_v + 2*k2.da1_v + 2*k3.da1_v + k4.da1_v),
      a2_v: s.a2_v + dt/6 * (k1.da2_v + 2*k2.da2_v + 2*k3.da2_v + k4.da2_v)
    };
  }
};

new p5(sketch);
