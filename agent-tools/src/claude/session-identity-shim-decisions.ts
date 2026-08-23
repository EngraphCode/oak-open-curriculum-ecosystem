/**
 * Pure fail-open decisions for the Claude `SessionStart` identity shim
 * (`.claude/hooks/practice-session-identity.mjs`).
 *
 * Extracted so the shim's failure-path behaviour — seed parsing, shell-safety
 * gating, env-file persistence planning, and diagnostic wording — is
 * unit-tested in isolation; the shim imports this committed source directly
 * (Node strips the types at runtime) and stays a thin IO orchestrator, the
 * same shape as `../hook-policy/guard-runner-decisions.ts`. This module is
 * deliberately dependency-free: the shim loads it before any build exists.
 *
 * @packageDocumentation
 */

/**
 * Only a seed that is unambiguously shell-safe may be embedded in the env
 * file or a suggested command — stdin is external input, and neither surface
 * may become a quote-injection vector.
 */
const SAFE_SEED = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * Parse the `session_id` seed from the hook's stdin JSON.
 *
 * @param stdinText - Raw stdin text Claude Code piped to the hook.
 * @returns The trimmed seed, or `undefined` when stdin carries no usable one.
 *
 * @example
 *
 * ```ts
 * readShimSessionId('{"session_id":"abc-123"}'); // 'abc-123'
 * readShimSessionId('not json'); // undefined
 * ```
 */
export function readShimSessionId(stdinText: string): string | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdinText);
  } catch {
    return undefined;
  }
  if (typeof parsed !== 'object' || parsed === null || !('session_id' in parsed)) {
    return undefined;
  }
  const candidate: unknown = parsed.session_id;
  if (typeof candidate !== 'string') {
    return undefined;
  }
  const trimmed = candidate.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

/**
 * Whether a seed may be embedded in shell-facing surfaces.
 *
 * @param seed - The candidate seed.
 * @returns `true` only for the shell-safe character set.
 */
export function isShellSafeSeed(seed: string): boolean {
  return SAFE_SEED.test(seed);
}

/**
 * The shim's planned fail-open behaviour for one failure event.
 */
export interface ShimFailOpenPlan {
  /**
   * Env-file append that persists the seed, present only when the seed is
   * shell-safe and the hook holds a `CLAUDE_ENV_FILE` path. The shim
   * attempts this write first and selects the message by the outcome.
   */
  readonly envFileWrite?: {
    readonly absolutePath: string;
    readonly appendLine: string;
  };
  /** Diagnostic when the seed was persisted (env-file write succeeded). */
  readonly messageWhenPersisted: string;
  /** Diagnostic when no persistence happened (no write planned, or it failed). */
  readonly messageWhenNotPersisted: string;
}

/**
 * Plan the shim's loud fail-open: what to persist and what to say.
 *
 * Pure planning only — the shim performs the write and picks
 * {@link ShimFailOpenPlan.messageWhenPersisted} or
 * {@link ShimFailOpenPlan.messageWhenNotPersisted} by the write's outcome.
 *
 * @param input - The failure cause, raw stdin, and the hook-scoped env-file
 *   path (`CLAUDE_ENV_FILE` reaches the hook process only, never later shell
 *   calls — so persistence must be planned here or not at all).
 * @returns The fail-open plan.
 *
 * @example
 *
 * ```ts
 * const plan = planShimFailOpen({
 *   cause: 'built adapter missing',
 *   stdinText: '{"session_id":"abc-123"}',
 *   envFile: '/tmp/env',
 * });
 * plan.envFileWrite?.appendLine; // "export PRACTICE_AGENT_SESSION_ID_CLAUDE='abc-123'\n"
 * ```
 */
export function planShimFailOpen(input: {
  readonly cause: string;
  readonly stdinText: string;
  readonly envFile: string | undefined;
}): ShimFailOpenPlan {
  const sessionId = readShimSessionId(input.stdinText);
  const embeddable = sessionId !== undefined && isShellSafeSeed(sessionId);
  const envFile =
    input.envFile !== undefined && input.envFile.trim().length > 0 ? input.envFile : undefined;

  const envFileWrite =
    embeddable && envFile !== undefined
      ? {
          absolutePath: envFile,
          appendLine: `export PRACTICE_AGENT_SESSION_ID_CLAUDE='${sessionId}'\n`,
        }
      : undefined;

  const seed = embeddable ? sessionId : '<session_id>';
  const seedNote = embeddable
    ? ''
    : ' (seed = the Claude Code session UUID; this hook received no usable session_id on stdin)';

  const persistedRecovery =
    'The session seed WAS persisted: PRACTICE_AGENT_SESSION_ID_CLAUDE is exported via ' +
    '$CLAUDE_ENV_FILE, so identity-dependent tools resolve it as soon as the build exists. ' +
    'Recover with `pnpm install` at the repo root (the postinstall bootstrap builds ' +
    'agent-tools/dist), then confirm with `pnpm agent-tools:agent-identity --format display`.';

  const notPersistedRecovery =
    'The seed could NOT be persisted ($CLAUDE_ENV_FILE was unavailable to the hook, and it ' +
    'does not reach later shell calls). Recover with `pnpm install` at the repo root (the ' +
    'postinstall bootstrap builds agent-tools/dist), then supply the seed inline on each ' +
    'identity-dependent command: ' +
    `\`PRACTICE_AGENT_SESSION_ID_CLAUDE='${seed}' pnpm agent-tools:agent-identity --format display\`` +
    seedNote +
    '.';

  const prefix = '[Practice agent identity] Identity hook could not run — ';
  return {
    envFileWrite,
    messageWhenPersisted: `${prefix}display identity NOT derived (seed exported). Cause: ${input.cause}. ${persistedRecovery}`,
    messageWhenNotPersisted: `${prefix}identity NOT derived, PRACTICE_AGENT_SESSION_ID_CLAUDE NOT exported. Cause: ${input.cause}. ${notPersistedRecovery}`,
  };
}
