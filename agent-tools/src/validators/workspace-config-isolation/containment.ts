/**
 * Leg (a) of the workspace-config-isolation validator: the containment
 * classes a dependency resolver structurally cannot see.
 *
 * @remarks
 * Static import/export containment of config files is enforced by the
 * dependency-cruiser rules `workspace-config-containment` and
 * `workspace-config-no-phantom-deps` in the root `.dependency-cruiser.mjs`
 * (owner ruling 2026-08-09: a dependency check runs on a dependency
 * resolver, never textual pattern-matching). This module owns the
 * remainder — probe-verified 2026-08-10 to be invisible to the resolver:
 * the `resolve(dirname(fileURLToPath(import.meta.url)), '<literal>')`
 * path-arithmetic shape (a relative escape that is runtime path building,
 * not an import), and the refusal channel for non-literal dynamic imports
 * and non-literal path arithmetic, which are UNANALYSABLE and fail loud
 * rather than silently passing.
 *
 * Containment is a DIRECTORY question, so the check never resolves to a
 * real file: no extension mapping, no index resolution, no `exports`-map
 * handling, no `realpathSync` (a lexical verdict is identical on every
 * checkout). Root-owned config files (owner `''`) pass trivially — every
 * relative reach from the repo root stays inside it.
 *
 * @packageDocumentation
 */

import path from 'node:path';

import { stripComments } from './comment-stripping.js';
import { lineOf } from './text-position.js';

/** One relative reach that leaves its owning workspace. */
export interface EscapeFinding {
  readonly file: string;
  readonly line: number;
  readonly specifier: string;
  /** Repo-relative lexical resolution of the specifier. */
  readonly resolved: string;
  /** Repo-relative owning workspace dir; `''` is the repo root. */
  readonly owner: string;
}

/** A construct the lexical scan cannot analyse; always surfaced, never skipped. */
export interface UnanalysableFinding {
  readonly file: string;
  readonly line: number;
  readonly reason: string;
}

/** The two finding streams one file scan produces. */
export interface ContainmentScan {
  readonly escapes: readonly EscapeFinding[];
  readonly unanalysable: readonly UnanalysableFinding[];
}

const CONFIG_FILE_BASENAME =
  /^(?:vitest|tsup|eslint|stryker)(?:\.[\w-]+)*\.config\.(?:ts|mts|cts|js|mjs|cjs)$/;

/**
 * Is this repo-relative path a workspace tooling config file in scope?
 *
 * @remarks The vitest family is a glob by design: `vitest.e2e.config.ts`,
 * `vitest.smoke.config.ts`, and `vitest.experiment.config.ts` all carry
 * real escapes today and a literal `vitest.config.ts` match would
 * silently exempt them. Declaration files never match.
 */
export function isWorkspaceConfigFile(filePath: string): boolean {
  const base = path.posix.basename(filePath);
  if (base.endsWith('.d.ts')) {
    return false;
  }
  return CONFIG_FILE_BASENAME.test(base);
}

/**
 * Expand `pnpm-workspace.yaml` member entries into repo-relative
 * workspace directories, using the tracked-file list as the directory
 * source of truth (a directory is a member candidate iff it holds a
 * tracked `package.json`).
 *
 * @remarks Supports the two shapes the manifest uses: literal
 * directories and single-level `<prefix>/*` globs. A literal entry is
 * kept only when its `package.json` is tracked — a stale manifest line
 * must not manufacture a phantom owner.
 */
export function expandWorkspaceGlobs(
  entries: readonly string[],
  trackedFiles: readonly string[],
): readonly string[] {
  const packageDirs = new Set(
    trackedFiles
      .filter((file) => path.posix.basename(file) === 'package.json')
      .map((file) => path.posix.dirname(file)),
  );

  const dirs = entries.flatMap((entry) => {
    if (entry.endsWith('/*')) {
      const prefix = entry.slice(0, -2);
      return [...packageDirs].filter((dir) => path.posix.dirname(dir) === prefix);
    }
    return packageDirs.has(entry) ? [entry] : [];
  });
  return [...dirs].sort((a, b) => a.localeCompare(b));
}

/**
 * The owning workspace of a repo-relative file: the longest member
 * directory that path-prefixes it (`''` = repo root).
 *
 * @remarks Longest-prefix matters: a workspace member can be nested
 * inside a non-member directory (the research-evidence case), and a
 * plain first-match would mis-assign it. The prefix test is
 * boundary-aware — `packages/core/result` does not own
 * `packages/core/result-extras/`.
 */
export function resolveOwner(workspaceDirs: readonly string[], filePath: string): string {
  let owner = '';
  for (const dir of workspaceDirs) {
    if (filePath.startsWith(`${dir}/`) && dir.length > owner.length) {
      owner = dir;
    }
  }
  return owner;
}

interface ScanContext {
  readonly file: string;
  readonly owner: string;
  readonly fileDir: string;
  readonly content: string;
}

const DYNAMIC_IMPORT = /import\s*\(\s*(['"]?)/g;
const PATH_ARITHMETIC =
  /resolve\(\s*dirname\(\s*fileURLToPath\(\s*import\.meta\.url\s*\)\s*\)\s*,\s*(['"]?)([^'")\n]*)['"]?\s*\)/g;

function escapeAt(
  context: ScanContext,
  index: number,
  specifier: string,
): EscapeFinding | undefined {
  const resolved = path.posix.normalize(path.posix.join(context.fileDir, specifier));
  const rel = path.posix.relative(context.owner, resolved);
  if (!rel.startsWith('..') && !path.posix.isAbsolute(rel)) {
    return undefined;
  }
  return {
    file: context.file,
    line: lineOf(context.content, index),
    specifier,
    resolved,
    owner: context.owner,
  };
}

function scanDynamicImports(context: ScanContext): readonly UnanalysableFinding[] {
  const findings: UnanalysableFinding[] = [];
  for (const match of context.content.matchAll(DYNAMIC_IMPORT)) {
    if (match[1] === '') {
      findings.push({
        file: context.file,
        line: lineOf(context.content, match.index),
        reason: 'dynamic import with a non-literal argument cannot be containment-checked',
      });
    }
  }
  return findings;
}

function scanPathArithmetic(context: ScanContext): ContainmentScan {
  const escapes: EscapeFinding[] = [];
  const unanalysable: UnanalysableFinding[] = [];
  for (const match of context.content.matchAll(PATH_ARITHMETIC)) {
    if (match[1] === '') {
      unanalysable.push({
        file: context.file,
        line: lineOf(context.content, match.index),
        reason:
          'import.meta.url path arithmetic with a non-literal target cannot be containment-checked',
      });
      continue;
    }
    const finding = escapeAt(context, match.index, match[2] ?? '');
    if (finding !== undefined) {
      escapes.push(finding);
    }
  }
  return { escapes, unanalysable };
}

/**
 * Scan one config file's content for the resolver-invisible escape
 * classes: literal path arithmetic (containment-checked lexically) and
 * non-literal constructs (refused).
 *
 * @remarks Lexical only: a literal target is resolved with `path.posix`
 * against the file's directory and compared against the owner directory.
 * Static import/export specifiers are deliberately NOT scanned here —
 * dependency-cruiser owns them (see the module remark).
 */
export function findConfigEscapes(input: {
  readonly file: string;
  readonly content: string;
  readonly owner: string;
}): ContainmentScan {
  const context: ScanContext = {
    file: input.file,
    owner: input.owner,
    fileDir: path.posix.dirname(input.file),
    content: stripComments(input.content),
  };
  const arithmetic = scanPathArithmetic(context);
  return {
    escapes: arithmetic.escapes,
    unanalysable: [...scanDynamicImports(context), ...arithmetic.unanalysable],
  };
}

/**
 * Is the scan's input set degenerate — zero workspaces or zero config
 * files?
 *
 * @remarks A manifest-shape change (`packages/*\/*` tidying, a rename of
 * the config-file family) can silently empty the scan set; a validator
 * printing success over nothing checked is the silent-fallback class
 * this estate bans, so the bin refuses (exit 2) instead of passing.
 */
export function isDegenerateScan(input: {
  readonly workspaceCount: number;
  readonly configFileCount: number;
}): boolean {
  return input.workspaceCount === 0 || input.configFileCount === 0;
}
