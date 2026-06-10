/**
 * Graph-corpus edge builders (G1a + G2).
 *
 * @remarks
 * Builds the typed edge sets: `prerequisiteFor` from consecutive
 * thread-ordering pairs (with dropped-edge provenance for unresolvable
 * endpoints), `containsUnit` (thread→unit), and `containsLesson`
 * (unit→lesson placement), each deduplicated per pair.
 */
import type { ExtractedLesson } from '../extractors/index.js';
import type { ExtractedThread, ThreadUnit } from '../extractors/thread-extractor.js';

import {
  lessonNodeId,
  threadNodeId,
  unitNodeId,
  type GraphCorpusDroppedEdge,
  type GraphCorpusEdge,
} from './graph-corpus-types.js';

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
export interface ResolvedEdges {
  readonly edges: readonly GraphCorpusEdge[];
  readonly droppedEdges: readonly GraphCorpusDroppedEdge[];
}

/** Resolves thread-ordering pairs into prerequisiteFor edges, dropping any with an unknown endpoint. */
export function buildPrerequisiteEdges(
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

/** Builds thread→unit containsUnit edges (deduplicated per thread/unit pair). */
export function buildContainsUnitEdges(
  threads: readonly ExtractedThread[],
): readonly GraphCorpusEdge[] {
  const seen = new Set<string>();
  const edges: GraphCorpusEdge[] = [];
  for (const thread of threads) {
    for (const unit of thread.units) {
      const key = `${thread.slug}\u001f${unit.unitSlug}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      edges.push({
        source: threadNodeId(thread.slug),
        type: 'containsUnit',
        target: unitNodeId(unit.unitSlug),
      });
    }
  }
  return edges;
}

/** Builds unit→lesson containsLesson placement edges (deduplicated per unit/lesson pair). */
export function buildContainsLessonEdges(
  lessons: readonly ExtractedLesson[],
): readonly GraphCorpusEdge[] {
  const seen = new Set<string>();
  const edges: GraphCorpusEdge[] = [];
  for (const lesson of lessons) {
    const key = `${lesson.unitSlug}\u001f${lesson.lessonSlug}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    edges.push({
      source: unitNodeId(lesson.unitSlug),
      type: 'containsLesson',
      target: lessonNodeId(lesson.lessonSlug),
    });
  }
  return edges;
}
