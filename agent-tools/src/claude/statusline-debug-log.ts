/**
 * Optional statusline payload logging, enabled by `OAK_STATUSLINE_LOG_FILE`.
 *
 * @remarks
 * Diagnostic instrument for the statusline's one blind spot: the adapter can
 * prove what it renders from a payload, but not what payload the harness
 * actually sent (e.g. whether `rate_limits` ever arrives — the MCP-529
 * founding case). When the environment variable names a `*.log` path, every
 * invocation appends one timestamped line carrying the payload as received —
 * only line breaks are collapsed (one invocation, one greppable line); all
 * other bytes, including internal whitespace, are preserved. When unset,
 * behaviour is byte-identical to before this module existed.
 *
 * Failure posture is split the same way as the adapter's own segments:
 *
 * - **A set-but-invalid value is a misconfiguration and fails LOUD.** An
 *   operator who explicitly set the variable must never read silence as "the
 *   harness sent nothing" — the resolver returns an `invalid` config whose
 *   warning the adapter renders as a visible token.
 * - **Write failures are swallowed.** The statusline is a soft surface — its
 *   own diagnostics must never blank or break it. This is the same documented
 *   posture as the frame store (`statusline-frame-store.ts`), and the narrow
 *   sanctioned exception to the Result-pattern rule: fire-and-forget I/O at
 *   the adapter boundary, where there is no caller to hand a Result to.
 *
 * Destinations are `*.log` only — an environment variable that drives a file
 * append deserves a small blast radius. The log directory and file are
 * created private to the user (0o700 / 0o600); as with the frame store,
 * PRE-EXISTING file or directory permissions are not retightened (mkdir's
 * mode applies at creation only), and the payload carries session ids and
 * project paths — delete the log after diagnosis.
 *
 * @packageDocumentation
 */

import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * The narrow filesystem surface {@link appendDebugLogEntry} needs, injectable
 * for tests (ADR-078).
 */
export interface DebugLogFs {
  mkdirSync(path: string, options: { recursive: true; mode: number }): void;
  appendFileSync(path: string, data: string, options: { encoding: 'utf8'; mode: number }): void;
}

const realFs: DebugLogFs = { mkdirSync, appendFileSync };

/**
 * The resolved logging configuration: `disabled` (unset or blank — silent),
 * `enabled` with the destination path, or `invalid` with the warning the
 * adapter must render loud (set-but-wrong is a misconfiguration, never
 * silence).
 */
export type DebugLogConfig =
  | { readonly kind: 'disabled' }
  | { readonly kind: 'enabled'; readonly path: string }
  | { readonly kind: 'invalid'; readonly warning: string };

/**
 * Resolve the debug-log configuration from the environment.
 *
 * @param env - The environment map (pass `process.env`).
 * @returns `disabled` when the variable is unset or blank; `enabled` with the
 * trimmed path when it ends `.log`; `invalid` with a renderable warning for
 * any other set value.
 */
export function resolveDebugLogConfig(
  env: Readonly<Record<string, string | undefined>>,
): DebugLogConfig {
  const value = env.OAK_STATUSLINE_LOG_FILE?.trim();
  if (value === undefined || value.length === 0) {
    return { kind: 'disabled' };
  }
  if (!value.endsWith('.log')) {
    return {
      kind: 'invalid',
      warning: 'OAK_STATUSLINE_LOG_FILE must name a *.log path — logging disabled',
    };
  }
  return { kind: 'enabled', path: value };
}

/**
 * The loud one-line warning for an `invalid` config, empty otherwise.
 *
 * @remarks
 * Kept beside the resolver so the two halves of the fail-loud contract are
 * one tested unit: the adapter writes this line before ANY other outcome —
 * including a noop payload — because an operator who set the variable must
 * never read silence as "the harness sent nothing".
 *
 * @param config - The resolved configuration.
 * @param ansi - The escape sequences the adapter renders with (injected so
 * the formatter stays pure and the test asserts placement, not codes).
 * @returns The newline-terminated warning line, or `''` when there is
 * nothing to warn about.
 */
export function invalidConfigWarningLine(
  config: DebugLogConfig,
  ansi: { readonly red: string; readonly bold: string; readonly reset: string },
): string {
  if (config.kind !== 'invalid') {
    return '';
  }
  return `${ansi.red}${ansi.bold}⚠ statusline: ${config.warning}${ansi.reset}\n`;
}

/**
 * Append one timestamped payload line to the debug log, soft-failing.
 *
 * @remarks
 * Terminal line breaks are stripped (the harness newline-terminates its
 * payloads) and interior line breaks are collapsed to single spaces so each
 * invocation lands as exactly one line; all other bytes, including leading
 * and trailing spaces or tabs, are preserved so the logged payload stays
 * faithful to what arrived. Any filesystem failure is swallowed — see the
 * module remarks for the split failure posture.
 *
 * @param logPath - The `*.log` destination from {@link resolveDebugLogConfig}.
 * @param rawPayload - The stdin payload as received, pre-parse.
 * @param nowIso - The invocation timestamp (injected so the entry is pure of
 * clock reads; callers pass `new Date().toISOString()`).
 * @param fs - The filesystem surface; defaults to the real one.
 */
export function appendDebugLogEntry(
  logPath: string,
  rawPayload: string,
  nowIso: string,
  fs: DebugLogFs = realFs,
): void {
  const line = `${nowIso} ${rawPayload.replace(/[\r\n]+$/u, '').replaceAll(/[\r\n]+/gu, ' ')}\n`;
  try {
    fs.mkdirSync(dirname(logPath), { recursive: true, mode: 0o700 });
    fs.appendFileSync(logPath, line, { encoding: 'utf8', mode: 0o600 });
  } catch {
    // Soft surface: the statusline never breaks for its own logging.
  }
}
