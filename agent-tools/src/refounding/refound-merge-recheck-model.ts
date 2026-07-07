import { type Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import {
  compareByCodeUnit,
  sha256HexSchema,
  type DenominatorFile,
} from './refounding-artefacts.js';

/**
 * The merge-recheck's data model (F1 D4, §5 row `refound-merge-recheck`,
 * §7): pure classification of live-tree deltas against the effective frozen
 * denominator, and the `arrivals.v1.report.json` shape. The
 * filesystem-facing orchestration lives in
 * `refound-merge-recheck-helpers.ts`.
 *
 * @remarks
 * **Coordinate space.** Comparison happens in FROZEN coordinates: every live
 * source path is forward-mapped through the freeze's own `frozenRelPath`
 * mapping and matched against denominator rows by frozen path. The
 * frozen→source inverse is never computed — deletions are therefore reported
 * in frozen coordinates only.
 *
 * **Strict byte identity.** A file classifies `modified` iff its live sha256
 * differs from the frozen sha256 — ANY difference. Banner-awareness is
 * sanctioned-diff classification with an EMPTY content-diff class set, i.e.
 * exactly this strict identity: no banner flag, no exemption parameter
 * (banners cannot exist before the R2 F4 banner policy; a content-scoped
 * banner diff class lands as a versioned schema change WITH that policy).
 *
 * **Delta classes.**
 *
 * - `added` / `modified` — unsanctioned arrivals: the RED classes; each
 *   halts the affected batch until routed via the G3 table (F1 §7).
 * - `sanctioned` — a live write whose SOURCE path matches a v2 rule's
 *   sanctioned-writer class (P2): protocol-authored, reported separately,
 *   never silent, never auto-frozen, never RED.
 * - `deleted` — REPORT-ONLY (F1 §7): a deleted original is never an
 *   amendment problem (the frozen copy holds the bytes); recorded for F3
 *   visibility, never RED. Deletions are never `sanctioned`: sanctioned
 *   WRITER classes sanction writes, and a deletion is not a write.
 *
 * @packageDocumentation
 */

/** Arrivals report basename under the artefact home (versioned per the landed convention). */
export const ARRIVALS_BASENAME = 'arrivals.v1.report.json';

const nonEmptyString = z.string().min(1);
const nonNegativeInt = z.number().int().nonnegative();

/** One live in-set file's observed identity, in both coordinate systems. */
export interface LiveFileIdentity {
  readonly sourcePath: string;
  readonly frozenPath: string;
  readonly sha256: string;
}

const addedArrivalSchema = z.strictObject({
  source: nonEmptyString,
  frozenPath: nonEmptyString,
  liveSha256: sha256HexSchema,
});

const modifiedArrivalSchema = z.strictObject({
  source: nonEmptyString,
  frozenPath: nonEmptyString,
  frozenSha256: sha256HexSchema,
  liveSha256: sha256HexSchema,
});

const deletedEntrySchema = z.strictObject({
  frozenPath: nonEmptyString,
  frozenSha256: sha256HexSchema,
});

const sanctionedEntrySchema = z.discriminatedUnion('change', [
  z.strictObject({
    change: z.literal('added'),
    source: nonEmptyString,
    frozenPath: nonEmptyString,
    classId: nonEmptyString,
    liveSha256: sha256HexSchema,
  }),
  z.strictObject({
    change: z.literal('modified'),
    source: nonEmptyString,
    frozenPath: nonEmptyString,
    classId: nonEmptyString,
    frozenSha256: sha256HexSchema,
    liveSha256: sha256HexSchema,
  }),
]);

/** The `arrivals.v1.report.json` document: closed shape, sorted, timestamp-free. */
const arrivalsReportSchema = z.strictObject({
  version: z.literal(1),
  totals: z.strictObject({
    liveFiles: nonNegativeInt,
    frozenFiles: nonNegativeInt,
    added: nonNegativeInt,
    modified: nonNegativeInt,
    deleted: nonNegativeInt,
    sanctioned: nonNegativeInt,
  }),
  added: z.array(addedArrivalSchema),
  modified: z.array(modifiedArrivalSchema),
  sanctioned: z.array(sanctionedEntrySchema),
  deleted: z.array(deletedEntrySchema),
});
export type ArrivalsReport = z.infer<typeof arrivalsReportSchema>;

/** Parse an unknown value as an {@link ArrivalsReport} at the read boundary. */
export const parseArrivalsReport = (value: unknown): Result<ArrivalsReport, Error> =>
  parseWithSchema({ label: 'arrivals report', schema: arrivalsReportSchema, value });

type AddedArrival = ArrivalsReport['added'][number];
type ModifiedArrival = ArrivalsReport['modified'][number];
type SanctionedEntry = ArrivalsReport['sanctioned'][number];

/** The mutable sections {@link classifyLiveFile} appends into. */
interface ArrivalSections {
  readonly added: AddedArrival[];
  readonly modified: ModifiedArrival[];
  readonly sanctioned: SanctionedEntry[];
}

/** Classify one live file against its (possibly absent) denominator row. */
function classifyLiveFile(input: {
  readonly live: LiveFileIdentity;
  readonly frozen: DenominatorFile | undefined;
  readonly sanctionedClassId: string | undefined;
  readonly report: ArrivalSections;
}): void {
  const { live, frozen, sanctionedClassId, report } = input;
  if (frozen === undefined) {
    if (sanctionedClassId !== undefined) {
      report.sanctioned.push({
        change: 'added',
        source: live.sourcePath,
        frozenPath: live.frozenPath,
        classId: sanctionedClassId,
        liveSha256: live.sha256,
      });
      return;
    }
    report.added.push({
      source: live.sourcePath,
      frozenPath: live.frozenPath,
      liveSha256: live.sha256,
    });
    return;
  }
  if (frozen.sha256 === live.sha256) {
    return;
  }
  if (sanctionedClassId !== undefined) {
    report.sanctioned.push({
      change: 'modified',
      source: live.sourcePath,
      frozenPath: live.frozenPath,
      classId: sanctionedClassId,
      frozenSha256: frozen.sha256,
      liveSha256: live.sha256,
    });
    return;
  }
  report.modified.push({
    source: live.sourcePath,
    frozenPath: live.frozenPath,
    frozenSha256: frozen.sha256,
    liveSha256: live.sha256,
  });
}

/**
 * Build the arrivals report: every live in-set file classified against the
 * effective denominator in frozen coordinate space, every section sorted
 * (determinism contract), totals summed in code, no timestamps.
 */
export function buildArrivalsReport(input: {
  readonly denominatorFiles: readonly DenominatorFile[];
  readonly liveFiles: readonly LiveFileIdentity[];
  readonly sanctionedClassBySource: ReadonlyMap<string, string>;
}): ArrivalsReport {
  const frozenByPath = new Map(input.denominatorFiles.map((file) => [file.path, file]));
  const report: ArrivalSections = { added: [], modified: [], sanctioned: [] };
  const liveFrozenPaths = new Set<string>();
  for (const live of [...input.liveFiles].sort((a, b) =>
    compareByCodeUnit(a.sourcePath, b.sourcePath),
  )) {
    liveFrozenPaths.add(live.frozenPath);
    classifyLiveFile({
      live,
      frozen: frozenByPath.get(live.frozenPath),
      sanctionedClassId: input.sanctionedClassBySource.get(live.sourcePath),
      report,
    });
  }
  // F2 R1-precondition (forward-looking flag, not a fix): the live set here is
  // `in`-class enumeration ONLY. When R1's amendment writer promotes a
  // non-`in`-class file (e.g. a sweep promotion) into the denominator, that
  // file has no live-in-set counterpart and would be mis-classified here as a
  // phantom deletion. BEFORE the R1 amendment writer ships, redefine the live
  // set as the in-enumeration ∪ the existing effective-denominator source
  // paths, so a promoted non-`in` file is not read as deleted.
  const deleted = input.denominatorFiles
    .filter((file) => !liveFrozenPaths.has(file.path))
    .map((file) => ({ frozenPath: file.path, frozenSha256: file.sha256 }))
    .sort((a, b) => compareByCodeUnit(a.frozenPath, b.frozenPath));
  return {
    version: 1,
    totals: {
      liveFiles: input.liveFiles.length,
      frozenFiles: input.denominatorFiles.length,
      added: report.added.length,
      modified: report.modified.length,
      deleted: deleted.length,
      sanctioned: report.sanctioned.length,
    },
    added: report.added,
    modified: report.modified,
    sanctioned: report.sanctioned,
    deleted,
  };
}

/**
 * True when the report carries UNSANCTIONED arrivals (added or modified) —
 * the RED verdict: each halts the affected batch until routed (F1 §7).
 * Sanctioned deltas and deletions never trip it.
 */
export function hasUnsanctionedArrivals(report: ArrivalsReport): boolean {
  return report.totals.added > 0 || report.totals.modified > 0;
}
