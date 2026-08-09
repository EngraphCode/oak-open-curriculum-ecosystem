/*
 * Pure capture policy for the fidelity review's live-capture arm — flag/env
 * resolution and the blank-render classifier. Ported from the hub's
 * capture-checks (route slugging, the hub's default route set, and the
 * course-player hydration witness stayed behind: the showcase's capture set
 * is declared per-pair in fidelity-pairs.ts, and its outputs are named by
 * pair id, never by route). Every function here is pure and side-effect
 * free.
 */
import { ok, err, type Result } from '@oaknational/result';

import { stripTrailing } from './support';

/** Resolve the viewport CSS width (the matched-geometry standard, 1440).
 *  Override: `--width 1280` or WIDTH=1280. */
export function resolveWidth(
  argv: readonly string[],
  env: NodeJS.ProcessEnv,
): Result<number, Error> {
  const flagIdx = argv.indexOf('--width');
  const fromFlag = flagIdx === -1 ? undefined : argv.at(flagIdx + 1);
  const raw = fromFlag ?? env.WIDTH;
  // Number(), not parseInt: '1440px' and '1440.5' must be rejected, not
  // silently truncated to a plausible integer.
  const width = raw !== undefined && raw !== '' ? Number(raw) : 1440;
  if (!Number.isInteger(width) || width < 320 || width > 5000) {
    return err(new Error(`invalid --width ${JSON.stringify(raw)} (expected integer 320..5000)`));
  }
  return ok(width);
}

/** The showcase dev server's own base (the workspace `dev` port). The host
 *  is `localhost`, NOT `127.0.0.1`: `next dev` blocks cross-origin dev
 *  resources from 127.0.0.1, so hydration chunks never load and any
 *  hydration-dependent surface (the specimen route's client-side brand
 *  application) silently renders unbranded — a wrong target the blank
 *  classifier cannot catch (hub team finding, 2026-07-02). */
export const DEFAULT_BASE = 'http://localhost:3020';

/** Resolve the base URL of the running showcase. Override: `--base <url>`
 *  or BASE_URL. */
export function resolveBase(argv: readonly string[], env: NodeJS.ProcessEnv): string {
  const flagIdx = argv.indexOf('--base');
  const fromFlag = flagIdx === -1 ? undefined : argv.at(flagIdx + 1);
  return stripTrailing(fromFlag ?? env.BASE_URL ?? DEFAULT_BASE, '/');
}

/** Blank-render classifier: a real page is HTTP 200 with meaningful body height AND visible text.
 *  Returns true when the capture is SUSPECT (looks blank / a placeholder). Pure — the self-check. */
export function isSuspect(status: number, bodyHeight: number, textLength: number): boolean {
  return !(status === 200 && bodyHeight > 400 && textLength > 200);
}

export interface RenderMetrics {
  readonly status: number;
  readonly bodyHeight: number;
  readonly textLength: number;
  /** The specimen iframe's visible text length; undefined when the page
   *  hosts no frame. */
  readonly frameTextLength: number | undefined;
}

/** Frame-aware blank classification for the export-render arm: the parent
 *  page counts its iframe's text toward the generic threshold (the picker
 *  chrome's own text sits near it); a framed page with an empty frame is
 *  suspect in its own right; and a page EXPECTED to host a frame that has
 *  none is the same wrong-target class — healthy chrome around a specimen
 *  that never mounted must never pass on parent metrics alone. Pure. */
export function isRenderSuspect(m: RenderMetrics, expectsFrame: boolean): boolean {
  if (expectsFrame && m.frameTextLength === undefined) {
    return true;
  }
  const framed = m.frameTextLength !== undefined;
  const effectiveText = m.textLength + (m.frameTextLength ?? 0);
  return (
    isSuspect(m.status, m.bodyHeight, effectiveText) || (framed && (m.frameTextLength ?? 0) < 200)
  );
}
