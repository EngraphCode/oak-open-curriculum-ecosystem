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
  const width = raw !== undefined && raw !== '' ? Number.parseInt(raw, 10) : 1440;
  if (!Number.isInteger(width) || width < 320 || width > 5000) {
    return err(new Error(`invalid --width ${JSON.stringify(raw)} (expected integer 320..5000)`));
  }
  return ok(width);
}

/** Resolve the base URL of the running showcase (default localhost:3020, the
 *  workspace `dev` port). Override: `--base <url>` or BASE_URL. The default
 *  host is `localhost`, NOT `127.0.0.1`: `next dev` blocks cross-origin dev
 *  resources from 127.0.0.1, so hydration chunks never load and any
 *  hydration-dependent surface (the specimen route's client-side brand
 *  application) silently renders unbranded — a wrong target the blank
 *  classifier cannot catch (hub team finding, 2026-07-02). */
export function resolveBase(argv: readonly string[], env: NodeJS.ProcessEnv): string {
  const flagIdx = argv.indexOf('--base');
  const fromFlag = flagIdx === -1 ? undefined : argv.at(flagIdx + 1);
  return stripTrailing(fromFlag ?? env.BASE_URL ?? 'http://localhost:3020', '/');
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
 *  chrome's own text sits near it), and a framed page with an empty frame
 *  is suspect in its own right — the wrong-target class the generic
 *  classifier cannot see. Pure. */
export function isRenderSuspect(m: RenderMetrics): boolean {
  const framed = m.frameTextLength !== undefined;
  const effectiveText = m.textLength + (m.frameTextLength ?? 0);
  return (
    isSuspect(m.status, m.bodyHeight, effectiveText) || (framed && (m.frameTextLength ?? 0) < 200)
  );
}
