import type {
  AdversaryLens,
  AdversaryVerdict,
  TestJudgment,
  UnadjudicatedReason,
  VoterOutcome,
} from './judgment-schemas.js';
import type { VerdictDisposition } from './aggregation-verdict.js';
import type { AdjudicationStep } from './aggregation-adjudication.js';

/**
 * SANDBOX MIRROR of the three in-flight routing functions —
 * `classifyVerdict`, `isBorderline`, and `adjudicate`.
 *
 * The harness Workflow that runs the validate stage executes in a JS sandbox that
 * CANNOT import repo code, yet it must make the same tier-escalation decisions in-flight
 * (Tier 0 → Tier 1 → the Tier-2 diverse-lens ensemble). So this file is a faithful,
 * dependency-free re-implementation of the routing core, written to be pasted verbatim
 * (minus the `import type` line and the type annotations, which compile/strip away) into
 * the Workflow script.
 *
 * `workflow-routing-mirror.conformance.test.ts` pins this mirror to the source of truth
 * (`./aggregation-verdict.ts` + `./aggregation-adjudication.ts`): it feeds a
 * branch-covering fixture through both and asserts identical output. Per the v2 runbook,
 * the mirror is the one place this logic is duplicated and the conformance test is
 * non-optional — never launch the Workflow with an unverified mirror. All NON-routing
 * aggregation (recall, the dual gate, integrity, coverage, corroboration) runs AFTER the
 * Workflow in the tsx driver against the real module, so only this small pure core is
 * mirrored, and the driver re-parses every judgment with the real zod boundary parsers.
 *
 * Keep this file byte-faithful to the two source modules. If either changes, the
 * conformance test goes red until this mirror is updated and re-pasted into the Workflow.
 */

const TESTS = (verdict: AdversaryVerdict): readonly TestJudgment[] => [
  verdict.grounded,
  verdict.baseRateHolds,
  verdict.survivesNull,
  verdict.notArtefact,
];

/** Mirror of `classifyVerdict` (aggregation-verdict.ts). */
export function classifyVerdict(verdict: AdversaryVerdict): VerdictDisposition {
  if (TESTS(verdict).every((test) => test.pass)) {
    return 'keep';
  }
  const failsOnlyBaseRate =
    !verdict.baseRateHolds.pass &&
    verdict.grounded.pass &&
    verdict.survivesNull.pass &&
    verdict.notArtefact.pass;
  if (failsOnlyBaseRate && verdict.importance === 'high') {
    return 'reroute';
  }
  return 'kill';
}

/** Mirror of `isBorderline` (aggregation-verdict.ts). */
export function isBorderline(verdict: AdversaryVerdict): boolean {
  if (classifyVerdict(verdict) !== 'keep') {
    return false;
  }
  return TESTS(verdict).some((test) => test.pass && test.confidence !== 'high');
}

const TIER_2_LENSES: readonly AdversaryLens[] = [
  'correctness-grounding',
  'base-rate',
  'null-reproduction',
];
const TIER_2_ENSEMBLE_SIZE = TIER_2_LENSES.length;

const dispatchTier2From = (alreadyDispatched: number): AdjudicationStep => ({
  kind: 'dispatch',
  tier: 'tier-2',
  voterCount: TIER_2_ENSEMBLE_SIZE - alreadyDispatched,
  lenses: TIER_2_LENSES.slice(alreadyDispatched),
});

const dispatchOne = (tier: 'tier-0' | 'tier-1'): AdjudicationStep => ({
  kind: 'dispatch',
  tier,
  voterCount: 1,
});

const terminal = (
  disposition: VerdictDisposition | 'held-for-review',
  reason?: UnadjudicatedReason,
): AdjudicationStep =>
  reason === undefined
    ? { kind: 'terminal', disposition }
    : { kind: 'terminal', disposition, reason };

function adjudicatedVerdicts(outcomes: readonly VoterOutcome[]): readonly AdversaryVerdict[] {
  return outcomes
    .filter(
      (outcome): outcome is Extract<VoterOutcome, { status: 'adjudicated' }> =>
        outcome.status === 'adjudicated',
    )
    .map((outcome) => outcome.verdict);
}

function tallyDispositions(
  dispositions: readonly VerdictDisposition[],
): Record<VerdictDisposition, number> {
  const tally: Record<VerdictDisposition, number> = { keep: 0, kill: 0, reroute: 0 };
  for (const disposition of dispositions) {
    tally[disposition] += 1;
  }
  return tally;
}

function finaliseQuorum(verdicts: readonly AdversaryVerdict[]): AdjudicationStep {
  if (verdicts.length < 2) {
    return terminal('held-for-review', 'retry-cap');
  }
  const lenses = verdicts.map((verdict) => verdict.lens);
  if (lenses.some((lens) => lens === undefined) || new Set(lenses).size !== lenses.length) {
    return terminal('held-for-review', 'lens-collision');
  }
  const tally = tallyDispositions(verdicts.map(classifyVerdict));
  const refuters = verdicts.length - tally.keep;
  if (tally.keep > refuters) {
    return terminal('keep');
  }
  if (tally.keep === refuters) {
    return terminal('held-for-review', 'quorum-tie');
  }
  if (tally.reroute >= 1 && tally.reroute >= tally.kill) {
    return terminal('reroute');
  }
  return terminal('kill');
}

function decideAfterCleanKeep(tier1: readonly VoterOutcome[]): AdjudicationStep {
  if (tier1.length === 0) {
    return dispatchOne('tier-1');
  }
  const confirmer = tier1[0];
  if (confirmer.status === 'unadjudicated') {
    return dispatchTier2From(0);
  }
  return classifyVerdict(confirmer.verdict) === 'keep' ? terminal('keep') : dispatchTier2From(0);
}

function decidePreEnsemble(
  tier0Outcome: VoterOutcome,
  tier1: readonly VoterOutcome[],
): AdjudicationStep {
  if (tier0Outcome.status === 'unadjudicated') {
    return tier1.length === 0 ? dispatchOne('tier-1') : dispatchTier2From(0);
  }
  const disposition = classifyVerdict(tier0Outcome.verdict);
  if (disposition === 'kill' || disposition === 'reroute' || isBorderline(tier0Outcome.verdict)) {
    // A kill escalates to the Tier-2 diverse-lens quorum (never terminal on one voter); only a
    // quorum may discard — conserve by default. Kept byte-faithful to aggregation-adjudication.ts.
    return dispatchTier2From(0);
  }
  return decideAfterCleanKeep(tier1);
}

/** Mirror of `adjudicate` (aggregation-adjudication.ts). */
export function adjudicate(input: {
  readonly outcomes: readonly VoterOutcome[];
}): AdjudicationStep {
  const outcomes = input.outcomes;
  if (outcomes.filter((outcome) => outcome.tier === 'tier-0').length === 0) {
    return dispatchOne('tier-0');
  }
  const tier2 = outcomes.filter((outcome) => outcome.tier === 'tier-2');
  if (tier2.length >= TIER_2_ENSEMBLE_SIZE) {
    return finaliseQuorum(adjudicatedVerdicts(tier2));
  }
  if (tier2.length > 0) {
    return dispatchTier2From(tier2.length);
  }
  const tier0Outcome = outcomes.find((outcome) => outcome.tier === 'tier-0');
  if (tier0Outcome === undefined) {
    return dispatchOne('tier-0');
  }
  return decidePreEnsemble(
    tier0Outcome,
    outcomes.filter((outcome) => outcome.tier === 'tier-1'),
  );
}
