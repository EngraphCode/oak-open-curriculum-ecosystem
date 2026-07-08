import { describe, expect, it } from 'vitest';

import { compareByCodeUnit, type DenominatorFile } from './refounding-artefacts.js';
import { parseChallengeLedgerRow } from './refound-challenge-model.js';
import { buildDefaultLedgerRows } from './refound-default-ledger-model.js';
import { DEFAULT_BLOCK_DISPOSITION, parseLedgerRow } from './refound-ledger-row.js';

const SHA_A = 'a'.repeat(64);

const file = (
  path: string,
  lines: number,
  mode: DenominatorFile['inventory_mode'] = 'lines',
): DenominatorFile => ({ path, bytes: lines * 10, sha256: SHA_A, lines, inventory_mode: mode });

describe('buildDefaultLedgerRows — mechanical default blocks (judgement-free)', () => {
  it('emits preamble + anchored blocks for a lines file, reusing the landed clustering', () => {
    const rows = buildDefaultLedgerRows({
      files: [file('plans/alpha/a.md', 5)],
      anchorsByFile: new Map([['plans/alpha/a.md', [3]]]),
    });
    expect(rows.ok).toBe(true);
    if (rows.ok) {
      expect(rows.value.get('plans--alpha')).toEqual([
        {
          block_id: 'plans/alpha/a.md:1-2',
          file: 'plans/alpha/a.md',
          line_start: 1,
          line_end: 2,
          disposition: DEFAULT_BLOCK_DISPOSITION,
          home: '',
          binding: '',
        },
        {
          block_id: 'plans/alpha/a.md:3-5',
          file: 'plans/alpha/a.md',
          line_start: 3,
          line_end: 5,
          disposition: DEFAULT_BLOCK_DISPOSITION,
          home: '',
          binding: '',
        },
      ]);
    }
  });

  it('emits exactly one whole-span row for whole-file and opaque entries', () => {
    const rows = buildDefaultLedgerRows({
      files: [
        file('plans/alpha/data.tsv', 3, 'whole-file'),
        file('plans/alpha/bin.dat', 2, 'opaque'),
      ],
      anchorsByFile: new Map(),
    });
    expect(rows.ok).toBe(true);
    if (rows.ok) {
      const area = rows.value.get('plans--alpha') ?? [];
      expect(area.map((row) => [row.file, row.line_start, row.line_end])).toEqual([
        ['plans/alpha/bin.dat', 1, 2],
        ['plans/alpha/data.tsv', 1, 3],
      ]);
    }
  });

  it('emits NO row for a 0-line file (any row on it would be a tiling violation)', () => {
    const rows = buildDefaultLedgerRows({
      files: [file('plans/alpha/empty.md', 0)],
      anchorsByFile: new Map([['plans/alpha/empty.md', []]]),
    });
    expect(rows.ok).toBe(true);
    if (rows.ok) {
      expect(rows.value.get('plans--alpha')).toEqual([]);
    }
  });

  it('groups rows into per-area ledgers by the shared area rule', () => {
    const rows = buildDefaultLedgerRows({
      files: [file('plans/alpha/a.md', 2), file('plans/root.md', 2), file('milestones/m.md', 2)],
      anchorsByFile: new Map(),
    });
    expect(rows.ok).toBe(true);
    if (rows.ok) {
      expect([...rows.value.keys()].sort(compareByCodeUnit)).toEqual([
        'milestones',
        'plans',
        'plans--alpha',
      ]);
    }
  });

  it('produces rows the canonical row schema accepts…', () => {
    const rows = buildDefaultLedgerRows({
      files: [file('plans/alpha/a.md', 4)],
      anchorsByFile: new Map([['plans/alpha/a.md', [1, 3]]]),
    });
    expect(rows.ok).toBe(true);
    if (rows.ok) {
      for (const row of rows.value.get('plans--alpha') ?? []) {
        expect(parseLedgerRow(JSON.parse(JSON.stringify(row))).ok).toBe(true);
      }
    }
  });

  it('…that the CHALLENGE boundary still REFUSES (binding-less rows never enter a challenge)', () => {
    const rows = buildDefaultLedgerRows({
      files: [file('plans/alpha/a.md', 4)],
      anchorsByFile: new Map([['plans/alpha/a.md', [1, 3]]]),
    });
    expect(rows.ok).toBe(true);
    if (rows.ok) {
      const first = (rows.value.get('plans--alpha') ?? [])[0];
      expect(parseChallengeLedgerRow(JSON.parse(JSON.stringify(first))).ok).toBe(false);
    }
  });

  it('is deterministic regardless of input file order (reversed input, equal output)', () => {
    const files = [
      file('plans/alpha/a.md', 5),
      file('plans/alpha/data.tsv', 1, 'whole-file' as const),
    ];
    const anchorsByFile = new Map([['plans/alpha/a.md', [2, 4]]]);
    const forward = buildDefaultLedgerRows({ files, anchorsByFile });
    const reversed = buildDefaultLedgerRows({ files: [...files].reverse(), anchorsByFile });
    expect(reversed).toEqual(forward);
  });
});
