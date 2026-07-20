import { describe, expect, it } from 'vitest';

import { assertWindowCovered, fetchMergedPrs, MERGED_PR_JSON_FIELDS } from './gh-fetch.js';

const VALID_PAYLOAD = JSON.stringify([
  {
    number: 429,
    createdAt: '2026-07-20T08:00:00Z',
    mergedAt: '2026-07-20T19:19:49Z',
    isDraft: false,
    headRefName: 'jimcresswell/aip-137-dtcg-css-consistency-validator',
  },
]);

describe('fetchMergedPrs', () => {
  it('invokes gh by the given absolute path with an args array and parses the corpus', () => {
    const calls: { file: string; args: readonly string[] }[] = [];
    const result = fetchMergedPrs({
      executor: (file, args) => {
        calls.push({ file, args });
        return VALID_PAYLOAD;
      },
      ghPath: '/opt/homebrew/bin/gh',
      limit: 200,
      mergedSinceDate: '2026-07-13',
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0].number).toBe(429);
    }

    expect(calls).toHaveLength(1);
    expect(calls[0].file).toBe('/opt/homebrew/bin/gh');
    expect(calls[0].args).toContain('--limit');
    expect(calls[0].args).toContain('merged:>=2026-07-13');
    expect(calls[0].args).toContain(MERGED_PR_JSON_FIELDS);
  });

  it('returns a typed err on non-JSON output instead of throwing or reading it as empty', () => {
    const result = fetchMergedPrs({
      executor: () => 'API rate limit exceeded',
      ghPath: '/usr/bin/gh',
      limit: 10,
      mergedSinceDate: '2026-07-13',
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.message).toContain('non-JSON');
    }
  });

  it('returns a typed err when the payload shape drifts from the schema', () => {
    const result = fetchMergedPrs({
      executor: () => JSON.stringify([{ number: 'not-a-number' }]),
      ghPath: '/usr/bin/gh',
      limit: 10,
      mergedSinceDate: '2026-07-13',
    });

    expect(result.ok).toBe(false);
  });

  it('translates an executor throw (spawn failure) into a typed err', () => {
    const result = fetchMergedPrs({
      executor: () => {
        throw new Error('spawn EACCES');
      },
      ghPath: '/usr/bin/gh',
      limit: 10,
      mergedSinceDate: '2026-07-13',
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.message).toContain('EACCES');
    }
  });
});

describe('assertWindowCovered', () => {
  const inWindow = {
    number: 1,
    createdAt: '2026-07-19T10:00:00Z',
    mergedAt: '2026-07-19T11:00:00Z',
    isDraft: false,
    headRefName: 'feature/a',
  };

  it('refuses a merge-date-bounded fetch that hit its cap', () => {
    // Order proves nothing (gh lists by creation date), so cap-hit alone is
    // the refusal condition.
    const result = assertWindowCovered({
      prs: [inWindow, { ...inWindow, number: 3 }],
      limit: 2,
      windowDays: 7,
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.message).toContain('--limit');
    }
  });

  it('accepts an under-cap fetch (the bounded corpus is complete)', () => {
    expect(assertWindowCovered({ prs: [inWindow], limit: 200, windowDays: 7 }).ok).toBe(true);
  });
});
