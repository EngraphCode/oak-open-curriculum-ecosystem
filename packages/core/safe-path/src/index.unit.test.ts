import { describe, expect, it } from 'vitest';

import { assertPathWithinBase } from './index';

// A pure `realpath` stand-in: maps each input to its canonical (symlink- and
// `..`-resolved) form — the same transformation the real `realpathSync`
// performs — without touching the filesystem. Unknown inputs throw, as
// `realpathSync` does for a path that does not exist.
const canonical =
  (table: Record<string, string>) =>
  (path: string): string => {
    const resolved = table[path];
    if (resolved === undefined) {
      throw new Error(`ENOENT: no such file or directory, realpath '${path}'`);
    }
    return resolved;
  };

describe('assertPathWithinBase', () => {
  it('returns the canonical candidate path when it resolves inside the base', () => {
    const realpath = canonical({
      '/base': '/base',
      '/base/run.json': '/base/run.json',
    });
    expect(assertPathWithinBase('/base/run.json', '/base', { realpath })).toBe('/base/run.json');
  });

  it('rejects a candidate that escapes the base via `..` traversal', () => {
    const realpath = canonical({ '/base': '/base', '/base/../etc/passwd': '/etc/passwd' });
    expect(() => assertPathWithinBase('/base/../etc/passwd', '/base', { realpath })).toThrow(
      /not within/u,
    );
  });

  it('rejects a sibling whose name merely shares the base as a prefix', () => {
    const realpath = canonical({
      '/base': '/base',
      '/base-secret/data.json': '/base-secret/data.json',
    });
    expect(() => assertPathWithinBase('/base-secret/data.json', '/base', { realpath })).toThrow(
      /not within/u,
    );
  });

  it('rejects a candidate that escapes the base through a symlink', () => {
    // The candidate lexically sits under the base, but its real path (the
    // symlink target) is outside — the case a `path.resolve`-only check would
    // wrongly accept.
    const realpath = canonical({ '/base': '/base', '/base/link': '/outside/secret.json' });
    expect(() => assertPathWithinBase('/base/link', '/base', { realpath })).toThrow(/not within/u);
  });

  it('canonicalises the base before comparing, so a symlinked base still contains its children', () => {
    const realpath = canonical({
      '/symlinked-base': '/real/base',
      '/symlinked-base/child.json': '/real/base/child.json',
    });
    expect(
      assertPathWithinBase('/symlinked-base/child.json', '/symlinked-base', { realpath }),
    ).toBe('/real/base/child.json');
  });

  it('throws when the candidate cannot be canonicalised (does not exist)', () => {
    const realpath = canonical({ '/base': '/base' });
    expect(() => assertPathWithinBase('/base/missing.json', '/base', { realpath })).toThrow(
      /ENOENT/u,
    );
  });
});
