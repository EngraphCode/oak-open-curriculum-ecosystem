#!/usr/bin/env node
/*
 * Re-runnable 320px reflow measurement of the LIVE running demo (WCAG 1.4.10): every route's
 * document + body scrollWidth must fit the 320 CSS px viewport, INCLUDING the header disclosure's
 * open state. This is the §E reflow gate's tool-of-record (item 8's demo-wide bar), conserved from
 * the styling lane's slice verification (Peregrine, 2026-07-02) into the capture-tool family.
 *
 * HYDRATION HONESTY (the vacuous-click cure — keep this loop): a click on the pre-hydration SSR
 * toggle has no handler and silently does nothing, which makes a naive "menu-open OK" measurement
 * vacuous. The loop clicks UNTIL aria-expanded actually flips (bounded attempts), so an unhydrated
 * page fails loud instead of passing an open-state check that never opened anything. Sibling of
 * capture-live-demo.cjs's hidden-attribute hydration witness: that tool proves capture-side
 * hydration, this one proves interaction-side hydration.
 *
 * CORRECTNESS MECHANISM (tools/ convention, no unit test): the run is self-validating — any route
 * overflow, or a menu that never opens, exits non-zero with the failing measurement printed.
 *
 * PREREQUISITE: the demo dev server must already be running (this tool connects, never starts).
 * The default base host is `localhost`, NOT `127.0.0.1` — next dev blocks cross-origin dev
 * resources from 127.0.0.1, so hydration chunks never load there (team finding, 2026-07-02).
 *
 * USAGE:
 *   node demos/curriculum-hub-hw/tools/measure-320.cjs
 *   node demos/curriculum-hub-hw/tools/measure-320.cjs --base http://localhost:3011 --routes /,/course
 *   node demos/curriculum-hub-hw/tools/measure-320.cjs --width 360   # measure another breakpoint
 */
const path = require('path');
const { chromium } = require('@playwright/test');

const OUT_DIR = path.resolve(__dirname, '..', 'demo-evidence');
// NOTE (recorded gap): every route is measured in its IDLE state — no query is
// seeded, so results-state reflow (e.g. /curriculum with live hits) is NOT
// covered by this tool; the per-slice live drives carry that verification.
const DEFAULT_ROUTES = ['/', '/course', '/standards', '/exemplars', '/wiki', '/curriculum'];
// The toggle's accessible name (kept distinct from the panel landmark 'Hub sections menu' —
// item-10 backlog fold). Update BOTH here and in SiteNav.test.tsx if the name ever moves again.
const MENU_TOGGLE_NAME = 'Hub sections';

function argValue(argv, flag, fallback) {
  const idx = argv.indexOf(flag);
  return idx !== -1 ? argv[idx + 1] : fallback;
}

function resolveWidth(argv) {
  const width = Number.parseInt(argValue(argv, '--width', '320'), 10);
  if (!Number.isInteger(width) || width < 240 || width > 5000) {
    throw new Error(`invalid --width (expected integer 240..5000, got ${width})`);
  }
  return width;
}

function resolveRoutes(argv) {
  const raw = argValue(argv, '--routes', undefined);
  if (!raw) return DEFAULT_ROUTES;
  return raw
    .split(',')
    .map((r) => r.trim())
    .filter((r) => r !== '')
    .map((r) => (r.startsWith('/') ? r : `/${r}`));
}

/** True when the measured widths overflow the viewport (the WCAG 1.4.10 failure signal). Pure. */
function overflows(docWidth, bodyWidth, innerWidth) {
  return docWidth > innerWidth || bodyWidth > innerWidth;
}

/** Routes whose hydrated layout differs from SSR (the paginated player gates its sections). The
 *  hydrated pass WAITS for the gating witness on these, so the measurement never races the
 *  hydration boundary (the nondeterminism that let a no-JS-only overflow slip past a fast run). */
const HYDRATION_GATED_ROUTES = ['/course'];

async function measureRoute(page, base, route, hydrated) {
  await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => (document.fonts ? document.fonts.ready : null));
  if (hydrated && HYDRATION_GATED_ROUTES.includes(route)) {
    // Deterministic hydrated state: the gates add [hidden] attributes on mount.
    await page
      .waitForFunction(() => document.querySelectorAll('[hidden]').length > 0, { timeout: 10000 })
      .catch(() => {
        console.error(`${route}: hydration witness never appeared — check the base host`);
      });
  }
  await page.waitForTimeout(400);
  return page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
    inner: window.innerWidth,
  }));
}

/** One measurement pass over every route in a single browser context. The NO-JS pass measures the
 *  SSR fallback (a designed user state — progressive enhancement); the HYDRATED pass measures the
 *  enhanced state. Both must be reflow-clean: a failure in either is a real WCAG 1.4.10 failure. */
async function measurePass(browser, { js, label, base, routes, width }) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 2,
    javaScriptEnabled: js,
  });
  const page = await ctx.newPage();
  let failed = false;
  try {
    for (const route of routes) {
      const m = await measureRoute(page, base, route, js);
      const bad = overflows(m.doc, m.body, m.inner);
      if (bad) failed = true;
      console.log(
        `${route} [${label}]: docScrollW=${m.doc} bodyScrollW=${m.body} innerW=${m.inner} -> ${bad ? 'OVERFLOW' : 'OK'}`,
      );
    }
  } finally {
    await ctx.close();
  }
  return failed;
}

/** Click the disclosure toggle until aria-expanded flips (bounded) — the vacuous-click cure. */
async function openMenuHydrated(page) {
  const toggle = page.getByRole('button', { name: MENU_TOGGLE_NAME });
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await toggle.click();
    await page.waitForTimeout(300);
    if ((await toggle.getAttribute('aria-expanded')) === 'true') {
      return true;
    }
  }
  return false;
}

async function main() {
  const argv = process.argv.slice(2);
  const width = resolveWidth(argv);
  const base = argValue(argv, '--base', process.env.BASE_URL ?? 'http://localhost:3010').replace(
    /\/+$/,
    '',
  );
  const routes = resolveRoutes(argv);

  console.log(`base = ${base}; viewport CSS width = ${width}px; routes = ${routes.join(', ')}`);
  const browser = await chromium.launch({ headless: true });
  let failed = false;
  try {
    // Two deterministic passes: the SSR fallback first (no JS — nothing to race),
    // then the hydrated state (with the gating witness awaited where it applies).
    failed = (await measurePass(browser, { js: false, label: 'no-js', base, routes, width })) || failed;
    failed = (await measurePass(browser, { js: true, label: 'hydrated', base, routes, width })) || failed;

    // Header disclosure open state (home page): hydrated by definition — proven
    // via the click-until-flipped loop, then measured + captured.
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.evaluate(() => (document.fonts ? document.fonts.ready : null));
    if (!(await openMenuHydrated(page))) {
      console.error('menu never opened — hydration never attached the handler (check the base host)');
      failed = true;
    } else {
      const open = await page.evaluate(() => ({
        doc: document.documentElement.scrollWidth,
        inner: window.innerWidth,
      }));
      const bad = open.doc > open.inner;
      if (bad) failed = true;
      console.log(`/ (menu open) [hydrated]: docScrollW=${open.doc} innerW=${open.inner} -> ${bad ? 'OVERFLOW' : 'OK'}`);
      await page.screenshot({ path: path.join(OUT_DIR, `home-live-${width}-menu-open.png`) });
      await page.getByRole('button', { name: MENU_TOGGLE_NAME }).click();
      await page.screenshot({ path: path.join(OUT_DIR, `home-live-${width}.png`) });
    }
    await ctx.close();
  } finally {
    await browser.close();
  }

  if (failed) {
    console.error(`REFLOW FAILURE at ${width}px`);
    process.exit(1);
  }
  console.log(`ALL ROUTES REFLOW CLEAN AT ${width}`);
}

module.exports = { overflows, resolveWidth, resolveRoutes };

if (require.main === module) {
  main().catch((e) => {
    console.error('MEASURE FAIL:', e && e.stack ? e.stack : e);
    process.exit(1);
  });
}
