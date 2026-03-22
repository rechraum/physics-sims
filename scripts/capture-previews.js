/**
 * capture-previews.js
 *
 * Captures a preview.webp screenshot for each simulation.
 *
 * Usage (from repo root):
 *   1. Start a local server:  python -m http.server 8000
 *   2. Run this script:       node scripts/capture-previews.js
 *
 * Outputs: <slug>/preview.webp for each sim listed in SLUGS.
 * Re-run any time you want to refresh the screenshots.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:8000';
const REPO_ROOT = path.resolve(__dirname, '..');

// Settle time in ms — how long to wait after page load before screenshotting.
// Increase for sims that take longer to render something interesting.
const SETTLE_MS = {
  default:              2500,
  'lorenz-attractor':   4000,  // 3D WEBGL takes longer to build up
  'three-body':         3000,
  'double-pendulum-array': 3000,
  'diffusion-levy-flights': 3000,
  'wave-interference':      2000,
};

const ALL_SLUGS = [
  'diffusion-levy-flights',
  'double-pendulum-array',
  'dripping-faucet',
  'energy-landscape',
  'gravity-well',
  'kicked-pendulum',
  'lorenz-attractor',
  'oscillator-phase-space',
  'relational-network',
  'three-body',
  'tunable-mass-damper',
  'wave-interference',
];

// Optional: pass one or more slug names as CLI args to capture only those sims.
//   node scripts/capture-previews.js wave-interference
//   node scripts/capture-previews.js lorenz-attractor three-body
const cliArgs = process.argv.slice(2);
const SLUGS = cliArgs.length > 0 ? cliArgs : ALL_SLUGS;

// Viewport for screenshots — 16:9ish, good for card thumbnails
const VIEWPORT = { width: 1024, height: 640 };

async function capture(browser, slug) {
  const url = `${BASE_URL}/${slug}/`;
  const outPath = path.join(REPO_ROOT, slug, 'preview.webp');
  const settle = SETTLE_MS[slug] ?? SETTLE_MS.default;

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, settle));
    await page.screenshot({ path: outPath, type: 'webp', quality: 85 });
    console.log(`  ✓ ${slug}`);
  } catch (err) {
    console.error(`  ✗ ${slug}: ${err.message}`);
  } finally {
    await page.close();
  }
}

(async () => {
  console.log('Launching browser…');
  const browser = await puppeteer.launch({ headless: true });

  console.log(`Capturing ${SLUGS.length} sims…`);
  // Run sequentially to avoid hammering the local server
  for (const slug of SLUGS) {
    await capture(browser, slug);
  }

  await browser.close();
  console.log('\nDone. Commit the preview.webp files in each sim folder.');
})();
