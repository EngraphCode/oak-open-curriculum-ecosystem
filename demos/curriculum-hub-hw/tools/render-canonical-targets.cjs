#!/usr/bin/env node
/*
 * Re-runnable render of the Claude Design canonical-export pages that LACK an in-export
 * screenshot (Oak Hub, Oak Standards) -> demo-evidence/ as full-page + above-the-fold PNGs.
 * These are the visual-match targets the styling lane needs for DoD §D (Course + Learning
 * Framework already ship in-export targets: screenshots/coursemap.png / check.png / framework-img.png).
 *
 * WHY a server + headless browser (the prior "headless-blank / file:// blocked" wall):
 * the .dc.html is NOT static — it is an <x-dc> custom element hydrated at runtime by
 * _ds_bundle.js, plus a <meta name="ext-resource-dependency" content="data/quality-standards.json">
 * that the bundle FETCHES. Over file:// that fetch is CORS-blocked, so the bundle never renders
 * -> blank page. Cure: serve the export dir over local HTTP (relative assets + the fetch resolve),
 * render with a JS-capable headless browser, wait for networkidle + document.fonts.ready (Lexend),
 * then screenshot. Deterministic / byte-stable, so it is the render arm of the canonical-export
 * sync loop: fresh export -> re-run this -> re-diff the PNGs.
 *
 * Placement (Director-ratified, PDR: export-sync TOOLING, not demo app code): lives at the demo
 * family / repo-tooling level, NOT inside the oak-curriculum-hub workspace, because it needs
 * Playwright which lives at the repo root (adding it as a demo devDep is a disproportionate heavy
 * dep on a demo). It resolves @playwright/test via Node's upward node_modules walk, so run it from
 * anywhere inside the repo tree:
 *
 *   node demos/curriculum-hub-hw/tools/render-canonical-targets.cjs
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const EXPORT_DIR = path.resolve(__dirname, '..', 'claude-design-canonical-export');
const OUT_DIR = path.resolve(__dirname, '..', 'demo-evidence');

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
};

const TARGETS = [
  { file: 'Oak Hub.dc.html', base: 'hub-canonical-render' },
  { file: 'Oak Standards.dc.html', base: 'standards-canonical-render' },
];

/**
 * Viewport CSS width for the render. This is the LAYOUT width (heading wrap, max-widths, breakpoints)
 * — distinct from the PNG's pixel dimensions, which are width × deviceScaleFactor. Default 1440 is the
 * §D matched-width standard so the canonical targets compare apples-to-apples with a 1440 live capture.
 * Override: `--width 1280` or `RENDER_WIDTH=1280`.
 */
function resolveWidth() {
  const flagIdx = process.argv.indexOf('--width');
  const fromFlag = flagIdx !== -1 ? process.argv[flagIdx + 1] : undefined;
  const raw = fromFlag ?? process.env.RENDER_WIDTH;
  const width = raw ? Number.parseInt(raw, 10) : 1440;
  if (!Number.isInteger(width) || width < 320 || width > 5000) {
    console.error(`invalid --width ${JSON.stringify(raw)} (expected 320..5000)`);
    process.exit(1);
  }
  return width;
}

function serveDir(dir) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const full = path.join(dir, urlPath.replace(/^\/+/, ''));
    if (!full.startsWith(dir) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { 'content-type': CONTENT_TYPES[path.extname(full).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(full).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function main() {
  if (!fs.existsSync(EXPORT_DIR)) {
    console.error(`export dir not found: ${EXPORT_DIR}`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const server = await serveDir(EXPORT_DIR);
  const base = `http://127.0.0.1:${server.address().port}`;
  console.log(`serving ${EXPORT_DIR} at ${base}`);

  const width = resolveWidth();
  console.log(`viewport CSS width = ${width}px (deviceScaleFactor 2 → ${width * 2}px PNGs)`);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  let suspect = false;
  for (const t of TARGETS) {
    const resp = await page.goto(`${base}/${encodeURIComponent(t.file)}`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(() => (document.fonts ? document.fonts.ready : null));
    await page.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });
    await page.waitForTimeout(2000);
    const m = await page.evaluate(() => ({ h: document.body.scrollHeight, len: (document.body.innerText || '').length }));
    const status = resp ? resp.status() : 0;
    const ok = status === 200 && m.h > 400 && m.len > 200;
    console.log(`${t.file}: HTTP=${status} bodyH=${m.h} textLen=${m.len} -> ${ok ? 'OK' : 'SUSPECT (blank?)'}`);
    if (!ok) suspect = true;
    await page.screenshot({ path: path.join(OUT_DIR, `${t.base}.png`), fullPage: true });
    await page.screenshot({ path: path.join(OUT_DIR, `${t.base}-abovefold.png`), fullPage: false });
    console.log(`  wrote ${t.base}.png + ${t.base}-abovefold.png`);
  }
  await browser.close();
  server.close();
  if (suspect) {
    console.error('RENDER SUSPECT: a target looked blank (low bodyH/textLen) — investigate before trusting the PNGs');
    process.exit(1);
  }
  console.log('render complete -> demo-evidence/');
}

main().catch((e) => {
  console.error('RENDER FAIL:', e && e.stack ? e.stack : e);
  process.exit(1);
});
