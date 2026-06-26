import { describe, expect, it } from 'vitest';

import { assertPathWithinBase } from './safe-path';

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
      '/app/diagnostics': '/app/diagnostics',
      '/app/diagnostics/report.json': '/app/diagnostics/report.json',
    });
    expect(
      assertPathWithinBase('/app/diagnostics/report.json', '/app/diagnostics', { realpath }),
    ).toBe('/app/diagnostics/report.json');
  });

  it('rejects a candidate that escapes the base via `..` traversal', () => {
    const realpath = canonical({
      '/app/diagnostics': '/app/diagnostics',
      '/app/diagnostics/../../etc/passwd': '/etc/passwd',
    });
    expect(() =>
      assertPathWithinBase('/app/diagnostics/../../etc/passwd', '/app/diagnostics', { realpath }),
    ).toThrow(/not within/u);
  });

  it('rejects a sibling whose name merely shares the base as a prefix', () => {
    const realpath = canonical({
      '/app/diagnostics': '/app/diagnostics',
      '/app/diagnostics-secret/report.json': '/app/diagnostics-secret/report.json',
    });
    expect(() =>
      assertPathWithinBase('/app/diagnostics-secret/report.json', '/app/diagnostics', { realpath }),
    ).toThrow(/not within/u);
  });

  it('rejects a candidate that escapes the base through a symlink', () => {
    // The candidate lexically sits under the base, but its real path (the
    // symlink target) is outside — the case a `path.resolve`-only check would
    // wrongly accept.
    const realpath = canonical({
      '/app/diagnostics': '/app/diagnostics',
      '/app/diagnostics/link.json': '/outside/secret.json',
    });
    expect(() =>
      assertPathWithinBase('/app/diagnostics/link.json', '/app/diagnostics', { realpath }),
    ).toThrow(/not within/u);
  });

  it('canonicalises the base before comparing, so a symlinked base still contains its children', () => {
    const realpath = canonical({
      '/symlinked-diagnostics': '/real/diagnostics',
      '/symlinked-diagnostics/report.json': '/real/diagnostics/report.json',
    });
    expect(
      assertPathWithinBase('/symlinked-diagnostics/report.json', '/symlinked-diagnostics', {
        realpath,
      }),
    ).toBe('/real/diagnostics/report.json');
  });

  it('throws when the candidate cannot be canonicalised (does not exist)', () => {
    const realpath = canonical({ '/app/diagnostics': '/app/diagnostics' });
    expect(() =>
      assertPathWithinBase('/app/diagnostics/missing.json', '/app/diagnostics', { realpath }),
    ).toThrow(/ENOENT/u);
  });
});
