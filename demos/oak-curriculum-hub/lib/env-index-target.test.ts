import { describe, expect, it } from 'vitest';

import { resolveIndexTarget } from './env-index-target';

/**
 * The index-target config contract: unset/empty defaults to primary, the two
 * members pass through, and anything else is a loud configuration error — a
 * typo must never silently search the primary index while the operator
 * believes the sandbox is live.
 */
describe('resolveIndexTarget', () => {
  it('defaults to primary when the variable is unset or empty', () => {
    expect(resolveIndexTarget(undefined)).toEqual({ ok: true, value: 'primary' });
    expect(resolveIndexTarget('')).toEqual({ ok: true, value: 'primary' });
  });

  it('passes through the two closed-set members', () => {
    expect(resolveIndexTarget('primary')).toEqual({ ok: true, value: 'primary' });
    expect(resolveIndexTarget('sandbox')).toEqual({ ok: true, value: 'sandbox' });
  });

  it('rejects an unknown value as a configuration error naming the value', () => {
    const result = resolveIndexTarget('sandobx');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('"sandobx"');
      expect(result.error).toContain('SEARCH_INDEX_TARGET');
    }
  });
});
