/*
  Enhanced Relational Network Simulation with Color Mapping by Connectedness,
  Minimal Edge Crossing Avoidance, and a Secondary Graph Display with Y-Axis

  Features:
   - Each new edge is given a random color.
   - On each update, connected components are determined. Within each component, the
     dominant color (most frequent among its edges) is computed and then all edges, as well as
     emergent nodes, update to that color.
   - Only emergent nodes (i.e. connection points that reach a density threshold) are drawn.
   - The simulation dynamics use a simple force-directed method (repulsion and attraction)
     without extra clamping.
   - A secondary canvas (line chart) to the right displays, over time, the count of edges
     in each color group. A y-axis with tick marks and labels shows the counts.
     
  UI Controls:
   - Start/Restart button
   - Pause button
   - Slider for the simulation time step (update interval)
   - Slider for the number of edges added per update
   - Slider for the emergent node “temperature” (diffusion intensity)
*/

// ----- Global Variables and Settings -----
let simWidth = 800;
let graphWidth = 400;
let canvasHeight = 600;

let edges = [];             // Array of Edge objects.
let connectionPoints = [];  // Array of ConnectionPoint objects.
let simulationRunning = false;
let lastEdgeTime = 0;
let timeStep = 1000;        // in milliseconds

// Thresholds
const snapThreshold = 20;          // Distance within which connection points merge.
const emergentCountThreshold = 3;  // Number of endpoints needed for a connection point to "emerge".

// UI Elements
let startButton, pauseButton;
let timeSlider, timeLabel;
let edgeCountSlider, edgeCountLabel;
let emergentTempSlider, emergentTempLabel;

let nextEdgePosition = null; // If user clicks in simulation area, that position is used for a new edge.
let emergentTemperature = 1; // Controls the diffusion intensity for emergent nodes.

// Secondary canvas (p5.Graphics) for the line graph.
let graphCanvas;
let updateIndex = 0;
let colorHistory = {}; // Object: key = color string "r,g,b", value = array of counts over time.

// ----- Setup -----
function setup() {
  createCanvas(simWidth + graphWidth, canvasHeight);
  background(255);
  
  // Create off-screen graphics buffer for the graph.
  graphCanvas = createGraphics(graphWidth, canvasHeight);
  
  // Create UI elements with adjusted positions.
  startButton = createButton('Start/Restart');
  startButton.position(10, canvasHeight + 10);
  startButton.mousePressed(startSimulation);
  
  pauseButton = createButton('Pause');
  pauseButton.position(130, canvasHeight + 10);
  pauseButton.mousePressed(togglePause);
  
  timeLabel = createDiv('Time Step (ms):');
  timeLabel.position(10, canvasHeight + 40);
  timeSlider = createSlider(200, 2000, timeStep, 50);
  timeSlider.position(150, canvasHeight + 40);
  
  edgeCountLabel = createDiv('Edges per Update:');
  edgeCountLabel.position(10, canvasHeight + 70);
  edgeCountSlider = createSlider(1, 10, 1, 1);
  edgeCountSlider.position(150, canvasHeight + 70);
  
  emergentTempLabel = createDiv('Emergent Node Temperature:');
  emergentTempLabel.position(10, canvasHeight + 100);
  emergentTempSlider = createSlider(0, 5, 1, 0.1);
  emergentTempSlider.position(150, canvasHeight + 100);
  
  startSimulation();
}

// ----- Simulation Control -----
function startSimulation() {
  edges = [];
  connectionPoints = [];
  simulationRunning = true;
  lastEdgeTime = millis();
  updateIndex = 0;
  colorHistory = {}; // Reset color history.
  background(255);
}

function togglePause() {
  simulationRunning = !simulationRunning;
  pauseButton.html(simulationRunning ? 'Pause' : 'Resume');
}

// ----- Main Draw Loop -----
function draw() {
  background(255);
  
  // Update simulation parameters from UI.
  timeStep = timeSlider.value();
  let edgesPerUpdate = edgeCountSlider.value();
  emergentTemperature = emergentTempSlider.value();
  
  // If running, add new edges at the specified interval.
  if (simulationRunning && millis() - lastEdgeTime >= timeStep) {
    for (let i = 0; i < edgesPerUpdate; i++) {
      let pos;
      if (nextEdgePosition) {
        pos = nextEdgePosition.copy();
        nextEdgePosition = null;
      } else {
        pos = createVector(random(simWidth), random(canvasHeight));
      }
      addEdge(pos);
    }
    lastEdgeTime = millis();
    updateGraphData();
  }
  
  // Update connection points.
  for (let cp of connectionPoints) {
    cp.update();
    cp.updateEmergence();
  }
  
  // Check for and merge connection points that are too close.
  checkForSnapping();
  
  // Update edge colors based on connectedness.
  updateEdgeColors();
  
  // Draw all edges in the simulation area.
  for (let edge of edges) {
    edge.display();
  }
  
  // Only draw emergent nodes.
  for (let cp of connectionPoints) {
    cp.display();
  }
  
  // Update and draw the graph on the secondary canvas.
  updateGraphCanvas();
  image(graphCanvas, simWidth, 0);
}

// ----- Mouse Interaction -----
function mousePressed() {
  // If the user clicks within the simulation area, record that position.
  if (mouseX < simWidth && mouseY < canvasHeight) {
    nextEdgePosition = createVector(mouseX, mouseY);
  }
}

// ----- Edge and Connection Point Creation -----
function addEdge(pos) {
  let startPos = pos || createVector(random(simWidth), random(canvasHeight));
  
  // Choose a random direction and edge length.
  let angle = random(TWO_PI);
  let edgeLength = random(30, 100);
  let endPos = p5.Vector.add(startPos, createVector(cos(angle) * edgeLength, sin(angle) * edgeLength));
  
  // Snap endpoints to existing connection points (if within snapThreshold).
  let cp1 = findOrCreateConnectionPoint(startPos);
  let cp2 = findOrCreateConnectionPoint(endPos);
  
  // Create a new edge with a random starting color.
  let edge = new Edge(cp1, cp2);
  edges.push(edge);
  
  // Register the endpoints with their connection points.
  cp1.addEndpoint(edge, 0, startPos);
  cp2.addEndpoint(edge, 1, endPos);
}

function findOrCreateConnectionPoint(pos) {
  for (let cp of connectionPoints) {
    if (p5.Vector.dist(pos, cp.pos) < snapThreshold) {
      return cp;
    }
  }
  let newCP = new ConnectionPoint(pos);
  connectionPoints.push(newCP);
  return newCP;
}

// ----- Merging Connection Points -----
function checkForSnapping() {
  for (let i = connectionPoints.length - 1; i >= 0; i--) {
    for (let j = i - 1; j >= 0; j--) {
      let cp1 = connectionPoints[i];
      let cp2 = connectionPoints[j];
      if (p5.Vector.dist(cp1.pos, cp2.pos) < snapThreshold) {
        mergeConnectionPoints(cp2, cp1); // Merge cp1 into cp2.
        connectionPoints.splice(i, 1);
        break;
      }
    }
  }
}

function mergeConnectionPoints(cpKeep, cpMerge) {
  let countKeep = cpKeep.endpoints.length;
  let countMerge = cpMerge.endpoints.length;
  let totalCount = countKeep + countMerge;
  let newX = (cpKeep.pos.x * countKeep + cpMerge.pos.x * countMerge) / totalCount;
  let newY = (cpKeep.pos.y * countKeep + cpMerge.pos.y * countMerge) / totalCount;
  cpKeep.pos = createVector(newX, newY);
  
  cpKeep.endpoints = cpKeep.endpoints.concat(cpMerge.endpoints);
  cpKeep.emergent = cpKeep.emergent || cpMerge.emergent;
  
  // Update all edges referencing cpMerge to now reference cpKeep.
  for (let edge of edges) {
    if (edge.cp1 === cpMerge) edge.cp1 = cpKeep;
    if (edge.cp2 === cpMerge) edge.cp2 = cpKeep;
  }
}

// ----- Color Mapping by Connectedness -----
// For each connected component of connection points, determine the dominant edge color
// and update all edges and emergent nodes in that component.
function updateEdgeColors() {
  let comps = computeConnectedComponents();
  for (let comp of comps) {
    let compEdges = [];
    let cpSet = new Set(comp);
    for (let edge of edges) {
      if (cpSet.has(edge.cp1) && cpSet.has(edge.cp2)) {
        compEdges.push(edge);
      }
    }
    if (compEdges.length > 0) {
      // Tally frequency of each edge color.
      let colorCounts = {};
      for (let edge of compEdges) {
        let colStr = colorToString(edge.color);
        if (colorCounts[colStr] === undefined) colorCounts[colStr] = 0;
        colorCounts[colStr]++;
      }
      // Find the dominant color.
      let dominantColorStr = null;
      let maxCount = 0;
      for (let col in colorCounts) {
        if (colorCounts[col] > maxCount) {
          maxCount = colorCounts[col];
          dominantColorStr = col;
        }
      }
      let dominantColor = stringToColor(dominantColorStr);
      // Update all edges in the component.
      for (let edge of compEdges) {
        edge.color = dominantColor;
      }
      // Also update emergent nodes in the component.
      for (let cp of comp) {
        if (cp.emergent) {
          cp.groupColor = dominantColor;
        }
      }
    }
  }
}

// Compute connected components from the connection points using DFS.
function computeConnectedComponents() {
  let comps = [];
  let visited = new Set();
  for (let cp of connectionPoints) {
    if (!visited.has(cp)) {
      let comp = [];
      let stack = [cp];
      while (stack.length > 0) {
        let current = stack.pop();
        if (!visited.has(current)) {
          visited.add(current);
          comp.push(current);
          // For each neighbor via an edge, add if not visited.
          for (let ep of current.endpoints) {
            let neighbor = (ep.edge.cp1 === current) ? ep.edge.cp2 : ep.edge.cp1;
            if (!visited.has(neighbor)) {
              stack.push(neighbor);
            }
          }
        }
      }
      comps.push(comp);
    }
  }
  return comps;
}

// ----- Graph (Color Metric) Update Functions -----
function updateGraphData() {
  updateIndex++;
  let counts = {};
  for (let edge of edges) {
    let colStr = colorToString(edge.color);
    if (counts[colStr] === undefined) counts[colStr] = 0;
    counts[colStr]++;
  }
  // Update series in colorHistory.
  for (let col in counts) {
    if (!colorHistory.hasOwnProperty(col)) {
      colorHistory[col] = [];
    }
    colorHistory[col].push(counts[col]);
  }
  // For series not present this update, record 0.
  for (let col in colorHistory) {
    if (!(col in counts)) {
      colorHistory[col].push(0);
    }
  }
  // Limit history length to the available width (graphCanvas width minus margin).
  let maxHistory = graphCanvas.width - 30;
  for (let col in colorHistory) {
    if (colorHistory[col].length > maxHistory) {
      colorHistory[col].shift();
    }
  }
}

function updateGraphCanvas() {
    let marginLeft = 30;  // Reserve space for the y-axis.
    graphCanvas.background(240);
    
    // Draw the axes.
    graphCanvas.stroke(0);
    // x-axis: from (marginLeft, bottom) to (canvas width, bottom)
    graphCanvas.line(marginLeft, graphCanvas.height - 1, graphCanvas.width, graphCanvas.height - 1);
    // y-axis: from (marginLeft, bottom) to (marginLeft, top)
    graphCanvas.line(marginLeft, graphCanvas.height - 1, marginLeft, 0);
    
    // Determine the maximum count for scaling the y-axis.
    let maxCount = 0;
    for (let col in colorHistory) {
      for (let val of colorHistory[col]) {
        if (val > maxCount) maxCount = val;
      }
    }
    if (maxCount === 0) maxCount = 1;
    
    // ---- Draw Y-Axis Tick Marks and Labels ----
    let numYTicks = 5;
    for (let i = 0; i <= numYTicks; i++) {
      let y = map(i, 0, numYTicks, graphCanvas.height - 1, 0);
      graphCanvas.line(marginLeft - 5, y, marginLeft, y);
      let label = nf(map(i, 0, numYTicks, 0, maxCount), 0, 0);
      graphCanvas.noStroke();
      graphCanvas.fill(0);
      graphCanvas.textSize(10);
      graphCanvas.text(label, 2, y + 3);
      graphCanvas.stroke(0);
    }
    
    // ---- Draw X-Axis Tick Marks and Labels (Simulation Steps) ----
    // We'll use the length of one series (all series have the same length) as the number of steps.
    let n = 0;
    for (let col in colorHistory) {
      n = colorHistory[col].length;
      break;
    }
    if (n === 0) n = 1;
    let availableWidth = graphCanvas.width - marginLeft;
    let numXTicks = 5;
    for (let i = 0; i <= numXTicks; i++) {
      let x = marginLeft + map(i, 0, numXTicks, 0, availableWidth);
      graphCanvas.line(x, graphCanvas.height - 1, x, graphCanvas.height - 1 + 5);
      // The oldest simulation step is updateIndex - n; the most recent is updateIndex.
      let step = floor(updateIndex - n + map(i, 0, numXTicks, 0, n));
      graphCanvas.noStroke();
      graphCanvas.fill(0);
      graphCanvas.textSize(10);
      graphCanvas.text(step, x - 10, graphCanvas.height + 10);
      graphCanvas.stroke(0);
    }
    
    // ---- Plot the Color Series as Dots ----
    for (let col in colorHistory) {
      let series = colorHistory[col];
      graphCanvas.fill(stringToColor(col));
      graphCanvas.noStroke();
      // Use the same availableWidth and number of steps (n) to determine x positions.
      let xInc = n > 1 ? availableWidth / (n - 1) : 0;
      for (let i = 0; i < n; i++) {
        let x = marginLeft + i * xInc;
        let y = map(series[i], 0, maxCount, graphCanvas.height - 1, 0);
        graphCanvas.ellipse(x, y, 4, 4);  // Plot a dot (diameter 4)
      }
    }
  }
  

// ----- Helper Functions -----
function colorToString(c) {
  let r = nf(red(c), 0, 0);
  let g = nf(green(c), 0, 0);
  let b = nf(blue(c), 0, 0);
  return r + "," + g + "," + b;
}

function stringToColor(s) {
  let parts = s.split(",");
  return color(Number(parts[0]), Number(parts[1]), Number(parts[2]));
}

// ----- Class Definitions -----

// Edge class: connects two connection points.
class Edge {
  constructor(cp1, cp2) {
    this.cp1 = cp1;
    this.cp2 = cp2;
    // Start with a random color.
    this.color = color(random(255), random(255), random(255));
  }
  
  display() {
    stroke(this.color);
    strokeWeight(2);
    line(this.cp1.pos.x, this.cp1.pos.y, this.cp2.pos.x, this.cp2.pos.y);
  }
}

// ConnectionPoint class: represents a virtual node where edge endpoints snap together.
// It updates its position using a simple force-directed method (repulsion and attraction).
// Only emergent connection points (ones that have reached a density threshold) are drawn.
class ConnectionPoint {
  constructor(pos) {
    this.pos = pos.copy();
    this.velocity = createVector(0, 0);
    this.endpoints = []; // Array of objects: { edge, index, pos }
    this.emergent = false;
    this.groupColor = null; // Will be updated when emergent.
  }
  
  addEndpoint(edge, index, originalPos) {
    this.endpoints.push({ edge: edge, index: index, pos: originalPos.copy() });
  }
  
  getCount() {
    return this.endpoints.length;
  }
  
  update() {
    if (!this.emergent) {
      let repulsion = createVector(0, 0);
      for (let other of connectionPoints) {
        if (other === this) continue;
        let d = p5.Vector.dist(this.pos, other.pos);
        let minDist = 30;
        if (d < minDist && d > 0) {
          let diff = p5.Vector.sub(this.pos, other.pos);
          diff.normalize();
          let force = (minDist - d) * 0.05;
          diff.mult(force);
          repulsion.add(diff);
        }
      }
      let attraction = createVector(0, 0);
      for (let edge of edges) {
        if (edge.cp1 === this || edge.cp2 === this) {
          let other = (edge.cp1 === this) ? edge.cp2 : edge.cp1;
          let d = p5.Vector.dist(this.pos, other.pos);
          let ideal = 50;
          let diff = p5.Vector.sub(other.pos, this.pos);
          let force = (d - ideal) * 0.01;
          diff.normalize();
          diff.mult(force);
          attraction.add(diff);
        }
      }
      this.velocity.add(repulsion);
      this.velocity.add(attraction);
      this.velocity.mult(0.9);
      this.pos.add(this.velocity);
    } else {
      let repulsion = createVector(0, 0);
      for (let other of connectionPoints) {
        if (other === this) continue;
        let d = p5.Vector.dist(this.pos, other.pos);
        let minDist = 30;
        if (d < minDist && d > 0) {
          let diff = p5.Vector.sub(this.pos, other.pos);
          diff.normalize();
          let force = (minDist - d) * 0.05;
          diff.mult(force);
          repulsion.add(diff);
        }
      }
      let diffusion = createVector(
        randomGaussian(0, emergentTemperature),
        randomGaussian(0, emergentTemperature)
      );
      this.pos.add(repulsion);
      this.pos.add(diffusion);
    }
  }
  
  updateEmergence() {
    if (!this.emergent && this.getCount() >= emergentCountThreshold) {
      let sum = createVector(0, 0);
      for (let ep of this.endpoints) {
        sum.add(ep.pos);
      }
      let centroid = sum.div(this.endpoints.length);
      this.pos = centroid;
      this.emergent = true;
    }
  }
  
  // Only display emergent nodes.
  display() {
    if (this.emergent) {
      fill(this.groupColor ? this.groupColor : 255);
      stroke(0);
      strokeWeight(2);
      ellipse(this.pos.x, this.pos.y, 20, 20);
    }
  }
}

/*
  // Future Neo4j integration (pseudo-code, not active):
  function sendGraphToNeo4j() {
    let graphData = { nodes: [], edges: [] };
    for (let cp of connectionPoints) {
      if (cp.emergent) {
        graphData.nodes.push({ id: cp.id, x: cp.pos.x, y: cp.pos.y });
      }
    }
    for (let edge of edges) {
      graphData.edges.push({ source: edge.cp1.id, target: edge.cp2.id });
    }
    // Use fetch or AJAX to send graphData to a Neo4j endpoint.
  }
*/
