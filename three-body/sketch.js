const threeBodySketch = (p) => {
    let bodies = [];
    let G = 1;
    let phaseSpace;
    let simulationsData = [];
    let currentSimulationData;
    let maxDataPoints = 500;
    let timeStep = 1;

    p.setup = function () {
      const canvasContainer = document.getElementById('canvas-container');
      const canvasWidth = canvasContainer.offsetWidth;
      const canvasHeight = canvasContainer.offsetHeight;

      const canvas = p.createCanvas(canvasWidth, canvasHeight);
      canvas.parent("canvas-container");

      p.colorMode(p.HSB, 360, 100, 100);

      phaseSpace = p.createGraphics(p.width / 2, p.height);

      p.select('#startSimulation').mousePressed(startSimulation);
    };

    p.draw = function () {
      p.background(220);

      p.stroke(0);
      p.strokeWeight(1);
      p.line(p.width / 2, 0, p.width / 2, p.height);

      for (let n = 0; n < timeStep; n++) {
        for (let body of bodies) {
          body.update();
        }

        if (bodies.length === 3) {
          updatePhaseSpaceData();
        }
      }

      p.push();
      p.translate(0, 0);
      drawXYAxes();
      for (let body of bodies) {
        body.show();
      }
      p.pop();

      phaseSpace.background(255);
      drawPhaseSpaceAxes();
      drawPhaseSpaceData();

      p.image(phaseSpace, p.width / 2, 0);
    };

    function startSimulation() {
      if (currentSimulationData) {
        simulationsData.push(currentSimulationData);
      }

      currentSimulationData = {
        meanSeparationData: [],
        meanVelocityData: [],
        color: p.color(
          p.random(0, 360),
          p.random(70, 100),
          p.random(30, 80)
        ),
      };

      bodies = [];

      for (let i = 0; i < 3; i++) {
        let position = p.createVector(
          p.random(50, p.width / 2 - 50),
          p.random(50, p.height - 50)
        );
        let velocity = p.createVector(
          p.random(-1, 1),
          p.random(-1, 1)
        );
        let mass = p.random(5, 15);
        let size = mass;
        let color = p.color(
          p.random(0, 360),
          p.random(70, 100),
          p.random(30, 80)
        );
        bodies.push(new Body(position, velocity, mass, size, color));
      }
    }

    class Body {
      constructor(position, velocity, mass, size, col) {
        this.position = position.copy();
        this.velocity = velocity.copy();
        this.acceleration = p.createVector(0, 0);
        this.mass = mass;
        this.size = size;
        this.col = col;
        this.path = [];
        this.maxPathLength = 200;
      }

      applyForces() {
        this.acceleration.set(0, 0);
        for (let other of bodies) {
          if (other !== this) {
            let force = other.position.copy().sub(this.position);
            let distanceSq = p.constrain(force.magSq(), 25, 50000);
            let strength = (G * this.mass * other.mass) / distanceSq;
            force.setMag(strength / this.mass);
            this.acceleration.add(force);
          }
        }
      }

      update() {
        this.applyForces();
        this.velocity.add(p5.Vector.mult(this.acceleration, timeStep));
        this.position.add(p5.Vector.mult(this.velocity, timeStep));

        this.path.push(this.position.copy());
        if (this.path.length > this.maxPathLength) {
          this.path.splice(0, 1);
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
    }

    function updatePhaseSpaceData() {
      let totalSeparation = 0;
      let totalVelocity = 0;
      let count = 0;

      for (let i = 0; i < bodies.length; i++) {
        totalVelocity += bodies[i].velocity.mag();
        for (let j = i + 1; j < bodies.length; j++) {
          let separation = bodies[i].position.dist(bodies[j].position);
          totalSeparation += separation;
          count++;
        }
      }

      let meanSeparation = totalSeparation / count;
      let meanVelocity = totalVelocity / bodies.length;

      currentSimulationData.meanSeparationData.push(meanSeparation);
      currentSimulationData.meanVelocityData.push(meanVelocity);

      if (currentSimulationData.meanSeparationData.length > maxDataPoints) {
        currentSimulationData.meanSeparationData.shift();
        currentSimulationData.meanVelocityData.shift();
      }
    }

    function drawPhaseSpaceData() {
      for (let simData of simulationsData) {
        phaseSpace.stroke(simData.color);
        phaseSpace.noFill();
        phaseSpace.beginShape();
        for (let i = 0; i < simData.meanSeparationData.length; i++) {
          let x = p.map(simData.meanSeparationData[i], 0, p.width / 2, 50, phaseSpace.width - 50);
          let y = p.map(simData.meanVelocityData[i], 0, 5, phaseSpace.height - 50, 50);
          phaseSpace.vertex(x, y);
        }
        phaseSpace.endShape();
      }

      if (currentSimulationData) {
        phaseSpace.stroke(currentSimulationData.color);
        phaseSpace.noFill();
        phaseSpace.beginShape();
        for (let i = 0; i < currentSimulationData.meanSeparationData.length; i++) {
          let x = p.map(currentSimulationData.meanSeparationData[i], 0, p.width / 2, 50, phaseSpace.width - 50);
          let y = p.map(currentSimulationData.meanVelocityData[i], 0, 5, phaseSpace.height - 50, 50);
          phaseSpace.vertex(x, y);
        }
        phaseSpace.endShape();

        if (currentSimulationData.meanSeparationData.length > 0) {
          let x = p.map(currentSimulationData.meanSeparationData[currentSimulationData.meanSeparationData.length - 1], 0, p.width / 2, 50, phaseSpace.width - 50);
          let y = p.map(currentSimulationData.meanVelocityData[currentSimulationData.meanVelocityData.length - 1], 0, 5, phaseSpace.height - 50, 50);
          phaseSpace.fill(currentSimulationData.color);
          phaseSpace.noStroke();
          phaseSpace.ellipse(x, y, 8, 8);
        }
      }
    }

    function drawXYAxes() {
      p.stroke(0);
      p.strokeWeight(1);
      p.line(0, p.height / 2, p.width / 2, p.height / 2);
      p.line(p.width / 4, 0, p.width / 4, p.height);
      p.fill(0);
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.text('X', p.width / 2 - 10, p.height / 2 + 15);
      p.text('Y', p.width / 4 + 15, 10);
    }

    function drawPhaseSpaceAxes() {
      phaseSpace.push();
      phaseSpace.stroke(0);
      phaseSpace.strokeWeight(1);
      phaseSpace.fill(0);
      phaseSpace.textAlign(p.CENTER, p.CENTER);

      phaseSpace.line(50, phaseSpace.height - 50, phaseSpace.width - 50, phaseSpace.height - 50);
      phaseSpace.line(50, phaseSpace.height - 50, 50, 50);

      phaseSpace.text('Mean Separation', phaseSpace.width / 2, phaseSpace.height - 20);
      phaseSpace.push();
      phaseSpace.translate(20, phaseSpace.height / 2);
      phaseSpace.rotate(-p.HALF_PI);
      phaseSpace.text('Mean Velocity', 0, 0);
      phaseSpace.pop();

      phaseSpace.text('Phase Space', phaseSpace.width / 2, 20);

      phaseSpace.pop();
    }

    p.windowResized = function () {
      const canvasContainer = document.getElementById('canvas-container');
      p.resizeCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
      phaseSpace = p.createGraphics(p.width / 2, p.height);
    };
};
