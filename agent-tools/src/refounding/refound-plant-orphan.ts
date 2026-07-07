#!/usr/bin/env node

import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { err, isErr, ok, type Result } from '@oaknational/result';

import { scanArgs } from '../core/cli-arg-parser.js';
import { resolveRepoRoot } from '../core/repo-root.js';

import { writeErrorLine, writeLine } from '../core/terminal-output.js';
import { resolveReadPathWithinRepo } from './refound-path-resolve.js';
import { DEFAULT_OUT_DIR, DEFAULT_RULE_PATH } from './refound-freeze-helpers.js';
import { DISCRIMINATION_PROOF_SEGMENT } from './refound-plant-orphan-transcript.js';
import { runPlantOrphan } from './refound-plant-orphan-runner.js';

/**
 * `refound-plant-orphan` — the planted-defect discrimination proofs
 * (F1 §5 row 5, §9; plan P4).
 *
 * Stages SCRATCH COPIES (never the real frozen tree or live surfaces),
 * plants (1) an anchorless work-bearing 30-line preamble, (2) a
 * misspelt-Net-C-keyword work line plus its correctly-spelt control, and
 * (3) a MARKER-FREE work-bearing paraphrase on a sweep surface, then proves:
 * residue gains exactly one orphan at the planted coordinates; the misspelt
 * line lands in residue, not inventory, with the control shifting the
 * per-net diff by exactly one; and the sweep net is verifiably BLIND to the
 * marker-free plant while it sits in the copy. Success commits the
 * machine-readable + human transcript to `proofs/orphan-discrimination.v1.md`;
 * any failed proof exits non-zero with NO transcript.
 *
 * Flags: `--rule <path>` (default `.agent/plans-refounding/freeze-rule.json`)
 * and `--out <dir>` (default `.agent/plans-refounding`), both constrained to
 * the repository (`refound-path-resolve`).
 *
 * @packageDocumentation
 */

const TOOL = 'refound-plant-orphan';
const repoRoot = resolveRepoRoot(import.meta.url);

/** Parse `--rule <path>` / `--out <dir>` via the shared {@link scanArgs} scanner. */
function parsePlantArgs(
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
      helpText: 'usage: refound-plant-orphan [--rule <path>] [--out <dir>]',
    },
  );
  if (!scanned.ok) {
    return err(new Error(scanned.error));
  }
  return ok({ rulePath: scanned.state.rulePath, outDir: scanned.state.outDir });
}

/** Constrain a flag-supplied path to the repository. */
function resolveWithinRepo(flagPath: string): Result<string, Error> {
  return resolveReadPathWithinRepo(repoRoot, flagPath);
}

/** Resolve and constrain both flag-supplied paths against the repo root. */
function resolvePaths(args: {
  rulePath: string;
  outDir: string;
}): Result<{ ruleAbsPath: string; outDirAbs: string }, Error> {
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

async function main(): Promise<void> {
  const args = parsePlantArgs(process.argv.slice(2));
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
  const outcome = await runPlantOrphan({ repoRoot, ...paths.value });
  if (isErr(outcome)) {
    writeErrorLine(`${TOOL}: ${outcome.error.message}`);
    process.exitCode = 1;
    return;
  }
  writeLine(
    `${TOOL}: all three plants fired their detectors ` +
      `(preamble orphan at ${outcome.value.preamble.file}:1-` +
      `${String(outcome.value.preamble.lineEnd)}; keyword net-C shift ` +
      `${String(outcome.value.keyword.netCShift)}; sweep blind to the marker-free plant).`,
  );
  writeLine(
    `${TOOL}: transcript committed to ${DISCRIMINATION_PROOF_SEGMENT} under ${args.value.outDir}.`,
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
