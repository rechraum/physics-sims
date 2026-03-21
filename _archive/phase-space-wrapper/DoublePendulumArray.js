// Global parameters and UI elements
let gridRes = 50;          // default: 50 x 50 grid
let simSpeed = 1;          // simulation speed multiplier
let simulations = [];      // array holding all simulation objects
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

// UI DOM elements
let startButton, gridSlider, speedSlider, gridValSpan, speedValSpan;
let visColorCheckbox, visStickCheckbox;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  colorMode(HSB, 360, 100, 100);
  noStroke();
  
  //set up blackbody colors
  push();
  colorMode(RGB);
  lowColor = color(150, 0, 0);       // Dark red for low lambda values.
  midColor = color(255, 100, 0);       // Orange for mid-range values.
  highColor = color(255, 255, 224);    // Light yellow (almost white) for high lambda values.
  pop();

  
  // Get UI elements from the HTML page
  startButton = select('#startButton');
  gridSlider = select('#gridSlider');
  speedSlider = select('#speedSlider');
  gridValSpan = selectAll('#gridVal')[0];
  speedValSpan = select('#speedVal');
  visColorCheckbox = select('#visColor');
  visStickCheckbox = select('#visStick');
  
  startButton.mousePressed(initializeSimulations);
  
  gridSlider.input(() => {
    gridRes = int(gridSlider.value());
    gridValSpan.html(gridRes);
    initializeSimulations();
  });
  
  speedSlider.input(() => {
    simSpeed = float(speedSlider.value());
    speedValSpan.html(simSpeed);
  });
  
  initializeSimulations();
}

function draw() {
  // The effective time step is based on simSpeed and the frame deltaTime (in seconds)
  let dt = simSpeed * (deltaTime / 1000);
  
  // Update each simulation in the grid
  for (let sim of simulations) {
    sim.update(dt);
  }
  
  // Draw background and axes
  background(30);
  drawAxes();
  
  let cellW = drawingWidth / gridRes;
  let cellH = drawingHeight / gridRes;
  
  // If the color representation is enabled, draw the grid of colored cells.
  if (visColorCheckbox.checked()) {
    for (let i = 0; i < gridRes; i++) {
      for (let j = 0; j < gridRes; j++) {
        let index = i * gridRes + j;
        let sim = simulations[index];
        // Map the estimated lambda to a color.
        // We map lambda (0 to 2 or more) to a hue from 240 (blue) to 0 (red)
        let lambda = sim.lambda; // may be undefined initially
        if (lambda === undefined) lambda = 0;
        lambda = constrain(lambda, 0, 2);
        let bbColor = blackbodyColor(lambda);
        fill(bbColor);

        
        let x = marginLeft + j * cellW;
        // We want theta2 (vertical initial condition) to increase upward,
        // so we invert the vertical index.
        let y = marginTop + (gridRes - 1 - i) * cellH;
        rect(x, y, cellW, cellH);
      }
    }
  }
  
  // If the stick figure representation is enabled, draw a simple double pendulum
  // in each cell over the background.
  if (visStickCheckbox.checked()) {
    for (let i = 0; i < gridRes; i++) {
      for (let j = 0; j < gridRes; j++) {
        let index = i * gridRes + j;
        let sim = simulations[index];
        
        // Compute the cell position
        let x = marginLeft + j * cellW;
        // Again, invert the vertical index so that lower indices are at the top.
        let y = marginTop + (gridRes - 1 - i) * cellH;
        // Use the center of the cell as the pivot point
        let cx = x + cellW / 2;
        let cy = y + cellH / 2;
        // Compute a scaling factor so that the total pendulum (length 2) fits well within the cell.
        let scaleFactor = 0.8 * min(cellW, cellH) / 2;
        
        // Use the unperturbed simulation state for the drawing
        let s = sim.state;
        // Calculate the first bob position.
        // (Angles are assumed to be measured from the vertical.)
        let x1 = cx + scaleFactor * sin(s.a1);
        let y1 = cy + scaleFactor * cos(s.a1);
        // Calculate the second bob position.
        let x2 = x1 + scaleFactor * sin(s.a2);
        let y2 = y1 + scaleFactor * cos(s.a2);
        
        // Draw the rods and joints.
        stroke(0); // black lines for contrast
        strokeWeight(1);
        line(cx, cy, x1, y1);
        line(x1, y1, x2, y2);
        noStroke();
        fill(0);
        ellipse(cx, cy, 2, 2);   // pivot
        ellipse(x1, y1, 2, 2);    // first bob
        ellipse(x2, y2, 2, 2);    // second bob
      }
    }
  }
}

// Draw axes with tick marks and labels for the initial conditions (-π to π)
function drawAxes() {
  stroke(200);
  strokeWeight(1);
  fill(200);
  textSize(12);
  textAlign(CENTER, CENTER);
  
  // X-axis (θ₁) along the bottom of the grid
  let x0 = marginLeft;
  let y0 = marginTop + drawingHeight;
  line(x0, y0, marginLeft + drawingWidth, y0);
  // Ticks and labels for x-axis: label at -π, 0, π
  for (let t of [-PI, 0, PI]) {
    let x = map(t, -PI, PI, marginLeft, marginLeft + drawingWidth);
    line(x, y0 - 5, x, y0 + 5);
    noStroke();
    text(nf(t, 1, 2), x, y0 + 15);
    stroke(200);
  }
  noStroke();
  text("θ₁ (radians)", marginLeft + drawingWidth / 2, y0 + 30);
  
  // Y-axis (θ₂) along the left side of the grid
  let x1 = marginLeft;
  let y1 = marginTop;
  line(x1, y1, x1, marginTop + drawingHeight);
  // Ticks and labels for y-axis: label at -π, 0, π
  for (let t of [-PI, 0, PI]) {
    let y = map(t, -PI, PI, marginTop + drawingHeight, marginTop);
    line(x1 - 5, y, x1 + 5, y);
    noStroke();
    text(nf(t, 1, 2), x1 - 20, y);
    stroke(200);
  }
  noStroke();
  push();
  translate(marginLeft - 40, marginTop + drawingHeight / 2);
  rotate(-PI / 2);
  text("θ₂ (radians)", 0, 0);
  pop();
}

// Called when the start/restart button is pressed or the grid slider changes.
// (Re)initialize the array of simulations.
function initializeSimulations() {
  simulations = [];
  for (let i = 0; i < gridRes; i++) {
    for (let j = 0; j < gridRes; j++) {
      // Map grid coordinates to initial angles in the range [-π, π]
      let theta1 = map(j, 0, gridRes - 1, -PI, PI);
      let theta2 = map(i, 0, gridRes - 1, -PI, PI);
      // Create a new simulation with initial angular velocities zero.
      let sim = new DoublePendulumSim(theta1, theta2);
      simulations.push(sim);
    }
  }
}

function blackbodyColor(lambda) {
    // lambda is assumed to be in the range [0,2].
    // For lambda in [0, 1]: interpolate from lowColor to midColor.
    // For lambda in [1, 2]: interpolate from midColor to highColor.
    if (lambda < 1) {
      return lerpColor(lowColor, midColor, lambda);
    } else {
      return lerpColor(midColor, highColor, lambda - 1);
    }
  }
  

// -----------------------
// DoublePendulumSim Class
// -----------------------
// Each instance simulates a double pendulum with two copies:
// one with the base initial conditions and one with a tiny perturbation.
// The simulation uses RK4 integration, and every renormInterval seconds
// it computes a local finite-time Lyapunov exponent and renormalizes the perturbed state.
class DoublePendulumSim {
  constructor(theta1, theta2) {
    // Initial state: angles and angular velocities.
    this.state = { a1: theta1, a2: theta2, a1_v: 0, a2_v: 0 };
    // Perturbed state: add a tiny offset (d0) to a1.
    this.statePert = {
      a1: theta1 + d0,
      a2: theta2,
      a1_v: 0,
      a2_v: 0
    };
    // For computing the Lyapunov exponent
    this.lyapSum = 0;
    this.totalTime = 0;
    this.timeSinceRenorm = 0;
    this.lambda = 0;  // running estimate of the exponent
  }
  
  update(dt) {
    // Update both states using RK4 integration.
    this.state = rk4Step(this.state, dt);
    this.statePert = rk4Step(this.statePert, dt);
    
    // Increase the timer
    this.timeSinceRenorm += dt;
    
    // Compute the difference between the two states.
    let d1 = this.statePert.a1 - this.state.a1;
    let d2 = this.statePert.a2 - this.state.a2;
    let d3 = this.statePert.a1_v - this.state.a1_v;
    let d4 = this.statePert.a2_v - this.state.a2_v;
    let delta = sqrt(d1*d1 + d2*d2 + d3*d3 + d4*d4);
    
    // Every renormInterval seconds, compute the local exponent and renormalize.
    if (this.timeSinceRenorm >= renormInterval) {
      let lambda_local = log(delta / d0) / this.timeSinceRenorm;
      this.lyapSum += log(delta / d0);
      this.totalTime += this.timeSinceRenorm;
      this.lambda = this.lyapSum / this.totalTime;
      
      // Renormalize the perturbed state so that its separation is again d0.
      let scale = d0 / delta;
      this.statePert.a1 = this.state.a1 + d1 * scale;
      this.statePert.a2 = this.state.a2 + d2 * scale;
      this.statePert.a1_v = this.state.a1_v + d3 * scale;
      this.statePert.a2_v = this.state.a2_v + d4 * scale;
      
      this.timeSinceRenorm = 0;
    }
  }
}

// -----------------------
// RK4 Integration Functions
// -----------------------
// Given a state object with properties: a1, a2, a1_v, a2_v,
// the derivatives are given by the double pendulum equations (for m1 = m2 = 1, L1 = L2 = 1).
function derivatives(s) {
  let a1 = s.a1;
  let a2 = s.a2;
  let a1_v = s.a1_v;
  let a2_v = s.a2_v;
  
  // Compute denominator for both accelerations:
  let denom = 2 - cos(2 * (a1 - a2));
  
  // Equations of motion for the double pendulum:
  let a1_a = (-g * (2 * sin(a1) + sin(a1 - 2 * a2)) -
              2 * sin(a1 - a2) * (a2_v * a2_v + a1_v * a1_v * cos(a1 - a2)))
              / denom;
  
  let a2_a = (2 * sin(a1 - a2) *
              (2 * a1_v * a1_v + 2 * g * cos(a1) + a2_v * a2_v * cos(a1 - a2)))
              / denom;
  
  return { da1: a1_v, da2: a2_v, da1_v: a1_a, da2_v: a2_a };
}

function rk4Step(s, dt) {
  let k1 = derivatives(s);
  let s2 = {
    a1: s.a1 + k1.da1 * dt / 2,
    a2: s.a2 + k1.da2 * dt / 2,
    a1_v: s.a1_v + k1.da1_v * dt / 2,
    a2_v: s.a2_v + k1.da2_v * dt / 2
  };
  let k2 = derivatives(s2);
  let s3 = {
    a1: s.a1 + k2.da1 * dt / 2,
    a2: s.a2 + k2.da2 * dt / 2,
    a1_v: s.a1_v + k2.da1_v * dt / 2,
    a2_v: s.a2_v + k2.da2_v * dt / 2
  };
  let k3 = derivatives(s3);
  let s4 = {
    a1: s.a1 + k3.da1 * dt,
    a2: s.a2 + k3.da2 * dt,
    a1_v: s.a1_v + k3.da1_v * dt,
    a2_v: s.a2_v + k3.da2_v * dt
  };
  let k4 = derivatives(s4);
  
  return {
    a1: s.a1 + dt/6 * (k1.da1 + 2*k2.da1 + 2*k3.da1 + k4.da1),
    a2: s.a2 + dt/6 * (k1.da2 + 2*k2.da2 + 2*k3.da2 + k4.da2),
    a1_v: s.a1_v + dt/6 * (k1.da1_v + 2*k2.da1_v + 2*k3.da1_v + k4.da1_v),
    a2_v: s.a2_v + dt/6 * (k1.da2_v + 2*k2.da2_v + 2*k3.da2_v + k4.da2_v)
  };
}
