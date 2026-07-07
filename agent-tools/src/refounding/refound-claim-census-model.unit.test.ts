import { describe, expect, it } from 'vitest';

import { sha256Hex } from './refounding-artefacts.js';
import {
  buildCensusRecords,
  parseCensusRecord,
  sortCensusRecords,
  type CensusRecord,
} from './refound-claim-census-model.js';

/**
 * Pure behaviours of the census's extraction side: verbatim status-value and
 * completion-keyword extraction under the shared fence blackout, the C2
 * planted-defect discrimination (a planted completion line is caught; a
 * misspelt one is not), the ratified keyword-list pin, record ordering, and
 * the closed record schema. The counted-summary side is described in
 * `refound-claim-census-report.unit.test.ts`.
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
