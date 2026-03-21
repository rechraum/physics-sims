const orbitalSketch = (p) => {
  let objects = [];
  let sun;
  let G = 6;
  let phaseSpace;

  p.setup = function () {
    const canvas = p.createCanvas(800, 400);
    canvas.parent("canvas-container");

    sun = new CelestialBody(p.createVector(p.width / 4, p.height / 2), p.createVector(0, 0), 1000, 40, p.color(255, 204, 0), true);
    phaseSpace = p.createGraphics(p.width / 2, p.height);

    // Attach button and checkbox events
    p.select('#clearObjects').mousePressed(clearObjects);
  };

  p.draw = function () {
    p.background(220);

    // Display the sun and update celestial bodies
    sun.show();
    for (let obj of objects) {
      obj.applyGravity(sun);
      obj.update();
      obj.show();
    }

    // Draw phase space
    phaseSpace.background(255);
    p.image(phaseSpace, p.width / 2, 0);
  };

  p.mousePressed = function () {
    if (p.mouseX < p.width / 2 && p.mouseY > 35) {
      let pos = p.createVector(p.mouseX, p.mouseY);
      let obj = new CelestialBody(pos, p.createVector(0, 0), 5, 8, p.color(p.random(100, 255), p.random(100, 255), p.random(100, 255)), false);
      objects.push(obj);
    }
  };

  class CelestialBody {
    constructor(position, velocity, mass, size, col, isSun) {
      this.position = position.copy();
      this.velocity = velocity.copy();
      this.acceleration = p.createVector(0, 0);
      this.mass = mass;
      this.size = size;
      this.col = col;
      this.isSun = isSun;
    }

    applyGravity(other) {
      let force = p5.Vector.sub(other.position, this.position);
      let distanceSq = p.constrain(force.magSq(), 100, 50000);
      let strength = (G * this.mass * other.mass) / distanceSq;
      force.setMag(strength / this.mass);
      this.acceleration.add(force);
    }

    update() {
      this.velocity.add(this.acceleration);
      this.position.add(this.velocity);
      this.acceleration.mult(0);
    }

    show() {
      p.fill(this.col);
      p.noStroke();
      p.ellipse(this.position.x, this.position.y, this.size);
    }
  }

  function clearObjects() {
    objects = [];
  }
};

// Instantiate the P5 sketch
new p5(orbitalSketch);
