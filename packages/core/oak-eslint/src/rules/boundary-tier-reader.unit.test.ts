import { describe, expect, it } from 'vitest';

import { checkIdentityPackTier } from './boundary-inventory.js';
import { listPackFiles, readIdentityPackTier } from './boundary-tier-reader.js';
import type { TierDirent, TierFileSystem } from './boundary-tier-reader.js';

const TIER = '/repo/packages/design/identities';

function dirent(name: string, kind: 'dir' | 'file' | 'symlink'): TierDirent {
  return {
    name,
    isDirectory: kind === 'dir',
    isFile: kind === 'file',
    isSymbolicLink: kind === 'symlink',
  };
}

/** In-memory TierFileSystem over a directory→entries map and a
 *  path→content map, recording every readTextFile call so a test can
 *  prove a path was NEVER dereferenced. */
function fakeFileSystem(
  directories: Record<string, readonly TierDirent[]>,
  fileContents: Record<string, string> = {},
): TierFileSystem & { readTextFileCalls: string[] } {
  const readTextFileCalls: string[] = [];
  return {
    readTextFileCalls,
    exists: (path) => path in directories || path in fileContents,
    readDir: (path) => directories[path] ?? [],
    readTextFile: (path) => {
      readTextFileCalls.push(path);
      const content = fileContents[path];
      if (content === undefined) {
        throw new Error(`fake filesystem has no file at ${path}`);
      }
      return content;
    },
  };
}

const packManifest = JSON.stringify({ name: '@oaknational/identity-pack-tango' });

describe('listPackFiles', () => {
  it('lists nested files and symlinks by pack-relative path, skipping only enumerated transients', () => {
    const fs = fakeFileSystem({
      [`${TIER}/tango`]: [
        dirent('package.json', 'file'),
        dirent('dtcg', 'dir'),
        dirent('node_modules', 'dir'),
        dirent('.turbo', 'dir'),
        dirent('.DS_Store', 'file'),
        dirent('escape-hatch', 'symlink'),
      ],
      [`${TIER}/tango/dtcg`]: [dirent('core.tokens.json', 'file'), dirent('linked', 'symlink')],
    });
    const { files, symlinks } = listPackFiles(fs, `${TIER}/tango`);
    expect(files).toEqual(['package.json', 'dtcg/core.tokens.json']);
    expect(symlinks).toEqual(['dtcg/linked', 'escape-hatch']);
  });
});

describe('readIdentityPackTier', () => {
  it('reports a missing tier directory', () => {
    const fs = fakeFileSystem({});
    expect(readIdentityPackTier(fs, TIER)).toEqual({ tierExists: false, entries: [] });
  });

  it('reads a well-shaped pack, with manifest presence derived from the inventory', () => {
    const fs = fakeFileSystem(
      { [TIER]: [dirent('tango', 'dir')], [`${TIER}/tango`]: [dirent('package.json', 'file')] },
      { [`${TIER}/tango/package.json`]: packManifest },
    );
    const { entries } = readIdentityPackTier(fs, TIER);
    expect(entries).toEqual([
      {
        directoryName: 'tango',
        packageJson: { name: '@oaknational/identity-pack-tango' },
        files: ['package.json'],
        symlinks: [],
      },
    ]);
  });

  it('surfaces a tier child that is itself a symlink as a refusable entry — never dropped, never followed', () => {
    // REGRESSION (PR #909 round-3 thread): an unfollowed directory-symlink
    // reports isSymbolicLink and NOT isDirectory, so a directories-only
    // filter silently dropped the pack from validation entirely.
    const fs = fakeFileSystem({ [TIER]: [dirent('tango', 'symlink')] });
    const { tierExists, entries } = readIdentityPackTier(fs, TIER);
    expect(tierExists).toBe(true);
    expect(entries).toEqual([
      {
        directoryName: 'tango',
        packageJson: undefined,
        files: [],
        symlinks: [],
        selfIsSymlink: true,
      },
    ]);
    // The policy end of the same regression: the entry is refused, so the
    // tier can never validate OK while carrying a symlinked pack.
    expect(checkIdentityPackTier(tierExists, entries).join('\n')).toContain('is a symbolic link');
    expect(fs.readTextFileCalls).toEqual([]);
  });

  it('reports a symlinked package.json as an absent manifest WITHOUT dereferencing it', () => {
    // REGRESSION (PR #909 round-3 thread): exists/read both follow links,
    // so the validator read outside the pack boundary before refusing.
    // The fake carries a perfectly valid manifest at the link path — if the
    // reader dereferenced, packageJson would parse and the calls list would
    // name the path.
    const fs = fakeFileSystem(
      { [TIER]: [dirent('tango', 'dir')], [`${TIER}/tango`]: [dirent('package.json', 'symlink')] },
      { [`${TIER}/tango/package.json`]: packManifest },
    );
    const { entries } = readIdentityPackTier(fs, TIER);
    expect(entries).toEqual([
      {
        directoryName: 'tango',
        packageJson: undefined,
        files: [],
        symlinks: ['package.json'],
      },
    ]);
    expect(fs.readTextFileCalls).toEqual([]);
  });

  it('reports an unparseable manifest as parseFailure, still listing the pack contents', () => {
    const fs = fakeFileSystem(
      { [TIER]: [dirent('tango', 'dir')], [`${TIER}/tango`]: [dirent('package.json', 'file')] },
      { [`${TIER}/tango/package.json`]: 'not json' },
    );
    const { entries } = readIdentityPackTier(fs, TIER);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.packageJson).toBeUndefined();
    expect(entries[0]?.parseFailure).toBeDefined();
  });

  it('keeps non-directory, non-symlink tier children (the tier README) outside the pack model', () => {
    const fs = fakeFileSystem({ [TIER]: [dirent('README.md', 'file')] });
    expect(readIdentityPackTier(fs, TIER).entries).toEqual([]);
  });
});
