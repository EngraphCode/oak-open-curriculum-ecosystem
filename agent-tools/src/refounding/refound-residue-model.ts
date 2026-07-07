import { type Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import { percentRounded } from './refound-inventory-model.js';

/**
 * The residue audit's data model (F1 §9): anchored-block clustering over the
 * inventory's anchor set, the orphan-candidate rules, and the
 * `residue.v1.report.json` shape. Pure — the filesystem-facing orchestration
 * lives in `refound-residue-helpers.ts`.
 *
 * @remarks
 * **The unit definition (F1 §9, verbatim contract).** For each frozen text
 * file: an anchor is an inventory line (union of nets). An anchored block is
 * an anchor line plus every following non-anchor line up to (exclusive) the
 * next anchor or EOF. Lines before the first anchor form a `file-preamble`
 * block. Fenced code content clusters to its opening-fence anchor because
 * fence delimiters are Net-A anchors and fenced content captures nothing
 * (see `refound-inventory-nets.ts`).
 *
 * **Orphan candidate.** A block is an orphan candidate iff (a) it is a
 * non-blank `file-preamble` block, or (b) its non-blank line count exceeds
 * {@link RESIDUE_BOUNDS_V1}.maxBlockNonBlankLines, or (c) its file's anchor
 * ratio is below {@link RESIDUE_BOUNDS_V1}.minFileAnchorRatioPercent. The
 * bounds are placed judgement, ratified at G1 (packet §3), versioned here.
 * Ratio comparisons are integer arithmetic — no float edge decides a
 * verdict. An orphan candidate is a disposition candidate for the F3
 * adjudication queue, never an automatic loss.
 *
 * @packageDocumentation
 */

/** Residue report basename under the artefact home (F1 §3). */
export const RESIDUE_BASENAME = 'residue.v1.report.json';

/**
 * The residue-orphan bounds, v1 (F1 §9 defaults, ratified at G1): rule (b)'s
 * non-blank ceiling and rule (c)'s per-file anchor-ratio floor.
 */
export const RESIDUE_BOUNDS_V1 = {
  maxBlockNonBlankLines: 25,
  minFileAnchorRatioPercent: 5,
} as const;

/** One anchored block (or the file preamble), 1-based inclusive lines. */
export interface AnchoredBlock {
  readonly kind: 'file-preamble' | 'anchored';
  readonly lineStart: number;
  readonly lineEnd: number;
}

/**
 * Cluster one file's lines into blocks per the F1 §9 unit definition. The
 * result exactly tiles `[1, lineCount]`: no gaps, no overlaps.
 *
 * @param input - The file's line count plus its anchor lines, ascending.
 */
export function buildFileBlocks(input: {
  readonly lineCount: number;
  readonly anchorLines: readonly number[];
}): readonly AnchoredBlock[] {
  if (input.lineCount === 0) {
    return [];
  }
  if (input.anchorLines.length === 0) {
    return [{ kind: 'file-preamble', lineStart: 1, lineEnd: input.lineCount }];
  }
  const blocks: AnchoredBlock[] = [];
  const firstAnchor = input.anchorLines[0] ?? 1;
  if (firstAnchor > 1) {
    blocks.push({ kind: 'file-preamble', lineStart: 1, lineEnd: firstAnchor - 1 });
  }
  for (let index = 0; index < input.anchorLines.length; index += 1) {
    const anchor = input.anchorLines[index] ?? 1;
    const nextAnchor = input.anchorLines[index + 1];
    blocks.push({
      kind: 'anchored',
      lineStart: anchor,
      lineEnd: nextAnchor === undefined ? input.lineCount : nextAnchor - 1,
    });
  }
  return blocks;
}

/** True when a line is blank: empty or whitespace-only (a bare CR is blank). */
export function isBlankLine(text: string): boolean {
  return /^\s*$/.test(text);
}

const orphanReasonSchema = z.enum(['file-preamble', 'oversized-block', 'low-anchor-file']);
type OrphanReason = z.infer<typeof orphanReasonSchema>;

const nonNegativeInt = z.number().int().nonnegative();
const positiveInt = z.number().int().positive();
const nonEmptyString = z.string().min(1);

/** One orphan candidate: a block coordinate plus every rule it tripped. */
const orphanCandidateSchema = z.strictObject({
  file: nonEmptyString,
  lineStart: positiveInt,
  lineEnd: positiveInt,
  nonBlankLines: nonNegativeInt,
  reasons: z.array(orphanReasonSchema).min(1),
});
type OrphanCandidate = z.infer<typeof orphanCandidateSchema>;

const reportBlockSchema = z.strictObject({
  kind: z.enum(['file-preamble', 'anchored']),
  lineStart: positiveInt,
  lineEnd: positiveInt,
  nonBlankLines: nonNegativeInt,
});

const fileResidueSchema = z.strictObject({
  file: nonEmptyString,
  lines: nonNegativeInt,
  anchors: nonNegativeInt,
  anchorRatioPercent: z.number().nonnegative(),
  blocks: z.array(reportBlockSchema),
  orphanCandidates: z.array(orphanCandidateSchema),
});
export type FileResidue = z.infer<typeof fileResidueSchema>;

/** The `residue.v1.report.json` document (F1 §3, §9). */
const residueReportSchema = z.strictObject({
  version: z.literal(1),
  bounds: z.strictObject({
    maxBlockNonBlankLines: positiveInt,
    minFileAnchorRatioPercent: positiveInt,
  }),
  totals: z.strictObject({
    files: nonNegativeInt,
    lines: nonNegativeInt,
    anchors: nonNegativeInt,
    blocks: nonNegativeInt,
    orphanCandidates: nonNegativeInt,
  }),
  files: z.array(fileResidueSchema),
  orphanCandidates: z.array(orphanCandidateSchema),
});
export type ResidueReport = z.infer<typeof residueReportSchema>;

/** Parse an unknown value as a {@link ResidueReport} at the read boundary. */
export const parseResidueReport = (value: unknown): Result<ResidueReport, Error> =>
  parseWithSchema({ label: 'residue report', schema: residueReportSchema, value });

/**
 * Analyse one file: cluster its blocks, count non-blank lines per block, and
 * apply the three orphan rules. Rule (c) uses integer arithmetic
 * (`anchors * 100 < lines * floor`), so exactly-at-the-floor never fires.
 */
export function analyseFileResidue(input: {
  readonly file: string;
  readonly lineTexts: readonly string[];
  readonly anchorLines: readonly number[];
}): FileResidue {
  const lineCount = input.lineTexts.length;
  const blocks = buildFileBlocks({ lineCount, anchorLines: input.anchorLines });
  const lowAnchorFile =
    lineCount > 0 &&
    input.anchorLines.length * 100 < lineCount * RESIDUE_BOUNDS_V1.minFileAnchorRatioPercent;
  const reportBlocks = blocks.map((block) => {
    let nonBlankLines = 0;
    for (let line = block.lineStart; line <= block.lineEnd; line += 1) {
      if (!isBlankLine(input.lineTexts[line - 1] ?? '')) {
        nonBlankLines += 1;
      }
    }
    return { ...block, nonBlankLines };
  });
  const orphanCandidates: OrphanCandidate[] = [];
  for (const block of reportBlocks) {
    const reasons: OrphanReason[] = [];
    if (block.kind === 'file-preamble' && block.nonBlankLines > 0) {
      reasons.push('file-preamble');
    }
    if (block.nonBlankLines > RESIDUE_BOUNDS_V1.maxBlockNonBlankLines) {
      reasons.push('oversized-block');
    }
    if (lowAnchorFile) {
      reasons.push('low-anchor-file');
    }
    if (reasons.length > 0) {
      orphanCandidates.push({
        file: input.file,
        lineStart: block.lineStart,
        lineEnd: block.lineEnd,
        nonBlankLines: block.nonBlankLines,
        reasons,
      });
    }
  }
  return {
    file: input.file,
    lines: lineCount,
    anchors: input.anchorLines.length,
    anchorRatioPercent: percentRounded(input.anchorLines.length, lineCount),
    blocks: reportBlocks,
    orphanCandidates,
  };
}

/**
 * Assemble the whole-corpus residue report from per-file analyses (already
 * in denominator order — sorted by path). Totals are summed in code, never
 * transcribed.
 */
export function buildResidueReport(files: readonly FileResidue[]): ResidueReport {
  let lines = 0;
  let anchors = 0;
  let blocks = 0;
  const orphanCandidates: OrphanCandidate[] = [];
  for (const file of files) {
    lines += file.lines;
    anchors += file.anchors;
    blocks += file.blocks.length;
    orphanCandidates.push(...file.orphanCandidates);
  }
  return {
    version: 1,
    bounds: RESIDUE_BOUNDS_V1,
    totals: {
      files: files.length,
      lines,
      anchors,
      blocks,
      orphanCandidates: orphanCandidates.length,
    },
    files: [...files],
    orphanCandidates,
  };
}
