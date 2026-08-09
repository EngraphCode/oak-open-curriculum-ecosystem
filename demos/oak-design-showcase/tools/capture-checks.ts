/*
 * App-specific capture policy for the fidelity review's capture arms.
 * Flag/env resolution (resolveWidth/resolveBase) and the generic blank
 * classifier (isSuspect) are the shared capture-flags module
 * (@oaknational/fidelity-review); this file keeps the showcase's own
 * default base and its frame-aware render classification. Every function
 * here is pure and side-effect free.
 */
import { isSuspect } from '@oaknational/fidelity-review/capture-flags';

/** The showcase dev server's own base for the shared `resolveBase` (the
 *  workspace `dev` port). The host is `localhost`, NOT `127.0.0.1`:
 *  `next dev` blocks cross-origin dev resources from 127.0.0.1, so
 *  hydration chunks never load and any hydration-dependent surface (the
 *  specimen route's client-side brand application) silently renders
 *  unbranded — a wrong target the blank classifier cannot catch (hub
 *  team finding, 2026-07-02). */
export const DEFAULT_BASE = 'http://localhost:3020';

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
