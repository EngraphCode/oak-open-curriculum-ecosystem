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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { writeErrorLine, writeLine } from '../core/terminal-output.js';
import { resolveGhPath, type GhCommandExecutor } from '../pr-watch/gh.js';

import { assertWindowCovered, fetchMergedPrs } from './gh-fetch.js';
import { buildRegisterContent, computeThroughput, formatRegisterRow } from './index.js';

export const DEFAULT_REGISTER_PATH = '.agent/reports/agentic-engineering/pr-throughput-register.md';

interface PrThroughputOptions {
  readonly windowDays: number;
  readonly limit: number;
  readonly write: boolean;
  readonly registerPath: string;
  readonly note: string;
  readonly now: Date;
  readonly ghOverride?: string;
}

/** IO seams; tests inject fakes, the entry point injects the real edges. */
export interface PrThroughputDeps {
  readonly executor: GhCommandExecutor;
  readonly resolveGh: (override?: string) => string;
  readonly readRegister: (registerPath: string) => string | undefined;
  readonly writeRegister: (registerPath: string, content: string) => void;
}

interface MutablePrThroughputOptions {
  windowDays: number;
  limit: number;
  write: boolean;
  registerPath: string;
  note: string;
  now: Date;
  ghOverride?: string;
}

/** Parse argv; unknown flags fail loud (a typo must never silently no-op). */
export function parsePrThroughputArgs(argv: readonly string[], now: Date): PrThroughputOptions {
  const options: MutablePrThroughputOptions = {
    windowDays: 7,
    limit: 200,
    write: false,
    registerPath: DEFAULT_REGISTER_PATH,
    note: '',
    now,
  };
  let index = 0;

  while (index < argv.length) {
    const flag = argv[index];
    const value = argv[index + 1];

    if (flag === '--write') {
      options.write = true;
      index += 1;
      continue;
    }

    if (value === undefined) {
      throw new Error(`${flag} requires a value`);
    }

    applyValueFlag(options, flag, value);
    index += 2;
  }

  return options;
}

function applyValueFlag(options: MutablePrThroughputOptions, flag: string, value: string): void {
  if (flag === '--window-days') {
    options.windowDays = parsePositiveInteger(flag, value);
  } else if (flag === '--limit') {
    options.limit = parsePositiveInteger(flag, value);
  } else if (flag === '--register') {
    options.registerPath = value;
  } else if (flag === '--note') {
    options.note = value;
  } else if (flag === '--now') {
    options.now = parseIsoDate(value);
  } else if (flag === '--gh') {
    options.ghOverride = value;
  } else {
    throw new Error(`unknown flag: ${flag}`);
  }
}

function parsePositiveInteger(flag: string, value: string): number {
  // Full-token validation: Number.parseInt would silently accept '7days',
  // '1.5', or '1e2' and report from a wrong-looking-right window.
  if (!/^\d+$/u.test(value)) {
    throw new Error(`${flag} requires a positive integer, got: ${value}`);
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${flag} requires a positive integer, got: ${value}`);
  }

  return parsed;
}

function parseIsoDate(value: string): Date {
  const parsed = Date.parse(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`--now requires an ISO date, got: ${value}`);
  }

  return new Date(parsed);
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
    return reportFailure(cause);
  }

  // The informational contract covers EVERYTHING downstream: a register
  // write failing on permissions must still exit 0 with the loud message.
  try {
    return runWithOptions(options, deps);
  } catch (cause) {
    return reportFailure(cause);
  }
}

function runWithOptions(options: PrThroughputOptions, deps: PrThroughputDeps): number {
  let ghPath: string;

  try {
    ghPath = deps.resolveGh(options.ghOverride);
  } catch (cause) {
    return reportFailure(cause);
  }

  const corpus = fetchMergedPrs({ executor: deps.executor, ghPath, limit: options.limit });

  if (!corpus.ok) {
    return reportFailure(corpus.error);
  }

  const covered = assertWindowCovered({
    prs: corpus.value,
    limit: options.limit,
    windowDays: options.windowDays,
    now: options.now,
  });

  if (!covered.ok) {
    return reportFailure(covered.error);
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
    const next = buildRegisterContent(deps.readRegister(options.registerPath), row);
    deps.writeRegister(options.registerPath, next);
    writeLine(`pr-throughput: row appended to ${options.registerPath}`);
  }

  return 0;
}

function reportFailure(cause: unknown): number {
  const message = cause instanceof Error ? cause.message : String(cause);
  writeErrorLine(
    `pr-throughput: FAILED — ${message} (fitness-informational contract: exit 0, nothing gated)`,
  );

  return 0;
}

function realDeps(): PrThroughputDeps {
  return {
    executor: (file, args, options) => execFileSync(file, [...args], options),
    resolveGh: (override) => resolveGhPath(override),
    readRegister: (registerPath) =>
      existsSync(registerPath) ? readFileSync(registerPath, 'utf8') : undefined,
    writeRegister: (registerPath, content) => {
      mkdirSync(path.dirname(registerPath), { recursive: true });
      writeFileSync(registerPath, content);
    },
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
