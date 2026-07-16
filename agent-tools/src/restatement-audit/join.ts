/**
 * Deterministic layer-1 join: group gazetteer-resolved finder instances by fact-key and
 * compute CONFLICT / LATENT. All counting happens here, in code — never in an agent
 * (`.agent/rules/validators-must-recompute-not-just-record.md`).
 *
 * @remarks
 * Only exact-key joining lives here: instances with `subjectFromGazetteer: true` are
 * grouped by `(factClass, subject, predicate)`, a key the gazetteer makes exact and
 * joinable. Free-text-subject residuals (`subjectFromGazetteer: false`) are NOT joined
 * here — they route to the S2 reducer, whose proposed groupings still recount through
 * {@link buildCluster} rather than trusting the reducer's own tally.
 *
 * @packageDocumentation
 */

import type { Cluster, ClusterVerdict, FactClass, FinderInstance } from './schemas.js';
import { normalizeValue } from './normalize.js';

/**
 * The deterministic, exact-joinable fact-key: `factClass:subject:predicate`, single-colon
 * joined to match the Director's gazetteer/canary-key convention (e.g.
 * `status-assertion:G1:status`) so recount output is directly diffable against the
 * canary during Job 2 acceptance.
 */
export function factKeyOf(
  instance: Pick<FinderInstance, 'factClass' | 'predicate' | 'subject'>,
): string {
  return `${instance.factClass}:${instance.subject}:${instance.predicate}`;
}

interface KeyedGroup {
  readonly factKey: string;
  /** Captured from the group's first instance at insert time — always typed, never split. */
  readonly factClass: FactClass;
  readonly subject: string;
  readonly predicate: string;
  readonly instances: readonly FinderInstance[];
}

interface MutableGroup {
  readonly factClass: FactClass;
  readonly subject: string;
  readonly predicate: string;
  readonly instances: FinderInstance[];
}

function groupByFactKey(instances: readonly FinderInstance[]): readonly KeyedGroup[] {
  const groups = new Map<string, MutableGroup>();
  for (const instance of instances) {
    const key = factKeyOf(instance);
    const existing = groups.get(key);
    if (existing === undefined) {
      groups.set(key, {
        factClass: instance.factClass,
        subject: instance.subject,
        predicate: instance.predicate,
        instances: [instance],
      });
    } else {
      existing.instances.push(instance);
    }
  }
  return [...groups.entries()].map(([factKey, group]) => ({ factKey, ...group }));
}

/**
 * A restatement instance requires repetition: a fact-key stated exactly once, in one
 * file, with one value is not a restatement of anything. Every group of size 1 is
 * dropped before verdict computation.
 */
function isRepeated(group: KeyedGroup): boolean {
  return group.instances.length >= 2;
}

/**
 * CONFLICT fires on more than one distinct normalised value, regardless of file count
 * (a single document can contradict itself at two mentions). LATENT fires only when one
 * value repeats across two or more DISTINCT FILES — same-file repetition of the same
 * value is ordinary prose, not the cross-document drift class the fleet targets.
 */
function computeVerdict(group: KeyedGroup): ClusterVerdict | null {
  const distinctFiles = new Set(group.instances.map((instance) => instance.file));
  const distinctValues = new Set(
    group.instances.map((instance) => normalizeValue(instance.valueNorm)),
  );
  if (distinctValues.size > 1) {
    return 'conflict';
  }
  if (distinctFiles.size >= 2) {
    return 'latent';
  }
  return null;
}

/** Build one exact-key cluster from a keyed group already known to need a verdict. */
function buildCluster(group: KeyedGroup, verdict: ClusterVerdict): Cluster {
  const distinctValueNorms = [
    ...new Set(group.instances.map((instance) => normalizeValue(instance.valueNorm))),
  ];
  return {
    id: `exact:${group.factKey}`,
    clusterKind: 'exact-key',
    factClass: group.factClass,
    subject: group.subject,
    predicate: group.predicate,
    verdict,
    distinctValueNorms,
    memberInstanceIds: group.instances.map((instance) => instance.id),
  };
}

/** Instances the exact-key join cannot use — free-text subjects, routed to the reducer. */
export function freeTextInstances(instances: readonly FinderInstance[]): FinderInstance[] {
  return instances.filter((instance) => !instance.subjectFromGazetteer);
}

/**
 * Instances whose `valueNorm` normalises to the empty string (`'.'`, `','`, whitespace).
 * The refined `finderInstanceSchema` rejects these at every checkpoint re-parse; this
 * helper is the join layer's defence in depth — such an instance would otherwise build a
 * cluster whose `distinctValueNorms` contains `''`, violating `clusterSchema` while typed
 * as valid. Callers log the dropped count; the join never counts them.
 */
export function emptyNormalFormInstances(instances: readonly FinderInstance[]): FinderInstance[] {
  return instances.filter((instance) => normalizeValue(instance.valueNorm) === '');
}

function hasUsableValue(instance: FinderInstance): boolean {
  return normalizeValue(instance.valueNorm) !== '';
}

/**
 * Split free-text instances into contiguous chunks for the reducer, using as FEW chunks
 * as possible, targeting `targetChunkSize` items per chunk but capped at `maxChunks`
 * (plan Deliverable 2 S2: "1-3 reducer calls for free-text-subject residuals only") — a
 * small residual set gets one call; only a residual set large enough to need it escalates
 * to more. THE CAP WINS: when `itemCount > maxChunks * targetChunkSize`, chunks exceed
 * `targetChunkSize` rather than the call count exceeding `maxChunks`. Deterministic and
 * order-preserving; no chunk is emitted empty.
 */
export function chunkForReducer(
  instances: readonly FinderInstance[],
  maxChunks = 3,
  targetChunkSize = 200,
): FinderInstance[][] {
  if (instances.length === 0) {
    return [];
  }
  const chunkCount = Math.min(maxChunks, Math.ceil(instances.length / targetChunkSize));
  const size = Math.ceil(instances.length / chunkCount);
  const chunks: FinderInstance[][] = [];
  for (let start = 0; start < instances.length; start += size) {
    chunks.push(instances.slice(start, start + size));
  }
  return chunks;
}

/**
 * The deterministic exact-key join: group gazetteer-resolved instances by fact-key,
 * drop unrepeated facts, and compute CONFLICT / LATENT for the rest. Instances with
 * `subjectFromGazetteer: false` are excluded — the caller routes them to the reducer —
 * and instances whose value has an empty normal form are dropped (defence in depth; see
 * {@link emptyNormalFormInstances}).
 */
export function joinInstances(instances: readonly FinderInstance[]): Cluster[] {
  const gazetteerInstances = instances.filter(
    (instance) => instance.subjectFromGazetteer && hasUsableValue(instance),
  );
  const clusters: Cluster[] = [];
  for (const group of groupByFactKey(gazetteerInstances)) {
    if (!isRepeated(group)) {
      continue;
    }
    const verdict = computeVerdict(group);
    if (verdict !== null) {
      clusters.push(buildCluster(group, verdict));
    }
  }
  return clusters;
}

/**
 * Recount one reducer-proposed group of free-text-subject instances: the reducer only
 * ever proposes MEMBERSHIP, never a verdict — code always recomputes it here, exactly as
 * for an exact-key group. Returns `null` when the proposal does not survive recount: the
 * members do not share one `(factClass, subject, predicate)`, or the group is not
 * genuinely repeated (see {@link isRepeated} / {@link computeVerdict}).
 */
export function recountReducerCluster(
  id: string,
  members: readonly FinderInstance[],
): Cluster | null {
  const usable = members.filter(hasUsableValue);
  const [first, ...rest] = usable;
  if (first === undefined) {
    return null;
  }
  const homogeneous = rest.every(
    (member) =>
      member.factClass === first.factClass &&
      member.subject === first.subject &&
      member.predicate === first.predicate,
  );
  if (!homogeneous) {
    return null;
  }
  const group: KeyedGroup = {
    factKey: factKeyOf(first),
    factClass: first.factClass,
    subject: first.subject,
    predicate: first.predicate,
    instances: usable,
  };
  if (!isRepeated(group)) {
    return null;
  }
  const verdict = computeVerdict(group);
  if (verdict === null) {
    return null;
  }
  return { ...buildCluster(group, verdict), id, clusterKind: 'reducer' };
}
