#!/usr/bin/env node

import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { isErr, ok, type Result } from '@oaknational/result';
import { resolveRepoRoot } from '../core/repo-root.js';
import { writeErrorLine, writeLine } from '../core/terminal-output.js';
import { freezeUsageText, parseFreezeArgs, type FreezeArgs } from './refound-freeze-args.js';
import { runMergeRecheck, type MergeRecheckSummary } from './refound-merge-recheck-helpers.js';
import { ARRIVALS_BASENAME } from './refound-merge-recheck-model.js';
import { resolveReadPathWithinRepo } from './refound-path-resolve.js';

/**
 * `refound-merge-recheck` — denominator re-derivation against the live tree
 * (F1 D4, §5, §7).
 *
 * Recomputes the live source set per the ratified freeze rule, forward-maps
 * it into frozen coordinates, and classifies every delta against the
 * effective denominator (`v1 + all amendments`): unsanctioned `added` /
 * `modified` arrivals are RED (exit 1 — each halts the affected batch until
 * routed via the G3 table); `sanctioned` writes (v2 rule classes, P2) and
 * `deleted` originals (report-only, F1 §7) are reported, never RED.
 * Comparison is strict byte identity — banner-awareness is sanctioned-diff
 * classification with an EMPTY content-diff class set until the R2 F4
 * banner policy exists. Run after EVERY merge of `main` into the working
 * branch and at every stable point.
 *
 * Writes `arrivals.v1.report.json` (single writer, sorted, timestamp-free);
 * refusals write nothing. Flags: `--rule <path>` and `--out <dir>` (same
 * defaults as `refound-freeze`), both constrained to the repository
 * (`refound-path-resolve`).
 *
 * @packageDocumentation
 */

const TOOL = 'refound-merge-recheck';
const repoRoot = resolveRepoRoot(import.meta.url);

/** Constrain a flag-supplied path (which must exist) to the repository. */
function resolveWithinRepo(flagPath: string): Result<string, Error> {
  return resolveReadPathWithinRepo(repoRoot, flagPath);
}

/** Resolve and constrain both flag-supplied paths against the repo root. */
function resolvePaths(args: FreezeArgs): Result<{ ruleAbsPath: string; outDirAbs: string }, Error> {
  const ruleAbsPath = resolveWithinRepo(args.rulePath);
  if (isErr(ruleAbsPath)) {
    return ruleAbsPath;
  }
  const outDirAbs = resolveWithinRepo(args.outDir);
  if (isErr(outDirAbs)) {
    return outDirAbs;
  }
  return ok({ ruleAbsPath: ruleAbsPath.value, outDirAbs: outDirAbs.value });
}

/** The entry's decided verdict: the exit code and the exact operator lines. */
export interface MergeRecheckVerdict {
  readonly exitCode: number;
  readonly lines: readonly string[];
}

/**
 * Decide the recheck verdict — pure, so the exit-code contract is
 * unit-testable without capturing stdout: RED (any unsanctioned arrival) is
 * exit 1; OK is exit 0. The printer is the only IO.
 */
export function decideMergeRecheckVerdict(summary: MergeRecheckSummary): MergeRecheckVerdict {
  const counts =
    `${String(summary.added)} added, ${String(summary.modified)} modified; ` +
    `${String(summary.sanctioned)} sanctioned delta(s); ` +
    `${String(summary.deleted)} deletion(s) (report-only); ` +
    `report at ${ARRIVALS_BASENAME}.`;
  if (summary.red) {
    return {
      exitCode: 1,
      lines: [
        `${TOOL}: RED — unsanctioned arrival(s) on 'in' surfaces: ${counts} ` +
          'Each arrival halts the affected batch until routed (F1 §7 / the G3 table).',
      ],
    };
  }
  return {
    exitCode: 0,
    lines: [
      `${TOOL}: OK — live in-set of ${String(summary.liveFiles)} file(s) carries no ` +
        `unsanctioned arrivals: ${counts}`,
    ],
  };
}

/** Print the classified verdict; RED (unsanctioned arrivals) exits 1. */
function printSummary(summary: MergeRecheckSummary): void {
  const verdict = decideMergeRecheckVerdict(summary);
  for (const line of verdict.lines) {
    writeLine(line);
  }
  process.exitCode = verdict.exitCode;
}

async function main(): Promise<void> {
  const args = parseFreezeArgs(process.argv.slice(2), TOOL);
  if (isErr(args)) {
    writeErrorLine(`${TOOL}: ${args.error.message}`);
    process.exitCode = 1;
    return;
  }
  if (args.value.help) {
    writeLine(freezeUsageText(TOOL));
    return;
  }
  const paths = resolvePaths(args.value);
  if (isErr(paths)) {
    writeErrorLine(`${TOOL}: ${paths.error.message}`);
    process.exitCode = 1;
    return;
  }
  const summary = await runMergeRecheck({
    repoRoot,
    ruleAbsPath: paths.value.ruleAbsPath,
    outDirAbs: paths.value.outDirAbs,
  });
  if (isErr(summary)) {
    writeErrorLine(`${TOOL}: ${summary.error.message}`);
    process.exitCode = 1;
    return;
  }
  printSummary(summary.value);
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
