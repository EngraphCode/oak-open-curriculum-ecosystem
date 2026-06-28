/**
 * Pure resolver for a vendor session-transcript path.
 *
 * @remarks
 * Claude Code stores transcripts at
 * `<home>/.claude/projects/<project-key>/<session-id>.jsonl`, where the
 * project-key is the launch directory with `/` and `.` replaced by `-`. The
 * path is derived from the supplied `home` and `cwd` at runtime — never a
 * machine-local literal (which the `no-machine-local-paths` hook blocks and
 * which would leak a username). Only `claude` is supported today; other vendors
 * return a typed error rather than guessing.
 *
 * @packageDocumentation
 */

/** Result of resolving a transcript path. */
export type TranscriptPathResult =
  | { readonly ok: true; readonly path: string }
  | { readonly ok: false; readonly error: string };

/**
 * Resolve the transcript path for a vendor session.
 *
 * @param input - `vendor`, `home` (user home dir), `cwd` (launch dir), `sessionId`.
 * @returns The resolved path, or a typed error for an unsupported vendor.
 */
export function resolveTranscriptPath(input: {
  readonly vendor: string;
  readonly home: string;
  readonly cwd: string;
  readonly sessionId: string;
}): TranscriptPathResult {
  if (input.vendor !== 'claude') {
    return { ok: false, error: `unsupported vendor: ${input.vendor} (supported: claude)` };
  }

  const projectKey = input.cwd.replaceAll(/[/.]/g, '-');
  return {
    ok: true,
    path: `${input.home}/.claude/projects/${projectKey}/${input.sessionId}.jsonl`,
  };
}
