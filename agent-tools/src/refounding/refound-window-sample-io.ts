import { lstatSync } from 'node:fs';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { err, flatMap, isErr, ok, type Result } from '@oaknational/result';

import { readRule } from './refound-freeze-plan.js';
import { type FreezeRule } from './freeze-rule-schema.js';
import { parseSweepHit, type SweepHit } from './refound-sweep-model.js';
import {
  expectationsFromEvidence,
  parseWindowSampleEvidence,
  sweepHitsDigestFromEvidence,
  WINDOW_SAMPLE_SEGMENT,
  type WindowSampleExpectations,
  type WindowSampleManifest,
} from './refound-window-sample-schema.js';
import { type ByteSource } from './refound-window-sample-universe.js';
import {
  recheckOutDirContainment,
  type ManifestWriteTarget,
} from './refound-window-sample-write-guard.js';
import { parseJsonDocument, renderJsonArtefact, sha256Hex } from './refounding-artefacts.js';

/**
 * The leaf IO refusals of `refound-window-sample`, consumed by the
 * orchestration in `refound-window-sample-helpers.ts`: every read binds its
 * input to the S1 evidence (base sha, counts, exact artefact bytes) and the
 * write is atomic — nothing is ever written on a failed binding.
 *
 * @packageDocumentation
 */

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
export async function readSweepHits(
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
export interface EvidenceBindings {
  readonly expectations: WindowSampleExpectations;
  readonly sweepHitsSha256: string;
}

/**
 * Read the S1 evidence, verify the run base binds to it (the counts are
 * meaningless against any other commit), and extract the expectations plus
 * the recorded digest that binds the hits queue.
 */
export async function readEvidenceBindings(
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
 * Read the freeze rule, refuse a draft, and bind the live bytes to the rule
 * at the pinned base. The evidence's counts are functions of (base tree,
 * rule): a swapped rule that keeps the same file count and every hit file
 * can still reshape the non-hit windows and change the sealed sample while
 * passing every arithmetic check. Exact bytes, or refuse.
 */
export async function readBoundRule(
  repoRoot: string,
  ruleAbsPath: string,
  source: ByteSource,
): Promise<Result<FreezeRule, Error>> {
  const rule = await readRule(ruleAbsPath);
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
  const binding = await verifyRuleBinding(repoRoot, ruleAbsPath, source);
  if (isErr(binding)) {
    return binding;
  }
  return rule;
}

async function verifyRuleBinding(
  repoRoot: string,
  ruleAbsPath: string,
  source: ByteSource,
): Promise<Result<undefined, Error>> {
  let liveBytes: Buffer;
  try {
    liveBytes = await readFile(ruleAbsPath);
  } catch (cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return err(new Error(`cannot read freeze rule at '${ruleAbsPath}': ${message}`));
  }
  const ruleRelPath = path.relative(repoRoot, ruleAbsPath);
  const baseBytes = source.readBytes(ruleRelPath);
  if (isErr(baseBytes)) {
    return err(
      new Error(
        `freeze rule '${ruleRelPath}' is unreadable at the pinned base — the rule cannot ` +
          `be bound to the evidence tree: ${baseBytes.error.message}`,
      ),
    );
  }
  if (!liveBytes.equals(Buffer.from(baseBytes.value))) {
    return err(
      new Error(
        `freeze rule '${ruleRelPath}' differs from the rule at the pinned base — a rule ` +
          'swap can reshape the sealed sample while passing every count; halting with ' +
          'nothing written',
      ),
    );
  }
  return ok(undefined);
}

/**
 * Write the manifest artefact, creating its parent directory. The write-time
 * TOCTOU guard re-canonicalises the out dir first
 * ({@link recheckOutDirContainment}): an ancestor swapped for a symlink after
 * the pre-scan canonicalisation, or an out dir that now escapes the repository,
 * is refused before any bytes. The fixed `sweep/` segment is then re-asserted
 * directly — a symlink at the write dir OR at the manifest path itself is
 * refused (the `refound-path-resolve.ts` posture) — and the write lands via an
 * exclusive same-directory temp file plus atomic rename, so an interruption can
 * never truncate an existing sealed manifest.
 */
export async function writeManifest(
  target: ManifestWriteTarget,
  manifest: WindowSampleManifest,
): Promise<Result<WindowSampleManifest, Error>> {
  const contained = recheckOutDirContainment(target);
  if (isErr(contained)) {
    return contained;
  }
  const manifestAbsPath = path.join(target.outDirAbs, WINDOW_SAMPLE_SEGMENT);
  const writeDirAbs = path.dirname(manifestAbsPath);
  const tempAbsPath = `${manifestAbsPath}.tmp-${String(process.pid)}`;
  try {
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
