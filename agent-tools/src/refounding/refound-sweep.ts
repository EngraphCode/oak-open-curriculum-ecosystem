#!/usr/bin/env node

import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { err, isErr, ok, type Result } from '@oaknational/result';

import { scanArgs } from '../core/cli-arg-parser.js';
import { resolveRepoRoot } from '../core/repo-root.js';
import { writeErrorLine, writeLine } from '../core/terminal-output.js';
import { DEFAULT_OUT_DIR, DEFAULT_RULE_PATH } from './refound-freeze-helpers.js';
import { resolveReadPathWithinRepo, resolveWriteTargetWithinRepo } from './refound-path-resolve.js';
import { runSweep } from './refound-sweep-helpers.js';
import { SWEEP_HITS_SEGMENT } from './refound-sweep-model.js';

/**
 * `refound-sweep` — the Wave-0 non-terminal-marker net over the freeze
 * rule's `sweep`-verdict surfaces (F1 §5 row `refound-sweep`).
 *
 * Scans the LIVE sweep surfaces (old archive, prompts, thread records) with
 * the fixed G1-ratified marker set and writes verbatim hit lines to
 * `sweep/sweep-hits.v1.jsonl`. Hits are an F3 ADJUDICATION QUEUE — never
 * auto-promoted; a hit-bearing run exits 0. The instrument's own homes are
 * excluded from the scan by construction.
 *
 * Flags: `--rule <path>` (default `.agent/plans-refounding/freeze-rule.json`)
 * and `--out <dir>` (default `.agent/plans-refounding`), both constrained to
 * the repository with read/write-appropriate resolution
 * (`refound-path-resolve.ts`): the rule must exist; the out dir need not —
 * the sweep's write phase creates it.
 *
 * @packageDocumentation
 */

const TOOL = 'refound-sweep';
const repoRoot = resolveRepoRoot(import.meta.url);

/** Parse `--rule <path>` / `--out <dir>` via the shared {@link scanArgs} scanner. */
function parseSweepArgs(
  argv: readonly string[],
): Result<{ rulePath: string; outDir: string }, Error> {
  const scanned = scanArgs(
    argv,
    { rulePath: DEFAULT_RULE_PATH, outDir: DEFAULT_OUT_DIR },
    {
      flags: {},
      valueOptions: {
        '--rule': (state, value) => {
          state.rulePath = value;
        },
        '--out': (state, value) => {
          state.outDir = value;
        },
      },
      helpText: 'usage: refound-sweep [--rule <path>] [--out <dir>]',
    },
  );
  if (!scanned.ok) {
    return err(new Error(scanned.error));
  }
  return ok({ rulePath: scanned.state.rulePath, outDir: scanned.state.outDir });
}

/**
 * Resolve and constrain both flag-supplied paths against a repo root: the
 * rule is a READ target (must exist and canonicalise); the out dir is a
 * WRITE target (need not exist — `runSweep`'s write phase creates it, so a
 * leaf `realpath` here would refuse a fresh artefact home before the sweep
 * could create its own artefacts). Exported for the discrimination proof.
 */
export function resolveSweepPaths(
  rootAbs: string,
  args: { rulePath: string; outDir: string },
): Result<{ ruleAbsPath: string; outDirAbs: string }, Error> {
  const ruleAbsPath = resolveReadPathWithinRepo(rootAbs, args.rulePath);
  if (isErr(ruleAbsPath)) {
    return ruleAbsPath;
  }
  const outDirAbs = resolveWriteTargetWithinRepo(rootAbs, args.outDir);
  if (isErr(outDirAbs)) {
    return outDirAbs;
  }
  return ok({ ruleAbsPath: ruleAbsPath.value, outDirAbs: outDirAbs.value });
}

async function main(): Promise<void> {
  const args = parseSweepArgs(process.argv.slice(2));
  if (isErr(args)) {
    writeErrorLine(`${TOOL}: ${args.error.message}`);
    process.exitCode = 1;
    return;
  }
  const paths = resolveSweepPaths(repoRoot, args.value);
  if (isErr(paths)) {
    writeErrorLine(`${TOOL}: ${paths.error.message}`);
    process.exitCode = 1;
    return;
  }
  const summary = await runSweep({ repoRoot, ...paths.value });
  if (isErr(summary)) {
    writeErrorLine(`${TOOL}: ${summary.error.message}`);
    process.exitCode = 1;
    return;
  }
  writeLine(
    `${TOOL}: scanned ${String(summary.value.scannedFiles)} sweep-surface file(s); ` +
      `${String(summary.value.hits)} hit(s) queued in ${SWEEP_HITS_SEGMENT} under ` +
      `${args.value.outDir} (adjudication queue — hits are never auto-promoted).`,
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
