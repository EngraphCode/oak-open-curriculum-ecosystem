/**
 * The v1 window-sample constants and the derivable-invariant refinements
 * consumed by `refound-window-sample-schema.ts` — one home for everything a
 * v1 manifest must arithmetically satisfy, so the read boundary rejects
 * corrupt denominator metadata instead of passing it downstream
 * (`strict-validation-at-boundary`).
 *
 * @packageDocumentation
 */

/**
 * V1 window span in lines. Single-sourced here at the schema boundary and
 * validated as a literal: a v1 manifest with any other span is an
 * algorithm-drifted artefact, not a valid manifest.
 */
export const WINDOW_LINES = 500;

/**
 * V1 selection rule: sort the non-hit windows by `(file, window_index)` and
 * take every 10th starting at index 0 — a fixed declared-rate rule, no
 * randomness. Validated as a literal, exactly as {@link WINDOW_LINES}.
 */
export const SELECTION_RULE_V1 = 'sorted-(file,window)-every-10th-from-0';

/**
 * V1 selection stride over the sorted non-hit window list; the manifest
 * refinement derives the required sample length from it.
 */
export const SAMPLE_STRIDE = 10;

/** The structural slice of a refinement context these refiners consume. */
interface RefinementIssues {
  addIssue: (issue: { code: 'custom'; message: string }) => void;
}

interface SampleWindowShape {
  readonly file: string;
  readonly window_index: number;
  readonly start_line: number;
  readonly end_line: number;
  readonly line_count: number;
}

interface ManifestShape {
  readonly universe: {
    readonly files: number;
    readonly windows: number;
    readonly hit_windows: number;
    readonly non_hit_windows: number;
  };
  readonly expectations: { readonly scanned_files: number };
  readonly sample: readonly SampleWindowShape[];
}

/** Per-window v1 arithmetic: span shape and window-index alignment. */
export function refineSampleWindow(window: SampleWindowShape, ctx: RefinementIssues): void {
  if (window.end_line < window.start_line) {
    ctx.addIssue({
      code: 'custom',
      message: `end_line ${String(window.end_line)} precedes start_line ${String(window.start_line)}`,
    });
    return;
  }
  const expectedStart = window.window_index * WINDOW_LINES + 1;
  if (window.start_line !== expectedStart) {
    ctx.addIssue({
      code: 'custom',
      message:
        `start_line ${String(window.start_line)} disagrees with window_index ` +
        `${String(window.window_index)} (a v1 window starts at ${String(expectedStart)})`,
    });
    return;
  }
  const span = window.end_line - window.start_line + 1;
  if (span > WINDOW_LINES) {
    ctx.addIssue({
      code: 'custom',
      message: `span ${String(span)} exceeds the v1 window size ${String(WINDOW_LINES)}`,
    });
    return;
  }
  if (window.line_count !== span) {
    ctx.addIssue({
      code: 'custom',
      message:
        `line_count ${String(window.line_count)} disagrees with the start/end span ` +
        `${String(span)}`,
    });
  }
}

/** Denominator arithmetic: window sums and the files/expectations bind. */
function checkUniverseArithmetic(manifest: ManifestShape, ctx: RefinementIssues): boolean {
  const { files, windows, hit_windows, non_hit_windows } = manifest.universe;
  if (windows !== hit_windows + non_hit_windows) {
    ctx.addIssue({
      code: 'custom',
      message:
        `universe.windows ${String(windows)} disagrees with hit_windows + ` +
        `non_hit_windows ${String(hit_windows + non_hit_windows)}`,
    });
    return false;
  }
  if (files !== manifest.expectations.scanned_files) {
    ctx.addIssue({
      code: 'custom',
      message:
        `universe.files ${String(files)} disagrees with expectations.scanned_files ` +
        `${String(manifest.expectations.scanned_files)}`,
    });
    return false;
  }
  return true;
}

/** Selection arithmetic: stride-derived sample length and sort order. */
function checkSampleSelection(manifest: ManifestShape, ctx: RefinementIssues): void {
  const requiredSampleLength = Math.ceil(manifest.universe.non_hit_windows / SAMPLE_STRIDE);
  if (manifest.sample.length !== requiredSampleLength) {
    ctx.addIssue({
      code: 'custom',
      message:
        `sample length ${String(manifest.sample.length)} disagrees with the v1 stride ` +
        `over ${String(manifest.universe.non_hit_windows)} non-hit windows ` +
        `(expected ${String(requiredSampleLength)})`,
    });
    return;
  }
  for (let index = 1; index < manifest.sample.length; index += 1) {
    const previous = manifest.sample[index - 1];
    const current = manifest.sample[index];
    if (previous === undefined || current === undefined) {
      continue;
    }
    const ordered =
      previous.file < current.file ||
      (previous.file === current.file && previous.window_index < current.window_index);
    if (!ordered) {
      ctx.addIssue({
        code: 'custom',
        message:
          `sample is not sorted by (file, window_index) at index ${String(index)} — ` +
          'the v1 selection rule requires it',
      });
      return;
    }
  }
}

/**
 * Every derivable manifest-level v1 invariant closes here, at the read
 * boundary — a manifest with impossible denominator arithmetic must never
 * reach a downstream reader as valid.
 */
export function refineManifest(manifest: ManifestShape, ctx: RefinementIssues): void {
  if (checkUniverseArithmetic(manifest, ctx)) {
    checkSampleSelection(manifest, ctx);
  }
}
