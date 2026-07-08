import { err, ok, type Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import { parseJsonDocument } from '../refounding/refounding-artefacts.js';
import { type ClaimRow } from './plan-state-model.js';

/**
 * The DISPOSABLE audit adapter (F5): census claims-artefact records
 * (`claim-census.v1.jsonl`) in, engine claim rows out — pure (the runner
 * does IO). Rows are keyed `<file>:<line>` in FROZEN coordinates (P5) and
 * carry no declared proofs; audit-mode evidence joins by the same key.
 *
 * The boundary schema below validates exactly the fields this adapter
 * consumes and tolerates additive census evolution (loose object): the full
 * record shape has one owner — the census module — and re-encoding it here
 * strictly would create two-way drift. Compatibility with real census
 * output is proven by test against `buildCensusRecords`. r1's audit-mode
 * run feeds THIS adapter from the frozen artefact home; that run cannot
 * precede the freeze (plan todo `r1-freeze-inventory-baseline`).
 *
 * @packageDocumentation
 */

const nonEmptyString = z.string().min(1);

/** The consumed slice of one census record (v1), loose by design (above). */
const auditSourceRecordSchemaV1 = z.looseObject({
  file: nonEmptyString,
  line: z.number().int().positive(),
  statusValue: z.string().nullable(),
});

/**
 * Extract claim rows from census claims-artefact JSONL text. Records whose
 * `statusValue` is null (pure completion-keyword captures) contribute no
 * row; a malformed line is a refusal citing its line number (nothing
 * computed).
 */
export function extractAuditClaims(jsonlText: string): Result<readonly ClaimRow[], Error> {
  const rows: ClaimRow[] = [];
  const lines = jsonlText.split('\n');
  for (const [index, line] of lines.entries()) {
    if (line === '') {
      continue;
    }
    const document = parseJsonDocument(`census record line ${String(index + 1)}`, line);
    if (!document.ok) {
      return document;
    }
    const record = parseWithSchema({
      label: `census record line ${String(index + 1)}`,
      schema: auditSourceRecordSchemaV1,
      value: document.value,
    });
    if (!record.ok) {
      return record;
    }
    if (record.value.statusValue === null) {
      continue;
    }
    rows.push({
      key: `${record.value.file}:${String(record.value.line)}`,
      recordedStatus: record.value.statusValue,
      proof: null,
    });
  }
  return ok(rows);
}

/** Refuse blank input distinctly: an absent artefact is never an empty scan. */
export function extractAuditClaimsRequired(jsonlText: string): Result<readonly ClaimRow[], Error> {
  if (jsonlText.trim() === '') {
    return err(
      new Error(
        'census claims artefact is empty — an absent or blank artefact is not a valid ' +
          'audit input (distinguish "not yet censused" from "censused, zero rows"); refusing',
      ),
    );
  }
  return extractAuditClaims(jsonlText);
}
