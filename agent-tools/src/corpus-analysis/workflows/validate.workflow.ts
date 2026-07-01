/**
 * VALIDATE stage workflow: the tiered adversary over the seeded candidates.
 *
 * @remarks
 * Thin composition root over the REAL tested modules — `adjudicate` (the deterministic
 * routing state machine), `resolveResumeSeed` (candidate-granular resume),
 * `postReduceRegate` (the hard money-gate: a ceiling breach returns a typed failure
 * BEFORE any voter is dispatched), `assessValidateCompleteness`, `runCapped` and
 * `deterministicJitterMs` (the shared throttle). Voter grounding is assembled from the
 * seeded grounding-leaf projection at vote time; a candidate with no resolvable
 * grounding fails `grounded` loudly in the prompt rather than silently.
 *
 * Meta is NEVER run inline here: it is its own stage over the merged dispositions, so
 * clean and resumed runs share one structural path.
 *
 * @packageDocumentation
 */

import { adjudicate } from '../aggregation-adjudication.js';
import type { AdversaryLens, VoterOutcome, Candidate } from '../judgment-schemas.js';
import {
  assessValidateCompleteness,
  deterministicJitterMs,
  postReduceRegate,
  resolveResumeSeed,
  runCapped,
  type ValidatedCandidate,
} from '../run-orchestration.js';
import { AGENT_JSON_SCHEMAS } from './agent-schemas.js';
import type { VoterJudgment } from './agent-schemas.js';
import type { HarnessAgent, HarnessLog, HarnessParallel, HarnessPhase } from './harness-types.js';
import { assembleGroundingLines, votePrompt } from './prompts.js';
import { RUN_DATA } from './run-data.js';
import { isValidateRunData, unseededRunDataError } from './stage-guards.js';
import type { GroundingLeaf, ValidateResult } from './stage-io.js';

declare const agent: HarnessAgent;
declare const parallel: HarnessParallel;
declare const phase: HarnessPhase;
declare const log: HarnessLog;

/** Max candidate adjudication loops in flight (each dispatches ≤3 voters at once). */
const MAX_CONCURRENCY = 3;
/** Max deterministic per-voter dispatch delay (ms) to flatten the burst. */
const JITTER_MS = 250;
/** Safety cap on adjudication rounds per candidate (the state machine terminates well before). */
const MAX_ROUNDS = 8;

interface AdjudicatedCandidate extends ValidatedCandidate {
  readonly outcomes: readonly VoterOutcome[];
}

async function dispatchVoter(input: {
  readonly candidate: Candidate;
  readonly groundingLines: string;
  readonly lens: AdversaryLens | undefined;
  readonly tier: VoterOutcome['tier'];
  readonly round: number;
  readonly index: number;
}): Promise<VoterOutcome> {
  const { candidate, groundingLines, lens, tier, round, index } = input;
  const voterId = `${candidate.id}:${tier}:r${round}:${index}`;
  if (typeof setTimeout === 'function' && JITTER_MS > 0) {
    await new Promise((done) => setTimeout(done, deterministicJitterMs(voterId, JITTER_MS)));
  }
  const judgment = await agent<VoterJudgment>(votePrompt({ candidate, lens, groundingLines }), {
    label: `vote:${candidate.id}:${tier}:${lens ?? 'plain'}`,
    phase: 'validate',
    model: 'opus',
    effort: 'high',
    schema: AGENT_JSON_SCHEMAS.voterJudgment,
  });
  if (judgment === null) {
    return {
      status: 'unadjudicated',
      candidateId: candidate.id,
      voterId,
      tier,
      reason: 'retry-cap',
    };
  }
  const verdict = lens === undefined ? judgment : { ...judgment, lens };
  return { status: 'adjudicated', candidateId: candidate.id, voterId, tier, verdict };
}

function adjudicateCandidateWith(leafById: ReadonlyMap<string, GroundingLeaf>) {
  return async function adjudicateCandidate(candidate: Candidate): Promise<AdjudicatedCandidate> {
    const groundingLines = assembleGroundingLines(candidate, leafById);
    const outcomes: VoterOutcome[] = [];
    for (let round = 0; round < MAX_ROUNDS; round += 1) {
      const step = adjudicate({ outcomes });
      if (step.kind === 'terminal') {
        return {
          candidateId: candidate.id,
          disposition: step.disposition,
          reason: step.reason ?? null,
          outcomes,
        };
      }
      const lenses = step.lenses ?? [];
      const voterIndexes = [...Array(step.voterCount).keys()];
      const voters = await parallel(
        voterIndexes.map(
          (index) => () =>
            dispatchVoter({
              candidate,
              groundingLines,
              lens: lenses[index],
              tier: step.tier,
              round,
              index,
            }),
        ),
      );
      for (const outcome of voters) {
        if (outcome !== null) {
          outcomes.push(outcome);
        }
      }
    }
    return {
      candidateId: candidate.id,
      disposition: 'held-for-review',
      reason: 'retry-cap',
      outcomes,
    };
  };
}

function assembleValidateResult(
  validated: readonly AdjudicatedCandidate[],
  candidates: readonly Candidate[],
): ValidateResult {
  const dispositionCounts = validated.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.disposition] = (acc[entry.disposition] ?? 0) + 1;
    return acc;
  }, {});
  const voterOutcomes = validated.flatMap((entry) => entry.outcomes);
  log(
    `validate done: ${JSON.stringify(dispositionCounts)}; ${voterOutcomes.length} voter outcomes`,
  );

  const completeness = assessValidateCompleteness(validated, candidates);
  if (!completeness.complete) {
    log(
      `validate INCOMPLETE — ${completeness.incompleteCandidateIds.length} held, ${completeness.missingCandidateIds.length} missing. Re-seed via resolvedIds; unresolved: ${[...completeness.incompleteCandidateIds, ...completeness.missingCandidateIds].join(',')}.`,
    );
  }

  return {
    ok: true,
    validateComplete: completeness.complete,
    resolvedCandidateIds: validated
      .filter((entry) => entry.disposition !== 'held-for-review')
      .map((entry) => entry.candidateId),
    incompleteCandidateIds: [...completeness.incompleteCandidateIds],
    missingCandidateIds: [...completeness.missingCandidateIds],
    dispositions: validated.map((entry) => ({
      candidateId: entry.candidateId,
      disposition: entry.disposition,
      reason: entry.reason ?? null,
    })),
    voterOutcomes,
  };
}

/** Run the validate stage over the seeded candidates. */
export async function main(): Promise<ValidateResult> {
  phase('validate');
  if (!isValidateRunData(RUN_DATA)) {
    return { ok: false, error: unseededRunDataError('validate') };
  }
  const { candidates: seeded, groundingLeaves, resolvedIds, validateTokenCeiling } = RUN_DATA;
  const candidates = resolveResumeSeed(seeded, resolvedIds);
  log(
    `seeded validate: ${seeded.length} seeded, ${seeded.length - candidates.length} already resolved, ${candidates.length} to validate, MAX_CONCURRENCY=${MAX_CONCURRENCY}`,
  );

  const regate = postReduceRegate({
    candidateCount: candidates.length,
    ceiling: validateTokenCeiling,
  });
  log(regate.message);
  if (regate.abort) {
    return { ok: false, error: regate.message };
  }

  const leafById = new Map(groundingLeaves.map((leaf) => [leaf.id, leaf]));
  const results = await runCapped(
    candidates,
    MAX_CONCURRENCY,
    adjudicateCandidateWith(leafById),
    parallel,
  );
  return assembleValidateResult(
    results.flatMap((entry) => (entry === null ? [] : [entry])),
    candidates,
  );
}
