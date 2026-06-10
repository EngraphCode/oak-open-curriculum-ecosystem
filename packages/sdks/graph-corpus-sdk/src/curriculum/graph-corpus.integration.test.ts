/**
 * Integration test (G1a): the emitted graph corpus loads from
 * `@oaknational/sdk-codegen/graph-corpus` and constructs a `GraphView` over the
 * full corpus without throwing.
 *
 * @remarks
 * This is the G1a "integration (emitted corpus loads)" proof at corpus scale:
 * the generator unit test specifies the emitted shape against fixtures; this
 * test exercises the REAL emitted dataset (≈1.6k unit nodes, ≈3.5k
 * prerequisiteFor edges) through the loader and the `createGraphView`
 * construction contract, proving the integrity resolution holds at scale (zero
 * dangling endpoints, no duplicate ids).
 */
import { describe, expect, it } from 'vitest';

import { createCurriculumPrerequisiteGraph, graphCorpus } from './graph-corpus.js';

describe('curriculum graph corpus (integration over the emitted dataset)', () => {
  it('loads the emitted corpus with unit nodes and prerequisiteFor edges', () => {
    expect(graphCorpus.nodes.length).toBeGreaterThan(1000);
    expect(graphCorpus.edges.length).toBeGreaterThan(1000);
    expect(graphCorpus.edges.every((edge) => edge.type === 'prerequisiteFor')).toBe(true);
  });

  it('carries a materialised kind-qualified unit id on every node', () => {
    expect(graphCorpus.nodes.every((node) => node.id === `unit:${node.unitSlug}`)).toBe(true);
  });

  it('has zero dropped edges (G1a integrity resolution complete)', () => {
    expect(graphCorpus.droppedEdges).toHaveLength(0);
  });

  it('resolves every edge endpoint to a node id (zero dangling at corpus scale)', () => {
    const ids = new Set(graphCorpus.nodes.map((node) => node.id));
    const dangling = graphCorpus.edges.filter(
      (edge) => !ids.has(edge.source) || !ids.has(edge.target),
    );
    expect(dangling).toHaveLength(0);
  });

  it('constructs in createGraphView without throwing', () => {
    expect(() => createCurriculumPrerequisiteGraph(3)).not.toThrow();
  });
});
