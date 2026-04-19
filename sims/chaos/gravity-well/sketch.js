const orbitalSketch = (p) => {
  let objects = [];
  let sun;
  let G = 6; // Gravitational constant
  let phaseSpace;
  let circularCheckbox;

  p.setup = function () {
    const canvasContainer = document.getElementById('canvas-container');
    const canvasWidth = canvasContainer.offsetWidth;
    const canvasHeight = canvasContainer.offsetHeight;

    const canvas = p.createCanvas(canvasWidth, canvasHeight);
    canvas.parent("canvas-container");

    p.colorMode(p.HSB, 360, 100, 100);

    sun = new CelestialBody(
      p.createVector(p.width / 4, p.height / 2),
      p.createVector(0, 0),
      1000,
      40,
      p.color(50, 100, 100),
      true
    );
    phaseSpace = p.createGraphics(p.width / 2, p.height);

    p.select('#clearObjects').mousePressed(clearObjects);
    circularCheckbox = p.select('#circularCheckbox');

    canvas.mousePressed(canvasMousePressed);
  };

  p.draw = function () {
    p.background(220);

    p.stroke(0);
    p.strokeWeight(1);
    p.line(p.width / 2, 0, p.width / 2, p.height);

    p.push();
    p.translate(0, 0);
    p.fill(0);
    p.textAlign(p.CENTER);
    p.text('Click to add celestial bodies', p.width / 4, 30);
    drawXYAxes();
    sun.show();
    for (let obj of objects) {
      obj.applyGravity(sun);
      obj.update();
      obj.show();
    }
    p.pop();

    phaseSpace.background(255);
    drawPhaseSpaceAxes();

    for (let obj of objects) {
      obj.showPhaseSpace();
    }

    p.image(phaseSpace, p.width / 2, 0);
  };

  function canvasMousePressed() {
    if (p.mouseX < p.width / 2 && p.mouseY > 35) {
      let pos = p.createVector(p.mouseX, p.mouseY);
      let rVector = pos.copy().sub(sun.position);
      let distance = rVector.mag();

      let speedCircular = p.sqrt((G * sun.mass) / distance);

      let speed, tangent, angleOffset, velocity;

      if (circularCheckbox.checked()) {
        speed = speedCircular;
        tangent = rVector.copy().rotate(p.HALF_PI).normalize();
        velocity = tangent.mult(speed);
      } else {
        speed = speedCircular * p.random(0.5, 1.5);
        tangent = rVector.copy().rotate(p.HALF_PI).normalize();
        angleOffset = p.random(-p.PI / 6, p.PI / 6);
        tangent.rotate(angleOffset);
        velocity = tangent.mult(speed);
      }

      let obj = new CelestialBody(
        pos,
        velocity,
        5,
        8,
        p.color(p.random(0, 360), p.random(70, 100), p.random(30, 80)),
        false
      );
      objects.push(obj);
    }
  }

  class CelestialBody {
    constructor(position, velocity, mass, size, col, isSun) {
      this.position = position.copy();
      this.velocity = velocity.copy();
      this.acceleration = p.createVector(0, 0);
      this.mass = mass;
      this.size = size;
      this.col = col;
      this.isSun = isSun;
      this.path = [];
      this.phasePath = [];
    }

    applyGravity(other) {
      let force = other.position.copy().sub(this.position);
      let distanceSq = p.constrain(force.magSq(), 100, 50000);
      let strength = (G * this.mass * other.mass) / distanceSq;
      force.setMag(strength / this.mass);
      this.acceleration.add(force);
    }

    update() {
      this.velocity.add(this.acceleration);
      this.position.add(this.velocity);
      this.acceleration.mult(0);

      this.path.push(this.position.copy());
      if (this.path.length > 200) {
        this.path.splice(0, 1);
      }

      let r = this.position.copy().sub(sun.position).mag();
      let v = this.velocity.mag();
      let x = p.map(r, 0, p.width / 2, 50, phaseSpace.width - 50);
      let y = p.map(v, 0, 10, phaseSpace.height - 50, 50);

      this.phasePath.push(p.createVector(x, y));
      if (this.phasePath.length > 200) {
        this.phasePath.splice(0, 1);
      }
    }

    show() {
      p.fill(this.col);
      p.noStroke();
      p.ellipse(this.position.x, this.position.y, this.size);

      p.noFill();
      p.stroke(this.col);
      p.beginShape();
      for (let pos of this.path) {
        p.vertex(pos.x, pos.y);
      }
      p.endShape();
    }

    showPhaseSpace() {
      phaseSpace.stroke(this.col);
      phaseSpace.noFill();
      phaseSpace.beginShape();
      for (let pos of this.phasePath) {
        phaseSpace.vertex(pos.x, pos.y);
      }
      phaseSpace.endShape();

      let currentPos = this.phasePath[this.phasePath.length - 1];
      phaseSpace.fill(this.col);
      phaseSpace.noStroke();
      phaseSpace.ellipse(currentPos.x, currentPos.y, 8, 8);
    }
  }

  function drawXYAxes() {
    p.stroke(0);
    p.line(0, p.height / 2, p.width / 2, p.height / 2);
    p.line(p.width / 4, 0, p.width / 4, p.height);
    p.fill(0);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
  }

  function drawPhaseSpaceAxes() {
    phaseSpace.push();
    phaseSpace.stroke(200);
    phaseSpace.fill(0);
    phaseSpace.textAlign(p.CENTER, p.CENTER);

    phaseSpace.line(50, phaseSpace.height - 50, phaseSpace.width - 50, phaseSpace.height - 50);
    phaseSpace.line(50, phaseSpace.height - 50, 50, 50);

    phaseSpace.text('Distance (pixels)', phaseSpace.width / 2, phaseSpace.height - 20);
    phaseSpace.text('Velocity', 25, phaseSpace.height / 2);
    phaseSpace.text('Phase Space', phaseSpace.width / 2, 20);

    for (let i = 0; i <= 5; i++) {
      let x = p.map(i, 0, 5, 50, phaseSpace.width - 50);
      let distanceValue = parseInt(p.map(i, 0, 5, 0, p.width / 2));
      phaseSpace.noStroke();
      phaseSpace.text(distanceValue, x, phaseSpace.height - 35);
      phaseSpace.stroke(100);
      phaseSpace.line(x, phaseSpace.height - 55, x, phaseSpace.height - 45);
    }
    for (let i = 0; i <= 5; i++) {
      let y = p.map(i, 0, 5, phaseSpace.height - 50, 50);
      let velocityValue = p.nf(p.map(i, 0, 5, 0, 10), 1, 1);
      phaseSpace.noStroke();
      phaseSpace.text(velocityValue, 35, y);
      phaseSpace.stroke(100);
      phaseSpace.line(45, y, 55, y);
    }
    phaseSpace.pop();
  }

  function clearObjects() {
    objects = [];
  }

  p.windowResized = function () {
    const canvasContainer = document.getElementById('canvas-container');
    p.resizeCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
    phaseSpace = p.createGraphics(p.width / 2, p.height);
  };
};
