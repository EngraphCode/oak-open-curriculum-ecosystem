/**
 * Keyword projection (G4b c2) — per-view indexes over the one graph corpus
 * for bounded anchored keyword retrieval.
 *
 * @remarks
 * Indexes lessons, units, and keywords by id and materialises the two
 * adjacencies the keyword view traverses: lesson→keywords (from
 * `containsKeyword` edges) and unit→lessons (from `containsLesson` edges,
 * for unit-anchored narrowing). Constructed once at module load by the view
 * module (the EEF precedent); exported for the startup-cost proof.
 */
import {
  graphCorpus,
  type GraphCorpusEdgeType,
  type GraphCorpusKeywordNode,
  type GraphCorpusLessonNode,
  type GraphCorpusNodeId,
  type GraphCorpusUnitNode,
} from '@oaknational/sdk-codegen/graph-corpus';

/** The keyword view's per-kind node indexes plus its two traversal adjacencies. */
export interface CurriculumKeywordProjection {
  readonly lessonsById: ReadonlyMap<GraphCorpusNodeId, GraphCorpusLessonNode>;
  readonly unitsById: ReadonlyMap<GraphCorpusNodeId, GraphCorpusUnitNode>;
  readonly keywordsByLessonId: ReadonlyMap<GraphCorpusNodeId, readonly GraphCorpusKeywordNode[]>;
  readonly lessonsByUnitId: ReadonlyMap<GraphCorpusNodeId, readonly GraphCorpusLessonNode[]>;
}

/** Builds a source→targets adjacency for one edge type, id-sorted per source. */
function buildAdjacency<TTarget extends { readonly id: GraphCorpusNodeId }>(
  edgeType: GraphCorpusEdgeType,
  targetsById: ReadonlyMap<GraphCorpusNodeId, TTarget>,
): Map<GraphCorpusNodeId, TTarget[]> {
  const adjacency = new Map<GraphCorpusNodeId, TTarget[]>();
  for (const edge of graphCorpus.edges) {
    if (edge.type !== edgeType) {
      continue;
    }
    const target = targetsById.get(edge.target);
    if (target === undefined) {
      throw new Error(`graph corpus integrity breach: dangling edge target ${edge.target}`);
    }
    const existing = adjacency.get(edge.source);
    if (existing) {
      existing.push(target);
    } else {
      adjacency.set(edge.source, [target]);
    }
  }
  for (const targets of adjacency.values()) {
    targets.sort((a, b) => a.id.localeCompare(b.id));
  }
  return adjacency;
}

/**
 * Builds the keyword projection over the one graph corpus: lesson, unit, and
 * keyword indexes plus the lesson→keyword and unit→lesson adjacencies.
 * Exported for the startup-cost proof; runtime consumers use the view
 * module's module-load singleton.
 */
export function buildCurriculumKeywordProjection(): CurriculumKeywordProjection {
  const lessonsById = new Map<GraphCorpusNodeId, GraphCorpusLessonNode>();
  const unitsById = new Map<GraphCorpusNodeId, GraphCorpusUnitNode>();
  const keywordsById = new Map<GraphCorpusNodeId, GraphCorpusKeywordNode>();
  for (const node of graphCorpus.nodes) {
    if (node.kind === 'lesson') {
      lessonsById.set(node.id, node);
    } else if (node.kind === 'unit') {
      unitsById.set(node.id, node);
    } else if (node.kind === 'keyword') {
      keywordsById.set(node.id, node);
    } else if (node.kind === 'thread' || node.kind === 'misconception') {
      // Deliberately outside the keyword view: threads and misconceptions
      // are reached through their own views.
    } else {
      // Exhaustiveness anchor: a new corpus node kind fails compilation here
      // instead of silently joining the wrong index.
      const unhandled: never = node;
      throw new Error(`graph corpus integrity breach: unhandled node ${JSON.stringify(unhandled)}`);
    }
  }
  return {
    lessonsById,
    unitsById,
    keywordsByLessonId: buildAdjacency('containsKeyword', keywordsById),
    lessonsByUnitId: buildAdjacency('containsLesson', lessonsById),
  };
}
