const oscillatorSketch = (p) => {
  let oscillators = [];
  let deltaTimeMillis = 0;
  let deltaTimeSeconds = 0;
  let lastTime = 0;

  p.setup = function () {
    const canvas = p.createCanvas(800, 400);
    canvas.parent("canvas-container");

    // Ensure the canvas has the correct positioning
    canvas.style('position', 'relative');

    // Add event listeners to buttons using p.select
    p.select('#addOscillator').mousePressed(p.addOscillator);
    p.select('#clearOscillators').mousePressed(p.clearOscillators);
  };

  p.draw = function () {
    p.background(220);
    p.updateDeltaTime();

    // Draw dividing line
    p.stroke(0);
    p.line(p.width / 2, 0, p.width / 2, p.height);

    // Define static global min and max values based on slider limits
    const minAmplitude = 10;
    const maxAmplitude = 200;
    const minFrequency = 0.1;
    const maxFrequency = 1.0;

    const minDisplacement = -maxAmplitude;
    const maxDisplacement = maxAmplitude;

    const minAngularFrequency = p.TWO_PI * minFrequency;
    const maxAngularFrequency = p.TWO_PI * maxFrequency;

    const maxVelocity = maxAmplitude * maxAngularFrequency;
    const minVelocity = -maxVelocity;

    // Draw axes on the phase space visualization using static global min and max
    p.drawPhaseSpaceAxes(minDisplacement, maxDisplacement, minVelocity, maxVelocity);

    // Update and display each oscillator
    for (let oscillator of oscillators) {
      oscillator.update();
      oscillator.display();
      oscillator.displayPhaseSpace(minDisplacement, maxDisplacement, minVelocity, maxVelocity);
    }
  };

  // Oscillator Class
  class Oscillator {
    constructor() {
      this.angle = p.random(0, p.TWO_PI);
      this.amplitude = p.random(50, 150);
      this.frequency = p.random(0.1, 1.0); // Frequency in Hz
      this.angularFrequency = p.TWO_PI * this.frequency; // Angular frequency in radians/sec
      this.color = p.color(p.random(100, 255), p.random(100, 255), p.random(100, 255));

      // Unit vector in the direction of the angle
      this.direction = p.createVector(p.cos(this.angle), p.sin(this.angle));

      this.timeOffset = p.random(0, p.TWO_PI); // Random phase offset
      this.position = p.createVector(0, 0);
      this.displacement = 0;
      this.velocity = 0;
      this.path = []; // For phase space trajectory
      this.maxPathLength = 500;

      // Create sliders for this oscillator
      this.createSliders();

      // Flag to reset phase space when parameters change
      this.parametersChanged = false;
    }

    update() {
      let time = p.millis() / 1000; // Time in seconds

      if (this.parametersChanged) {
        // Reset path when parameters change
        this.path = [];
        this.angularFrequency = p.TWO_PI * this.frequency;
        this.parametersChanged = false;
      }

      // Calculate displacement along the line
      this.displacement = this.amplitude * p.cos(this.angularFrequency * time + this.timeOffset);

      // Position vector in 2D space
      this.position = p5.Vector.mult(this.direction, this.displacement);

      // Calculate velocity along the line
      this.velocity = -this.angularFrequency * this.amplitude * p.sin(this.angularFrequency * time + this.timeOffset);

      // Store displacement and velocity for phase space
      this.path.push({ x: this.displacement, y: this.velocity });
      if (this.path.length > this.maxPathLength) {
        this.path.shift(); // Limit path length
      }
    }

    display() {
      // Draw oscillator on the left half of the canvas
      p.fill(this.color);
      p.noStroke();
      p.ellipse(this.position.x + p.width / 4, this.position.y + p.height / 2, 10, 10);

      // Draw the line of oscillation
      p.stroke(this.color);
      p.strokeWeight(1);
      let lineLength = 200; // Reduced length to ensure the line doesn't cross over phase space
      let lineStart = p5.Vector.mult(this.direction, -lineLength);
      let lineEnd = p5.Vector.mult(this.direction, lineLength);
      p.line(
        lineStart.x + p.width / 4,
        lineStart.y + p.height / 2,
        lineEnd.x + p.width / 4,
        lineEnd.y + p.height / 2
      );
    }

    displayPhaseSpace(minDisplacement, maxDisplacement, minVelocity, maxVelocity) {
      // Plot displacement vs. velocity on the right half of the canvas
      p.noFill();
      p.stroke(this.color);
      p.beginShape();
      for (let point of this.path) {
        let x = p.map(
          point.x,
          minDisplacement,
          maxDisplacement,
          p.width / 2 + 40,
          p.width - 40
        );
        let y = p.map(
          point.y,
          minVelocity,
          maxVelocity,
          p.height - 40,
          40
        );
        p.vertex(x, y);
      }
      p.endShape();
    }

    createSliders() {
      const slidersDiv = document.getElementById('sliders');

      // Create a container for this oscillator's sliders
      this.sliderGroup = document.createElement('div');
      this.sliderGroup.className = 'slider-group';

      // Angle Slider
      this.angleSlider = this.createSliderControl('Angle', 0, p.TWO_PI, this.angle, 0.01);

      // Amplitude Slider
      this.amplitudeSlider = this.createSliderControl('Amplitude', 10, 200, this.amplitude, 1);

      // Frequency Slider (0.1 Hz to 1 Hz)
      this.frequencySlider = this.createSliderControl('Frequency', 0.1, 1.0, this.frequency, 0.01);

      // Append sliders to the group
      this.sliderGroup.appendChild(this.angleSlider.container);
      this.sliderGroup.appendChild(this.amplitudeSlider.container);
      this.sliderGroup.appendChild(this.frequencySlider.container);

      // Append the group to the sliders div
      slidersDiv.appendChild(this.sliderGroup);
    }

    createSliderControl(labelText, min, max, value, step) {
      const container = document.createElement('div');

      const label = document.createElement('label');
      label.innerText = labelText;

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = min;
      slider.max = max;
      slider.value = value;
      slider.step = step;

      // Update oscillator property when slider changes
      slider.addEventListener('input', () => {
        let val = parseFloat(slider.value);
        this[labelText.toLowerCase()] = val;

        // Set flag to reset phase space trajectory
        this.parametersChanged = true;

        if (labelText === 'Angle') {
          // Update direction vector
          this.direction = p.createVector(p.cos(this.angle), p.sin(this.angle));
        } else if (labelText === 'Frequency') {
          // Update angular frequency
          this.angularFrequency = p.TWO_PI * this.frequency;
        }
        // No action needed for Amplitude beyond setting parametersChanged
      });

      container.appendChild(label);
      container.appendChild(slider);

      return { container, slider };
    }

    // Remove sliders when oscillator is deleted
    removeSliders() {
      this.sliderGroup.remove();
    }
  }

  // Function to add a new oscillator
  p.addOscillator = function () {
    const oscillator = new Oscillator();
    oscillators.push(oscillator);
  };

  // Function to clear all oscillators
  p.clearOscillators = function () {
    // Remove sliders
    for (let oscillator of oscillators) {
      oscillator.removeSliders();
    }
    oscillators = [];
  };

  // Handle window resize
  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  // Function to update delta time
  p.updateDeltaTime = function () {
    let currentTime = p.millis();
    deltaTimeMillis = currentTime - lastTime;
    deltaTimeSeconds = deltaTimeMillis / 1000;
    lastTime = currentTime;
  };

  // Function to draw axes on the phase space visualization
  p.drawPhaseSpaceAxes = function (minDisplacement, maxDisplacement, minVelocity, maxVelocity) {
    p.stroke(0);
    p.strokeWeight(1);

    // Displacement axis (horizontal)
    p.line(p.width / 2 + 40, p.height / 2, p.width - 40, p.height / 2);
    // Velocity axis (vertical)
    p.line((p.width * 3) / 4, 40, (p.width * 3) / 4, p.height - 40);

    // Axis labels
    p.fill(0);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(14);

    // Labels for displacement axis
    p.text('Displacement', (p.width / 2 + p.width - 40) / 2, p.height / 2 + 30);
    p.text('0', (p.width * 3) / 4, p.height / 2 + 20);
    p.textAlign(p.RIGHT, p.CENTER);
    p.text(
      '+' + p.nf(maxDisplacement, 1, 0),
      p.width - 45,
      p.height / 2 + 20
    );
    p.textAlign(p.LEFT, p.CENTER);
    p.text(
      p.nf(minDisplacement, 1, 0),
      p.width / 2 + 45,
      p.height / 2 + 20
    );

    // Labels for velocity axis
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text('Velocity', (p.width * 3) / 4, 30);
    p.textAlign(p.CENTER, p.TOP);
    p.text('0', (p.width * 3) / 4 + 20, p.height / 2);
    p.text(
      '+' + p.nf(maxVelocity, 1, 0),
      (p.width * 3) / 4 + 20,
      45
    );
    p.text(
      p.nf(minVelocity, 1, 0),
      (p.width * 3) / 4 + 20,
      p.height - 45
    );
  };
};
