/**
 * Emission refusals: the shared refusal-message form, and the pre-clear
 * preflight that computes which canonicals would refuse at emit.
 *
 * A `--clear` tears every existing Practice projection down before regeneration
 * rebuilds them, so a canonical that would refuse at emit must be caught BEFORE
 * the destructive clear — or the clear removes that skill's projection and the
 * emit then refuses to rebuild it (a lost projection, no attacker required;
 * review 2026-08-12, defect 1 / stage-before-clear). The preflight reuses
 * emission's OWN primitives (`isRoundTrippableCanonicalRef` and
 * `collectCarriedFiles`) so it can never diverge from the emit it guards, and it
 * reads only the CANONICAL side: the clear empties every projection target, so
 * the canonical source (which the clear never touches) is the sole DETERMINISTIC
 * post-clear refusal vector — exactly what a post-clear emit sees. (Transient
 * post-clear I/O faults at the emission target or the sweep can still abort a
 * run, but those fail loud and pre-date this cure — they are not the silent
 * projection-loss this preflight closes.)
 */
import { dirname } from 'node:path';

import { isRoundTrippableCanonicalRef } from './adapter-stub.js';
import { collectCarriedFiles, realCarriageReadFs } from './carriage.js';
import type { ParsedCanonical } from './discovery.js';

/** The refusal for a canonical whose ref cannot round-trip as a class marker
 * (a backtick or newline in the directory name). Single-sourced so the
 * pre-clear preflight and the emit path report it identically. */
export function nonRoundTrippableRefusal(canonicalRef: string): string {
  return `${canonicalRef}: canonical path is not round-trippable as a class marker; refusing emission`;
}

/**
 * The refusals emission would raise that a clear cannot undo. Two sources, each
 * reusing emission's own primitive: a non-round-trippable class marker
 * ({@link isRoundTrippableCanonicalRef}, as the emit path checks), and a
 * canonical-side carriage refusal ({@link collectCarriedFiles}, as
 * `syncCarriage` reads) — a committed symlinked carried root or a seam read
 * failure.
 */
export async function emissionRefusalsBeforeClear(
  canonicals: readonly ParsedCanonical[],
): Promise<readonly string[]> {
  const refusals: string[] = [];
  for (const parsed of canonicals) {
    const canonicalRef = `${parsed.relativeDir}/${parsed.canonicalFilename}`;
    if (!isRoundTrippableCanonicalRef(canonicalRef)) {
      refusals.push(nonRoundTrippableRefusal(canonicalRef));
      continue;
    }
    const carried = await collectCarriedFiles(dirname(parsed.canonicalPath), realCarriageReadFs);
    refusals.push(...carried.refused);
  }
  return refusals;
}
