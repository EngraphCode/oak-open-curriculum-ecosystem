import { isErr, isOk } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { loadPolicySnapshot, unwrapPolicySection } from './policy-snapshot.js';

const POLICY_URL_FIXTURE = new URL('file:///fixture/.agent/hooks/policy.json');

const VALID_POLICY_TEXT = JSON.stringify({
  hooks: {
    preToolUse: {
      blocked_patterns: [
        'git push --force',
        { pattern: 'git reset --hard', citation: 'never-use-git-to-remove-work' },
      ],
    },
    preToolUseContent: {
      blocked_patterns: ['OWNER-ONLY-MARKER'],
      scoped_blocks: [
        {
          concept: 'tombstone comment',
          patterns: ['removed for brevity'],
          include_paths: ['docs/'],
          citation: 'no-tombstones-for-removed-ideas',
        },
      ],
    },
  },
});

/** Counting reader seam: returns the fixture text and records call count. */
function countingReader(policyText: string): {
  readonly read: (policyUrl: URL) => Promise<string>;
  readonly calls: () => number;
} {
  let calls = 0;
  return {
    read: () => {
      calls += 1;
      return Promise.resolve(policyText);
    },
    calls: () => calls,
  };
}

describe('loadPolicySnapshot', () => {
  it('serves all three policy sections from exactly one read', async () => {
    const reader = countingReader(VALID_POLICY_TEXT);

    const snapshot = await loadPolicySnapshot(POLICY_URL_FIXTURE, reader.read);

    expect(reader.calls()).toBe(1);
    expect(isOk(snapshot.bashPatterns)).toBe(true);
    expect(isOk(snapshot.contentPatterns)).toBe(true);
    expect(isOk(snapshot.scopedBlocks)).toBe(true);
  });

  it('parses each section to the same values the section loaders produce', async () => {
    const reader = countingReader(VALID_POLICY_TEXT);

    const snapshot = await loadPolicySnapshot(POLICY_URL_FIXTURE, reader.read);

    expect(unwrapPolicySection(snapshot.bashPatterns)).toEqual([
      'git push --force',
      { pattern: 'git reset --hard', citation: 'never-use-git-to-remove-work' },
    ]);
    expect(unwrapPolicySection(snapshot.contentPatterns)).toEqual(['OWNER-ONLY-MARKER']);
    expect(unwrapPolicySection(snapshot.scopedBlocks)).toEqual([
      {
        concept: 'tombstone comment',
        patterns: ['removed for brevity'],
        include_paths: ['docs/'],
        citation: 'no-tombstones-for-removed-ideas',
      },
    ]);
  });

  it('propagates a read failure raw instead of degrading sections', async () => {
    const readError = new Error('EACCES: permission denied');

    await expect(
      loadPolicySnapshot(POLICY_URL_FIXTURE, () => Promise.reject(readError)),
    ).rejects.toBe(readError);
  });

  it('propagates a JSON parse failure raw instead of degrading sections', async () => {
    const reader = countingReader('{ not json');

    await expect(loadPolicySnapshot(POLICY_URL_FIXTURE, reader.read)).rejects.toThrow(SyntaxError);
  });

  it('fails only the bash section when hooks.preToolUse is missing', async () => {
    const reader = countingReader(
      JSON.stringify({
        hooks: {
          preToolUseContent: { blocked_patterns: ['OWNER-ONLY-MARKER'] },
        },
      }),
    );

    const snapshot = await loadPolicySnapshot(POLICY_URL_FIXTURE, reader.read);

    expect(isErr(snapshot.bashPatterns)).toBe(true);
    expect(() => unwrapPolicySection(snapshot.bashPatterns)).toThrow(
      'The canonical hook policy did not contain hooks.preToolUse.blocked_patterns.',
    );
    expect(unwrapPolicySection(snapshot.contentPatterns)).toEqual(['OWNER-ONLY-MARKER']);
    // parseScopedContentBlocks treats a present preToolUseContent section with
    // no scoped_blocks key as the empty set — preserved verbatim here.
    expect(unwrapPolicySection(snapshot.scopedBlocks)).toEqual([]);
  });

  it('fails only the content sections when hooks.preToolUseContent is missing', async () => {
    const reader = countingReader(
      JSON.stringify({
        hooks: {
          preToolUse: { blocked_patterns: ['git push --force'] },
        },
      }),
    );

    const snapshot = await loadPolicySnapshot(POLICY_URL_FIXTURE, reader.read);

    expect(unwrapPolicySection(snapshot.bashPatterns)).toEqual(['git push --force']);
    expect(() => unwrapPolicySection(snapshot.contentPatterns)).toThrow(
      'The canonical hook policy did not contain hooks.preToolUseContent.blocked_patterns.',
    );
    // Missing preToolUseContent degrades scoped blocks to the empty set today
    // (parseScopedContentBlocks returns [] for an absent section) — preserved.
    expect(unwrapPolicySection(snapshot.scopedBlocks)).toEqual([]);
  });

  it('fails only the scoped-blocks section when scoped_blocks is malformed', async () => {
    const reader = countingReader(
      JSON.stringify({
        hooks: {
          preToolUse: { blocked_patterns: ['git push --force'] },
          preToolUseContent: {
            blocked_patterns: ['OWNER-ONLY-MARKER'],
            scoped_blocks: 'not an array',
          },
        },
      }),
    );

    const snapshot = await loadPolicySnapshot(POLICY_URL_FIXTURE, reader.read);

    expect(unwrapPolicySection(snapshot.bashPatterns)).toEqual(['git push --force']);
    expect(unwrapPolicySection(snapshot.contentPatterns)).toEqual(['OWNER-ONLY-MARKER']);
    expect(() => unwrapPolicySection(snapshot.scopedBlocks)).toThrow(
      'The canonical hook policy hooks.preToolUseContent.scoped_blocks was malformed.',
    );
  });
});
