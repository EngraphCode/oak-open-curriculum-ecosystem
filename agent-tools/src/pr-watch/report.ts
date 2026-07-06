import type { ChecksSummary, CommentRef, PrSnapshot } from './index.js';
import type { ReviewThreadsSummary } from './review-threads.js';

/**
 * Presentation for `pr-watch`: render a {@link PrSnapshot} to one human line,
 * and diff two snapshots into change lines. Kept separate from the parsing core
 * in `index.ts` so each module stays single-purpose.
 */

const SHORT_SHA_LENGTH = 8;

function reviewLabel(reviewDecision: string): string {
  return reviewDecision === '' ? '(none)' : reviewDecision;
}

function describeChecks(checks: ChecksSummary): string {
  return `${checks.passed}✓ ${checks.failed}✗ ${checks.pending}⋯`;
}

function describeThreads(threads: ReviewThreadsSummary): string {
  return `${threads.unresolved}/${threads.total}`;
}

function shortSha(sha: string): string {
  return sha.slice(0, SHORT_SHA_LENGTH);
}

/** One-line human-readable rendering of a snapshot. */
export function formatSnapshot(snapshot: PrSnapshot): string {
  return (
    `PR #${snapshot.number} ${snapshot.state} · ` +
    `merge=${snapshot.mergeable}/${snapshot.mergeStateStatus} · ` +
    `review=${reviewLabel(snapshot.reviewDecision)} · ` +
    `checks ${describeChecks(snapshot.checks)} · ` +
    `comments ${snapshot.reviewComments.length}r/${snapshot.issueComments.length}i · ` +
    `unresolved ${describeThreads(snapshot.reviewThreads)} · ` +
    `head ${shortSha(snapshot.headRefOid)}`
  );
}

function fieldChange(label: string, previous: string, next: string): string[] {
  return previous === next ? [] : [`${label}: ${previous} → ${next}`];
}

// Compare the FULL sha (so a force-push is never missed by an 8-char prefix
// collision) but display the short form.
function headChange(previous: string, next: string): string[] {
  return previous === next ? [] : [`head: ${shortSha(previous)} → ${shortSha(next)}`];
}

function newCommentLines(
  kind: string,
  previous: readonly CommentRef[],
  next: readonly CommentRef[],
): string[] {
  const seen = new Set(previous.map((comment) => comment.id));
  return next
    .filter((comment) => !seen.has(comment.id))
    .map((comment) => `new ${kind} comment from ${comment.author}`);
}

/**
 * Diff two snapshots into human-readable change lines — one per field that
 * changed, plus one per new review/issue comment. An empty array is the signal
 * a `--watch` loop uses to stay quiet.
 */
export function diffSnapshots(previous: PrSnapshot, next: PrSnapshot): string[] {
  return [
    ...fieldChange('state', previous.state, next.state),
    ...fieldChange('mergeable', previous.mergeable, next.mergeable),
    ...fieldChange('mergeStateStatus', previous.mergeStateStatus, next.mergeStateStatus),
    ...fieldChange(
      'review',
      reviewLabel(previous.reviewDecision),
      reviewLabel(next.reviewDecision),
    ),
    ...headChange(previous.headRefOid, next.headRefOid),
    ...fieldChange('checks', describeChecks(previous.checks), describeChecks(next.checks)),
    // Rendered-pair comparison fires in BOTH directions: a thread arriving or becoming
    // unresolved AND a thread being resolved each produce a line (the REST comment
    // surfaces are blind to resolution state, so this is the only wake signal for it).
    ...fieldChange(
      'unresolved threads',
      describeThreads(previous.reviewThreads),
      describeThreads(next.reviewThreads),
    ),
    ...newCommentLines('review', previous.reviewComments, next.reviewComments),
    ...newCommentLines('issue', previous.issueComments, next.issueComments),
  ];
}

/** Terminal PR states a `--watch` loop should stop on. */
export function isTerminalState(snapshot: PrSnapshot): boolean {
  return snapshot.state === 'MERGED' || snapshot.state === 'CLOSED';
}

/**
 * The house "green" bar for an open PR: every check concluded successfully
 * AND every review thread is resolved — passing checks alone are not green,
 * because unresolved threads block merge-readiness just as hard. A `--watch`
 * loop ends (successfully) the moment this holds, so a supervising agent is
 * woken at the first actionable moment instead of polling to exhaustion.
 * Zero-check PRs are never vacuously green (`passed > 0` is required):
 * absence of evidence is not a pass.
 */
export function isAllGreen(snapshot: PrSnapshot): boolean {
  return (
    snapshot.state === 'OPEN' &&
    snapshot.checks.passed > 0 &&
    snapshot.checks.failed === 0 &&
    snapshot.checks.pending === 0 &&
    snapshot.reviewThreads.unresolved === 0
  );
}

/**
 * The line ending a `--watch`, or undefined while the watch should continue:
 * terminal states (merged/closed) and the all-green bar are the two exits.
 */
export function watchEndLine(snapshot: PrSnapshot): string | undefined {
  if (isTerminalState(snapshot)) {
    return `PR #${snapshot.number} ${snapshot.state} — watch ending.\n`;
  }
  if (isAllGreen(snapshot)) {
    return `PR #${snapshot.number} all green — every check passed and every review thread resolved — watch ending.\n`;
  }
  return undefined;
}

/**
 * Emit the change lines between two snapshots (followed by the full next
 * snapshot line for re-orientation), or nothing when they are identical.
 */
export function emitChanges(
  stdout: Pick<NodeJS.WriteStream, 'write'>,
  previous: PrSnapshot,
  next: PrSnapshot,
): void {
  const changes = diffSnapshots(previous, next);
  if (changes.length === 0) {
    return;
  }
  for (const change of changes) {
    stdout.write(`${change}\n`);
  }
  stdout.write(`${formatSnapshot(next)}\n`);
}
