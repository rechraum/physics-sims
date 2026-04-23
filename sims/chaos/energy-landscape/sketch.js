const energyLandscapeSketch = (p) => {

  // ── State ──────────────────────────────────────────────────────────────────
  let W, H;           // terrain pixel dimensions (= canvas)
  let heights;        // Float32Array [W*H], values in [-1, 1]
  let terrainImg;     // p5.Graphics — heatmap render of heights
  let basinImg;       // p5.Graphics — basin-of-attraction overlay
  let balls = [];
  let localMinima = [];
  let localMaxima = [];
  let terrainReady = false;
  let basinDirty = false;
  let terrainDirty = false;
  let _prevColormap = '';

  // ── Controls (read each frame) ─────────────────────────────────────────────
  const ctrl = {
    friction:    () => +document.getElementById('ctrl-friction').value,
    speed:       () => +document.getElementById('ctrl-speed').value,
    roughness:   () => +document.getElementById('ctrl-roughness').value,
    amplitude:   () => +document.getElementById('ctrl-amplitude').value,
    brushSize:   () => +document.getElementById('ctrl-brush').value,
    brushStrength: () => +document.getElementById('ctrl-strength').value,
    contours:    () => document.getElementById('chk-contours').checked,
    gradient:    () => document.getElementById('chk-gradient').checked,
    basins:      () => document.getElementById('chk-basins').checked,
    colormap:    () => document.getElementById('sel-colormap').value,
    trailLength: () => +document.getElementById('ctrl-trail').value,
  };

  // ── Setup ──────────────────────────────────────────────────────────────────
  p.setup = function () {
    const el = document.getElementById('canvas-container');
    W = el.offsetWidth;
    H = el.offsetHeight;
    const canvas = p.createCanvas(W, H);
    canvas.parent('canvas-container');
    p.pixelDensity(1);
    p.colorMode(p.RGB, 255);

    document.getElementById('btn-new-landscape').addEventListener('click', newLandscape);
    document.getElementById('btn-scatter').addEventListener('click', scatterBalls);
    document.getElementById('btn-clear-balls').addEventListener('click', () => { balls = []; });
    canvas.mousePressed(onMousePressed);

    // live-update slider value labels
    ['roughness','amplitude','friction','speed','brush','strength','trail'].forEach(id => {
      const el = document.getElementById('ctrl-' + id);
      const label = document.getElementById('val-' + id);
      el.addEventListener('input', () => { label.textContent = (+el.value).toFixed(el.step.includes('.') ? el.step.split('.')[1].length : 0); });
    });

    newLandscape();
  };

  // ── Draw ───────────────────────────────────────────────────────────────────
  p.draw = function () {
    p.background(17, 24, 39);

    if (!terrainReady) return;

    const cm = ctrl.colormap();
    if (cm !== _prevColormap) { terrainDirty = true; _prevColormap = cm; }

    // flush deferred terrain rebuild from paint operations
    if (terrainDirty) {
      rebuildTerrainImg();
      detectExtrema();
      terrainDirty = false;
    }

    // terrain heatmap
    if (cm !== 'off') p.image(terrainImg, 0, 0, W, H);

    // basin overlay
    if (ctrl.basins() && basinImg) {
      p.push();
      p.tint(255, 120);
      p.image(basinImg, 0, 0, W, H);
      p.pop();
    }

    if (ctrl.contours()) drawContours();
    if (ctrl.gradient()) drawGradientArrows();

    drawExtremaMarkers();

    // paint brush preview
    if (window._simMode !== 'roll') drawBrushPreview();

    // balls
    const stepsPerFrame = Math.round(ctrl.speed());
    for (let s = 0; s < stepsPerFrame; s++) {
      for (const b of balls) b.update(ctrl.friction());
    }
    for (const b of balls) b.show();

    // update stats
    document.getElementById('val-ball-count').textContent = balls.length;
    document.getElementById('val-settled').textContent = balls.filter(b => b.stuck).length;

    // rebuild basin map if needed
    if (basinDirty && ctrl.basins()) {
      buildBasinMap();
      basinDirty = false;
    }
  };

  // ── Terrain Generation — Spectral Synthesis ────────────────────────────────
  function newLandscape() {
    balls = [];
    basinImg = null;
    basinDirty = true;
    generateTerrain();
    detectExtrema();
    rebuildTerrainImg();
    terrainReady = true;
  }

  function generateTerrain() {
    heights = new Float32Array(W * H);
    const numModes = ctrl.roughness() * 3;
    const amp = ctrl.amplitude();

    // Random Fourier modes — guaranteed periodic (tileable)
    const modes = [];
    for (let i = 0; i < numModes; i++) {
      const nx = Math.floor(p.random(1, ctrl.roughness() + 1)) * (p.random() < 0.5 ? 1 : -1);
      const ny = Math.floor(p.random(1, ctrl.roughness() + 1)) * (p.random() < 0.5 ? 1 : -1);
      const phase = p.random(p.TWO_PI);
      const weight = 1 / (Math.sqrt(nx * nx + ny * ny)); // higher freq = lower amplitude
      modes.push({ nx, ny, phase, weight });
    }

    // Normalise weights
    const totalW = modes.reduce((s, m) => s + m.weight, 0);

    let minH = Infinity, maxH = -Infinity;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let h = 0;
        for (const m of modes) {
          h += (m.weight / totalW) * Math.cos(
            p.TWO_PI * m.nx * x / W +
            p.TWO_PI * m.ny * y / H +
            m.phase
          );
        }
        heights[y * W + x] = h;
        if (h < minH) minH = h;
        if (h > maxH) maxH = h;
      }
    }

    // Normalise to [-1, 1]
    const range = maxH - minH;
    for (let i = 0; i < heights.length; i++) {
      heights[i] = (2 * (heights[i] - minH) / range) - 1;
    }
  }

  function rebuildTerrainImg() {
    const cm = ctrl.colormap();
    terrainImg = p.createGraphics(W, H);
    terrainImg.pixelDensity(1);
    terrainImg.loadPixels();
    for (let i = 0; i < heights.length; i++) {
      const h = heights[i]; // [-1,1]
      const [r, g, b] = heightToColor(h, cm);
      terrainImg.pixels[i * 4]     = r;
      terrainImg.pixels[i * 4 + 1] = g;
      terrainImg.pixels[i * 4 + 2] = b;
      terrainImg.pixels[i * 4 + 3] = 255;
    }
    terrainImg.updatePixels();
  }

  function heightToColor(h, cm) {
    const t = (h + 1) / 2; // [0, 1]
    let r, g, b;
    if (cm === 'grayscale') {
      const v = Math.round(t * 220 + 20);
      return [v, v, v];
    }
    if (cm === 'plasma') {
      if (t < 0.25) {
        const s = t / 0.25;
        r = Math.round(13 + s * 71); g = Math.round(8 - s * 6); b = Math.round(135 + s * 28);
      } else if (t < 0.5) {
        const s = (t - 0.25) / 0.25;
        r = Math.round(84 + s * 104); g = Math.round(2 + s * 53); b = Math.round(163 - s * 79);
      } else if (t < 0.75) {
        const s = (t - 0.5) / 0.25;
        r = Math.round(188 + s * 51); g = Math.round(55 + s * 69); b = Math.round(84 - s * 63);
      } else {
        const s = (t - 0.75) / 0.25;
        r = Math.round(239 + s); g = Math.round(124 + s * 125); b = Math.round(21 + s * 12);
      }
      return [r, g, b];
    }
    // thermal: blue (low) → teal → green → yellow → red (high)
    if (t < 0.25) {
      const s = t / 0.25;
      r = 0; g = Math.round(s * 180); b = Math.round(80 + s * 175);
    } else if (t < 0.5) {
      const s = (t - 0.25) / 0.25;
      r = 0; g = Math.round(180 + s * 75); b = Math.round(255 - s * 255);
    } else if (t < 0.75) {
      const s = (t - 0.5) / 0.25;
      r = Math.round(s * 255); g = 255; b = 0;
    } else {
      const s = (t - 0.75) / 0.25;
      r = 255; g = Math.round(255 - s * 255); b = 0;
    }
    return [r, g, b];
  }

  // ── Terrain helpers ────────────────────────────────────────────────────────
  function getHeight(x, y) {
    x = ((Math.floor(x) % W) + W) % W;
    y = ((Math.floor(y) % H) + H) % H;
    return heights[y * W + x];
  }

  // Analytical gradient of bilinear-interpolated heights.
  // Unlike the old finite-difference version, this gives a force that varies
  // continuously within each pixel cell, eliminating false zero-gradient points
  // at discrete grid saddles.
  function getGradient(x, y) {
    const ix0 = ((Math.floor(x) % W) + W) % W;
    const iy0 = ((Math.floor(y) % H) + H) % H;
    const ix1 = (ix0 + 1) % W;
    const iy1 = (iy0 + 1) % H;
    const fx = x - Math.floor(x);
    const fy = y - Math.floor(y);
    const h00 = heights[iy0 * W + ix0];
    const h10 = heights[iy0 * W + ix1];
    const h01 = heights[iy1 * W + ix0];
    const h11 = heights[iy1 * W + ix1];
    return p.createVector(
      (h10 - h00) * (1 - fy) + (h11 - h01) * fy,
      (h01 - h00) * (1 - fx) + (h11 - h10) * fx
    );
  }

  // ── Local Minima Detection ─────────────────────────────────────────────────
  function detectExtrema() {
    localMinima = [];
    localMaxima = [];
    const stride = 8;
    for (let y = 0; y < H; y += stride) {
      for (let x = 0; x < W; x += stride) {
        const h = getHeight(x, y);
        let isMin = true, isMax = true;
        outer: for (let dy = -stride; dy <= stride; dy += stride) {
          for (let dx = -stride; dx <= stride; dx += stride) {
            if (dx === 0 && dy === 0) continue;
            const n = getHeight(x + dx, y + dy);
            if (n < h) isMin = false;
            if (n > h) isMax = false;
            if (!isMin && !isMax) break outer;
          }
        }
        if (isMin) {
          const tooClose = localMinima.some(m => Math.hypot(m.x - x, m.y - y) < stride * 3);
          if (!tooClose) localMinima.push({ x, y, h });
        }
        if (isMax) {
          const tooClose = localMaxima.some(m => Math.hypot(m.x - x, m.y - y) < stride * 3);
          if (!tooClose) localMaxima.push({ x, y, h });
        }
      }
    }
  }

  // ── Ball Class ─────────────────────────────────────────────────────────────
  class Ball {
    constructor(x, y, col) {
      this.pos = p.createVector(x, y);
      this.vel = p.createVector(0, 0);
      this.col = col;
      this.path = [];       // [{x,y}] — split at wrap boundaries
      this.stuck = false;
      this.stuckTimer = 0;
    }

    update(friction) {
      if (this.stuck) return;

      const grad = getGradient(this.pos.x, this.pos.y);
      // F = -∇V
      this.vel.x -= grad.x;
      this.vel.y -= grad.y;
      // velocity-proportional damping
      this.vel.mult(1 - friction);

      const prevX = this.pos.x;
      const prevY = this.pos.y;
      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;

      // Detect wrap — insert a break in the path so we don't draw across the canvas
      const wrappedX = this.pos.x < 0 || this.pos.x >= W;
      const wrappedY = this.pos.y < 0 || this.pos.y >= H;
      if (wrappedX || wrappedY) this.path.push(null); // null = break

      this.pos.x = ((this.pos.x % W) + W) % W;
      this.pos.y = ((this.pos.y % H) + H) % H;

      this.path.push({ x: this.pos.x, y: this.pos.y });
      const maxTrail = ctrl.trailLength();
      if (this.path.length > maxTrail) this.path.splice(0, this.path.length - maxTrail);

      if (this.vel.mag() < 0.05) {
        this.stuckTimer++;
        if (this.stuckTimer > 30) {
          const g = getGradient(this.pos.x, this.pos.y);
          if (g.mag() < 0.005) {
            this.stuck = true; // genuinely at a minimum
          } else {
            // Slow but on a slope — numerical stall, escape with a small kick
            this.vel.x += (p.random() - 0.5) * 0.15;
            this.vel.y += (p.random() - 0.5) * 0.15;
            this.stuckTimer = 0;
          }
        }
      } else {
        this.stuckTimer = 0;
      }
    }

    show() {
      const c = this.col;

      // draw path — split at wrap breaks
      p.noFill();
      p.strokeWeight(1);
      p.stroke(p.red(c), p.green(c), p.blue(c), 160);
      let segment = [];
      for (const pt of this.path) {
        if (pt === null) {
          drawPath(segment); segment = [];
        } else {
          segment.push(pt);
        }
      }
      drawPath(segment);

      // Ghost copies near edges
      const gx = this.pos.x, gy = this.pos.y;
      const edgeDist = 30;
      const offsets = [];
      if (gx < edgeDist) offsets.push([W, 0]);
      if (gx > W - edgeDist) offsets.push([-W, 0]);
      if (gy < edgeDist) offsets.push([0, H]);
      if (gy > H - edgeDist) offsets.push([0, -H]);

      for (const [ox, oy] of offsets) {
        p.noStroke();
        p.fill(p.red(c), p.green(c), p.blue(c), 80);
        p.ellipse(gx + ox, gy + oy, 10);
      }

      // Main ball
      p.noStroke();
      if (this.stuck) {
        p.fill(p.red(c), p.green(c), p.blue(c), 200);
        p.ellipse(gx, gy, 10);
        p.stroke(p.red(c), p.green(c), p.blue(c), 200);
        p.strokeWeight(1.5);
        p.noFill();
        p.ellipse(gx, gy, 16);
      } else {
        p.fill(c);
        p.ellipse(gx, gy, 10);
      }
    }
  }

  function drawPath(pts) {
    if (pts.length < 2) return;
    p.beginShape();
    for (const pt of pts) p.vertex(pt.x, pt.y);
    p.endShape();
  }

  // ── Contour Lines ──────────────────────────────────────────────────────────
  function drawContours() {
    const levels = 12;
    p.strokeWeight(0.6);
    p.noFill();
    for (let li = 0; li < levels; li++) {
      const threshold = -1 + (2 / levels) * (li + 0.5);
      const bright = li % 3 === 0 ? 200 : 100;
      p.stroke(bright, bright, bright, li % 3 === 0 ? 130 : 70);
      // March over grid cells
      const step = 4;
      for (let y = 0; y < H - step; y += step) {
        for (let x = 0; x < W - step; x += step) {
          const h00 = getHeight(x, y);
          const h10 = getHeight(x + step, y);
          const h01 = getHeight(x, y + step);
          const h11 = getHeight(x + step, y + step);
          marchingSquaresEdge(x, y, step, h00, h10, h01, h11, threshold);
        }
      }
    }
  }

  function marchingSquaresEdge(x, y, s, h00, h10, h01, h11, t) {
    const pts = [];
    if ((h00 < t) !== (h10 < t)) pts.push([x + s * (t - h00) / (h10 - h00), y]);
    if ((h10 < t) !== (h11 < t)) pts.push([x + s, y + s * (t - h10) / (h11 - h10)]);
    if ((h01 < t) !== (h11 < t)) pts.push([x + s * (t - h01) / (h11 - h01), y + s]);
    if ((h00 < t) !== (h01 < t)) pts.push([x, y + s * (t - h00) / (h01 - h00)]);
    if (pts.length === 2) p.line(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
  }

  // ── Gradient Arrows ────────────────────────────────────────────────────────
  function drawGradientArrows() {
    const spacing = 40;
    p.strokeWeight(1);
    for (let y = spacing / 2; y < H; y += spacing) {
      for (let x = spacing / 2; x < W; x += spacing) {
        const g = getGradient(x, y);
        const len = g.mag();
        if (len < 0.001) continue;
        const scale = Math.min(len * 10, spacing * 0.4);
        g.normalize().mult(scale);
        const brightness = Math.min(255, Math.round(len * 800));
        p.stroke(brightness, brightness, 80, 160);
        p.noFill();
        const x2 = x - g.x, y2 = y - g.y; // arrows point downhill
        p.line(x, y, x2, y2);
        // arrowhead
        const angle = Math.atan2(y2 - y, x2 - x);
        const ah = 5;
        p.line(x2, y2,
          x2 - ah * Math.cos(angle - 0.4),
          y2 - ah * Math.sin(angle - 0.4));
        p.line(x2, y2,
          x2 - ah * Math.cos(angle + 0.4),
          y2 - ah * Math.sin(angle + 0.4));
      }
    }
  }

  // ── Local Minima Markers ───────────────────────────────────────────────────
  function drawExtremaMarkers() {
    p.noStroke();
    for (const m of localMinima) {
      p.fill(255, 220, 0, 200);
      p.ellipse(m.x, m.y, 8);
      p.fill(0, 0, 0, 180);
      p.ellipse(m.x, m.y, 4);
    }
    for (const m of localMaxima) {
      p.push();
      p.translate(m.x, m.y);
      p.rotate(Math.PI / 4);
      p.rectMode(p.CENTER);
      p.fill(255, 80, 60, 220);
      p.rect(0, 0, 8, 8);
      p.fill(255, 190, 170, 180);
      p.rect(0, 0, 4, 4);
      p.pop();
    }
  }

  // ── Basin of Attraction Map ────────────────────────────────────────────────
  function buildBasinMap() {
    if (localMinima.length === 0) return;

    // Assign each minimum a unique hue
    const minColors = localMinima.map((_, i) => {
      const hue = (i / localMinima.length) * 360;
      p.colorMode(p.HSB, 360, 100, 100);
      const c = p.color(hue, 70, 90);
      p.colorMode(p.RGB, 255);
      return [p.red(c), p.green(c), p.blue(c)];
    });

    // For each pixel, simulate gradient descent to find which minimum it reaches
    const sampleStep = 6;
    const assignment = new Int16Array(W * H).fill(-1);

    for (let sy = 0; sy < H; sy += sampleStep) {
      for (let sx = 0; sx < W; sx += sampleStep) {
        let x = sx, y = sy;
        for (let iter = 0; iter < 200; iter++) {
          const g = getGradient(x, y);
          x = ((x - g.x * 3 + W) % W + W) % W;
          y = ((y - g.y * 3 + H) % H + H) % H;
          if (g.mag() < 0.002) break;
        }
        // find nearest minimum
        let best = -1, bestD = Infinity;
        for (let mi = 0; mi < localMinima.length; mi++) {
          const m = localMinima[mi];
          const dx = Math.min(Math.abs(x - m.x), W - Math.abs(x - m.x));
          const dy = Math.min(Math.abs(y - m.y), H - Math.abs(y - m.y));
          const d = dx * dx + dy * dy;
          if (d < bestD) { bestD = d; best = mi; }
        }
        // fill the sampleStep block
        for (let dy = 0; dy < sampleStep; dy++) {
          for (let dx = 0; dx < sampleStep; dx++) {
            const px = (sx + dx) % W, py = (sy + dy) % H;
            assignment[py * W + px] = best;
          }
        }
      }
    }

    basinImg = p.createGraphics(W, H);
    basinImg.pixelDensity(1);
    basinImg.loadPixels();
    for (let i = 0; i < W * H; i++) {
      const mi = assignment[i];
      if (mi >= 0) {
        const [r, g, b] = minColors[mi];
        basinImg.pixels[i * 4]     = r;
        basinImg.pixels[i * 4 + 1] = g;
        basinImg.pixels[i * 4 + 2] = b;
        basinImg.pixels[i * 4 + 3] = 255;
      } else {
        basinImg.pixels[i * 4 + 3] = 0;
      }
    }
    basinImg.updatePixels();
  }

  // ── Paint Mode ─────────────────────────────────────────────────────────────
  function paintAt(x, y) {
    const mode = window._simMode;
    if (mode === 'roll') return;
    const r = ctrl.brushSize();
    const str = ctrl.brushStrength() * 0.05;
    const sign = mode === 'peak' ? 1 : -1;
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const ri = Math.ceil(r);
    for (let dy = -ri; dy <= ri; dy++) {
      for (let dx = -ri; dx <= ri; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > r) continue;
        const falloff = Math.cos((dist / r) * (Math.PI / 2));
        const px = ((x0 + dx) % W + W) % W;
        const py = ((y0 + dy) % H + H) % H;
        heights[py * W + px] = Math.max(-1, Math.min(1,
          heights[py * W + px] + sign * str * falloff));
      }
    }
    terrainDirty = true;
    basinDirty = true;
    basinImg = null;
  }

  function drawBrushPreview() {
    const r = ctrl.brushSize();
    const mode = window._simMode;
    p.noFill();
    p.strokeWeight(1.5);
    if (mode === 'peak') p.stroke(255, 120, 80);
    else p.stroke(80, 160, 255);
    p.ellipse(p.mouseX, p.mouseY, r * 2);
  }

  // ── Scatter ────────────────────────────────────────────────────────────────
  function scatterBalls() {
    balls = [];
    for (let i = 0; i < 30; i++) {
      const x = p.random(W), y = p.random(H);
      const hue = (i / 30) * 360;
      p.colorMode(p.HSB, 360, 100, 100);
      const c = p.color(hue, 85, 95);
      p.colorMode(p.RGB, 255);
      balls.push(new Ball(x, y, c));
    }
    basinDirty = true;
  }

  // ── Input Handlers ─────────────────────────────────────────────────────────
  function onMousePressed() {
    if (!terrainReady) return;
    const mode = window._simMode;
    if (mode === 'roll') {
      const hue = p.random(360);
      p.colorMode(p.HSB, 360, 100, 100);
      const c = p.color(hue, 85, 95);
      p.colorMode(p.RGB, 255);
      balls.push(new Ball(p.mouseX, p.mouseY, c));
    } else {
      paintAt(p.mouseX, p.mouseY);
    }
  }

  p.mouseDragged = function () {
    if (!terrainReady || window._simMode === 'roll') return;
    paintAt(p.mouseX, p.mouseY);
  };

  // ── Resize ─────────────────────────────────────────────────────────────────
  p.windowResized = function () {
    const el = document.getElementById('canvas-container');
    W = el.offsetWidth;
    H = el.offsetHeight;
    p.resizeCanvas(W, H);
    if (terrainReady) newLandscape();
  };
};
