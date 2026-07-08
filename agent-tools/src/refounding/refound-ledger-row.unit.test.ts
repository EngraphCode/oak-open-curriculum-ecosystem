import { describe, expect, it } from 'vitest';

import { compareByCodeUnit, type DenominatorFile } from './refounding-artefacts.js';
import {
  areaOfFrozenPath,
  deriveBlockId,
  groupFilesByArea,
  ledgerBasenameForArea,
  parseLedgerJsonl,
  parseLedgerRow,
} from './refound-ledger-row.js';

const SHA_A = 'a'.repeat(64);

const validRow = (): Record<string, unknown> => ({
  block_id: 'plans/a.md:1-4',
  file: 'plans/a.md',
  line_start: 1,
  line_end: 4,
  disposition: 'default-block',
  home: '',
  binding: '',
});

describe('parseLedgerRow — the canonical v1 row schema (7 fields, strict)', () => {
  it('parses a valid row; empty binding and home are LEGAL at the row layer', () => {
    const result = parseLedgerRow(validRow());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.binding).toBe('');
      expect(result.value.home).toBe('');
    }
  });

  it('rejects an unknown key (closed shape)', () => {
    expect(parseLedgerRow({ ...validRow(), lane: 'x' }).ok).toBe(false);
  });

  it('rejects a missing field', () => {
    const row = validRow();
    delete row.disposition;
    expect(parseLedgerRow(row).ok).toBe(false);
  });

  it('rejects empty block_id, file, and disposition', () => {
    expect(parseLedgerRow({ ...validRow(), block_id: '' }).ok).toBe(false);
    expect(parseLedgerRow({ ...validRow(), file: '' }).ok).toBe(false);
    expect(parseLedgerRow({ ...validRow(), disposition: '' }).ok).toBe(false);
  });

  it('rejects non-positive line coordinates', () => {
    expect(parseLedgerRow({ ...validRow(), line_start: 0 }).ok).toBe(false);
    expect(parseLedgerRow({ ...validRow(), line_end: -1 }).ok).toBe(false);
  });
});

describe('deriveBlockId — coordinate-derived ids', () => {
  it('derives the id from frozen path + span', () => {
    expect(deriveBlockId('plans/a.md', 3, 9)).toBe('plans/a.md:3-9');
  });

  it('mints a NEW id when the segmentation changes (never a counter)', () => {
    expect(deriveBlockId('plans/a.md', 3, 9)).not.toBe(deriveBlockId('plans/a.md', 3, 8));
    expect(deriveBlockId('plans/a.md', 3, 9)).not.toBe(deriveBlockId('plans/b.md', 3, 9));
  });
});

describe('areaOfFrozenPath — the mechanical file→area rule', () => {
  it('maps nested plans paths to plans--<subdir>', () => {
    expect(areaOfFrozenPath('plans/semantic-search/current/foo.plan.md')).toBe(
      'plans--semantic-search',
    );
    expect(areaOfFrozenPath('plans/agent-tooling/x.md')).toBe('plans--agent-tooling');
  });

  it('maps root-level class files to the class root (their own small batch)', () => {
    expect(areaOfFrozenPath('plans/README.md')).toBe('plans');
    expect(areaOfFrozenPath('milestones/m0.md')).toBe('milestones');
  });

  it('maps nested non-plans classes by the same two-segment rule', () => {
    expect(areaOfFrozenPath('proposals/kg-ont-mcp-strat/x.md')).toBe('proposals--kg-ont-mcp-strat');
  });
});

describe('ledgerBasenameForArea', () => {
  it('derives the per-area ledger basename', () => {
    expect(ledgerBasenameForArea('plans--semantic-search')).toBe(
      'plans--semantic-search.ledger.jsonl',
    );
  });
});

const denominatorFile = (path: string): DenominatorFile => ({
  path,
  bytes: 10,
  sha256: SHA_A,
  lines: 2,
  inventory_mode: 'lines',
});

describe('groupFilesByArea', () => {
  it('groups denominator files by derived area', () => {
    const grouped = groupFilesByArea([
      denominatorFile('plans/alpha/one.md'),
      denominatorFile('plans/alpha/two.md'),
      denominatorFile('plans/root.md'),
      denominatorFile('milestones/m.md'),
    ]);
    expect(grouped.ok).toBe(true);
    if (grouped.ok) {
      expect([...grouped.value.keys()].sort(compareByCodeUnit)).toEqual([
        'milestones',
        'plans',
        'plans--alpha',
      ]);
      expect(grouped.value.get('plans--alpha')).toHaveLength(2);
    }
  });

  it('refuses two distinct directory prefixes colliding onto one area id', () => {
    const grouped = groupFilesByArea([
      denominatorFile('plans/alpha/one.md'),
      denominatorFile('plans--alpha/two.md'),
    ]);
    expect(grouped.ok).toBe(false);
    if (!grouped.ok) {
      expect(grouped.error.message).toContain('plans--alpha');
    }
  });
});

describe('parseLedgerJsonl — strict line-cited parsing', () => {
  it('parses a multi-row document, skipping blank lines', () => {
    const text = `${JSON.stringify(validRow())}\n\n${JSON.stringify({
      ...validRow(),
      block_id: 'plans/a.md:5-6',
      line_start: 5,
      line_end: 6,
    })}\n`;
    const rows = parseLedgerJsonl('ledger/plans.ledger.jsonl', text);
    expect(rows.ok).toBe(true);
    if (rows.ok) {
      expect(rows.value).toHaveLength(2);
    }
  });

  it('refuses a malformed line, citing artefact file AND line number', () => {
    const text = `not json{\n`;
    const rows = parseLedgerJsonl('ledger/plans.ledger.jsonl', text);
    expect(rows.ok).toBe(false);
    if (!rows.ok) {
      expect(rows.error.message).toContain('ledger/plans.ledger.jsonl');
      expect(rows.error.message).toContain('line 1');
    }
  });

  it('refuses a schema-invalid row, citing artefact file AND line number', () => {
    const text = `${JSON.stringify(validRow())}\n${JSON.stringify({ block_id: 'x' })}\n`;
    const rows = parseLedgerJsonl('ledger/plans.ledger.jsonl', text);
    expect(rows.ok).toBe(false);
    if (!rows.ok) {
      expect(rows.error.message).toContain('line 2');
    }
  });

  it('does NOT refuse duplicate block_ids at this layer (the tile RED owns them)', () => {
    const text = `${JSON.stringify(validRow())}\n${JSON.stringify(validRow())}\n`;
    const rows = parseLedgerJsonl('ledger/plans.ledger.jsonl', text);
    expect(rows.ok).toBe(true);
    if (rows.ok) {
      expect(rows.value).toHaveLength(2);
    }
  });

  it('parses an EMPTY document as zero rows (an empty ledger is a computed verdict, not a parse error)', () => {
    const rows = parseLedgerJsonl('ledger/plans.ledger.jsonl', '');
    expect(rows.ok).toBe(true);
    if (rows.ok) {
      expect(rows.value).toEqual([]);
    }
  });
});
