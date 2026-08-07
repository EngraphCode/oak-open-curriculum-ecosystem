/**
 * Optional statusline payload logging, enabled by `OAK_STATUSLINE_LOG_FILE`.
 *
 * @remarks
 * Diagnostic instrument for the statusline's one blind spot: the adapter can
 * prove what it renders from a payload, but not what payload the harness
 * actually sent (e.g. whether `rate_limits` ever arrives — the MCP-529
 * founding case). When the environment variable names a `*.log` path, every
 * invocation appends one timestamped line carrying the raw stdin payload;
 * when unset, behaviour is byte-identical to before this module existed.
 *
 * Two deliberate narrowings:
 *
 * - **Destinations are `*.log` only.** An environment variable that drives a
 *   file append is a small footgun; refusing any non-`.log` destination keeps
 *   the writable surface unmistakably a log file.
 * - **All failures are swallowed.** The statusline is a soft surface — its own
 *   diagnostics must never blank or break it. This is the same documented
 *   posture as the frame store (`statusline-frame-store.ts`), and the narrow
 *   sanctioned exception to the Result-pattern rule: fire-and-forget cosmetic
 *   I/O at the adapter boundary, where there is no caller to hand a Result to.
 *
 * The log directory and file are created private to the user (0o700 / 0o600),
 * matching the frame store's posture: payloads carry session ids and project
 * paths.
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
 * Resolve the debug-log destination from the environment, or `undefined` when
 * logging is disabled.
 *
 * @param env - The environment map (pass `process.env`).
 * @returns The value of `OAK_STATUSLINE_LOG_FILE` when it is a non-blank path
 * ending in `.log`; `undefined` otherwise — unset, blank, and non-`.log`
 * values all resolve to "logging disabled".
 */
export function resolveDebugLogPath(
  env: Readonly<Record<string, string | undefined>>,
): string | undefined {
  const value = env.OAK_STATUSLINE_LOG_FILE?.trim();
  if (value === undefined || value.length === 0 || !value.endsWith('.log')) {
    return undefined;
  }
  return value;
}

/**
 * Append one timestamped payload line to the debug log, soft-failing.
 *
 * @remarks
 * The payload has internal whitespace runs (including newlines) collapsed to
 * single spaces so each invocation lands as exactly one greppable line. Any
 * filesystem failure is swallowed — see the module remarks for why this soft
 * surface deliberately steps outside the Result pattern.
 *
 * @param logPath - The `*.log` destination from {@link resolveDebugLogPath}.
 * @param rawPayload - The raw stdin payload as received, pre-parse.
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
  const line = `${nowIso} ${rawPayload.replaceAll(/\s+/g, ' ').trim()}\n`;
  try {
    fs.mkdirSync(dirname(logPath), { recursive: true, mode: 0o700 });
    fs.appendFileSync(logPath, line, { encoding: 'utf8', mode: 0o600 });
  } catch {
    // Soft surface: the statusline never breaks for its own logging.
  }
}
