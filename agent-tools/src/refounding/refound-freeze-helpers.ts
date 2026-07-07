import path from 'node:path';

import { err, ok, type Result } from '@oaknational/result';

import { scanArgs } from '../core/cli-arg-parser.js';
import {
  compareByCodeUnit,
  type Denominator,
  type DenominatorFile,
  type InventoryMode,
} from './refounding-artefacts.js';

/**
 * Pure logic for `refound-freeze` (F1 §5 row 1): flag parsing, source→frozen
 * path mapping, denominator building, and the verified gitleaks invocation
 * shape. The filesystem-touching orchestration lives in the sibling
 * `refound-freeze-runner.ts`; the entry point owns I/O wiring and the exit
 * code.
 *
 * @packageDocumentation
 */

/** Default rule location (F1 §2). */
export const DEFAULT_RULE_PATH = '.agent/plans-refounding/freeze-rule.json';

/** Default artefact home (F1 §3). */
export const DEFAULT_OUT_DIR = '.agent/plans-refounding';

/** Frozen-tree segment under the artefact home; `archive/` rides existing gate exclusions (F1 D6). */
export const FROZEN_TREE_SEGMENT = 'archive/frozen-v1';

/** Denominator artefact basename. */
export const DENOMINATOR_BASENAME = 'denominator.v1.json';

/** Freeze-identity proof path relative to the artefact home. */
export const IDENTITY_PROOF_SEGMENT = 'proofs/freeze-identity.v1.json';

/**
 * Every probe and sweep excludes the instrument's own artefacts from its scan
 * scope by construction (F1 §8.4) — the freeze never enumerates its own
 * output homes even under a covering glob.
 */
export const INSTRUMENT_EXCLUDE_GLOBS: readonly string[] = [
  '.agent/plans-refounding/**',
  'agent-tools/src/refounding/**',
];

/** Parsed CLI flags for `refound-freeze` (paths as given; the entry resolves them). */
export interface FreezeArgs {
  readonly rulePath: string;
  readonly outDir: string;
}

/**
 * Parse `--rule <path>` / `--out <dir>` from argv via the shared
 * {@link scanArgs} scanner. Unknown or dangling flags are errors, never
 * ignored. Shared by `refound-freeze` and `refound-merge-recheck` (the two
 * rule-plus-out entries); `toolName` labels the usage line.
 */
export function parseFreezeArgs(
  argv: readonly string[],
  toolName = 'refound-freeze',
): Result<FreezeArgs, Error> {
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
      helpText: `usage: ${toolName} [--rule <path>] [--out <dir>]`,
    },
  );
  if (!scanned.ok) {
    return err(new Error(scanned.error));
  }
  return ok({ rulePath: scanned.state.rulePath, outDir: scanned.state.outDir });
}

/**
 * Map a repo-root-relative source path to its frozen-tree-relative mirror:
 * one leading `.agent/` segment is stripped (`.agent/plans/x` → `plans/x`,
 * F1 §3); paths outside `.agent/` mirror unchanged.
 */
export function frozenRelPath(sourceRelPath: string): string {
  const prefix = '.agent/';
  return sourceRelPath.startsWith(prefix) ? sourceRelPath.slice(prefix.length) : sourceRelPath;
}

/**
 * Map every source path to its frozen mirror, refusing when two distinct
 * sources collide onto one frozen path — a collision would make the
 * frozen→source inverse ambiguous and silently overwrite a copy.
 *
 * @returns source-relative → frozen-relative path map, insertion-ordered by
 *   the (sorted) input.
 */
export function mapSourcesToFrozen(
  sourceRelPaths: readonly string[],
): Result<ReadonlyMap<string, string>, Error> {
  const bySource = new Map<string, string>();
  const byFrozen = new Map<string, string>();
  for (const sourcePath of sourceRelPaths) {
    const frozenPath = frozenRelPath(sourcePath);
    const existing = byFrozen.get(frozenPath);
    if (existing !== undefined) {
      return err(
        new Error(
          `source paths '${existing}' and '${sourcePath}' collide onto frozen path '${frozenPath}'`,
        ),
      );
    }
    byFrozen.set(frozenPath, sourcePath);
    bySource.set(sourcePath, frozenPath);
  }
  return ok(bySource);
}

/**
 * Enumeration matches that escape the repository: absolute paths or paths
 * containing a `..` segment. tinyglobby returns BOTH shapes for parent or
 * absolute globs (probed empirically, 2026-07-07) — a ratified rule cannot
 * grant out-of-repo reach, so any such match is a refusal, never a copy.
 */
export function findEscapingMatches(matches: readonly string[]): readonly string[] {
  return matches.filter((match) => path.isAbsolute(match) || match.split('/').includes('..'));
}

/**
 * Resolve one copy destination and assert it stays strictly inside the
 * frozen tree — the write-sink half of the glob-escape defence (a crafted
 * traversal in a frozen path can never place bytes outside the tree).
 */
export function resolveCopySink(frozenRootAbs: string, frozenPath: string): Result<string, Error> {
  const sinkAbs = path.resolve(frozenRootAbs, frozenPath);
  if (sinkAbs === frozenRootAbs || !sinkAbs.startsWith(`${frozenRootAbs}${path.sep}`)) {
    return err(new Error(`copy sink for '${frozenPath}' escapes the frozen tree — refusing`));
  }
  return ok(sinkAbs);
}

/**
 * Refuse out-dir choices that can never be a safe artefact home: the
 * repository root itself, or anything inside `.git`.
 */
export function validateOutDirChoice(repoRoot: string, outDirAbs: string): Result<void, Error> {
  if (outDirAbs === repoRoot) {
    return err(new Error('--out must not be the repository root itself'));
  }
  const gitDirAbs = path.join(repoRoot, '.git');
  if (outDirAbs === gitDirAbs || outDirAbs.startsWith(`${gitDirAbs}${path.sep}`)) {
    return err(new Error('--out must not resolve inside .git'));
  }
  return ok(undefined);
}

/** Per-file identity captured while copying, used to build the denominator. */
export interface FrozenFileStat {
  readonly path: string;
  readonly bytes: number;
  readonly sha256: string;
  readonly lines: number;
  readonly inventoryMode: InventoryMode;
}

/** Sort stats by frozen path in UTF-16 code-unit order (the determinism contract). */
export function sortStatsByPath(stats: readonly FrozenFileStat[]): readonly FrozenFileStat[] {
  return [...stats].sort((a, b) => compareByCodeUnit(a.path, b.path));
}

/**
 * Build the denominator from per-file stats: files sorted by frozen path in
 * UTF-16 code-unit order (locale-independent — part of the byte-determinism
 * contract) and totals summed in code.
 */
export function buildDenominator(input: {
  readonly freezeRuleVersion: number;
  readonly ratifiedBy: string;
  readonly files: readonly FrozenFileStat[];
}): Denominator {
  const files: DenominatorFile[] = sortStatsByPath(input.files).map((stat) => ({
    path: stat.path,
    bytes: stat.bytes,
    sha256: stat.sha256,
    lines: stat.lines,
    inventory_mode: stat.inventoryMode,
  }));
  let lines = 0;
  let bytes = 0;
  for (const file of files) {
    lines += file.lines;
    bytes += file.bytes;
  }
  return {
    version: 1,
    generatedFrom: {
      freezeRuleVersion: input.freezeRuleVersion,
      ratifiedBy: input.ratifiedBy,
    },
    files,
    totals: { files: files.length, lines, bytes },
  };
}

/**
 * Argv for one single-file gitleaks scan, verified empirically on gitleaks
 * 8.30.1 (2026-07-06):
 *
 * - `dir <path>` scans exactly that file. Passing MULTIPLE positional paths
 *   is a silent foot-gun — gitleaks then scans the working directory instead
 *   of the listed files — so production spawns one process per file.
 * - `--config .gitleaks.toml` is passed explicitly (with the repo root as
 *   cwd) because config auto-discovery keys off the TARGET path, which for a
 *   single-file scan is the file, not the repo; repo-relative target paths
 *   keep the config's path-scoped allowlists effective.
 * - `--exit-code 99` discriminates a leak (99) from both a clean scan (0)
 *   and a runtime failure (any other status).
 * - A missing target exits 0 ("clean") — callers must only pass paths that
 *   exist (the freeze enumerates via glob, so they do).
 */
export function buildGitleaksDirArgs(relPath: string): readonly string[] {
  return [
    'dir',
    relPath,
    '--config',
    '.gitleaks.toml',
    '--no-banner',
    '--redact=100',
    '--exit-code',
    '99',
    '--log-level',
    'error',
  ];
}

/** Exit status a {@link buildGitleaksDirArgs} scan returns on a leak. */
export const GITLEAKS_LEAK_EXIT_CODE = 99;

/**
 * The secret-scan seam (F1 §8.3): receives the FULL absolute source file set
 * and resolves `err` on any hit or scanner failure. It runs BEFORE any copy
 * is written; a hit is an owner escalation, never a skip.
 */
export type SecretScan = (absFilePaths: readonly string[]) => Promise<Result<void, Error>>;
