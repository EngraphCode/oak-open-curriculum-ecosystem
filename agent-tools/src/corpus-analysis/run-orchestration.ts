/**
 * Run-orchestration layer for the large-corpus-analysis harness Workflow templates.
 *
 * These pure functions harden the ~13M one-way discovery run against a session quota trip
 * (the v2 failure mode): candidate-granular resume re-spends only the unresolved tail, the
 * completeness assertion refuses to run meta over a partial validate, the post-reduce re-gate
 * recomputes cost from the REAL candidate count and hard-aborts before the expensive validate
 * spend, and deterministic jitter flattens the dispatch burst without a non-deterministic
 * clock (the sandbox forbids Math.random / Date — they break Workflow resume).
 *
 * The harness Workflow runs in a sandbox that cannot import repo code, so each template pastes a
 * type-stripped copy of the functions below. That copy is unit-tested HERE
 * (run-orchestration.unit.test.ts) but is NOT machine-pinned to the pasted `.mjs` — re-check each
 * pasted block against this source before each launch (README §Critical operational notes). A
 * repo-validator is the named home for machine-pinning when this tooling is promoted to agent-tools
 * scripts (corpus-analysis-conservation plan WS-C). The `.mjs` `postReduceRegate` computes the
 * worst-case directly (candidateCount x maxVoters x tokensPerVoter); it equals this module's
 * cost-model path only while `DEFAULT_EFFORT_MULTIPLIERS.low === 1` (pinned by
 * cost-and-coverage.unit.test.ts). NONE of this touches the frozen aggregation math
 * (`aggregation-recall.ts` / `aggregation-adjudication.ts` / `aggregation-verdict.ts`).
 */

import {
  estimatePipelineCost,
  MAX_VOTERS_PER_CANDIDATE,
  validateStagePlan,
  type CostEstimate,
} from './cost-and-coverage.js';

// ---------------------------------------------------------------------------
// Candidate-granular resume
// ---------------------------------------------------------------------------

/**
 * Filter a candidate seed to the unresolved tail. A re-seed after a quota trip passes the ids
 * already resolved in a prior run; only the remainder is re-dispatched, so a trip costs the
 * tail (~1M) rather than the whole validate stage (~8.6M). Seed order is preserved and the
 * input is not mutated; resolved ids absent from the seed are ignored.
 */
export function resolveResumeSeed<T extends { readonly id: string }>(
  seed: readonly T[],
  resolvedIds: readonly string[],
): T[] {
  const resolved = new Set(resolvedIds);
  return seed.filter((candidate) => !resolved.has(candidate.id));
}

// ---------------------------------------------------------------------------
// The extended completeness guard
// ---------------------------------------------------------------------------

export interface ValidatedCandidate {
  readonly candidateId: string;
  readonly disposition: 'keep' | 'kill' | 'reroute' | 'held-for-review';
  readonly reason?: string | null;
}

export interface CompletenessReport {
  /** True iff every candidate resolved terminally AND the validated count matches exactly. */
  readonly complete: boolean;
  /** Candidates that came back `held-for-review` — for ANY reason, not only retry-cap. */
  readonly incompleteCandidateIds: readonly string[];
  /** Candidates present in the seed but absent from validated (a silent drop). */
  readonly missingCandidateIds: readonly string[];
}

/**
 * Assert validate fully resolved before meta runs. The original guard only caught
 * `held-for-review` + `retry-cap`; this also catches a hold for ANY reason (quorum-tie,
 * lens-collision) and a candidate silently dropped from `validated` (e.g. a `.filter(Boolean)`
 * swallow), each of which would otherwise let meta score an incomplete run.
 */
export function assessValidateCompleteness(
  validated: readonly ValidatedCandidate[],
  candidates: readonly { readonly id: string }[],
): CompletenessReport {
  const incompleteCandidateIds = validated
    .filter((entry) => entry.disposition === 'held-for-review')
    .map((entry) => entry.candidateId);
  const validatedIds = new Set(validated.map((entry) => entry.candidateId));
  const missingCandidateIds = candidates
    .filter((candidate) => !validatedIds.has(candidate.id))
    .map((candidate) => candidate.id);
  const complete =
    incompleteCandidateIds.length === 0 &&
    missingCandidateIds.length === 0 &&
    validated.length === candidates.length;
  return { complete, incompleteCandidateIds, missingCandidateIds };
}

// ---------------------------------------------------------------------------
// Post-reduce cost re-gate + corrected calibration
// ---------------------------------------------------------------------------

/**
 * Observed all-in tokens per validate voter at high effort over grounding-heavy prompts,
 * measured first-hand in the v2 rerun (~50k, not the ~11k the original log-only gate assumed —
 * the "~5x-low" estimate that let the run overrun to ~13.2M). This is the high-effort actual
 * cost, so the cost model takes it FLAT (effort `low`, multiplier 1) — applying the high
 * multiplier on top would double-count it. Module-private: the public surface is
 * `postReduceRegate` (which defaults `tokensPerVoter` to this); the `.mjs` mirrors the literal.
 */
const OBSERVED_VALIDATE_TOKENS_PER_VOTER = 50_000;

export interface RegateResult {
  readonly estimate: CostEstimate;
  /** Worst-case validate tokens: candidates x max-voters-per-candidate x tokens-per-voter. */
  readonly worstCaseTokens: number;
  /** True iff the worst-case validate spend would breach the ceiling — the hard-abort signal. */
  readonly abort: boolean;
  readonly message: string;
}

/**
 * Recompute the validate-stage cost from the REAL post-reduce candidate count and decide
 * whether to hard-abort before dispatching any voter. Worst-case voter accounting (Tier 0 +
 * Tier 1 + the Tier-2 ensemble = 5) keeps the gate conservative — it over-warns, the correct
 * asymmetry for a spend gate. Built on the existing `validateStagePlan` / `estimatePipelineCost`
 * so the calibration threads through the already-tested cost model; `effort: 'low'` takes the
 * 50k all-in figure flat (no double multiplier).
 */
export function postReduceRegate(input: {
  readonly candidateCount: number;
  readonly ceiling: number;
  readonly tokensPerVoter?: number;
  readonly maxVotersPerCandidate?: number;
}): RegateResult {
  const tokensPerVoter = input.tokensPerVoter ?? OBSERVED_VALIDATE_TOKENS_PER_VOTER;
  const plan = validateStagePlan({
    candidateCount: input.candidateCount,
    tokensPerVoter,
    effort: 'low',
    maxVotersPerCandidate: input.maxVotersPerCandidate,
  });
  const estimate = estimatePipelineCost({ stages: [plan], ceiling: input.ceiling });
  const worstCaseTokens = estimate.totalTokens;
  const abort = !estimate.withinCeiling;
  const message = abort
    ? `POST-REDUCE HARD-ABORT: ${input.candidateCount} candidates x ${input.maxVotersPerCandidate ?? MAX_VOTERS_PER_CANDIDATE} worst-case voters x ${tokensPerVoter} = ${worstCaseTokens} tokens > ceiling ${input.ceiling}. Re-derive the ceiling or split the run; do NOT dispatch validate.`
    : `post-reduce re-gate OK: worst-case validate ${worstCaseTokens} tokens <= ceiling ${input.ceiling}`;
  return { estimate, worstCaseTokens, abort, message };
}

// ---------------------------------------------------------------------------
// Deterministic per-voter jitter
// ---------------------------------------------------------------------------

/**
 * A deterministic, bounded delay in [0, maxMs] derived from a voter id by an FNV-1a hash.
 * Used to stagger voter dispatch so a chunk does not hit the rate limit in a single burst.
 * Deterministic by construction (no Math.random / Date), so it is safe under Workflow resume:
 * the same voter id always yields the same delay, and on resume the cached agent results
 * return regardless of the delay.
 */
export function deterministicJitterMs(seed: string, maxMs: number): number {
  if (maxMs <= 0) {
    return 0;
  }
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % (maxMs + 1);
}
