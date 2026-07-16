import { realpathSync } from 'node:fs';
import path from 'node:path';

import { err, ok, type Result } from '@oaknational/result';

/**
 * The write-time TOCTOU guard for `refound-window-sample`. The `--out`
 * directory is canonicalised BEFORE the potentially long universe scan, so an
 * ancestor replaced with a symlink between that canonicalisation and the
 * manifest write could redirect the temp-write/rename outside the repository.
 * The guard captures the out dir's canonical path before the scan and
 * re-canonicalises it immediately before the write, refusing on any drift from
 * that baseline (an ancestor was swapped) or any escape of the repository root.
 * Every refusal returns `Err` before a single byte is written.
 *
 * @packageDocumentation
 */

/** The out dir write target, carrying its pre-scan canonical baselines. */
export interface ManifestWriteTarget {
  /** Canonical repository root (`realpathSync`) — the containment base. */
  readonly repoRootReal: string;
  /** The lexically resolved out dir, re-canonicalised at write time. */
  readonly outDirAbs: string;
  /** The out dir's canonical path captured before the scan (drift baseline). */
  readonly expectedOutDirReal: string;
}

/**
 * Canonicalise the out dir and repository root before the scan, capturing the
 * baselines {@link recheckOutDirContainment} compares against at write time. A
 * missing or unresolvable out dir refuses here rather than downstream.
 */
export function canonicaliseOutDir(
  repoRoot: string,
  outDirAbs: string,
): Result<ManifestWriteTarget, Error> {
  try {
    return ok({
      repoRootReal: realpathSync(repoRoot),
      outDirAbs,
      expectedOutDirReal: realpathSync(outDirAbs),
    });
  } catch (cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return err(new Error(`cannot canonicalise out dir '${outDirAbs}': ${message}`));
  }
}

/**
 * Re-canonicalise the out dir immediately before the write and halt if its
 * canonical path drifted from the pre-scan baseline (an ancestor was swapped
 * for a symlink) or now sits outside the repository root. Runs before any
 * bytes are written, so a swap during the scan escapes nothing.
 */
export function recheckOutDirContainment(target: ManifestWriteTarget): Result<undefined, Error> {
  let currentReal: string;
  try {
    currentReal = realpathSync(target.outDirAbs);
  } catch (cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return err(new Error(`cannot re-canonicalise out dir '${target.outDirAbs}': ${message}`));
  }
  if (currentReal !== target.expectedOutDirReal) {
    return err(
      new Error(
        `out dir '${target.outDirAbs}' re-canonicalised to '${currentReal}', differing from the ` +
          `pre-scan '${target.expectedOutDirReal}' — an ancestor was swapped; refusing`,
      ),
    );
  }
  const { repoRootReal } = target;
  if (currentReal !== repoRootReal && !currentReal.startsWith(`${repoRootReal}${path.sep}`)) {
    return err(
      new Error(
        `out dir '${currentReal}' sits outside the repository root '${repoRootReal}'; refusing`,
      ),
    );
  }
  return ok(undefined);
}
