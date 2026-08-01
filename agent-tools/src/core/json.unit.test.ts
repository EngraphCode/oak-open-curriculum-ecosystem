import { unwrapErr, unwrapOrThrow } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { parseStringArray } from './json.js';

/**
 * Err-channel description of the core JSON Result primitives (ADR-088):
 * each error literal has ONE home, pinned by exact-message assertions.
 */

describe('parseStringArray', () => {
  it('passes a string array through unchanged', () => {
    const value = ['a', 'b'];

    expect(unwrapOrThrow(parseStringArray(value, 'files'))).toBe(value);
  });

  it('rejects a non-array naming the label', () => {
    expect(unwrapErr(parseStringArray('not an array', 'files')).message).toBe(
      'files must be an array of strings',
    );
  });

  it('rejects a sparse array with holes naming the label', () => {
    // every() skips holes, so an unguarded check would admit a value typed
    // readonly string[] whose first element reads as undefined.
    expect(unwrapErr(parseStringArray(new Array(1), 'files')).message).toBe(
      'files must be an array of strings',
    );
  });

  it('rejects an array with a non-string entry naming the label', () => {
    expect(unwrapErr(parseStringArray(['a', 1], 'files')).message).toBe(
      'files must be an array of strings',
    );
  });
});
