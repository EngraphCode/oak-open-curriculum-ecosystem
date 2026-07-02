#!/usr/bin/env node
/*
 * Re-runnable §D visual-fidelity capture of the LIVE running demo (the Next.js app), at the
 * §D matched-width standard (1440 CSS px), -> demo-evidence/ as full-page + above-the-fold PNGs.
 * These are the live-side captures that compare against the canonical-export render targets
 * produced by the sibling `render-canonical-targets.cjs` (which renders the EXPORT, not the app).
 *
 * WHY a SEPARATE tool from render-canonical-targets.cjs (do not merge them):
 *  - That tool serves the static .dc.html export over local HTTP and waits for `networkidle`.
 *  - THIS tool drives the RUNNING demo (default http://127.0.0.1:3010, `pnpm dev --webpack`).
 *    `next dev` holds an HMR websocket open for the page's lifetime, so `networkidle` NEVER fires
 *    and a networkidle wait times out. The cure (verified first-hand, carried across the data-lane
 *    cast — was loss-prone scratchpad-only until this file) is `waitUntil: 'domcontentloaded'`
 *    (the App-Router pages are server-rendered, so the content HTML is present at DCL), THEN
 *    `document.fonts.ready` (Lexend) + disable animations + a short settle, THEN screenshot.
 *
 * CORRECTNESS MECHANISM (matches the sibling, and is why there is no separate unit test at this
 * tools/ level): the run is self-validating. Each capture is checked for a real (non-blank) render
 * — HTTP 200 + body scrollHeight + visible text length above thresholds — and the process exits
 * non-zero with SUSPECT if any target looks blank. The "test" for an evidence-generation tool is
 * "did it produce a non-blank capture", enforced live on every run.
 *
 * §D GEOMETRY: the viewport width is the CSS LAYOUT width (heading wrap, max-widths, breakpoints).
 * The PNG pixel dimensions are width × deviceScaleFactor (2). Compare wrap/layout against a
 * canonical target only with both captures' CSS width + dSF known; never compare raw pixel dims.
 *
 * PLACEMENT (matches render-canonical-targets.cjs, Director-ratified): lives at the demo-family
 * tools/ level, NOT inside the oak-curriculum-hub workspace, because it needs Playwright which
 * lives at the repo root (a demo devDep would be a disproportionate heavy dep). It resolves
 * @playwright/test via Node's upward node_modules walk, so run it from anywhere in the repo tree.
 *
 * PREREQUISITE: the demo dev server must already be running (coordinate the :3010 port with the
 * styling lane before starting one). This tool does NOT start the server — it connects to it, so a
 * single running server is shared and there is no two-dev-server clash. If nothing is listening it
 * fails fast with a clear message.
 *
 * USAGE:
 *   # start the demo first (from the app dir): pnpm dev   (serves :3010)
 *   node demos/curriculum-hub-hw/tools/capture-live-demo.cjs
 *   node demos/curriculum-hub-hw/tools/capture-live-demo.cjs --routes /course,/standards --width 1440
 *   BASE_URL=http://127.0.0.1:3011 node demos/curriculum-hub-hw/tools/capture-live-demo.cjs
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const OUT_DIR = path.resolve(__dirname, '..', 'demo-evidence');

/** The stable content routes that exist and are §D-capturable by default. Dynamic/placeholder
 *  routes (/course pre-assembly, /lesson/[slug]) are opt-in via --routes so a default run never
 *  silently captures a placeholder as if it were the real page. */
const DEFAULT_ROUTES = ['/', '/standards', '/rubrics', '/exemplars', '/wiki'];

/** Slug a route into an output basename: '/' -> 'home', '/standards' -> 'standards',
 *  '/lesson/[slug]' -> 'lesson-slug'. */
function routeToBase(route) {
  const trimmed = route.replace(/^\/+|\/+$/g, '');
  if (trimmed === '') return 'home';
  return trimmed.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

/** Resolve the viewport CSS width (§D standard 1440). Override: `--width 1280` or WIDTH=1280. */
function resolveWidth(argv, env) {
  const flagIdx = argv.indexOf('--width');
  const fromFlag = flagIdx !== -1 ? argv[flagIdx + 1] : undefined;
  const raw = fromFlag ?? env.WIDTH;
  const width = raw ? Number.parseInt(raw, 10) : 1440;
  if (!Number.isInteger(width) || width < 320 || width > 5000) {
    throw new Error(`invalid --width ${JSON.stringify(raw)} (expected integer 320..5000)`);
  }
  return width;
}

/** Resolve the base URL of the running demo (default :3010). Override: `--base <url>` or BASE_URL. */
function resolveBase(argv, env) {
  const flagIdx = argv.indexOf('--base');
  const fromFlag = flagIdx !== -1 ? argv[flagIdx + 1] : undefined;
  return (fromFlag ?? env.BASE_URL ?? 'http://127.0.0.1:3010').replace(/\/+$/, '');
}

/** Resolve the route list (default DEFAULT_ROUTES). Override: `--routes /a,/b`. */
function resolveRoutes(argv) {
  const flagIdx = argv.indexOf('--routes');
  const raw = flagIdx !== -1 ? argv[flagIdx + 1] : undefined;
  if (!raw) return DEFAULT_ROUTES;
  return raw
    .split(',')
    .map((r) => r.trim())
    .filter((r) => r !== '')
    .map((r) => (r.startsWith('/') ? r : `/${r}`));
}

/** Blank-render classifier: a real page is HTTP 200 with meaningful body height AND visible text.
 *  Returns true when the capture is SUSPECT (looks blank / a placeholder). Pure — the self-check. */
function isSuspect(status, bodyHeight, textLength) {
  return !(status === 200 && bodyHeight > 400 && textLength > 200);
}

async function assertServerUp(base) {
  try {
    const res = await fetch(base, { method: 'GET' });
    // any HTTP response (even a 404 for '/') proves something is listening
    return res.status;
  } catch (e) {
    throw new Error(
      `no demo server reachable at ${base}. Start it first (from the app dir: pnpm dev -> :3010) ` +
        `and coordinate the port with the styling lane, or pass --base <url>. cause: ${e && e.message}`,
    );
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const width = resolveWidth(argv, process.env);
  const base = resolveBase(argv, process.env);
  const routes = resolveRoutes(argv);

  await assertServerUp(base);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`live demo base = ${base}`);
  console.log(`viewport CSS width = ${width}px (deviceScaleFactor 2 -> ${width * 2}px PNGs)`);
  console.log(`routes = ${routes.join(', ')}`);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  let suspect = false;
  try {
    for (const route of routes) {
      const b = routeToBase(route);
      // domcontentloaded, NOT networkidle — next dev's HMR websocket keeps the network busy forever.
      const resp = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.evaluate(() => (document.fonts ? document.fonts.ready : null));
      await page.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });
      await page.waitForTimeout(2000); // settle: hydration + font swap + late layout
      const m = await page.evaluate(() => ({
        h: document.body.scrollHeight,
        len: (document.body.innerText || '').length,
      }));
      const status = resp ? resp.status() : 0;
      const bad = isSuspect(status, m.h, m.len);
      console.log(`${route}: HTTP=${status} bodyH=${m.h} textLen=${m.len} -> ${bad ? 'SUSPECT (blank/placeholder?)' : 'OK'}`);
      if (bad) suspect = true;
      await page.screenshot({ path: path.join(OUT_DIR, `${b}-live.png`), fullPage: true });
      await page.screenshot({ path: path.join(OUT_DIR, `${b}-live-abovefold.png`), fullPage: false });
      console.log(`  wrote ${b}-live.png + ${b}-live-abovefold.png`);
    }
  } finally {
    await browser.close();
  }

  if (suspect) {
    console.error('CAPTURE SUSPECT: a target looked blank/placeholder — investigate before trusting the PNGs');
    process.exit(1);
  }
  console.log('live capture complete -> demo-evidence/');
}

module.exports = { routeToBase, resolveWidth, resolveBase, resolveRoutes, isSuspect };

if (require.main === module) {
  main().catch((e) => {
    console.error('CAPTURE FAIL:', e && e.stack ? e.stack : e);
    process.exit(1);
  });
}
