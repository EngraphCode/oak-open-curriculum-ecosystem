import { describe, expect, it } from 'vitest';
import { requireSameStringMembers } from './require-same-string-members.js';

describe('requireSameStringMembers', () => {
  it('accepts the same members in a different order', () => {
    expect(() =>
      requireSameStringMembers('fixture', ['beta', 'alpha'], ['alpha', 'beta']),
    ).not.toThrow();
  });

  it('reports sorted expected and actual members when they differ', () => {
    expect(() => requireSameStringMembers('fixture', ['beta', 'alpha'], ['gamma'])).toThrow(
      'fixture differ\nexpected: ["alpha","beta"]\nactual: ["gamma"]',
    );
  });

  it('preserves duplicate multiplicity', () => {
    expect(() => requireSameStringMembers('fixture', ['alpha', 'alpha'], ['alpha'])).toThrow(
      'fixture differ',
    );
  });
});
