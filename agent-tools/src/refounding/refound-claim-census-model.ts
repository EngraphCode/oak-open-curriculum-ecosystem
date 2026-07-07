import { type Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import {
  compareByCodeUnit,
  sha256Hex,
  sha256HexSchema,
  splitLineBytes,
} from './refounding-artefacts.js';
import { listScannableLines, matchKeywordsInsensitive } from './refound-inventory-nets.js';

/**
 * Extraction logic of `refound-claim-census` (plan todo R0a cycle 3):
 * extract every status-field line and completion-keyword line from frozen
 * file bytes, VERBATIM with frozen `file:line` locators and per-line
 * digests. The counted-summary report and the injected status-mapping seam
 * live in `refound-claim-census-report.ts`; IO in
 * `refound-claim-census-helpers.ts`.
 *
 * @remarks
 * {@link COMPLETION_KEYWORDS_V1} is placed judgement (C2): authored once
 * from the measured corpus vocabulary, versioned in-script like
 * `NET_C_KEYWORDS_V1`, carried into the G1 packet (§2a), and changed only
 * by amendment + re-ratification + discrimination-proof re-run. Matching is
 * case-insensitive SUBSTRING matching (over-capture is conservation-safe;
 * adjudication filters), so a misspelt completion claim lands in no capture
 * — the C2 planted-defect proof pins both directions.
 *
 * @packageDocumentation
 */

/** Census records artefact basename under the artefact home. */
export const CLAIM_CENSUS_BASENAME = 'claim-census.v1.jsonl';

/**
 * The completion-keyword list, v1 — placed judgement (C2), ordered by
 * measured frequency in the live plans estate (2026-07-07 grep census:
 * `completed` 1092 … `shipped` 86). Case-insensitive MATCH, verbatim
 * CAPTURE; ratified with the G1 packet §2a.
 */
export const COMPLETION_KEYWORDS_V1 = [
  'completed',
  'complete',
  'landed',
  'closed',
  'resolved',
  'archived',
  'superseded',
  'done',
  'merged',
  'retired',
  'implemented',
  'executed',
  'shipped',
] as const;

/** A status-field line: optional indent, `status`, optional space, colon. */
const STATUS_LINE_PATTERN = /^\s*status\s*:/i;

const nonEmptyString = z.string().min(1);

/**
 * One `claim-census.v1.jsonl` record: a captured line with verbatim bytes,
 * its raw-byte SHA-256, the completion keywords that matched (list order,
 * possibly empty on a pure status line), and the verbatim after-colon status
 * value (`null` when the line is not a status line). `file` is
 * frozen-tree-relative POSIX — the frozen coordinate (P5: no locator rot).
 */
const censusRecordSchema = z.strictObject({
  file: nonEmptyString,
  line: z.number().int().positive(),
  markers: z.array(z.enum(COMPLETION_KEYWORDS_V1)),
  statusValue: z.string().nullable(),
  text: z.string(),
  sha256: sha256HexSchema,
});
export type CensusRecord = z.infer<typeof censusRecordSchema>;

/** Parse an unknown value as a {@link CensusRecord} at the read boundary. */
export const parseCensusRecord = (value: unknown): Result<CensusRecord, Error> =>
  parseWithSchema({ label: 'census record', schema: censusRecordSchema, value });

/** The verbatim after-colon text of a status line, or null when not one. */
function statusValueOf(text: string): string | null {
  if (!STATUS_LINE_PATTERN.test(text)) {
    return null;
  }
  return text.slice(text.indexOf(':') + 1);
}

/**
 * Build one frozen file's census records from its raw bytes: LF-split,
 * UTF-8-decoded for matching, captured verbatim with the SHA-256 of the RAW
 * line bytes. The shared fence blackout applies (fenced content captures
 * nothing; fence delimiters are structure, never keyword-scannable content;
 * frontmatter lines ARE scannable — `status:` fields live there).
 *
 * @param file - Frozen-tree-relative POSIX path (the artefact coordinate).
 * @param bytes - The frozen file's raw bytes.
 */
export function buildCensusRecords(file: string, bytes: Uint8Array): readonly CensusRecord[] {
  const lineBytes = splitLineBytes(bytes);
  const lineTexts = lineBytes.map((raw) => Buffer.from(raw).toString('utf8'));
  const records: CensusRecord[] = [];
  for (const scannable of listScannableLines(lineTexts)) {
    if (scannable.isFenceDelimiter) {
      continue;
    }
    const markers = matchKeywordsInsensitive(scannable.text, COMPLETION_KEYWORDS_V1);
    const statusValue = statusValueOf(scannable.text);
    if (markers.length === 0 && statusValue === null) {
      continue;
    }
    records.push({
      file,
      line: scannable.line,
      markers: [...markers],
      statusValue,
      text: scannable.text,
      sha256: sha256Hex(lineBytes[scannable.line - 1]),
    });
  }
  return records;
}

/** Sort records by (file, line) — the determinism contract's record order. */
export function sortCensusRecords(records: readonly CensusRecord[]): readonly CensusRecord[] {
  return [...records].sort((a, b) => compareByCodeUnit(a.file, b.file) || a.line - b.line);
}
