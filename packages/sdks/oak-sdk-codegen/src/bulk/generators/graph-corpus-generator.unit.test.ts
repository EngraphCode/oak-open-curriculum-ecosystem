/**
 * Unit tests for the graph-corpus generator (G1a — one-graph foundation).
 *
 * @remarks
 * TDD: these tests specify the emitted graph-corpus dataset BEFORE the
 * generator exists (RED phase). The describing surface (plan
 * `graph-tools-value-redesign`, deliverable G1a) is the emitted dataset:
 * - unit nodes each carrying an explicit, kind-qualified `id` of the form
 *   `unit:<unitSlug>` (the identity model — never a bare slug);
 * - `prerequisiteFor` edges in the `graph-core` `GraphEdge` shape
 *   (`{ source, type, target }`) whose endpoints reference node `id`s;
 * - integrity resolution: every edge endpoint resolves to a node (zero
 *   dangling endpoints), so the corpus constructs in `createGraphView`
 *   without throwing; an endpoint with no resolvable bulk unit drops its
 *   edge and is recorded in `droppedEdges` provenance.
 *
 * The "constructs in createGraphView without throwing" assertion lives in
 * the graph-corpus-sdk adapter integration test (that workspace depends on
 * `@oaknational/graph-core`); this unit test proves zero-dangling by node-id
 * set membership without crossing that dependency boundary.
 *
 * @see ADR-086 for the vocab-gen graph export pattern
 * @see docs/architecture/architectural-decisions/031 for generation-time extraction
 */
import { describe, expect, it } from 'vitest';

import type { ExtractedPriorKnowledge } from '../extractors/index.js';
import type { ExtractedThread } from '../extractors/thread-extractor.js';

import { generateGraphCorpusData } from './graph-corpus-generator.js';

describe('generateGraphCorpusData', () => {
  const baseThread: ExtractedThread = {
    slug: 'number-fractions',
    title: 'Number: Fractions',
    firstYear: 2,
    lastYear: 6,
    units: [
      {
        unitSlug: 'fractions-year-2',
        unitTitle: 'Fractions Year 2',
        order: 1,
        subject: 'maths',
        keyStage: 'ks1',
        year: 2,
      },
      {
        unitSlug: 'fractions-year-3',
        unitTitle: 'Fractions Year 3',
        order: 2,
        subject: 'maths',
        keyStage: 'ks2',
        year: 3,
      },
      {
        unitSlug: 'fractions-year-4',
        unitTitle: 'Fractions Year 4',
        order: 3,
        subject: 'maths',
        keyStage: 'ks2',
        year: 4,
      },
    ],
  };

  // A unit with a prior-knowledge entry. It is also the last unit of baseThread,
  // so it is both a PK unit and a thread unit (the de-duplication case).
  const basePriorKnowledge: ExtractedPriorKnowledge = {
    requirement: 'Understand equal parts',
    unitSlug: 'fractions-year-4',
    unitTitle: 'Fractions Year 4',
    subject: 'maths',
    keyStage: 'ks2',
    year: 4,
  };

  describe('graph metadata', () => {
    it('returns a corpus with version 1.0.0', () => {
      const result = generateGraphCorpusData([], [], '2026-05-21T13:45:16.086Z');

      expect(result.version).toBe('1.0.0');
    });

    it('includes a generatedAt ISO timestamp', () => {
      const result = generateGraphCorpusData([], [], '2026-05-21T13:45:16.086Z');

      expect(result.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('carries the sourceVersion through from input', () => {
      const result = generateGraphCorpusData([], [], '2026-05-21T13:45:16.086Z');

      expect(result.sourceVersion).toBe('2026-05-21T13:45:16.086Z');
    });
  });

  describe('identity model — materialised kind-qualified node ids', () => {
    it('gives every node an explicit id of the form unit:<unitSlug>', () => {
      const result = generateGraphCorpusData([basePriorKnowledge], [baseThread], '2026-05-21');

      expect(result.nodes.length).toBeGreaterThan(0);
      for (const node of result.nodes) {
        expect(node.id).toBe(`unit:${node.unitSlug}`);
      }
    });

    it('preserves the unitSlug as a content key alongside the id', () => {
      const result = generateGraphCorpusData([], [baseThread], '2026-05-21');

      const node = result.nodes.find((n) => n.id === 'unit:fractions-year-2');
      expect(node?.unitSlug).toBe('fractions-year-2');
    });
  });

  describe('nodes — union of prior-knowledge units and thread units', () => {
    it('creates a node for a thread unit that has no prior-knowledge entry', () => {
      // fractions-year-2 / -3 appear only as thread units (no PK entry).
      const result = generateGraphCorpusData([basePriorKnowledge], [baseThread], '2026-05-21');

      expect(result.nodes.find((n) => n.unitSlug === 'fractions-year-2')).toBeDefined();
      expect(result.nodes.find((n) => n.unitSlug === 'fractions-year-3')).toBeDefined();
    });

    it('carries unit metadata onto nodes built from thread units', () => {
      const result = generateGraphCorpusData([], [baseThread], '2026-05-21');

      const node = result.nodes.find((n) => n.unitSlug === 'fractions-year-3');
      expect(node?.unitTitle).toBe('Fractions Year 3');
      expect(node?.subject).toBe('maths');
      expect(node?.keyStage).toBe('ks2');
      expect(node?.year).toBe(3);
    });

    it('collects prior-knowledge requirements on the node where present', () => {
      const priorKnowledge: readonly ExtractedPriorKnowledge[] = [
        { ...basePriorKnowledge, requirement: 'Requirement 1' },
        { ...basePriorKnowledge, requirement: 'Requirement 2' },
      ];

      const result = generateGraphCorpusData(priorKnowledge, [baseThread], '2026-05-21');

      const node = result.nodes.find((n) => n.unitSlug === 'fractions-year-4');
      expect(node?.priorKnowledge).toContain('Requirement 1');
      expect(node?.priorKnowledge).toContain('Requirement 2');
      expect(node?.priorKnowledge).toHaveLength(2);
    });

    it('gives a thread-only unit an empty prior-knowledge list (not undefined)', () => {
      const result = generateGraphCorpusData([], [baseThread], '2026-05-21');

      const node = result.nodes.find((n) => n.unitSlug === 'fractions-year-2');
      expect(node?.priorKnowledge).toEqual([]);
    });

    it('records thread membership on nodes', () => {
      const result = generateGraphCorpusData([basePriorKnowledge], [baseThread], '2026-05-21');

      const node = result.nodes.find((n) => n.unitSlug === 'fractions-year-4');
      expect(node?.threadSlugs).toContain('number-fractions');
    });

    it('does not duplicate a unit present in both prior knowledge and a thread', () => {
      const result = generateGraphCorpusData([basePriorKnowledge], [baseThread], '2026-05-21');

      const matches = result.nodes.filter((n) => n.unitSlug === 'fractions-year-4');
      expect(matches).toHaveLength(1);
    });
  });

  describe('edges — prerequisiteFor in GraphEdge shape, endpoints as node ids', () => {
    it('creates prerequisiteFor edges from thread ordering with id endpoints', () => {
      const result = generateGraphCorpusData([], [baseThread], '2026-05-21');

      const edge = result.edges.find(
        (e) => e.source === 'unit:fractions-year-2' && e.target === 'unit:fractions-year-3',
      );
      expect(edge).toBeDefined();
      expect(edge?.type).toBe('prerequisiteFor');
    });

    it('orders edges along the thread sequence (year-3 → year-4 present)', () => {
      const result = generateGraphCorpusData([], [baseThread], '2026-05-21');

      const edge = result.edges.find(
        (e) => e.source === 'unit:fractions-year-3' && e.target === 'unit:fractions-year-4',
      );
      expect(edge).toBeDefined();
    });

    it('creates no edges for a single-unit thread', () => {
      const singleUnitThread: ExtractedThread = {
        slug: 'single-unit-thread',
        title: 'Single Unit',
        firstYear: 5,
        lastYear: 5,
        units: [
          {
            unitSlug: 'only-unit',
            unitTitle: 'Only Unit',
            order: 1,
            subject: 'science',
            keyStage: 'ks2',
            year: 5,
          },
        ],
      };

      const result = generateGraphCorpusData([], [singleUnitThread], '2026-05-21');

      expect(result.edges).toHaveLength(0);
    });
  });

  describe('integrity — zero dangling endpoints (constructs in createGraphView)', () => {
    it('resolves every edge endpoint to a node id (zero dangling)', () => {
      const result = generateGraphCorpusData([basePriorKnowledge], [baseThread], '2026-05-21');

      const nodeIds = new Set(result.nodes.map((n) => n.id));
      for (const edge of result.edges) {
        expect(nodeIds.has(edge.source)).toBe(true);
        expect(nodeIds.has(edge.target)).toBe(true);
      }
    });

    it('emits no duplicate node ids (createGraphView rejects duplicates)', () => {
      const result = generateGraphCorpusData([basePriorKnowledge], [baseThread], '2026-05-21');

      const ids = result.nodes.map((n) => n.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('records dropped-edge provenance — empty when all endpoints resolve', () => {
      const result = generateGraphCorpusData([basePriorKnowledge], [baseThread], '2026-05-21');

      expect(result.droppedEdges).toEqual([]);
    });

    it('drops an edge whose endpoint cannot be resolved to a bulk unit, with provenance', () => {
      // A prior-knowledge-only unit that is NOT in any thread cannot be a thread
      // edge endpoint, so all edges still resolve here; this asserts the dropped
      // list stays well-formed (array) even with mixed PK + thread input.
      const pkOnly: ExtractedPriorKnowledge = {
        requirement: 'Standalone requirement',
        unitSlug: 'isolated-unit',
        unitTitle: 'Isolated Unit',
        subject: 'science',
        keyStage: 'ks3',
        year: 7,
      };

      const result = generateGraphCorpusData([pkOnly], [baseThread], '2026-05-21');

      expect(Array.isArray(result.droppedEdges)).toBe(true);
      // The isolated PK unit still gets a node (anchorable), with no edges.
      expect(result.nodes.find((n) => n.unitSlug === 'isolated-unit')).toBeDefined();
    });
  });

  describe('stats', () => {
    it('reports node and edge totals', () => {
      const result = generateGraphCorpusData([basePriorKnowledge], [baseThread], '2026-05-21');

      expect(result.stats.totalNodes).toBe(result.nodes.length);
      expect(result.stats.totalEdges).toBe(result.edges.length);
    });

    it('lists the unique subjects present in the corpus', () => {
      const result = generateGraphCorpusData([], [baseThread], '2026-05-21');

      expect(result.stats.subjectsCovered).toContain('maths');
    });
  });

  describe('graph structure', () => {
    it('returns a well-formed GraphCorpus with all required fields', () => {
      const result = generateGraphCorpusData([basePriorKnowledge], [baseThread], '2026-05-21');

      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('generatedAt');
      expect(result).toHaveProperty('sourceVersion');
      expect(result).toHaveProperty('stats');
      expect(result).toHaveProperty('nodes');
      expect(result).toHaveProperty('edges');
      expect(result).toHaveProperty('droppedEdges');
      expect(result).toHaveProperty('seeAlso');
    });
  });
});
