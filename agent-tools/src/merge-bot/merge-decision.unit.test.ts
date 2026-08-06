import { describe, expect, it } from 'vitest';

import { PR_VERDICT_STATES, type PrVerdict } from '../pr-watch/state-types.js';
import { decideMergeAction, verdictAwaitsSettlement } from './merge-decision.js';

/**
 * The verdict→action mapping is the heart of `merge-bot merge`: it acts only
 * on SETTLE-READY, and every other outcome is a typed refusal carrying the
 * verdict's own evidence. The estate's never-squash ruling and the
 * tip-consistency guarantee are pinned here as behaviour, not prose.
 */

const SETTLE_READY: PrVerdict = {
  state: 'SETTLE-READY',
  evidence: ['every expected reviewer leg settled; quiet window elapsed'],
};

const baseInput = {
  verdict: SETTLE_READY,
  allowMergeCommit: true,
  expectedDeclared: true,
} as const;

describe('decideMergeAction', () => {
  it('merges a settled verdict when merge commits are allowed and the expected set was declared', () => {
    const decision = decideMergeAction(baseInput);

    expect(decision).toEqual({ kind: 'merge' });
  });

  it('refuses every non-settled verdict, carrying the verdict state in the reason', () => {
    const nonSettled: PrVerdict = {
      state: 'CHECKS-RED',
      evidence: ['check lint: fail'],
    };

    const decision = decideMergeAction({ ...baseInput, verdict: nonSettled });

    expect(decision.kind).toBe('refuse');
    if (decision.kind === 'refuse') {
      expect(decision.reason).toContain('CHECKS-RED');
    }
  });

  it('refuses an already-merged PR — another actor merging is never this invocation merging', () => {
    const merged: PrVerdict = { state: 'MERGED', evidence: ['PR is merged'] };

    const decision = decideMergeAction({ ...baseInput, verdict: merged });

    expect(decision.kind).toBe('refuse');
    if (decision.kind === 'refuse') {
      expect(decision.reason).toContain('MERGED');
      expect(decision.reason).toContain('another');
    }
  });

  it('refuses when repo settings no longer allow merge commits, never falling back to squash', () => {
    const decision = decideMergeAction({ ...baseInput, allowMergeCommit: false });

    expect(decision.kind).toBe('refuse');
    if (decision.kind === 'refuse') {
      expect(decision.reason).toContain('merge commits');
      expect(decision.reason).not.toContain('squash instead');
    }
  });

  it('refuses when the expected reviewer set was defaulted rather than declared', () => {
    const decision = decideMergeAction({ ...baseInput, expectedDeclared: false });

    expect(decision.kind).toBe('refuse');
    if (decision.kind === 'refuse') {
      expect(decision.reason).toContain('--expect');
    }
  });
});

describe('verdictAwaitsSettlement', () => {
  // The CLOSED partition of the verdict set: exactly these three verdicts
  // resolve by waiting (checks finishing, a live review run completing, the
  // quiet window elapsing). Everything else needs an operator act or is
  // terminal, so polling on it would burn the budget silently. Iterating the
  // whole set means a verdict state added later FAILS here until it is
  // deliberately classified.
  const waitStates = ['SETTLING-QUIET-WINDOW', 'CHECKS-RUNNING', 'WAITING-REVIEW-RUN-LIVE'];

  it.each(PR_VERDICT_STATES)('classifies %s deliberately', (state) => {
    expect(verdictAwaitsSettlement(state)).toBe(waitStates.includes(state));
  });
});
