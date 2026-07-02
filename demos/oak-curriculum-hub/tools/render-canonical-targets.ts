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
 * PLACEMENT: a workspace-internal dev tool of @oaknational/oak-curriculum-hub — `tsx` and
 * `@playwright/test` are workspace devDependencies, so the tool is first-class TypeScript under
 * the workspace's own strict gates (type-check + lint cover tools/).
 *
 * USAGE:
 *   pnpm --filter @oaknational/oak-curriculum-hub tool:render-targets
 *   pnpm --filter @oaknational/oak-curriculum-hub tool:render-targets -- --width 1280
 *   # direct form, from the repo root:
 *   tsx demos/oak-curriculum-hub/tools/render-canonical-targets.ts
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';
import type { Page } from '@playwright/test';
import { ok, err, type Result } from '@oaknational/result';

import { describeThrown, runTool } from './support';

const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
const EXPORT_DIR = path.resolve(TOOLS_DIR, '..', 'claude-design-canonical-export');
const OUT_DIR = path.resolve(TOOLS_DIR, '..', 'demo-evidence');

const CONTENT_TYPES = new Map<string, string>([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.ttf', 'font/ttf'],
  ['.woff2', 'font/woff2'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.pdf', 'application/pdf'],
]);

interface RenderTarget {
  file: string;
  base: string;
}

const TARGETS: readonly RenderTarget[] = [
  { file: 'Oak Hub.dc.html', base: 'hub-canonical-render' },
  { file: 'Oak Standards.dc.html', base: 'standards-canonical-render' },
];

/**
 * Viewport CSS width for the render. This is the LAYOUT width (heading wrap, max-widths, breakpoints)
 * — distinct from the PNG's pixel dimensions, which are width × deviceScaleFactor. Default 1440 is the
 * §D matched-width standard so the canonical targets compare apples-to-apples with a 1440 live capture.
 * Override: `--width 1280` or `RENDER_WIDTH=1280`.
 */
function resolveWidth(): Result<number, string> {
  const flagIdx = process.argv.indexOf('--width');
  const fromFlag = flagIdx === -1 ? undefined : process.argv.at(flagIdx + 1);
  const raw = fromFlag ?? process.env.RENDER_WIDTH;
  const width = raw !== undefined && raw !== '' ? Number.parseInt(raw, 10) : 1440;
  if (!Number.isInteger(width) || width < 320 || width > 5000) {
    return err(`invalid --width ${JSON.stringify(raw)} (expected 320..5000)`);
  }
  return ok(width);
}

function handleStaticRequest(
  dir: string,
  req: http.IncomingMessage,
  res: http.ServerResponse,
): void {
  const rawUrl = req.url ?? '/';
  const queryIdx = rawUrl.indexOf('?');
  const urlPath = decodeURIComponent(queryIdx === -1 ? rawUrl : rawUrl.slice(0, queryIdx));
  // Canonicalise FIRST (resolve() normalises any ../ segments), then validate against the served
  // root in its own step BEFORE any filesystem use of the path. The sep-suffixed prefix check
  // also rejects sibling-directory names that share `dir` as a string prefix.
  const resolved = path.resolve(dir, `.${urlPath}`);
  if (!resolved.startsWith(dir + path.sep)) {
    res.writeHead(404);
    res.end();
    return;
  }
  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(200, {
    'content-type':
      CONTENT_TYPES.get(path.extname(resolved).toLowerCase()) ?? 'application/octet-stream',
  });
  fs.createReadStream(resolved).pipe(res);
}

function serveDir(dir: string): Promise<http.Server> {
  const server = http.createServer((req, res) => {
    handleStaticRequest(dir, req, res);
  });
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

/** Render one export page (full-page + above-the-fold PNGs); returns true when it looks blank. */
async function renderTarget(page: Page, base: string, target: RenderTarget): Promise<boolean> {
  const resp = await page.goto(`${base}/${encodeURIComponent(target.file)}`, {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });
  await page.waitForTimeout(2000);
  const m = await page.evaluate(() => ({
    h: document.body.scrollHeight,
    len: document.body.innerText.length,
  }));
  const status = resp === null ? 0 : resp.status();
  const good = status === 200 && m.h > 400 && m.len > 200;
  process.stdout.write(
    `${target.file}: HTTP=${status} bodyH=${m.h} textLen=${m.len} -> ${good ? 'OK' : 'SUSPECT (blank?)'}\n`,
  );
  await page.screenshot({ path: path.join(OUT_DIR, `${target.base}.png`), fullPage: true });
  await page.screenshot({
    path: path.join(OUT_DIR, `${target.base}-abovefold.png`),
    fullPage: false,
  });
  process.stdout.write(`  wrote ${target.base}.png + ${target.base}-abovefold.png\n`);
  return !good;
}

function assertExportDir(): Result<void, string> {
  if (!fs.existsSync(EXPORT_DIR)) {
    return err(`export dir not found: ${EXPORT_DIR}`);
  }
  return ok(undefined);
}

/** Launch the browser and render every target; true when any render looked blank. */
async function renderAll(base: string, width: number): Promise<boolean> {
  process.stdout.write(
    `viewport CSS width = ${width}px (deviceScaleFactor 2 → ${width * 2}px PNGs)\n`,
  );
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  let suspect = false;
  for (const target of TARGETS) {
    suspect = (await renderTarget(page, base, target)) || suspect;
  }
  await browser.close();
  return suspect;
}

async function main(): Promise<Result<void, string>> {
  const exportDirRes = assertExportDir();
  if (!exportDirRes.ok) {
    return exportDirRes;
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const server = await serveDir(EXPORT_DIR);
  const portRes = portOf(server);
  if (!portRes.ok) {
    return err(`RENDER FAIL: ${describeThrown(portRes.error)}`);
  }
  const base = `http://127.0.0.1:${portRes.value}`;
  process.stdout.write(`serving ${EXPORT_DIR} at ${base}\n`);

  const widthRes = resolveWidth();
  if (!widthRes.ok) {
    return widthRes;
  }
  const suspect = await renderAll(base, widthRes.value);
  server.close();
  if (suspect) {
    return err(
      'RENDER SUSPECT: a target looked blank (low bodyH/textLen) — investigate before trusting the PNGs',
    );
  }
  process.stdout.write('render complete -> demo-evidence/\n');
  return ok(undefined);
}

await runTool(main, (error) => `RENDER FAIL: ${describeThrown(error)}`);
