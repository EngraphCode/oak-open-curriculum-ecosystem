/**
 * Integration tests over the committed graph-corpus dataset (G2 contract —
 * the real-corpus count guards).
 *
 * @remarks
 * The generator unit tests prove the rules on synthetic fixtures; these
 * guards pin the rules' outcome on the committed corpus artefact itself, so
 * a regeneration that changes the dedup or integrity behaviour surfaces as a
 * visible diff in BOTH the data and this expectation (a conscious contract
 * amendment, never silent drift). The expected values are the first-hand
 * measurements recorded in the G2 mint-rule design verdict
 * (`.agent/reports/g2-misconception-mint-rule-design-2026-06-10.md`) and
 * re-verified at G2 execution start against the 2026-06-10 bulk snapshot.
 */
import { describe, expect, it } from 'vitest';

import { graphCorpus } from '../../generated/vocab/graph-corpus/index.js';

describe('committed graph corpus (G2 real-corpus count guards)', () => {
  it('collapses exactly the 473 multi-placement identical misconception pairs', () => {
    expect(graphCorpus.stats.collapsedIdenticalMisconceptions).toBe(473);
  });

  it('drops zero duplicates (no same-text-different-response pair within one lesson)', () => {
    expect(graphCorpus.droppedDuplicates).toEqual([]);
  });

  it('drops zero edges (every endpoint resolves)', () => {
    expect(graphCorpus.droppedEdges).toEqual([]);
  });

  it('emits the expected node-kind counts for the pinned snapshot', () => {
    expect(graphCorpus.stats.nodeKindCounts).toEqual({
      unit: 1624,
      thread: 164,
      lesson: 12391,
      misconception: 12385,
    });
  });

  it('emits one addressesMisconception edge per misconception node', () => {
    expect(graphCorpus.stats.edgeTypeCounts.addressesMisconception).toBe(
      graphCorpus.stats.nodeKindCounts.misconception,
    );
  });

  it('emits misconception nodes id-sorted (deterministic artefact order)', () => {
    const ids = graphCorpus.nodes
      .filter((node) => node.kind === 'misconception')
      .map((node) => node.id);
    const sorted = [...ids].sort((a, b) => a.localeCompare(b));
    expect(ids).toEqual(sorted);
  });

  it('resolves every edge endpoint to an emitted node (zero dangling, all kinds)', () => {
    const ids = new Set(graphCorpus.nodes.map((node) => node.id));
    for (const edge of graphCorpus.edges) {
      expect(ids.has(edge.source)).toBe(true);
      expect(ids.has(edge.target)).toBe(true);
    }
  });
});
