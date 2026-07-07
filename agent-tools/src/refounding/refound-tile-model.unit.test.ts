import { describe, expect, it } from 'vitest';

import { collectAnchorsForFiles } from './refound-anchor-map.js';
import { type InventoryRecord } from './refound-inventory-model.js';
import { deriveBlockId, type LedgerRow } from './refound-ledger-row.js';
import {
  findCrossAreaDuplicateIds,
  verifyExactCover,
  type TiledFileInput,
} from './refound-tile-model.js';
import { formatTilingViolation } from './refound-tile-violations.js';

/**
 * The D8 discrimination fixtures for the exact-cover arithmetic (F1 §5 row
 * `refound-tile`, D5): deliberately gapped, deliberately overlapped, and
 * every violation kind proven to fire — a verifier that has never gone red
 * is theatre.
 */

const row = (
  file: string,
  lineStart: number,
  lineEnd: number,
  overrides: Partial<LedgerRow> = {},
): LedgerRow => ({
  block_id: deriveBlockId(file, lineStart, lineEnd),
  file,
  line_start: lineStart,
  line_end: lineEnd,
  disposition: 'default-block',
  home: '',
  binding: '',
  ...overrides,
});

const linesFile = (path: string, lines: number, anchorLines: number[]): TiledFileInput => ({
  path,
  lines,
  inventoryMode: 'lines',
  anchorLines,
});

const A = 'plans/alpha/a.md';

describe('verifyExactCover — exact cover over lines-mode files', () => {
  it('is green over an exact anchor-aligned cover with a line-1 preamble block', () => {
    // Line 1 is NOT an anchor: the [1,1] block is the file's line-1 preamble
    // block — valid by the anchor-start rule (corrected F1 D5; landed
    // buildFileBlocks emits preamble blocks).
    const violations = verifyExactCover({
      files: [linesFile(A, 5, [2, 4])],
      rows: [row(A, 1, 1), row(A, 2, 3), row(A, 4, 5)],
    });
    expect(violations).toEqual([]);
  });

  it('fires on a deliberately GAPPED ledger with exact coordinates (D8)', () => {
    const violations = verifyExactCover({
      files: [linesFile(A, 5, [2, 4])],
      rows: [row(A, 1, 1), row(A, 4, 5)],
    });
    expect(violations).toEqual([{ kind: 'gap', file: A, lineStart: 2, lineEnd: 3 }]);
  });

  it('fires on a deliberately OVERLAPPED ledger with exact coordinates (D8)', () => {
    const violations = verifyExactCover({
      files: [linesFile(A, 5, [2, 4])],
      rows: [row(A, 1, 1), row(A, 2, 4), row(A, 4, 5)],
    });
    expect(violations).toEqual([{ kind: 'overlap', file: A, lineStart: 4, lineEnd: 4 }]);
  });

  it('fires non-anchor-start on a block starting mid-block (not line 1, not an anchor)', () => {
    const violations = verifyExactCover({
      files: [linesFile(A, 5, [2, 4])],
      rows: [row(A, 1, 1), row(A, 2, 2), row(A, 3, 3), row(A, 4, 5)],
    });
    expect(violations).toEqual([
      { kind: 'non-anchor-start', file: A, lineStart: 3, blockId: deriveBlockId(A, 3, 3) },
    ]);
  });

  it('reports a totally untiled file as one whole-file gap (empty ledger = RED, never conflated with absent)', () => {
    const violations = verifyExactCover({ files: [linesFile(A, 5, [2, 4])], rows: [] });
    expect(violations).toEqual([{ kind: 'gap', file: A, lineStart: 1, lineEnd: 5 }]);
  });

  it('fires unknown-file on a row citing a file outside the verified set', () => {
    const violations = verifyExactCover({
      files: [linesFile(A, 5, [2, 4])],
      rows: [row(A, 1, 5), row('plans/beta/b.md', 1, 2)],
    });
    expect(violations).toContainEqual({
      kind: 'unknown-file',
      file: 'plans/beta/b.md',
      lineStart: 1,
      blockId: deriveBlockId('plans/beta/b.md', 1, 2),
    });
  });

  it('fires span-past-eof and excludes the row from coverage arithmetic', () => {
    const violations = verifyExactCover({
      files: [linesFile(A, 5, [2, 4])],
      rows: [row(A, 1, 1), row(A, 2, 6), row(A, 4, 5)],
    });
    expect(violations).toContainEqual({
      kind: 'span-past-eof',
      file: A,
      lineStart: 2,
      lineEnd: 6,
      blockId: deriveBlockId(A, 2, 6),
      fileLines: 5,
    });
    expect(violations).toContainEqual({ kind: 'gap', file: A, lineStart: 2, lineEnd: 3 });
  });

  it('fires inverted-span on line_end < line_start', () => {
    const violations = verifyExactCover({
      files: [linesFile(A, 5, [2, 4])],
      rows: [row(A, 1, 5), row(A, 4, 2, { block_id: 'inverted' })],
    });
    expect(violations).toContainEqual({
      kind: 'inverted-span',
      file: A,
      lineStart: 4,
      lineEnd: 2,
      blockId: 'inverted',
    });
  });

  it('fires duplicate-block-id on a repeated id', () => {
    const violations = verifyExactCover({
      files: [linesFile(A, 5, [2, 4])],
      rows: [row(A, 1, 1), row(A, 2, 3, { block_id: 'dup' }), row(A, 4, 5, { block_id: 'dup' })],
    });
    expect(violations).toContainEqual({
      kind: 'duplicate-block-id',
      file: A,
      lineStart: 4,
      blockId: 'dup',
    });
  });

  it('accepts a 1-line file covered by its single block (anchored or preamble)', () => {
    expect(verifyExactCover({ files: [linesFile(A, 1, [1])], rows: [row(A, 1, 1)] })).toEqual([]);
    expect(verifyExactCover({ files: [linesFile(A, 1, [])], rows: [row(A, 1, 1)] })).toEqual([]);
  });

  it('accepts a 0-line file with zero rows, and flags ANY row citing it', () => {
    expect(verifyExactCover({ files: [linesFile(A, 0, [])], rows: [] })).toEqual([]);
    const violations = verifyExactCover({
      files: [linesFile(A, 0, [])],
      rows: [row(A, 1, 1)],
    });
    expect(violations).toHaveLength(1);
    expect(violations[0]?.kind).toBe('span-past-eof');
  });
});

const wholeFile = (path: string, lines: number, mode: 'whole-file' | 'opaque'): TiledFileInput => ({
  path,
  lines,
  inventoryMode: mode,
  anchorLines: [],
});

const T = 'plans/alpha/data.tsv';

describe('verifyExactCover — whole-file and opaque rows (keyed off the DENOMINATOR inventory_mode)', () => {
  it('accepts exactly one whole-span row on a whole-file entry', () => {
    expect(
      verifyExactCover({ files: [wholeFile(T, 3, 'whole-file')], rows: [row(T, 1, 3)] }),
    ).toEqual([]);
  });

  it('accepts exactly one whole-span row on an opaque entry', () => {
    expect(verifyExactCover({ files: [wholeFile(T, 3, 'opaque')], rows: [row(T, 1, 3)] })).toEqual(
      [],
    );
  });

  it('fires on MULTIPLE rows covering a whole-file entry', () => {
    const violations = verifyExactCover({
      files: [wholeFile(T, 3, 'whole-file')],
      rows: [row(T, 1, 3), row(T, 1, 3, { block_id: 'second' })],
    });
    expect(violations).toContainEqual({
      kind: 'whole-file-multiple-rows',
      file: T,
      lineStart: 1,
      rowCount: 2,
    });
  });

  it('fires on a PARTIAL row covering a whole-file entry', () => {
    const violations = verifyExactCover({
      files: [wholeFile(T, 3, 'whole-file')],
      rows: [row(T, 1, 2)],
    });
    expect(violations).toEqual([
      {
        kind: 'whole-file-partial-row',
        file: T,
        lineStart: 1,
        lineEnd: 2,
        blockId: deriveBlockId(T, 1, 2),
        fileLines: 3,
      },
    ]);
  });

  it('reports an un-rowed whole-file entry as a gap', () => {
    expect(verifyExactCover({ files: [wholeFile(T, 3, 'whole-file')], rows: [] })).toEqual([
      { kind: 'gap', file: T, lineStart: 1, lineEnd: 3 },
    ]);
  });
});

describe('verifyExactCover — deterministic ordering', () => {
  it('sorts violations by (file, lineStart, kind) regardless of row order', () => {
    const files = [linesFile(A, 5, [2, 4]), linesFile('plans/alpha/b.md', 2, [])];
    const rows = [row(A, 4, 5)];
    const first = verifyExactCover({ files, rows });
    const second = verifyExactCover({ files: [...files].reverse(), rows });
    expect(first).toEqual(second);
    expect(first.map((violation) => violation.file)).toEqual([A, 'plans/alpha/b.md']);
  });
});

const record = (file: string, line: number): InventoryRecord => ({
  file,
  line,
  nets: ['A'],
  text: '# x',
  sha256: 'b'.repeat(64),
});

describe('collectAnchorsForFiles — the denominator↔inventory HALT layer', () => {
  it('groups anchors by file, sorted ascending', () => {
    const collected = collectAnchorsForFiles({
      files: [{ path: A, lines: 5 }],
      records: [record(A, 4), record(A, 2)],
    });
    expect(collected.ok).toBe(true);
    if (collected.ok) {
      expect(collected.value.get(A)).toEqual([2, 4]);
    }
  });

  it('halts on an inventory record citing a file outside the lines-mode set', () => {
    const collected = collectAnchorsForFiles({
      files: [{ path: A, lines: 5 }],
      records: [record('plans/ghost.md', 1)],
    });
    expect(collected.ok).toBe(false);
  });

  it('halts on a doubled (file, line) anchor', () => {
    const collected = collectAnchorsForFiles({
      files: [{ path: A, lines: 5 }],
      records: [record(A, 2), record(A, 2)],
    });
    expect(collected.ok).toBe(false);
  });

  it('halts on an anchor past the denominator line count (layer disagreement)', () => {
    const collected = collectAnchorsForFiles({
      files: [{ path: A, lines: 5 }],
      records: [record(A, 6)],
    });
    expect(collected.ok).toBe(false);
    if (!collected.ok) {
      expect(collected.error.message).toContain('halt');
    }
  });
});

describe('findCrossAreaDuplicateIds', () => {
  it('flags a block_id appearing in more than one area ledger', () => {
    const shared = row(A, 1, 2, { block_id: 'dup' });
    const foreign = row('plans/beta/b.md', 1, 2, { block_id: 'dup' });
    const violations = findCrossAreaDuplicateIds(
      new Map([
        ['plans--alpha', [shared]],
        ['plans--beta', [foreign]],
      ]),
    );
    expect(violations).toHaveLength(1);
    expect(violations[0]?.kind).toBe('duplicate-block-id');
  });

  it('is silent when every id is unique across areas', () => {
    const violations = findCrossAreaDuplicateIds(
      new Map([
        ['plans--alpha', [row(A, 1, 2)]],
        ['plans--beta', [row('plans/beta/b.md', 1, 2)]],
      ]),
    );
    expect(violations).toEqual([]);
  });
});

describe('formatTilingViolation', () => {
  it('renders every violation kind as one operator-readable line', () => {
    expect(formatTilingViolation({ kind: 'gap', file: A, lineStart: 2, lineEnd: 3 })).toContain(
      'gap',
    );
    expect(formatTilingViolation({ kind: 'overlap', file: A, lineStart: 4, lineEnd: 4 })).toContain(
      'overlap',
    );
    expect(
      formatTilingViolation({ kind: 'non-anchor-start', file: A, lineStart: 3, blockId: 'x' }),
    ).toContain('anchor');
    expect(
      formatTilingViolation({ kind: 'unknown-file', file: 'ghost.md', lineStart: 1, blockId: 'x' }),
    ).toContain('ghost.md');
    expect(
      formatTilingViolation({
        kind: 'span-past-eof',
        file: A,
        lineStart: 2,
        lineEnd: 9,
        blockId: 'x',
        fileLines: 5,
      }),
    ).toContain('EOF');
    expect(
      formatTilingViolation({
        kind: 'inverted-span',
        file: A,
        lineStart: 4,
        lineEnd: 2,
        blockId: 'x',
      }),
    ).toContain('inverted');
    expect(
      formatTilingViolation({
        kind: 'whole-file-partial-row',
        file: T,
        lineStart: 1,
        lineEnd: 2,
        blockId: 'x',
        fileLines: 3,
      }),
    ).toContain('whole-file');
    expect(
      formatTilingViolation({
        kind: 'whole-file-multiple-rows',
        file: T,
        lineStart: 1,
        rowCount: 2,
      }),
    ).toContain('exactly one');
    expect(
      formatTilingViolation({ kind: 'duplicate-block-id', file: A, lineStart: 4, blockId: 'dup' }),
    ).toContain('dup');
  });
});
