/*
 * Pure measurement policy for measure-320.ts — the route set, flag resolution,
 * the overflow classifier (the WCAG 1.4.10 failure signal), and the
 * hydration-gated route set. Split from the Playwright driving so the policy
 * (what to measure and what counts as a failure) lives apart from the
 * mechanism (how the browser is driven); every function here is pure.
 */
import { ok, err, type Result } from '@oaknational/result';

// NOTE (recorded gap): every route is measured in its IDLE state — no query is
// seeded, so results-state reflow (e.g. /curriculum with live hits) is NOT
// covered by this tool; the per-slice live drives carry that verification.
const DEFAULT_ROUTES = ['/', '/course', '/standards', '/exemplars', '/wiki', '/curriculum'];

// The toggle's accessible name (kept distinct from the panel landmark 'Hub sections menu' —
// item-10 backlog fold). Update BOTH here and in SiteNav.test.tsx if the name ever moves again.
export const MENU_TOGGLE_NAME = 'Hub sections';

export function argValue(argv: readonly string[], flag: string): string | undefined {
  const idx = argv.indexOf(flag);
  return idx === -1 ? undefined : argv.at(idx + 1);
}

export function resolveWidth(argv: readonly string[]): Result<number, Error> {
  const width = Number.parseInt(argValue(argv, '--width') ?? '320', 10);
  if (!Number.isInteger(width) || width < 240 || width > 5000) {
    return err(new Error(`invalid --width (expected integer 240..5000, got ${width})`));
  }
  return ok(width);
}

export function resolveRoutes(argv: readonly string[]): string[] {
  const raw = argValue(argv, '--routes');
  if (raw === undefined || raw === '') {
    return DEFAULT_ROUTES;
  }
  return raw
    .split(',')
    .map((r) => r.trim())
    .filter((r) => r !== '')
    .map((r) => (r.startsWith('/') ? r : `/${r}`));
}

/** True when the measured widths overflow the viewport (the WCAG 1.4.10 failure signal). Pure. */
export function overflows(docWidth: number, bodyWidth: number, innerWidth: number): boolean {
  return docWidth > innerWidth || bodyWidth > innerWidth;
}

/** Routes whose hydrated layout differs from SSR (the paginated player gates its sections). The
 *  hydrated pass WAITS for the gating witness on these, so the measurement never races the
 *  hydration boundary (the nondeterminism that let a no-JS-only overflow slip past a fast run). */
export const HYDRATION_GATED_ROUTES: ReadonlySet<string> = new Set(['/course']);
