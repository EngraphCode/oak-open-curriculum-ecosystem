import { describe, expect, it } from 'vitest';
import type { DtcgTokenTree } from './index.js';
import { validateTreeRoots } from './root-convention.js';

const REPO_IMPORT_ROOTS = ['color', 'semantic', 'component'] as const;

describe('validateTreeRoots', () => {
  it('accepts a tree whose root groups are all allowed, returning the roots found sorted', () => {
    // Declaration order differs from the asserted sorted order.
    const tree: DtcgTokenTree = {
      semantic: { 'text-primary': { $type: 'color', $value: '{color.ink}' } },
      color: { ink: { $type: 'color', $value: '#102033' } },
    };

    expect(validateTreeRoots(tree, REPO_IMPORT_ROOTS)).toEqual({
      ok: true,
      value: ['color', 'semantic'],
    });
  });

  it('rejects disallowed root groups such as the studio oak.* root, sorted', () => {
    // The disallowed roots are declared in reverse of the asserted order.
    const tree: DtcgTokenTree = {
      zeta: { extra: { $type: 'color', $value: '#ffffff' } },
      oak: { color: { ink: { $type: 'color', $value: '#102033' } } },
      semantic: { 'text-primary': { $type: 'color', $value: '{color.ink}' } },
    };

    expect(validateTreeRoots(tree, REPO_IMPORT_ROOTS)).toEqual({
      ok: false,
      error: { kind: 'disallowed_root_groups', disallowed: ['oak', 'zeta'] },
    });
  });

  it('ignores $-prefixed metadata keys at the root', () => {
    const tree: DtcgTokenTree = {
      $description: 'A tree with metadata',
      component: { 'shell-title': { $type: 'color', $value: '{semantic.text-primary}' } },
    };

    expect(validateTreeRoots(tree, REPO_IMPORT_ROOTS)).toEqual({
      ok: true,
      value: ['component'],
    });
  });
});
