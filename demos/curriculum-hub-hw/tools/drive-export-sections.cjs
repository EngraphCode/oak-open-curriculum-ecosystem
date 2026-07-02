#!/usr/bin/env node
/*
 * SPA-drive of the canonical export's Oak Course player: serve the export over local HTTP (the
 * .dc.html fetches data + hydrates via _ds_bundle.js, so file:// is CORS-blocked — the
 * render-canonical-targets.cjs recipe), open each target module in the export's own sidebar, click
 * the target section row, settle, and capture the main content region. These captures are the
 * AUTHORITATIVE per-block visual targets for the interactive block-styling pass (quiz / flip /
 * accordion / stats / compare / sortable / hotspot / tabs / videoimport / columns) plus the bottom
 * prev/next controls treatment. Run from the repo root:
 *
 *   node <this-script> [--out <dir>]   (default out: demos/curriculum-hub-hw/demo-evidence/export-sections)
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const requireFromRepo = createRequire(path.join(process.cwd(), 'package.json'));
const { chromium } = requireFromRepo('@playwright/test');

const EXPORT_DIR = path.resolve(
  process.cwd(),
  'demos/curriculum-hub-hw/claude-design-canonical-export',
);
const outFlag = process.argv.indexOf('--out');
const OUT_DIR =
  outFlag !== -1
    ? path.resolve(process.argv[outFlag + 1])
    : path.resolve(process.cwd(), 'demos/curriculum-hub-hw/demo-evidence/export-sections');

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

// One representative section per interactive block type (census from oak-course.generated.ts),
// keyed by the module + section TITLES the export sidebar renders.
const TARGETS = [
  { module: 'Oak lessons', section: 'Why Oak lessons matter', slug: 'u1m1s1-flip-stats' },
  { module: 'Oak lessons', section: 'The eight lesson components', slug: 'u1m1s2-accordion' },
  { module: 'Oak lessons', section: 'Lesson structure & vocabulary', slug: 'u1m1s4-tabs' },
  { module: 'Oak lessons', section: 'Knowledge check', slug: 'u1m1s5-quiz' },
  { module: 'Core considerations', section: 'Accessibility & scaffolding', slug: 'u1m3s2-compare' },
  { module: 'Practice', section: 'Quality practice', slug: 'u3m1s1-columns' },
  { module: 'The learning framework', section: 'What is the learning framework?', slug: 'm1s2-videoimport' },
  { module: 'The learning framework', section: 'Order the stages', slug: 'm1s3check-sortable' },
  { module: 'The learning framework', section: 'When do the stages happen?', slug: 'm1s4-hotspot' },
];

function serveExport() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const filePath = path.join(EXPORT_DIR, urlPath === '/' ? 'Oak Course.dc.html' : urlPath);
    if (!filePath.startsWith(EXPORT_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, {
      'content-type': CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream',
    });
    fs.createReadStream(filePath).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const server = await serveExport();
  const port = server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 2200 }, deviceScaleFactor: 2 });
  await page.goto(`http://127.0.0.1:${port}/Oak%20Course.dc.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);

  const aside = page.locator('aside[aria-label="Course navigation"]');
  let failures = 0;
  for (const target of TARGETS) {
    try {
      // Module headers carry aria-expanded (their accessible name is "<n> <title> >"); section
      // rows carry aria-current — the attributes discriminate where name matching cannot.
      const moduleButton = aside
        .locator('button[aria-expanded]')
        .filter({ hasText: target.module })
        .first();
      const expanded = await moduleButton.getAttribute('aria-expanded');
      if (expanded !== 'true') {
        await moduleButton.click();
        await page.waitForTimeout(250);
      }
      await aside
        .locator('button[aria-current]')
        .filter({ hasText: target.section })
        .first()
        .click();
      await page.waitForTimeout(700); // section swap + entry animations
      const main = page.locator('#main');
      await main.screenshot({ path: path.join(OUT_DIR, `export-${target.slug}.png`) });
      console.log(`PASS capture: ${target.slug}`);
    } catch (error) {
      failures += 1;
      console.error(`FAIL capture ${target.slug}: ${String(error).slice(0, 200)}`);
    }
  }

  // The bottom prev/next controls treatment: scroll the last-captured section's main to the bottom.
  try {
    await page.evaluate(() => {
      const main = document.querySelector('#main');
      if (main) main.scrollTop = main.scrollHeight;
    });
    await page.waitForTimeout(400);
    await page.locator('#main').screenshot({ path: path.join(OUT_DIR, 'export-bottom-controls.png') });
    console.log('PASS capture: bottom-controls');
  } catch (error) {
    failures += 1;
    console.error(`FAIL capture bottom-controls: ${String(error).slice(0, 200)}`);
  }

  await browser.close();
  server.close();
  console.log(failures === 0 ? 'RESULT: ALL CAPTURED' : `RESULT: ${failures} FAILURES`);
  process.exitCode = failures === 0 ? 0 : 1;
})().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
});
