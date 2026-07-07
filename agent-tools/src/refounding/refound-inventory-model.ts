import { err, ok, type Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import { compareByCodeUnit, sha1Hex, splitLineBytes } from './refounding-artefacts.js';
import { scanFileLines, type NetId } from './refound-inventory-nets.js';

/**
 * The inventory's artefact shapes (F1 §3) and run-level arithmetic: the
 * `inventory.v1.jsonl` record, the `net-diff.v1.report.json` document, and
 * the H2 anchor-ratio sanity band. The net-scanning core lives in
 * `refound-inventory-nets.ts`; the IO orchestration in
 * `refound-inventory-runner.ts`.
 *
 * @packageDocumentation
 */

/** Inventory artefact basename under the artefact home (F1 §3). */
export const INVENTORY_BASENAME = 'inventory.v1.jsonl';

/** Net-diff report basename under the artefact home (F1 §3). */
export const NET_DIFF_BASENAME = 'net-diff.v1.report.json';

/**
 * The whole-corpus anchor-ratio sanity band, v1 (F1 §4, G1 packet §3): a
 * measured ratio outside this band is an automatic halt-and-inspect, never
 * an error to push through.
 */
export const ANCHOR_RATIO_SANITY_BAND_V1 = { minPercent: 20, maxPercent: 70 } as const;

const nonEmptyString = z.string().min(1);
const nonNegativeInt = z.number().int().nonnegative();
const sha1HexSchema = z.string().regex(/^[0-9a-f]{40}$/);
const netIdSchema = z.enum(['A', 'B', 'C']);

/**
 * One `inventory.v1.jsonl` record (F1 §3): a captured line with verbatim
 * bytes and its raw-byte SHA-1. `text` may be empty (a blank frontmatter
 * line is a legal Net-A capture).
 */
const inventoryRecordSchema = z.strictObject({
  file: nonEmptyString,
  line: z.number().int().positive(),
  nets: z.array(netIdSchema).min(1),
  text: z.string(),
  sha1: sha1HexSchema,
});
export type InventoryRecord = z.infer<typeof inventoryRecordSchema>;

/** Parse an unknown value as an {@link InventoryRecord} at the read boundary. */
export const parseInventoryRecord = (value: unknown): Result<InventoryRecord, Error> =>
  parseWithSchema({ label: 'inventory record', schema: inventoryRecordSchema, value });

/**
 * Build one file's inventory records from its raw frozen bytes: LF-split,
 * UTF-8-decoded for net matching, captured verbatim with the SHA-1 of the
 * RAW line bytes (so any decoding surprise stays detectable).
 *
 * @param file - Frozen-tree-relative POSIX path (the artefact coordinate).
 * @param bytes - The frozen file's raw bytes.
 */
export function buildInventoryRecords(file: string, bytes: Uint8Array): readonly InventoryRecord[] {
  const lineBytes = splitLineBytes(bytes);
  const lineTexts = lineBytes.map((raw) => Buffer.from(raw).toString('utf8'));
  return scanFileLines(lineTexts).map((capture) => ({
    file,
    line: capture.line,
    nets: [...capture.nets],
    text: lineTexts[capture.line - 1] ?? '',
    sha1: sha1Hex(lineBytes[capture.line - 1] ?? new Uint8Array()),
  }));
}

/** Ratio as a percent, rounded to two decimal places (report display only). */
export function percentRounded(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }
  return Math.round((numerator * 10000) / denominator) / 100;
}

/** Sort records by (file, line) — the determinism contract's record order. */
export function sortInventoryRecords(
  records: readonly InventoryRecord[],
): readonly InventoryRecord[] {
  return [...records].sort((a, b) => compareByCodeUnit(a.file, b.file) || a.line - b.line);
}

const netDiffCountsSchema = z.strictObject({
  captured: nonNegativeInt,
  unique: nonNegativeInt,
});

/**
 * The `net-diff.v1.report.json` document (F1 §3): per-net capture counts
 * plus the full single-net (unique) capture lists — the mechanised "blind
 * overlapping nets" omission-detector feed. A capture is unique to a net
 * when NO other net saw the line; a large unique set is a single-net blind
 * spot surfaced.
 */
const netDiffReportSchema = z.strictObject({
  version: z.literal(1),
  netCKeywordsVersion: z.literal(1),
  totals: z.strictObject({
    files: nonNegativeInt,
    lines: nonNegativeInt,
    anchors: nonNegativeInt,
    anchorRatioPercent: z.number().nonnegative(),
  }),
  perNet: z.strictObject({
    A: netDiffCountsSchema,
    B: netDiffCountsSchema,
    C: netDiffCountsSchema,
  }),
  uniqueCaptures: z.strictObject({
    A: z.array(inventoryRecordSchema),
    B: z.array(inventoryRecordSchema),
    C: z.array(inventoryRecordSchema),
  }),
});
export type NetDiffReport = z.infer<typeof netDiffReportSchema>;

/** Parse an unknown value as a {@link NetDiffReport} at the read boundary. */
export const parseNetDiffReport = (value: unknown): Result<NetDiffReport, Error> =>
  parseWithSchema({ label: 'net-diff report', schema: netDiffReportSchema, value });

/** Build the net-diff report from the (whole-corpus) inventory records. */
export function buildNetDiffReport(input: {
  readonly records: readonly InventoryRecord[];
  readonly totalFiles: number;
  readonly totalLines: number;
}): NetDiffReport {
  const captured: Record<NetId, number> = { A: 0, B: 0, C: 0 };
  const unique: Record<NetId, InventoryRecord[]> = { A: [], B: [], C: [] };
  for (const record of sortInventoryRecords(input.records)) {
    for (const net of record.nets) {
      captured[net] += 1;
    }
    const soleNet = record.nets.length === 1 ? record.nets[0] : undefined;
    if (soleNet !== undefined) {
      unique[soleNet].push(record);
    }
  }
  return {
    version: 1,
    netCKeywordsVersion: 1,
    totals: {
      files: input.totalFiles,
      lines: input.totalLines,
      anchors: input.records.length,
      anchorRatioPercent: percentRounded(input.records.length, input.totalLines),
    },
    perNet: {
      A: { captured: captured.A, unique: unique.A.length },
      B: { captured: captured.B, unique: unique.B.length },
      C: { captured: captured.C, unique: unique.C.length },
    },
    uniqueCaptures: { A: unique.A, B: unique.B, C: unique.C },
  };
}

/**
 * The run-level anchor-ratio sanity check (F1 §4, G1 packet §3): a
 * whole-corpus ratio outside {@link ANCHOR_RATIO_SANITY_BAND_V1} — or a
 * corpus with no line-inventoried lines at all — is the named
 * halt-and-inspect condition H2. The comparison is integer arithmetic
 * (`anchors * 100` against `lines * bound`), so no float edge can nudge a
 * verdict.
 */
export function checkAnchorRatioBand(input: {
  readonly anchorLines: number;
  readonly totalLines: number;
}): Result<void, Error> {
  const { minPercent, maxPercent } = ANCHOR_RATIO_SANITY_BAND_V1;
  const scaled = input.anchorLines * 100;
  if (
    input.totalLines === 0 ||
    scaled < input.totalLines * minPercent ||
    scaled > input.totalLines * maxPercent
  ) {
    const measured =
      input.totalLines === 0
        ? 'undefined (0 inventoriable lines)'
        : `${String(percentRounded(input.anchorLines, input.totalLines))}%`;
    return err(
      new Error(
        `H2 halt-and-inspect: whole-corpus anchor ratio ${measured} is outside the sanity band ` +
          `${String(minPercent)}%-${String(maxPercent)}% — net mis-fit signal (F1 §4); ` +
          'inspect the nets, never push through',
      ),
    );
  }
  return ok(undefined);
}
