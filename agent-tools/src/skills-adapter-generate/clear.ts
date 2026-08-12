/**
 * Class-scoped clearing of generated adapter directories.
 *
 * Split from `generator.ts`: clearing is the one destructive path in
 * the pipeline. Its jurisdiction is the Practice class only — real
 * directories whose `SKILL.md` carries the class marker recording a
 * derivation from `.agent/skills/` (see `adapter-stub.ts`). Everything
 * else (Vendor-class entries installed by the external skills
 * machinery, or any foreign entry, whatever its name) is out of scope
 * and never removed: our tooling clears only what our generation
 * re-creates, and membership is proven by content, never by name.
 */
import { lstat, readFile, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

import { parseAdapterStubPointer } from './adapter-stub.js';
import { realCarriageReadFs, type FsRead } from './carriage-fs.js';
import { allSurfaceRootFailures, PROJECTION_SURFACE_ROOTS } from './surface-roots.js';

/**
 * Result of listing an adapter surface. A missing surface is `ok` with
 * no names (nothing to clear); any other filesystem failure is an
 * `error` — treating an unreadable surface as empty would let a clear
 * report success while stale directories remain.
 */
type ListSubdirectoryNamesResult =
  | { readonly kind: 'ok'; readonly names: readonly string[] }
  | { readonly kind: 'error'; readonly message: string };

/**
 * Result of reading a candidate entry's `SKILL.md`. `undefined` means
 * the file is absent — the entry is not ours and is skipped; any
 * failure other than absence is an `error` that aborts the clear (an
 * unclassifiable entry must never be silently kept OR removed).
 */
type ReadStubResult =
  | { readonly kind: 'ok'; readonly value: string | undefined }
  | { readonly kind: 'error'; readonly message: string };

/**
 * Result of {@link clearGeneratedAdapters}. The `ok` arm reports the
 * directories removed so the one destructive pass in the pipeline is
 * observable rather than silent.
 */
export type ClearResult =
  | { readonly kind: 'ok'; readonly removed: readonly string[] }
  | { readonly kind: 'error'; readonly message: string };

/**
 * Filesystem seam for {@link clearGeneratedAdapters}, mirroring the
 * checker's injected-fs pattern so the destructive path is testable
 * without touching disk.
 */
export interface ClearFs {
  listSubdirectoryNames(path: string): Promise<ListSubdirectoryNamesResult>;
  readStubOrUndefined(path: string): Promise<ReadStubResult>;
  removeDirectory(path: string): Promise<void>;
  /** The path with every symlink resolved (nearest-existing-ancestor
   * semantics for an absent tail) — the surface-root guard's instrument
   * for refusing a symlinked root or ancestor before any removal. */
  resolveRealPath(path: string): Promise<FsRead<string>>;
}

/**
 * Classify a filesystem failure for the clear pass: only genuine
 * absence (ENOENT) reads as "nothing there" — any other failure
 * (EACCES, I/O error) must abort the clear rather than report success
 * over an unobserved surface. Exported pure so the contract is testable
 * without real filesystem IO.
 */
export function isMissingSurface(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

/**
 * The real-filesystem {@link ClearFs}. Its error contract (absence →
 * empty/skip; anything else → error) lives in the exported pure
 * {@link isMissingSurface}, which carries the tests.
 */
const realClearFs: ClearFs = {
  async listSubdirectoryNames(path) {
    let dirents;
    try {
      dirents = await readdir(path, { withFileTypes: true });
    } catch (error: unknown) {
      if (isMissingSurface(error)) {
        return { kind: 'ok', names: [] };
      }
      return { kind: 'error', message: `cannot list ${path}: ${String(error)}` };
    }
    return {
      kind: 'ok',
      names: dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name),
    };
  },
  async readStubOrUndefined(path) {
    try {
      // lstat gate: a symlinked SKILL.md is never ours (emission writes
      // regular files only) and must not be read through — its target
      // could be a genuine stub, which would classify a foreign
      // directory as ours and delete it.
      const stubStat = await lstat(path);
      if (!stubStat.isFile()) {
        return { kind: 'ok', value: undefined };
      }
      return { kind: 'ok', value: await readFile(path, 'utf8') };
    } catch (error: unknown) {
      if (isMissingSurface(error)) {
        return { kind: 'ok', value: undefined };
      }
      return { kind: 'error', message: `cannot read ${path}: ${String(error)}` };
    }
  },
  async removeDirectory(path) {
    await rm(path, { recursive: true, force: true });
  },
  resolveRealPath: (path) => realCarriageReadFs.resolveRealPath(path),
};

/**
 * Remove Practice-projection directories under `.claude/skills/` and
 * `.agents/skills/` before a fresh generation pass — exactly the
 * entries whose `SKILL.md` carries the class marker, whatever their
 * name (so a clear also collects projections generated under a
 * previous prefix). Entries without the marker are out of
 * jurisdiction and never touched; symlinked entries never reach the
 * marker read because `readdir` classifies them as symlinks, not
 * directories.
 *
 * The surface-root guard runs FIRST, per surface, before any `readdir`
 * or `rm`: a symlinked root or ancestor (the committed shape of the
 * estate's Vendor entries) would otherwise send the whole recursive
 * removal into a foreign tree — the channel security round 2
 * (2026-08-12) found open here. An unreadable surface or stub, or a
 * failed root resolution, aborts the clear with an error rather than
 * guessing.
 *
 * Path-based guards are TOCTOU-exposed under a concurrent local racer
 * (the `lstat`/`resolveRealPath` and the `rm` are separate syscalls);
 * under this pipeline's threat model — repo content authored via PR,
 * static during a run — that gap is not reachable, and a fd-anchored
 * cure would be disproportionate. Idempotent.
 */
export async function clearGeneratedAdapters(
  repoRoot: string,
  fs: ClearFs = realClearFs,
): Promise<ClearResult> {
  // Whole-run precondition: BOTH surface roots are guarded before ANY
  // removal, so a symlinked second root can never permit a partial
  // destructive pass over the first (the checker uses the same
  // before-acting shape). A failure here means nothing was removed.
  const rootFailures = await allSurfaceRootFailures(repoRoot, (path) => fs.resolveRealPath(path));
  if (rootFailures.length > 0) {
    return { kind: 'error', message: rootFailures.join('; ') };
  }
  const removed: string[] = [];
  for (const surface of PROJECTION_SURFACE_ROOTS) {
    const outcome = await clearSurface(join(repoRoot, surface), fs);
    if (outcome.kind === 'error') {
      return outcome;
    }
    removed.push(...outcome.removed);
  }
  return { kind: 'ok', removed };
}

/** Remove exactly a guarded surface's marker-carrying directories. An
 * unlistable surface or an unclassifiable stub aborts. */
async function clearSurface(root: string, fs: ClearFs): Promise<ClearResult> {
  const listed = await fs.listSubdirectoryNames(root);
  if (listed.kind === 'error') {
    return listed;
  }
  const removed: string[] = [];
  for (const name of listed.names) {
    const stub = await fs.readStubOrUndefined(join(root, name, 'SKILL.md'));
    if (stub.kind === 'error') {
      return stub;
    }
    if (stub.value !== undefined && parseAdapterStubPointer(stub.value) !== undefined) {
      await fs.removeDirectory(join(root, name));
      removed.push(join(root, name));
    }
  }
  return { kind: 'ok', removed };
}
