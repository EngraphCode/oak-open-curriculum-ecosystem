import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { resolveAcrossRoots, resolveWithinRoot } from './export-server';

const STUDIO = path.resolve('/served/studio-source');
const KIT = path.resolve('/served/kit-root');
const ROOTS = [STUDIO, KIT] as const;

describe('resolveWithinRoot', () => {
  it('resolves an in-root request to its filesystem path', () => {
    expect(resolveWithinRoot(STUDIO, '/Identity%20Switchboard.html')).toBe(
      path.join(STUDIO, 'Identity Switchboard.html'),
    );
  });

  it('strips a query string before resolving', () => {
    expect(resolveWithinRoot(STUDIO, '/whitelabel/specimen.html?brand=x')).toBe(
      path.join(STUDIO, 'whitelabel', 'specimen.html'),
    );
  });

  it('rejects traversal out of the root', () => {
    expect(resolveWithinRoot(STUDIO, '/../secrets.txt')).toBeUndefined();
    expect(resolveWithinRoot(STUDIO, '/a/../../b.txt')).toBeUndefined();
    expect(resolveWithinRoot(STUDIO, '/%2e%2e/escape.txt')).toBeUndefined();
  });

  it('rejects a sibling directory sharing the root as a string prefix', () => {
    expect(resolveWithinRoot(STUDIO, '/../studio-source-evil/x.txt')).toBeUndefined();
  });

  it('rejects the bare root itself (a directory, not a file)', () => {
    expect(resolveWithinRoot(STUDIO, '/')).toBeUndefined();
  });
});

describe('resolveAcrossRoots (the studio overlay)', () => {
  it('serves from the first root when the file exists there', () => {
    const exists = (candidate: string): boolean => candidate.startsWith(STUDIO);

    expect(resolveAcrossRoots(ROOTS, '/whitelabel/specimen.html', exists)).toBe(
      path.join(STUDIO, 'whitelabel', 'specimen.html'),
    );
  });

  it('falls through to the second root when the first lacks the file', () => {
    const exists = (candidate: string): boolean => candidate.startsWith(KIT);

    expect(resolveAcrossRoots(ROOTS, '/colors_and_type.css', exists)).toBe(
      path.join(KIT, 'colors_and_type.css'),
    );
  });

  it('prefers the first root when the file exists in both', () => {
    const exists = (): boolean => true;

    expect(resolveAcrossRoots(ROOTS, '/components.css', exists)).toBe(
      path.join(STUDIO, 'components.css'),
    );
  });

  it('returns undefined when the file exists in neither root', () => {
    const exists = (): boolean => false;

    expect(resolveAcrossRoots(ROOTS, '/missing.css', exists)).toBeUndefined();
  });

  it('never resolves a URL outside the union of roots', () => {
    // The guard applies per root: a URL admitted by ANY root's
    // canonicalise-then-prefix check is served from that root (so
    // '/../kit-root/components.css' legitimately resolves inside KIT — same
    // content as '/components.css'). What must hold is the union invariant:
    // a URL whose canonical resolution lands outside EVERY root resolves
    // nowhere, even when the escaped-to file exists.
    const exists = (): boolean => true;

    expect(resolveAcrossRoots(ROOTS, '/../outside/escape.txt', exists)).toBeUndefined();
    expect(resolveAcrossRoots(ROOTS, '/%2e%2e/%2e%2e/etc/passwd', exists)).toBeUndefined();
    expect(resolveAcrossRoots(ROOTS, '/../kit-root-evil/x.txt', exists)).toBeUndefined();
  });
});
