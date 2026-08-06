import { spawn, spawnSync } from 'node:child_process';

/**
 * The one boundary where `merge-bot push` meets a real git child process, and
 * the two ways it may consume that child's output.
 *
 * The split is not stylistic. R1 binds output whose VOLUME the tool does not
 * control, and the push has exactly one such child: git, running the
 * repository's whole pre-push gate chain underneath it. That output is
 * STREAMED. `rev-parse --abbrev-ref HEAD` answers with a branch name, which
 * the tool does control, and is captured.
 */

/** The fields of a completed git invocation the push action reads. */
export interface GitCommandResult {
  /** The process exit status; negative when the binary could not be run at all. */
  readonly status: number;
  readonly stdout: string;
  readonly stderr: string;
}

interface GitCallOptions {
  readonly cwd: string;
  readonly env: Readonly<Record<string, string | undefined>>;
}

/**
 * The git seam, execFile-shaped and VALUE-returning (ADR-088): a non-zero
 * exit is a result to read, never a throw to catch.
 *
 * A caller may answer synchronously; the real executor answers with a Promise
 * when it is streaming, so every call site awaits.
 */
export type GitExecutor = (
  file: string,
  args: readonly string[],
  options: GitCallOptions & {
    /**
     * Sink for output whose volume this tool does not control. When supplied,
     * the executor forwards every chunk here as it arrives and accumulates
     * NONE of it — no buffer stands between git and the operator — and the
     * returned `stdout`/`stderr` are empty.
     */
    readonly onOutput?: (chunk: string) => void;
  },
) => GitCommandResult | Promise<GitCommandResult>;

/**
 * Capture the whole of a child's output into the result. Sound ONLY where
 * this tool controls the volume, because the buffer here is `spawnSync`'s
 * 1 MiB default — a runtime's choice, and therefore never a limit this tool
 * may rely on for anything it does not bound itself (R2).
 */
function capturingGitCall(
  file: string,
  args: readonly string[],
  options: GitCallOptions,
): GitCommandResult {
  const result = spawnSync(file, [...args], {
    cwd: options.cwd,
    env: { ...options.env },
    encoding: 'utf8',
  });
  if (result.error !== undefined) {
    return { status: -1, stdout: '', stderr: `cannot run git: ${result.error.message}` };
  }
  return { status: result.status ?? -1, stdout: result.stdout, stderr: result.stderr };
}

/**
 * Stream a child's output to `onOutput` as it arrives, holding none of it.
 *
 * This is the push's path. The repository's pre-push gate chain emitted
 * 1,852,962 bytes on a GREEN run (measured 2026-08-06, turbo leg only — a
 * lower bound) against `spawnSync`'s 1 MiB default; the result was ENOBUFS,
 * SIGTERM, and a push that reported failure while never landing. Streaming
 * removes the ceiling rather than raising it: there is no size at which this
 * fails, because nothing accumulates.
 */
function streamingGitCall(
  file: string,
  args: readonly string[],
  options: GitCallOptions & { readonly onOutput: (chunk: string) => void },
): Promise<GitCommandResult> {
  return new Promise((resolve) => {
    const child = spawn(file, [...args], {
      cwd: options.cwd,
      env: { ...options.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', options.onOutput);
    child.stderr.on('data', options.onOutput);
    // Whichever settles first wins; a Promise ignores the later call.
    child.on('error', (cause) =>
      resolve({ status: -1, stdout: '', stderr: `cannot run git: ${cause.message}` }),
    );
    // Output already reached the sink, so the result carries only the status.
    child.on('close', (code) => resolve({ status: code ?? -1, stdout: '', stderr: '' }));
  });
}

/** The real `child_process` translation, choosing its arm by the sink's presence. */
export function realGitExecutor(): GitExecutor {
  return (file, args, options) => {
    const { onOutput } = options;
    return onOutput === undefined
      ? capturingGitCall(file, args, options)
      : streamingGitCall(file, args, { cwd: options.cwd, env: options.env, onOutput });
  };
}
