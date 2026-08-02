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
 * Filesystem seam for {@link clearGeneratedAdapters}, mirroring the
 * checker's injected-fs pattern so the destructive path is testable
 * without touching disk.
 */
export interface ClearFs {
  listSubdirectoryNames(path: string): Promise<readonly string[]>;
  removeDirectory(path: string): Promise<void>;
}

const defaultClearFs: ClearFs = {
  async listSubdirectoryNames(path) {
    const dirents = await readdir(path, { withFileTypes: true }).catch(() => []);
    return dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);
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
 * replaced by a real directory. Idempotent.
 */
export async function clearGeneratedAdapters(
  repoRoot: string,
  lockedIds: ReadonlySet<string>,
  fs: ClearFs = defaultClearFs,
): Promise<void> {
  for (const surface of ['.claude/skills', '.agents/skills']) {
    const root = join(repoRoot, surface);
    const names = await fs.listSubdirectoryNames(root);
    for (const name of names) {
      if (!lockedIds.has(name)) {
        await fs.removeDirectory(join(root, name));
      }
    }
  }
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
