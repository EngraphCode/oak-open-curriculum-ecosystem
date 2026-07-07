#!/usr/bin/env node

import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { err, isErr, ok, type Result } from '@oaknational/result';
import { scanArgs } from '../core/cli-arg-parser.js';
import { resolveRepoRoot } from '../core/repo-root.js';
import { writeErrorLine, writeLine } from '../core/terminal-output.js';
import { decideBatchStatusVerdict } from './refound-batch-status-model.js';
import { runBatchStatus } from './refound-batch-status-helpers.js';
import { DEFAULT_OUT_DIR } from './refound-freeze-helpers.js';
import { resolveReadPathWithinRepo } from './refound-path-resolve.js';

/**
 * `refound-batch-status` — the recomputed protocol dashboard (R0a cycle 4,
 * strictly last: pure in-process composition of the landed verifiers).
 *
 * Recomputes every stage from the artefacts themselves — the
 * `run-state.v1.json` cache is OVERWRITTEN, never read as truth
 * (`validators-must-recompute`) — and reports the stage lattice
 * `freeze ⊂ inventoried ⊂ tiled` per area, with absent artefacts as
 * explicit `not-reached` states. Any recomputed red or invalid stage exits
 * 1.
 *
 * Flags: `--out <dir>` (the artefact home, default
 * `.agent/plans-refounding`), constrained to the repository.
 *
 * @packageDocumentation
 */

const TOOL = 'refound-batch-status';
const repoRoot = resolveRepoRoot(import.meta.url);

/** Parse `--out <dir>` via the shared scanner. */
function parseBatchStatusArgs(argv: readonly string[]): Result<{ outDir: string }, Error> {
  const scanned = scanArgs<{ outDir: string }>(
    argv,
    { outDir: DEFAULT_OUT_DIR },
    {
      flags: {},
      valueOptions: {
        '--out': (state, value) => {
          state.outDir = value;
        },
      },
      helpText: 'usage: refound-batch-status [--out <dir>]',
    },
  );
  if (!scanned.ok) {
    return err(new Error(scanned.error));
  }
  return ok(scanned.state);
}

/** Constrain the artefact home (which must exist) to the repository. */
function resolveOutDir(outDirFlag: string): Result<string, Error> {
  return resolveReadPathWithinRepo(repoRoot, outDirFlag);
}

async function main(): Promise<void> {
  const args = parseBatchStatusArgs(process.argv.slice(2));
  if (isErr(args)) {
    writeErrorLine(`${TOOL}: ${args.error.message}`);
    process.exitCode = 1;
    return;
  }
  const outDirAbs = resolveOutDir(args.value.outDir);
  if (isErr(outDirAbs)) {
    writeErrorLine(`${TOOL}: ${outDirAbs.error.message}`);
    process.exitCode = 1;
    return;
  }
  const runState = await runBatchStatus({ outDirAbs: outDirAbs.value });
  if (isErr(runState)) {
    writeErrorLine(`${TOOL}: ${runState.error.message}`);
    process.exitCode = 1;
    return;
  }
  const verdict = decideBatchStatusVerdict(runState.value);
  for (const line of verdict.lines) {
    writeLine(`${TOOL}: ${line}`);
  }
  process.exitCode = verdict.exitCode;
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
