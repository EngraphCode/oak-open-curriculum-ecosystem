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
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { ok, err, type Result } from '@oaknational/result';

import { runTool } from './support';

const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
const EXPORT_DIR = path.resolve(TOOLS_DIR, '..', 'claude-design-canonical-export');

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

const CONTENT_TYPES = new Map<string, string>([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.ttf', 'font/ttf'],
  ['.woff2', 'font/woff2'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
]);

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

function handleExportRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
  const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  const requested = urlPath === '/' ? '/Oak Course.dc.html' : urlPath;
  // Canonicalise FIRST (resolve() normalises any ../ segments), then validate against the export
  // root in its own step BEFORE any filesystem use of the path. The sep-suffixed prefix check
  // also rejects sibling-directory names that share EXPORT_DIR as a string prefix.
  const resolved = path.resolve(EXPORT_DIR, `.${requested}`);
  if (!resolved.startsWith(EXPORT_DIR + path.sep)) {
    res.writeHead(404).end('not found');
    return;
  }
  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, {
    'content-type':
      CONTENT_TYPES.get(path.extname(resolved).toLowerCase()) ?? 'application/octet-stream',
  });
  fs.createReadStream(resolved).pipe(res);
}

function serveExport(): Promise<http.Server> {
  const server = http.createServer(handleExportRequest);
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

/** The bound TCP port of a listening server, narrowed from Node's address union. */
function portOf(server: http.Server): Result<number, Error> {
  const address = server.address();
  if (address === null || typeof address === 'string') {
    return err(new Error('static server did not bind a TCP port'));
  }
  return ok(address.port);
}

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

async function main(): Promise<Result<void, string>> {
  const outDirRes = resolveOutDir(process.argv.slice(2));
  if (!outDirRes.ok) {
    return err(`ERROR: ${outDirRes.error.message}`);
  }
  fs.mkdirSync(outDirRes.value, { recursive: true });
  const server = await serveExport();
  const portRes = portOf(server);
  if (!portRes.ok) {
    return err(`ERROR: ${portRes.error.message}`);
  }
  const failures = await driveExport(portRes.value, outDirRes.value);
  server.close();
  const resultLine = failures === 0 ? 'RESULT: ALL CAPTURED' : `RESULT: ${failures} FAILURES`;
  process.stdout.write(`${resultLine}\n`);
  process.exitCode = failures === 0 ? 0 : 1;
  return ok(undefined);
}

await runTool(main, (error) => `ERROR: ${error instanceof Error ? error.message : String(error)}`);
