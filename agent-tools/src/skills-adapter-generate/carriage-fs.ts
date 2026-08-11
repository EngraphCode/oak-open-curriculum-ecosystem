/**
 * Filesystem seams and real-filesystem adapters for skill carriage
 * (`carriage.ts` owns the carriage logic; this module owns its I/O edge).
 * Carried content is handled as raw bytes end-to-end — assets are not
 * guaranteed to be UTF-8 text, and a decode/re-encode round trip is exactly
 * the byte instability carriage exists to prevent.
 */
import { copyFile, mkdir, readFile, readdir, rm, rmdir } from 'node:fs/promises';
import { dirname } from 'node:path';

/** Read-side seam: enough filesystem to enumerate and compare carried files. */
export interface CarriageReadFs {
  listSubdirectoryNames(path: string): Promise<readonly string[]>;
  listFileNames(path: string): Promise<readonly string[]>;
  readFileBytesOrUndefined(path: string): Promise<Uint8Array | undefined>;
}

/** Write-side seam: the read seam plus the copy/prune operations. */
export interface CarriageWriteFs extends CarriageReadFs {
  /** Byte-stable copy, creating target parent directories as needed. */
  copyFileWithParents(sourcePath: string, targetPath: string): Promise<void>;
  removeFile(path: string): Promise<void>;
  /** Remove a directory only if it is empty; a non-empty directory is left. */
  removeDirectoryIfEmpty(path: string): Promise<void>;
}

export const realCarriageReadFs: CarriageReadFs = {
  async listSubdirectoryNames(path) {
    return listDirentNames(path, 'directory');
  },
  async listFileNames(path) {
    return listDirentNames(path, 'file');
  },
  async readFileBytesOrUndefined(path) {
    try {
      return await readFile(path);
    } catch {
      return undefined;
    }
  },
};

export const realCarriageWriteFs: CarriageWriteFs = {
  ...realCarriageReadFs,
  async copyFileWithParents(sourcePath, targetPath) {
    await mkdir(dirname(targetPath), { recursive: true });
    await copyFile(sourcePath, targetPath);
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
};

async function listDirentNames(path: string, kind: 'file' | 'directory'): Promise<string[]> {
  let dirents;
  try {
    dirents = await readdir(path, { withFileTypes: true });
  } catch {
    return [];
  }
  return dirents
    .filter((dirent) => (kind === 'file' ? dirent.isFile() : dirent.isDirectory()))
    .map((dirent) => dirent.name);
}
