/**
 * Member-grounding resolution shared by the stage derivations in `run-inputs.ts`:
 * resolve a cluster's member instance ids against the map result's instances, refusing
 * partial grounding by name — a voter or the meta agent must never judge a cluster whose
 * members it cannot see.
 *
 * @packageDocumentation
 */

import { err, ok, type Result } from '@oaknational/result';

import type { Cluster } from '../schemas.js';
import type { GroundingInstance, MapResult, MetaCluster } from './stage-io.js';

/** Caller must have rejected a failed map result BEFORE building the lookup. */
export function groundingInstanceOf(
  source: Extract<MapResult, { ok: true }>,
): ReadonlyMap<string, GroundingInstance> {
  const byId = new Map<string, GroundingInstance>();
  for (const instance of source.instances) {
    byId.set(instance.id, {
      id: instance.id,
      file: instance.file,
      line: instance.line,
      quote: instance.quote,
      valueNorm: instance.valueNorm,
      assertionKind: instance.assertionKind,
    });
  }
  return byId;
}

export interface ResolvedMembers {
  readonly members: readonly GroundingInstance[];
  /** `clusterId:instanceId` for every member id absent from the map result — never dropped silently. */
  readonly missing: readonly string[];
}

export function resolveMembers(
  cluster: Cluster,
  byId: ReadonlyMap<string, GroundingInstance>,
): ResolvedMembers {
  const members: GroundingInstance[] = [];
  const missing: string[] = [];
  for (const id of cluster.memberInstanceIds) {
    const member = byId.get(id);
    if (member === undefined) {
      missing.push(`${cluster.id}:${id}`);
    } else {
      members.push(member);
    }
  }
  return { members, missing };
}

export function unresolvableMembersError(missing: readonly string[]): Error {
  return new Error(
    `clusters reference ${missing.length} member instance id(s) absent from the map result — ` +
      `voters/meta would run on partial grounding: ${missing.join(', ')}`,
  );
}

/**
 * Project clusters to the meta stage's shape, resolving each member id to its grounding
 * instance; errs naming every unresolvable member rather than dropping any.
 */
export function projectClusters(
  clusters: readonly Cluster[],
  byId: ReadonlyMap<string, GroundingInstance>,
): Result<MetaCluster[], Error> {
  const resolved = clusters.map((cluster) => resolveMembers(cluster, byId));
  const missing = resolved.flatMap((entry) => entry.missing);
  if (missing.length > 0) {
    return err(unresolvableMembersError(missing));
  }
  return ok(
    clusters.map((cluster, index) => ({
      id: cluster.id,
      factClass: cluster.factClass,
      subject: cluster.subject,
      predicate: cluster.predicate,
      verdict: cluster.verdict,
      instances: [...(resolved[index]?.members ?? [])],
    })),
  );
}
