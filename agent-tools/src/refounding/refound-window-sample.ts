#!/usr/bin/env node

import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { err, isErr, ok, type Result } from '@oaknational/result';

import { resolveRepoRoot } from '../core/repo-root.js';
import { writeErrorLine, writeLine } from '../core/terminal-output.js';
import { entryUsageText, parseEntryArgs } from './refound-entry-args.js';
import { DEFAULT_OUT_DIR, DEFAULT_RULE_PATH } from './refound-freeze-helpers.js';
import { resolveReadPathWithinRepo, resolveWriteTargetWithinRepo } from './refound-path-resolve.js';
import { makeGitByteSource } from './refound-window-sample-git.js';
import { DEFAULT_EVIDENCE_PATH, runWindowSample } from './refound-window-sample-helpers.js';
import { SHA40_PATTERN, WINDOW_SAMPLE_SEGMENT } from './refound-window-sample-schema.js';

/**
 * `refound-window-sample` — the zero-LLM batch-open computation for the S1
 * reader sample over NON-HIT sweep windows (batch `s1-reader-sample-b1`).
 *
 * Re-derives the sweep's scanned-file universe AT THE BASE COMMIT (never
 * the live tree), binds every count to the S1 deterministic-evidence
 * expectations, computes 500-line windows per universe file, and writes the
 * every-10th selection of the sorted non-hit windows to
 * `sweep/window-sample.v1.json` — byte-stable across runs. ANY arithmetic
 * disagreement with the expectations halts with nothing written (H8
 * posture). The computation lives in `refound-window-sample-model.ts` and
 * `refound-window-sample-universe.ts`; the IO orchestration in
 * `refound-window-sample-helpers.ts`; the artefact contracts in
 * `refound-window-sample-schema.ts`; the git-backed byte source this
 * `main()` wires (the composition root's seam) in
 * `refound-window-sample-git.ts`.
 *
 * Flags: `--base <40-hex sha>` (REQUIRED — the S1 evidence base),
 * `--rule <path>` (default `.agent/plans-refounding/freeze-rule.json`),
 * `--out <dir>` (default `.agent/plans-refounding`), and
 * `--evidence <path>` (default `proofs/s1-deterministic-evidence.v1.json`
 * under the artefact home) carrying the expected scanned-file / hit-file /
 * hit-line counts as machine-readable fields. All paths are constrained to the
 * repository with read/write-appropriate resolution
 * (`refound-path-resolve.ts`): the rule and the evidence must exist; the
 * out dir need not — the write phase creates it.
 *
 * @packageDocumentation
 */

const TOOL = 'refound-window-sample';
const repoRoot = resolveRepoRoot(import.meta.url);

/** The scanner state: flag defaults plus the required, not-yet-seen base. */
interface WindowSampleScanState {
  rulePath: string;
  outDir: string;
  evidencePath: string;
  baseSha: string | null;
}

/**
 * The parsed entry verdict: a run-nothing `help`, or the tool's flags with the
 * required base proven present. Entries MUST short-circuit `help` BEFORE any
 * path resolution (the shared `refound-entry-args.ts` contract).
 */
export type WindowSampleArgs =
  | { readonly help: true }
  | {
      readonly help: false;
      readonly rulePath: string;
      readonly outDir: string;
      readonly evidencePath: string;
      readonly baseSha: string;
    };

const INITIAL_SCAN_STATE: WindowSampleScanState = {
  rulePath: DEFAULT_RULE_PATH,
  outDir: DEFAULT_OUT_DIR,
  evidencePath: DEFAULT_EVIDENCE_PATH,
  baseSha: null,
};

/** The one usage line, shared by parser errors and the `--help` verdict. */
export function windowSampleUsageText(toolName: string): string {
  return entryUsageText(
    toolName,
    '--base <40-hex sha> [--rule <path>] [--out <dir>] [--evidence <path>]',
  );
}

/**
 * Parse `--rule` / `--out` / `--evidence` / `--base` (and `--help`/`-h`)
 * through the shared {@link parseEntryArgs} contract: the `--` terminator is
 * refused outright (so `--base <sha> -- --out x` can never silently ignore
 * `--out`), and `--help`/`-h` is a run-nothing verdict answered BEFORE the
 * required-base check. On a non-help parse `--base` must be present and a full
 * 40-hex commit sha (the universe is enumerated at that commit).
 */
export function parseWindowSampleArgs(
  argv: readonly string[],
  toolName = TOOL,
): Result<WindowSampleArgs, Error> {
  const parsed = parseEntryArgs(
    argv,
    windowSampleUsageText(toolName),
    { ...INITIAL_SCAN_STATE },
    {
      '--rule': (state, value) => {
        state.rulePath = value;
      },
      '--out': (state, value) => {
        state.outDir = value;
      },
      '--evidence': (state, value) => {
        state.evidencePath = value;
      },
      '--base': (state, value) => {
        state.baseSha = value;
      },
    },
  );
  if (isErr(parsed)) {
    return parsed;
  }
  if (parsed.value.help) {
    return ok({ help: true });
  }
  const { baseSha, rulePath, outDir, evidencePath } = parsed.value.state;
  if (baseSha === null) {
    return err(new Error('--base is required: the universe is enumerated at that commit'));
  }
  if (!SHA40_PATTERN.test(baseSha)) {
    return err(new Error(`--base must be a full 40-hex commit sha, got '${baseSha}'`));
  }
  return ok({ help: false, rulePath, outDir, evidencePath, baseSha });
}

/**
 * Resolve and constrain the flag paths against a repo root: the rule and
 * the evidence are READ targets (must exist and canonicalise); the out dir
 * is a WRITE target (need not exist — the write phase creates it, the
 * sweep's own posture). Exported for the integration behaviours.
 */
export function resolveWindowSamplePaths(
  rootAbs: string,
  args: { rulePath: string; outDir: string; evidencePath: string },
): Result<{ ruleAbsPath: string; outDirAbs: string; evidenceAbsPath: string }, Error> {
  const ruleAbsPath = resolveReadPathWithinRepo(rootAbs, args.rulePath);
  if (isErr(ruleAbsPath)) {
    return ruleAbsPath;
  }
  const evidenceAbsPath = resolveReadPathWithinRepo(rootAbs, args.evidencePath);
  if (isErr(evidenceAbsPath)) {
    return evidenceAbsPath;
  }
  const outDirAbs = resolveWriteTargetWithinRepo(rootAbs, args.outDir);
  if (isErr(outDirAbs)) {
    return outDirAbs;
  }
  return ok({
    ruleAbsPath: ruleAbsPath.value,
    outDirAbs: outDirAbs.value,
    evidenceAbsPath: evidenceAbsPath.value,
  });
}

async function main(): Promise<void> {
  const args = parseWindowSampleArgs(process.argv.slice(2), TOOL);
  if (isErr(args)) {
    writeErrorLine(`${TOOL}: ${args.error.message}`);
    process.exitCode = 1;
    return;
  }
  if (args.value.help) {
    writeLine(windowSampleUsageText(TOOL));
    return;
  }
  const paths = resolveWindowSamplePaths(repoRoot, args.value);
  if (isErr(paths)) {
    writeErrorLine(`${TOOL}: ${paths.error.message}`);
    process.exitCode = 1;
    return;
  }
  const run = await runWindowSample({
    repoRoot,
    baseSha: args.value.baseSha,
    makeByteSource: makeGitByteSource,
    ...paths.value,
  });
  if (isErr(run)) {
    writeErrorLine(`${TOOL}: ${run.error.message}`);
    process.exitCode = 1;
    return;
  }
  const { universe, sample } = run.value;
  writeLine(
    `${TOOL}: universe ${String(universe.files)} file(s) at base ` +
      `${run.value.base.slice(0, 12)}; ${String(universe.windows)} window(s) — ` +
      `${String(universe.hit_windows)} hit, ${String(universe.non_hit_windows)} non-hit; ` +
      `sampled ${String(sample.length)} window(s) into ${WINDOW_SAMPLE_SEGMENT} under ` +
      `${args.value.outDir}.`,
  );
}

/** True when this module is the process's CLI entry (repo-check.ts pattern). */
function isCliEntryPoint(): boolean {
  const entryPoint = process.argv[1];
  if (entryPoint === undefined) {
    return false;
  }
  return import.meta.url === pathToFileURL(path.resolve(entryPoint)).href;
}

if (isCliEntryPoint()) {
  await main();
}
