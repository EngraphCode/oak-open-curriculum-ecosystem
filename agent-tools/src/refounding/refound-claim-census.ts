#!/usr/bin/env node

import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { err, isErr, ok, type Result } from '@oaknational/result';
import { assertPathWithinBase } from '@oaknational/safe-path';

import { scanArgs, type ValueHandler } from '../core/cli-arg-parser.js';
import { resolveRepoRoot } from '../core/repo-root.js';
import { writeErrorLine, writeLine } from '../core/terminal-output.js';
import { CLAIM_CENSUS_BASENAME } from './refound-claim-census-model.js';
import { CLAIM_CENSUS_REPORT_BASENAME } from './refound-claim-census-report.js';
import { runClaimCensus, type ClaimCensusSummary } from './refound-claim-census-helpers.js';
import { DEFAULT_OUT_DIR } from './refound-freeze-helpers.js';

/**
 * `refound-claim-census` — verbatim status-value and completion-keyword
 * extraction over the FROZEN tree (R0a cycle 3).
 *
 * Reads the effective denominator (`v1 + all amendments`) and the frozen
 * copies it identifies — never live files — and writes
 * `claim-census.v1.jsonl` (verbatim captures with frozen `file:line`
 * locators and per-line digests) plus `claim-census.v1.report.json` (counted
 * summary). The census does NOT produce the claim-vs-derived divergence
 * report — that is r1's audit-mode run through R0b's engine.
 *
 * Flags: `--out <dir>` (the artefact home, default
 * `.agent/plans-refounding`; must already hold a freeze) and
 * `--status-mapping <path>` (optional: an OG-2-shaped versioned mapping
 * table, injected — the census is complete without it). Both paths are
 * constrained to the repository.
 *
 * @packageDocumentation
 */

const TOOL = 'refound-claim-census';
const repoRoot = resolveRepoRoot(import.meta.url);

const CENSUS_USAGE = 'usage: refound-claim-census [--out <dir>] [--status-mapping <path>]';

/** The parsed census CLI flags (empty string = flag not supplied). */
interface CensusArgs {
  outDir: string;
  statusMappingPath: string;
}

const CENSUS_VALUE_OPTIONS: Readonly<Record<string, ValueHandler<CensusArgs>>> = {
  '--out': (state, value) => {
    state.outDir = value;
  },
  '--status-mapping': (state, value) => {
    state.statusMappingPath = value;
  },
};

/** Parse the census flags via the shared {@link scanArgs} scanner. */
function parseCensusArgs(argv: readonly string[]): Result<CensusArgs, Error> {
  const scanned = scanArgs<CensusArgs>(
    argv,
    { outDir: DEFAULT_OUT_DIR, statusMappingPath: '' },
    { flags: {}, valueOptions: CENSUS_VALUE_OPTIONS, helpText: CENSUS_USAGE },
  );
  if (!scanned.ok) {
    return err(new Error(scanned.error));
  }
  return ok(scanned.state);
}

/** Constrain a flag-supplied path (which must exist) to the repository. */
function resolveWithinRepo(flagPath: string): Result<string, Error> {
  try {
    return ok(assertPathWithinBase(path.resolve(repoRoot, flagPath), repoRoot));
  } catch (cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return err(new Error(message));
  }
}

/** The entry's decided verdict: the exit code and the exact operator lines. */
export interface CensusVerdict {
  readonly exitCode: number;
  readonly lines: readonly string[];
}

/**
 * Decide the census verdict — pure, so the exit-code contract is
 * unit-testable without capturing stdout: a completed census is exit 0 (the
 * census reports, it does not judge); refusals never reach here.
 */
export function decideCensusVerdict(summary: ClaimCensusSummary): CensusVerdict {
  const mapping =
    summary.mapping === null
      ? 'no mapping table injected'
      : `${String(summary.mapping.verdicts)} verdict(s), ` +
        `${String(summary.mapping.unmapped)} UNMAPPED`;
  return {
    exitCode: 0,
    lines: [
      `${TOOL}: censused ${String(summary.records)} record(s) ` +
        `(${String(summary.statusLines)} status line(s), ` +
        `${String(summary.keywordLines)} completion-keyword line(s)) across ` +
        `${String(summary.files)} frozen file(s); ${mapping}; artefacts at ` +
        `${CLAIM_CENSUS_BASENAME} and ${CLAIM_CENSUS_REPORT_BASENAME}.`,
    ],
  };
}

/** Resolve and constrain both flag-supplied paths against the repo root. */
function resolvePaths(
  args: CensusArgs,
): Result<{ outDirAbs: string; mappingAbsPath: string | null }, Error> {
  const outDirAbs = resolveWithinRepo(args.outDir);
  if (isErr(outDirAbs)) {
    return outDirAbs;
  }
  if (args.statusMappingPath === '') {
    return ok({ outDirAbs: outDirAbs.value, mappingAbsPath: null });
  }
  const mappingAbsPath = resolveWithinRepo(args.statusMappingPath);
  if (isErr(mappingAbsPath)) {
    return mappingAbsPath;
  }
  return ok({ outDirAbs: outDirAbs.value, mappingAbsPath: mappingAbsPath.value });
}

async function main(): Promise<void> {
  const args = parseCensusArgs(process.argv.slice(2));
  if (isErr(args)) {
    writeErrorLine(`${TOOL}: ${args.error.message}`);
    process.exitCode = 1;
    return;
  }
  const paths = resolvePaths(args.value);
  if (isErr(paths)) {
    writeErrorLine(`${TOOL}: ${paths.error.message}`);
    process.exitCode = 1;
    return;
  }
  const summary = await runClaimCensus(paths.value);
  if (isErr(summary)) {
    writeErrorLine(`${TOOL}: ${summary.error.message}`);
    process.exitCode = 1;
    return;
  }
  const verdict = decideCensusVerdict(summary.value);
  for (const line of verdict.lines) {
    writeLine(line);
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
