const mySketch = (p) => {
  p.setup = function() {
    p.createCanvas(400, 400);
    p.background(200);
  };

  p.draw = function() {
    p.fill(100);
    p.ellipse(p.mouseX, p.mouseY, 50, 50);
  };
};

// Instantiate the P5 sketch
new p5(mySketch);
