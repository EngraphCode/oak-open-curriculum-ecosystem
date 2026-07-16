import { describe, expect, it } from 'vitest';

import type { MetaAgentRow } from '../ledger-rows.js';
import {
  checkLedgerCoverage,
  composeMetaLedger,
  heldLedgerRows,
  zeroFlaggedShortCircuit,
} from './meta-coverage.js';
import type { MetaCluster } from './stage-io.js';

const grounding = {
  id: 'W01-I01',
  file: 'a.md',
  line: 1,
  quote: 'G1 — DONE',
  valueNorm: 'done',
  assertionKind: 'authored',
} as const;

function cluster(id: string): MetaCluster {
  return {
    id,
    factClass: 'status-assertion',
    subject: 'G1',
    predicate: 'status',
    verdict: 'conflict',
    instances: [grounding, { ...grounding, id: 'W01-I02', valueNorm: 'discharged' }],
  };
}

function row(id: string): MetaAgentRow {
  return {
    id,
    factClass: 'status-assertion',
    subject: 'G1',
    predicate: 'status',
    verdict: 'conflict',
    instances: [
      { file: 'a.md', line: 1, quote: 'G1 — DONE', valueNorm: 'done' },
      { file: 'a.md', line: 2, quote: 'G1 — DISCHARGED', valueNorm: 'discharged' },
    ],
    droppedMembers: [],
    sourceOfTruth: null,
    proposedCure: 'cite-register',
    severity: 'high',
    metaNotes: '',
  };
}

describe('heldLedgerRows', () => {
  it('builds one distinctly marked row per held cluster, restating its identity fields', () => {
    const rows = heldLedgerRows([cluster('h1')]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.disposition).toBe('held-for-review');
    expect(rows[0]?.id).toBe('h1');
    expect(rows[0]?.factClass).toBe('status-assertion');
    expect(rows[0]?.verdict).toBe('conflict');
  });

  it('projects instances to the ledger shape and points the note at the validate checkpoint', () => {
    const [built] = heldLedgerRows([cluster('h1')]);
    expect(built?.instances).toEqual([
      { file: 'a.md', line: 1, quote: 'G1 — DONE', valueNorm: 'done' },
      { file: 'a.md', line: 1, quote: 'G1 — DONE', valueNorm: 'discharged' },
    ]);
    expect(built?.heldNote).toContain('validate checkpoint');
  });

  it('builds nothing from zero held clusters', () => {
    expect(heldLedgerRows([])).toEqual([]);
  });
});

describe('zeroFlaggedShortCircuit', () => {
  it('returns the zero-spend EMPTY ledger for a truly clean audit — zero flagged, zero held', () => {
    expect(zeroFlaggedShortCircuit([], [])).toStrictEqual({ ok: true, rows: [] });
  });

  it('returns the held rows as the whole ledger when zero flagged but voters disagreed — all-held never renders clean', () => {
    const held = heldLedgerRows([cluster('h1'), cluster('h2')]);
    const result = zeroFlaggedShortCircuit([], held);
    expect(result).toStrictEqual({ ok: true, rows: held });
  });

  it('returns null when flagged clusters exist — the agent must be dispatched', () => {
    expect(zeroFlaggedShortCircuit([cluster('c1')], [])).toBeNull();
  });
});

describe('composeMetaLedger', () => {
  it('stamps disposition flagged on every agent row — the agent never emits the discriminant', () => {
    const composed = composeMetaLedger([row('c1')], []);
    expect(composed).toHaveLength(1);
    expect(composed[0]?.disposition).toBe('flagged');
  });

  it('carries held rows through the MIXED audit — flagged first, held after, none lost', () => {
    const held = heldLedgerRows([cluster('h1')]);
    const composed = composeMetaLedger([row('c1')], held);
    expect(composed.map((entry) => entry.disposition)).toEqual(['flagged', 'held-for-review']);
    expect(composed.map((entry) => entry.id)).toEqual(['c1', 'h1']);
  });

  it('composes an all-held ledger when the agent produced no rows', () => {
    const held = heldLedgerRows([cluster('h1'), cluster('h2')]);
    expect(composeMetaLedger([], held)).toEqual(held);
  });
});

describe('checkLedgerCoverage', () => {
  it('passes exactly-one-row-per-cluster coverage with matching field identity', () => {
    expect(checkLedgerCoverage([cluster('c1'), cluster('c2')], [row('c1'), row('c2')])).toBeNull();
  });

  it('names a cluster with no row', () => {
    expect(checkLedgerCoverage([cluster('c1')], [])).toContain('c1');
  });

  it('names a row matching no flagged cluster', () => {
    const message = checkLedgerCoverage([cluster('c1')], [row('c1'), row('ghost')]);
    expect(message).toContain('ghost');
  });

  it('names a cluster with DUPLICATE rows — presence alone must never pass', () => {
    const message = checkLedgerCoverage([cluster('c1')], [row('c1'), row('c1')]);
    expect(message).toContain('c1×2');
  });

  it('names a row that keeps the cluster id but swaps an identity field — an id alone is not coverage', () => {
    const swapped = { ...row('c1'), subject: 'G2' };
    const message = checkLedgerCoverage([cluster('c1')], [swapped]);
    expect(message).toContain("c1.subject row='G2' cluster='G1'");
  });

  it('names a verdict swap per id', () => {
    const swapped = { ...row('c1'), verdict: 'latent' as const };
    const message = checkLedgerCoverage([cluster('c1')], [swapped]);
    expect(message).toContain("c1.verdict row='latent' cluster='conflict'");
  });

  it('names a factClass swap per id — every identity field is load-bearing', () => {
    const swapped = { ...row('c1'), factClass: 'count' as const };
    const message = checkLedgerCoverage([cluster('c1')], [swapped]);
    expect(message).toContain("c1.factClass row='count' cluster='status-assertion'");
  });

  it('names a predicate swap per id', () => {
    const swapped = { ...row('c1'), predicate: 'member-count' };
    const message = checkLedgerCoverage([cluster('c1')], [swapped]);
    expect(message).toContain("c1.predicate row='member-count' cluster='status'");
  });

  it('names a row below the ≥2 member floor — the refine cannot reach the derived agent schema, so the recompute is the in-stage gate', () => {
    const subFloor = { ...row('c1'), instances: row('c1').instances.slice(0, 1) };
    const message = checkLedgerCoverage([cluster('c1')], [subFloor]);
    expect(message).toContain('below the ≥2 member floor');
    expect(message).toContain('c1 (1 surviving + 0 dropped)');
  });

  it('names a row that silently sheds a member of a 3-member cluster — the global floor passes but conservation fails', () => {
    const threeMember: MetaCluster = {
      ...cluster('c1'),
      instances: [
        grounding,
        { ...grounding, id: 'W01-I02', valueNorm: 'discharged' },
        { ...grounding, id: 'W01-I03', file: 'c.md', line: 7 },
      ],
    };
    const shedOne = row('c1');
    const message = checkLedgerCoverage([threeMember], [shedOne]);
    expect(message).toContain('member-conservation');
    expect(message).toContain('c1 (accounted 2 ≠ cluster members 3)');
  });

  it('names a row that pads an extra instance beyond its cluster members', () => {
    const padded = {
      ...row('c1'),
      instances: [
        ...row('c1').instances,
        { file: 'd.md', line: 9, quote: 'G1 — PADDED', valueNorm: 'padded' },
      ],
    };
    const message = checkLedgerCoverage([cluster('c1')], [padded]);
    expect(message).toContain('c1 (accounted 3 ≠ cluster members 2)');
  });

  it('passes conservation when a drop accounts for the missing member', () => {
    const threeMember: MetaCluster = {
      ...cluster('c1'),
      instances: [
        grounding,
        { ...grounding, id: 'W01-I02', valueNorm: 'discharged' },
        { ...grounding, id: 'W01-I03', file: 'c.md', line: 7 },
      ],
    };
    const withNamedDrop = {
      ...row('c1'),
      droppedMembers: [
        { file: 'c.md', line: 7, quote: 'G1 — DONE', reason: 'quote absent from live file' },
      ],
    };
    expect(checkLedgerCoverage([threeMember], [withNamedDrop])).toBeNull();
  });
});
