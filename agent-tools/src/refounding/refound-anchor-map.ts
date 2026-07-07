import { err, ok, type Result } from '@oaknational/result';

import { type InventoryRecord } from './refound-inventory-model.js';

/**
 * The denominator↔inventory anchor cross-check shared by `refound-tile` and
 * the default-ledger emitter (F1 §6: a disagreement between the hashing
 * layer and the line-counting layer is a HALT condition — an encoding or
 * EOL surprise to be understood, never absorbed).
 *
 * @packageDocumentation
 */

/**
 * Group inventory anchors by file against DENOMINATOR coordinates. Every
 * disagreement is a HALT (`Err`, nothing computed): a record citing a file
 * outside the lines-mode set, a doubled `(file, line)` anchor, or an anchor
 * past the recorded line count. Every lines-mode file appears in the result
 * (possibly with zero anchors), sorted ascending.
 */
export function collectAnchorsForFiles(input: {
  readonly files: readonly { readonly path: string; readonly lines: number }[];
  readonly records: readonly InventoryRecord[];
}): Result<ReadonlyMap<string, readonly number[]>, Error> {
  const linesByPath = new Map(input.files.map((file) => [file.path, file.lines]));
  const anchorsByFile = new Map<string, number[]>(input.files.map((file) => [file.path, []]));
  for (const record of input.records) {
    const lines = linesByPath.get(record.file);
    const anchors = anchorsByFile.get(record.file);
    if (lines === undefined || anchors === undefined) {
      return err(
        new Error(
          `layer-disagreement halt: inventory record cites '${record.file}', which the ` +
            "denominator's lines-mode file set does not contain",
        ),
      );
    }
    if (anchors.includes(record.line)) {
      return err(
        new Error(
          `layer-disagreement halt: doubled inventory anchor '${record.file}' line ` +
            `${String(record.line)}`,
        ),
      );
    }
    if (record.line > lines) {
      return err(
        new Error(
          `layer-disagreement halt: inventory cites line ${String(record.line)} of ` +
            `'${record.file}', past its denominator line count ${String(lines)} — an encoding ` +
            'or EOL surprise to be understood, never absorbed (F1 §6)',
        ),
      );
    }
    anchors.push(record.line);
  }
  for (const anchors of anchorsByFile.values()) {
    anchors.sort((a, b) => a - b);
  }
  return ok(anchorsByFile);
}
