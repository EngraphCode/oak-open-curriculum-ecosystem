import { unwrapErr, unwrapOrThrow } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { parseStringArray, parseStringArrayResult } from './json.js';

/**
 * Err-channel description of the core JSON Result primitives (ADR-088).
 * Each throwing sibling delegates through `unwrapOrThrow`, so the literal
 * has ONE home and the two surfaces cannot drift — pinned by asserting the
 * thrown message equals the Err message byte-for-byte.
 */

describe('parseStringArrayResult', () => {
  it('passes a string array through unchanged', () => {
    const value = ['a', 'b'];

    expect(unwrapOrThrow(parseStringArrayResult(value, 'files'))).toBe(value);
  });

  it('rejects a non-array naming the label', () => {
    expect(unwrapErr(parseStringArrayResult('not an array', 'files')).message).toBe(
      'files must be an array of strings',
    );
  });

  it('rejects an array with a non-string entry naming the label', () => {
    expect(unwrapErr(parseStringArrayResult(['a', 1], 'files')).message).toBe(
      'files must be an array of strings',
    );
  });

  it('the throwing sibling rethrows the SAME literal via the single home', () => {
    expect(() => parseStringArray(42, 'patterns')).toThrow('patterns must be an array of strings');
  });
});
