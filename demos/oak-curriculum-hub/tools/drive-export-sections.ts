/*
 * SPA-drive of the canonical export's Oak Course player: serve the export over local HTTP (the
 * .dc.html fetches data + hydrates via _ds_bundle.js, so file:// is CORS-blocked — the
 * render-canonical-targets.ts recipe), open each target module in the export's own sidebar, click
 * the target section row, settle, and capture the main content region. These captures are the
 * AUTHORITATIVE per-block visual targets for the interactive block-styling pass (quiz / flip /
 * accordion / stats / compare / sortable / hotspot / tabs / videoimport / columns) plus the bottom
 * prev/next controls treatment.
 *
 * USAGE:
 *   pnpm --filter @oaknational/oak-curriculum-hub tool:drive-export
 *   pnpm --filter @oaknational/oak-curriculum-hub tool:drive-export -- --out <dir>
 *   # direct form, from the repo root:
 *   tsx demos/oak-curriculum-hub/tools/drive-export-sections.ts
 *   (default out: demos/oak-curriculum-hub/demo-evidence/export-sections)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { ok, err, type Result } from '@oaknational/result';

import { EXPORT_DIR, portOf, serveDir } from './export-server';
import { runTool } from '@oaknational/fidelity-review/support';

const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));

function resolveOutDir(argv: readonly string[]): Result<string, Error> {
  const outFlag = argv.indexOf('--out');
  if (outFlag === -1) {
    return ok(path.resolve(TOOLS_DIR, '..', 'demo-evidence', 'export-sections'));
  }
  const value = argv.at(outFlag + 1);
  if (value === undefined || value === '') {
    return err(new Error('--out requires a directory argument'));
  }
  return ok(path.resolve(value));
}

interface SectionTarget {
  module: string;
  section: string;
  slug: string;
}

// One representative section per interactive block type (census from lib/course/oak-course.json),
// keyed by the module + section TITLES the export sidebar renders.
const TARGETS: readonly SectionTarget[] = [
  { module: 'Oak lessons', section: 'Why Oak lessons matter', slug: 'u1m1s1-flip-stats' },
  { module: 'Oak lessons', section: 'The eight lesson components', slug: 'u1m1s2-accordion' },
  { module: 'Oak lessons', section: 'Lesson structure & vocabulary', slug: 'u1m1s4-tabs' },
  { module: 'Oak lessons', section: 'Knowledge check', slug: 'u1m1s5-quiz' },
  { module: 'Core considerations', section: 'Accessibility & scaffolding', slug: 'u1m3s2-compare' },
  { module: 'Practice', section: 'Quality practice', slug: 'u3m1s1-columns' },
  {
    module: 'The learning framework',
    section: 'What is the learning framework?',
    slug: 'm1s2-videoimport',
  },
  { module: 'The learning framework', section: 'Order the stages', slug: 'm1s3check-sortable' },
  { module: 'The learning framework', section: 'When do the stages happen?', slug: 'm1s4-hotspot' },
];

/** Open the target's module in the sidebar, click the section row, capture #main.
 *  Returns true on failure (logged; the run continues to the next target). */
async function captureSection(
  page: Page,
  aside: Locator,
  target: SectionTarget,
  outDir: string,
): Promise<boolean> {
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
    await aside.locator('button[aria-current]').filter({ hasText: target.section }).first().click();
    await page.waitForTimeout(700); // section swap + entry animations
    await page
      .locator('#main')
      .screenshot({ path: path.join(outDir, `export-${target.slug}.png`) });
    process.stdout.write(`PASS capture: ${target.slug}\n`);
    return false;
  } catch (error) {
    process.stderr.write(`FAIL capture ${target.slug}: ${String(error).slice(0, 200)}\n`);
    return true;
  }
}

/** The bottom prev/next controls treatment: scroll the last-captured section's main to the
 *  bottom, settle, capture. Returns true on failure. */
async function captureBottomControls(page: Page, outDir: string): Promise<boolean> {
  try {
    await page.evaluate(() => {
      const main = document.querySelector('#main');
      if (main) {
        main.scrollTop = main.scrollHeight;
      }
    });
    await page.waitForTimeout(400);
    await page
      .locator('#main')
      .screenshot({ path: path.join(outDir, 'export-bottom-controls.png') });
    process.stdout.write('PASS capture: bottom-controls\n');
    return false;
  } catch (error) {
    process.stderr.write(`FAIL capture bottom-controls: ${String(error).slice(0, 200)}\n`);
    return true;
  }
}

/** Open the export in a fresh browser and capture every target; returns the failure count. */
async function driveExport(port: number, outDir: string): Promise<number> {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 2200 },
    deviceScaleFactor: 2,
  });
  await page.goto(`http://127.0.0.1:${port}/Oak%20Course.dc.html`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(600);

  const aside = page.locator('aside[aria-label="Course navigation"]');
  let failures = 0;
  for (const target of TARGETS) {
    if (await captureSection(page, aside, target, outDir)) {
      failures += 1;
    }
  }
  if (await captureBottomControls(page, outDir)) {
    failures += 1;
  }

  await browser.close();
  return failures;
}

/** Serve the export and capture every section target into `outDir` — the
 *  importable core the fidelity orchestrator composes. Returns the failure
 *  count as a Result value so callers decide the exit semantics. */
export async function driveExportSections(outDir: string): Promise<Result<number, string>> {
  fs.mkdirSync(outDir, { recursive: true });
  const server = await serveDir(EXPORT_DIR);
  const portRes = portOf(server);
  if (!portRes.ok) {
    return err(`ERROR: ${portRes.error.message}`);
  }
  const failures = await driveExport(portRes.value, outDir);
  server.close();
  const resultLine = failures === 0 ? 'RESULT: ALL CAPTURED' : `RESULT: ${failures} FAILURES`;
  process.stdout.write(`${resultLine}\n`);
  return ok(failures);
}

async function main(): Promise<Result<void, string>> {
  const outDirRes = resolveOutDir(process.argv.slice(2));
  if (!outDirRes.ok) {
    return err(`ERROR: ${outDirRes.error.message}`);
  }
  const failures = await driveExportSections(outDirRes.value);
  if (!failures.ok) {
    return failures;
  }
  process.exitCode = failures.value === 0 ? 0 : 1;
  return ok(undefined);
}

const invokedPath = process.argv.at(1);
if (invokedPath !== undefined && path.resolve(invokedPath) === fileURLToPath(import.meta.url)) {
  await runTool(
    main,
    (error) => `ERROR: ${error instanceof Error ? error.message : String(error)}`,
  );
}
