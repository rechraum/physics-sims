/**
 * shared/nav.js
 * Self-injecting navigation header and "About" panel for every simulation page.
 * Include this script in any sim's index.html — it does the rest automatically.
 *
 * Requires: ./meta.json to exist alongside the sim's index.html.
 * Gallery link target: resolves to the root index.html regardless of nesting depth.
 */
(function () {
  'use strict';

  /* ── Config ───────────────────────────────────────────────── */
  const NAV_HEIGHT = 44; // px — also set as CSS var
  const PANEL_WIDTH = 320; // px

  /* ── Inject CSS ───────────────────────────────────────────── */
  const css = `
    :root {
      --nav-height: ${NAV_HEIGHT}px;
    }

    #sim-nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: var(--nav-height);
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
      background: rgba(13, 17, 23, 0.88);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(48, 54, 61, 0.8);
      z-index: 9999;
      box-sizing: border-box;
    }

    #sim-nav .nav-back {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #8b949e;
      text-decoration: none;
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 0.82rem;
      white-space: nowrap;
      transition: color 0.2s;
      flex-shrink: 0;
      cursor: pointer;
    }

    #sim-nav .nav-back:hover { color: #58a6ff; }

    #sim-nav .nav-divider {
      width: 1px;
      height: 18px;
      background: rgba(48, 54, 61, 0.9);
      flex-shrink: 0;
    }

    #sim-nav .nav-title {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      color: #e6edf3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    #sim-nav .nav-about-btn {
      flex-shrink: 0;
      padding: 5px 12px;
      background: transparent;
      border: 1px solid rgba(48, 54, 61, 0.9);
      border-radius: 4px;
      color: #8b949e;
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 0.78rem;
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s;
      white-space: nowrap;
    }

    #sim-nav .nav-about-btn:hover,
    #sim-nav .nav-about-btn.active {
      border-color: #58a6ff;
      color: #58a6ff;
    }

    /* ── About panel ──────────────────────────────────────────── */
    #sim-about-panel {
      position: fixed;
      top: var(--nav-height);
      right: 0;
      bottom: 0;
      width: ${PANEL_WIDTH}px;
      max-width: 90vw;
      background: #161b22;
      border-left: 1px solid #30363d;
      z-index: 9998;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-y: auto;
      box-sizing: border-box;
    }

    #sim-about-panel.open {
      transform: translateX(0);
    }

    .about-section {
      padding: 24px 20px;
      border-bottom: 1px solid #21262d;
    }

    .about-section:last-child { border-bottom: none; }

    .about-section-label {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #8b949e;
      margin: 0 0 10px;
    }

    .about-title {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: #e6edf3;
      margin: 0 0 10px;
      line-height: 1.3;
    }

    .about-desc {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 0.875rem;
      color: #8b949e;
      line-height: 1.7;
      margin: 0;
    }

    .about-concepts {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .about-concept-tag {
      display: inline-block;
      padding: 3px 10px;
      background: rgba(31, 64, 104, 0.5);
      color: #58a6ff;
      border: 1px solid rgba(88, 166, 255, 0.2);
      border-radius: 99px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 0.78rem;
    }

    .about-controls-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .about-controls-list li {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 0.82rem;
      color: #8b949e;
      padding-left: 14px;
      position: relative;
    }

    .about-controls-list li::before {
      content: '›';
      position: absolute;
      left: 0;
      color: #58a6ff;
    }

    .about-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .about-badge {
      padding: 4px 10px;
      border-radius: 99px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge-beginner     { background: rgba(63,185,80,0.15);  color: #3fb950; }
    .badge-intermediate { background: rgba(210,153,34,0.15); color: #d2991e; }
    .badge-advanced     { background: rgba(248,81,73,0.15);  color: #f85149; }
    .badge-library      { background: #21262d; color: #8b949e; border: 1px solid #30363d; }

    /* ── Overlay (mobile) ─────────────────────────────────────── */
    #sim-about-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 9997;
    }

    #sim-about-overlay.open { display: block; }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── Gallery path (works from any depth) ──────────────────── */
  function galleryHref() {
    // Count how many path segments deep we are (ignoring trailing index.html)
    const parts = location.pathname.replace(/\/index\.html$/, '').split('/').filter(Boolean);
    // On GitHub Pages the repo is usually one segment: /repo-name/sim-slug/
    // We just need to go up one level from the sim folder.
    if (parts.length <= 1) return './'; // already at root
    return '../';
  }

  /* ── Escape HTML ─────────────────────────────────────────── */
  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Build nav ───────────────────────────────────────────── */
  function buildNav(meta) {
    const nav = document.createElement('nav');
    nav.id = 'sim-nav';
    nav.innerHTML = `
      <a class="nav-back" href="${galleryHref()}">
        ← Gallery
      </a>
      <span class="nav-divider"></span>
      <span class="nav-title">${esc(meta.title || document.title)}</span>
      <button class="nav-about-btn" id="nav-about-btn">About ↗</button>
    `;
    document.body.prepend(nav);
  }

  /* ── Build About panel ───────────────────────────────────── */
  function buildPanel(meta) {
    const panel = document.createElement('aside');
    panel.id = 'sim-about-panel';
    panel.setAttribute('aria-label', 'About this simulation');

    const concepts = (meta.physics_concepts || []);
    const controls = (meta.interactive_controls || []);
    const diff = meta.difficulty || 'intermediate';
    const lib  = meta.library || 'p5.js';

    const conceptsHtml = concepts.length
      ? `<div class="about-concepts">${concepts.map(c => `<span class="about-concept-tag">${esc(c)}</span>`).join('')}</div>`
      : '<p class="about-desc">—</p>';

    const controlsHtml = controls.length
      ? `<ul class="about-controls-list">${controls.map(c => `<li>${esc(c)}</li>`).join('')}</ul>`
      : '';

    panel.innerHTML = `
      <div class="about-section">
        <p class="about-section-label">Simulation</p>
        <h2 class="about-title">${esc(meta.title || '')}</h2>
        <p class="about-desc">${esc(meta.description || '')}</p>
      </div>

      <div class="about-section">
        <p class="about-section-label">Physics Concepts</p>
        ${conceptsHtml}
      </div>

      ${controlsHtml ? `
      <div class="about-section">
        <p class="about-section-label">Interactive Controls</p>
        ${controlsHtml}
      </div>` : ''}

      <div class="about-section">
        <p class="about-section-label">Details</p>
        <div class="about-badges">
          <span class="about-badge badge-${esc(diff)}">${esc(diff)}</span>
          <span class="about-badge badge-library">${esc(lib)}</span>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Overlay for mobile tap-to-close
    const overlay = document.createElement('div');
    overlay.id = 'sim-about-overlay';
    document.body.appendChild(overlay);
  }

  /* ── Wire toggle ─────────────────────────────────────────── */
  function wireToggle() {
    const btn     = document.getElementById('nav-about-btn');
    const panel   = document.getElementById('sim-about-panel');
    const overlay = document.getElementById('sim-about-overlay');

    function open() {
      panel.classList.add('open');
      overlay.classList.add('open');
      btn.classList.add('active');
      btn.textContent = 'About ✕';
    }

    function close() {
      panel.classList.remove('open');
      overlay.classList.remove('open');
      btn.classList.remove('active');
      btn.textContent = 'About ↗';
    }

    btn.addEventListener('click', () => panel.classList.contains('open') ? close() : open());
    overlay.addEventListener('click', close);

    // Close on Escape key
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ── Boot ────────────────────────────────────────────────── */
  function init(meta) {
    buildNav(meta);
    buildPanel(meta);
    wireToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  function boot() {
    fetch('./meta.json')
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(meta => init(meta))
      .catch(() => init({ title: document.title })); // graceful fallback
  }

})();
