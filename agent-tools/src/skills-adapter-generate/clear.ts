/**
 * Lock-aware clearing of generated adapter directories.
 *
 * Split from `generator.ts`: clearing is the one destructive path in
 * the pipeline, and it depends on the `skills-lock.json` trust
 * boundary in a way generation never does.
 */
import { readFile, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

import { loadLockedSkillIds } from './lock.js';

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
 * Result of {@link clearGeneratedAdapters}.
 */
export type ClearResult =
  { readonly kind: 'ok' } | { readonly kind: 'error'; readonly message: string };

/**
 * Filesystem seam for {@link clearGeneratedAdapters}, mirroring the
 * checker's injected-fs pattern so the destructive path is testable
 * without touching disk.
 */
export interface ClearFs {
  listSubdirectoryNames(path: string): Promise<ListSubdirectoryNamesResult>;
  removeDirectory(path: string): Promise<void>;
}

/**
 * Classify a `readdir` failure for the clear pass: only a genuinely
 * absent surface (ENOENT) reads as empty — any other failure (EACCES,
 * I/O error) must abort the clear rather than report success over
 * stale directories. Exported pure so the contract is testable without
 * real filesystem IO.
 */
export function isMissingSurface(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

/**
 * The real-filesystem {@link ClearFs}. Its error contract (absent
 * surface → empty; anything else → error) lives in the exported pure
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
  async removeDirectory(path) {
    await rm(path, { recursive: true, force: true });
  },
};

/**
 * Remove REAL adapter directories under `.claude/skills/` and
 * `.agents/skills/` before a fresh generation pass. Directories named
 * in `lockedIds` (lock-pinned vendored externals from
 * `skills-lock.json`) are never removed: generation cannot re-create
 * vendored content, so removing it would be unrecoverable outside git.
 * Symlinked entries are never touched — `readdir` classifies them as
 * symlinks, not directories — so a stale symlink outlives a clear; the
 * lock check still guards both surfaces in case a symlink is ever
 * replaced by a real directory. An unreadable surface aborts the clear
 * with an error rather than reading as empty. Idempotent.
 */
export async function clearGeneratedAdapters(
  repoRoot: string,
  lockedIds: ReadonlySet<string>,
  fs: ClearFs = realClearFs,
): Promise<ClearResult> {
  for (const surface of ['.claude/skills', '.agents/skills']) {
    const root = join(repoRoot, surface);
    const listed = await fs.listSubdirectoryNames(root);
    if (listed.kind === 'error') {
      return listed;
    }
    for (const name of listed.names) {
      if (!lockedIds.has(name)) {
        await fs.removeDirectory(join(root, name));
      }
    }
  }
  return { kind: 'ok' };
}

/**
 * Result of {@link readLockedSkillIds} — the lock read that gates a
 * clear pass.
 */
export type ReadLockedSkillIdsResult =
  | { readonly kind: 'ok'; readonly value: ReadonlySet<string> }
  | { readonly kind: 'error'; readonly message: string };

/**
 * Read and validate `skills-lock.json` for a clear pass. An unreadable
 * or invalid lock is an ERROR, never an empty set: only the lock says
 * which adapter directories are vendored externals that generation
 * cannot re-create, so an empty fallback would turn a bad cwd or a
 * corrupted lock into unrecoverable deletion. Callers refuse the clear
 * on the error arm.
 */
export async function readLockedSkillIds(
  lockPath: string,
  readTextFile: (path: string) => Promise<string> = async (path) => readFile(path, 'utf8'),
): Promise<ReadLockedSkillIdsResult> {
  let rawText: string;
  try {
    rawText = await readTextFile(lockPath);
  } catch (error: unknown) {
    return { kind: 'error', message: `cannot read ${lockPath}: ${String(error)}` };
  }
  const result = loadLockedSkillIds(rawText);
  if (result.kind === 'error') {
    return { kind: 'error', message: `invalid skills-lock.json (${result.error.message})` };
  }
  return { kind: 'ok', value: result.value };
}
