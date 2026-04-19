let windAmplitudeSlider, windFrequencySlider;
let buildingHeightSlider, buildingStiffnessSlider;
let dampingMassSlider, damperStiffnessSlider;

let windAmplitude, windFrequency;
let buildingHeight, buildingStiffness;
let dampingMass, damperStiffness;

let x1 = 0, v1 = 0, a1 = 0; // Building top sway
let x2 = 0, v2 = 0, a2 = 0; // Damper mass relative to building top

let m1 = 1000; // Mass of the building
let m2; // Mass of the damper

let k1; // Stiffness of the building
let k2; // Stiffness of the damper spring
let c1 = 5; // Damping coefficient of the building
let c2 = 5; // Damping coefficient of the damper

let F = 0; // External force due to wind

// Parameters for drawing the building
let numSegments = 20; // Number of segments to represent the building
let segmentHeight;

function setup() {
  const cnv = createCanvas(800, 600);
  cnv.parent('canvas-container');
}

function updatePhysics(dt) {
  // Get parameters from HTML sliders
  windAmplitude = parseFloat(document.getElementById('wind-amplitude-slider').value);
  windFrequency = parseFloat(document.getElementById('wind-frequency-slider').value);
  buildingHeight = parseFloat(document.getElementById('building-height-slider').value);
  buildingStiffness = parseFloat(document.getElementById('building-stiffness-slider').value);
  dampingMass = parseFloat(document.getElementById('damping-mass-slider').value);
  damperStiffness = parseFloat(document.getElementById('damper-stiffness-slider').value);

  // Update display values
  document.getElementById('wind-amplitude-val').textContent = windAmplitude;
  document.getElementById('wind-frequency-val').textContent = windFrequency.toFixed(1);
  document.getElementById('building-height-val').textContent = buildingHeight;
  document.getElementById('building-stiffness-val').textContent = buildingStiffness.toFixed(1);
  document.getElementById('damping-mass-val').textContent = dampingMass;
  document.getElementById('damper-stiffness-val').textContent = damperStiffness;

  m2 = dampingMass;
  k1 = buildingStiffness * 1000; // Scale for simulation purposes
  k2 = damperStiffness;
  
  // External force due to wind
  F = windAmplitude * sin(windFrequency * millis() / 1000);

  // Equations of motion
  // Building sway at the top
  a1 = (F - c1 * v1 - k1 * x1 - c2 * (v1 - v2) - k2 * (x1 - x2)) / m1;
  // Damper mass relative to building top
  a2 = (-c2 * (v2 - v1) - k2 * (x2 - x1)) / m2;

  // Update velocities and positions
  v1 += a1 * dt;
  x1 += v1 * dt;

  v2 += a2 * dt;
  x2 += v2 * dt;
}

function draw() {
  background(220);

  let dt = 0.1;
  updatePhysics(dt);

  // Draw the bending building
  drawBendingBuilding();

  // Draw damper mass
  drawDamperMass();

  // (slider values displayed in HTML panel)
}

function drawBendingBuilding() {
  // Calculate segment positions
  let baseX = width / 2;
  let baseY = height;
  segmentHeight = buildingHeight / numSegments;

  let xPositions = [];
  for (let i = 0; i <= numSegments; i++) {
    let y = baseY - (i * segmentHeight);
    // Displacement increases with height
    let displacement = x1 * (i / numSegments) ** 2; // Quadratic increase
    xPositions.push(baseX + displacement * 50); // Scale factor for visualization
  }

  // Draw the building as a series of lines between the segment positions
  stroke(150);
  strokeWeight(5);
  for (let i = 0; i < numSegments; i++) {
    line(
      xPositions[i], baseY - (i * segmentHeight),
      xPositions[i + 1], baseY - ((i + 1) * segmentHeight)
    );
  }
}

function drawDamperMass() {
  // Damper mass position at the top of the building
  let topX = width / 2 + x1 * 50 + x2 * 50;
  let topY = height - buildingHeight;

  fill(255, 0, 0);
  noStroke();
  ellipse(topX, topY - 20, 30, 30);
}

