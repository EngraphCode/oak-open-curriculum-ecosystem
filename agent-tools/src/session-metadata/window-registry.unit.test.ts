import { describe, expect, it } from 'vitest';

import { resolveWindowTokens } from './window-registry.js';

describe('resolveWindowTokens', () => {
  it('resolves the 1M variant from the full model id with the [1m] marker', () => {
    expect(resolveWindowTokens('claude-opus-4-8[1m]')).toBe(1_000_000);
  });

  it('resolves the 200k default for the bare model id', () => {
    expect(resolveWindowTokens('claude-opus-4-8')).toBe(200_000);
  });

  it('returns undefined for an unknown model', () => {
    expect(resolveWindowTokens('some-future-model')).toBeUndefined();
  });
});
