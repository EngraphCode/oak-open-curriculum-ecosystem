/**
 * VALIDATE stage workflow: 2 independent voters per judgment-needed cluster; code
 * computes the disposition.
 *
 * @remarks
 * A cluster with fewer than 2 adjudicated voters (a dead agent) is NOT resolved — it
 * surfaces as `incompleteClusterIds`, never silently defaulted to a disposition, so a
 * resume re-spends only the tail. `dispositionFromVoters` is the sole place a disposition
 * is computed; a voter never emits one (`.agent/rules/validators-must-recompute-not-just-record.md`).
 *
 * @packageDocumentation
 */

import type {
  HarnessAgent,
  HarnessLog,
  HarnessParallel,
  HarnessPhase,
} from '../../corpus-analysis/workflows/harness-types.js';
import { runCapped } from '../../corpus-analysis/run-orchestration.js';
import { dispositionFromVoters } from '../disposition.js';
import type { Cluster, VoterVerdict } from '../schemas.js';
import { AGENT_JSON_SCHEMAS } from './agent-schemas.js';
import type { VoterStageOutput } from './agent-schemas.js';
import { votePrompt } from './prompts.js';
import { RUN_DATA, RUN_DATA_STAGE } from './run-data.js';
import { isValidateRunData, unseededRunDataError } from './stage-guards.js';
import type { GroundingInstance, ValidateResult } from './stage-io.js';

declare const agent: HarnessAgent;
declare const parallel: HarnessParallel;
declare const phase: HarnessPhase;
declare const log: HarnessLog;

/** Peak in-flight cluster-voting rounds (each round dispatches 2 voters). */
const VALIDATE_CONCURRENCY = 4;

/**
 * Worst-case token estimate per voter call for the pre-dispatch hard-abort. Held at the
 * sibling module's MEASURED figure (corpus-analysis `OBSERVED_VALIDATE_TOKENS_PER_VOTER`
 * = 50,000, first-hand) rather than this fleet's original 15,000 guess — an
 * under-estimate makes the abort gate under-protective and lets a ceiling-blowing run
 * dispatch. Restatement voters ground on a handful of 200-char-capped quotes and are
 * plausibly several-fold cheaper: REPLACE this with the S3 cost pilot's measured figure
 * before any full dispatch; never re-derive it from priors.
 */
const ESTIMATED_TOKENS_PER_VOTER = 50_000;

async function voteOnCluster(
  cluster: Cluster,
  members: readonly GroundingInstance[],
): Promise<{ readonly cluster: Cluster; readonly verdicts: readonly VoterVerdict[] }> {
  const prompt = votePrompt({ cluster, members });
  const outcomes = await parallel([
    () =>
      agent<VoterStageOutput>(prompt, {
        label: `validate:${cluster.id}:v1`,
        phase: 'validate',
        model: 'sonnet',
        effort: 'high',
        agentType: 'corpus-voter',
        schema: AGENT_JSON_SCHEMAS.voterStage,
      }),
    () =>
      agent<VoterStageOutput>(prompt, {
        label: `validate:${cluster.id}:v2`,
        phase: 'validate',
        model: 'sonnet',
        effort: 'high',
        agentType: 'corpus-voter',
        schema: AGENT_JSON_SCHEMAS.voterStage,
      }),
  ]);
  const verdicts = outcomes.flatMap((outcome) => (outcome === null ? [] : [outcome]));
  return { cluster, verdicts };
}

interface VoteRound {
  readonly cluster: Cluster;
  readonly verdicts: readonly VoterVerdict[];
}

interface AggregatedValidation {
  readonly resolvedClusterIds: readonly string[];
  readonly incompleteClusterIds: readonly string[];
  readonly dispositions: readonly {
    readonly clusterId: string;
    readonly disposition: ReturnType<typeof dispositionFromVoters>;
    readonly reason: string | null;
  }[];
  readonly voterVerdicts: readonly {
    readonly clusterId: string;
    readonly voterId: string;
    readonly verdict: VoterVerdict;
  }[];
}

/**
 * Aggregate every cluster's vote round into the resolved/incomplete/disposition/verdict
 * arrays the result envelope needs. A round with fewer than 2 verdicts (a dead voter) is
 * incomplete, never defaulted — code computes the disposition only from exactly 2.
 */
export function aggregateValidation(
  clusters: readonly Cluster[],
  rounds: readonly (VoteRound | null)[],
): AggregatedValidation {
  const resolvedClusterIds: string[] = [];
  const incompleteClusterIds: string[] = [];
  const dispositions: AggregatedValidation['dispositions'][number][] = [];
  const voterVerdicts: AggregatedValidation['voterVerdicts'][number][] = [];

  clusters.forEach((cluster, index) => {
    const round = rounds[index];
    const [first, second] = round?.verdicts ?? [];
    if (round === null || round === undefined || first === undefined || second === undefined) {
      incompleteClusterIds.push(cluster.id);
      return;
    }
    round.verdicts.forEach((verdict, voterIndex) => {
      voterVerdicts.push({ clusterId: cluster.id, voterId: `v${voterIndex + 1}`, verdict });
    });
    dispositions.push({
      clusterId: cluster.id,
      disposition: dispositionFromVoters(first, second),
      reason: null,
    });
    resolvedClusterIds.push(cluster.id);
  });

  return { resolvedClusterIds, incompleteClusterIds, dispositions, voterVerdicts };
}

/** Run the validate stage over the seeded (already resume-narrowed) cluster tail. */
export async function main(): Promise<ValidateResult> {
  phase('validate');
  if (!isValidateRunData(RUN_DATA, RUN_DATA_STAGE)) {
    return { ok: false, error: unseededRunDataError('validate') };
  }
  const { clusters, groundingInstances, resolvedClusterIds, validateTokenCeiling } = RUN_DATA;

  const worstCaseTokens = clusters.length * 2 * ESTIMATED_TOKENS_PER_VOTER;
  if (worstCaseTokens > validateTokenCeiling) {
    return {
      ok: false,
      error: `POST-REDUCE HARD-ABORT: ${clusters.length} clusters x 2 voters x ${ESTIMATED_TOKENS_PER_VOTER} = ${worstCaseTokens} tokens > ceiling ${validateTokenCeiling}. Re-derive the ceiling or split the run; do NOT dispatch validate.`,
    };
  }

  const byId = new Map(groundingInstances.map((instance) => [instance.id, instance]));
  log(
    `validate: ${clusters.length} judgment-needed clusters, VALIDATE_CONCURRENCY=${VALIDATE_CONCURRENCY}`,
  );

  const rounds = await runCapped(
    clusters,
    VALIDATE_CONCURRENCY,
    (cluster) =>
      voteOnCluster(
        cluster,
        cluster.memberInstanceIds.flatMap((id) => {
          const member = byId.get(id);
          return member === undefined ? [] : [member];
        }),
      ),
    parallel,
  );

  const aggregated = aggregateValidation(clusters, rounds);
  log(
    `validate done: ${aggregated.resolvedClusterIds.length} resolved, ${aggregated.incompleteClusterIds.length} incomplete`,
  );

  return {
    ok: true,
    validateComplete: aggregated.incompleteClusterIds.length === 0,
    resolvedClusterIds: [...resolvedClusterIds, ...aggregated.resolvedClusterIds],
    incompleteClusterIds: [...aggregated.incompleteClusterIds],
    missingClusterIds: [],
    dispositions: [...aggregated.dispositions],
    voterVerdicts: [...aggregated.voterVerdicts],
  };
}
