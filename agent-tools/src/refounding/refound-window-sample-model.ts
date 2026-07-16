import { err, isErr, ok, type Result } from '@oaknational/result';

import { type FreezeRule } from './freeze-rule-schema.js';
import { type SweepHit } from './refound-sweep-model.js';
import {
  SAMPLE_STRIDE,
  SELECTION_RULE_V1,
  WINDOW_LINES,
  type SampleWindow,
  type WindowSampleExpectations,
  type WindowSampleManifest,
} from './refound-window-sample-schema.js';
import {
  enumerateUniverse,
  type ByteSource,
  type UniverseFile,
} from './refound-window-sample-universe.js';

/**
 * The window-sample computation for `refound-window-sample` — the zero-LLM
 * batch-open arithmetic of the S1 reader sample over NON-HIT sweep windows
 * (batch `s1-reader-sample-b1`). Pure: bytes arrive only through the
 * injected {@link ByteSource} seam (`refound-window-sample-universe.ts`);
 * the git-backed source and all filesystem orchestration live in
 * `refound-window-sample-helpers.ts`.
 *
 * @remarks
 * Every count binds to the S1 deterministic-evidence expectations, and ANY
 * arithmetic disagreement is an H8-class halt with nothing written — never
 * a silently adjusted denominator:
 *
 * - the universe (sweep-class files at base, instrument homes excluded,
 *   opaque files skipped) must count exactly the expected scanned files;
 * - the verified `sweep/sweep-hits.v1.jsonl` rows must count exactly the
 *   expected hit lines over exactly the expected distinct hit files;
 * - every hit must land inside the universe, on a line its file actually
 *   has at base.
 *
 * **Window arithmetic.** Windows are consecutive {@link WINDOW_LINES}-line
 * spans per universe file (LF-split raw bytes, 1-indexed lines — the same
 * `splitLineBytes` definition the sweep matches by). The final partial span
 * counts as a window; a zero-line file has no windows. A window containing
 * at least one hit line of its file is HIT; all others are NON-HIT.
 *
 * **Selection.** The non-hit windows sort by (file code-unit, window index)
 * and the sample is every {@link SAMPLE_STRIDE}th of that list starting at
 * index 0 ({@link SELECTION_RULE_V1}) — a fixed declared-rate rule, no
 * randomness, no environment input, so the sample is a pure function of the
 * base commit and the verified hits.
 *
 * @packageDocumentation
 */

export { SAMPLE_STRIDE, SELECTION_RULE_V1, WINDOW_LINES } from './refound-window-sample-schema.js';

/**
 * Bind the verified hits to the universe, halting on any disagreement: the
 * row count and the distinct-file count must equal the expectations, every
 * hit file must be inside the universe, and every hit line must lie within
 * its file's line count at base.
 *
 * @returns Hit window indexes per file (`floor((line - 1) / WINDOW_LINES)`).
 */
function bindHitsToUniverse(
  hits: readonly SweepHit[],
  universe: readonly UniverseFile[],
  expected: WindowSampleExpectations,
): Result<ReadonlyMap<string, ReadonlySet<number>>, Error> {
  if (hits.length !== expected.hitLines) {
    return err(
      new Error(
        `sweep-hits carries ${String(hits.length)} hit row(s) but the expectation says ` +
          `${String(expected.hitLines)} — arithmetic disagreement; halting with nothing written`,
      ),
    );
  }
  const distinctFiles = new Set(hits.map((row) => row.file));
  if (distinctFiles.size !== expected.hitFiles) {
    return err(
      new Error(
        `sweep-hits carries ${String(distinctFiles.size)} distinct hit file(s) but the ` +
          `expectation says ${String(expected.hitFiles)} — arithmetic disagreement; halting ` +
          `with nothing written`,
      ),
    );
  }
  const lineCounts = new Map(universe.map((file) => [file.relPath, file.lineCount]));
  const hitWindowsByFile = new Map<string, Set<number>>();
  for (const row of hits) {
    const lineCount = lineCounts.get(row.file);
    if (lineCount === undefined) {
      return err(
        new Error(
          `hit file '${row.file}' is outside the scanned universe at base — the hits and the ` +
            `universe disagree; halting with nothing written`,
        ),
      );
    }
    if (row.line > lineCount) {
      return err(
        new Error(
          `hit line ${String(row.line)} in '${row.file}' lies beyond the file's ` +
            `${String(lineCount)} line(s) at base — the hits and the universe disagree; ` +
            `halting with nothing written`,
        ),
      );
    }
    const windows = hitWindowsByFile.get(row.file) ?? new Set<number>();
    windows.add(Math.floor((row.line - 1) / WINDOW_LINES));
    hitWindowsByFile.set(row.file, windows);
  }
  return ok(hitWindowsByFile);
}

/**
 * Split every universe file into consecutive {@link WINDOW_LINES}-line
 * windows (final partial span counts; zero-line files have none) and drop
 * the HIT ones. The universe arrives sorted and windows are emitted in
 * index order, so the non-hit list is already in
 * (file code-unit, window index) order — the selection's sort key.
 */
function splitIntoNonHitWindows(
  universe: readonly UniverseFile[],
  hitWindowsByFile: ReadonlyMap<string, ReadonlySet<number>>,
): { nonHit: readonly SampleWindow[]; windows: number; hitWindows: number } {
  const nonHit: SampleWindow[] = [];
  let windows = 0;
  let hitWindows = 0;
  for (const file of universe) {
    const hitIndexes = hitWindowsByFile.get(file.relPath);
    const windowCount = Math.ceil(file.lineCount / WINDOW_LINES);
    windows += windowCount;
    for (let index = 0; index < windowCount; index += 1) {
      if (hitIndexes?.has(index) === true) {
        hitWindows += 1;
        continue;
      }
      const startLine = index * WINDOW_LINES + 1;
      const endLine = Math.min((index + 1) * WINDOW_LINES, file.lineCount);
      nonHit.push({
        file: file.relPath,
        window_index: index,
        start_line: startLine,
        end_line: endLine,
        line_count: endLine - startLine + 1,
      });
    }
  }
  return { nonHit, windows, hitWindows };
}

/**
 * The whole batch-open computation: universe at base, expectation halts,
 * window arithmetic, and the every-{@link SAMPLE_STRIDE}th non-hit
 * selection, returned as the ready-to-render manifest. Pure and
 * deterministic; any disagreement is an `Err` with nothing derived.
 */
export function buildWindowSample(input: {
  readonly source: ByteSource;
  readonly rule: FreezeRule;
  readonly hits: readonly SweepHit[];
  readonly expectations: WindowSampleExpectations;
  readonly baseSha: string;
}): Result<WindowSampleManifest, Error> {
  const universe = enumerateUniverse(input.source, input.rule);
  if (isErr(universe)) {
    return universe;
  }
  if (universe.value.length !== input.expectations.scannedFiles) {
    return err(
      new Error(
        `the scanned-file universe at base counts ${String(universe.value.length)} file(s) but ` +
          `the expectation says ${String(input.expectations.scannedFiles)} — arithmetic ` +
          `disagreement; halting with nothing written`,
      ),
    );
  }
  const hitWindows = bindHitsToUniverse(input.hits, universe.value, input.expectations);
  if (isErr(hitWindows)) {
    return hitWindows;
  }
  const split = splitIntoNonHitWindows(universe.value, hitWindows.value);
  const manifest: WindowSampleManifest = {
    schema_version: '1',
    base: input.baseSha,
    window_lines: WINDOW_LINES,
    selection_rule: SELECTION_RULE_V1,
    universe: {
      files: universe.value.length,
      windows: split.windows,
      hit_windows: split.hitWindows,
      non_hit_windows: split.nonHit.length,
    },
    expectations: {
      scanned_files: input.expectations.scannedFiles,
      hit_files: input.expectations.hitFiles,
      hit_lines: input.expectations.hitLines,
    },
    sample: split.nonHit.filter((_, index) => index % SAMPLE_STRIDE === 0),
  };
  return ok(manifest);
}
