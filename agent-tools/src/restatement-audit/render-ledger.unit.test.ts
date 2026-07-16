import { unwrap } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import type { FlaggedLedgerRow, HeldLedgerRow } from './ledger-rows.js';
import { parseFixLedger, renderLedgerJson, renderLedgerMarkdown } from './render-ledger.js';

function parseLedgerJson(json: string) {
  return unwrap(parseFixLedger(JSON.parse(json)));
}

function row(
  overrides: Partial<FlaggedLedgerRow> & Pick<FlaggedLedgerRow, 'id' | 'severity'>,
): FlaggedLedgerRow {
  return {
    disposition: 'flagged',
    factClass: 'status-assertion',
    subject: 'G1',
    predicate: 'status',
    verdict: 'conflict',
    instances: [
      { file: 'a.md', line: 1, quote: 'discharged', valueNorm: 'discharged' },
      { file: 'b.md', line: 2, quote: 'done', valueNorm: 'done' },
    ],
    droppedMembers: [],
    sourceOfTruth: null,
    proposedCure: 'new-single-source',
    metaNotes: 'two docs disagree',
    ...overrides,
  };
}

function heldRow(id: string): HeldLedgerRow {
  return {
    disposition: 'held-for-review',
    id,
    factClass: 'status-assertion',
    subject: 'G1',
    predicate: 'status',
    verdict: 'latent',
    instances: [
      { file: 'a.md', line: 3, quote: 'done', valueNorm: 'done' },
      { file: 'c.md', line: 4, quote: 'done', valueNorm: 'done' },
    ],
    heldNote: 'voters disagreed — triage via the validate checkpoint voterVerdicts',
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

  it('round-trips every field verbatim, held rows included', () => {
    const rows = [
      row({ id: 'L1', severity: 'high', sourceOfTruth: 'owner-gate-register.md' }),
      heldRow('H1'),
    ];
    const parsed = parseLedgerJson(renderLedgerJson(rows));
    expect(parsed.rows[0]).toEqual(rows[0]);
    expect(parsed.rows[1]).toEqual(rows[1]);
  });

  it('rejects an envelope whose rowCount disagrees with rows.length', () => {
    const json = renderLedgerJson([row({ id: 'L1', severity: 'high' })]);
    const tampered = json.replace('"rowCount": 1', '"rowCount": 5');
    expect(parseFixLedger(JSON.parse(tampered)).ok).toBe(false);
  });

  it('serialises an empty ledger', () => {
    const parsed = parseLedgerJson(renderLedgerJson([]));
    expect(parsed.rowCount).toBe(0);
    expect(parsed.rows).toEqual([]);
  });
});

describe('renderLedgerMarkdown', () => {
  it('counts every disposition in the summary line — held included, never conflated', () => {
    const rows = [
      row({ id: 'L1', severity: 'high' }),
      row({ id: 'L2', severity: 'high' }),
      row({ id: 'L3', severity: 'low' }),
      heldRow('H1'),
    ];
    const md = renderLedgerMarkdown(rows);
    expect(md).toContain(
      '4 row(s) — 3 flagged (0 degraded), 1 held-for-review; flagged severity: 2 high, 0 med, 1 low.',
    );
  });

  it('counts degraded rows — a drop is a visible ledger fact', () => {
    const degraded = row({
      id: 'L1',
      severity: 'med',
      instances: [{ file: 'a.md', line: 1, quote: 'discharged', valueNorm: 'discharged' }],
      droppedMembers: [
        { file: 'b.md', line: 2, quote: 'done', reason: 'quote absent from live file' },
      ],
    });
    const md = renderLedgerMarkdown([degraded]);
    expect(md).toContain('1 row(s) — 1 flagged (1 degraded), 0 held-for-review');
    expect(md).toContain('DEGRADED');
    expect(md).toContain('Dropped at byte-verify');
    expect(md).toContain('quote absent from live file');
  });

  it('renders a fully degraded row with an explicit no-survivors marker, never an empty section', () => {
    const fullyDegraded = row({
      id: 'L1',
      severity: 'low',
      instances: [],
      droppedMembers: [
        { file: 'a.md', line: 1, quote: 'discharged', reason: 'file deleted' },
        { file: 'b.md', line: 2, quote: 'done', reason: 'file deleted' },
      ],
    });
    const md = renderLedgerMarkdown([fullyDegraded]);
    expect(md).toContain('every member dropped at byte-verify');
  });

  it('renders held rows distinctly marked, after the flagged rows', () => {
    const md = renderLedgerMarkdown([heldRow('H1'), row({ id: 'L1', severity: 'low' })]);
    expect(md).toContain('### H1 — HELD FOR REVIEW — latent');
    expect(md).toContain('triage via the validate checkpoint');
    expect(md.indexOf('### L1')).toBeLessThan(md.indexOf('### H1'));
  });

  it('orders flagged rows most-severe-first', () => {
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

  it('renders an all-held ledger with an explicit non-zero row count — never mistakable for clean', () => {
    const md = renderLedgerMarkdown([heldRow('H1'), heldRow('H2')]);
    expect(md).toContain('2 row(s) — 0 flagged (0 degraded), 2 held-for-review');
  });

  it('renders an empty ledger reading "0 row(s)" explicitly', () => {
    const md = renderLedgerMarkdown([]);
    expect(md).toContain('0 row(s) — 0 flagged (0 degraded), 0 held-for-review');
  });
});
