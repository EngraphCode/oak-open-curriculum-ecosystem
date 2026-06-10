/**
 * Graph-corpus node builders (G1a + G2): the four node kinds with
 * deterministic, order-independent output — unit nodes (thread ∪
 * prior-knowledge ∪ lesson-hosting sources, slug-sorted), thread and lesson
 * nodes (slug-sorted, lessons deduped), and misconception nodes (the settled
 * content-hash mint, id-sorted, keep-first dedup with provenance).
 */
import type {
  ExtractedLesson,
  ExtractedMisconception,
  ExtractedPriorKnowledge,
} from '../extractors/index.js';
import type { ExtractedThread } from '../extractors/thread-extractor.js';

import {
  lessonNodeId,
  threadNodeId,
  unitNodeId,
  type GraphCorpusDroppedDuplicate,
  type GraphCorpusLessonNode,
  type GraphCorpusLessonNodeId,
  type GraphCorpusMisconceptionNode,
  type GraphCorpusMisconceptionNodeId,
  type GraphCorpusThreadNode,
  type GraphCorpusUnitNode,
} from './graph-corpus-types.js';
import { mintMisconceptionId, normaliseMisconceptionText } from './misconception-mint.js';

/** Mutable unit-node accumulator used during construction. */
interface UnitAccumulator {
  readonly unitSlug: string;
  readonly unitTitle: string;
  readonly subject: string;
  readonly keyStage: string;
  readonly year: number | undefined;
  readonly priorKnowledge: string[];
  readonly threadSlugs: string[];
}

/** The unit metadata any source (thread unit, PK entry, lesson record) provides. */
interface UnitMetadataSource {
  readonly unitSlug: string;
  readonly unitTitle: string;
  readonly subject: string;
  readonly keyStage: string;
  readonly year: number | undefined;
}

/**
 * Ensures (creating on first sight from the source's metadata) the
 * accumulator for a unit. Sources are visited threads-first, then
 * prior-knowledge, then lesson placements; first-seen metadata wins.
 */
function ensureUnit(
  byUnit: Map<string, UnitAccumulator>,
  unit: UnitMetadataSource,
): UnitAccumulator {
  const existing = byUnit.get(unit.unitSlug);
  if (existing) {
    return existing;
  }
  const created: UnitAccumulator = {
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

/**
 * Builds the unit node set: thread units ∪ prior-knowledge units ∪
 * lesson-hosting units (the G1a integrity rule — a unit that exists in the
 * bulk source is emitted rather than leaving a dangling placement edge).
 * Sorted by unit slug; threadSlugs sorted per node for order-independence.
 */
export function buildUnitNodes(
  priorKnowledge: readonly ExtractedPriorKnowledge[],
  threads: readonly ExtractedThread[],
  lessons: readonly ExtractedLesson[],
): readonly GraphCorpusUnitNode[] {
  const byUnit = new Map<string, UnitAccumulator>();
  for (const thread of [...threads].sort((a, b) => a.slug.localeCompare(b.slug))) {
    for (const unit of thread.units) {
      const node = ensureUnit(byUnit, unit);
      if (!node.threadSlugs.includes(thread.slug)) {
        node.threadSlugs.push(thread.slug);
      }
    }
  }
  for (const pk of [...priorKnowledge].sort((a, b) => a.unitSlug.localeCompare(b.unitSlug))) {
    ensureUnit(byUnit, pk).priorKnowledge.push(pk.requirement);
  }
  for (const lesson of lessons) {
    ensureUnit(byUnit, { ...lesson, year: undefined });
  }
  return [...byUnit.values()]
    .sort((a, b) => a.unitSlug.localeCompare(b.unitSlug))
    .map((node) => ({
      ...node,
      threadSlugs: [...node.threadSlugs].sort((a, b) => a.localeCompare(b)),
      kind: 'unit' as const,
      id: unitNodeId(node.unitSlug),
    }));
}

/** Builds the thread node set, slug-sorted. */
export function buildThreadNodes(
  threads: readonly ExtractedThread[],
): readonly GraphCorpusThreadNode[] {
  return [...threads]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((thread) => ({
      kind: 'thread' as const,
      id: threadNodeId(thread.slug),
      threadSlug: thread.slug,
      title: thread.title,
      firstYear: thread.firstYear,
      lastYear: thread.lastYear,
    }));
}

/** Builds the lesson node set, deduplicated by slug (first-seen metadata), slug-sorted. */
export function buildLessonNodes(
  lessons: readonly ExtractedLesson[],
): readonly GraphCorpusLessonNode[] {
  const bySlug = new Map<string, ExtractedLesson>();
  for (const lesson of [...lessons].sort((a, b) => a.lessonSlug.localeCompare(b.lessonSlug))) {
    if (!bySlug.has(lesson.lessonSlug)) {
      bySlug.set(lesson.lessonSlug, lesson);
    }
  }
  return [...bySlug.values()].map((lesson) => ({
    kind: 'lesson' as const,
    id: lessonNodeId(lesson.lessonSlug),
    lessonSlug: lesson.lessonSlug,
    lessonTitle: lesson.lessonTitle,
    subject: lesson.subject,
    keyStage: lesson.keyStage,
  }));
}

/** The misconception node set plus dedup provenance and edge endpoints. */
export interface MisconceptionBuild {
  readonly nodes: readonly GraphCorpusMisconceptionNode[];
  readonly droppedDuplicates: readonly GraphCorpusDroppedDuplicate[];
  readonly collapsedIdentical: number;
  readonly edgePairs: readonly (readonly [
    GraphCorpusLessonNodeId,
    GraphCorpusMisconceptionNodeId,
  ])[];
}

/** Mutable accumulator for the misconception keep-first dedup pass. */
interface MisconceptionAccumulator {
  readonly byId: Map<GraphCorpusMisconceptionNodeId, GraphCorpusMisconceptionNode>;
  readonly lessonSlugById: Map<GraphCorpusMisconceptionNodeId, string>;
  readonly droppedDuplicates: GraphCorpusDroppedDuplicate[];
  collapsedIdentical: number;
}

/**
 * Absorbs one occurrence: first sight mints the node; an identical
 * re-occurrence collapses idempotently; a same-text-different-response
 * occurrence keeps the first and records provenance (fail-loud).
 */
function absorbOccurrence(acc: MisconceptionAccumulator, entry: ExtractedMisconception): void {
  const id = mintMisconceptionId(entry.lessonSlug, entry.misconception);
  const existing = acc.byId.get(id);
  if (!existing) {
    acc.byId.set(id, {
      kind: 'misconception',
      id,
      misconception: entry.misconception,
      response: entry.response,
    });
    acc.lessonSlugById.set(id, entry.lessonSlug);
    return;
  }
  if (existing.response === entry.response) {
    acc.collapsedIdentical += 1;
    return;
  }
  acc.droppedDuplicates.push({
    lessonSlug: entry.lessonSlug,
    misconception: entry.misconception,
    keptResponse: existing.response,
    droppedResponse: entry.response,
    reason:
      'same normalised misconception text with a different response within one lesson; ' +
      'kept the first occurrence (keep-first rule, data-quality signal)',
  });
}

/** Occurrences ordered by (lessonSlug, normalised text, response) — keep-first is order-independent. */
function sortOccurrences(
  misconceptions: readonly ExtractedMisconception[],
): readonly ExtractedMisconception[] {
  return [...misconceptions].sort(
    (a, b) =>
      a.lessonSlug.localeCompare(b.lessonSlug) ||
      normaliseMisconceptionText(a.misconception).localeCompare(
        normaliseMisconceptionText(b.misconception),
      ) ||
      a.response.localeCompare(b.response),
  );
}

/**
 * Builds misconception nodes under the settled mint rule.
 *
 * Identical `(lessonSlug, normalised text)` occurrences mint the same id and
 * collapse to one node, idempotently (multi-placement lessons). A
 * same-text-different-response pair within one lesson keeps the first
 * occurrence and records provenance — never two nodes, never silence.
 * Output is id-sorted (lessonSlug-grouped, hash-ordered).
 */
export function buildMisconceptionNodes(
  misconceptions: readonly ExtractedMisconception[],
): MisconceptionBuild {
  const acc: MisconceptionAccumulator = {
    byId: new Map(),
    lessonSlugById: new Map(),
    droppedDuplicates: [],
    collapsedIdentical: 0,
  };
  for (const entry of sortOccurrences(misconceptions)) {
    if (entry.misconception.trim()) {
      absorbOccurrence(acc, entry);
    }
  }
  const nodes = [...acc.byId.values()].sort((a, b) => a.id.localeCompare(b.id));
  const edgePairs = nodes.map((node) => {
    const lessonSlug = acc.lessonSlugById.get(node.id);
    if (lessonSlug === undefined) {
      throw new Error(`misconception node ${node.id} has no recorded lesson scope`);
    }
    return [lessonNodeId(lessonSlug), node.id] as const;
  });
  return {
    nodes,
    droppedDuplicates: acc.droppedDuplicates,
    collapsedIdentical: acc.collapsedIdentical,
    edgePairs,
  };
}
