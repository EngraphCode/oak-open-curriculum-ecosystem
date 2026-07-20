import { describe, expect, it } from 'vitest';

import { fetchMergedPrs, MERGED_PR_JSON_FIELDS } from './gh-fetch.js';

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
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0].number).toBe(429);
    }

    expect(calls).toHaveLength(1);
    expect(calls[0].file).toBe('/opt/homebrew/bin/gh');
    expect(calls[0].args).toContain('--limit');
    expect(calls[0].args).toContain(MERGED_PR_JSON_FIELDS);
  });

  it('returns a typed err on non-JSON output instead of throwing or reading it as empty', () => {
    const result = fetchMergedPrs({
      executor: () => 'API rate limit exceeded',
      ghPath: '/usr/bin/gh',
      limit: 10,
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
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.message).toContain('EACCES');
    }
  });
});
