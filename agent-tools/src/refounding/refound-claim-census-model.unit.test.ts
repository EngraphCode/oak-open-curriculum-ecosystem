import { describe, expect, it } from 'vitest';

import { sha256Hex } from './refounding-artefacts.js';
import {
  buildCensusRecords,
  COMPLETION_KEYWORDS_V1,
  parseCensusRecord,
  sortCensusRecords,
  type CensusRecord,
} from './refound-claim-census-model.js';
import { buildCensusReport, parseStatusMappingTable } from './refound-claim-census-report.js';

/**
 * Pure behaviours of the claim census: verbatim status-value and
 * completion-keyword extraction under the shared fence blackout, the C2
 * planted-defect discrimination (a planted completion line is caught; a
 * misspelt one is not), trim-exact mapping application with UNMAPPED as a
 * named counted residue, and the over-20-percent UNMAPPED halt.
 */

const bytes = (text: string): Uint8Array => Buffer.from(text, 'utf8');

describe('buildCensusRecords', () => {
  it('captures a frontmatter status line verbatim with its after-colon value', () => {
    const records = buildCensusRecords('plans/a.md', bytes('---\nstatus: pending\n---\n\n# A\n'));
    expect(records).toHaveLength(1);
    const record = records[0];
    expect(record.line).toBe(2);
    expect(record.statusValue).toBe(' pending');
    expect(record.text).toBe('status: pending');
    expect(record.sha256).toBe(sha256Hex(bytes('status: pending')));
  });

  it('captures a completion-keyword line with its matched markers in list order', () => {
    const records = buildCensusRecords('plans/a.md', bytes('# A\n\nThe lane LANDED and merged.\n'));
    expect(records).toHaveLength(1);
    expect(records[0].line).toBe(3);
    expect(records[0].markers).toEqual(['landed', 'merged']);
    expect(records[0].statusValue).toBeNull();
  });

  it('attributes a status line whose value is also a completion keyword to BOTH captures', () => {
    const records = buildCensusRecords('plans/a.md', bytes('---\nstatus: completed\n---\n'));
    expect(records).toHaveLength(1);
    expect(records[0].statusValue).toBe(' completed');
    expect(records[0].markers).toEqual(['completed', 'complete']);
  });

  it('C2 planted-defect proof: the planted completion line is caught; the misspelt one is not', () => {
    const planted = buildCensusRecords('plans/p.md', bytes('The migration is now complete.\n'));
    const misspelt = buildCensusRecords('plans/p.md', bytes('The migration is now complte.\n'));
    expect(planted).toHaveLength(1);
    expect(planted[0].markers).toEqual(['complete']);
    expect(misspelt).toEqual([]);
  });

  it('blacks out fenced content and never scans fence delimiters for keywords', () => {
    const records = buildCensusRecords(
      'plans/a.md',
      bytes('# A\n\n```done\nstatus: done\nall done here\n```\ndone after the fence\n'),
    );
    expect(records).toHaveLength(1);
    expect(records[0].line).toBe(7);
    expect(records[0].text).toBe('done after the fence');
  });

  it('captures an inline body status line (definition-key style)', () => {
    const records = buildCensusRecords('plans/a.md', bytes('# A\n\nStatus: DECISION-READY\n'));
    expect(records).toHaveLength(1);
    expect(records[0].statusValue).toBe(' DECISION-READY');
  });
});

describe('sortCensusRecords and record parsing', () => {
  const record = (file: string, line: number): CensusRecord => ({
    file,
    line,
    markers: ['done'],
    statusValue: null,
    text: 'done',
    sha256: sha256Hex(bytes('done')),
  });

  it('sorts by (file, line) — the determinism contract order', () => {
    const sorted = sortCensusRecords([record('b.md', 1), record('a.md', 9), record('a.md', 2)]);
    expect(sorted.map((entry) => `${entry.file}:${String(entry.line)}`)).toEqual([
      'a.md:2',
      'a.md:9',
      'b.md:1',
    ]);
  });

  it('rejects a record with an unknown key (closed schema) or a bad digest', () => {
    expect(parseCensusRecord({ ...record('a.md', 1), extra: true }).ok).toBe(false);
    expect(parseCensusRecord({ ...record('a.md', 1), sha256: 'zz' }).ok).toBe(false);
    expect(parseCensusRecord(record('a.md', 1)).ok).toBe(true);
  });
});

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
      expect(report.value.keywordCounts).toHaveLength(COMPLETION_KEYWORDS_V1.length);
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
    expect(report.ok).toBe(true);
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
