import { err, ok, type Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import { SWEEP_HITS_SEGMENT } from './refound-sweep-model.js';
import {
  refineManifest,
  refineSampleWindow,
  SELECTION_RULE_V1,
  WINDOW_LINES,
} from './refound-window-sample-invariants.js';
import { sha256HexSchema } from './refounding-artefacts.js';

export {
  SAMPLE_STRIDE,
  SELECTION_RULE_V1,
  WINDOW_LINES,
} from './refound-window-sample-invariants.js';

/**
 * Boundary contracts for `refound-window-sample` (batch
 * `s1-reader-sample-b1`): the consumed slice of the S1 deterministic
 * evidence and the produced `sweep/window-sample.v1.json` manifest.
 *
 * @remarks
 * Two boundaries, two postures (`strict-validation-at-boundary`):
 *
 * - **The evidence slice** is READ from an artefact owned by the S1
 *   evidence run (`proofs/s1-deterministic-evidence.v1.json`), so its shape
 *   here is deliberately NON-strict: only the fields this tool consumes are
 *   validated — `runBaseSha` and the three sweep counts — and unknown keys
 *   pass through unread. Those counts become the
 *   {@link WindowSampleExpectations} that every halt in the computation
 *   binds to (H8 posture: arithmetic disagreement halts, nothing written).
 * - **The manifest** is WRITTEN by this tool and owned by it, so its shape
 *   is closed: unknown keys are rejected at any future read boundary. Key
 *   order follows construction order and the sample list is sorted — the
 *   two halves of the byte-determinism contract
 *   (`renderJsonArtefact` in `refounding-artefacts.ts`).
 *
 * The computation itself lives in `refound-window-sample-model.ts`; the
 * universe enumeration in `refound-window-sample-universe.ts`.
 *
 * @packageDocumentation
 */

/** Window-sample artefact path relative to the artefact home. */
export const WINDOW_SAMPLE_SEGMENT = 'sweep/window-sample.v1.json';

/** A full 40-hex commit sha — the base-commit identity primitive. */
export const SHA40_PATTERN = /^[0-9a-f]{40}$/;

const sha40Schema = z.string().regex(SHA40_PATTERN);
const nonNegativeInt = z.number().int().nonnegative();
const positiveInt = z.number().int().positive();
const nonEmptyString = z.string().min(1);

/** The evidence-bound counts every halt in the computation binds to. */
export interface WindowSampleExpectations {
  /** Expected non-opaque sweep-surface file count at base. */
  readonly scannedFiles: number;
  /** Expected distinct files carrying at least one sweep hit. */
  readonly hitFiles: number;
  /** Expected total sweep-hit rows (hit lines). */
  readonly hitLines: number;
}

/**
 * The consumed slice of the S1 deterministic evidence: the evidence schema
 * version, the run's base sha, the recorded artefact digests (the binding
 * for the hits queue), and the sweep's machine-readable counts (see the
 * module remarks for why this shape is non-strict).
 */
const windowSampleEvidenceSchema = z.object({
  schemaVersion: z.literal(1),
  runBaseSha: sha40Schema,
  artifacts: z.array(
    z.object({
      path: nonEmptyString,
      sha256: sha256HexSchema,
    }),
  ),
  sweep: z.object({
    filesScanned: nonNegativeInt,
    hits: nonNegativeInt,
    filesWithHits: nonNegativeInt,
  }),
});
export type WindowSampleEvidence = z.infer<typeof windowSampleEvidenceSchema>;

/** Parse an unknown value as the consumed evidence slice at the read boundary. */
export const parseWindowSampleEvidence = (value: unknown): Result<WindowSampleEvidence, Error> =>
  parseWithSchema({ label: 'window-sample evidence', schema: windowSampleEvidenceSchema, value });

/**
 * The evidence-recorded SHA-256 for the sweep-hits queue. Exactly one
 * recorded artefact digest may match `sweep/sweep-hits.v1.jsonl`; zero
 * leaves the queue unbindable and more than one leaves it ambiguous — both
 * halt before anything is read.
 */
export const sweepHitsDigestFromEvidence = (
  evidence: WindowSampleEvidence,
): Result<string, Error> => {
  const matches = evidence.artifacts.filter(
    (artifact) =>
      artifact.path === SWEEP_HITS_SEGMENT || artifact.path.endsWith(`/${SWEEP_HITS_SEGMENT}`),
  );
  const [only] = matches;
  if (only === undefined || matches.length > 1) {
    return err(
      new Error(
        `evidence records ${String(matches.length)} artefact digests for ` +
          `'${SWEEP_HITS_SEGMENT}' — exactly one is required to bind the hits queue; halting`,
      ),
    );
  }
  return ok(only.sha256);
};

/** Map the evidence's sweep counts onto the computation's expectations. */
export const expectationsFromEvidence = (
  evidence: WindowSampleEvidence,
): WindowSampleExpectations => ({
  scannedFiles: evidence.sweep.filesScanned,
  hitFiles: evidence.sweep.filesWithHits,
  hitLines: evidence.sweep.hits,
});

/**
 * One selected non-hit window: a reader-batch reading assignment.
 * `start_line`/`end_line` are 1-indexed and inclusive; `line_count` is the
 * window's own span (`end_line - start_line + 1` — the final partial window
 * of a file is shorter than the full window size).
 */
const sampleWindowSchema = z
  .strictObject({
    file: nonEmptyString,
    window_index: nonNegativeInt,
    start_line: positiveInt,
    end_line: positiveInt,
    line_count: positiveInt,
  })
  .superRefine(refineSampleWindow);
export type SampleWindow = z.infer<typeof sampleWindowSchema>;

/**
 * The `sweep/window-sample.v1.json` manifest: the whole output of the
 * deterministic batch-open computation — the base identity, the window and
 * selection parameters, the universe counts, the expectations used, and the
 * selected sample. No timestamps and no environment-dependent fields: two
 * runs over the same base and inputs are byte-identical.
 */
const windowSampleManifestSchema = z
  .strictObject({
    schema_version: z.literal('1'),
    base: sha40Schema,
    window_lines: z.literal(WINDOW_LINES),
    selection_rule: z.literal(SELECTION_RULE_V1),
    universe: z.strictObject({
      files: nonNegativeInt,
      windows: nonNegativeInt,
      hit_windows: nonNegativeInt,
      non_hit_windows: nonNegativeInt,
    }),
    expectations: z.strictObject({
      scanned_files: nonNegativeInt,
      hit_files: nonNegativeInt,
      hit_lines: nonNegativeInt,
    }),
    sample: z.array(sampleWindowSchema),
  })
  .superRefine(refineManifest);
export type WindowSampleManifest = z.infer<typeof windowSampleManifestSchema>;

/** Parse an unknown value as a {@link WindowSampleManifest} at the read boundary. */
export const parseWindowSampleManifest = (value: unknown): Result<WindowSampleManifest, Error> =>
  parseWithSchema({ label: 'window-sample manifest', schema: windowSampleManifestSchema, value });
