import { lstatSync } from 'node:fs';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { err, flatMap, isErr, ok, type Result } from '@oaknational/result';

import { readRule } from './refound-freeze-plan.js';
import { parseSweepHit, SWEEP_HITS_SEGMENT, type SweepHit } from './refound-sweep-model.js';
import { makeGitByteSource } from './refound-window-sample-git.js';
import { buildWindowSample } from './refound-window-sample-model.js';
import {
  expectationsFromEvidence,
  parseWindowSampleEvidence,
  sweepHitsDigestFromEvidence,
  WINDOW_SAMPLE_SEGMENT,
  type WindowSampleExpectations,
  type WindowSampleManifest,
} from './refound-window-sample-schema.js';
import { type ByteSource } from './refound-window-sample-universe.js';
import { parseJsonDocument, renderJsonArtefact, sha256Hex } from './refounding-artefacts.js';

/**
 * The IO orchestration of `refound-window-sample`: read the ratified rule,
 * the S1 evidence, and the verified hits queue, drive the pure computation
 * over the composition root's {@link ByteSource}, and write the
 * `sweep/window-sample.v1.json` manifest.
 *
 * @remarks
 * Refusals BEFORE anything is written: an unratified rule (acting on a
 * draft is the freeze's own posture), an evidence file without the expected
 * machine-readable counts or digests, a `--base` disagreeing with the
 * evidence's `runBaseSha`, a hits queue whose bytes miss the recorded
 * SHA-256, a malformed hits row, every arithmetic halt inside the model,
 * and a symlinked write dir or manifest path. The write phase runs only
 * after every refusal has passed — nothing written on halt.
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

/**
 * Read `sweep/sweep-hits.v1.jsonl`, verify its exact bytes against the
 * evidence-recorded SHA-256 (a same-count queue with hits moved elsewhere
 * would pass every arithmetic check yet change the sealed sample), then
 * strictly parse every row.
 */
async function readSweepHits(
  hitsAbsPath: string,
  expectedSha256: string,
): Promise<Result<readonly SweepHit[], Error>> {
  let bytes: Buffer;
  try {
    bytes = await readFile(hitsAbsPath);
  } catch (cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return err(new Error(`cannot read sweep hits at '${hitsAbsPath}': ${message}`));
  }
  const actualSha256 = sha256Hex(bytes);
  if (actualSha256 !== expectedSha256) {
    return err(
      new Error(
        `sweep hits at '${hitsAbsPath}' are not the evidence-recorded queue: sha256 ` +
          `${actualSha256} disagrees with the recorded ${expectedSha256}; halting with ` +
          'nothing written',
      ),
    );
  }
  const rows: SweepHit[] = [];
  const lines = bytes
    .toString('utf8')
    .split('\n')
    .filter((line) => line !== '');
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

/** What the run consumes from the evidence: the counts and the hits digest. */
interface EvidenceBindings {
  readonly expectations: WindowSampleExpectations;
  readonly sweepHitsSha256: string;
}

/**
 * Read the S1 evidence, verify the run base binds to it (the counts are
 * meaningless against any other commit), and extract the expectations plus
 * the recorded digest that binds the hits queue.
 */
async function readEvidenceBindings(
  evidenceAbsPath: string,
  baseSha: string,
): Promise<Result<EvidenceBindings, Error>> {
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
  const sweepHitsSha256 = sweepHitsDigestFromEvidence(evidence.value);
  if (isErr(sweepHitsSha256)) {
    return sweepHitsSha256;
  }
  return ok({
    expectations: expectationsFromEvidence(evidence.value),
    sweepHitsSha256: sweepHitsSha256.value,
  });
}

/**
 * Write the manifest artefact, creating its parent directory. The fixed
 * `sweep/` segment is appended AFTER the `--out` containment check, so the
 * sink re-asserts its own integrity: a symlink at the write dir OR at the
 * manifest path itself is refused (the `refound-path-resolve.ts` posture),
 * and the write lands via an exclusive same-directory temp file plus atomic
 * rename — an interruption can never truncate an existing sealed manifest.
 */
async function writeManifest(
  manifestAbsPath: string,
  manifest: WindowSampleManifest,
): Promise<Result<WindowSampleManifest, Error>> {
  const writeDirAbs = path.dirname(manifestAbsPath);
  for (const [label, checkedAbsPath] of [
    ['write dir', writeDirAbs],
    ['manifest path', manifestAbsPath],
  ] as const) {
    const stat = lstatSync(checkedAbsPath, { throwIfNoEntry: false });
    if (stat?.isSymbolicLink() === true) {
      return err(
        new Error(
          `${label} '${checkedAbsPath}' is a symlink — a write would follow it to an ` +
            'unverifiable destination; refusing',
        ),
      );
    }
  }
  const tempAbsPath = `${manifestAbsPath}.tmp-${String(process.pid)}`;
  try {
    await mkdir(writeDirAbs, { recursive: true });
    await writeFile(tempAbsPath, renderJsonArtefact(manifest), { encoding: 'utf8', flag: 'wx' });
    await rename(tempAbsPath, manifestAbsPath);
    return ok(manifest);
  } catch (cause: unknown) {
    await rm(tempAbsPath, { force: true }).catch(() => undefined);
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
  const bindings = await readEvidenceBindings(input.evidenceAbsPath, input.baseSha);
  if (isErr(bindings)) {
    return bindings;
  }
  const hits = await readSweepHits(
    path.join(input.outDirAbs, SWEEP_HITS_SEGMENT),
    bindings.value.sweepHitsSha256,
  );
  if (isErr(hits)) {
    return hits;
  }
  const makeByteSource = input.makeByteSource ?? makeGitByteSource;
  const manifest = flatMap(makeByteSource(input.repoRoot, input.baseSha), (source) =>
    buildWindowSample({
      source,
      rule: rule.value,
      hits: hits.value,
      expectations: bindings.value.expectations,
      baseSha: input.baseSha,
    }),
  );
  if (isErr(manifest)) {
    return manifest;
  }
  return writeManifest(path.join(input.outDirAbs, WINDOW_SAMPLE_SEGMENT), manifest.value);
}
