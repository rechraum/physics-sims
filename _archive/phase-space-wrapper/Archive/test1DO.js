const oscillatorSketch = (p) => {
  let oscillators = [];
  
  p.setup = function () {
    const canvas = p.createCanvas(800, 400);
    canvas.parent("canvas-container");

    // Add event listeners to buttons
    p.select('#addOscillator').mousePressed(p.addOscillator);
    p.select('#clearOscillators').mousePressed(p.clearOscillators);
  };

  p.draw = function () {
    p.background(220);

    // Draw a dividing line
    p.stroke(0);
    p.line(p.width / 2, 0, p.width / 2, p.height);

    // Update and display each oscillator
    for (let oscillator of oscillators) {
      oscillator.update();
      oscillator.display();
    }
  };

  class Oscillator {
    constructor() {
      this.angle = p.random(0, p.TWO_PI);
      this.amplitude = p.random(50, 150);
      this.frequency = p.random(0.1, 1.0);
      this.angularFrequency = p.TWO_PI * this.frequency;
      this.position = p.createVector(0, 0);
    }

    update() {
      let time = p.millis() / 1000;
      this.position.x = this.amplitude * p.cos(this.angularFrequency * time);
    }

    display() {
      p.fill(255, 0, 0);
      p.ellipse(this.position.x + p.width / 4, p.height / 2, 10, 10);
    }
  }

  p.addOscillator = function () {
    oscillators.push(new Oscillator());
  };

  p.clearOscillators = function () {
    oscillators = [];
  };
};

// Instantiate the P5 sketch
new p5(oscillatorSketch);
