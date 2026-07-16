import { describe, expect, it } from 'vitest';

import type { LedgerRow } from '../schemas.js';
import { checkLedgerCoverage, cleanAuditShortCircuit } from './meta-coverage.js';
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

function row(id: string): LedgerRow {
  return {
    id,
    factClass: 'status-assertion',
    subject: 'G1',
    predicate: 'status',
    verdict: 'conflict',
    instances: [{ file: 'a.md', line: 1, quote: 'G1 — DONE', valueNorm: 'done' }],
    sourceOfTruth: null,
    proposedCure: 'cite-register',
    severity: 'high',
    metaNotes: '',
  };
}

describe('cleanAuditShortCircuit', () => {
  it('returns the zero-spend empty ledger for zero flagged clusters — never null', () => {
    expect(cleanAuditShortCircuit([])).toStrictEqual({ ok: true, rows: [] });
  });

  it('returns null when clusters exist — the agent must be dispatched', () => {
    expect(cleanAuditShortCircuit([cluster('c1')])).toBeNull();
  });
});

describe('checkLedgerCoverage', () => {
  it('passes exactly-one-row-per-cluster coverage', () => {
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
});
