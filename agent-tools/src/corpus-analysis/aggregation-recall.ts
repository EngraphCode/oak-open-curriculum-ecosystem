import type { Baseline, RecallMatch, RecallVerdict } from './recall-schemas.js';

/**
 * Deterministic recall aggregation over the meta stage's per-baseline judgments.
 *
 * This is the v2 fix made concrete: the recall counts and fractions are computed here,
 * not self-reported by an LLM. The v1 defect — a meta agent claiming recall 0.72 while
 * its own per-baseline judgments summed to 0.28 strict and 0.56 lenient — is structurally
 * impossible, because the LLM no longer emits the aggregate.
 *
 * Counts are over DISTINCT baselines, not raw match rows: a meta agent that emitted two
 * matches for one baseline cannot inflate recall above 1.0 (a duplicate match is surfaced
 * separately by `findRecallIntegrityViolations`). Function names are query-shaped so a
 * future memory-event-graph swap (PDR-119 / ADR-200, Lens 4) is additive.
 */

/** Strict re-found gradings — same phenomenon at equal-or-finer grain. */
const STRICT_REFOUND_VERDICTS: ReadonlySet<RecallVerdict> = new Set([
  'subsumes',
  'refines',
  'equal',
]);

/** All re-found gradings under the lenient reading (strict plus partial matches). */
const LOOSE_REFOUND_VERDICTS: ReadonlySet<RecallVerdict> = new Set([
  'subsumes',
  'refines',
  'equal',
  'partial',
]);

const isStrictReFound = (match: RecallMatch): boolean => STRICT_REFOUND_VERDICTS.has(match.verdict);
const isLooseReFound = (match: RecallMatch): boolean => LOOSE_REFOUND_VERDICTS.has(match.verdict);

const distinctBaselineCount = (
  matches: readonly RecallMatch[],
  predicate: (match: RecallMatch) => boolean,
): number => new Set(matches.filter(predicate).map((match) => match.baselineId)).size;

export interface ReFoundCounts {
  readonly strict: number;
  readonly loose: number;
}

/**
 * Count strict and lenient re-found baselines from per-baseline recall matches.
 *
 * This is THE function the v1 bug needed: feed re-found judgments, get the counts the
 * meta agent got wrong. Counts are over DISTINCT baselines (a baseline matched twice
 * counts once). `missed` baselines count toward neither; `partial` counts only toward the
 * lenient total.
 */
export function countReFoundBaselines(matches: readonly RecallMatch[]): ReFoundCounts {
  return {
    strict: distinctBaselineCount(matches, isStrictReFound),
    loose: distinctBaselineCount(matches, isLooseReFound),
  };
}

export interface RecallFraction {
  readonly numerator: number;
  readonly denominator: number;
  /** numerator / denominator, or 0 when the denominator is 0 (a degenerate fixture). */
  readonly value: number;
}

export interface RecallReport {
  /** Re-found over all distinct baselines, regardless of population. */
  readonly strictOverall: RecallFraction;
  readonly looseOverall: RecallFraction;
  /** Re-found over the emergent subset only — Discovery's actual remit (the headline). */
  readonly strictWithinRemit: RecallFraction;
  readonly looseWithinRemit: RecallFraction;
  /** Whether the headline (strict within-remit) clears the calibration threshold. */
  readonly meetsThreshold: boolean;
}

function fraction(numerator: number, denominator: number): RecallFraction {
  return { numerator, denominator, value: denominator === 0 ? 0 : numerator / denominator };
}

/**
 * Compute the full stratified recall report. The headline (graduation gate) is strict
 * re-found over the emergent subset; single-window misses are out-of-remit and never
 * scored as Discovery misses. Numerators and denominators both count DISTINCT baselines,
 * so recall cannot exceed 1.0 even if the match array is malformed (such malformations are
 * surfaced by `findRecallIntegrityViolations`). A match whose baseline is absent from
 * `baselines` contributes to no total.
 */
export function recallReport(input: {
  readonly matches: readonly RecallMatch[];
  readonly baselines: readonly Baseline[];
  readonly threshold: number;
}): RecallReport {
  const knownIds = new Set(input.baselines.map((baseline) => baseline.id));
  const emergentIds = new Set(
    input.baselines
      .filter((baseline) => baseline.population === 'emergent')
      .map((baseline) => baseline.id),
  );
  const distinctReFound = (
    refound: (match: RecallMatch) => boolean,
    population: ReadonlySet<string>,
  ): number =>
    distinctBaselineCount(
      input.matches,
      (match) => population.has(match.baselineId) && refound(match),
    );

  const strictWithinRemitFraction = fraction(
    distinctReFound(isStrictReFound, emergentIds),
    emergentIds.size,
  );

  return {
    strictOverall: fraction(distinctReFound(isStrictReFound, knownIds), knownIds.size),
    looseOverall: fraction(distinctReFound(isLooseReFound, knownIds), knownIds.size),
    strictWithinRemit: strictWithinRemitFraction,
    looseWithinRemit: fraction(distinctReFound(isLooseReFound, emergentIds), emergentIds.size),
    meetsThreshold: strictWithinRemitFraction.value >= input.threshold,
  };
}

export interface RecallIntegrityViolation {
  readonly kind: 'duplicate-baseline-id' | 'duplicate-match' | 'unknown-baseline';
  readonly baselineId: string;
}

const duplicates = (ids: readonly string[]): readonly string[] => [
  ...new Set(ids.filter((id, index) => ids.indexOf(id) !== index)),
];

/**
 * Referential-integrity tripwires for the recall pass (v2 design change 8). Surfaces a
 * duplicate baseline id in the fixture, a baseline judged by more than one match, and a
 * match referencing a baseline absent from the fixture — the structural defects that
 * recallReport is built to tolerate but a run must never silently aggregate over.
 */
export function findRecallIntegrityViolations(input: {
  readonly matches: readonly RecallMatch[];
  readonly baselines: readonly Baseline[];
}): readonly RecallIntegrityViolation[] {
  const knownIds = new Set(input.baselines.map((baseline) => baseline.id));
  const duplicateBaselines = duplicates(input.baselines.map((baseline) => baseline.id)).map(
    (baselineId): RecallIntegrityViolation => ({ kind: 'duplicate-baseline-id', baselineId }),
  );
  const duplicateMatches = duplicates(input.matches.map((match) => match.baselineId)).map(
    (baselineId): RecallIntegrityViolation => ({ kind: 'duplicate-match', baselineId }),
  );
  const unknownMatches = input.matches
    .filter((match) => !knownIds.has(match.baselineId))
    .map(
      (match): RecallIntegrityViolation => ({
        kind: 'unknown-baseline',
        baselineId: match.baselineId,
      }),
    );
  return [...duplicateBaselines, ...duplicateMatches, ...unknownMatches];
}
