import { describe, expect, it } from 'vitest';

import { computeReviewerLegs, mostBlockingLeg } from './reviewer-legs.js';
import type { HarvestedReview } from './reviewer-legs.js';

/**
 * Per-(reviewer, tip) leg computation per the pr-lifecycle SKILL's review-round
 * state machine item 3: SATISFIED / SKIPPED (marker or timeout) / OWED, with
 * the expected reviewer set as a DECLARED input, evaluated against the FULL
 * review harvest (never the per-author latestReviews pointer, which can move
 * backwards when an older-tip job completes late).
 */

const TIP = 'a'.repeat(40);
const OLD = 'b'.repeat(40);
const T0 = '2026-07-21T12:00:00Z';

function review(overrides: Partial<HarvestedReview>): HarvestedReview {
  return {
    author: 'copilot-pull-request-reviewer',
    state: 'COMMENTED',
    body: 'Reviewed.',
    commitOid: TIP,
    submittedAt: T0,
    ...overrides,
  };
}

const base: { headRefOid: string; checksGreenAt: string | null } = {
  headRefOid: TIP,
  checksGreenAt: '2026-07-21T11:50:00Z',
};

describe('computeReviewerLegs', () => {
  it('SATISFIED when ANY harvested review by the reviewer binds the tip', () => {
    // The backwards-pointer regression: an older-tip review submitted LATER
    // must not hide the earlier current-tip review (SKILL item 3).
    const legs = computeReviewerLegs({
      ...base,
      expectedReviewers: ['copilot-pull-request-reviewer'],
      reviews: [
        review({ submittedAt: '2026-07-21T12:01:00Z' }),
        review({ commitOid: OLD, submittedAt: '2026-07-21T12:05:00Z' }),
      ],
      reviewRequests: [],
      now: '2026-07-21T12:06:00Z',
    });
    expect(legs).toEqual([
      {
        reviewer: 'copilot-pull-request-reviewer',
        state: 'SATISFIED',
        detail: 'review binds current tip',
      },
    ]);
  });

  it('a tip-bound QUOTA bounce settles the leg as SKIPPED (owner ruling 2026-07-21), never SATISFIED', () => {
    const legs = computeReviewerLegs({
      ...base,
      expectedReviewers: ['claude'],
      reviews: [
        review({
          author: 'claude',
          body: '⚠️ **Code review skipped** — overage spend limit reached.',
        }),
      ],
      reviewRequests: [],
      now: '2026-07-21T12:06:00Z',
    });
    expect(legs[0]).toMatchObject({ reviewer: 'claude', state: 'SKIPPED' });
    expect(legs[0]?.detail).toContain('quota');
  });

  it('an OLD-tip quota marker does not skip the current tip (unscoped-marker discipline)', () => {
    const legs = computeReviewerLegs({
      ...base,
      checksGreenAt: '2026-07-21T12:05:00Z',
      expectedReviewers: ['claude'],
      reviews: [
        review({
          author: 'claude',
          commitOid: OLD,
          body: 'Code review skipped — quota.',
        }),
      ],
      reviewRequests: [],
      now: '2026-07-21T12:06:00Z',
    });
    expect(legs[0]?.state).toBe('OWED');
  });

  it('SKIPPED via timeout: checks green >10 min with no tip-bound review', () => {
    const legs = computeReviewerLegs({
      ...base,
      checksGreenAt: '2026-07-21T11:50:00Z',
      expectedReviewers: ['claude'],
      reviews: [],
      reviewRequests: [],
      now: '2026-07-21T12:01:00Z',
    });
    expect(legs[0]).toMatchObject({ reviewer: 'claude', state: 'SKIPPED' });
    expect(legs[0]?.detail).toContain('timeout');
  });

  it('OWED inside the checks-green window (no premature timeout), and OWED when checks not yet green', () => {
    const inWindow = computeReviewerLegs({
      ...base,
      checksGreenAt: '2026-07-21T11:55:00Z',
      expectedReviewers: ['claude'],
      reviews: [],
      reviewRequests: [],
      now: '2026-07-21T12:00:00Z',
    });
    expect(inWindow[0]?.state).toBe('OWED');
    const noGreen = computeReviewerLegs({
      ...base,
      checksGreenAt: null,
      expectedReviewers: ['claude'],
      reviews: [],
      reviewRequests: [],
      now: '2026-07-21T12:00:00Z',
    });
    expect(noGreen[0]?.state).toBe('OWED');
  });

  it('evaluates each expected reviewer independently (the collapsed-legs regression)', () => {
    const legs = computeReviewerLegs({
      ...base,
      checksGreenAt: '2026-07-21T11:56:00Z',
      expectedReviewers: ['copilot-pull-request-reviewer', 'claude'],
      reviews: [review({})],
      reviewRequests: [],
      now: '2026-07-21T12:00:00Z',
    });
    expect(legs.map((leg) => `${leg.reviewer}:${leg.state}`)).toEqual([
      'copilot-pull-request-reviewer:SATISFIED',
      'claude:OWED',
    ]);
  });
});

describe('mostBlockingLeg', () => {
  const owedClaude = { reviewer: 'claude', state: 'OWED' as const, detail: '' };

  it('a dead requested leg outranks another reviewer’s live run (per-reviewer, not PR-wide)', () => {
    const verdict = mostBlockingLeg({
      legs: [{ reviewer: 'copilot-pull-request-reviewer', state: 'OWED', detail: '' }, owedClaude],
      reviewRequests: ['copilot-pull-request-reviewer', 'claude'],
      liveRunReviewers: ['copilot-pull-request-reviewer'],
    });
    expect(verdict).toMatchObject({ kind: 'SILENT-WAIT-RUN-DEAD', reviewer: 'claude' });
  });

  it('an owed unrequested leg reads SILENT-WAIT-NO-REVIEWER', () => {
    expect(
      mostBlockingLeg({ legs: [owedClaude], reviewRequests: [], liveRunReviewers: [] }),
    ).toMatchObject({ kind: 'SILENT-WAIT-NO-REVIEWER', reviewer: 'claude' });
  });

  it('a requested leg with a live run reads WAITING-REVIEW-RUN-LIVE', () => {
    expect(
      mostBlockingLeg({
        legs: [owedClaude],
        reviewRequests: ['claude'],
        liveRunReviewers: ['claude'],
      }),
    ).toMatchObject({ kind: 'WAITING-REVIEW-RUN-LIVE', reviewer: 'claude' });
  });

  it('returns settled when no leg is OWED', () => {
    expect(
      mostBlockingLeg({
        legs: [{ reviewer: 'claude', state: 'SKIPPED', detail: 'quota' }],
        reviewRequests: [],
        liveRunReviewers: [],
      }),
    ).toEqual({ kind: 'settled' });
  });
});
