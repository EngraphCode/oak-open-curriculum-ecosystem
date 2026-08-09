/*
 * The live-capture arm of the fidelity review: drive the RUNNING showcase
 * (default http://localhost:3020, `pnpm dev`) and write one PNG per
 * declared pair into demo-evidence/, at the pair's declared path (named by
 * pair id — the naming-ratchet-safe convention). Pairs sharing a live route
 * are captured from one page load.
 *
 * `waitUntil: 'domcontentloaded'`, NOT networkidle: `next dev` holds an HMR
 * websocket open for the page's lifetime, so networkidle never fires (the
 * hub's carried first-hand cure). Then `document.fonts.ready` + disable
 * animations + a short settle, THEN screenshot.
 *
 * CORRECTNESS MECHANISM (the hub's, carried; why there is no unit test at
 * this driving level): the run is self-validating — each capture is
 * checked for a real (non-blank) render and the run fails loud on any
 * suspect capture rather than diffing a wrong target. The pure policy it
 * applies (blank classification, base/width resolution) lives in
 * capture-checks.ts and is unit-tested there.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';
import type { Page } from '@playwright/test';

import {
  isAllowedRequestUrl,
  isSuspect,
  MATCHED_GEOMETRY_SCALE,
} from '@oaknational/fidelity-review/capture-flags';
import {
  captureShot,
  createOriginGuard,
  settleForCapture,
} from '@oaknational/fidelity-review/capture-settle';
import type { FidelityPair } from './fidelity-pairs';

const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEMO_DIR = path.resolve(TOOLS_DIR, '..');

/** Capture every pair declared on one live route from a single page load;
 *  true when the capture looks blank. */
async function captureRoute(
  page: Page,
  base: string,
  route: string,
  pairs: readonly FidelityPair[],
): Promise<boolean> {
  const resp = await page.goto(`${base}${route}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  // The shared settle runs once here so the blank measurement reads a
  // settled page; captureShot settles again per shot (idempotent —
  // fonts resolve instantly, the animation kill re-applies) so the
  // shutter can never fire unsettled.
  await settleForCapture(page);
  const m = await page.evaluate(() => ({
    h: document.body.scrollHeight,
    len: document.body.innerText.length,
  }));
  const status = resp === null ? 200 : resp.status();
  const blank = isSuspect(status, m.h, m.len);
  process.stdout.write(
    `${route}: HTTP=${status} bodyH=${m.h} textLen=${m.len} -> ${blank ? 'SUSPECT (blank/placeholder?)' : 'OK'}\n`,
  );
  for (const pair of pairs) {
    const out = path.resolve(DEMO_DIR, pair.livePng);
    const bytes = await captureShot(page, { fullPage: pair.kind !== 'page-abovefold' });
    fs.writeFileSync(out, bytes);
    process.stdout.write(`  wrote ${pair.livePng}\n`);
  }
  return blank;
}

/** Drive every declared pair through one browser context, grouped by route;
 *  true when any capture is bad. */
export async function captureLivePages(
  base: string,
  width: number,
  pairs: readonly FidelityPair[],
): Promise<boolean> {
  const byRoute = new Map<string, FidelityPair[]>();
  for (const pair of pairs) {
    const group = byRoute.get(pair.liveRoute) ?? [];
    group.push(pair);
    byRoute.set(pair.liveRoute, group);
  }
  const browser = await chromium.launch({ headless: true });
  const guard = createOriginGuard((url) => isAllowedRequestUrl(url, new URL(base).origin));
  let suspect = false;
  try {
    // Context/page creation sits INSIDE the protected region: a rejection
    // here must still close the browser, or the Chromium process leaks.
    const ctx = await browser.newContext({
      viewport: { width, height: 1000 },
      deviceScaleFactor: MATCHED_GEOMETRY_SCALE,
    });
    await ctx.route('**/*', (route) => guard.handleRoute(route));
    const page = await ctx.newPage();
    page.on('response', (response) => guard.noteResponseUrl(response.url()));
    for (const [route, routePairs] of byRoute) {
      suspect = (await captureRoute(page, base, route, routePairs)) || suspect;
    }
  } finally {
    await browser.close();
  }
  for (const violation of guard.violations()) {
    process.stdout.write(`EGRESS VIOLATION: ${violation}\n`);
    suspect = true;
  }
  return suspect;
}
