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

const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(TOOLS_DIR, '..', 'demo-evidence');

/** The stable content routes that exist and are §D-capturable by default. /course (hydration-
 *  witnessed player) and /curriculum (the E3 showcase) joined at build-complete; /lesson/[slug]
 *  stays opt-in via --routes (needs a live slug). Evidence lands at the tool-relative OUT_DIR —
 *  never write screenshots to cwd-relative paths (a run from another directory nests them in the
 *  wrong tree; a train had to relocate exactly that, 2026-07-02). */
const DEFAULT_ROUTES = ['/', '/standards', '/rubrics', '/exemplars', '/wiki', '/course', '/curriculum'];

/** Strip every leading and trailing occurrence of `char` — a linear scan, replacing the
 *  backtracking-prone `^x+|x+$` regex-trim idiom (Sonar S8786). */
function trimEdges(value: string, char: string): string {
  let start = 0;
  let end = value.length;
  while (start < end && value.charAt(start) === char) {
    start += 1;
  }
  while (end > start && value.charAt(end - 1) === char) {
    end -= 1;
  }
  return value.slice(start, end);
}

/** Strip every trailing occurrence of `char` — linear scan, same S8786 rationale. */
function stripTrailing(value: string, char: string): string {
  let end = value.length;
  while (end > 0 && value.charAt(end - 1) === char) {
    end -= 1;
  }
  return value.slice(0, end);
}

/** Slug a route into an output basename: '/' → 'home', '/standards' → 'standards',
 *  '/lesson/[slug]' → 'lesson-slug'. */
export function routeToBase(route: string): string {
  const trimmed = trimEdges(route, '/');
  if (trimmed === '') {
    return 'home';
  }
  return trimEdges(trimmed.replaceAll(/[^a-zA-Z0-9]+/g, '-'), '-').toLowerCase();
}

/** Resolve the viewport CSS width (§D standard 1440). Override: `--width 1280` or WIDTH=1280. */
export function resolveWidth(argv: readonly string[], env: NodeJS.ProcessEnv): number {
  const flagIdx = argv.indexOf('--width');
  const fromFlag = flagIdx === -1 ? undefined : argv.at(flagIdx + 1);
  const raw = fromFlag ?? env.WIDTH;
  const width = raw !== undefined && raw !== '' ? Number.parseInt(raw, 10) : 1440;
  if (!Number.isInteger(width) || width < 320 || width > 5000) {
    throw new Error(`invalid --width ${JSON.stringify(raw)} (expected integer 320..5000)`);
  }
  return width;
}

/** Resolve the base URL of the running demo (default localhost:3010). Override: `--base <url>` or
 *  BASE_URL. The default host is `localhost`, NOT `127.0.0.1`: `next dev` blocks cross-origin dev
 *  resources from 127.0.0.1, so hydration chunks never load and any hydration-dependent surface
 *  (the /course paginated player) silently renders its SSR all-sections fallback — a wrong §D
 *  target the blank-classifier cannot catch (team finding, 2026-07-02). */
export function resolveBase(argv: readonly string[], env: NodeJS.ProcessEnv): string {
  const flagIdx = argv.indexOf('--base');
  const fromFlag = flagIdx === -1 ? undefined : argv.at(flagIdx + 1);
  return stripTrailing(fromFlag ?? env.BASE_URL ?? 'http://localhost:3010', '/');
}

/** Resolve the route list (default DEFAULT_ROUTES). Override: `--routes /a,/b`. */
export function resolveRoutes(argv: readonly string[]): string[] {
  const flagIdx = argv.indexOf('--routes');
  const raw = flagIdx === -1 ? undefined : argv.at(flagIdx + 1);
  if (raw === undefined || raw === '') {
    return DEFAULT_ROUTES;
  }
  return raw
    .split(',')
    .map((r) => r.trim())
    .filter((r) => r !== '')
    .map((r) => (r.startsWith('/') ? r : `/${r}`));
}

/** Blank-render classifier: a real page is HTTP 200 with meaningful body height AND visible text.
 *  Returns true when the capture is SUSPECT (looks blank / a placeholder). Pure — the self-check. */
export function isSuspect(status: number, bodyHeight: number, textLength: number): boolean {
  return !(status === 200 && bodyHeight > 400 && textLength > 200);
}

/** Routes whose §D capture depends on client hydration. The /course paginated player HIDES the
 *  inactive sections post-hydration, while its SSR fallback ships ZERO `hidden` attributes by
 *  design (proven by the shell's renderToString test) — so the presence of `[hidden]` elements is
 *  the hydration witness. An unhydrated player page is full of text and passes the blank
 *  classifier, which is exactly why this separate check exists. */
const HYDRATION_GATED_ROUTES: ReadonlySet<string> = new Set(['/course']);

/** Hydration classifier for HYDRATION_GATED_ROUTES: SUSPECT when no element is `[hidden]`
 *  (the player never mounted — e.g. a 127.0.0.1 base blocking the dev chunks). Pure. */
export function isUnhydrated(route: string, hiddenCount: number): boolean {
  return HYDRATION_GATED_ROUTES.has(route) && hiddenCount === 0;
}

async function assertServerUp(base: string): Promise<number> {
  try {
    const res = await fetch(base, { method: 'GET' });
    // any HTTP response (even a 404 for '/') proves something is listening
    return res.status;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `no demo server reachable at ${base}. Start it first (from the app dir: pnpm dev -> :3010) ` +
        `and coordinate the port with the styling lane, or pass --base <url>. cause: ${message}`,
      { cause: error },
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
  const resp = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
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
  console.log(
    `${route}: HTTP=${status} bodyH=${m.h} textLen=${m.len} hidden=${m.hidden} -> ${verdictFor(blank, unhydrated)}`,
  );
  await page.screenshot({ path: path.join(OUT_DIR, `${outBase}-live.png`), fullPage: true });
  await page.screenshot({ path: path.join(OUT_DIR, `${outBase}-live-abovefold.png`), fullPage: false });
  console.log(`  wrote ${outBase}-live.png + ${outBase}-live-abovefold.png`);
  return blank || unhydrated;
}

function logRunHeader(base: string, width: number, routes: readonly string[]): void {
  console.log(`live demo base = ${base}`);
  console.log(`viewport CSS width = ${width}px (deviceScaleFactor 2 -> ${width * 2}px PNGs)`);
  console.log(`routes = ${routes.join(', ')}`);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const width = resolveWidth(argv, process.env);
  const base = resolveBase(argv, process.env);
  const routes = resolveRoutes(argv);

  await assertServerUp(base);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  logRunHeader(base, width, routes);

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

  if (suspect) {
    console.error('CAPTURE SUSPECT: a target looked blank/placeholder — investigate before trusting the PNGs');
    process.exit(1);
  }
  console.log('live capture complete -> demo-evidence/');
}

const invokedPath = process.argv.at(1);
if (invokedPath !== undefined && path.resolve(invokedPath) === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error: unknown) {
    console.error('CAPTURE FAIL:', error instanceof Error ? (error.stack ?? error.message) : error);
    process.exit(1);
  }
}
