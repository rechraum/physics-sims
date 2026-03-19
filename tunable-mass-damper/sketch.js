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
  createCanvas(800, 600);

  // Initialize sliders
  windAmplitudeSlider = createSlider(0, 100, 50);
  windAmplitudeSlider.position(20, 20);
  windFrequencySlider = createSlider(0.1, 5, 1, 0.1);
  windFrequencySlider.position(20, 60);

  buildingHeightSlider = createSlider(200, 500, 300);
  buildingHeightSlider.position(20, 100);
  buildingStiffnessSlider = createSlider(0.1, 10, 5, 0.1);
  buildingStiffnessSlider.position(20, 140);

  dampingMassSlider = createSlider(1, 100, 50);
  dampingMassSlider.position(20, 180);
  
  damperStiffnessSlider = createSlider(50, 200, 100);
  damperStiffnessSlider.position(20, 220);
}

function updatePhysics(dt) {
  // Get parameters from sliders
  windAmplitude = windAmplitudeSlider.value();
  windFrequency = windFrequencySlider.value();
  buildingHeight = buildingHeightSlider.value();
  buildingStiffness = buildingStiffnessSlider.value();
  dampingMass = dampingMassSlider.value();
  damperStiffness = damperStiffnessSlider.value();

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

  // Display slider labels and values
  displaySliderValues();
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

function displaySliderValues() {
  fill(0);
  textSize(14);
  text('Wind Amplitude: ' + windAmplitude, windAmplitudeSlider.x * 2 + windAmplitudeSlider.width, 35);
  text('Wind Frequency: ' + windFrequency.toFixed(1), windFrequencySlider.x * 2 + windFrequencySlider.width, 75);
  text('Building Height: ' + buildingHeight, buildingHeightSlider.x * 2 + buildingHeightSlider.width, 115);
  text('Building Stiffness: ' + buildingStiffness.toFixed(1), buildingStiffnessSlider.x * 2 + buildingStiffnessSlider.width, 155);
  text('Damping Mass: ' + dampingMass, dampingMassSlider.x * 2 + dampingMassSlider.width, 195);
  text('Damper Stiffness: ' + damperStiffness, damperStiffnessSlider.x * 2 + damperStiffnessSlider.width, 235);
}
