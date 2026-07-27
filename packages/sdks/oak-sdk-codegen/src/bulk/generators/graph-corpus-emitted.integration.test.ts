/**
 * Integration tests over the committed graph-corpus dataset (G2 + G4b
 * contract — the real-corpus count guards).
 *
 * @remarks
 * The generator unit tests prove the rules on synthetic fixtures; these
 * guards pin the rules' outcome on the committed corpus artefact itself, so
 * a regeneration that changes the dedup or integrity behaviour surfaces as a
 * visible diff in BOTH the data and this expectation (a conscious contract
 * amendment, never silent drift). The original G2/G4b values were the
 * first-hand measurements against the 2026-06-10 bulk snapshot
 * (`.agent/reports/g2-misconception-mint-rule-design-2026-06-10.md` and the
 * G4b readiness synthesis, 2026-06-11). CONSCIOUS AMENDMENT (2026-07-27,
 * MCP-153): the pins now record the 2026-07-27 bulk snapshot with the
 * MCP-204 restricted-lesson exclusion applied (3,372 restricted lesson
 * records / 2,641 distinct slugs removed before extraction) — each value
 * below re-measured first-hand from the regenerated artefact.
 */
import { describe, expect, it } from 'vitest';

import { graphCorpus } from '../../generated/vocab/graph-corpus/index.js';

describe('committed graph corpus (G2 + G4b real-corpus count guards)', () => {
  it('collapses exactly the 3,583 multi-placement identical misconception pairs', () => {
    expect(graphCorpus.stats.collapsedIdenticalMisconceptions).toBe(3583);
  });

  it('drops zero duplicates (no same-text-different-response pair within one lesson)', () => {
    expect(graphCorpus.droppedDuplicates).toEqual([]);
  });

  it('drops zero edges (every endpoint resolves)', () => {
    expect(graphCorpus.droppedEdges).toEqual([]);
  });

  it('emits the expected node-kind counts for the pinned snapshot', () => {
    expect(graphCorpus.stats.nodeKindCounts).toEqual({
      unit: 1834,
      thread: 160,
      lesson: 11022,
      misconception: 11017,
      keyword: 12250,
    });
  });

  it('emits one containsKeyword edge per unique lesson placement (G4b pinned snapshot)', () => {
    expect(graphCorpus.stats.edgeTypeCounts.containsKeyword).toBe(38655);
  });

  it('emits keyword nodes id-sorted (deterministic artefact order)', () => {
    const ids = graphCorpus.nodes.filter((node) => node.kind === 'keyword').map((node) => node.id);
    expect(ids.length).toBeGreaterThan(0);
    const sorted = [...ids].sort((a, b) => a.localeCompare(b));
    expect(ids).toEqual(sorted);
  });

  it('stats node-kind counts match a direct recount of the emitted nodes', () => {
    // The stats block must describe the artefact, not merely record what the
    // generator believed at write time (validators recompute, never just read).
    const counts: Record<string, number> = {};
    for (const node of graphCorpus.nodes) {
      counts[node.kind] = (counts[node.kind] ?? 0) + 1;
    }
    expect(counts).toEqual(graphCorpus.stats.nodeKindCounts);
  });

  it('stats edge-type counts match a direct recount of the emitted edges', () => {
    const counts: Record<string, number> = {};
    for (const edge of graphCorpus.edges) {
      counts[edge.type] = (counts[edge.type] ?? 0) + 1;
    }
    expect(counts).toEqual(graphCorpus.stats.edgeTypeCounts);
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
    const dangling = graphCorpus.edges.filter(
      (edge) => !ids.has(edge.source) || !ids.has(edge.target),
    );
    expect(dangling).toEqual([]);
  });
});
