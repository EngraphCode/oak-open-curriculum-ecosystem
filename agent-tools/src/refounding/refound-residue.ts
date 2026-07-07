#!/usr/bin/env node

import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { err, isErr, ok, type Result } from '@oaknational/result';
import { assertPathWithinBase } from '@oaknational/safe-path';

import { scanArgs } from '../core/cli-arg-parser.js';
import { resolveRepoRoot } from '../core/repo-root.js';
import { writeErrorLine, writeLine } from '../core/terminal-output.js';
import { DEFAULT_OUT_DIR } from './refound-freeze-helpers.js';
import { runResidue } from './refound-residue-helpers.js';
import { RESIDUE_BASENAME } from './refound-residue-model.js';

/**
 * `refound-residue` — the anchored-block residue audit over the frozen plan
 * corpus (F1 §5 row 4, §9).
 *
 * Clusters every line-inventoried frozen file into anchored blocks (anchor =
 * inventory line; block = anchor + following non-anchor lines; pre-first-
 * anchor lines = file preamble; fenced content clusters to its opening
 * fence) and applies the G1-ratified orphan-candidate rules, writing
 * `residue.v1.report.json`. Orphan candidates are an F3 adjudication queue —
 * a disposition candidate is never an automatic loss. A ZERO-orphan result
 * is only acceptable alongside a committed discrimination proof
 * (`refound-plant-orphan`), and the acceptance is MECHANICAL: a zero-orphan
 * run without `proofs/orphan-discrimination.v1.md` exits non-zero with
 * nothing written.
 *
 * Flags: `--out <dir>` (default `.agent/plans-refounding`), constrained to
 * the repository (`@oaknational/safe-path`).
 *
 * @packageDocumentation
 */

const TOOL = 'refound-residue';
const repoRoot = resolveRepoRoot(import.meta.url);

/** Parse `--out <dir>` via the shared {@link scanArgs} scanner. */
function parseResidueArgs(argv: readonly string[]): Result<{ outDir: string }, Error> {
  const scanned = scanArgs(
    argv,
    { outDir: DEFAULT_OUT_DIR },
    {
      flags: {},
      valueOptions: {
        '--out': (state, value) => {
          state.outDir = value;
        },
      },
      helpText: 'usage: refound-residue [--out <dir>]',
    },
  );
  if (!scanned.ok) {
    return err(new Error(scanned.error));
  }
  return ok({ outDir: scanned.state.outDir });
}

/** Constrain the artefact home (which must exist to be auditable) to the repo. */
function resolveOutDir(outDirFlag: string): Result<string, Error> {
  try {
    return ok(assertPathWithinBase(path.resolve(repoRoot, outDirFlag), repoRoot));
  } catch (cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return err(new Error(message));
  }
}

async function main(): Promise<void> {
  const args = parseResidueArgs(process.argv.slice(2));
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
  const summary = await runResidue({ outDirAbs: outDirAbs.value });
  if (isErr(summary)) {
    writeErrorLine(`${TOOL}: ${summary.error.message}`);
    process.exitCode = 1;
    return;
  }
  writeLine(
    `${TOOL}: ${String(summary.value.files)} file(s) clustered into ` +
      `${String(summary.value.blocks)} block(s); ` +
      `${String(summary.value.orphanCandidates)} orphan candidate(s); ` +
      `wrote ${RESIDUE_BASENAME} under ${args.value.outDir}.`,
  );
  if (summary.value.orphanCandidates === 0) {
    writeLine(
      `${TOOL}: ZERO orphan candidates — accepted alongside the committed ` +
        `proofs/orphan-discrimination.v1.md (F1 §9; the run refuses a zero without it).`,
    );
  }
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
