/*
 * Pure capture policy for capture-live-demo.ts — the route set, flag/env
 * resolution, and the two self-check classifiers (blank render + hydration
 * witness). Split from the Playwright driving so the policy (what to capture
 * and what counts as a bad capture) lives apart from the mechanism (how the
 * browser is driven); every function here is pure and side-effect free.
 */
import { stripTrailing } from '@oaknational/fidelity-review/support';
import { ok, err, type Result } from '@oaknational/result';

/** Strip every leading and trailing occurrence of `char` — a linear scan.
 *  Lives here, not in the shared package: `routeToBase` below is this
 *  helper's only consumer in the whole repo. */
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

/** The stable content routes that exist and are §D-capturable by default. /course (hydration-
 *  witnessed player) and /curriculum (the E3 showcase) joined at build-complete; /lesson/[slug]
 *  stays opt-in via --routes (needs a live slug). Evidence lands at the tool-relative OUT_DIR —
 *  never write screenshots to cwd-relative paths (a run from another directory nests them in the
 *  wrong tree; a train had to relocate exactly that, 2026-07-02). */
const DEFAULT_ROUTES = [
  '/',
  '/standards',
  '/rubrics',
  '/exemplars',
  '/wiki',
  '/course',
  '/curriculum',
];

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
export function resolveWidth(
  argv: readonly string[],
  env: NodeJS.ProcessEnv,
): Result<number, Error> {
  const flagIdx = argv.indexOf('--width');
  const fromFlag = flagIdx === -1 ? undefined : argv.at(flagIdx + 1);
  const raw = fromFlag ?? env.WIDTH;
  const width = raw !== undefined && raw !== '' ? Number.parseInt(raw, 10) : 1440;
  if (!Number.isInteger(width) || width < 320 || width > 5000) {
    return err(new Error(`invalid --width ${JSON.stringify(raw)} (expected integer 320..5000)`));
  }
  return ok(width);
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
