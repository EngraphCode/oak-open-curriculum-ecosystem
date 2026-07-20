/**
 * Argument parsing for the `pr-throughput` CLI — fail-loud by construction:
 * unknown flags, flag-shaped values, malformed integers, and non-ISO or
 * calendar-invalid `--now` overrides all refuse rather than silently
 * producing a valid-looking report for the wrong question.
 *
 * @packageDocumentation
 */
import { requireIsoDateTime } from '../core/iso-date-time.js';

export const DEFAULT_REGISTER_PATH = '.agent/reports/agentic-engineering/pr-throughput-register.md';

export interface PrThroughputOptions {
  readonly windowDays: number;
  readonly limit: number;
  readonly write: boolean;
  readonly registerPath: string;
  readonly note: string;
  readonly now: Date;
  readonly ghOverride?: string;
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

    // A flag-shaped token is a MISSING value, not a value: `--note --write`
    // would otherwise record '--write' as the note and silently disable the
    // requested write.
    if (value === undefined || value.startsWith('--')) {
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
  // Strict shape + calendar validation — Date.parse alone would let a
  // mistyped override write a valid-looking row for a different instant.
  return new Date(Date.parse(requireIsoDateTime(value, '--now')));
}
