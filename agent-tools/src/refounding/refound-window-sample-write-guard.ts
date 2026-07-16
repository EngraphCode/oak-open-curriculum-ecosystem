import { realpathSync } from 'node:fs';
import path from 'node:path';

import { err, ok, type Result } from '@oaknational/result';

import { nearestExistingAncestor } from './refound-path-resolve.js';

/**
 * The write-time TOCTOU guard for `refound-window-sample`. The `--out`
 * directory is canonicalised BEFORE the potentially long universe scan, so an
 * ancestor replaced with a symlink between that canonicalisation and the
 * manifest write could redirect the temp-write/rename outside the repository.
 *
 * The out dir need not exist yet (the write phase creates it, per
 * `refound-path-resolve.ts`), so the baseline is captured from the NEAREST
 * EXISTING ANCESTOR of the out dir — the deepest path that can be canonicalised
 * before the scan. The write boundary re-canonicalises that same ancestor and
 * refuses on any drift from the baseline (an ancestor was swapped) or any
 * escape of the repository root; the absent trailing segments are then created
 * under the validated anchor. Every refusal returns `Err` before a single byte
 * is written.
 *
 * @packageDocumentation
 */

/** The out dir write target, carrying its pre-scan anchor baselines. */
export interface ManifestWriteTarget {
  /** Canonical repository root (`realpathSync`) — the containment base. */
  readonly repoRootReal: string;
  /** The lexically resolved out dir the manifest is written under. */
  readonly outDirAbs: string;
  /** Nearest ancestor of the out dir that existed before the scan. */
  readonly anchorAbs: string;
  /** Canonical path of {@link anchorAbs} captured before the scan (baseline). */
  readonly expectedAnchorReal: string;
  /** Out-dir segments below {@link anchorAbs} the write phase must create. */
  readonly absentSegments: string;
}

/**
 * Canonicalise the out dir's nearest existing ancestor and the repository root
 * before the scan, capturing the baselines {@link recheckOutDirContainment}
 * compares against at write time. An unresolvable ancestor refuses here rather
 * than downstream.
 */
export function canonicaliseOutDir(
  repoRoot: string,
  outDirAbs: string,
): Result<ManifestWriteTarget, Error> {
  const anchorAbs = nearestExistingAncestor(outDirAbs);
  try {
    return ok({
      repoRootReal: realpathSync(repoRoot),
      outDirAbs,
      anchorAbs,
      expectedAnchorReal: realpathSync(anchorAbs),
      absentSegments: path.relative(anchorAbs, outDirAbs),
    });
  } catch (cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return err(new Error(`cannot canonicalise out dir '${outDirAbs}': ${message}`));
  }
}

/**
 * Re-canonicalise the out dir's anchor immediately before the write and halt if
 * its canonical path drifted from the pre-scan baseline (an ancestor was
 * swapped for a symlink) or now sits outside the repository root. Runs before
 * any bytes are written, so a swap during the scan escapes nothing.
 */
export function recheckOutDirContainment(target: ManifestWriteTarget): Result<undefined, Error> {
  if (path.join(target.anchorAbs, target.absentSegments) !== target.outDirAbs) {
    return err(
      new Error(
        `incoherent write target: anchor '${target.anchorAbs}' plus '${target.absentSegments}' ` +
          `is not the out dir '${target.outDirAbs}'; refusing`,
      ),
    );
  }
  let anchorReal: string;
  try {
    anchorReal = realpathSync(target.anchorAbs);
  } catch (cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return err(
      new Error(`cannot re-canonicalise out dir anchor '${target.anchorAbs}': ${message}`),
    );
  }
  if (anchorReal !== target.expectedAnchorReal) {
    return err(
      new Error(
        `out dir anchor '${target.anchorAbs}' re-canonicalised to '${anchorReal}', differing from ` +
          `the pre-scan '${target.expectedAnchorReal}' — an ancestor was swapped; refusing`,
      ),
    );
  }
  const { repoRootReal } = target;
  if (anchorReal !== repoRootReal && !anchorReal.startsWith(`${repoRootReal}${path.sep}`)) {
    return err(
      new Error(
        `out dir '${target.outDirAbs}' resolves outside the repository root '${repoRootReal}'; ` +
          'refusing',
      ),
    );
  }
  return ok(undefined);
}
