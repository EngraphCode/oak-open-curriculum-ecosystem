/**
 * REDUCE stage workflow: code-first exact-key join, then reducer calls for free-text
 * residuals — every reducer proposal recounted by code before inclusion.
 *
 * @remarks
 * `joinInstances` runs deterministically, zero agents, over every gazetteer-resolved
 * instance. Only the free-text-subject residuals reach an agent, chunked into at most 3
 * reducer calls (plan Deliverable 2 S2). Each reducer's proposed groupings are recounted
 * through `recountReducerCluster` — the reducer clusters, code verdicts; a rejected
 * proposal is silently dropped, never trusted.
 *
 * @packageDocumentation
 */

import type {
  HarnessAgent,
  HarnessLog,
  HarnessParallel,
  HarnessPhase,
} from '../../corpus-analysis/workflows/harness-types.js';
import { dedupeByMemberSet, overlappingMemberIds } from '../cluster-hygiene.js';
import {
  chunkForReducer,
  emptyNormalFormInstances,
  freeTextInstances,
  joinInstances,
  recountReducerCluster,
} from '../join.js';
import type { Cluster, FinderInstance } from '../schemas.js';
import { AGENT_JSON_SCHEMAS } from './agent-schemas.js';
import type { ClusterStageOutput } from './agent-schemas.js';
import { resolveProposalsChunkScoped } from './proposal-resolution.js';
import { reducerPrompt, type ReducerViewInstance } from './prompts.js';
import { RUN_DATA, RUN_DATA_STAGE } from './run-data.js';
import { isReduceRunData, unseededRunDataError } from './stage-guards.js';
import type { ReduceResult } from './stage-io.js';

declare const agent: HarnessAgent;
declare const parallel: HarnessParallel;
declare const phase: HarnessPhase;
declare const log: HarnessLog;

function toReducerView(instances: readonly FinderInstance[]): ReducerViewInstance[] {
  return instances.map((i) => ({
    id: i.id,
    file: i.file,
    line: i.line,
    quote: i.quote,
    valueNorm: i.valueNorm,
    assertionKind: i.assertionKind,
    // The grouping keys the recount enforces — the reducer cannot honour a
    // factClass-homogeneity rule it cannot see (review-round finding).
    factClass: i.factClass,
    subject: i.subject,
    predicate: i.predicate,
  }));
}

async function reduceChunk(
  chunkIndex: number,
  chunk: readonly FinderInstance[],
): Promise<ClusterStageOutput | null> {
  return agent<ClusterStageOutput>(reducerPrompt(toReducerView(chunk)), {
    label: `reduce:${chunkIndex}`,
    phase: 'reduce',
    model: 'opus',
    effort: 'high',
    // Zero-tools synthesist (plan Deliverable 2 S2) — the agentType enforces what the
    // meta literal only claimed.
    agentType: 'corpus-reducer',
    schema: AGENT_JSON_SCHEMAS.clusterStage,
  });
}

/** Loudly surface dead reducer chunks — the envelope reports them; the operator must not commit partial coverage. */
function warnOnIncompleteChunks(incompleteChunks: readonly number[], chunkCount: number): void {
  if (incompleteChunks.length > 0) {
    log(
      `REDUCE INCOMPLETE — ${incompleteChunks.length}/${chunkCount} reducer chunk(s) returned nothing: [${incompleteChunks.join(',')}] — do NOT commit this as full coverage.`,
    );
  }
}

/** Loudly surface members shared across clusters — voters judge each independently. */
function warnOnOverlappingMembers(clusters: readonly Cluster[]): void {
  const overlapping = overlappingMemberIds(clusters);
  if (overlapping.length > 0) {
    log(
      `WARNING: ${overlapping.length} instance id(s) appear in more than one cluster — voters judge each independently; expect possible duplicate ledger rows for: [${overlapping.join(', ')}]`,
    );
  }
}

/** Loudly surface refused proposals — a bad citation is refused whole, never shrunk. */
function warnOnRefusedProposals(refused: readonly string[]): void {
  if (refused.length > 0) {
    log(
      `EVIDENCE-INTEGRITY REFUSAL — ${refused.length} proposal(s) cited unknown or out-of-chunk instance id(s) and were refused WHOLE: ${refused.join('; ')}`,
    );
  }
}

/** Loudly surface instances the join will drop for empty-normal-form values. */
function warnOnEmptyNormalForms(instances: readonly FinderInstance[]): void {
  const emptyDropped = emptyNormalFormInstances(instances).length;
  if (emptyDropped > 0) {
    log(
      `WARNING: ${emptyDropped} instance(s) with empty-normal-form values excluded from joining — they should have failed the map checkpoint re-parse.`,
    );
  }
}

/**
 * Recount every CHUNK-SCOPED-RESOLVED reducer proposal through code (evidence
 * integrity: `resolveProposalsChunkScoped` refuses whole any proposal citing an id its
 * reducer never saw — cross-chunk or typo — so a bad citation can never shrink into a
 * different cluster). Each surviving proposal then passes `recountReducerCluster`, the
 * reducer clusters / code verdicts.
 */
function recountProposals(
  reducerResults: readonly (ClusterStageOutput | null)[],
  chunks: readonly (readonly FinderInstance[])[],
): {
  readonly proposedCount: number;
  readonly refused: readonly string[];
  readonly recounted: Cluster[];
} {
  const { proposedCount, resolved, refused } = resolveProposalsChunkScoped(reducerResults, chunks);
  const recounted = resolved.flatMap((proposal) => {
    const cluster = recountReducerCluster(proposal.id, proposal.members);
    return cluster === null ? [] : [cluster];
  });
  return { proposedCount, refused, recounted };
}

/** Run the reduce stage over the seeded map instances. */
export async function main(): Promise<ReduceResult> {
  phase('exact-key-join');
  if (!isReduceRunData(RUN_DATA, RUN_DATA_STAGE)) {
    return { ok: false, error: unseededRunDataError('reduce') };
  }
  const { instances } = RUN_DATA;
  warnOnEmptyNormalForms(instances);
  const exactKeyClusters = joinInstances(instances);
  log(`exact-key join: ${exactKeyClusters.length} clusters from ${instances.length} instances`);

  phase('reduce');
  const residuals = freeTextInstances(instances);
  const chunks = chunkForReducer(residuals, 3);
  log(`free-text residuals: ${residuals.length} instances in ${chunks.length} reducer call(s)`);

  const reducerResults = await parallel(
    chunks.map((chunk, index) => () => reduceChunk(index, chunk)),
  );
  const incompleteChunks = reducerResults.flatMap((result, index) =>
    result === null ? [index] : [],
  );
  warnOnIncompleteChunks(incompleteChunks, chunks.length);
  const { proposedCount, refused, recounted } = recountProposals(reducerResults, chunks);
  warnOnRefusedProposals(refused);
  log(`reducer proposals: ${proposedCount} proposed, ${recounted.length} survived recount`);

  const clusters = dedupeByMemberSet([...exactKeyClusters, ...recounted]);
  warnOnOverlappingMembers(clusters);
  return {
    ok: true,
    instanceCount: instances.length,
    clusters,
    reduceComplete: incompleteChunks.length === 0,
    incompleteChunks,
  };
}
