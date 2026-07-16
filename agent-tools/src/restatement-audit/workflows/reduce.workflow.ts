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
import {
  chunkForReducer,
  freeTextInstances,
  joinInstances,
  recountReducerCluster,
} from '../join.js';
import type { Cluster, FinderInstance } from '../schemas.js';
import { AGENT_JSON_SCHEMAS } from './agent-schemas.js';
import type { ClusterStageOutput } from './agent-schemas.js';
import { reducerPrompt } from './prompts.js';
import { RUN_DATA, RUN_DATA_STAGE } from './run-data.js';
import { isReduceRunData, unseededRunDataError } from './stage-guards.js';
import type { GroundingInstance, ReduceResult } from './stage-io.js';

declare const agent: HarnessAgent;
declare const parallel: HarnessParallel;
declare const phase: HarnessPhase;
declare const log: HarnessLog;

function toGrounding(instances: readonly FinderInstance[]): GroundingInstance[] {
  return instances.map((i) => ({
    id: i.id,
    file: i.file,
    line: i.line,
    quote: i.quote,
    valueNorm: i.valueNorm,
    assertionKind: i.assertionKind,
  }));
}

async function reduceChunk(
  chunkIndex: number,
  chunk: readonly FinderInstance[],
): Promise<ClusterStageOutput | null> {
  return agent<ClusterStageOutput>(reducerPrompt(toGrounding(chunk)), {
    label: `reduce:${chunkIndex}`,
    phase: 'reduce',
    model: 'opus',
    effort: 'high',
    schema: AGENT_JSON_SCHEMAS.clusterStage,
  });
}

/** Deduplicate by cluster id, keeping the first occurrence (exact-key wins on collision). */
function dedupeById(clusters: readonly Cluster[]): Cluster[] {
  const seen = new Set<string>();
  const out: Cluster[] = [];
  for (const cluster of clusters) {
    if (!seen.has(cluster.id)) {
      seen.add(cluster.id);
      out.push(cluster);
    }
  }
  return out;
}

/** Run the reduce stage over the seeded map instances. */
export async function main(): Promise<ReduceResult> {
  phase('exact-key-join');
  if (!isReduceRunData(RUN_DATA, RUN_DATA_STAGE)) {
    return { ok: false, error: unseededRunDataError('reduce') };
  }
  const { instances } = RUN_DATA;
  const exactKeyClusters = joinInstances(instances);
  log(`exact-key join: ${exactKeyClusters.length} clusters from ${instances.length} instances`);

  phase('reduce');
  const residuals = freeTextInstances(instances);
  const chunks = chunkForReducer(residuals, 3);
  log(`free-text residuals: ${residuals.length} instances in ${chunks.length} reducer call(s)`);

  const reducerResults = await parallel(
    chunks.map((chunk, index) => () => reduceChunk(index, chunk)),
  );
  const proposedClusters = reducerResults.flatMap((result) => result?.clusters ?? []);
  const recountedClusters = proposedClusters.flatMap((proposal) => {
    const recounted = recountReducerCluster(
      proposal.id,
      proposal.memberInstanceIds.flatMap((id) => {
        const source = residuals.find((instance) => instance.id === id);
        return source === undefined ? [] : [source];
      }),
    );
    return recounted === null ? [] : [recounted];
  });
  log(
    `reducer proposals: ${proposedClusters.length} proposed, ${recountedClusters.length} survived recount`,
  );

  const clusters = dedupeById([...exactKeyClusters, ...recountedClusters]);
  return { ok: true, instanceCount: instances.length, clusters };
}
