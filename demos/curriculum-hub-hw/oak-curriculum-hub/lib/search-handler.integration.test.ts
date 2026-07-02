import { describe, it, expect } from 'vitest';
import { ok, err } from '@oaknational/result';

import { createSearchHandler } from './search-handler';
import { isSearchResults, type SearchResults } from './search-types';

/**
 * `createSearchHandler` binds an injected search function to the HTTP contract
 * of `/api/search`. The states it owns are the ones a CLIENT consumes: 200 +
 * results envelope, 200 + empty envelope for a blank query, 503 + the
 * not-configured error body, 502 + the failed error body. Only those
 * discriminants are asserted.
 */

const populated: SearchResults = {
  lessons: [
    {
      id: 'l-1',
      title: 'Comparing fractions',
      url: 'https://www.thenational.academy/teachers/lessons/comparing-fractions',
    },
  ],
  units: [],
  threads: [],
};

describe('createSearchHandler', () => {
  it('returns 200 with the results envelope when the search succeeds', async () => {
    const handler = createSearchHandler(() => Promise.resolve(ok(populated)));

    const res = await handler(new Request('http://x/api/search?q=fractions'));

    expect(res.status).toBe(200);
    const body: unknown = await res.json();
    expect(isSearchResults(body)).toBe(true);
    expect(body).toEqual(populated);
  });

  it('returns 200 with the empty envelope for a missing q, without running a search', async () => {
    // The searchFn would return hits — the empty envelope in the response is
    // the behavioural witness that a blank query short-circuits.
    const handler = createSearchHandler(() => Promise.resolve(ok(populated)));

    const res = await handler(new Request('http://x/api/search'));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ lessons: [], units: [], threads: [] });
  });

  it('returns 200 with the empty envelope for a whitespace-only q', async () => {
    const handler = createSearchHandler(() => Promise.resolve(ok(populated)));

    const res = await handler(new Request('http://x/api/search?q=%20%20'));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ lessons: [], units: [], threads: [] });
  });
});

describe('createSearchHandler error contract', () => {
  it('returns 503 with the not-configured error body when search is not configured', async () => {
    const handler = createSearchHandler(() => Promise.resolve(err({ kind: 'not_configured' })));

    const res = await handler(new Request('http://x/api/search?q=fractions'));

    expect(res.status).toBe(503);
    const body: unknown = await res.json();
    expect(body).toMatchObject({ error: 'search_not_configured' });
  });

  it('returns 502 with the failed error body when the search fails', async () => {
    const handler = createSearchHandler(() =>
      Promise.resolve(err({ kind: 'failed', message: 'es down' })),
    );

    const res = await handler(new Request('http://x/api/search?q=fractions'));

    expect(res.status).toBe(502);
    const body: unknown = await res.json();
    expect(body).toMatchObject({ error: 'search_failed' });
  });
});
