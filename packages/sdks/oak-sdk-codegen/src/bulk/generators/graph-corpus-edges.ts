/**
 * Graph-corpus edge builders (G1a + G2; prerequisiteFor re-derived on the
 * year axis at the G3 follow-on).
 *
 * @remarks
 * Builds the typed edge sets: `prerequisiteFor` from consecutive
 * year-ordered thread pairs (with dropped-edge provenance for unresolvable
 * endpoints), `containsUnit` (thread→unit), and `containsLesson`
 * (unit→lesson placement), each deduplicated per pair.
 */
import type { ExtractedLesson } from '../extractors/index.js';
import type { ExtractedThread, ThreadUnit } from '../extractors/thread-extractor.js';

import { comparePlacements } from './graph-corpus-sequences.js';
import {
  lessonNodeId,
  threadNodeId,
  unitNodeId,
  type GraphCorpusDroppedEdge,
  type GraphCorpusEdge,
} from './graph-corpus-types.js';

/**
 * Consecutive (from, to) unit pairs along each thread's year ordering.
 *
 * @remarks
 * Units sort by the {@link comparePlacements} total order — `(year, unitId)`,
 * year-less last — shared with the sequence builder, so chains and sequences
 * carry ONE ordering basis and the derived chain never depends on placement
 * encounter order. The bulk's `unit.threads[].order` is the THREAD's display
 * index (constant per thread) and carries no within-thread ordering; the
 * teaching year is the progression axis. Same-year units still chain (count
 * preservation) in unitId order — a stated-arbitrary tie-break, not a
 * pedagogical claim; within one year the order is not curricular.
 */
function threadOrderingPairs(
  threads: readonly ExtractedThread[],
): readonly (readonly [ThreadUnit, ThreadUnit])[] {
  const pairs: (readonly [ThreadUnit, ThreadUnit])[] = [];
  for (const thread of threads) {
    const ordered = [...thread.units].sort((a, b) =>
      comparePlacements(
        { unitId: unitNodeId(a.unitSlug), year: a.year },
        { unitId: unitNodeId(b.unitSlug), year: b.year },
      ),
    );
    for (let i = 0; i < ordered.length - 1; i += 1) {
      const from = ordered[i];
      const to = ordered[i + 1];
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
