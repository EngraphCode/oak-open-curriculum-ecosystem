import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { resolveWithinRoot } from './export-server';

const ROOT = path.resolve('/served/export');

describe('resolveWithinRoot', () => {
  it('resolves an in-root request to its filesystem path', () => {
    expect(resolveWithinRoot(ROOT, '/Oak%20Course.dc.html')).toBe(
      path.join(ROOT, 'Oak Course.dc.html'),
    );
  });

  it('strips a query string before resolving', () => {
    expect(resolveWithinRoot(ROOT, '/data/quality-standards.json?v=2')).toBe(
      path.join(ROOT, 'data', 'quality-standards.json'),
    );
  });

  it('rejects traversal out of the root', () => {
    expect(resolveWithinRoot(ROOT, '/../secrets.txt')).toBeUndefined();
    expect(resolveWithinRoot(ROOT, '/a/../../b.txt')).toBeUndefined();
    expect(resolveWithinRoot(ROOT, '/%2e%2e/escape.txt')).toBeUndefined();
  });

  it('rejects a sibling directory sharing the root as a string prefix', () => {
    expect(resolveWithinRoot(ROOT, '/../export-evil/x.txt')).toBeUndefined();
  });

  it('rejects the bare root itself (a directory, not a file)', () => {
    expect(resolveWithinRoot(ROOT, '/')).toBeUndefined();
  });
});
