# Knowledge Map — Feature Plan

## Goal

A navigable graph that is both a visual index of all simulations and a physics education
tool — showing how ideas connect across history and scientific domains. Two complementary
views are planned; build them in phases.

---

## User Experience

From the gallery, a **"Concept Map"** button in the header opens `/knowledge-map/`. The
map shows all sims as nodes, connected by labeled edges. Hovering highlights a node's
connections; clicking a sim node navigates to that sim. Concept bridge nodes (for ideas
not tied to one sim) open an inline tooltip.

A second, simpler page (`/knowledge-timeline/`) provides a clean SVG timeline — discovery
year on the x-axis, domain rows on the y-axis — for users who prefer a linear historical
reading.

---

## Two Complementary Views

### View 1 — Force-Directed Concept Graph (primary)
`/knowledge-map/index.html`

- **Library:** D3.js v7 (CDN — no build step)
- **Node types:** sim nodes (circles) + concept bridge nodes (diamonds)
- **Layout:** force-directed with soft temporal pull (era bands)
- **Interaction:** click sim → navigate; click concept → tooltip; hover → highlight edges

### View 2 — Historical Timeline (secondary)
`/knowledge-timeline/index.html`

- **Library:** plain SVG + vanilla JS
- **Layout:** x-axis = year (1850–2030), y-axis = domain rows
- **Nodes** placed at discovery/publication year
- **Interaction:** click sim node → navigate; hover → name + description card

---

## Data Model

Single source of truth: `knowledge-map/graph.json`

```json
{
  "nodes": [
    {
      "id": "double-slit",
      "type": "sim",
      "title": "Double-Slit Experiment",
      "domain": "quantum",
      "difficulty": "intermediate",
      "era": 1909,
      "url": "../double-slit/",
      "description": "Single particles build a wave interference pattern."
    },
    {
      "id": "wave-particle-duality",
      "type": "concept",
      "title": "Wave-Particle Duality",
      "domain": "quantum",
      "era": 1924,
      "description": "Quantum objects behave as waves or particles depending on what is measured. de Broglie (1924) showed every particle has an associated wavelength λ = h/p.",
      "related": ["double-slit", "uncertainty-principle", "quantum-eraser"]
    }
  ],
  "edges": [
    {
      "source": "double-slit",
      "target": "quantum-eraser",
      "relation": "enables",
      "label": "which-way → eraser"
    },
    {
      "source": "uncertainty-principle",
      "target": "double-slit",
      "relation": "explains",
      "label": "Δy·Δp ≥ ħ/2"
    }
  ],
  "eras": [
    { "id": "classical",  "label": "Classical (pre-1900)", "x_min": 1800, "x_max": 1899 },
    { "id": "earlyqm",   "label": "Birth of QM (1900–1935)", "x_min": 1900, "x_max": 1935 },
    { "id": "matureqm",  "label": "QM Maturity (1935–1970)", "x_min": 1935, "x_max": 1970 },
    { "id": "infoage",   "label": "Information Age (1970+)", "x_min": 1970, "x_max": 2030 }
  ]
}
```

**Node types:**
- `"sim"` — has `url` field linking to the simulation; shown as larger circles
- `"concept"` — bridge idea not owned by one sim; shown as smaller diamonds; has `related` list
- `"event"` — historical milestone (Phase 3 only)

**Edge relation types:**
| Relation | Color | Meaning |
|----------|-------|---------|
| `enables` | teal | this sim/idea makes the next one possible to understand |
| `extends` | blue | direct mathematical or conceptual extension |
| `demonstrates` | teal dim | sim is the canonical demonstration of a concept |
| `historically-led-to` | amber | one discovery historically preceded and motivated the other |
| `resolves` | purple | resolves a paradox or apparent contradiction |
| `cross-domain` | white dim | unexpected connection across physics domains |

---

## Visual Design

Consistent with the existing dark-theme site:

| Element | Color |
|---------|-------|
| Background | `#0d1117` |
| Era band 1 (classical) | `rgba(30, 38, 50, 0.5)` |
| Era band 2 (early QM) | `rgba(20, 35, 50, 0.5)` |
| Era band 3 (mature QM) | `rgba(15, 30, 45, 0.5)` |
| Era band 4 (info age) | `rgba(20, 28, 40, 0.5)` |
| Sim node — chaos/mechanics | `rgb(255, 150, 50)` orange |
| Sim node — quantum | `rgb(88, 166, 255)` blue |
| Sim node — thermodynamics | `rgb(45, 215, 135)` teal |
| Sim node — quantum info | `rgb(170, 65, 255)` purple |
| Concept bridge node | `rgba(140, 150, 165, 0.8)` grey |
| Active node (hover/click) | `#ffffff` white glow |
| Edge default | `rgba(48, 54, 61, 0.8)` |
| Edge highlighted | match relation color |
| Text | `#e6edf3` |

Node sizes: beginner = 12px radius, intermediate = 16px, advanced = 20px.
Concept nodes: 8px diamond.

---

## Phase 1A — MVP: Sim Nodes Only

**Goal:** A working, navigable concept graph with all current sims. Shippable without concept nodes.

**Files to create:**
```
/knowledge-map/
  index.html          ← page shell + D3 bootstrap
  sketch.js           ← D3 force simulation + interaction
  style.css           ← page-specific styles
  graph.json          ← data (sim nodes only for MVP)
```

**D3 force setup:**
```javascript
const simulation = d3.forceSimulation(nodes)
  .force("link",    d3.forceLink(edges).id(d => d.id).distance(120))
  .force("charge",  d3.forceManyBody().strength(-300))
  .force("x",       d3.forceX(d => eraCenter(d.era)).strength(0.15))
  .force("y",       d3.forceY(d => domainRow(d.domain)).strength(0.25))
  .force("collide", d3.forceCollide(d => nodeRadius(d) + 8));
```

`eraCenter(era)` maps era id → x-pixel center of that band.
`domainRow(domain)` maps domain → y-pixel row (quantum top, thermo middle, chaos bottom).

**Interaction:**
- SVG zoom/pan: `d3.zoom().on("zoom", e => container.attr("transform", e.transform))`
- Click sim node: `window.location.href = node.url`
- Hover sim node: highlight all connected edges + neighbor nodes; show name tooltip
- Click concept node: show info card (Phase 1B)
- Filter chips (matching gallery chips): fade out non-matching nodes/edges

**Gallery integration:**
- Add `<a href="./knowledge-map/" class="btn btn-secondary">Concept Map</a>` to gallery header
- Knowledge map page uses `shared/nav.js` (← Gallery link works via `galleryHref()`)

**Mobile fallback:**
- If viewport width < 600px, hide SVG and show a plain sorted list of sims by domain + difficulty

---

## Phase 1B — Concept Bridge Nodes

Add ~20 concept nodes to `graph.json` connecting the sim nodes.

**Planned concept nodes (with domains and key edges):**

| Concept | Domain | Connects |
|---------|--------|---------|
| Wave-Particle Duality | quantum | double-slit, uncertainty-principle, quantum-eraser |
| Quantization | quantum | blackbody-radiation, particle-in-a-box, photoelectric-effect |
| Measurement / Collapse | quantum | uncertainty-principle, double-slit, quantum-eraser, quantum-zeno |
| Entanglement | quantum | bell-inequality, bell-states, quantum-teleportation |
| Complementarity | quantum | double-slit, quantum-eraser, uncertainty-principle |
| Entropy (S = k ln W) | thermo | entropy-microstates, maxwells-demon, diffusion-levy-flights |
| Shannon Information | info | maxwells-demon, bb84-crypto, bell-inequality |
| Landauer Erasure | info | maxwells-demon, entropy-microstates |
| Arrow of Time | thermo | entropy-microstates, laplace-demon, lorenz-attractor |
| Nonequilibrium | thermo | feynman-ratchet, reaction-diffusion, fluctuation-theorems |
| Chaos / Sensitivity | chaos | lorenz-attractor, double-pendulum, laplace-demon |
| Phase Space | chaos | oscillator-phase-space, energy-landscape, kicked-pendulum |
| Ergodicity | thermo | entropy-microstates, maxwell-boltzmann |
| Superposition | quantum | particle-in-a-box, uncertainty-principle, qubit-bloch |
| Tunneling / Barriers | quantum | quantum-tunneling, quantum-harmonic-oscillator |
| Kinetic Theory | thermo | maxwell-boltzmann, diffusion-levy-flights |
| de Broglie Relation | quantum | uncertainty-principle, double-slit, particle-in-a-box |
| Information = Physical | cross | maxwells-demon, bell-inequality, bb84-crypto |

---

## Phase 2 — Historical Timeline View

**File:** `/knowledge-timeline/index.html`

**Layout:**
```
[ Pre-1900 Classical | 1900-1935 Birth of QM | 1935-1970 QM Maturity | 1970+ Info Age ]
─────────────────────────────────────────────────────────────────────────────────────────
QUANTUM ROW  ●──────────●────────●──────────────●─────●─────────●────────●
             │          │        │              │     │         │        │
THERMO ROW   ●──────────●────────────────────────────●─────────●
             │
CHAOS ROW    ●─────────────────────────────────────────────────●──────────●
─────────────────────────────────────────────────────────────────────────────────────────
             1860       1900     1920           1935  1964      1982     2015
```

Each node is placed at its historical date. Hovering shows name + 1-sentence description.
Clicking navigates to the sim (same as graph view).

Vertical lines connect related discoveries (optional — may be too cluttered; implement only
if it reads cleanly).

**Tech:** Plain SVG + vanilla JS. No D3 needed for a static layout. Calculate x by linear
interpolation of year → pixel. y is fixed per domain row.

---

## Phase 3 — Enhanced Features

- **Historical figures**: add nodes for Maxwell, Boltzmann, Heisenberg, Shannon, Bell,
  Aspect, etc. Small portrait-style icons. Edges to their discoveries.
- **Discovery path mode**: click "Tell the story" button → animate a path through the graph
  in chronological order, with each node lighting up accompanied by a brief narration card.
- **Search**: type to highlight matching nodes.
- **Sim preview on hover**: show `preview.webp` thumbnail in tooltip if available.
- **Zoom-to-cluster**: clicking a domain filter chip smoothly zooms the graph to that region.

---

## Initial Connection Map (for graph.json — MVP edges)

These are the specific edges to encode for the first build. All are `"sim"` nodes only.

```
Quantum thread:
  wave-interference → double-slit           (enables)
  double-slit → quantum-eraser              (enables)
  double-slit → bell-inequality             (historically-led-to)
  particle-in-a-box → quantum-tunneling     (extends)
  uncertainty-principle → double-slit       (explains)
  uncertainty-principle → bell-inequality   (historically-led-to)
  blackbody-radiation → photoelectric-effect (historically-led-to)
  photoelectric-effect → particle-in-a-box  (historically-led-to)
  quantum-tunneling → quantum-harmonic-oscillator (extends)
  bell-inequality → bell-states             (enables)
  bell-states → quantum-teleportation       (enables)
  qubit-bloch → bell-states                 (extends)
  bell-states → bb84-crypto                 (enables)

Chaos/classical thread:
  oscillator-phase-space → energy-landscape    (extends)
  oscillator-phase-space → kicked-pendulum      (extends)
  oscillator-phase-space → double-pendulum-array (extends)
  double-pendulum-array → lorenz-attractor      (historically-led-to)
  double-pendulum-array → laplace-demon         (demonstrates)
  lorenz-attractor → laplace-demon              (demonstrates)
  gravity-well → three-body                     (extends)
  dripping-faucet → lorenz-attractor            (historically-led-to)

Stochastic/thermo thread:
  diffusion-levy-flights → maxwell-boltzmann    (cross-domain)
  diffusion-levy-flights → entropy-microstates  (cross-domain)
  maxwell-boltzmann → entropy-microstates       (enables)
  entropy-microstates → maxwells-demon          (enables)
  maxwell-boltzmann → carnot-engine             (enables)
  carnot-engine → entropy-microstates           (historically-led-to)
  entropy-microstates → feynman-ratchet         (extends)
  feynman-ratchet → fluctuation-theorems        (historically-led-to)

Cross-domain:
  uncertainty-principle → maxwells-demon        (cross-domain, "measurement is physical")
  entropy-microstates → bell-inequality         (cross-domain, "information has entropy")
  maxwells-demon → bb84-crypto                  (cross-domain, "eavesdropping has cost")
  lorenz-attractor → laplace-demon              (demonstrates)
  reaction-diffusion → entropy-microstates      (cross-domain, "nonequilibrium self-org")
```

---

## Implementation Notes

**D3.js CDN:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>
```

**fetch() required:** `graph.json` must be fetched via HTTP — same constraint as `meta.json`.
Use VS Code Live Server or `python -m http.server 8000` for local dev.

**Shared nav:**
Include `<script src="../shared/nav.js" defer></script>` in `<head>`. Add a `meta.json`
with `"title": "Concept Map"` so nav bar shows the page title.

**Performance:** For 40–60 nodes, D3 force simulation is lightweight. Stop simulation
after convergence (`simulation.on("end", ...)`) and resume on drag.

**Accessibility:** Ensure all sim nodes have `aria-label` attributes. Provide the list
fallback (mobile) as `<ul>` with links for screen-reader compatibility.
