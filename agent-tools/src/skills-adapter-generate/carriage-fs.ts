/**
 * Filesystem seams and real-filesystem adapters for skill carriage
 * (`carriage.ts` owns the carriage logic; this module owns its I/O edge).
 * Carried content is handled as raw bytes end-to-end — assets are not
 * guaranteed to be UTF-8 text, and a decode/re-encode round trip is exactly
 * the byte instability carriage exists to prevent.
 *
 * Two error postures are load-bearing (review round 3, 2026-08-11):
 * absence means ENOENT and nothing else — any other filesystem failure
 * (EACCES, I/O) is a typed `failure` arm the caller must handle, because
 * reading a failure as "absent" lets a check certify a silent subset and
 * lets generation prune valid copies; and symlinks are never followed on
 * the write path — a projected symlink is unlinked before its path is
 * written, so canonical bytes can never land outside the projection tree.
 * The union shape follows ADR-088 / `clear.ts`: failures live in the type,
 * never in a thrown exception.
 */
import {
  chmod,
  copyFile,
  lstat,
  mkdir,
  readFile,
  readdir,
  rm,
  rmdir,
  stat,
} from 'node:fs/promises';
import { dirname } from 'node:path';

/** One seam read: the value, or a typed failure naming what went wrong. */
export type FsRead<T> =
  | { readonly kind: 'ok'; readonly value: T }
  | { readonly kind: 'failure'; readonly message: string };

const ok = <T>(value: T): FsRead<T> => ({ kind: 'ok', value });

/** Read-side seam: enough filesystem to enumerate and compare carried files. */
export interface CarriageReadFs {
  listSubdirectoryNames(path: string): Promise<FsRead<readonly string[]>>;
  listFileNames(path: string): Promise<FsRead<readonly string[]>>;
  /**
   * Entries that are neither regular files nor real directories — symlinks
   * (wherever they point), sockets, fifos. Carriage refuses these on the
   * canonical side and prunes them on the projection side; enumerating them
   * is what makes either posture possible.
   */
  listOtherEntryNames(path: string): Promise<FsRead<readonly string[]>>;
  /** File bytes; `undefined` iff the path is absent (ENOENT). */
  readFileBytesOrUndefined(path: string): Promise<FsRead<Uint8Array | undefined>>;
  /** Whether the file carries any executable bit; `undefined` iff absent. */
  isExecutableOrUndefined(path: string): Promise<FsRead<boolean | undefined>>;
}

/** Write-side seam: the read seam plus the copy/prune operations. */
export interface CarriageWriteFs extends CarriageReadFs {
  /**
   * Byte-stable copy, creating target parent directories as needed,
   * replacing (never writing through) a symlink at the target, and
   * carrying the source's mode so executable scripts stay executable.
   */
  copyFileWithParents(sourcePath: string, targetPath: string): Promise<void>;
  /** Remove a file or symlink (the link itself, never its target). */
  removeFile(path: string): Promise<void>;
  /** Remove a directory only if it is empty; a non-empty directory is left. */
  removeDirectoryIfEmpty(path: string): Promise<void>;
  /**
   * Remove a whole entry: a directory recursively, a file or symlink as
   * itself (never following into a link's target). The projection-root
   * sweep's instrument for stale skill directories.
   */
  removeEntryRecursive(path: string): Promise<void>;
}

function isAbsence(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

export const realCarriageReadFs: CarriageReadFs = {
  async listSubdirectoryNames(path) {
    return listDirentNames(path, (dirent) => dirent.isDirectory());
  },
  async listFileNames(path) {
    return listDirentNames(path, (dirent) => dirent.isFile());
  },
  async listOtherEntryNames(path) {
    return listDirentNames(path, (dirent) => !dirent.isFile() && !dirent.isDirectory());
  },
  async readFileBytesOrUndefined(path) {
    try {
      return ok(await readFile(path));
    } catch (error: unknown) {
      return isAbsence(error)
        ? ok(undefined)
        : { kind: 'failure', message: `cannot read ${path}: ${String(error)}` };
    }
  },
  async isExecutableOrUndefined(path) {
    try {
      return ok(((await stat(path)).mode & 0o111) !== 0);
    } catch (error: unknown) {
      return isAbsence(error)
        ? ok(undefined)
        : { kind: 'failure', message: `cannot stat ${path}: ${String(error)}` };
    }
  },
};

export const realCarriageWriteFs: CarriageWriteFs = {
  ...realCarriageReadFs,
  async copyFileWithParents(sourcePath, targetPath) {
    await mkdir(dirname(targetPath), { recursive: true });
    await removeSymlinkIfPresent(targetPath);
    await copyFile(sourcePath, targetPath);
    const sourceStat = await stat(sourcePath);
    await chmod(targetPath, sourceStat.mode & 0o777);
  },
  async removeFile(path) {
    await rm(path, { force: true });
  },
  async removeDirectoryIfEmpty(path) {
    try {
      await rmdir(path);
    } catch {
      // Non-empty or already gone — both are fine: only genuinely empty
      // directories are cleanup targets, and rmdir refuses the rest.
    }
  },
  async removeEntryRecursive(path) {
    await rm(path, { recursive: true, force: true });
  },
};

/** Unlink a symlink occupying the target path — `copyFile` would otherwise
 * write THROUGH it, landing canonical bytes at (or creating) the link's
 * external target. Anything else at the path is left for `copyFile`. */
async function removeSymlinkIfPresent(path: string): Promise<void> {
  let entryStat;
  try {
    entryStat = await lstat(path);
  } catch {
    return; // absent (or unreadable — copyFile then surfaces the real error)
  }
  if (entryStat.isSymbolicLink()) {
    await rm(path);
  }
}

async function listDirentNames(
  path: string,
  keep: (dirent: { isFile(): boolean; isDirectory(): boolean }) => boolean,
): Promise<FsRead<readonly string[]>> {
  let dirents;
  try {
    dirents = await readdir(path, { withFileTypes: true });
  } catch (error: unknown) {
    return isAbsence(error)
      ? ok([])
      : { kind: 'failure', message: `cannot list ${path}: ${String(error)}` };
  }
  return ok(dirents.filter((dirent) => keep(dirent)).map((dirent) => dirent.name));
}
