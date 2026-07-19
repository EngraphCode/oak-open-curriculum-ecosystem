/**
 * public/oak-theme.js is a tracked copy of the design system's theme runtime
 * (the kit docs §4 consumer shape — the layout inlines it by plain relative
 * read because bundler module resolution cannot supply a real fs path). The
 * copy exists only for that serving constraint: the workspace package stays
 * the single source, and this test turns any drift between the two into a
 * red test instead of a silent fork.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));

describe('oak-theme.js parity', () => {
  it('the public/ copy is byte-identical to the workspace package source', () => {
    const packagePath = createRequire(import.meta.url).resolve(
      '@oaknational/oak-design-system/oak-theme.js',
    );
    const copy = readFileSync(join(here, '..', 'public', 'oak-theme.js'), 'utf8');
    const source = readFileSync(packagePath, 'utf8');
    expect(copy).toBe(source);
  });
});
