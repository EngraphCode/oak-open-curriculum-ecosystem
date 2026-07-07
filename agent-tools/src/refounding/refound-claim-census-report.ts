import { err, ok, type Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import { compareByCodeUnit } from './refounding-artefacts.js';
import {
  CLAIM_CENSUS_BASENAME,
  COMPLETION_KEYWORDS_V1,
  type CensusRecord,
} from './refound-claim-census-model.js';

/**
 * The census's counted-summary side (R0a cycle 3): the injected
 * status-mapping table (the C1 seam), trim-exact mapping application with
 * `UNMAPPED` as a named counted residue class, the over-20-percent UNMAPPED
 * halt (the `checkAnchorRatioBand` H-condition shape, integer arithmetic),
 * and the `claim-census.v1.report.json` document. Extraction lives in
 * `refound-claim-census-model.ts`; IO in `refound-claim-census-helpers.ts`.
 *
 * @packageDocumentation
 */

/** Census counted-summary report basename under the artefact home. */
export const CLAIM_CENSUS_REPORT_BASENAME = 'claim-census.v1.report.json';

const nonEmptyString = z.string().min(1);
const nonNegativeInt = z.number().int().nonnegative();

/**
 * The injected status-mapping table document (C1): versioned, closed, values
 * pre-trimmed (a value the trim-exact application could never match is an
 * authoring defect surfaced at the parse boundary), duplicates refused.
 */
const statusMappingEntrySchema = z.strictObject({
  value: nonEmptyString.refine((value) => value === value.trim(), {
    message: 'mapping values must be pre-trimmed (application is exact-match-after-trim)',
  }),
  verdict: nonEmptyString.refine((verdict) => verdict !== 'UNMAPPED', {
    message: "'UNMAPPED' is the reserved residue-class name, never an authored verdict",
  }),
});
const statusMappingTableSchema = z.strictObject({
  version: z.number().int().positive(),
  entries: z.array(statusMappingEntrySchema).min(1),
});
export type StatusMappingTable = z.infer<typeof statusMappingTableSchema>;

/** Parse an unknown value as a {@link StatusMappingTable}; refuse collisions. */
export function parseStatusMappingTable(value: unknown): Result<StatusMappingTable, Error> {
  const parsed = parseWithSchema({
    label: 'status-mapping table',
    schema: statusMappingTableSchema,
    value,
  });
  if (!parsed.ok) {
    return parsed;
  }
  const seen = new Set<string>();
  for (const entry of parsed.value.entries) {
    if (seen.has(entry.value)) {
      return err(
        new Error(
          `status-mapping table carries duplicate value '${entry.value}' — a collision the ` +
            'trim-exact application cannot disambiguate; refusing',
        ),
      );
    }
    seen.add(entry.value);
  }
  return parsed;
}

const verdictCountSchema = z.strictObject({ verdict: nonEmptyString, count: nonNegativeInt });
const keywordCountSchema = z.strictObject({
  keyword: z.enum(COMPLETION_KEYWORDS_V1),
  lines: nonNegativeInt,
});
const mappingSummarySchema = z.strictObject({
  tableVersion: z.number().int().positive(),
  verdicts: z.array(verdictCountSchema),
  unmapped: z.strictObject({
    count: nonNegativeInt,
    distinctValues: z.array(z.string()),
  }),
});

/**
 * The `claim-census.v1.report.json` document: extraction totals, per-keyword
 * line counts (every v1 keyword, list order, zero-counts included — closed
 * and byte-stable), and the mapping summary (`null` when no table was
 * injected; the records artefact is complete without it).
 */
const censusReportSchema = z.strictObject({
  version: z.literal(1),
  completionKeywordsVersion: z.literal(1),
  totals: z.strictObject({
    files: nonNegativeInt,
    lines: nonNegativeInt,
    records: nonNegativeInt,
    statusLines: nonNegativeInt,
    keywordLines: nonNegativeInt,
  }),
  keywordCounts: z.array(keywordCountSchema),
  mapping: mappingSummarySchema.nullable(),
});
export type CensusReport = z.infer<typeof censusReportSchema>;

/** Parse an unknown value as a {@link CensusReport} at the read boundary. */
export const parseCensusReport = (value: unknown): Result<CensusReport, Error> =>
  parseWithSchema({ label: 'census report', schema: censusReportSchema, value });

/** What the census extracted, for the entry's operator summary. */
export interface ClaimCensusSummary {
  readonly files: number;
  readonly records: number;
  readonly statusLines: number;
  readonly keywordLines: number;
  readonly mapping: { readonly verdicts: number; readonly unmapped: number } | null;
}

/** The entry's decided verdict: the exit code and the exact operator lines. */
export interface CensusVerdict {
  readonly exitCode: number;
  readonly lines: readonly string[];
}

/**
 * Decide the census verdict — pure, so the exit-code contract is
 * unit-testable without capturing stdout: a completed census is exit 0 (the
 * census reports, it does not judge); refusals never reach here. Lines are
 * unprefixed; the entry adds the tool prefix when printing (the batch-status
 * idiom).
 */
export function decideCensusVerdict(summary: ClaimCensusSummary): CensusVerdict {
  const mapping =
    summary.mapping === null
      ? 'no mapping table injected'
      : `${String(summary.mapping.verdicts)} distinct verdict(s), ` +
        `${String(summary.mapping.unmapped)} UNMAPPED line(s)`;
  return {
    exitCode: 0,
    lines: [
      `censused ${String(summary.records)} record(s) ` +
        `(${String(summary.statusLines)} status line(s), ` +
        `${String(summary.keywordLines)} completion-keyword line(s)) across ` +
        `${String(summary.files)} frozen file(s); ${mapping}; artefacts at ` +
        `${CLAIM_CENSUS_BASENAME} and ${CLAIM_CENSUS_REPORT_BASENAME}.`,
    ],
  };
}

/** The UNMAPPED halt band: strictly more than 20% of status lines (H shape). */
const UNMAPPED_HALT_PERCENT = 20;

/**
 * Apply the trim-exact mapping; UNMAPPED is counted, over-band is a halt.
 * Zero status lines with a table injected is a deliberate non-halt (the
 * summary is empty): the census reports, it does not judge — this drops the
 * copied H-shape's zero-denominator halt arm on purpose.
 */
function buildMappingSummary(
  statusRecords: readonly CensusRecord[],
  table: StatusMappingTable,
): Result<z.infer<typeof mappingSummarySchema>, Error> {
  const verdictByValue = new Map(table.entries.map((entry) => [entry.value, entry.verdict]));
  const verdictCounts = new Map<string, number>();
  const unmappedValues = new Set<string>();
  let unmappedCount = 0;
  for (const record of statusRecords) {
    const trimmed = (record.statusValue ?? '').trim();
    const verdict = verdictByValue.get(trimmed);
    if (verdict === undefined) {
      unmappedCount += 1;
      unmappedValues.add(trimmed);
      continue;
    }
    verdictCounts.set(verdict, (verdictCounts.get(verdict) ?? 0) + 1);
  }
  const statusLines = statusRecords.length;
  if (unmappedCount * 100 > statusLines * UNMAPPED_HALT_PERCENT) {
    return err(
      new Error(
        `census halt-and-inspect: ${String(unmappedCount)} of ${String(statusLines)} status ` +
          `line(s) are UNMAPPED — over the ${String(UNMAPPED_HALT_PERCENT)}% band, a ` +
          'mapping-table mis-fit signal; inspect the table, never push through (nothing written)',
      ),
    );
  }
  return ok({
    tableVersion: table.version,
    verdicts: [...verdictCounts.entries()]
      .map(([verdict, count]) => ({ verdict, count }))
      .sort((a, b) => compareByCodeUnit(a.verdict, b.verdict)),
    unmapped: {
      count: unmappedCount,
      distinctValues: [...unmappedValues].sort(compareByCodeUnit),
    },
  });
}

/**
 * Build the census report from the (sorted) records — pure, byte-stable, and
 * refusal-first: a mapping halt returns `Err` and the caller writes nothing.
 */
export function buildCensusReport(input: {
  readonly records: readonly CensusRecord[];
  readonly totalFiles: number;
  readonly totalLines: number;
  readonly table: StatusMappingTable | null;
}): Result<CensusReport, Error> {
  const statusRecords = input.records.filter((record) => record.statusValue !== null);
  const keywordRecords = input.records.filter((record) => record.markers.length > 0);
  let mapping: CensusReport['mapping'] = null;
  if (input.table !== null) {
    const summary = buildMappingSummary(statusRecords, input.table);
    if (!summary.ok) {
      return summary;
    }
    mapping = summary.value;
  }
  return ok({
    version: 1,
    completionKeywordsVersion: 1,
    totals: {
      files: input.totalFiles,
      lines: input.totalLines,
      records: input.records.length,
      statusLines: statusRecords.length,
      keywordLines: keywordRecords.length,
    },
    keywordCounts: COMPLETION_KEYWORDS_V1.map((keyword) => ({
      keyword,
      lines: keywordRecords.filter((record) => record.markers.includes(keyword)).length,
    })),
    mapping,
  });
}
