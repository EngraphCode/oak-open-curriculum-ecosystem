/**
 * Per-(reviewer, tip) leg computation for `pr state`, executing the
 * pr-lifecycle SKILL review-round state machine item 3 (the SKILL stays
 * canonical): each EXPECTED reviewer's leg reads SATISFIED, SKIPPED, or OWED,
 * evaluated against the FULL review harvest — never the per-author
 * `latestReviews` pointer, which moves BACKWARDS when an older-tip review job
 * completes after a newer push (the false-silent-wait class).
 *
 * The expected reviewer set is a DECLARED input (SKILL: read from the
 * repository's automatic-review configuration, declared by the shepherd) —
 * the caller supplies it; this module never infers it from who happened to
 * review.
 */

/** One review from the full paginated harvest (`reviews` connection). */
export interface HarvestedReview {
  readonly author: string;
  /** `APPROVED` | `CHANGES_REQUESTED` | `COMMENTED` | `DISMISSED` | … */
  readonly state: string;
  readonly body: string;
  /** Empty when gh omits the reviewed commit. */
  readonly commitOid: string;
  readonly submittedAt: string;
}

/** One expected reviewer's leg for the current tip. */
export interface ReviewerLeg {
  readonly reviewer: string;
  readonly state: 'SATISFIED' | 'SKIPPED' | 'OWED';
  readonly detail: string;
}

export interface ComputeReviewerLegsInput {
  readonly headRefOid: string;
  readonly expectedReviewers: readonly string[];
  readonly reviews: readonly HarvestedReview[];
  readonly reviewRequests: readonly string[];
  /** Max completedAt across green checks; null while checks are not yet green. */
  readonly checksGreenAt: string | null;
  /** Injected clock (ISO) — the quiet-window and timeout legs are time-bound. */
  readonly now: string;
}

/** SKILL item 3/4: the checks-green timeout and settled quiet window (more than 10 min). */
export const QUIET_WINDOW_MS = 10 * 60 * 1000;

// The quota/skip marker signature (scope-declared SKIPPED per the owner ruling
// 2026-07-21: a tip-bound quota notice settles the leg as SKIPPED — never as a
// zero-finding review). Both a skip phrase and a billing phrase must appear.
const SKIP_PATTERN = /review skipped|unable to review/iu;
const QUOTA_PATTERN = /spend limit|overage|quota/iu;

function isQuotaMarker(body: string): boolean {
  return SKIP_PATTERN.test(body) && QUOTA_PATTERN.test(body);
}

// Empty commitOid is tolerated as tip-bound (gh omits the oid on some review
// surfaces — observed live 2026-07-21); refusing it would read every such PR
// permanently review-owed, the wrong failure direction.
function bindsTip(review: HarvestedReview, headRefOid: string): boolean {
  return review.commitOid === '' || review.commitOid === headRefOid;
}

function elapsedMs(fromIso: string, nowIso: string): number {
  return Date.parse(nowIso) - Date.parse(fromIso);
}

function legFor(input: ComputeReviewerLegsInput, reviewer: string): ReviewerLeg {
  const tipBound = input.reviews.filter(
    (review) => review.author === reviewer && bindsTip(review, input.headRefOid),
  );
  if (tipBound.some((review) => !isQuotaMarker(review.body))) {
    return { reviewer, state: 'SATISFIED', detail: 'review binds current tip' };
  }
  if (tipBound.some((review) => isQuotaMarker(review.body))) {
    return {
      reviewer,
      state: 'SKIPPED',
      detail: 'tip-bound quota/skip marker (scope-declared; owner ruling 2026-07-21)',
    };
  }
  if (input.checksGreenAt !== null && elapsedMs(input.checksGreenAt, input.now) > QUIET_WINDOW_MS) {
    return {
      reviewer,
      state: 'SKIPPED',
      detail: `timeout: no tip-bound review one quiet window after checks green (${input.checksGreenAt})`,
    };
  }
  return { reviewer, state: 'OWED', detail: 'no review binds the current tip' };
}

/** Compute every expected reviewer's leg for the current tip, in declared order. */
export function computeReviewerLegs(input: ComputeReviewerLegsInput): ReviewerLeg[] {
  return input.expectedReviewers.map((reviewer) => legFor(input, reviewer));
}

/** The most blocking unresolved leg, or `settled` when nothing is OWED. */
export type BlockingLegVerdict =
  | { readonly kind: 'settled' }
  | {
      readonly kind: 'SILENT-WAIT-RUN-DEAD' | 'SILENT-WAIT-NO-REVIEWER' | 'WAITING-REVIEW-RUN-LIVE';
      readonly reviewer: string;
    };

export interface MostBlockingLegInput {
  readonly legs: readonly ReviewerLeg[];
  readonly reviewRequests: readonly string[];
  /** Reviewers with a live review run associated (bounded vendor mapping). */
  readonly liveRunReviewers: readonly string[];
}

/**
 * Resolve OWED legs to the most blocking per-reviewer verdict: a requested
 * reviewer with NO live run (run dead / never started) outranks an
 * unrequested reviewer, which outranks a benign live-run wait — so one
 * reviewer's live run can never mask another reviewer's stalled leg.
 */
export function mostBlockingLeg(input: MostBlockingLegInput): BlockingLegVerdict {
  const owed = input.legs.filter((leg) => leg.state === 'OWED');
  const requested = new Set(input.reviewRequests);
  const live = new Set(input.liveRunReviewers);

  const runDead = owed.find((leg) => requested.has(leg.reviewer) && !live.has(leg.reviewer));
  if (runDead !== undefined) {
    return { kind: 'SILENT-WAIT-RUN-DEAD', reviewer: runDead.reviewer };
  }
  const unrequested = owed.find((leg) => !requested.has(leg.reviewer));
  if (unrequested !== undefined) {
    return { kind: 'SILENT-WAIT-NO-REVIEWER', reviewer: unrequested.reviewer };
  }
  const waiting = owed[0];
  if (waiting !== undefined) {
    return { kind: 'WAITING-REVIEW-RUN-LIVE', reviewer: waiting.reviewer };
  }
  return { kind: 'settled' };
}
