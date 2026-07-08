#!/usr/bin/env node

import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { isErr } from '@oaknational/result';

import { writeErrorLine, writeLine } from '../core/terminal-output.js';
import { derivePlanState } from './plan-state-engine.js';
import { decideGateVerdict } from './plan-state-verdict.js';
import { loadInputs, parseArgs, writeReportIfRequested } from './plan-state-helpers.js';

/**
 * `plan-state` — the R0b recomputation gate (F5: one engine, two adapters);
 * a thin IO shell — every verdict decision is pure in `plan-state-engine.ts`
 * and the IO phase lives in `plan-state-helpers.ts`.
 *
 * Modes (exactly one): `--plan <path>` (repeatable; the PERMANENT gate over
 * V0/V0.1 plan frontmatter) or `--census <path>` (the DISPOSABLE audit mode
 * over `claim-census.v1.jsonl`; r1 feeds it from the frozen artefact home —
 * and it mechanically REFUSES the default table until OG-2 ratifies it).
 * `--status-mapping <path>` injects a versioned table (default: the in-code
 * `STATUS_MAPPING_TABLE_V1`); `--evidence <path>` injects recomputation
 * verdicts (a JSON array — the DI seam; executors are r1 machinery, deferred
 * by design); `--report <path>` writes the byte-stable report AFTER a
 * successful derivation only; every path is repo-constrained.
 *
 * @packageDocumentation
 */

const TOOL = 'plan-state';

/** Report one failure and set the process exit code. */
function fail(error: Error): void {
  writeErrorLine(`${TOOL}: ${error.message}`);
  process.exitCode = 1;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (isErr(args)) {
    fail(args.error);
    return;
  }
  const inputs = await loadInputs(args.value);
  if (isErr(inputs)) {
    fail(inputs.error);
    return;
  }
  const report = derivePlanState(inputs.value);
  if (isErr(report)) {
    fail(report.error);
    return;
  }
  const written = await writeReportIfRequested(args.value, report.value);
  if (isErr(written)) {
    fail(written.error);
    return;
  }
  const verdict = decideGateVerdict(report.value);
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
