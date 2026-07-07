import { compareByCodeUnit, type InventoryMode } from './refounding-artefacts.js';
import { type LedgerRow } from './refound-ledger-row.js';
import { sortTilingViolations, type TilingViolation } from './refound-tile-violations.js';

/**
 * The exact-cover arithmetic of `refound-tile` (F1 §5 row `refound-tile`,
 * D5): pure interval maths over `{files, rows}` — no IO, no clock. The
 * verifier is granularity-agnostic: block boundaries are survey-layer
 * output; this module only proves zero gaps, zero overlaps, anchor-aligned
 * starts, and the whole-file row discipline.
 *
 * @remarks
 * **Anchor-start rule (BINDING, corrects F1 D5's unconditional wording).**
 * A block start is valid iff it lands on an anchor line OR it is the file's
 * line-1 preamble block: the landed `buildFileBlocks` (F1 §9) emits
 * `file-preamble` blocks for lines before the first anchor, so an
 * unconditional anchor-start rule would make every preamble-led file — and
 * therefore S2 — permanently red.
 *
 * **Whole-file rule.** Keyed off the DENOMINATOR's `inventory_mode`, never
 * off row dispositions: `whole-file` AND `opaque` files take exactly one
 * whole-span row. A 0-line file (any mode) takes ZERO rows — any row citing
 * it is a violation.
 *
 * **Refusal vs RED.** Malformed INPUTS refuse upstream (the helpers and
 * `refound-anchor-map.ts`'s layer cross-check); everything here is a
 * computed RED verdict: typed {@link TilingViolation} values, sorted by
 * `(file, lineStart, kind)`.
 *
 * @packageDocumentation
 */

/** One verified file: denominator coordinates plus its inventory anchors. */
export interface TiledFileInput {
  readonly path: string;
  readonly lines: number;
  readonly inventoryMode: InventoryMode;
  readonly anchorLines: readonly number[];
}

/** Shape-check one row; a shape violation excludes it from coverage. */
function rowShapeViolation(
  row: LedgerRow,
  file: TiledFileInput | undefined,
): TilingViolation | undefined {
  if (file === undefined) {
    return {
      kind: 'unknown-file',
      file: row.file,
      lineStart: row.line_start,
      blockId: row.block_id,
    };
  }
  if (row.line_end < row.line_start) {
    return {
      kind: 'inverted-span',
      file: row.file,
      lineStart: row.line_start,
      lineEnd: row.line_end,
      blockId: row.block_id,
    };
  }
  if (row.line_end > file.lines) {
    return {
      kind: 'span-past-eof',
      file: row.file,
      lineStart: row.line_start,
      lineEnd: row.line_end,
      blockId: row.block_id,
      fileLines: file.lines,
    };
  }
  return undefined;
}

/** Duplicate block ids across the verified row set. */
function duplicateIdViolations(rows: readonly LedgerRow[]): TilingViolation[] {
  const seen = new Set<string>();
  const violations: TilingViolation[] = [];
  for (const row of rows) {
    if (seen.has(row.block_id)) {
      violations.push({
        kind: 'duplicate-block-id',
        file: row.file,
        lineStart: row.line_start,
        blockId: row.block_id,
      });
    }
    seen.add(row.block_id);
  }
  return violations;
}

/** Contiguous 1-based runs of `counts` indices satisfying `matches`. */
function coverageRuns(
  counts: readonly number[],
  matches: (count: number) => boolean,
): readonly { start: number; end: number }[] {
  const runs: { start: number; end: number }[] = [];
  let runStart = -1;
  for (let index = 0; index <= counts.length; index += 1) {
    const inRun = index < counts.length && matches(counts[index] ?? 0);
    if (inRun && runStart === -1) {
      runStart = index + 1;
    } else if (!inRun && runStart !== -1) {
      runs.push({ start: runStart, end: index });
      runStart = -1;
    }
  }
  return runs;
}

/** Gap/overlap/anchor-start findings for one lines-mode file. */
function linesModeViolations(file: TiledFileInput, rows: readonly LedgerRow[]): TilingViolation[] {
  const violations: TilingViolation[] = [];
  const anchors = new Set(file.anchorLines);
  const counts = new Array<number>(file.lines).fill(0);
  for (const row of rows) {
    if (row.line_start !== 1 && !anchors.has(row.line_start)) {
      violations.push({
        kind: 'non-anchor-start',
        file: file.path,
        lineStart: row.line_start,
        blockId: row.block_id,
      });
    }
    for (let line = row.line_start; line <= row.line_end; line += 1) {
      counts[line - 1] = (counts[line - 1] ?? 0) + 1;
    }
  }
  for (const run of coverageRuns(counts, (count) => count === 0)) {
    violations.push({ kind: 'gap', file: file.path, lineStart: run.start, lineEnd: run.end });
  }
  for (const run of coverageRuns(counts, (count) => count > 1)) {
    violations.push({ kind: 'overlap', file: file.path, lineStart: run.start, lineEnd: run.end });
  }
  return violations;
}

/** Whole-file/opaque findings: exactly one whole-span row (F1 D5). */
function wholeFileViolations(file: TiledFileInput, rows: readonly LedgerRow[]): TilingViolation[] {
  if (rows.length === 0) {
    return file.lines > 0
      ? [{ kind: 'gap', file: file.path, lineStart: 1, lineEnd: file.lines }]
      : [];
  }
  const violations: TilingViolation[] = [];
  for (const row of rows) {
    if (row.line_start !== 1 || row.line_end !== file.lines) {
      violations.push({
        kind: 'whole-file-partial-row',
        file: file.path,
        lineStart: row.line_start,
        lineEnd: row.line_end,
        blockId: row.block_id,
        fileLines: file.lines,
      });
    }
  }
  if (rows.length > 1) {
    violations.push({
      kind: 'whole-file-multiple-rows',
      file: file.path,
      lineStart: 1,
      rowCount: rows.length,
    });
  }
  return violations;
}

/**
 * Verify the exact cover of `rows` over `files`: every line of every
 * lines-mode file covered exactly once by anchor-aligned (or line-1
 * preamble) blocks; whole-file and opaque files by exactly one whole-span
 * row; no duplicate block ids; every row citing a known file with a
 * well-formed span. Returns EVERY violation, sorted — the caller owns
 * verdict rendering and truncation.
 */
export function verifyExactCover(input: {
  readonly files: readonly TiledFileInput[];
  readonly rows: readonly LedgerRow[];
}): readonly TilingViolation[] {
  const fileByPath = new Map(input.files.map((file) => [file.path, file]));
  const violations: TilingViolation[] = [...duplicateIdViolations(input.rows)];
  const validRowsByPath = new Map<string, LedgerRow[]>(input.files.map((file) => [file.path, []]));
  for (const row of input.rows) {
    const shapeViolation = rowShapeViolation(row, fileByPath.get(row.file));
    if (shapeViolation !== undefined) {
      violations.push(shapeViolation);
      continue;
    }
    validRowsByPath.get(row.file)?.push(row);
  }
  for (const file of input.files) {
    const rows = validRowsByPath.get(file.path) ?? [];
    violations.push(
      ...(file.inventoryMode === 'lines'
        ? linesModeViolations(file, rows)
        : wholeFileViolations(file, rows)),
    );
  }
  return sortTilingViolations(violations);
}

/**
 * Duplicate block ids ACROSS area ledgers (within-area duplicates are
 * {@link verifyExactCover}'s finding). Areas are visited in sorted order;
 * the violation lands at the later occurrence's coordinates.
 */
export function findCrossAreaDuplicateIds(
  rowsByArea: ReadonlyMap<string, readonly LedgerRow[]>,
): readonly TilingViolation[] {
  const firstAreaById = new Map<string, string>();
  const violations: TilingViolation[] = [];
  for (const area of [...rowsByArea.keys()].sort(compareByCodeUnit)) {
    for (const row of rowsByArea.get(area) ?? []) {
      const firstArea = firstAreaById.get(row.block_id);
      if (firstArea === undefined) {
        firstAreaById.set(row.block_id, area);
      } else if (firstArea !== area) {
        violations.push({
          kind: 'duplicate-block-id',
          file: row.file,
          lineStart: row.line_start,
          blockId: row.block_id,
        });
      }
    }
  }
  return sortTilingViolations(violations);
}
