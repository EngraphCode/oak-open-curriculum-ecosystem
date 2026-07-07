import { describe, expect, it } from 'vitest';

import { findScopedBlockInText } from '../../src/hook-policy/matchers.js';
import type { ScopedContentBlockGroup } from '../../src/hook-policy/types.js';

/**
 * `findScopedBlockInText` is the path-less entry into the scoped-block
 * machinery for text that is not a file — the comms concept gate is its
 * consumer (comms events carry no path, so `include_paths` scoping cannot
 * apply and the CALLER owns concept selection). These tests describe the
 * matcher's contract: same literal case-insensitivity, same word-boundary
 * regex semantics, and same first-match-wins ordering as
 * `findAddedScopedBlock`, with no path involved.
 */

const literalGroup: ScopedContentBlockGroup = {
  concept: 'expediency-hedging',
  kind: 'literal',
  patterns: ['carve out', 'carve-out', 'quick fix'],
  include_paths: ['.agent/plans/'],
  exclude_paths: [],
  citation: 'PDR-044; principles.md §Architectural Excellence Over Expediency',
  reappraisal: 'State the design positively or reappraise the expediency.',
};

const regexGroup: ScopedContentBlockGroup = {
  concept: 'indefinite-deferral',
  kind: 'regex',
  patterns: [String.raw`\bparked\b`, String.raw`\bon hold\b`],
  include_paths: ['.agent/plans/'],
  exclude_paths: [],
  citation: 'no-hedging-vocabulary.md §Indefinite-deferral vocabulary',
  reappraisal: 'Name the gate and the decision, or delete the item.',
};

describe('findScopedBlockInText', () => {
  it('matches a literal pattern case-insensitively with no path in play', () => {
    const match = findScopedBlockInText('a Carve-Out for this cycle', [literalGroup]);

    expect(match).not.toBeNull();
    expect(match?.group.concept).toBe('expediency-hedging');
    expect(match?.matchedText).toBe('carve-out');
  });

  it('matches a word-bounded regex pattern and reports the matched text', () => {
    const match = findScopedBlockInText('this item is parked until later', [regexGroup]);

    expect(match).not.toBeNull();
    expect(match?.group.concept).toBe('indefinite-deferral');
    expect(match?.matchedText).toBe('parked');
  });

  it('does not fire a word-bounded pattern on a substring inside a longer word', () => {
    // The word-boundary discipline protects display names and ordinary
    // words that CONTAIN a family member ("Sparked" vs "parked" would
    // match, but "sparking"/"carparked" must not trip \bparked\b).
    expect(findScopedBlockInText('the carparked area', [regexGroup])).toBeNull();
  });

  it('returns null when no group pattern is present', () => {
    expect(
      findScopedBlockInText('plain coordination text, nothing special', [literalGroup, regexGroup]),
    ).toBeNull();
  });

  it('checks groups in declaration order — first match wins', () => {
    const match = findScopedBlockInText('a quick fix while this stays on hold', [
      literalGroup,
      regexGroup,
    ]);

    expect(match?.group.concept).toBe('expediency-hedging');
    expect(match?.matchedText).toBe('quick fix');
  });
});
