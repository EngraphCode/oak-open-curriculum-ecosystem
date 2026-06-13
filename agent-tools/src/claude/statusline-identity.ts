#!/usr/bin/env node
/**
 * Claude Code statusline adapter.
 *
 * @remarks
 * Reads the JSON object Claude Code passes on stdin and prints a single
 * statusline of the form:
 *
 * ```text
 * <agent-identity> · <model> · ctx:N% · <branch>[*] · <dir or wt:worktree>
 * ```
 *
 * The agent-identity name (PDR-027) is produced by the built `agent-identity`
 * CLI at `agent-tools/dist/src/bin/agent-identity.js`. Git branch, dirty state,
 * and linked-worktree name are gathered from the working directory in the
 * payload. Formatting is delegated to the pure {@link renderStatusline}.
 *
 * The statusline is a soft surface: missing input, missing build artefact, or
 * any spawn failure degrades the affected segment to empty rather than
 * disrupting the session.
 *
 * @packageDocumentation
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseCollaborationRegistry } from '../collaboration-state/state-parsers.js';
import { type CollaborationRegistry } from '../collaboration-state/types.js';
import { planStatuslineExecution, type StatuslinePlan } from './statusline-identity-input.js';
import { renderStatusline } from './statusline-render.js';
import {
  parsePrimaryWorktreeRoot,
  resolveSessionShape,
  type ExperimentsEntry,
  type SessionShape,
} from './statusline-session-shape.js';

const builtIdentityCliPath = resolveBuiltIdentityCliPath();

let stdinBuffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  stdinBuffer += chunk;
});
process.stdin.on('end', () => {
  emitStatusline(stdinBuffer);
});

function emitStatusline(rawJson: string): void {
  const plan: StatuslinePlan = planStatuslineExecution(rawJson);
  if (plan.kind === 'noop') {
    return;
  }

  const cwd = plan.inputs.cwd ?? process.cwd();
  const git = gatherGitState(cwd);
  const identity = deriveIdentity(plan.inputs.seed);

  const line = renderStatusline({
    identity,
    dir: basename(cwd),
    branch: git.branch,
    dirty: git.dirty,
    worktree: git.worktree,
    usedPercentage: plan.inputs.usedPercentage,
    model: plan.inputs.model,
    sessionShape: gatherSessionShape(cwd, identity),
  });

  process.stdout.write(line);
}

function deriveIdentity(seed: string | undefined): string | undefined {
  if (seed === undefined || !existsSync(builtIdentityCliPath)) {
    return undefined;
  }
  const result = spawnSync(
    process.execPath,
    [builtIdentityCliPath, '--seed', seed, '--format', 'display'],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) {
    return undefined;
  }
  const name = result.stdout.trim();
  return name.length === 0 ? undefined : name;
}

interface GitState {
  readonly branch: string | undefined;
  readonly dirty: boolean;
  readonly worktree: string | undefined;
}

function gatherGitState(cwd: string): GitState {
  const branch =
    runGit(cwd, ['symbolic-ref', '--short', 'HEAD']) ??
    runGit(cwd, ['rev-parse', '--short', 'HEAD']);
  if (branch === undefined) {
    return { branch: undefined, dirty: false, worktree: undefined };
  }

  const dirty = (runGit(cwd, ['status', '--porcelain']) ?? '').length > 0;

  // In the main tree --git-dir and --git-common-dir are equal; in a linked
  // worktree they differ (.../.git/worktrees/<name> vs .../.git).
  const gitDir = runGit(cwd, ['rev-parse', '--git-dir']);
  const commonDir = runGit(cwd, ['rev-parse', '--git-common-dir']);
  const topLevel = runGit(cwd, ['rev-parse', '--show-toplevel']);
  const worktree =
    gitDir !== undefined && gitDir !== commonDir && topLevel !== undefined
      ? basename(topLevel)
      : undefined;

  return { branch, dirty, worktree };
}

function runGit(cwd: string, args: readonly string[]): string | undefined {
  const result = spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8' });
  if (result.status !== 0) {
    return undefined;
  }
  const out = result.stdout.trim();
  return out.length === 0 ? undefined : out;
}

function resolveBuiltIdentityCliPath(): string {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  return resolve(moduleDir, '..', 'bin', 'agent-identity.js');
}

/**
 * Gather the session-shape inputs and resolve the coordination indicators
 * for this tick.
 *
 * Exactly two coordination reads, both against the PRIMARY checkout root
 * (first `git worktree list --porcelain` entry — a worktree seat must read
 * the live registry, not its own checked-out copy): the active-claims
 * registry and the experiments-directory listing. The comms corpus is never
 * read from this path — the statusline ticks constantly and that directory
 * is a large flat scan. Every read soft-fails to undefined so an unreadable
 * coordination surface degrades the indicators rather than the statusline.
 */
function gatherSessionShape(cwd: string, ownAgentName: string | undefined): SessionShape {
  const porcelain = runGit(cwd, ['worktree', 'list', '--porcelain']);
  const primaryRoot = porcelain === undefined ? undefined : parsePrimaryWorktreeRoot(porcelain);

  return resolveSessionShape({
    ownAgentName,
    registry: primaryRoot === undefined ? undefined : readActiveClaimsRegistry(primaryRoot),
    experimentsListing: primaryRoot === undefined ? undefined : listExperiments(primaryRoot),
    nowIso: new Date().toISOString(),
  });
}

function readActiveClaimsRegistry(primaryRoot: string): CollaborationRegistry | undefined {
  try {
    return parseCollaborationRegistry(
      readFileSync(join(primaryRoot, '.agent/state/collaboration/active-claims.json'), 'utf8'),
    );
  } catch {
    return undefined;
  }
}

function listExperiments(primaryRoot: string): readonly ExperimentsEntry[] | undefined {
  const experimentsDir = join(primaryRoot, '.agent/state/collaboration/experiments');
  try {
    return readdirSync(experimentsDir, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => statExperimentsEntry(experimentsDir, join(entry.parentPath, entry.name)))
      .filter((entry) => entry !== undefined);
  } catch {
    return undefined;
  }
}

/**
 * Stat one experiments file, isolating per-entry failures: a file deleted
 * between the directory listing and its stat drops only that entry, not the
 * whole ARC listing for the tick.
 */
function statExperimentsEntry(
  experimentsDir: string,
  filePath: string,
): ExperimentsEntry | undefined {
  try {
    return {
      name: relative(experimentsDir, filePath),
      mtimeIso: statSync(filePath).mtime.toISOString(),
    };
  } catch {
    return undefined;
  }
}
