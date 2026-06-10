/**
 * Curriculum graph adapter — the bridge from the generated graph corpus into
 * the graph substrate (Decision B option (a) / G1a foundation).
 *
 * This module is the sole ingest path from the generated `graph-corpus` dataset
 * (`@oaknational/sdk-codegen/graph-corpus`) into the domain-generic graph
 * substrate. It re-exports the corpus value and types for this SDK's consumers
 * and provides {@link createCurriculumPrerequisiteGraph}, which instantiates a
 * domain-generic `createGraphView` over the corpus with the curriculum type
 * space: one node kind (`TNode = GraphCorpusUnitNode`, the full unit payload),
 * one node-id type (`GraphCorpusNodeId` = `unit:<unitSlug>`), and one edge type
 * (`'prerequisiteFor'`).
 *
 * The corpus has a materialised, kind-qualified `id` on every node and zero
 * dangling edge endpoints (G1a integrity resolution), so construction is
 * infallible for the emitted corpus; a malformed corpus would throw fail-fast
 * per the `createGraphView` construction contract.
 *
 * Bounded-retrieval VIEW semantics — the depth default, the anchored
 * `get-prior-knowledge-graph` query surface, and a module-load singleton with a
 * recorded startup-cost check — are the G1b prior-knowledge view's concern.
 * G1a provides only the construction bridge: the caller chooses `maxDepth`.
 */

import { createGraphView, type GraphView } from '@oaknational/graph-core/graph-view';
import {
  graphCorpus,
  type GraphCorpus,
  type GraphCorpusEdge,
  type GraphCorpusNodeId,
  type GraphCorpusUnitNode,
} from '@oaknational/sdk-codegen/graph-corpus';

export { graphCorpus };
export type { GraphCorpus, GraphCorpusEdge, GraphCorpusNodeId, GraphCorpusUnitNode };

/**
 * The curriculum prerequisite graph view type: `TNode = GraphCorpusUnitNode`,
 * `TNodeId = GraphCorpusNodeId`, `TEdgeType = 'prerequisiteFor'`.
 */
export type CurriculumPrerequisiteGraph = GraphView<
  GraphCorpusUnitNode,
  GraphCorpusNodeId,
  'prerequisiteFor'
>;

/**
 * Constructs a bounded-BFS prerequisite view over the one bulk graph corpus.
 *
 * The corpus edges are already in the `graph-core` `GraphEdge` shape
 * (`{ source, type: 'prerequisiteFor', target }`) with the kind-qualified node
 * id on each endpoint, so they flow to `createGraphView` without a remap.
 *
 * @param maxDepth - The inclusive depth ceiling for `subgraph` queries on the
 *   returned view. The depth-2 default and the caller-adjustable anchored query
 *   surface are set by the G1b prior-knowledge view; here the caller chooses the
 *   ceiling.
 * @returns A `GraphView` over the corpus's unit nodes and prerequisiteFor edges.
 * @throws Error if the corpus has a duplicate node id or a dangling edge
 *   endpoint (it does not — G1a integrity resolution guarantees neither).
 */
export function createCurriculumPrerequisiteGraph(maxDepth: number): CurriculumPrerequisiteGraph {
  return createGraphView<GraphCorpusUnitNode, GraphCorpusNodeId, 'prerequisiteFor'>({
    nodes: graphCorpus.nodes,
    edges: graphCorpus.edges,
    nodeId: (node) => node.id,
    maxDepth,
  });
}
