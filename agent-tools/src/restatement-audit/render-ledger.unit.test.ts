import { unwrap } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { parseFixLedger, renderLedgerJson, renderLedgerMarkdown } from './render-ledger.js';
import type { LedgerRow } from './schemas.js';

function parseLedgerJson(json: string) {
  return unwrap(parseFixLedger(JSON.parse(json)));
}

function row(overrides: Partial<LedgerRow> & Pick<LedgerRow, 'id' | 'severity'>): LedgerRow {
  return {
    factClass: 'status-assertion',
    subject: 'G1',
    predicate: 'status',
    verdict: 'conflict',
    instances: [
      { file: 'a.md', line: 1, quote: 'discharged', valueNorm: 'discharged' },
      { file: 'b.md', line: 2, quote: 'done', valueNorm: 'done' },
    ],
    sourceOfTruth: null,
    proposedCure: 'new-single-source',
    metaNotes: 'two docs disagree',
    ...overrides,
  };
}

describe('renderLedgerJson', () => {
  it('wraps rows in the versioned envelope with an accurate rowCount', () => {
    const rows = [row({ id: 'L1', severity: 'high' }), row({ id: 'L2', severity: 'low' })];
    const parsed = parseLedgerJson(renderLedgerJson(rows));
    expect(parsed.version).toBe('fix-ledger.v1');
    expect(parsed.rowCount).toBe(2);
    expect(parsed.rows).toHaveLength(2);
  });

  it('round-trips every field verbatim', () => {
    const rows = [row({ id: 'L1', severity: 'high', sourceOfTruth: 'owner-gate-register.md' })];
    const parsed = parseLedgerJson(renderLedgerJson(rows));
    expect(parsed.rows[0]).toEqual(rows[0]);
  });

  it('serialises an empty ledger', () => {
    const parsed = parseLedgerJson(renderLedgerJson([]));
    expect(parsed.rowCount).toBe(0);
    expect(parsed.rows).toEqual([]);
  });
});

describe('renderLedgerMarkdown', () => {
  it('counts rows by severity in the summary line', () => {
    const rows = [
      row({ id: 'L1', severity: 'high' }),
      row({ id: 'L2', severity: 'high' }),
      row({ id: 'L3', severity: 'low' }),
    ];
    const md = renderLedgerMarkdown(rows);
    expect(md).toContain('3 row(s) — 2 high, 0 med, 1 low severity.');
  });

  it('orders rows most-severe-first', () => {
    const rows = [row({ id: 'LOW', severity: 'low' }), row({ id: 'HIGH', severity: 'high' })];
    const md = renderLedgerMarkdown(rows);
    expect(md.indexOf('### HIGH')).toBeLessThan(md.indexOf('### LOW'));
  });

  it('renders a null sourceOfTruth as a prevention-design note, not a literal null', () => {
    const md = renderLedgerMarkdown([row({ id: 'L1', severity: 'med', sourceOfTruth: null })]);
    expect(md).toContain('prevention-design input');
    expect(md).not.toMatch(/Source of truth:\s*null/);
  });

  it('renders every instance file:line and quote', () => {
    const md = renderLedgerMarkdown([row({ id: 'L1', severity: 'med' })]);
    expect(md).toContain('a.md:1');
    expect(md).toContain('discharged');
    expect(md).toContain('b.md:2');
    expect(md).toContain('done');
  });

  it('renders an empty ledger without error', () => {
    const md = renderLedgerMarkdown([]);
    expect(md).toContain('0 row(s)');
  });
});
