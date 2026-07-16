/**
 * Render the terminal META stage result into the plan's declared output shape:
 * `fix-ledger.v1.json` + a human-readable `.md` rendering.
 *
 * @remarks
 * Pure functions — the CLI driver (`render-ledger-cli.ts`) owns reading the committed
 * meta-stage checkpoint and writing the files. `severity` ordering (high, then med, then
 * low) puts the most consequential rows first in the Markdown table, the only judgment
 * call this module makes; every other field is rendered verbatim.
 *
 * @packageDocumentation
 */

import type { Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import { ledgerRowSchema, type LedgerRow } from './schemas.js';

/**
 * The versioned envelope `fix-ledger.v1.json` carries — the closed output contract.
 * Module-private: only `FixLedger` (the type) and `parseFixLedger` (the boundary
 * function) are consumed externally.
 */
const fixLedgerSchema = z
  .strictObject({
    version: z.literal('fix-ledger.v1'),
    rowCount: z.number().int().nonnegative(),
    rows: z.array(ledgerRowSchema),
  })
  .refine((ledger) => ledger.rowCount === ledger.rows.length, {
    error:
      'fix ledger rowCount disagrees with rows.length — the envelope is internally inconsistent',
  });
export type FixLedger = z.infer<typeof fixLedgerSchema>;

export const parseFixLedger = (value: unknown): Result<FixLedger, Error> =>
  parseWithSchema({ label: 'fix ledger', schema: fixLedgerSchema, value });

/** Wrap rows in the versioned envelope and serialise as pretty JSON. */
export function renderLedgerJson(rows: readonly LedgerRow[]): string {
  const ledger: FixLedger = { version: 'fix-ledger.v1', rowCount: rows.length, rows: [...rows] };
  return `${JSON.stringify(ledger, null, 2)}\n`;
}

const SEVERITY_ORDER = { high: 0, med: 1, low: 2 } as const;

function bySeverity(a: LedgerRow, b: LedgerRow): number {
  return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
}

function renderRow(row: LedgerRow): string {
  const source = row.sourceOfTruth ?? '_(none — prevention-design input)_';
  const instanceLines = row.instances
    .map(
      (instance) =>
        `  - \`${instance.file}:${instance.line}\` "${instance.quote}" -> \`${instance.valueNorm}\``,
    )
    .join('\n');
  return [
    `### ${row.id} — ${row.severity} severity — ${row.verdict}`,
    '',
    `**Fact:** \`${row.factClass}\` / \`${row.subject}\` / \`${row.predicate}\``,
    `**Proposed cure:** \`${row.proposedCure}\``,
    `**Source of truth:** ${source}`,
    '',
    '**Instances:**',
    instanceLines,
    '',
    `**Notes:** ${row.metaNotes}`,
  ].join('\n');
}

/** Render the ledger as Markdown: a summary line, then one section per row, most severe first. */
export function renderLedgerMarkdown(rows: readonly LedgerRow[]): string {
  const sorted = [...rows].sort(bySeverity);
  const bySeverityCount = { high: 0, med: 0, low: 0 };
  for (const row of rows) {
    bySeverityCount[row.severity] += 1;
  }
  const header = [
    '# Restatement-audit fix ledger (v1)',
    '',
    `${rows.length} row(s) — ${bySeverityCount.high} high, ${bySeverityCount.med} med, ${bySeverityCount.low} low severity.`,
    '',
  ].join('\n');
  return `${header}${sorted.map(renderRow).join('\n\n')}\n`;
}
