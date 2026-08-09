import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { decodeUrlPath, resolveWithinRoot } from './static-path-guard';

const ROOT = path.resolve('/served/export-root');

describe('decodeUrlPath', () => {
  it('decodes and strips the query', () => {
    expect(decodeUrlPath('/whitelabel/specimen.html?brand=x')).toBe('/whitelabel/specimen.html');
    expect(decodeUrlPath('/Identity%20Switchboard.html')).toBe('/Identity Switchboard.html');
  });

  it('answers a malformed percent-escape with nothing, never a throw', () => {
    // This runs inside the http request listener — a throw there kills the
    // capture run with a raw URIError instead of a 404.
    expect(decodeUrlPath('/%zz')).toBeUndefined();
    expect(decodeUrlPath('/fonts/Lexend%')).toBeUndefined();
  });
});

describe('resolveWithinRoot', () => {
  it('resolves an in-root request to its filesystem path', () => {
    expect(resolveWithinRoot(ROOT, '/Identity%20Switchboard.html')).toBe(
      path.join(ROOT, 'Identity Switchboard.html'),
    );
  });

  it('strips a query string before resolving', () => {
    expect(resolveWithinRoot(ROOT, '/whitelabel/specimen.html?brand=x')).toBe(
      path.join(ROOT, 'whitelabel', 'specimen.html'),
    );
  });

  it('rejects traversal out of the root', () => {
    expect(resolveWithinRoot(ROOT, '/../secrets.txt')).toBeUndefined();
    expect(resolveWithinRoot(ROOT, '/a/../../b.txt')).toBeUndefined();
    expect(resolveWithinRoot(ROOT, '/%2e%2e/escape.txt')).toBeUndefined();
  });

  it('rejects a sibling directory sharing the root as a string prefix', () => {
    expect(resolveWithinRoot(ROOT, '/../export-root-evil/x.txt')).toBeUndefined();
  });

  it('rejects the bare root itself (a directory, not a file)', () => {
    expect(resolveWithinRoot(ROOT, '/')).toBeUndefined();
  });

  it('rejects a malformed percent-escape rather than throwing', () => {
    expect(resolveWithinRoot(ROOT, '/%zz')).toBeUndefined();
  });
});
