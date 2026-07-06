#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { err, isErr, ok, type Result } from '@oaknational/result';
import { assertPathWithinBase } from '@oaknational/safe-path';

import { resolveRepoRoot } from '../core/repo-root.js';
import { writeErrorLine, writeLine } from '../core/terminal-output.js';
import {
  buildGitleaksDirArgs,
  GITLEAKS_LEAK_EXIT_CODE,
  parseFreezeArgs,
  validateOutDirChoice,
  type FreezeArgs,
  type SecretScan,
} from './refound-freeze-helpers.js';
import { runFreeze } from './refound-freeze-runner.js';

/**
 * `refound-freeze` — the plan-corpus refounding's S0 conservation event
 * (F1 §5 row 1).
 *
 * Copies every file the ratified freeze rule marks `in` byte-verbatim under
 * `<out>/archive/frozen-v1/`, derives `denominator.v1.json`, and writes
 * `proofs/freeze-identity.v1.json`, refusing outright — nothing written —
 * when the rule is unratified, when the secret scan reports a hit, or when a
 * non-empty frozen tree already exists. The S0 commit itself is staged by
 * explicit pathspec by the operating agent; this script never runs git.
 *
 * Flags: `--rule <path>` (default `.agent/plans-refounding/freeze-rule.json`)
 * and `--out <dir>` (default `.agent/plans-refounding`), both constrained to
 * the repository (`@oaknational/safe-path`).
 *
 * @packageDocumentation
 */

const TOOL = 'refound-freeze';
const repoRoot = resolveRepoRoot(import.meta.url);

/**
 * Production secret scan: gitleaks in no-git `dir` mode, one process per
 * file with the repo root as cwd (see {@link buildGitleaksDirArgs} for the
 * empirically verified invocation shape and its foot-guns). Refuses when the
 * repo's `.gitleaks.toml` is absent rather than silently scanning with a
 * different rule set. Reports leaking FILES only — never finding contents.
 */
const gitleaksSecretScan: SecretScan = (absFilePaths) => {
  if (!existsSync(path.join(repoRoot, '.gitleaks.toml'))) {
    return Promise.resolve(
      err(new Error('secret scan cannot run: .gitleaks.toml not found at the repo root')),
    );
  }
  const leakingFiles: string[] = [];
  for (const absFilePath of absFilePaths) {
    const relPath = path.relative(repoRoot, absFilePath);
    // stderr is captured for failure diagnostics only; gitleaks runs with
    // --redact=100 and --log-level error, so it never carries finding bytes.
    const scan = spawnSync('gitleaks', [...buildGitleaksDirArgs(relPath)], {
      cwd: repoRoot,
      stdio: ['ignore', 'ignore', 'pipe'],
      encoding: 'utf8',
    });
    if (scan.error !== undefined) {
      return Promise.resolve(
        err(new Error(`secret scan failed to run gitleaks: ${scan.error.message}`)),
      );
    }
    if (scan.status === GITLEAKS_LEAK_EXIT_CODE) {
      leakingFiles.push(relPath);
    } else if (scan.status !== 0) {
      const stderrTail = scan.stderr.trim();
      return Promise.resolve(
        err(
          new Error(
            `secret scan failed on '${relPath}' (gitleaks exit ${String(scan.status)})` +
              (stderrTail === '' ? '' : `: ${stderrTail}`),
          ),
        ),
      );
    }
  }
  if (leakingFiles.length > 0) {
    return Promise.resolve(
      err(
        new Error(
          `secret scan found potential leaks in ${String(leakingFiles.length)} file(s): ` +
            `${leakingFiles.join(', ')} — owner escalation required, never a skip`,
        ),
      ),
    );
  }
  return Promise.resolve(ok(undefined));
};

/** Deepest ancestor of `absPath` (possibly itself) that exists on disk. */
function nearestExistingAncestor(absPath: string): string {
  let dir = absPath;
  while (!existsSync(dir)) {
    const parent = path.dirname(dir);
    if (parent === dir) {
      return dir;
    }
    dir = parent;
  }
  return dir;
}

/**
 * Resolve the out dir against the repo root and constrain it there WITHOUT
 * creating anything: a lexical containment check on the resolved path, then
 * the symlink-resolving assertion on the nearest EXISTING ancestor (a
 * symlinked ancestor pointing outside the repo is rejected before any later
 * `mkdir` could follow it). Directory creation is deferred to the freeze
 * runner's write phase, after every refusal has passed.
 */
function resolveOutDir(outDirFlag: string): Result<string, Error> {
  const outDirAbs = path.resolve(repoRoot, outDirFlag);
  if (outDirAbs !== repoRoot && !outDirAbs.startsWith(`${repoRoot}${path.sep}`)) {
    return err(new Error(`--out '${outDirFlag}' resolves outside the repository`));
  }
  const choiceVerdict = validateOutDirChoice(repoRoot, outDirAbs);
  if (isErr(choiceVerdict)) {
    return choiceVerdict;
  }
  try {
    assertPathWithinBase(nearestExistingAncestor(outDirAbs), repoRoot);
    return ok(outDirAbs);
  } catch (cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return err(new Error(message));
  }
}

/** Constrain the rule path (which must already exist) to the repository. */
function resolveRulePath(rulePathFlag: string): Result<string, Error> {
  try {
    return ok(assertPathWithinBase(path.resolve(repoRoot, rulePathFlag), repoRoot));
  } catch (cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return err(new Error(message));
  }
}

/** Resolve and constrain both flag-supplied paths against the repo root. */
function resolvePaths(args: FreezeArgs): Result<{ ruleAbsPath: string; outDirAbs: string }, Error> {
  const ruleAbsPath = resolveRulePath(args.rulePath);
  if (isErr(ruleAbsPath)) {
    return ruleAbsPath;
  }
  const outDirAbs = resolveOutDir(args.outDir);
  if (isErr(outDirAbs)) {
    return outDirAbs;
  }
  return ok({ ruleAbsPath: ruleAbsPath.value, outDirAbs: outDirAbs.value });
}

async function main(): Promise<void> {
  const args = parseFreezeArgs(process.argv.slice(2));
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
  const frozen = await runFreeze({
    repoRoot,
    ruleAbsPath: paths.value.ruleAbsPath,
    outDirAbs: paths.value.outDirAbs,
    secretScan: gitleaksSecretScan,
  });
  if (isErr(frozen)) {
    writeErrorLine(`${TOOL}: ${frozen.error.message}`);
    process.exitCode = 1;
    return;
  }
  writeLine(
    `${TOOL}: froze ${String(frozen.value.fileCount)} file(s), ` +
      `${String(frozen.value.totalLines)} line(s), ${String(frozen.value.totalBytes)} byte(s); ` +
      `denominator and freeze-identity proof written under ${args.value.outDir}.`,
  );
  writeLine(`${TOOL}: stage the S0 commit by explicit pathspec (the script never commits).`);
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
