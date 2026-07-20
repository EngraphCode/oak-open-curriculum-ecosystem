#!/usr/bin/env node
/**
 * `pr-throughput` — the PDR-131 throughput register CLI.
 *
 * @remarks
 * Fitness-informational (ADR-144 three-zone model): the command ALWAYS exits
 * 0 — it reports trend, it never gates. Failures are printed loudly with the
 * contract named, so a red transport never masquerades as a quiet pass and
 * never blocks a chain. `--write` appends one dated row to the tracked
 * register; without it the row prints for inspection only.
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { writeErrorLine, writeLine } from '../core/terminal-output.js';
import { resolveGhPath, type GhCommandExecutor } from '../pr-watch/gh.js';

import { parsePrThroughputArgs, type PrThroughputOptions } from './cli-args.js';
import { assertWindowCovered, fetchMergedPrs } from './gh-fetch.js';
import { computeThroughput, formatRegisterRow, REGISTER_HEADER } from './index.js';

export { DEFAULT_REGISTER_PATH, parsePrThroughputArgs } from './cli-args.js';

/** IO seams; tests inject fakes, the entry point injects the real edges. */
export interface PrThroughputDeps {
  readonly executor: GhCommandExecutor;
  readonly resolveGh: (override?: string) => string;
  /** Create the register with the header, exclusively; false when it already exists. */
  readonly createRegister: (registerPath: string, header: string) => boolean;
  /** Append one row atomically (O_APPEND — never read-modify-overwrite). */
  readonly appendRegisterRow: (registerPath: string, row: string) => void;
  /** Error-line sink — injected so tests can verify failures print loudly. */
  readonly writeError: (message: string) => void;
}

/**
 * Run the report. Returns 0 in EVERY outcome (the informational contract);
 * failure text goes to stderr with the contract named so it reads loudly.
 */
export function runPrThroughput(argv: readonly string[], deps: PrThroughputDeps): number {
  let options: PrThroughputOptions;

  try {
    options = parsePrThroughputArgs(argv, new Date());
  } catch (cause) {
    return reportFailure(deps, cause);
  }

  // The informational contract covers EVERYTHING downstream: a register
  // write failing on permissions must still exit 0 with the loud message.
  try {
    return runWithOptions(options, deps);
  } catch (cause) {
    return reportFailure(deps, cause);
  }
}

function runWithOptions(options: PrThroughputOptions, deps: PrThroughputDeps): number {
  let ghPath: string;

  try {
    ghPath = deps.resolveGh(options.ghOverride);
  } catch (cause) {
    return reportFailure(deps, cause);
  }

  const covered = fetchCoveredCorpus(options, deps, ghPath);

  if (!covered.ok) {
    return reportFailure(deps, covered.error);
  }

  const report = computeThroughput(covered.value, {
    windowDays: options.windowDays,
    now: options.now,
  });
  const row = formatRegisterRow(report, { note: options.note });

  writeLine(row);
  writeLine(
    `pr-throughput: ${report.mergedCount} merges in ${report.windowDays}d ` +
      `(${report.excludedDraftCount} draft + ${report.excludedCoordinationCount} coordination excluded)`,
  );

  if (options.write) {
    deps.createRegister(options.registerPath, REGISTER_HEADER);
    deps.appendRegisterRow(options.registerPath, `${row}\n`);
    writeLine(`pr-throughput: row appended to ${options.registerPath}`);
  }

  return 0;
}

/**
 * Fetch the merge-date-bounded corpus (day precision over-fetches slightly;
 * computeThroughput re-filters against the exact instant) and refuse a
 * cap-hit corpus that cannot prove window coverage.
 */
function fetchCoveredCorpus(
  options: PrThroughputOptions,
  deps: PrThroughputDeps,
  ghPath: string,
): ReturnType<typeof fetchMergedPrs> {
  const windowStartMs = options.now.getTime() - options.windowDays * 24 * 60 * 60_000;
  const corpus = fetchMergedPrs({
    executor: deps.executor,
    ghPath,
    limit: options.limit,
    mergedSinceDate: new Date(windowStartMs).toISOString().slice(0, 10),
  });

  if (!corpus.ok) {
    return corpus;
  }

  return assertWindowCovered({
    prs: corpus.value,
    limit: options.limit,
    windowDays: options.windowDays,
  });
}

function reportFailure(deps: Pick<PrThroughputDeps, 'writeError'>, cause: unknown): number {
  const message = cause instanceof Error ? cause.message : String(cause);
  deps.writeError(
    `pr-throughput: FAILED — ${message} (fitness-informational contract: exit 0, nothing gated)`,
  );

  return 0;
}

function realDeps(): PrThroughputDeps {
  return {
    executor: (file, args, options) => execFileSync(file, [...args], options),
    resolveGh: (override) => resolveGhPath(override),
    createRegister: (registerPath, header) => {
      mkdirSync(path.dirname(registerPath), { recursive: true });
      try {
        // 'wx' is exclusive creation: a concurrent creator loses the race
        // here and falls through to append-only, never overwriting.
        writeFileSync(registerPath, header, { flag: 'wx' });
        return true;
      } catch (cause) {
        if (cause instanceof Error && 'code' in cause && cause.code === 'EEXIST') {
          return false;
        }

        // EACCES/ENOSPC/anything else is a REAL failure: rethrow into the
        // contract-wide catch (loud message, exit 0) instead of appending
        // to a register that may not exist or be partial.
        throw cause;
      }
    },
    appendRegisterRow: (registerPath, row) => {
      appendFileSync(registerPath, row);
    },
    writeError: writeErrorLine,
  };
}

function isCliEntryPoint(): boolean {
  const entryPoint = process.argv[1];

  if (entryPoint === undefined) {
    return false;
  }

  return import.meta.url === pathToFileURL(path.resolve(entryPoint)).href;
}

if (isCliEntryPoint()) {
  process.exitCode = runPrThroughput(process.argv.slice(2), realDeps());
}
