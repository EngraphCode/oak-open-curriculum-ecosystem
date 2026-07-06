import { spawn } from 'node:child_process';
import { closeSync, mkdtempSync, openSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Destinations for the replayed child streams. Defaults to the parent's
 * own stdio; tests inject collectors so replay is assertable and the
 * runner's logs stay clean.
 */
export interface InheritedProcessReplaySinks {
  readonly stdout: { write(content: Buffer): unknown };
  readonly stderr: { write(content: Buffer): unknown };
}

export interface InheritedProcessOptions {
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly replaySinks?: InheritedProcessReplaySinks;
}

/**
 * Structured outcome of a child process run through
 * {@link runInheritedProcess}.
 *
 * `exitCode` is the child's real exit code; when the child was killed by
 * a signal it carries the `128` sentinel and `signal` names the signal
 * distinctly, so no termination information is lost (F-112 faithful
 * exit/signal reporting).
 */
export interface InheritedProcessResult {
  readonly exitCode: number;
  readonly signal: NodeJS.Signals | null;
  readonly stderr: string;
}

/**
 * Runs a child process with its stdout/stderr redirected to temporary
 * FILES, replayed to the parent's streams on completion.
 *
 * The child's stdio must NEVER be Node-created pipes (F-112). Node's
 * child-stdio "pipes" are libuv socketpairs; a socketpair on a spawned
 * `git commit`'s stderr poisons the pre-commit hook chain — the hook
 * shell takes SIGPIPE at the depcruise→turbo handover and the hook's
 * `set -e` turns the failed write into a silent exit 1, so no commit
 * lands. Every reproduction carried the socketpair on the child's
 * stderr; plain file descriptors are immune, and the full stream is
 * conserved and replayed, so the caller still sees everything — on
 * completion rather than live.
 */
export async function runInheritedProcess(
  options: InheritedProcessOptions,
): Promise<InheritedProcessResult> {
  const captureDir = mkdtempSync(join(tmpdir(), 'agent-tools-child-io-'));
  const stdoutPath = join(captureDir, 'stdout.log');
  const stderrPath = join(captureDir, 'stderr.log');
  const stdoutFd = openSync(stdoutPath, 'w');
  const stderrFd = openSync(stderrPath, 'w');
  const sinks = options.replaySinks ?? { stdout: process.stdout, stderr: process.stderr };

  try {
    return await new Promise((resolve, reject) => {
      let settled = false;

      const child = spawn(options.command, options.args, {
        cwd: options.cwd,
        stdio: ['ignore', stdoutFd, stderrFd],
      });

      child.on('error', (error) => {
        settled = true;
        reject(error);
      });

      // A failed spawn emits BOTH 'error' and 'close'; the settled guard
      // keeps this handler off that path so it never reads a capture the
      // rejection already abandoned.
      child.on('close', (code, signal) => {
        if (settled) {
          return;
        }
        settled = true;
        replay(sinks.stdout, readFileSync(stdoutPath));
        const stderrContent = readFileSync(stderrPath);
        replay(sinks.stderr, stderrContent);
        resolve({
          exitCode: code ?? (signal === null ? 0 : 128),
          signal,
          stderr: stderrContent.toString('utf8'),
        });
      });
    });
  } finally {
    closeSync(stdoutFd);
    closeSync(stderrFd);
    rmSync(captureDir, { recursive: true, force: true });
  }
}

function replay(sink: InheritedProcessReplaySinks['stdout'], content: Buffer): void {
  if (content.length === 0) {
    return;
  }
  try {
    sink.write(content);
  } catch {
    // A synchronously-failing sink write (e.g. a sync EPIPE) must not
    // corrupt the child's faithfully-captured result (F-112). Async
    // stream errors follow the parent's own stream handling, as before.
  }
}
