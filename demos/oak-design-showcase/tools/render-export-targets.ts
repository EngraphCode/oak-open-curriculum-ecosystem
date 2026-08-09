/*
 * The export-render arm of the fidelity review: serve the canonical export
 * over the two-root overlay (export-server.ts — the pages are not
 * self-contained under studio-source/), render each declared target with a
 * JS-capable headless browser at matched geometry, and write one PNG per
 * pair into demo-evidence/, named by pair id (the naming-ratchet-safe
 * convention pinned in fidelity-pairs.unit.test.ts).
 *
 * Served-over-HTTP + networkidle is required, not optional: the specimen
 * document.writes its brand sheets from the ?brand= query, and the picker
 * chrome hydrates its specimen iframe — neither completes over file://.
 *
 * CORRECTNESS MECHANISM (the hub's, carried; why there is no unit test at
 * this driving level): the run is self-validating — each render is checked
 * for a real (non-blank) result, and the picker chrome additionally
 * requires a non-empty iframe document because its own body text sits
 * close to the generic threshold (iframe content does not count toward the
 * parent's innerText). The pure classification lives in capture-checks.ts
 * (isRenderSuspect) and is unit-tested there.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';
import type { Page } from '@playwright/test';
import { ok, err, type Result } from '@oaknational/result';

import { portOf, resolveExportRoots, serveRoots } from './export-server';
import { EXPORT_RENDER_TARGETS, type ExportRenderTarget } from './fidelity-pairs';
import { isRenderSuspect, type RenderMetrics } from './capture-checks';
import { describeThrown } from '@oaknational/fidelity-review/support';

const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(TOOLS_DIR, '..', 'demo-evidence');

/** The picker chrome hosts the specimen in an iframe; a blank frame with a
 *  healthy parent is exactly the wrong-target class the generic classifier
 *  cannot see. Returns the frame's visible text length (undefined when the
 *  page hosts no frame). */
async function iframeTextLength(page: Page): Promise<number | undefined> {
  const frame = page.frames().at(1);
  if (frame === undefined) {
    return undefined;
  }
  return frame.evaluate(() => document.body.innerText.length);
}

async function measureRender(page: Page, status: number): Promise<RenderMetrics> {
  const m = await page.evaluate(() => ({
    h: document.body.scrollHeight,
    len: document.body.innerText.length,
  }));
  return {
    status,
    bodyHeight: m.h,
    textLength: m.len,
    frameTextLength: await iframeTextLength(page),
  };
}

function logRender(url: string, m: RenderMetrics, suspect: boolean): void {
  process.stdout.write(
    `${url}: HTTP=${m.status} bodyH=${m.bodyHeight} textLen=${m.textLength}${
      m.frameTextLength === undefined ? '' : ` frameTextLen=${m.frameTextLength}`
    } -> ${suspect ? 'SUSPECT (blank?)' : 'OK'}\n`,
  );
}

/** Render one export target and write every declared shot; true when the
 *  render looks blank (or its iframe does, where one is expected). */
async function renderTarget(
  page: Page,
  base: string,
  target: ExportRenderTarget,
): Promise<boolean> {
  const resp = await page.goto(`${base}/${encodeURI(target.url)}`, {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });
  await page.waitForTimeout(2000);
  const metrics = await measureRender(page, resp === null ? 0 : resp.status());
  const suspect = isRenderSuspect(metrics, target.expectsFrame);
  logRender(target.url, metrics, suspect);
  for (const shot of target.shots) {
    const out = path.join(OUT_DIR, `export-${shot.pairId}.png`);
    await page.screenshot({ path: out, fullPage: shot.kind === 'full' });
    process.stdout.write(`  wrote export-${shot.pairId}.png\n`);
  }
  return suspect;
}

/** Serve the overlay and render every declared export target at `width` CSS
 *  px — the importable core the fidelity orchestrator composes. */
export async function renderExportTargets(width: number): Promise<Result<void, string>> {
  const rootsRes = resolveExportRoots();
  if (!rootsRes.ok) {
    return rootsRes;
  }
  const roots = rootsRes.value;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const server = await serveRoots(roots);
  const portRes = portOf(server);
  if (!portRes.ok) {
    server.close();
    return err(`RENDER FAIL: ${describeThrown(portRes.error)}`);
  }
  const base = `http://127.0.0.1:${portRes.value}`;
  process.stdout.write(
    `serving export overlay [${roots.map((root) => root.dir).join(' -> ')}] at ${base}\n` +
      `viewport CSS width = ${width}px (deviceScaleFactor 2 -> ${width * 2}px PNGs)\n`,
  );

  let suspect: boolean;
  try {
    suspect = await renderAll(base, width);
  } finally {
    server.close();
  }
  if (suspect) {
    return err(
      'RENDER SUSPECT: an export target looked blank (low text/height, or an empty specimen iframe) — investigate before trusting the PNGs',
    );
  }
  process.stdout.write('export render complete -> demo-evidence/\n');
  return ok(undefined);
}

/** Launch the browser and render every declared target; true when any
 *  render looked blank. */
async function renderAll(base: string, width: number): Promise<boolean> {
  const browser = await chromium.launch({ headless: true });
  let suspect = false;
  try {
    const ctx = await browser.newContext({
      viewport: { width, height: 1000 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    for (const target of EXPORT_RENDER_TARGETS) {
      suspect = (await renderTarget(page, base, target)) || suspect;
    }
  } finally {
    await browser.close();
  }
  return suspect;
}
