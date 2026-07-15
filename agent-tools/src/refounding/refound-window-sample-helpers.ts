import { lstatSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { err, flatMap, isErr, ok, type Result } from '@oaknational/result';

import { readRule } from './refound-freeze-plan.js';
import { parseSweepHit, SWEEP_HITS_SEGMENT, type SweepHit } from './refound-sweep-model.js';
import { makeGitByteSource } from './refound-window-sample-git.js';
import { buildWindowSample } from './refound-window-sample-model.js';
import {
  expectationsFromEvidence,
  parseWindowSampleEvidence,
  WINDOW_SAMPLE_SEGMENT,
  type WindowSampleExpectations,
  type WindowSampleManifest,
} from './refound-window-sample-schema.js';
import { type ByteSource } from './refound-window-sample-universe.js';
import { parseJsonDocument, renderJsonArtefact } from './refounding-artefacts.js';

/**
 * The IO orchestration of `refound-window-sample`: read the ratified rule,
 * the S1 evidence, and the verified hits queue, drive the pure computation
 * over the composition root's {@link ByteSource}, and write the
 * `sweep/window-sample.v1.json` manifest.
 *
 * @remarks
 * Refusals BEFORE anything is written: an unratified rule (acting on a
 * draft is the freeze's own posture), an evidence file that does not carry
 * the expected machine-readable counts, a `--base` that disagrees with the
 * evidence's `runBaseSha` (the expectations bind to their own base), a
 * malformed hits queue, every arithmetic halt inside the model, and a
 * symlinked write directory (the fixed `sweep/` segment is appended after
 * the `--out` containment check, so the write dir re-asserts its own
 * integrity). The write phase runs only after every refusal has passed —
 * nothing written on halt.
 *
 * The byte source arrives through the {@link ByteSourceFactory} seam so the
 * composition root (`refound-window-sample.ts` `main()`) owns the wiring:
 * the git-backed production source lives in `refound-window-sample-git.ts`;
 * integration tests inject in-memory sources and never spawn a process.
 *
 * @packageDocumentation
 */

/** Default S1 deterministic-evidence location (the expectations carrier). */
export const DEFAULT_EVIDENCE_PATH =
  '.agent/plans-refounding/proofs/s1-deterministic-evidence.v1.json';

/** Builds the bytes-at-base source for one run (the composition root's seam). */
export type ByteSourceFactory = (repoRoot: string, baseSha: string) => Result<ByteSource, Error>;

/** Read one UTF-8 text file as a `Result`, naming the boundary on failure. */
async function readTextFile(label: string, absPath: string): Promise<Result<string, Error>> {
  try {
    return ok(await readFile(absPath, 'utf8'));
  } catch (cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return err(new Error(`cannot read ${label} at '${absPath}': ${message}`));
  }
}

/** Read and strictly parse every `sweep/sweep-hits.v1.jsonl` row. */
async function readSweepHits(hitsAbsPath: string): Promise<Result<readonly SweepHit[], Error>> {
  const text = await readTextFile('sweep hits', hitsAbsPath);
  if (isErr(text)) {
    return text;
  }
  const rows: SweepHit[] = [];
  const lines = text.value.split('\n').filter((line) => line !== '');
  for (const [index, line] of lines.entries()) {
    const label = `sweep hit line ${String(index + 1)}`;
    const row = flatMap(parseJsonDocument(label, line), parseSweepHit);
    if (isErr(row)) {
      return err(new Error(`${label}: ${row.error.message}`));
    }
    rows.push(row.value);
  }
  return ok(rows);
}

/**
 * Read the S1 evidence, verify the run base binds to it (the evidence's
 * counts are meaningless against any other commit), and map its sweep
 * counts onto the computation's expectations.
 */
async function readExpectations(
  evidenceAbsPath: string,
  baseSha: string,
): Promise<Result<WindowSampleExpectations, Error>> {
  const text = await readTextFile('evidence', evidenceAbsPath);
  if (isErr(text)) {
    return text;
  }
  const evidence = flatMap(
    parseJsonDocument('window-sample evidence', text.value),
    parseWindowSampleEvidence,
  );
  if (isErr(evidence)) {
    return evidence;
  }
  if (evidence.value.runBaseSha !== baseSha) {
    return err(
      new Error(
        `--base ${baseSha} disagrees with the evidence's runBaseSha ` +
          `${evidence.value.runBaseSha} — the expectations bind to their own base; halting`,
      ),
    );
  }
  return ok(expectationsFromEvidence(evidence.value));
}

/**
 * Write the manifest artefact, creating its parent directory. The fixed
 * `sweep/` segment is appended AFTER the `--out` containment check, so the
 * write dir is re-asserted here: an existing symlink at it would carry the
 * write to an unverified destination and is refused before `mkdir` could
 * follow it (the `refound-path-resolve.ts` posture, applied at the sink).
 */
async function writeManifest(
  manifestAbsPath: string,
  manifest: WindowSampleManifest,
): Promise<Result<WindowSampleManifest, Error>> {
  const writeDirAbs = path.dirname(manifestAbsPath);
  const writeDirStat = lstatSync(writeDirAbs, { throwIfNoEntry: false });
  if (writeDirStat?.isSymbolicLink() === true) {
    return err(
      new Error(
        `'${writeDirAbs}' is a symlink — a write would follow it to an unverifiable ` +
          'destination; refusing',
      ),
    );
  }
  try {
    await mkdir(writeDirAbs, { recursive: true });
    await writeFile(manifestAbsPath, renderJsonArtefact(manifest), 'utf8');
    return ok(manifest);
  } catch (cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return err(new Error(`window-sample artefact write failed: ${message}`));
  }
}

/** Everything {@link runWindowSample} needs, resolved and repo-constrained. */
export interface RunWindowSampleInput {
  readonly repoRoot: string;
  readonly ruleAbsPath: string;
  readonly outDirAbs: string;
  readonly evidenceAbsPath: string;
  readonly baseSha: string;
  /**
   * Byte-source factory the run reads the base commit through; the
   * composition root wires the git-backed {@link makeGitByteSource}, which
   * is also the default when omitted.
   */
  readonly makeByteSource?: ByteSourceFactory;
}

/**
 * Execute the batch-open computation: ratified rule, evidence expectations,
 * and verified hits in; `sweep/window-sample.v1.json` out. Returns the
 * written manifest for the entry's operator summary; every refusal returns
 * `Err` with nothing written.
 */
export async function runWindowSample(
  input: RunWindowSampleInput,
): Promise<Result<WindowSampleManifest, Error>> {
  const rule = await readRule(input.ruleAbsPath);
  if (isErr(rule)) {
    return rule;
  }
  if (rule.value.ratifiedBy === null) {
    return err(
      new Error(
        'freeze rule is unratified; a draft-rule universe would disagree with the ratified ' +
          'sweep it samples',
      ),
    );
  }
  const expectations = await readExpectations(input.evidenceAbsPath, input.baseSha);
  if (isErr(expectations)) {
    return expectations;
  }
  const hits = await readSweepHits(path.join(input.outDirAbs, SWEEP_HITS_SEGMENT));
  if (isErr(hits)) {
    return hits;
  }
  const makeByteSource = input.makeByteSource ?? makeGitByteSource;
  const manifest = flatMap(makeByteSource(input.repoRoot, input.baseSha), (source) =>
    buildWindowSample({
      source,
      rule: rule.value,
      hits: hits.value,
      expectations: expectations.value,
      baseSha: input.baseSha,
    }),
  );
  if (isErr(manifest)) {
    return manifest;
  }
  return writeManifest(path.join(input.outDirAbs, WINDOW_SAMPLE_SEGMENT), manifest.value);
}
