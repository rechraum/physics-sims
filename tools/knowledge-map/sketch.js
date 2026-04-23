/**
 * knowledge-map/sketch.js
 * D3 v7 force-directed concept graph — Phases 1A + 1B.
 *
 * Layout contract (Phase 2 compatibility):
 *   nodes[].era    — integer year; drives x-force pull and will power timeline x-axis
 *   nodes[].domain — drives y-force pull and color
 *
 * Panel design:
 *   Default view: info panel on right reserves space so graph nodes don't appear
 *   underneath it (xScale excludes the panel width from its range).
 *   After user zooms/pans, nodes may drift under the panel — that's fine.
 */

'use strict';

// ── Constants ─────────────────────────────────────────────────────────────────

const PANEL_W = 340; // info panel width — must match CSS #info-panel width

const DOMAIN_COLORS = {
  quantum: 'rgb(88, 166, 255)',
  thermo:  'rgb(45, 215, 135)',
  chaos:   'rgb(255, 150, 50)',
  info:    'rgb(170, 65, 255)',
  cross:   'rgb(140, 150, 165)',
};

const DOMAIN_LABELS = {
  quantum: 'Quantum',
  thermo:  'Thermodynamics',
  chaos:   'Chaos / Classical',
  info:    'Information',
  cross:   'Cross-domain',
};

const EDGE_COLORS = {
  'enables':             '#2de2c0',
  'extends':             '#58a6ff',
  'explains':            '#58a6ff',
  'demonstrates':        'rgba(45, 215, 135, 0.45)',
  'historically-led-to': '#d29922',
  'resolves':            '#bc8cff',
  'cross-domain':        'rgba(140, 150, 165, 0.55)',
};

const DOMAIN_ROWS = {
  quantum: 0.18,
  info:    0.38,
  thermo:  0.62,
  chaos:   0.82,
  cross:   0.50,
};

const MARGIN = { top: 48, right: 16, bottom: 28, left: 32 };
const YEAR_MIN = 1800;
const YEAR_MAX = 2030;

// ── Helpers ───────────────────────────────────────────────────────────────────

function nodeRadius(d) {
  if (d.type === 'concept') return 9;
  const map = { beginner: 12, intermediate: 16, advanced: 20 };
  return map[d.difficulty] || 16;
}

function domainColor(d) {
  return DOMAIN_COLORS[d.domain] || '#8b949e';
}

function edgeColor(relation) {
  return EDGE_COLORS[relation] || 'rgba(48, 54, 61, 0.8)';
}

function diamondPath(r) {
  return `M 0,${-r} L ${r},0 L 0,${r} L ${-r},0 Z`;
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

// ── State ─────────────────────────────────────────────────────────────────────

let graph       = null;
let simulation  = null;
let selectedId  = null;
let activeFilters = { domain: 'all', difficulty: 'all' };

let linkSel = null;
let nodeSel = null;

// meta.json cache (keyed by sim id)
const metaCache = new Map();

// ── Adjacency ─────────────────────────────────────────────────────────────────

const adj      = new Map(); // nodeId → Set<nodeId>
const adjEdges = new Map(); // nodeId → edge[]

function buildAdjacency() {
  graph.nodes.forEach(n => {
    adj.set(n.id, new Set());
    adjEdges.set(n.id, []);
  });
  graph.edges.forEach(e => {
    const s = typeof e.source === 'object' ? e.source.id : e.source;
    const t = typeof e.target === 'object' ? e.target.id : e.target;
    if (adj.has(s)) { adj.get(s).add(t); adjEdges.get(s).push(e); }
    if (adj.has(t)) { adj.get(t).add(s); adjEdges.get(t).push(e); }
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  try {
    graph = await fetch('./graph.json').then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
  } catch (e) {
    console.error('Failed to load graph.json:', e);
    return;
  }

  buildAdjacency();

  if (window.innerWidth < 600) {
    renderMobileFallback();
    return;
  }

  renderGraph();
  wireFilters();
  wireIntroBanner();
  wirePanel();
}

// ── Graph render ──────────────────────────────────────────────────────────────

function renderGraph() {
  const contentRow = document.getElementById('content-row');
  const rect = contentRow.getBoundingClientRect();
  const W = rect.width  || window.innerWidth;
  const H = rect.height || (window.innerHeight - 132);

  // xScale: keep nodes in the left portion, leaving PANEL_W for the info panel.
  // This is the key Phase-2-compatible year → x-pixel mapping.
  const xScale = d3.scaleLinear()
    .domain([YEAR_MIN, YEAR_MAX])
    .range([MARGIN.left + 50, W - PANEL_W - MARGIN.right - 24]);

  function eraX(year) {
    return xScale(Math.max(YEAR_MIN, Math.min(YEAR_MAX, year)));
  }

  function domainY(domain) {
    const frac = DOMAIN_ROWS[domain] ?? 0.5;
    return MARGIN.top + frac * (H - MARGIN.top - MARGIN.bottom);
  }

  const svg = d3.select('#map-svg');

  // Defs
  svg.append('defs'); // placeholder for future markers

  const container = svg.append('g').attr('id', 'zoom-container');

  // ── Era bands ─────────────────────────────────────────────────
  const eraGroup = container.append('g').attr('id', 'era-bands');
  graph.eras.forEach(era => {
    const x1 = xScale(era.x_min);
    const x2 = xScale(era.x_max);
    eraGroup.append('rect')
      .attr('x', x1).attr('y', MARGIN.top)
      .attr('width', Math.max(0, x2 - x1))
      .attr('height', H - MARGIN.top - MARGIN.bottom)
      .attr('fill', era.color)
      .attr('rx', 2);
    eraGroup.append('text')
      .attr('class', 'era-label')
      .attr('x', (x1 + x2) / 2)
      .attr('y', MARGIN.top - 10)
      .text(era.label);
  });

  // ── Force simulation ──────────────────────────────────────────
  const nodes = graph.nodes.map(d => Object.assign({}, d));
  const edges = graph.edges.map(d => Object.assign({}, d));

  simulation = d3.forceSimulation(nodes)
    .force('link',    d3.forceLink(edges).id(d => d.id).distance(d => {
      const isConcept = d.source.type === 'concept' || d.target.type === 'concept';
      return isConcept ? 85 : 120;
    }))
    .force('charge',  d3.forceManyBody().strength(d => d.type === 'concept' ? -160 : -260))
    .force('x',       d3.forceX(d => eraX(d.era)).strength(0.12))
    .force('y',       d3.forceY(d => domainY(d.domain)).strength(0.22))
    .force('collide', d3.forceCollide(d => nodeRadius(d) + 10))
    .alphaDecay(0.025);

  // ── Links ─────────────────────────────────────────────────────
  linkSel = container.append('g').attr('id', 'links')
    .selectAll('line')
    .data(edges)
    .join('line')
    .attr('class', 'link')
    .attr('stroke', d => edgeColor(d.relation))
    .attr('stroke-width', 1.4)
    .attr('stroke-opacity', 0.55);

  // ── Nodes ─────────────────────────────────────────────────────
  nodeSel = container.append('g').attr('id', 'nodes')
    .selectAll('g.node-group')
    .data(nodes)
    .join('g')
    .attr('class', d => [
      'node-group',
      `node-${d.type}`,
      d.status === 'planned' ? 'node-planned' : '',
    ].join(' ').trim())
    .attr('role', 'button')
    .attr('aria-label', d => d.title)
    .call(d3.drag()
      .on('start', onDragStart)
      .on('drag',  onDrag)
      .on('end',   onDragEnd))
    .on('mouseenter', onNodeHover)
    .on('mouseleave', onNodeLeave)
    .on('click',      onNodeClick);

  // Sim circles
  nodeSel.filter(d => d.type === 'sim')
    .append('circle')
    .attr('r', d => nodeRadius(d))
    .attr('fill', d => domainColor(d))
    .attr('fill-opacity', d => d.status === 'planned' ? 0.18 : 0.82)
    .attr('stroke', d => domainColor(d))
    .attr('stroke-width', d => d.status === 'planned' ? 1 : 1.5)
    .attr('stroke-dasharray', d => d.status === 'planned' ? '4,3' : null)
    .attr('stroke-opacity', d => d.status === 'planned' ? 0.40 : 0.9);

  // Concept diamonds
  nodeSel.filter(d => d.type === 'concept')
    .append('path')
    .attr('d', d => diamondPath(nodeRadius(d)))
    .attr('fill', 'rgba(140, 150, 165, 0.12)')
    .attr('stroke', 'rgba(140, 150, 165, 0.65)')
    .attr('stroke-width', 1.2);

  // Sim labels (below)
  nodeSel.filter(d => d.type === 'sim')
    .append('text')
    .attr('class', 'node-label')
    .attr('dy', d => nodeRadius(d) + 11)
    .text(d => d.title)
    .attr('opacity', d => d.status === 'planned' ? 0.30 : 0.75);

  // Concept labels (above)
  nodeSel.filter(d => d.type === 'concept')
    .append('text')
    .attr('class', 'node-label-concept')
    .attr('dy', d => -(nodeRadius(d) + 5))
    .text(d => d.title);

  // ── Tick ──────────────────────────────────────────────────────
  simulation.on('tick', () => {
    linkSel
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    nodeSel.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  simulation.on('end', () => simulation.stop());

  // ── Zoom / pan ────────────────────────────────────────────────
  const zoom = d3.zoom()
    .scaleExtent([0.2, 5])
    .on('zoom', e => container.attr('transform', e.transform));

  svg.call(zoom);
  // Override built-in dblclick zoom with reset
  svg.on('dblclick.zoom', null);
  svg.on('dblclick', () =>
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity)
  );
}

// ── Drag ──────────────────────────────────────────────────────────────────────

function onDragStart(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x; d.fy = d.y;
}
function onDrag(event, d) {
  d.fx = event.x; d.fy = event.y;
}
function onDragEnd(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null; d.fy = null;
}

// ── Hover ─────────────────────────────────────────────────────────────────────

const tooltip   = document.getElementById('map-tooltip');
const ttTitle   = document.getElementById('tt-title');
const ttDomain  = document.getElementById('tt-domain');
const ttPlanned = document.getElementById('tt-planned');

function onNodeHover(event, d) {
  const connected = adj.get(d.id) || new Set();

  nodeSel.attr('opacity', n =>
    (n.id === d.id || connected.has(n.id)) ? 1 : 0.1
  );

  linkSel
    .attr('stroke-opacity', e => {
      const s = edgeEndId(e, 'source');
      const t = edgeEndId(e, 'target');
      return (s === d.id || t === d.id) ? 1 : 0.05;
    })
    .attr('stroke-width', e => {
      const s = edgeEndId(e, 'source');
      const t = edgeEndId(e, 'target');
      return (s === d.id || t === d.id) ? 2.2 : 1.4;
    });

  ttTitle.textContent   = d.title;
  ttDomain.textContent  = DOMAIN_LABELS[d.domain] || d.domain;
  ttPlanned.style.display = d.status === 'planned' ? '' : 'none';
  positionTooltip(event);
  tooltip.classList.add('visible');
}

function onNodeLeave() {
  nodeSel.attr('opacity', 1);
  linkSel.attr('stroke-opacity', 0.55).attr('stroke-width', 1.4);
  tooltip.classList.remove('visible');
}

function edgeEndId(e, side) {
  return typeof e[side] === 'object' ? e[side].id : e[side];
}

function positionTooltip(event) {
  const pad = 14;
  let x = event.clientX + pad;
  let y = event.clientY + pad;
  const tw = tooltip.offsetWidth  || 180;
  const th = tooltip.offsetHeight || 56;
  if (x + tw > window.innerWidth  - PANEL_W) x = event.clientX - tw - pad;
  if (y + th > window.innerHeight)           y = event.clientY - th - pad;
  tooltip.style.left = `${x}px`;
  tooltip.style.top  = `${y}px`;
}

document.getElementById('map-svg').addEventListener('mousemove', e => {
  if (tooltip.classList.contains('visible')) positionTooltip(e);
});

// ── Click → open info panel ───────────────────────────────────────────────────

function onNodeClick(event, d) {
  event.stopPropagation();
  if (selectedId === d.id) {
    showWelcome();
  } else {
    showNodeDetail(d);
  }
}

// Clicking the SVG background returns to welcome
document.getElementById('map-svg').addEventListener('click', () => {
  if (selectedId !== null) showWelcome();
});

// ── Info panel management ─────────────────────────────────────────────────────

function showWelcome() {
  selectedId = null;
  document.getElementById('ip-welcome').style.display = '';
  document.getElementById('ip-detail').style.display  = 'none';
}

async function showNodeDetail(d) {
  selectedId = d.id;

  const welcome = document.getElementById('ip-welcome');
  const detail  = document.getElementById('ip-detail');
  welcome.style.display = 'none';
  detail.style.display  = 'flex';

  // Domain badge
  const badge = document.getElementById('ip-domain-badge');
  const color = domainColor(d);
  badge.textContent = d.status === 'planned'
    ? 'Coming Soon'
    : (DOMAIN_LABELS[d.domain] || capitalize(d.domain));
  badge.style.background   = d.status === 'planned' ? 'rgba(210,153,34,0.12)' : `${color}1a`;
  badge.style.borderColor  = d.status === 'planned' ? 'rgba(210,153,34,0.35)' : `${color}55`;
  badge.style.color        = d.status === 'planned' ? '#d29922' : color;

  // Type label
  const typeLabel = d.type === 'sim'
    ? `${DOMAIN_LABELS[d.domain] || capitalize(d.domain)} Simulation`
    : `${DOMAIN_LABELS[d.domain] || capitalize(d.domain)} Concept`;
  document.getElementById('ip-type-label').textContent = typeLabel;

  // Title & era
  document.getElementById('ip-detail-title').textContent = d.title;
  document.getElementById('ip-era-text').textContent =
    d.era ? `${d.type === 'concept' ? 'Formalized' : 'Discovered / established'} c.\u00a0${d.era}` : '';

  // Description — placeholder while fetching
  document.getElementById('ip-desc').textContent = d.description || '';

  // Hide optional sections initially
  document.getElementById('ip-concepts-section').style.display  = 'none';
  document.getElementById('ip-equations-section').style.display = 'none';
  document.getElementById('ip-launch-section').style.display    = 'none';

  if (d.type === 'sim') {
    populateLaunchBtn(d);
    // Async: fetch richer content from meta.json
    fetchSimMeta(d.id).then(meta => {
      if (!meta || selectedId !== d.id) return; // stale if user clicked away
      if (meta.description) {
        document.getElementById('ip-desc').textContent = meta.description;
      }
      populateConceptTags(meta.physics_concepts || []);
      populateEquations(meta.equations || []);
    });
  }

  // Connections (from graph edges — available immediately)
  populateConnections(d);
}

function populateLaunchBtn(d) {
  const section = document.getElementById('ip-launch-section');
  const btn     = document.getElementById('ip-launch-btn');
  section.style.display = '';
  if (d.status === 'planned') {
    btn.textContent = 'Coming Soon';
    btn.removeAttribute('href');
    btn.classList.add('planned');
  } else {
    btn.textContent = 'Launch Simulation →';
    btn.setAttribute('href', d.url);
    btn.classList.remove('planned');
  }
}

function populateConceptTags(concepts) {
  const section = document.getElementById('ip-concepts-section');
  const wrap    = document.getElementById('ip-concept-tags');
  if (!concepts.length) { section.style.display = 'none'; return; }
  wrap.innerHTML = concepts
    .map(c => `<span class="ip-concept-tag">${escHtml(c)}</span>`)
    .join('');
  section.style.display = '';
}

function populateEquations(equations) {
  const section = document.getElementById('ip-equations-section');
  const wrap    = document.getElementById('ip-equations');
  if (!equations.length) { section.style.display = 'none'; return; }
  // equations may contain HTML (sub/superscripts from meta.json)
  wrap.innerHTML = equations
    .map(eq => `<div class="ip-equation">${eq}</div>`)
    .join('');
  section.style.display = '';
}

function populateConnections(d) {
  const list  = document.getElementById('ip-conn-list');
  const edges = adjEdges.get(d.id) || [];
  list.innerHTML = '';

  if (!edges.length) {
    document.getElementById('ip-connections-section').style.display = 'none';
    return;
  }

  const seen = new Set();
  edges.forEach(e => {
    const srcId   = edgeEndId(e, 'source');
    const tgtId   = edgeEndId(e, 'target');
    const otherId = srcId === d.id ? tgtId : srcId;
    if (seen.has(otherId)) return;
    seen.add(otherId);

    const other = graph.nodes.find(n => n.id === otherId);
    if (!other) return;

    // Determine relation label from the edge (from d's perspective)
    const relation = e.relation || '';

    const li   = document.createElement('li');
    li.className = 'ip-conn-item';

    // Icon: dot for sims, diamond shape for concepts
    if (other.type === 'sim') {
      const dot = document.createElement('span');
      dot.className = 'ip-conn-dot';
      dot.style.background = other.status === 'planned'
        ? 'rgba(140,150,165,0.3)'
        : domainColor(other);
      li.appendChild(dot);
    } else {
      const dia = document.createElement('span');
      dia.className = 'ip-conn-diamond';
      li.appendChild(dia);
    }

    const info  = document.createElement('span');
    info.className = 'ip-conn-info';

    const name  = document.createElement('span');
    name.className = 'ip-conn-name' +
      (other.status === 'planned' ? ' planned' : '') +
      (other.type === 'sim' && !other.status ? ' clickable' : '');
    name.textContent = other.title + (other.status === 'planned' ? ' (coming soon)' : '');

    // Clicking a connected sim opens its detail panel
    if (other.type !== 'concept' && !other.status) {
      name.addEventListener('click', () => showNodeDetail(other));
    } else if (other.type === 'concept') {
      name.className += ' clickable';
      name.addEventListener('click', () => showNodeDetail(other));
    }

    const rel  = document.createElement('span');
    rel.className = 'ip-conn-relation';
    rel.textContent = relation.replace(/-/g, ' ');

    info.appendChild(name);
    info.appendChild(rel);
    li.appendChild(info);
    list.appendChild(li);
  });

  document.getElementById('ip-connections-section').style.display = '';
}

// ── meta.json fetch + cache ───────────────────────────────────────────────────

async function fetchSimMeta(simId) {
  if (metaCache.has(simId)) return metaCache.get(simId);
  const node = graph.nodes.find(n => n.id === simId);
  const base = node && node.url ? node.url : `../../sims/quantum/${simId}/`;
  try {
    const meta = await fetch(`${base}meta.json`)
      .then(r => r.ok ? r.json() : null);
    metaCache.set(simId, meta);
    return meta;
  } catch {
    metaCache.set(simId, null);
    return null;
  }
}

// ── Panel wiring ──────────────────────────────────────────────────────────────

function wirePanel() {
  document.getElementById('ip-back').addEventListener('click', e => {
    e.stopPropagation();
    showWelcome();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && selectedId !== null) showWelcome();
  });
}

// ── Filters ───────────────────────────────────────────────────────────────────

function wireFilters() {
  document.getElementById('filter-bar').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const type  = chip.dataset.filter;
    const value = chip.dataset.value;
    if (!type) return;
    document.querySelectorAll(`.chip[data-filter="${type}"]`)
      .forEach(c => c.classList.toggle('active', c === chip));
    activeFilters[type] = value;
    applyFilters();
  });
}

function applyFilters() {
  if (!nodeSel || !linkSel) return;
  const { domain, difficulty } = activeFilters;
  const visible = new Set();
  graph.nodes.forEach(n => {
    const dOk = domain === 'all'     || n.domain === domain;
    const fOk = difficulty === 'all' || n.type === 'concept' || n.difficulty === difficulty;
    if (dOk && fOk) visible.add(n.id);
  });
  nodeSel.attr('opacity', d => visible.has(d.id) ? 1 : 0.07);
  linkSel.attr('stroke-opacity', e => {
    const s = edgeEndId(e, 'source');
    const t = edgeEndId(e, 'target');
    return (visible.has(s) && visible.has(t)) ? 0.55 : 0.03;
  });
}

// ── Intro banner ──────────────────────────────────────────────────────────────

function wireIntroBanner() {
  const banner = document.getElementById('intro-banner');
  document.getElementById('intro-collapse').addEventListener('click', () => {
    banner.classList.add('collapsed');
  });
}

// ── HTML escape ───────────────────────────────────────────────────────────────

function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Mobile fallback ───────────────────────────────────────────────────────────

function renderMobileFallback() {
  const container = document.getElementById('mobile-list-container');
  if (!container) return;
  ['quantum', 'thermo', 'chaos', 'info'].forEach(domain => {
    const sims = graph.nodes
      .filter(n => n.type === 'sim' && n.domain === domain)
      .sort((a, b) => a.era - b.era);
    if (!sims.length) return;

    const h = document.createElement('h2');
    h.textContent = DOMAIN_LABELS[domain] || domain;
    container.appendChild(h);

    const ul = document.createElement('ul');
    ul.className = 'mobile-sim-list';
    sims.forEach(sim => {
      const li = document.createElement('li');
      const a  = document.createElement('a');
      a.href   = sim.status === 'planned' ? '#' : sim.url;
      const dot = document.createElement('span');
      dot.className = 'mobile-dot';
      dot.style.background = sim.status === 'planned'
        ? 'rgba(140,150,165,0.3)'
        : domainColor(sim);
      a.appendChild(dot);
      a.appendChild(document.createTextNode(
        sim.title + (sim.status === 'planned' ? ' (coming soon)' : '')
      ));
      li.appendChild(a);
      ul.appendChild(li);
    });
    container.appendChild(ul);
  });
}

// ── Boot ──────────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
