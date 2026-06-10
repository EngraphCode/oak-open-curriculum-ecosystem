/**
 * Graph-corpus generator (G1a — the one-graph foundation).
 *
 * @remarks
 * Emits the bulk curriculum graph as a single corpus with one identity space
 * (plan graph-tools-value-redesign, Decision A). G1a emits the `unit` node kind
 * and prerequisiteFor edges between units; later deliverables add node kinds and
 * edge types to the same corpus.
 *
 * Identity model: node ids are kind-qualified and minted at generation from
 * `(kind, source key)` — a unit node id is `unit:<unitSlug>`, materialised as an
 * explicit `id` field so the `createGraphView` nodeId extractor returns
 * `node.id` rather than a bare slug.
 *
 * Node set: the union of units carrying prior-knowledge requirements and units
 * appearing in any thread (both carry full metadata). Edges come from thread
 * ordering, so every endpoint is a thread unit and therefore a node — the corpus
 * has zero dangling endpoints by construction and builds in `createGraphView`
 * without throwing. The defensive path records any unresolved endpoint in
 * `droppedEdges` rather than emitting a dangling edge. Self-loops (an upstream
 * data-quality signal) are preserved and counted; the bounded BFS is
 * visited-set-safe.
 *
 * @see ADR-086 for the export pattern; ADR-031 for generation-time extraction.
 */
import type { ExtractedPriorKnowledge } from '../extractors/index.js';
import type { ExtractedThread, ThreadUnit } from '../extractors/thread-extractor.js';

/** A kind-qualified graph-corpus node id (`unit:<unitSlug>` for a unit node). */
export type GraphCorpusNodeId = `unit:${string}`;

/** A unit node in the graph corpus. */
export interface GraphCorpusUnitNode {
  readonly id: GraphCorpusNodeId;
  readonly unitSlug: string;
  readonly unitTitle: string;
  readonly subject: string;
  readonly keyStage: string;
  readonly year: number | undefined;
  readonly priorKnowledge: readonly string[];
  readonly threadSlugs: readonly string[];
}

/** A typed directed edge between unit nodes (graph-core `GraphEdge` shape). */
export interface GraphCorpusEdge {
  readonly source: GraphCorpusNodeId;
  readonly type: 'prerequisiteFor';
  readonly target: GraphCorpusNodeId;
}

/** Provenance for an edge dropped because an endpoint could not be resolved. */
export interface GraphCorpusDroppedEdge {
  readonly source: GraphCorpusNodeId;
  readonly target: GraphCorpusNodeId;
  readonly type: 'prerequisiteFor';
  readonly reason: string;
}

/** Statistics about the graph corpus. */
export interface GraphCorpusStats {
  readonly totalNodes: number;
  readonly totalEdges: number;
  readonly subjectsCovered: readonly string[];
  readonly selfLoops: number;
}

/** The graph corpus: one identity space surfaced through bounded views. */
export interface GraphCorpus {
  readonly version: string;
  readonly generatedAt: string;
  readonly sourceVersion: string;
  readonly stats: GraphCorpusStats;
  readonly nodes: readonly GraphCorpusUnitNode[];
  readonly edges: readonly GraphCorpusEdge[];
  readonly droppedEdges: readonly GraphCorpusDroppedEdge[];
  readonly seeAlso: string;
}

/** Mints the kind-qualified id for a unit node. */
function unitNodeId(unitSlug: string): GraphCorpusNodeId {
  return `unit:${unitSlug}`;
}

/** Mutable node accumulator used during construction. */
interface NodeAccumulator {
  readonly unitSlug: string;
  readonly unitTitle: string;
  readonly subject: string;
  readonly keyStage: string;
  readonly year: number | undefined;
  readonly priorKnowledge: string[];
  readonly threadSlugs: string[];
}

/**
 * Ensures (creating on first sight from the unit's metadata) the accumulator for
 * a unit. Thread units are visited before prior-knowledge entries, so existing
 * accumulators keep their first-seen metadata.
 */
function ensureNode(
  byUnit: Map<string, NodeAccumulator>,
  unit: ThreadUnit | ExtractedPriorKnowledge,
): NodeAccumulator {
  const existing = byUnit.get(unit.unitSlug);
  if (existing) {
    return existing;
  }
  const created: NodeAccumulator = {
    unitSlug: unit.unitSlug,
    unitTitle: unit.unitTitle,
    subject: unit.subject,
    keyStage: unit.keyStage,
    year: unit.year,
    priorKnowledge: [],
    threadSlugs: [],
  };
  byUnit.set(unit.unitSlug, created);
  return created;
}

/** Builds the union node set (thread units and prior-knowledge units), slug-sorted. */
function buildNodes(
  priorKnowledge: readonly ExtractedPriorKnowledge[],
  threads: readonly ExtractedThread[],
): readonly GraphCorpusUnitNode[] {
  const byUnit = new Map<string, NodeAccumulator>();
  for (const thread of threads) {
    for (const unit of thread.units) {
      const node = ensureNode(byUnit, unit);
      if (!node.threadSlugs.includes(thread.slug)) {
        node.threadSlugs.push(thread.slug);
      }
    }
  }
  for (const pk of priorKnowledge) {
    ensureNode(byUnit, pk).priorKnowledge.push(pk.requirement);
  }
  return [...byUnit.values()]
    .sort((a, b) => a.unitSlug.localeCompare(b.unitSlug))
    .map((node) => ({ ...node, id: unitNodeId(node.unitSlug) }));
}

/** Consecutive (from, to) unit pairs along each thread's ordering. */
function threadOrderingPairs(
  threads: readonly ExtractedThread[],
): readonly (readonly [ThreadUnit, ThreadUnit])[] {
  const pairs: (readonly [ThreadUnit, ThreadUnit])[] = [];
  for (const thread of threads) {
    for (let i = 0; i < thread.units.length - 1; i += 1) {
      const from = thread.units[i];
      const to = thread.units[i + 1];
      if (from && to) {
        pairs.push([from, to]);
      }
    }
  }
  return pairs;
}

/** The resolved edge set plus the provenance of any dropped edges. */
interface ResolvedEdges {
  readonly edges: readonly GraphCorpusEdge[];
  readonly droppedEdges: readonly GraphCorpusDroppedEdge[];
}

/** Resolves thread-ordering pairs into edges, dropping any with an unknown endpoint. */
function buildEdges(
  threads: readonly ExtractedThread[],
  knownUnitSlugs: ReadonlySet<string>,
): ResolvedEdges {
  const edges: GraphCorpusEdge[] = [];
  const droppedEdges: GraphCorpusDroppedEdge[] = [];
  for (const [from, to] of threadOrderingPairs(threads)) {
    const source = unitNodeId(from.unitSlug);
    const target = unitNodeId(to.unitSlug);
    if (knownUnitSlugs.has(from.unitSlug) && knownUnitSlugs.has(to.unitSlug)) {
      edges.push({ source, type: 'prerequisiteFor', target });
    } else {
      const missing = knownUnitSlugs.has(from.unitSlug) ? to.unitSlug : from.unitSlug;
      droppedEdges.push({
        source,
        target,
        type: 'prerequisiteFor',
        reason: `endpoint "${missing}" is not resolvable to a bulk unit node`,
      });
    }
  }
  return { edges, droppedEdges };
}

/** Collects the unique subjects present across the corpus nodes. */
function collectSubjects(nodes: readonly GraphCorpusUnitNode[]): readonly string[] {
  return [...new Set(nodes.map((node) => node.subject))].sort((a, b) => a.localeCompare(b));
}

/**
 * Generates the graph corpus from extracted bulk data: unit nodes with
 * materialised kind-qualified ids and prerequisiteFor edges, with zero dangling
 * endpoints (every edge endpoint resolves to a node).
 *
 * @param priorKnowledge - Extracted prior-knowledge requirements (node metadata + requirements)
 * @param threads - Extracted threads (edge ordering + thread-unit node metadata)
 * @param sourceVersion - Version identifier for the source bulk download data
 * @returns The graph corpus (unit nodes + prerequisiteFor edges; `droppedEdges` empty in practice)
 */
export function generateGraphCorpusData(
  priorKnowledge: readonly ExtractedPriorKnowledge[],
  threads: readonly ExtractedThread[],
  sourceVersion: string,
): GraphCorpus {
  const nodes = buildNodes(priorKnowledge, threads);
  const knownUnitSlugs = new Set(nodes.map((node) => node.unitSlug));
  const { edges, droppedEdges } = buildEdges(threads, knownUnitSlugs);
  const selfLoops = edges.filter((edge) => edge.source === edge.target).length;
  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    sourceVersion,
    stats: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      subjectsCovered: collectSubjects(nodes),
      selfLoops,
    },
    nodes,
    edges,
    droppedEdges,
    seeAlso:
      'One bulk curriculum graph surfaced as bounded views. Use the prior-knowledge view ' +
      'for "what comes before" queries; use get-thread-progressions for ordered learning paths.',
  };
}
