#!/usr/bin/env node

import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { err, isErr, ok, type Result } from '@oaknational/result';
import { assertPathWithinBase } from '@oaknational/safe-path';

import { scanArgs } from '../core/cli-arg-parser.js';
import { resolveRepoRoot } from '../core/repo-root.js';
import { writeErrorLine, writeLine } from '../core/terminal-output.js';
import { DEFAULT_OUT_DIR } from './refound-freeze-helpers.js';
import { INVENTORY_BASENAME, NET_DIFF_BASENAME } from './refound-inventory-model.js';
import { runInventory } from './refound-inventory-runner.js';

/**
 * `refound-inventory` — the scripted line-level inventory over the frozen
 * plan corpus (F1 §4, §5 row 3).
 *
 * Runs the three overlapping deterministic nets (A structure, B rows, C
 * fixed keywords) over every `inventory_mode: lines` file the denominator
 * names, writing `inventory.v1.jsonl` (verbatim captures, sorted by
 * (file, line)) and `net-diff.v1.report.json` (per-net unique captures — the
 * omission-detector feed). Halts with the named H2 error, nothing written,
 * when the whole-corpus anchor ratio falls outside the 20–70% sanity band,
 * and on any line-recount disagreement with the denominator.
 *
 * Flags: `--out <dir>` (default `.agent/plans-refounding`), constrained to
 * the repository (`@oaknational/safe-path`).
 *
 * @packageDocumentation
 */

const TOOL = 'refound-inventory';
const repoRoot = resolveRepoRoot(import.meta.url);

/** Parse `--out <dir>` via the shared {@link scanArgs} scanner. */
function parseInventoryArgs(argv: readonly string[]): Result<{ outDir: string }, Error> {
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
      helpText: 'usage: refound-inventory [--out <dir>]',
    },
  );
  if (!scanned.ok) {
    return err(new Error(scanned.error));
  }
  return ok({ outDir: scanned.state.outDir });
}

/** Constrain the artefact home (which must exist to be scannable) to the repo. */
function resolveOutDir(outDirFlag: string): Result<string, Error> {
  try {
    return ok(assertPathWithinBase(path.resolve(repoRoot, outDirFlag), repoRoot));
  } catch (cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return err(new Error(message));
  }
}

async function main(): Promise<void> {
  const args = parseInventoryArgs(process.argv.slice(2));
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
  const summary = await runInventory({ outDirAbs: outDirAbs.value });
  if (isErr(summary)) {
    writeErrorLine(`${TOOL}: ${summary.error.message}`);
    process.exitCode = 1;
    return;
  }
  writeLine(
    `${TOOL}: scanned ${String(summary.value.mdFiles)} md file(s), ` +
      `${String(summary.value.mdLines)} line(s); ${String(summary.value.anchors)} anchor(s), ` +
      `ratio ${String(summary.value.anchorRatioPercent)}% (band 20%-70%).`,
  );
  writeLine(
    `${TOOL}: wrote ${INVENTORY_BASENAME} and ${NET_DIFF_BASENAME} under ${args.value.outDir}.`,
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
