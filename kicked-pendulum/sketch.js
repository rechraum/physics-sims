// KickedPendulum.js
const kickedPendulumSketch = (p) => {
    // Pendulum parameters
    let angle = 0;
    let angularVelocity = 0;
    let angularAcceleration = 0;
    let gravity = 9.81; // Gravitational acceleration
    let length = 150; // Adjusted length of pendulum (pixels)
    let damping = 0.995; // Damping factor
    let kickStrength = 0; // Kick magnitude from slider

    // Simulation control
    let isPaused = false;
    let isRunning = false;

    // DOM elements
    let startButton, pauseButton, clearButton;
    let kickSlider, kickValueLabel;
    let dampingSlider, dampingValueLabel;

    // Visualization parameters
    let pendulumColor;
    let phaseSpacePaths = [];

    // Canvas dimensions
    let canvasWidth = 800;
    let canvasHeight = 400;

    // Phase space scaling
    let angleRange = p.PI; // Range for angle (-PI to PI)
    let angularVelocityRange = 1; // Adjusted max angular velocity

    p.setup = function() {
      const canvas = p.createCanvas(canvasWidth, canvasHeight);
      canvas.parent("canvas-container");

      // Get references to DOM elements
      startButton = document.getElementById('pendulum-start-button');
      pauseButton = document.getElementById('pendulum-pause-button');
      clearButton = document.getElementById('pendulum-clear-button');
      kickSlider = document.getElementById('kick-slider');
      kickValueLabel = document.getElementById('kick-value');
      dampingSlider = document.getElementById('damping-slider');
      dampingValueLabel = document.getElementById('damping-value');

      // Attach event listeners
      startButton.addEventListener('click', startSimulation);
      pauseButton.addEventListener('click', togglePause);
      clearButton.addEventListener('click', clearPhaseSpace);
      kickSlider.addEventListener('input', updateKickValue);
      dampingSlider.addEventListener('input', updateDampingValue);

      // Update kick value display
      updateKickValue();

      // Update damping factor value display
      updateDampingValue();

      // Initialize pendulum
      resetPendulum();
    };

    p.draw = function() {
      p.background(255);

      // Draw divider
      p.stroke(0);
      p.line(canvasWidth / 2, 0, canvasWidth / 2, canvasHeight);

      // Update and draw pendulum on the left
      p.push();
      p.translate(canvasWidth / 4, canvasHeight / 2);
      if (isRunning && !isPaused) {
        updatePendulum();
      }
      drawPendulum();
      p.pop();

      // Draw phase space on the right
      p.push();
      p.translate(canvasWidth * 3 / 4, canvasHeight / 2);
      drawPhaseSpace();
      p.pop();

      // Draw labels
      p.fill(0);
      p.noStroke();
      p.textSize(16);
      p.textAlign(p.CENTER);
      p.text("Phase Space", canvasWidth * 3 / 4, 30);
    };

    function resetPendulum() {
        angle = p.random(-p.PI, p.PI);
        angularVelocity = 0;
        pendulumColor = p.color(p.random(255), p.random(255), p.random(255));

        phaseSpacePaths.push({ color: pendulumColor, path: [] });
        applyKick();
    }


    function updatePendulum() {
      // Apply gravity
      angularAcceleration = (-gravity / length) * p.sin(angle);

      // Update angular velocity and angle
      angularVelocity += angularAcceleration;
      angularVelocity *= damping;
      angle += angularVelocity;

      // Keep angle within -PI to PI
      angle = wrapAngle(angle);

      // Record phase space trajectory
      let currentPath = phaseSpacePaths[phaseSpacePaths.length - 1].path;
      currentPath.push({ angle: angle, angularVelocity: angularVelocity });

      // Limit path length
      if (currentPath.length > 2000) {
        currentPath.shift();
      }
    }

    function drawPendulum() {
      // Draw pendulum arm
      let x = length * p.sin(angle);
      let y = length * p.cos(angle);
      p.stroke(0);
      p.strokeWeight(2);
      p.line(0, 0, x, y);

      // Draw hash marks and angle labels
      drawPendulumHashMarks();

      // Draw pendulum bob
      p.fill(pendulumColor);
      p.ellipse(x, y, 30, 30);

      // Draw kick value label
      p.noStroke();
      p.fill(0);
      p.textAlign(p.CENTER);
      p.textSize(14);
      p.text("Kick Strength: " + kickSlider.value, -100, -length - 20);

      // Display damping factor
      p.text("Damping Factor: " + damping.toFixed(3), -100, -length - 40);
    }

    function drawPendulumHashMarks() {
        p.push();
        p.translate(0, 0);

        let angles = [-p.HALF_PI, 0, p.HALF_PI, p.PI];
        let labels = ["-π/2", "0", "π/2", "π"];

        for (let i = 0; i < angles.length; i++) {
          let a = angles[i];
          let label = labels[i];

          let hx = (length + 10) * p.sin(a);
          let hy = (length + 10) * p.cos(a);

          p.stroke(0);
          p.strokeWeight(2);
          p.line(length * p.sin(a), length * p.cos(a), hx, hy);

          let lx = (length + 25) * p.sin(a);
          let ly = (length + 25) * p.cos(a);

          p.noStroke();
          p.fill(0);
          p.textSize(12);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(label, lx, ly);
        }
        p.pop();
    }

    function drawPhaseSpace() {
      // Draw axes
      p.stroke(0);
      p.strokeWeight(1);
      p.line(-canvasWidth / 4 + 20, 0, canvasWidth / 4 - 20, 0);
      p.line(0, -canvasHeight / 2 + 20, 0, canvasHeight / 2 - 20);

      // Label axes
      p.fill(0);
      p.noStroke();
      p.textAlign(p.CENTER);
      p.textSize(12);
      p.text("Angular Position (rad)", 0, canvasHeight / 2 - 5);
      p.push();
      p.rotate(-p.HALF_PI);
      p.text("Angular Velocity (rad/s)", 0, -canvasWidth / 4 + 15);
      p.pop();

      // Draw x-axis ticks and labels
      drawPhaseSpaceXAxisTicks();

      // Draw separatrices as dotted lines
      p.stroke(255, 0, 0);
      p.strokeWeight(2);
      p.drawingContext.setLineDash([5, 5]);
      p.noFill();

      p.beginShape();
      for (let theta = -p.PI; theta <= p.PI; theta += 0.01) {
          let omega = 2 * Math.sqrt(gravity / length) * Math.cos(theta / 2);
          let x = p.map(theta, -p.PI, p.PI, -canvasWidth / 4 + 20, canvasWidth / 4 - 20);
          let y = p.map(omega, -angularVelocityRange, angularVelocityRange, canvasHeight / 2 - 20, -canvasHeight / 2 + 20);
          p.vertex(x, y);
      }
      p.endShape();

      p.beginShape();
      for (let theta = -p.PI; theta <= p.PI; theta += 0.01) {
          let omega = -2 * Math.sqrt(gravity / length) * Math.cos(theta / 2);
          let x = p.map(theta, -p.PI, p.PI, -canvasWidth / 4 + 20, canvasWidth / 4 - 20);
          let y = p.map(omega, -angularVelocityRange, angularVelocityRange, canvasHeight / 2 - 20, -canvasHeight / 2 + 20);
          p.vertex(x, y);
      }
      p.endShape();

      p.drawingContext.setLineDash([]);

      // Draw phase space trajectories
     for (let i = 0; i < phaseSpacePaths.length; i++) {
        let pathData = phaseSpacePaths[i];
        let path = pathData.path;
        if (path.length > 1) {
          p.stroke(pathData.color);
          p.strokeWeight(1);
          p.noFill();
          p.beginShape();
          let previousAngle = null;
          for (let point of path) {
            if (point && point.angle !== undefined && point.angularVelocity !== undefined) {
                let x = p.map(point.angle, -p.PI, p.PI, -canvasWidth / 4 + 20, canvasWidth / 4 - 20);
                let y = p.map(point.angularVelocity, -angularVelocityRange, angularVelocityRange, canvasHeight / 2 - 20, -canvasHeight / 2 + 20);

                if (previousAngle !== null) {
                    let angleDifference = Math.abs(point.angle - previousAngle);
                    if (angleDifference > p.PI) {
                    p.endShape();
                    p.beginShape();
                    }
                }
                previousAngle = point.angle;

                if (x >= -canvasWidth / 4 + 20 && x <= canvasWidth / 4 - 20 && y >= -canvasHeight / 2 + 20 && y <= canvasHeight / 2 - 20) {
                    p.vertex(x, y);
                } else {
                    p.endShape();
                    p.beginShape();
                }
            }
          }
          p.endShape();
        }
      }

      drawCurrentPhaseSpacePosition();
    }

    function drawPhaseSpaceXAxisTicks() {
        p.push();
        p.translate(0, 0);

        let angles = [-p.PI, -p.HALF_PI, 0, p.HALF_PI, p.PI];
        let labels = ["-π", "-π/2", "0", "π/2", "π"];

        let xStart = -canvasWidth / 4 + 20;
        let xEnd = canvasWidth / 4 - 20;
        let yPos = canvasHeight / 2 - 20;

        for (let i = 0; i < angles.length; i++) {
          let angle = angles[i];
          let label = labels[i];

          let x = p.map(angle, -p.PI, p.PI, xStart, xEnd);

          p.stroke(0);
          p.strokeWeight(1);
          p.line(x, yPos, x, yPos - 5);

          p.noStroke();
          p.fill(0);
          p.textSize(12);
          p.textAlign(p.CENTER, p.TOP);
          p.text(label, x, yPos + 5);
        }
        p.pop();
    }

    function wrapAngle(angle) {
        return p.atan2(p.sin(angle), p.cos(angle));
    }

    function drawCurrentPhaseSpacePosition() {
        p.push();
        p.translate(0, 0);

        let x = p.map(angle, -p.PI, p.PI, -canvasWidth / 4 + 20, canvasWidth / 4 - 20);
        let y = p.map(angularVelocity, -angularVelocityRange, angularVelocityRange, canvasHeight / 2 - 20, -canvasHeight / 2 + 20);

        if (
          x >= -canvasWidth / 4 + 20 &&
          x <= canvasWidth / 4 - 20 &&
          y >= -canvasHeight / 2 + 20 &&
          y <= canvasHeight / 2 - 20
        ) {
          let currentPathData = phaseSpacePaths[phaseSpacePaths.length - 1];
          let currentColor = currentPathData.color;

          p.fill(currentColor);
          p.noStroke();
          p.ellipse(x, y, 8, 8);
        }
        p.pop();
    }

    function startSimulation() {
      isRunning = true;
      isPaused = false;
      resetPendulum();
      pauseButton.textContent = 'Pause';
    }

    function togglePause() {
      if (isRunning) {
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
      }
    }

    function clearPhaseSpace() {
      phaseSpacePaths = [];
      resetPendulum();
    }

    function updateKickValue() {
      kickValueLabel.textContent = kickSlider.value;
    }

    function applyKick() {
        let direction = p.random([1, -1]);
        let kickRadians = direction * p.radians(kickSlider.value);
        angularVelocity += kickRadians;
    }

    function updateDampingValue() {
        damping = parseFloat(dampingSlider.value);
        dampingValueLabel.textContent = damping.toFixed(3);
    }
};
