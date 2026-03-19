let objects = [];
let sun;
let G = 6; // Gravitational constant
let phaseSpace;
let clearButton;        // Declare the button variable
let circularCheckbox;   // Declare the checkbox variable

function setup() {
  createCanvas(800, 400);
  sun = new CelestialBody(
    createVector(width / 4, height / 2),
    createVector(0, 0),
    1000, // Mass of the sun
    40,   // Size of the sun for drawing purposes
    color(255, 204, 0),
    true
  );
  phaseSpace = createGraphics(width / 2, height);

  // Create a clear button
  clearButton = createButton('Clear Objects');
  clearButton.position(10, 10); // Position the button
  clearButton.mousePressed(clearObjects);

  // Create a 'Circular' checkbox
  circularCheckbox = createCheckbox('Circular', false);
  circularCheckbox.position(width / 2 - 100, 10); // Position in the upper right corner of XY plane
  circularCheckbox.style('color', 'white');       // Set text color to white for visibility
}

function draw() {
  background(51);

  // Draw the main simulation on the left
  push();
  translate(0, 0);
  fill(255);
  textAlign(CENTER);
  text('Click to add celestial bodies', width / 4, 30);
  drawXYAxes();
  sun.show();
  for (let obj of objects) {
    obj.applyGravity(sun);
    obj.update();
    obj.show(); // Show in XY plane
  }
  pop();

  // Clear phase space and redraw axes
  phaseSpace.background(0);
  drawPhaseSpaceAxes();

  // Draw phase space trajectories and current positions
  for (let obj of objects) {
    obj.showPhaseSpace();
  }

  // Draw the phase space on the right
  image(phaseSpace, width / 2, 0);
}

function mousePressed() {
  // Avoid clicking on UI elements
  if (mouseX < width / 2 && mouseY > 35) {
    let pos = createVector(mouseX, mouseY);
    let rVector = p5.Vector.sub(pos, sun.position);
    let distance = rVector.mag();

    // Calculate circular orbital speed
    let speedCircular = sqrt((G * sun.mass) / distance);

    let speed, tangent, angleOffset, velocity;

    if (circularCheckbox.checked()) {
      // Create a circular orbit
      speed = speedCircular;
      tangent = rVector.copy().rotate(HALF_PI).normalize();
      velocity = tangent.mult(speed);
    } else {
      // Create an elliptical orbit
      speed = speedCircular * random(0.5, 1.5);
      tangent = rVector.copy().rotate(HALF_PI).normalize();
      angleOffset = random(-PI / 6, PI / 6);
      tangent.rotate(angleOffset);
      velocity = tangent.mult(speed);
    }

    let obj = new CelestialBody(
      pos,
      velocity,
      5,    // Mass of the object
      8,    // Size of the object for drawing purposes
      color(random(100, 255), random(100, 255), random(100, 255)),
      false
    );
    objects.push(obj);
  }
}

class CelestialBody {
  constructor(position, velocity, mass, size, col, isSun) {
    this.position = position.copy();
    this.velocity = velocity.copy();
    this.acceleration = createVector(0, 0);
    this.mass = mass;
    this.size = size;
    this.col = col;
    this.isSun = isSun;
    this.path = [];          // For XY plane trajectory
    this.phasePath = [];     // For phase space trajectory
  }

  applyGravity(other) {
    let force = p5.Vector.sub(other.position, this.position);
    let distanceSq = constrain(force.magSq(), 100, 50000);
    let strength = (G * this.mass * other.mass) / distanceSq;
    force.setMag(strength / this.mass);
    this.acceleration.add(force);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);

    // Record position for path (XY plane)
    this.path.push(this.position.copy());
    if (this.path.length > 200) {
      this.path.splice(0, 1);
    }

    // Calculate and record position for phase space trajectory
    let r = p5.Vector.sub(this.position, sun.position).mag();
    let v = this.velocity.mag();
    let x = map(r, 0, width / 2, 50, phaseSpace.width - 50);
    let y = map(v, 0, 10, phaseSpace.height - 50, 50);

    this.phasePath.push(createVector(x, y));
    if (this.phasePath.length > 200) {
      this.phasePath.splice(0, 1);
    }
  }

  show() {
    // Draw the object in XY plane
    fill(this.col);
    noStroke();
    ellipse(this.position.x, this.position.y, this.size);

    // Draw path in XY plane
    noFill();
    stroke(this.col);
    beginShape();
    for (let pos of this.path) {
      vertex(pos.x, pos.y);
    }
    endShape();
  }

  showPhaseSpace() {
    // Draw the trajectory as a line in phase space
    phaseSpace.stroke(this.col);
    phaseSpace.noFill();
    phaseSpace.beginShape();
    for (let pos of this.phasePath) {
      phaseSpace.vertex(pos.x, pos.y);
    }
    phaseSpace.endShape();

    // Draw the current position as a larger dot
    let currentPos = this.phasePath[this.phasePath.length - 1];
    phaseSpace.fill(this.col);
    phaseSpace.stroke(255); // White border to make it stand out
    phaseSpace.strokeWeight(1);
    phaseSpace.ellipse(currentPos.x, currentPos.y, 8, 8); // Adjust size as needed
  }
}

function drawXYAxes() {
  stroke(200);
  // X-axis
  line(0, height / 2, width / 2, height / 2);
  // Y-axis
  line(width / 4, 0, width / 4, height);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  text('X', width / 2 - 10, height / 2 + 15);
  text('Y', width / 4 + 15, 10);
}

function drawPhaseSpaceAxes() {
  phaseSpace.push();
  phaseSpace.stroke(200);
  phaseSpace.fill(255);
  phaseSpace.textAlign(CENTER, CENTER);

  // Draw axes
  // X-axis (Distance)
  phaseSpace.line(50, phaseSpace.height - 50, phaseSpace.width - 50, phaseSpace.height - 50);
  // Y-axis (Velocity)
  phaseSpace.line(50, phaseSpace.height - 50, 50, 50);

  // Labels
  phaseSpace.text('Distance (pixels)', phaseSpace.width / 2, phaseSpace.height - 20);
  phaseSpace.text('Velocity', 20, phaseSpace.height / 2);

  // Title
  phaseSpace.text('Phase Space', phaseSpace.width / 2, 20);

  // Ticks and scales
  for (let i = 0; i <= 5; i++) {
    let x = map(i, 0, 5, 50, phaseSpace.width - 50);
    let distanceValue = int(map(i, 0, 5, 0, width / 2));
    phaseSpace.noStroke();
    phaseSpace.text(distanceValue, x, phaseSpace.height - 35);
    phaseSpace.stroke(100);
    phaseSpace.line(x, phaseSpace.height - 55, x, phaseSpace.height - 45);
  }
  for (let i = 0; i <= 5; i++) {
    let y = map(i, 0, 5, phaseSpace.height - 50, 50);
    let velocityValue = nf(map(i, 0, 5, 0, 10), 1, 1);
    phaseSpace.noStroke();
    phaseSpace.text(velocityValue, 35, y);
    phaseSpace.stroke(100);
    phaseSpace.line(45, y, 55, y);
  }
  phaseSpace.pop();
}

function clearObjects() {
  objects = [];

  // No need to clear phase space here; it will be cleared in draw()
}
