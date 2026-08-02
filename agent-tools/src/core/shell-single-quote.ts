const SHELL_SINGLE_QUOTE_ESCAPE = String.raw`'\''`;

/**
 * Single-quote a value for safe pasting into a POSIX shell, so a value
 * containing spaces or other shell metacharacters stays a single argument.
 * Shared by the Claude `SessionStart` env-file export lines and the spawn
 * launch-command render (consolidate-at-second-consumer).
 *
 * @remarks
 * The contract is shell-ARGUMENT safety, not line safety: an interior
 * newline is preserved verbatim, so a line-oriented consumer (an env file of
 * `export` lines) still owns its own no-newline expectation. An embedded
 * single quote renders as close-escape-reopen (`'\''`); backslash, `$`, and
 * backtick are inert inside single quotes, which is why single- rather than
 * double-quoting is the right primitive here. Apply once, to a raw value —
 * the function is not idempotent (quoting an already-quoted value quotes the
 * quotes). This is a rendering helper for copy-paste and env-file surfaces,
 * never an execution primitive: run subprocesses through an argv array (the
 * `CommandRunner` seam shape in `core/command-runner.ts`), never through an
 * assembled shell string.
 *
 * @param value - the raw, unquoted value.
 * @returns the value wrapped as one POSIX shell argument.
 */
export function shellSingleQuote(value: string): string {
  return `'${value.replaceAll("'", SHELL_SINGLE_QUOTE_ESCAPE)}'`;
}
