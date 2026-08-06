import { spawnSync } from 'node:child_process';

import { err, ok, type Result } from '@oaknational/result';

import { resolveTrustedGit } from '../core/trusted-git.js';

/**
 * The git plumbing behind `merge-bot push`, and with it the whole credential
 * discipline in ONE reviewable file: the static credential helper, the child
 * environment that carries the token, and the argv that carries none of it.
 * Split from `push-cli.ts` at the size gate — the same seam `merge-args.ts`
 * and `merge-cli.ts` record for the merge action.
 *
 * The push itself is the git binary's work. Nothing here re-implements any
 * part of it; the file exists so that the ONE place a token meets a child
 * process is small enough to read in a sitting.
 */

/** The fields of a completed git invocation the push action reads. */
export interface GitCommandResult {
  /** The process exit status; negative when the binary could not be run at all. */
  readonly status: number;
  readonly stdout: string;
  readonly stderr: string;
}

/**
 * The git seam, execFile-shaped and VALUE-returning (ADR-088): a non-zero
 * exit is a result to read, never a throw to catch. The real `child_process`
 * translation lives at one boundary, in {@link realGitExecutor}.
 */
export type GitExecutor = (
  file: string,
  args: readonly string[],
  options: {
    readonly cwd: string;
    readonly env: Readonly<Record<string, string | undefined>>;
  },
) => GitCommandResult;

/** A resolved git binary plus the executor that runs it. */
export interface GitContext {
  readonly file: string;
  readonly exec: GitExecutor;
}

/**
 * The one credential helper, as a static literal: it echoes the app-token
 * username and reads the password from the environment. Nothing is
 * interpolated into it, so no value from argv, config or the network can ever
 * become part of the shell fragment git runs.
 */
const CREDENTIAL_HELPER =
  '!f() { echo username=x-access-token; echo "password=$GH_PUSH_TOKEN"; }; f';

/** The real `child_process` translation, at exactly one boundary. */
function realGitExecutor(): GitExecutor {
  return (file, args, options) => {
    const result = spawnSync(file, [...args], {
      cwd: options.cwd,
      env: { ...options.env },
      encoding: 'utf8',
    });
    if (result.error !== undefined) {
      return { status: -1, stdout: '', stderr: `cannot run git: ${result.error.message}` };
    }
    return { status: result.status ?? -1, stdout: result.stdout, stderr: result.stderr };
  };
}

/**
 * The git binary by ABSOLUTE path (SonarCloud S4036) — `resolveTrustedGit`
 * throws when it finds none, translated here at the one boundary.
 */
export function resolveGitContext(seams: {
  readonly gitExecutor?: GitExecutor;
  readonly gitPath?: string;
}): Result<GitContext, Error> {
  const exec = seams.gitExecutor ?? realGitExecutor();
  if (seams.gitPath !== undefined) {
    return ok({ file: seams.gitPath, exec });
  }
  try {
    return ok({ file: resolveTrustedGit(), exec });
  } catch (cause) {
    return err(new Error(cause instanceof Error ? cause.message : String(cause)));
  }
}

/**
 * The child environment for the push: the base WHOLESALE with the token added
 * LAST, so a stale `GH_PUSH_TOKEN` in the base can never win over the freshly
 * minted one. Terminal prompting is disabled alongside: if the helper ever
 * failed to answer, git must fail loudly rather than fall back to asking a
 * human — under shared credentials that human's identity is what the push
 * would carry.
 */
function pushEnv(
  token: string,
  baseEnv: Readonly<Record<string, string | undefined>>,
): Record<string, string | undefined> {
  return { ...baseEnv, GIT_TERMINAL_PROMPT: '0', GH_PUSH_TOKEN: token };
}

/**
 * The push call's argv: inherited helpers cleared (a configured keychain
 * helper must never answer for the bot), then the one static helper. The
 * token is NOT here — argv is visible in the process list to anything that
 * can read it — and neither is any bypass: no force flag, no `--no-verify`.
 */
function pushArgv(remote: string, branch: string): readonly string[] {
  return [
    '-c',
    'credential.helper=',
    '-c',
    `credential.helper=${CREDENTIAL_HELPER}`,
    'push',
    remote,
    `HEAD:${branch}`,
  ];
}

/** Ask git which branch HEAD is on — never inferred from the environment. */
export function currentBranch(
  git: GitContext,
  options: { readonly cwd: string; readonly env: Readonly<Record<string, string | undefined>> },
): Result<string, Error> {
  const result = git.exec(git.file, ['rev-parse', '--abbrev-ref', 'HEAD'], options);
  if (result.status !== 0) {
    return err(
      new Error(
        `cannot read the current branch (git rev-parse exited ${result.status}): ${result.stderr.trim()}`,
      ),
    );
  }
  const branch = result.stdout.trim();
  return branch === ''
    ? err(new Error('cannot read the current branch: git rev-parse printed nothing'))
    : ok(branch);
}

/** Hand the whole transfer to git, with the token reaching it only through the environment. */
export function pushHead(
  git: GitContext,
  input: {
    readonly remote: string;
    readonly branch: string;
    readonly cwd: string;
    readonly token: string;
    readonly baseEnv: Readonly<Record<string, string | undefined>>;
  },
): GitCommandResult {
  return git.exec(git.file, pushArgv(input.remote, input.branch), {
    cwd: input.cwd,
    env: pushEnv(input.token, input.baseEnv),
  });
}
