/**
 * The identity-pack tier's filesystem reader — the I/O counterpart of the
 * pure `checkIdentityPackTier` policy in `boundary-inventory.ts`. Promoted
 * from `scripts/validate-boundaries.ts` (ADR-168 §5: a script complex
 * enough to need tests promotes its logic into `src/`), with the
 * filesystem injected (ADR-078) so the reader's boundary behaviour —
 * notably that symbolic links are refused by KIND and never dereferenced —
 * is provable with a fake.
 */
import { join } from 'node:path';

import type { IdentityPackTierEntry } from './boundary-inventory.js';

/** One directory entry as the reader classifies it — the lstat-semantics
 *  facts of the entry ITSELF, never its target: a symlink reports
 *  `isSymbolicLink` and NEITHER `isDirectory` nor `isFile`, exactly as
 *  Node's `Dirent` reports an unfollowed link. */
export interface TierDirent {
  readonly name: string;
  readonly isDirectory: boolean;
  readonly isFile: boolean;
  readonly isSymbolicLink: boolean;
}

/** The filesystem surface the reader consumes. `readDir` must carry
 *  unfollowed-link semantics (Node: `readdirSync(dir, { withFileTypes:
 *  true })`); `readTextFile` is only ever called for paths the inventory
 *  proved to be REGULAR files, so an adapter needs no lstat guard. */
export interface TierFileSystem {
  readonly exists: (path: string) => boolean;
  readonly readDir: (path: string) => readonly TierDirent[];
  readonly readTextFile: (path: string) => string;
}

/**
 * Every entry name the walk treats as a transient local artefact rather
 * than pack content. Enumerated, never pattern-matched: a blanket
 * dot-entry skip would hide committed content (`.npmrc`, an
 * `.eslintrc.json`, a hidden source directory) from the anatomy's
 * refusals, so anything not on this list — dot-prefixed or not — is
 * listed and validated.
 */
const TRANSIENT_ENTRY_NAMES: ReadonlySet<string> = new Set(['node_modules', '.turbo', '.DS_Store']);

/**
 * Pack-relative paths of every file and every symbolic link under packDir
 * (transient artefacts above excluded) — the input the pure anatomy check
 * enforces the data-only invariant over. Symlinks are LISTED, not
 * followed: a link is neither a directory nor a regular file, and
 * silently omitting it would let a pack carry linked source or an asset
 * link escaping the pack while reading well-shaped.
 */
export function listPackFiles(
  fileSystem: TierFileSystem,
  packDir: string,
): { files: string[]; symlinks: string[] } {
  const files: string[] = [];
  const symlinks: string[] = [];
  const walk = (dir: string, prefix: string): void => {
    for (const entry of fileSystem.readDir(dir)) {
      if (TRANSIENT_ENTRY_NAMES.has(entry.name)) {
        continue;
      }
      const relativePath = prefix === '' ? entry.name : `${prefix}/${entry.name}`;
      if (entry.isSymbolicLink) {
        symlinks.push(relativePath);
      } else if (entry.isDirectory) {
        walk(join(dir, entry.name), relativePath);
      } else if (entry.isFile) {
        files.push(relativePath);
      }
    }
  };
  walk(packDir, '');

  return { files, symlinks };
}

/**
 * Read the identity-pack tier into the policy's input shape. Two boundary
 * facts are load-bearing here:
 *
 * - A tier child that is itself a symbolic link becomes a
 *   `selfIsSymlink` entry, refused by KIND without inspection — an
 *   unfollowed directory-symlink reports `isSymbolicLink` and NOT
 *   `isDirectory`, so a directories-only filter would silently drop the
 *   pack from validation entirely, and walking or reading it would
 *   dereference the link (the escape this leg exists to refuse).
 * - Manifest presence derives from the NON-dereferencing inventory, not
 *   from an `exists`/read pair that follows links: a symlinked
 *   `package.json` sits in `symlinks` (refused by kind) with the manifest
 *   reported absent, and its target is never read.
 *
 * Non-directory, non-symlink tier children (the tier's own README.md)
 * stay outside the pack model, exactly as before.
 */
export function readIdentityPackTier(
  fileSystem: TierFileSystem,
  tierDir: string,
): { tierExists: boolean; entries: IdentityPackTierEntry[] } {
  if (!fileSystem.exists(tierDir)) {
    return { tierExists: false, entries: [] };
  }

  const entries = fileSystem
    .readDir(tierDir)
    // Local tooling artefacts (node_modules, .turbo and friends) are never
    // tier members and must not be misdiagnosed as malformed packs.
    .filter((entry) => entry.name !== 'node_modules' && !entry.name.startsWith('.'))
    .flatMap((entry): IdentityPackTierEntry[] => {
      if (entry.isSymbolicLink) {
        return [
          {
            directoryName: entry.name,
            packageJson: undefined,
            files: [],
            symlinks: [],
            selfIsSymlink: true,
          },
        ];
      }
      if (!entry.isDirectory) {
        return [];
      }

      const packDir = join(tierDir, entry.name);
      const { files, symlinks } = listPackFiles(fileSystem, packDir);

      if (!files.includes('package.json')) {
        return [{ directoryName: entry.name, packageJson: undefined, files, symlinks }];
      }

      try {
        const packageJson: unknown = JSON.parse(
          fileSystem.readTextFile(join(packDir, 'package.json')),
        );

        return [{ directoryName: entry.name, packageJson, files, symlinks }];
      } catch (error) {
        return [
          {
            directoryName: entry.name,
            packageJson: undefined,
            files,
            symlinks,
            parseFailure: error instanceof Error ? error.message : String(error),
          },
        ];
      }
    });

  return { tierExists: true, entries };
}
