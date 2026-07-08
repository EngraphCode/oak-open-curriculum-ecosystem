import { describe, expect, it } from 'vitest';

import { sha256Hex } from './refounding-artefacts.js';
import { sortCensusRecords, type CensusRecord } from './refound-claim-census-model.js';
import {
  buildCensusReport,
  decideCensusVerdict,
  parseStatusMappingTable,
} from './refound-claim-census-report.js';

/**
 * Pure behaviours of the census's counted-summary side: the injected C1
 * mapping table (closed, pre-trimmed, duplicate- and reserved-name-refusing),
 * trim-exact application with UNMAPPED as a named counted residue, the
 * over-20-percent UNMAPPED halt (integer arithmetic, exceed-only), report
 * determinism, and the pure exit-code verdict.
 */

const bytes = (text: string): Uint8Array => Buffer.from(text, 'utf8');

describe('parseStatusMappingTable (the injected C1 seam)', () => {
  it('parses a versioned table and rejects unknown keys, empty entries, and untrimmed values', () => {
    const table = { version: 1, entries: [{ value: 'pending', verdict: 'open' }] };
    expect(parseStatusMappingTable(table).ok).toBe(true);
    expect(parseStatusMappingTable({ ...table, extra: 1 }).ok).toBe(false);
    expect(parseStatusMappingTable({ version: 1, entries: [] }).ok).toBe(false);
    expect(
      parseStatusMappingTable({ version: 1, entries: [{ value: ' pending', verdict: 'open' }] }).ok,
    ).toBe(false);
  });

  it("rejects the reserved residue-class name 'UNMAPPED' as an authored verdict", () => {
    expect(
      parseStatusMappingTable({ version: 1, entries: [{ value: 'x', verdict: 'UNMAPPED' }] }).ok,
    ).toBe(false);
  });

  it('rejects duplicate values (a collision, not a silent last-wins)', () => {
    const parsed = parseStatusMappingTable({
      version: 1,
      entries: [
        { value: 'pending', verdict: 'open' },
        { value: 'pending', verdict: 'closed' },
      ],
    });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error.message).toContain('duplicate');
    }
  });
});

describe('buildCensusReport', () => {
  const statusRecord = (value: string, line: number): CensusRecord => ({
    file: 'plans/a.md',
    line,
    markers: [],
    statusValue: value,
    text: `status:${value}`,
    sha256: sha256Hex(bytes(`status:${value}`)),
  });

  const table = {
    version: 1,
    entries: [
      { value: 'pending', verdict: 'open' },
      { value: 'completed', verdict: 'closed-claim' },
    ],
  };

  it('reports without mapping when no table is injected (census is valuable alone)', () => {
    const report = buildCensusReport({
      records: [statusRecord(' pending', 2)],
      totalFiles: 1,
      totalLines: 10,
      table: null,
    });
    expect(report.ok).toBe(true);
    if (report.ok) {
      expect(report.value.mapping).toBeNull();
      expect(report.value.totals.statusLines).toBe(1);
      expect(report.value.keywordCounts.length).toBeGreaterThan(0);
    }
  });

  it('maps status values trim-exact per typed verdict with UNMAPPED as a counted residue', () => {
    const parsed = parseStatusMappingTable(table);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }
    const report = buildCensusReport({
      records: [
        statusRecord(' pending', 2),
        statusRecord(' pending ', 12),
        statusRecord(' completed', 22),
        statusRecord(' completed', 27),
        statusRecord(' Pending', 32),
        statusRecord(' pending', 42),
      ],
      totalFiles: 1,
      totalLines: 100,
      table: parsed.value,
    });
    expect(report.ok && report.value.mapping !== null).toBe(true);
    if (report.ok && report.value.mapping !== null) {
      expect(report.value.mapping.verdicts).toEqual([
        { verdict: 'closed-claim', count: 2 },
        { verdict: 'open', count: 3 },
      ]);
      expect(report.value.mapping.unmapped).toEqual({ count: 1, distinctValues: ['Pending'] });
    }
  });

  it('halts (nothing computed) when UNMAPPED exceeds 20% of status lines — integer arithmetic', () => {
    const parsed = parseStatusMappingTable(table);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }
    const report = buildCensusReport({
      records: [
        statusRecord(' pending', 1),
        statusRecord(' pending', 2),
        statusRecord(' pending', 3),
        statusRecord(' mystery-state', 4),
      ],
      totalFiles: 1,
      totalLines: 100,
      table: parsed.value,
    });
    expect(report.ok).toBe(false);
    if (!report.ok) {
      expect(report.error.message).toContain('halt');
      expect(report.error.message).toContain('UNMAPPED');
    }
  });

  it('does not halt at exactly 20% (the band is exceed-only)', () => {
    const parsed = parseStatusMappingTable(table);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }
    const records = [
      statusRecord(' pending', 1),
      statusRecord(' pending', 2),
      statusRecord(' pending', 3),
      statusRecord(' pending', 4),
      statusRecord(' mystery-state', 5),
    ];
    const report = buildCensusReport({
      records,
      totalFiles: 1,
      totalLines: 100,
      table: parsed.value,
    });
    expect(report.ok).toBe(true);
  });

  it('renders byte-identically regardless of input record order (determinism)', () => {
    const records = [statusRecord(' pending', 2), statusRecord(' completed', 1)];
    const forward = buildCensusReport({
      records: sortCensusRecords(records),
      totalFiles: 1,
      totalLines: 10,
      table: null,
    });
    const reversed = buildCensusReport({
      records: sortCensusRecords([...records].reverse()),
      totalFiles: 1,
      totalLines: 10,
      table: null,
    });
    expect(forward.ok && reversed.ok).toBe(true);
    if (forward.ok && reversed.ok) {
      expect(JSON.stringify(forward.value)).toBe(JSON.stringify(reversed.value));
    }
  });
});

describe('decideCensusVerdict — the exit-code contract', () => {
  it('exits 0 with the mapping summary when a table was applied', () => {
    const verdict = decideCensusVerdict({
      files: 3,
      records: 5,
      statusLines: 4,
      keywordLines: 2,
      mapping: { verdicts: 2, unmapped: 1 },
    });
    expect(verdict.exitCode).toBe(0);
    expect(verdict.lines).toHaveLength(1);
    expect(verdict.lines[0]).toContain('2 distinct verdict(s), 1 UNMAPPED line(s)');
    expect(verdict.lines[0]).toContain('claim-census.v1.jsonl');
    expect(verdict.lines[0]).toContain('claim-census.v1.report.json');
  });

  it('exits 0 naming the absent table when none was injected', () => {
    const verdict = decideCensusVerdict({
      files: 1,
      records: 0,
      statusLines: 0,
      keywordLines: 0,
      mapping: null,
    });
    expect(verdict.exitCode).toBe(0);
    expect(verdict.lines).toHaveLength(1);
    expect(verdict.lines[0]).toContain('no mapping table injected');
  });
});
