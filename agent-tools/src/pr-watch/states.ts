import type { CheckBucket, ChecksSummary } from './index.js';
import type { ReviewThreadsSummary } from './review-threads.js';

/**
 * The D1 verdict core for `agent-tools pr state`: resolve one compound
 * {@link PrStateReading} to exactly one verdict from the CLOSED
 * {@link PR_VERDICT_STATES} set. Pure and total — no IO, no throwing; the gh
 * seam lives in `state-gh.ts`. The set and precedence execute the pr-lifecycle
 * SKILL's review-round state machine (the SKILL stays canonical); per-check
 * verdicts travel BY NAME, never positionally (the #437 cure — fixtures in
 * `states.unit.test.ts`). `CLOSED` extends the plan's 11-state enumeration: a
 * closed-unmerged PR gets a typed refusal, never a mis-mapped healthy verdict.
 */

/** One status check carrying its verdict BY NAME. */
export interface NamedCheck {
  readonly name: string;
  readonly bucket: CheckBucket;
}

/** A reviewer's latest review, with the tip it reviewed (empty when gh omits it). */
export interface LatestReview {
  readonly author: string;
  /** `APPROVED` | `CHANGES_REQUESTED` | `COMMENTED` | `DISMISSED` | … */
  readonly state: string;
  readonly body: string;
  readonly commitOid: string;
}

/** One `gh agent-task` review run scoped to the PR; `completedAt` null = in flight. */
export interface ReviewRun {
  readonly id: string;
  readonly name: string;
  readonly completedAt: string | null;
}

/**
 * The review-run liveness leg. `unavailable` is a TYPED degradation (e.g. the
 * host lacks `gh agent-task`) — surfaced in evidence, never a silent pass.
 */
export type ReviewRunsLeg =
  | { readonly kind: 'read'; readonly runs: readonly ReviewRun[] }
  | { readonly kind: 'unavailable'; readonly reason: string };

/** The compound reading the verdict resolves — one struct, every leg present. */
export interface PrStateReading {
  readonly number: number;
  /** `OPEN` | `CLOSED` | `MERGED`. */
  readonly state: string;
  /** `MERGEABLE` | `CONFLICTING` | `UNKNOWN`. */
  readonly mergeable: string;
  /** `CLEAN` | `BLOCKED` | `BEHIND` | `DIRTY` | `UNSTABLE` | … */
  readonly mergeStateStatus: string;
  readonly headRefOid: string;
  readonly checks: ChecksSummary;
  readonly namedChecks: readonly NamedCheck[];
  readonly reviewThreads: ReviewThreadsSummary;
  readonly autoMergeArmed: boolean;
  /** Logins with an outstanding review request. */
  readonly reviewRequests: readonly string[];
  readonly latestReviews: readonly LatestReview[];
  readonly reviewRuns: ReviewRunsLeg;
}

/** The closed verdict set. Adding a state is a reviewed contract change. */
export const PR_VERDICT_STATES = [
  'SETTLE-READY',
  'WAITING-REVIEW-RUN-LIVE',
  'SILENT-WAIT-NO-REVIEWER',
  'SILENT-WAIT-RUN-DEAD',
  'CHECKS-RUNNING',
  'CHECKS-RED',
  'THREADS-OPEN',
  'ARMED-BEHIND-RED',
  'QUOTA-SKIPPED',
  'MERGED',
  'CLOSED',
  'CONFLICT-DIRTY',
] as const;

type PrVerdictState = (typeof PR_VERDICT_STATES)[number];

/** The verdict: one closed state plus the evidence lines that ground it. */
export interface PrVerdict {
  readonly state: PrVerdictState;
  readonly evidence: readonly string[];
}

// The quota-bounce signature (live specimen: PR #461, 2026-07-21 — a `claude`
// review whose body is a spend-limit notice, not a review). Conservative on
// purpose: both a skip phrase and a billing phrase must appear.
const QUOTA_SKIP_PATTERN = /review skipped/iu;
const QUOTA_CAUSE_PATTERN = /spend limit|overage|quota/iu;

function isQuotaBounce(review: LatestReview): boolean {
  return QUOTA_SKIP_PATTERN.test(review.body) && QUOTA_CAUSE_PATTERN.test(review.body);
}

function failedCheckNames(reading: PrStateReading): string[] {
  return reading.namedChecks
    .filter((check) => check.bucket === 'failed')
    .map((check) => check.name);
}

// A review satisfies the tip-bound leg when it reviewed the current head. An
// EMPTY commitOid is tolerated as tip-bound: `gh pr view latestReviews` can
// omit the oid (observed live 2026-07-21), and refusing it would mark every
// such PR permanently review-owed — the wrong failure direction for a leg
// whose authoritative read remains the Phase 3 harvest.
function isTipBound(review: LatestReview, headRefOid: string): boolean {
  return review.commitOid === '' || review.commitOid === headRefOid;
}

function hasTipBoundReview(reading: PrStateReading): boolean {
  return reading.latestReviews.some(
    (review) => !isQuotaBounce(review) && isTipBound(review, reading.headRefOid),
  );
}

function hasLiveReviewRun(reading: PrStateReading): boolean {
  return (
    reading.reviewRuns.kind === 'read' &&
    reading.reviewRuns.runs.some((run) => run.completedAt === null)
  );
}

function runsEvidence(reading: PrStateReading): string[] {
  return reading.reviewRuns.kind === 'unavailable'
    ? [`review-run liveness unavailable: ${reading.reviewRuns.reason}`]
    : [];
}

type VerdictRule = (reading: PrStateReading) => PrVerdict | undefined;

const terminalRules: readonly VerdictRule[] = [
  (r) => (r.state === 'MERGED' ? { state: 'MERGED', evidence: [] } : undefined),
  (r) =>
    r.state === 'CLOSED'
      ? { state: 'CLOSED', evidence: ['closed without merging — no healthy verdict exists'] }
      : undefined,
  (r) =>
    r.mergeable === 'CONFLICTING' || r.mergeStateStatus === 'DIRTY'
      ? {
          state: 'CONFLICT-DIRTY',
          evidence: [`mergeable=${r.mergeable} mergeStateStatus=${r.mergeStateStatus}`],
        }
      : undefined,
];

const checksAndThreadsRules: readonly VerdictRule[] = [
  (r) =>
    r.autoMergeArmed && r.checks.failed > 0
      ? {
          state: 'ARMED-BEHIND-RED',
          evidence: [
            'auto-merge is ARMED behind red — progresses nothing, alerts nobody',
            ...failedCheckNames(r).map((name) => `failed check: ${name}`),
          ],
        }
      : undefined,
  (r) =>
    r.checks.failed > 0
      ? {
          state: 'CHECKS-RED',
          evidence: failedCheckNames(r).map((name) => `failed check: ${name}`),
        }
      : undefined,
  // Zero checks are never vacuously green: absence of evidence is not a pass.
  (r) =>
    r.checks.pending > 0 || r.checks.passed === 0
      ? {
          state: 'CHECKS-RUNNING',
          evidence: [`checks ${r.checks.passed}/${r.checks.total} passed, none failed`],
        }
      : undefined,
  (r) =>
    r.reviewThreads.unresolved > 0
      ? {
          state: 'THREADS-OPEN',
          evidence: [
            `${r.reviewThreads.unresolved}/${r.reviewThreads.total} review threads unresolved`,
          ],
        }
      : undefined,
];

const reviewerLegRules: readonly VerdictRule[] = [
  (r) => {
    const bounced = r.latestReviews.filter((review) => isQuotaBounce(review));
    return bounced.length > 0
      ? {
          state: 'QUOTA-SKIPPED',
          evidence: bounced.map(
            (review) => `${review.author}: review skipped by quota/spend limit — not a review`,
          ),
        }
      : undefined;
  },
  (r) =>
    hasLiveReviewRun(r)
      ? { state: 'WAITING-REVIEW-RUN-LIVE', evidence: ['a review run is in flight'] }
      : undefined,
  (r) =>
    r.reviewRequests.length > 0
      ? {
          state: 'SILENT-WAIT-RUN-DEAD',
          evidence: [
            `review requested from ${r.reviewRequests.join(', ')} but no run is live`,
            ...runsEvidence(r),
          ],
        }
      : undefined,
  (r) =>
    hasTipBoundReview(r)
      ? undefined
      : {
          state: 'SILENT-WAIT-NO-REVIEWER',
          evidence: [
            'no review bound to the current tip and nobody is requested',
            ...runsEvidence(r),
          ],
        },
];

/**
 * Resolve the compound reading to its single verdict, most-blocking first:
 * terminal states, then conflict, then the armed/checks/threads ladder, then
 * the reviewer legs, then SETTLE-READY.
 */
export function computePrVerdict(reading: PrStateReading): PrVerdict {
  const rules = [...terminalRules, ...checksAndThreadsRules, ...reviewerLegRules];
  for (const rule of rules) {
    const verdict = rule(reading);
    if (verdict !== undefined) {
      return verdict;
    }
  }
  return {
    state: 'SETTLE-READY',
    evidence: [
      'checks green, threads resolved, tip-bound review present — ready to arm at settled',
      ...runsEvidence(reading),
    ],
  };
}
