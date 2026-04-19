// Global configuration for the two-panel canvas:
const simulationWidth = 600;
const simulationHeight = 500; // Reduced height
const histogramWidth = 300;
const histogramHeight = simulationHeight; // Define histogramHeight
const totalWidth = simulationWidth + histogramWidth;
const totalHeight = simulationHeight;

// Simulation and UI state
let particles = [];
let running = false;
let simulationSpeed = 1; // from slider (now 0.1 - 10)
let particleCount = 25;
let stepSize = 5; // New slider for step size (multiplier for step magnitude)
let distributionType = "gaussian"; // "gaussian" or "levy"
let pathlines = true;
let histogramData = []; // stores the step magnitudes

// p5.js setup
function setup() {
  // Create one canvas that spans both panels and attach it to the container
  const cnv = createCanvas(totalWidth, totalHeight);
  cnv.parent("canvas-container");
  
  // Set a dark background for the entire canvas
  background(34);
  
  setupControls();
  initializeParticles();
}

// Set up UI event listeners using p5's select()
function setupControls() {
  const particleCountSlider = select("#particleCount");
  const particleCountLabel = select("#particleCountLabel");
  particleCountSlider.input(() => {
    particleCount = Number(particleCountSlider.value());
    particleCountLabel.html(particleCount);
  });
  
  const simSpeedSlider = select("#simSpeed");
  const simSpeedLabel = select("#simSpeedLabel");
  simSpeedSlider.input(() => {
    simulationSpeed = Number(simSpeedSlider.value());
    simSpeedLabel.html(simulationSpeed);
  });
  
  const stepSizeSlider = select("#stepSize");
  const stepSizeLabel = select("#stepSizeLabel");
  stepSizeSlider.input(() => {
    stepSize = Number(stepSizeSlider.value());
    stepSizeLabel.html(stepSize);
  });
  
  const startBtn = select("#startBtn");
  startBtn.mousePressed(() => {
    running = true;
  });
  
  const pauseBtn = select("#pauseBtn");
  pauseBtn.mousePressed(() => {
    running = false;
  });
  
  const restartBtn = select("#restartBtn");
  restartBtn.mousePressed(() => {
    running = false;
    clearSimulation();
    initializeParticles();
  });
  
  const pathToggle = select("#pathToggle");
  pathToggle.changed(() => {
    pathlines = pathToggle.elt.checked;
  });
  
  const distSelect = select("#distSelect");
  distSelect.changed(() => {
    distributionType = distSelect.value();
  });
  
  const resetHistBtn = select("#resetHistBtn");
  resetHistBtn.mousePressed(() => {
    histogramData = [];
  });
}

// Particle class representing each moving particle
class Particle {
  constructor(col) {
    // Start all particles at the simulation area's center
    this.pos = createVector(simulationWidth / 2, simulationHeight / 2);
    this.trail = [];
    this.col = col;
  }
  
  update() {
    let step;
    if (distributionType === "gaussian") {
      // For Brownian motion, sample dx, dy from a normal distribution,
      // scaling by simulationSpeed and stepSize
      const dx = randomGaussian() * simulationSpeed * stepSize;
      const dy = randomGaussian() * simulationSpeed * stepSize;
      step = createVector(dx, dy);
    } else if (distributionType === "levy") {
      // For Levy Flight, sample a step with a heavy-tailed distribution
      const angle = random(TWO_PI);
      const u = random();
      const alpha = 1.5; // typical exponent for Levy flights
      let stepMag = simulationSpeed * stepSize * pow(u, -1 / alpha);
      // Clamp the step magnitude to avoid extreme jumps
      stepMag = min(stepMag, simulationSpeed * stepSize * 20);
      step = createVector(stepMag * cos(angle), stepMag * sin(angle));
    }
    // Record the magnitude for the histogram
    const stepMagnitude = step.mag();
    histogramData.push(stepMagnitude);
    
    // Save the current position into the trail before updating
    this.trail.push(this.pos.copy());
    this.pos.add(step);
  }
  
  display() {
    stroke(this.col);
    if (pathlines) {
      noFill();
      beginShape();
      for (let pos of this.trail) {
        vertex(pos.x, pos.y);
      }
      vertex(this.pos.x, this.pos.y);
      endShape();
    }
    fill(this.col);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 5, 5);
  }
}

// Initialize the particles array based on the current particle count
function initializeParticles() {
  particles = [];
  histogramData = [];
  for (let i = 0; i < particleCount; i++) {
    // Generate a random bright color for each particle
    const col = color(random(50, 255), random(50, 255), random(50, 255));
    particles.push(new Particle(col));
  }
}

// When restarting, clear the simulation area (the left panel)
function clearSimulation() {
  push();
  noStroke();
  fill(34);
  rect(0, 0, simulationWidth, simulationHeight);
  pop();
  histogramData = [];
}

// The main draw loop
function draw() {
  // Draw a vertical line separator between simulation and histogram panels
  stroke(255);
  line(simulationWidth, 0, simulationWidth, height);
  
  // Update and display simulation (left panel)
  if (running) {
    for (let p of particles) {
      p.update();
      p.display();
    }
  } else {
    for (let p of particles) {
      p.display();
    }
  }
  
  // Draw the histogram panel background (right panel)
  push();
  fill(34);
  noStroke();
  rect(simulationWidth, 0, histogramWidth, histogramHeight);
  pop();
  
  // Draw the histogram and theoretical curve in the right panel
  drawHistogram();
}

// Compute and draw the live histogram and overlay the theoretical PDF curve
function drawHistogram() {
  // Set number of bins for histogram
  const bins = 20;
  let xMin = 0;
  let xMax;
  if (histogramData.length > 0) {
    xMax = max(histogramData);
  } else {
    // Default max based on distribution type and speed
    if (distributionType === "gaussian") {
      xMax = simulationSpeed * stepSize * 5;
    } else {
      xMax = simulationSpeed * stepSize * 10;
    }
  }
  if (xMax < 10) xMax = 10; // ensure a minimal range
  
  const binWidth = (xMax - xMin) / bins;
  let histogramCounts = Array(bins).fill(0);
  for (let value of histogramData) {
    let binIndex = floor(map(value, xMin, xMax, 0, bins));
    if (binIndex >= bins) binIndex = bins - 1;
    histogramCounts[binIndex]++;
  }
  
  // Determine the maximum count for scaling the histogram vertically
  const maxCount = max(histogramCounts);
  
  // Draw the histogram in the histogram panel (right side)
  push();
  translate(simulationWidth, 0);
  const padding = 20;
  const histAreaWidth = histogramWidth - 2 * padding;
  const histAreaHeight = histogramHeight - 2 * padding;
  
  // Draw axes for the histogram
  stroke(200);
  // x-axis
  line(padding, histogramHeight - padding, histogramWidth - padding, histogramHeight - padding);
  // y-axis
  line(padding, padding, padding, histogramHeight - padding);
  
  // Add axis labels
  noStroke();
  fill(200);
  textSize(12);
  // X-axis label
  textAlign(CENTER, CENTER);
  text("Step Size", padding + histAreaWidth / 2, histogramHeight - padding/2);
  // Y-axis label (rotated)
  push();
  translate(padding/2, padding + histAreaHeight / 2);
  rotate(-HALF_PI);
  text("Probability", 0, 0);
  pop();
  
  // Draw histogram bars
  noStroke();
  fill(100, 200, 255, 150);
  for (let i = 0; i < bins; i++) {
    const barHeight = (histogramCounts[i] / (maxCount || 1)) * histAreaHeight;
    const xBar = padding + (i * histAreaWidth / bins);
    const barWidth = histAreaWidth / bins - 2;
    rect(xBar, histogramHeight - padding - barHeight, barWidth, barHeight);
  }
  
  // Overlay the theoretical probability distribution curve.
  stroke(255, 100, 100);
  noFill();
  beginShape();
  // Determine the maximum theoretical PDF value for scaling.
  let theoreticalMax = 0;
  for (let j = 0; j <= bins; j++) {
    let testX = xMin + (j / bins) * (xMax - xMin);
    theoreticalMax = max(theoreticalMax, theoreticalPDF(testX, distributionType, simulationSpeed, stepSize));
  }
  for (let i = 0; i <= bins; i++) {
    const xVal = xMin + (i / bins) * (xMax - xMin);
    const pdfVal = theoreticalPDF(xVal, distributionType, simulationSpeed, stepSize);
    const y = map(pdfVal, 0, theoreticalMax, 0, histAreaHeight);
    vertex(padding + (i / bins) * histAreaWidth, histogramHeight - padding - y);
  }
  endShape();
  pop();
}

// Compute the theoretical probability density for the current distribution,
// now incorporating the stepSize multiplier.
function theoreticalPDF(x, distType, simSpeed, stepSize) {
  if (distType === "gaussian") {
    // For Brownian motion, the step size distribution (for the magnitude)
    // follows a Rayleigh distribution with sigma = simulationSpeed * stepSize.
    const sigma = simSpeed * stepSize;
    if (x < 0) return 0;
    return (x / (sigma * sigma)) * exp(-x * x / (2 * sigma * sigma));
  } else if (distType === "levy") {
    // For Levy Flight, assume a power-law tail.
    // The minimum step size is roughly simSpeed * stepSize.
    const alpha = 1.5;
    const scale = simSpeed * stepSize;
    if (x < scale) return 0;
    // Here we use an unnormalized power law:
    return pow(x / scale, -alpha);
  }
  return 0;
}
