import { isErr, ok, type Result } from '@oaknational/result';

import { compareByCodeUnit, type DenominatorFile } from './refounding-artefacts.js';
import { buildFileBlocks } from './refound-residue-model.js';
import {
  DEFAULT_BLOCK_DISPOSITION,
  deriveBlockId,
  groupFilesByArea,
  type LedgerRow,
} from './refound-ledger-row.js';

/**
 * The default-ledger emitter's pure core: derive per-area sentinel ledgers
 * from the effective denominator plus the inventory's anchors.
 *
 * @remarks
 * Every row carries the mechanical sentinel disposition
 * {@link DEFAULT_BLOCK_DISPOSITION} — it asserts the ABSENCE of judgement:
 * the block is enumerated and covered, and no one has judged it. `home` and
 * `binding` are empty (legal at the canonical row layer); the CHALLENGE
 * boundary keeps refusing such rows, so a sentinel can never enter a
 * challenge stream pretending to be a judged row.
 *
 * Blocks come from the landed `buildFileBlocks` (F1 §9's unit definition —
 * the same clustering the residue audit proves), so the default segmentation
 * and the residue arithmetic can never drift apart. Block ids are
 * coordinate-derived ({@link deriveBlockId}); whole-file and opaque entries
 * take exactly one whole-span row; a 0-line file takes none.
 *
 * @packageDocumentation
 */

/** Derive one file's default rows from its denominator row and anchors. */
function buildFileRows(file: DenominatorFile, anchorLines: readonly number[]): LedgerRow[] {
  if (file.lines === 0) {
    return [];
  }
  if (file.inventory_mode !== 'lines') {
    return [
      {
        block_id: deriveBlockId(file.path, 1, file.lines),
        file: file.path,
        line_start: 1,
        line_end: file.lines,
        disposition: DEFAULT_BLOCK_DISPOSITION,
        home: '',
        binding: '',
      },
    ];
  }
  return buildFileBlocks({ lineCount: file.lines, anchorLines }).map((block) => ({
    block_id: deriveBlockId(file.path, block.lineStart, block.lineEnd),
    file: file.path,
    line_start: block.lineStart,
    line_end: block.lineEnd,
    disposition: DEFAULT_BLOCK_DISPOSITION,
    home: '',
    binding: '',
  }));
}

/**
 * Build every area's default ledger rows. Files are re-sorted by path
 * within each area and blocks ascend within each file, so the output is
 * deterministic for identical inputs regardless of input order — no clock,
 * no randomness.
 */
export function buildDefaultLedgerRows(input: {
  readonly files: readonly DenominatorFile[];
  readonly anchorsByFile: ReadonlyMap<string, readonly number[]>;
}): Result<ReadonlyMap<string, readonly LedgerRow[]>, Error> {
  const grouped = groupFilesByArea(input.files);
  if (isErr(grouped)) {
    return grouped;
  }
  const rowsByArea = new Map<string, readonly LedgerRow[]>();
  for (const [area, files] of grouped.value) {
    const rows: LedgerRow[] = [];
    for (const file of [...files].sort((a, b) => compareByCodeUnit(a.path, b.path))) {
      rows.push(...buildFileRows(file, input.anchorsByFile.get(file.path) ?? []));
    }
    rowsByArea.set(area, rows);
  }
  return ok(rowsByArea);
}
