/*
 * The live arm of the per-block fidelity pairs: drive the RUNNING demo's
 * /course#section=<id> deep links (the player's hash handler swaps the
 * section in — proven in CoursePlayer.test.tsx) and element-screenshot the
 * course content region, mirroring drive-export-sections.ts's #main shots
 * of the export player. Output names come from the pairing map so the two
 * arms stay in lockstep.
 *
 * Requires the dev server already running (the capture-live-demo
 * convention); the fidelity orchestrator owns server lifecycle.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';
import type { Page } from '@playwright/test';
import { ok, err, type Result } from '@oaknational/result';

import { resolveBase } from './capture-checks';
import { assertServerUp } from './capture-live-demo';
import { FIDELITY_PAIRS, type FidelityPair } from './fidelity-pairs';
import { describeThrown, runTool } from '@oaknational/fidelity-review/support';

const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEMO_DIR = path.resolve(TOOLS_DIR, '..');

/** The live course player's content region (CourseShell renders it). */
const CONTENT_REGION = 'section[aria-label="Course content"]';

interface RegionMeasure {
  readonly boxHeight: number;
  readonly textLength: number;
}

/** A captured region that is collapsed, textless, or absent is a bad
 *  capture: the deep link never swapped the section in, or the shot ran
 *  pre-hydration. Pure policy — the drive measures, this decides. */
export function sectionCaptureLooksBlank(measure: RegionMeasure | undefined): boolean {
  if (measure === undefined) {
    return true;
  }
  return measure.boxHeight < 100 || measure.textLength < 50;
}

async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });
  await page.waitForTimeout(700);
}

async function measureRegion(page: Page): Promise<RegionMeasure | undefined> {
  const region = page.locator(CONTENT_REGION);
  if ((await region.count()) === 0) {
    return undefined;
  }
  const box = await region.boundingBox();
  const text = await region.innerText();
  return { boxHeight: box?.height ?? 0, textLength: text.length };
}

/** Capture one section pair; true on failure (logged, run continues). */
async function captureOne(page: Page, base: string, pair: FidelityPair): Promise<boolean> {
  try {
    await page.goto(`${base}${pair.liveRoute}`, { waitUntil: 'domcontentloaded' });
    await settle(page);
    if (pair.id === 'bottom-controls') {
      await page.evaluate((selector) => {
        document.querySelector(selector)?.scrollIntoView({ block: 'end' });
      }, CONTENT_REGION);
      await page.waitForTimeout(300);
    }
    if (sectionCaptureLooksBlank(await measureRegion(page))) {
      process.stderr.write(`FAIL capture ${pair.id}: content region blank or absent\n`);
      return true;
    }
    await page.locator(CONTENT_REGION).screenshot({ path: path.resolve(DEMO_DIR, pair.livePng) });
    process.stdout.write(`PASS capture: ${pair.id}\n`);
    return false;
  } catch (error: unknown) {
    process.stderr.write(`FAIL capture ${pair.id}: ${describeThrown(error).slice(0, 200)}\n`);
    return true;
  }
}

/** Capture every section-element pair's live side; Result carries the
 *  failure count so callers decide exit semantics. */
export async function captureLiveSections(base: string): Promise<Result<number, string>> {
  const up = await assertServerUp(base);
  if (!up.ok) {
    return err(`CAPTURE FAIL: ${describeThrown(up.error)}`);
  }
  const targets = FIDELITY_PAIRS.pairs.filter((pair) => pair.kind === 'section-element');
  for (const target of targets) {
    fs.mkdirSync(path.dirname(path.resolve(DEMO_DIR, target.livePng)), { recursive: true });
  }
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 2200 },
    deviceScaleFactor: 2,
  });
  let failures = 0;
  for (const target of targets) {
    if (await captureOne(page, base, target)) {
      failures += 1;
    }
  }
  await browser.close();
  const line = failures === 0 ? 'RESULT: ALL CAPTURED' : `RESULT: ${failures} FAILURES`;
  process.stdout.write(`${line}\n`);
  return ok(failures);
}

async function main(): Promise<Result<void, string>> {
  const base = resolveBase(process.argv.slice(2), process.env);
  const failures = await captureLiveSections(base);
  if (!failures.ok) {
    return failures;
  }
  process.exitCode = failures.value === 0 ? 0 : 1;
  return ok(undefined);
}

const invokedPath = process.argv.at(1);
if (invokedPath !== undefined && path.resolve(invokedPath) === fileURLToPath(import.meta.url)) {
  await runTool(main, (error) => `CAPTURE FAIL: ${describeThrown(error)}`);
}
