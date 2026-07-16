/**
 * Render the terminal META stage result into the plan's declared output shape:
 * `fix-ledger.v1.json` + a human-readable `.md` rendering.
 *
 * @remarks
 * Pure functions — the CLI driver (`render-ledger-cli.ts`) owns reading the committed
 * meta-stage checkpoint and writing the files. Flagged rows render most-severe-first
 * (the only judgment call this module makes), then held-for-review rows; the summary
 * line counts every disposition — held included — so a clean audit reads "0 row(s)"
 * explicitly and an all-held audit can never be mistaken for one. Every other field is
 * rendered verbatim.
 *
 * @packageDocumentation
 */

import type { Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import {
  ledgerRowSchema,
  type FlaggedLedgerRow,
  type HeldLedgerRow,
  type LedgerRow,
} from './ledger-rows.js';

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

function bySeverity(a: FlaggedLedgerRow, b: FlaggedLedgerRow): number {
  return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
}

function renderInstances(instances: FlaggedLedgerRow['instances']): string {
  return instances
    .map(
      (instance) =>
        `  - \`${instance.file}:${instance.line}\` "${instance.quote}" -> \`${instance.valueNorm}\``,
    )
    .join('\n');
}

function renderFlaggedRow(row: FlaggedLedgerRow): string {
  const source = row.sourceOfTruth ?? '_(none — prevention-design input)_';
  const degradedMark = row.droppedMembers.length > 0 ? ' — DEGRADED' : '';
  const instanceLines =
    row.instances.length === 0
      ? '  _(none — every member dropped at byte-verify)_'
      : renderInstances(row.instances);
  const droppedLines =
    row.droppedMembers.length === 0
      ? []
      : [
          '',
          '**Dropped at byte-verify:**',
          row.droppedMembers
            .map(
              (member) =>
                `  - \`${member.file}:${member.line}\` "${member.quote}" — ${member.reason}`,
            )
            .join('\n'),
        ];
  return [
    `### ${row.id} — ${row.severity} severity — ${row.verdict}${degradedMark}`,
    '',
    `**Fact:** \`${row.factClass}\` / \`${row.subject}\` / \`${row.predicate}\``,
    `**Proposed cure:** \`${row.proposedCure}\``,
    `**Source of truth:** ${source}`,
    '',
    '**Instances:**',
    instanceLines,
    ...droppedLines,
    '',
    `**Notes:** ${row.metaNotes}`,
  ].join('\n');
}

function renderHeldRow(row: HeldLedgerRow): string {
  return [
    `### ${row.id} — HELD FOR REVIEW — ${row.verdict}`,
    '',
    `**Fact:** \`${row.factClass}\` / \`${row.subject}\` / \`${row.predicate}\``,
    '',
    '**Instances:**',
    renderInstances(row.instances),
    '',
    `**Note:** ${row.heldNote}`,
  ].join('\n');
}

/**
 * Render the ledger as Markdown: an every-disposition summary line, then flagged rows
 * most-severe-first, then held-for-review rows.
 */
export function renderLedgerMarkdown(rows: readonly LedgerRow[]): string {
  const flagged = rows.filter((row): row is FlaggedLedgerRow => row.disposition === 'flagged');
  const held = rows.filter((row): row is HeldLedgerRow => row.disposition === 'held-for-review');
  const degradedCount = flagged.filter((row) => row.droppedMembers.length > 0).length;
  const bySeverityCount = { high: 0, med: 0, low: 0 };
  for (const row of flagged) {
    bySeverityCount[row.severity] += 1;
  }
  const header = [
    '# Restatement-audit fix ledger (v1)',
    '',
    `${rows.length} row(s) — ${flagged.length} flagged (${degradedCount} degraded), ` +
      `${held.length} held-for-review; flagged severity: ${bySeverityCount.high} high, ` +
      `${bySeverityCount.med} med, ${bySeverityCount.low} low.`,
    '',
  ].join('\n');
  const sections = [
    ...[...flagged].sort(bySeverity).map(renderFlaggedRow),
    ...held.map(renderHeldRow),
  ];
  return `${header}${sections.join('\n\n')}\n`;
}
