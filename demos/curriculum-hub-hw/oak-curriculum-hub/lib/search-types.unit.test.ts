import { describe, it, expect } from 'vitest';

import { isSearchResults } from './search-types';

/**
 * `isSearchResults` is the client trust-boundary guard for the `/api/search`
 * JSON response: the client narrows the parsed body with it instead of a type
 * assertion. The states it must discriminate are the success envelope AND the
 * two sibling error envelopes the same route emits — a client must never
 * mistake an error body for results.
 */
describe('isSearchResults', () => {
  it('accepts a populated results envelope', () => {
    const envelope = {
      lessons: [{ id: 'l1', title: 'Comparing fractions', url: 'https://example.org/l1' }],
      units: [{ id: 'u1', title: 'Fractions', url: 'https://example.org/u1' }],
      threads: [{ id: 't1', title: 'Number', url: '' }],
    };
    expect(isSearchResults(envelope)).toBe(true);
  });

  it('accepts the all-empty envelope (a zero-hit search is still results)', () => {
    expect(isSearchResults({ lessons: [], units: [], threads: [] })).toBe(true);
  });

  it('accepts the E3 showcase envelope carrying highlights and per-scope meta', () => {
    const envelope = {
      lessons: [
        {
          id: 'l1',
          title: 'Comparing fractions',
          url: 'https://example.org/l1',
          highlights: ['first <em>match</em>', 'second <em>match</em>'],
        },
      ],
      units: [],
      threads: [],
      meta: { lessons: { total: 42, took: 7 }, units: { total: 0, took: 3 } },
    };
    expect(isSearchResults(envelope)).toBe(true);
  });

});

describe('isSearchResults rejections', () => {
  it('rejects null and non-object values', () => {
    expect(isSearchResults(null)).toBe(false);
    expect(isSearchResults(undefined)).toBe(false);
    expect(isSearchResults(42)).toBe(false);
    expect(isSearchResults('lessons')).toBe(false);
  });

  it('rejects envelopes with a missing scope field', () => {
    expect(isSearchResults({ lessons: [], units: [] })).toBe(false);
    expect(isSearchResults({ lessons: [], threads: [] })).toBe(false);
    expect(isSearchResults({ units: [], threads: [] })).toBe(false);
  });

  it('rejects the not-configured error envelope the route emits with 503', () => {
    expect(
      isSearchResults({
        error: 'search_not_configured',
        message: 'Set ELASTICSEARCH_URL and ELASTICSEARCH_API_KEY.',
      }),
    ).toBe(false);
  });

  it('rejects the failed error envelope the route emits with 502', () => {
    expect(isSearchResults({ error: 'search_failed' })).toBe(false);
  });
});
