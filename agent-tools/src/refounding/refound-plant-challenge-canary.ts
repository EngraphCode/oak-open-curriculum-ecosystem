#!/usr/bin/env node

import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { err, isErr, ok, type Result } from '@oaknational/result';

import { scanArgs, type ValueHandler } from '../core/cli-arg-parser.js';
import { resolveRepoRoot } from '../core/repo-root.js';
import { writeErrorLine, writeLine } from '../core/terminal-output.js';
import {
  CANARY_USAGE,
  runPlantMode,
  runScoreMode,
  runSealMode,
  type CanaryArgs,
} from './refound-challenge-modes.js';
import { DEFAULT_OUT_DIR } from './refound-freeze-helpers.js';

/**
 * `refound-plant-challenge-canary` — the P4/B1/M5 sealed planted-loss
 * tooling for every batch's challenge stream.
 *
 * Modes:
 * - plant (`--ledger`, `--rate`, `--salt`, `--keys-out`): deterministically
 *   derive PLAUSIBLE-BUT-WRONG planted variants (binding re-pointed at a
 *   wrong but well-formed frozen span — never emptied) at the declared
 *   salted rate; write the challenge stream and the dispatcher-held key
 *   set. `--keys-out` is REQUIRED with no default adjacent to the stream:
 *   the keys (and the sealed salt) sit outside the challenge fleet's read
 *   scope.
 * - seal (`--keys`): commit sha256 of the key set's exact bytes BEFORE the
 *   batch (hash-commit-then-reveal).
 * - score (`--findings`, `--keys`): verify the revealed keys against the
 *   commitment (mismatch = refusal), then report caught/missed plants; the
 *   batch's challenge pass is acceptable ONLY if all plants were caught —
 *   any miss exits non-zero.
 *
 * Shared flags: `--out <dir>` (default `.agent/plans-refounding`; the
 * stream and commitment live under `<out>/challenge/`) and a
 * `--commitment <path>` override. All paths constrained to the repository.
 *
 * @packageDocumentation
 */

const TOOL = 'refound-plant-challenge-canary';
const repoRoot = resolveRepoRoot(import.meta.url);

/** The canary's value-option surface (module-level so the parser stays thin). */
const CANARY_VALUE_OPTIONS: Readonly<Record<string, ValueHandler<CanaryArgs>>> = {
  '--mode': (state, value) => {
    state.mode = value;
  },
  '--ledger': (state, value) => {
    state.ledgerPath = value;
  },
  '--rate': (state, value) => {
    state.rate = value;
  },
  '--salt': (state, value) => {
    state.salt = value;
  },
  '--out': (state, value) => {
    state.outDir = value;
  },
  '--keys-out': (state, value) => {
    state.keysOutPath = value;
  },
  '--keys': (state, value) => {
    state.keysPath = value;
  },
  '--commitment': (state, value) => {
    state.commitmentPath = value;
  },
  '--findings': (state, value) => {
    state.findingsPath = value;
  },
};

/** Parse the mode and per-mode flags via the shared {@link scanArgs} scanner. */
function parseCanaryArgs(argv: readonly string[]): Result<CanaryArgs, Error> {
  const scanned = scanArgs<CanaryArgs>(
    argv,
    {
      mode: '',
      ledgerPath: '',
      rate: '',
      salt: '',
      outDir: DEFAULT_OUT_DIR,
      keysOutPath: '',
      keysPath: '',
      commitmentPath: '',
      findingsPath: '',
    },
    { flags: {}, valueOptions: CANARY_VALUE_OPTIONS, helpText: CANARY_USAGE },
  );
  if (!scanned.ok) {
    return err(new Error(scanned.error));
  }
  if (!['plant', 'seal', 'score'].includes(scanned.state.mode)) {
    return err(new Error(`--mode must be plant, seal, or score\n\n${CANARY_USAGE}`));
  }
  return ok(scanned.state);
}

/** Dispatch the parsed args to their mode (membership validated at parse). */
function runMode(args: CanaryArgs): Promise<Result<string, Error>> {
  switch (args.mode) {
    case 'plant':
      return runPlantMode(repoRoot, args);
    case 'seal':
      return runSealMode(repoRoot, args);
    default:
      return runScoreMode(repoRoot, args);
  }
}

async function main(): Promise<void> {
  const args = parseCanaryArgs(process.argv.slice(2));
  if (isErr(args)) {
    writeErrorLine(`${TOOL}: ${args.error.message}`);
    process.exitCode = 1;
    return;
  }
  const outcome = await runMode(args.value);
  if (isErr(outcome)) {
    writeErrorLine(`${TOOL}: ${outcome.error.message}`);
    process.exitCode = 1;
    return;
  }
  writeLine(`${TOOL}: ${outcome.value}`);
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
