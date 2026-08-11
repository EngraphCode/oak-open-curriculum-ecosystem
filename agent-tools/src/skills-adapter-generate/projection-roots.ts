/**
 * Whole-surface reconciliation of the projection roots.
 *
 * Per-skill carriage only ever visits currently discovered canonicals, so a
 * deleted or renamed canonical would leave its complete old projection
 * directory live — stale `SKILL.md`, carried files and all — while both
 * checker and generator stayed green (review round 3, 2026-08-11). This
 * module closes that hole: every entry under `.claude/skills/` and
 * `.agents/skills/` must be a projection of a discovered canonical
 * (`<prefix><id>`) or a lock-pinned vendored skill from `skills-lock.json`.
 * Anything else — including any symlink, which is never a valid projection —
 * is stale: the checker reports it; a generator run removes it.
 *
 * An absent surface root is fine (nothing to reconcile); any other listing
 * failure lands in `failures`, because reading a failure as "empty" would
 * certify or delete over a surface that was never actually observed. Two
 * deliberate bounds: a stray REGULAR FILE at a surface root is outside
 * this sweep's contract (the roots hold skill directories; a loose file
 * is inert and left for a human), and a lock-pinned NAME is exempt
 * whatever its kind — including the estate's nine committed vendored
 * symlinks, a REGISTERED carve-out (exemption-removal plan register; cure
 * routed: vendoring writes real files to both surfaces, then the
 * exemption narrows to real directories only).
 */
import { join } from 'node:path';

import { realCarriageWriteFs, type CarriageReadFs } from './carriage-fs.js';
import { byPath } from './carriage-walk.js';

const PROJECTION_SURFACE_ROOTS = ['.claude/skills', '.agents/skills'] as const;

/** The shared checker/generator completeness contract: reconciliation and
 * emission may act only when discovery saw the WHOLE canonical estate — a
 * skipped directory or an empty set means an unreadable canonical or
 * skills root read as absent, and acting on the partial set deletes or
 * overwrites legitimate projections. */
export function isDiscoveryComplete(discovery: {
  readonly skipped: readonly string[];
  readonly canonicals: readonly unknown[];
}): boolean {
  return discovery.skipped.length === 0 && discovery.canonicals.length > 0;
}

/** The sweep's finding streams — `failures` non-empty means `stale` is
 * not a complete verdict and nothing may act on it. */
export interface ProjectionRootSweep {
  readonly stale: readonly string[];
  readonly failures: readonly string[];
}

/**
 * Enumerate stale projection-root entries: directories that project no
 * discovered canonical and are not lock-pinned, plus every non-regular
 * entry (a lock-pinned NAME is preserved whatever its kind — the lock is
 * the one authority for content generation cannot re-create).
 */
export async function findStaleProjectionEntries(input: {
  readonly repoRoot: string;
  readonly prefix: string;
  readonly canonicalIds: readonly string[];
  readonly lockedIds: ReadonlySet<string>;
  readonly fs: CarriageReadFs;
}): Promise<ProjectionRootSweep> {
  const expected = new Set(input.canonicalIds.map((id) => `${input.prefix}${id}`));
  const stale: string[] = [];
  const failures: string[] = [];
  const lockCollisions = [...input.lockedIds].filter((name) => expected.has(name));
  if (lockCollisions.length > 0) {
    // A vendored id colliding with a projection name would be pruned or
    // overwritten by carriage; the state is unrepresentable by refusal.
    failures.push(
      `lock-pinned id(s) collide with expected projection name(s): ${lockCollisions.join(', ')} — ` +
        `rename the canonical or the vendored entry before reconciling`,
    );
  }
  const repoReal = await input.fs.resolveRealPath(input.repoRoot);
  for (const surface of PROJECTION_SURFACE_ROOTS) {
    const root = join(input.repoRoot, surface);
    const guardFailure = await assertRealSurfaceRoot(root, surface, repoReal, input.fs);
    if (guardFailure !== undefined) {
      failures.push(guardFailure);
      continue;
    }
    await sweepSurfaceRoot({
      root,
      expected,
      lockedIds: input.lockedIds,
      fs: input.fs,
      stale,
      failures,
    });
  }
  return { stale: stale.sort(byPath), failures: failures.sort(byPath) };
}

interface SweepOutcome {
  readonly pruned: readonly string[];
  /** Non-empty means the whole run refuses before any removal. */
  readonly refusedRun: readonly string[];
}

/**
 * Remove stale projection-root entries. Runs ONLY when
 * `discoveryComplete` is true: a skipped directory or an empty canonical
 * set means the expected-projection set is not fully known (an unreadable
 * canonical or skills root reads as absent to discovery), and sweeping
 * against a partial set would delete legitimate projections — the exact
 * destructive-under-partial-observation shape this round cures. A sweep
 * read failure refuses the run before any removal.
 */
export async function sweepStaleProjections(input: {
  readonly repoRoot: string;
  readonly prefix: string;
  readonly canonicalIds: readonly string[];
  readonly lockedIds: ReadonlySet<string>;
  readonly discoveryComplete: boolean;
}): Promise<SweepOutcome> {
  if (!input.discoveryComplete) {
    return { pruned: [], refusedRun: [] };
  }
  const sweep = await findStaleProjectionEntries({
    repoRoot: input.repoRoot,
    prefix: input.prefix,
    canonicalIds: input.canonicalIds,
    lockedIds: input.lockedIds,
    fs: realCarriageWriteFs,
  });
  if (sweep.failures.length > 0) {
    return { pruned: [], refusedRun: sweep.failures };
  }
  const pruned: string[] = [];
  for (const entryPath of sweep.stale) {
    await realCarriageWriteFs.removeEntryRecursive(entryPath);
    pruned.push(entryPath);
  }
  return { pruned, refusedRun: [] };
}

/**
 * The surface root AND every ancestor under the repo root must be real
 * directories: readdir follows a symlink at any depth, so every verdict
 * and removal would act on (and delete inside) whatever tree the link
 * points at. One realpath comparison catches root and ancestors alike
 * (security round, 2026-08-11 — a symlinked `.claude` defeated a
 * root-only check). Returns the failure message, or undefined when safe.
 */
async function assertRealSurfaceRoot(
  root: string,
  surface: string,
  repoReal: Awaited<ReturnType<CarriageReadFs['resolveRealPath']>>,
  fs: CarriageReadFs,
): Promise<string | undefined> {
  if (repoReal.kind === 'failure') {
    return repoReal.message;
  }
  const rootReal = await fs.resolveRealPath(root);
  if (rootReal.kind === 'failure') {
    return rootReal.message;
  }
  if (rootReal.value !== join(repoReal.value, surface)) {
    return (
      `projection surface root resolves outside its lexical home (symlinked root or ` +
      `ancestor): ${root} -> ${rootReal.value} — refusing to reconcile through it`
    );
  }
  return undefined;
}

async function sweepSurfaceRoot(input: {
  readonly root: string;
  readonly expected: ReadonlySet<string>;
  readonly lockedIds: ReadonlySet<string>;
  readonly fs: CarriageReadFs;
  readonly stale: string[];
  readonly failures: string[];
}): Promise<void> {
  const subdirectoryNames = await input.fs.listSubdirectoryNames(input.root);
  if (subdirectoryNames.kind === 'failure') {
    input.failures.push(subdirectoryNames.message);
  } else {
    const staleDirs = subdirectoryNames.value.filter(
      (name) => !input.expected.has(name) && !input.lockedIds.has(name),
    );
    input.stale.push(...staleDirs.map((name) => join(input.root, name)));
  }
  const otherNames = await input.fs.listOtherEntryNames(input.root);
  if (otherNames.kind === 'failure') {
    input.failures.push(otherNames.message);
  } else {
    const staleOthers = otherNames.value.filter((name) => !input.lockedIds.has(name));
    input.stale.push(...staleOthers.map((name) => join(input.root, name)));
  }
}
