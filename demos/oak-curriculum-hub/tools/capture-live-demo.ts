/*
 * Re-runnable §D visual-fidelity capture of the LIVE running demo (the Next.js app), at the
 * §D matched-width standard (1440 CSS px), -> demo-evidence/ as full-page + above-the-fold PNGs.
 * These are the live-side captures that compare against the canonical-export render targets
 * produced by the sibling `render-canonical-targets.ts` (which renders the EXPORT, not the app).
 *
 * WHY a SEPARATE tool from render-canonical-targets.ts (do not merge them):
 *  - That tool serves the static .dc.html export over local HTTP and waits for `networkidle`.
 *  - THIS tool drives the RUNNING demo (default http://localhost:3010, `pnpm dev`).
 *    `next dev` holds an HMR websocket open for the page's lifetime, so `networkidle` NEVER fires
 *    and a networkidle wait times out. The cure (verified first-hand, carried across the data-lane
 *    cast) is `waitUntil: 'domcontentloaded'` (the App-Router pages are server-rendered, so the
 *    content HTML is present at DCL), THEN `document.fonts.ready` (Lexend) + disable animations +
 *    a short settle, THEN screenshot.
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
 * PLACEMENT: a workspace-internal dev tool of @oaknational/oak-curriculum-hub — `tsx` and
 * `@playwright/test` are workspace devDependencies, so the tool is first-class TypeScript under
 * the workspace's own strict gates (type-check + lint cover tools/).
 *
 * PREREQUISITE: the demo dev server must already be running (coordinate the :3010 port with the
 * styling lane before starting one). This tool does NOT start the server — it connects to it, so a
 * single running server is shared and there is no two-dev-server clash. If nothing is listening it
 * fails fast with a clear message.
 *
 * USAGE:
 *   # start the demo first (from the app dir): pnpm dev   (serves :3010)
 *   pnpm --filter @oaknational/oak-curriculum-hub tool:capture
 *   pnpm --filter @oaknational/oak-curriculum-hub tool:capture -- --routes /course,/standards --width 1440
 *   # direct form, from the repo root:
 *   BASE_URL=http://localhost:3011 tsx demos/oak-curriculum-hub/tools/capture-live-demo.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';
import type { Page } from '@playwright/test';
import { ok, err, type Result } from '@oaknational/result';

import {
  isSuspect,
  isUnhydrated,
  resolveBase,
  resolveRoutes,
  resolveWidth,
  routeToBase,
} from './capture-checks';
import { describeThrown, runTool } from '@oaknational/fidelity-review/support';

const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(TOOLS_DIR, '..', 'demo-evidence');

export async function assertServerUp(base: string): Promise<Result<number, Error>> {
  try {
    const res = await fetch(base, { method: 'GET' });
    // any HTTP response (even a 404 for '/') proves something is listening
    return ok(res.status);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return err(
      new Error(
        `no demo server reachable at ${base}. Start it first (from the app dir: pnpm dev -> :3010) ` +
          `and coordinate the port with the styling lane, or pass --base <url>. cause: ${message}`,
        { cause: error },
      ),
    );
  }
}

function verdictFor(blank: boolean, unhydrated: boolean): string {
  if (blank) {
    return 'SUSPECT (blank/placeholder?)';
  }
  if (unhydrated) {
    return 'SUSPECT (UNHYDRATED — player never mounted; use a localhost base, 127.0.0.1 blocks dev chunks)';
  }
  return 'OK';
}

/** Capture one route (full-page + above-the-fold PNGs); returns true when the capture is bad. */
async function captureRoute(page: Page, base: string, route: string): Promise<boolean> {
  const outBase = routeToBase(route);
  // domcontentloaded, NOT networkidle — next dev's HMR websocket keeps the network busy forever.
  const resp = await page.goto(`${base}${route}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });
  await page.waitForTimeout(2000); // settle: hydration + font swap + late layout
  const m = await page.evaluate(() => ({
    h: document.body.scrollHeight,
    len: document.body.innerText.length,
    hidden: document.querySelectorAll('[hidden]').length,
  }));
  // A null goto response means SAME-DOCUMENT navigation (a #hash route on an already-loaded
  // page) — Playwright returns null there rather than an HTTP response, and a genuine load
  // failure throws instead. Treat it as the already-delivered 200, not an HTTP=0 suspect.
  const status = resp === null ? 200 : resp.status();
  const blank = isSuspect(status, m.h, m.len);
  const unhydrated = isUnhydrated(route, m.hidden);
  process.stdout.write(
    `${route}: HTTP=${status} bodyH=${m.h} textLen=${m.len} hidden=${m.hidden} -> ${verdictFor(blank, unhydrated)}\n`,
  );
  await page.screenshot({ path: path.join(OUT_DIR, `${outBase}-live.png`), fullPage: true });
  await page.screenshot({
    path: path.join(OUT_DIR, `${outBase}-live-abovefold.png`),
    fullPage: false,
  });
  process.stdout.write(`  wrote ${outBase}-live.png + ${outBase}-live-abovefold.png\n`);
  return blank || unhydrated;
}

function logRunHeader(base: string, width: number, routes: readonly string[]): void {
  process.stdout.write(`live demo base = ${base}\n`);
  process.stdout.write(
    `viewport CSS width = ${width}px (deviceScaleFactor 2 -> ${width * 2}px PNGs)\n`,
  );
  process.stdout.write(`routes = ${routes.join(', ')}\n`);
}

/** Drive every route through one browser context; true when any capture is bad. */
export async function runCaptures(
  base: string,
  width: number,
  routes: readonly string[],
): Promise<boolean> {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  let suspect = false;
  try {
    for (const route of routes) {
      suspect = (await captureRoute(page, base, route)) || suspect;
    }
  } finally {
    await browser.close();
  }
  return suspect;
}

async function main(): Promise<Result<void, string>> {
  const argv = process.argv.slice(2);
  const widthRes = resolveWidth(argv, process.env);
  if (!widthRes.ok) {
    return err(`CAPTURE FAIL: ${describeThrown(widthRes.error)}`);
  }
  const base = resolveBase(argv, process.env);
  const routes = resolveRoutes(argv);

  const up = await assertServerUp(base);
  if (!up.ok) {
    return err(`CAPTURE FAIL: ${describeThrown(up.error)}`);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  logRunHeader(base, widthRes.value, routes);

  const suspect = await runCaptures(base, widthRes.value, routes);
  if (suspect) {
    return err(
      'CAPTURE SUSPECT: a target looked blank/placeholder — investigate before trusting the PNGs',
    );
  }
  process.stdout.write('live capture complete -> demo-evidence/\n');
  return ok(undefined);
}

const invokedPath = process.argv.at(1);
if (invokedPath !== undefined && path.resolve(invokedPath) === fileURLToPath(import.meta.url)) {
  await runTool(main, (error) => `CAPTURE FAIL: ${describeThrown(error)}`);
}
