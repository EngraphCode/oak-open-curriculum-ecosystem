import { type SpawnedWorktree } from './create.js';

const SHELL_SINGLE_QUOTE_ESCAPE = String.raw`'\''`;

/**
 * Single-quote a value for safe pasting into a POSIX shell, so a worktree path
 * containing spaces (or other shell metacharacters) stays a single argument.
 *
 * @remarks
 * A second copy of the same primitive lives in `../claude/session-identity-hook.ts`.
 * Two consumers is below the consolidate-at-third-consumer threshold; hoist both to
 * a shared `core/` shell-quote util when a third consumer appears.
 */
function shellSingleQuote(value: string): string {
  return `'${value.replaceAll("'", SHELL_SINGLE_QUOTE_ESCAPE)}'`;
}

/**
 * Render the copy-paste launch command for a freshly-spawned lane (spawn-flow 1E).
 *
 * The command starts a session rooted in the spawned worktree, so the launched
 * session's Bash tool and statusline operate in the worktree natively
 * (launch-in-worktree). The worktree path is single-quoted for shell safety.
 *
 * @remarks
 * Identity is intentionally NOT injected. The Claude `SessionStart` identity hook
 * (`../claude/session-identity-hook.ts`) derives a stable PDR-027 identity from the
 * harness `session_id` and unconditionally writes `PRACTICE_AGENT_SESSION_ID_CLAUDE`
 * to `$CLAUDE_ENV_FILE`, which subsequent Bash tool calls source — so a launch-time
 * seed injection is overridden and inert (verified first-hand 2026-06-28). The
 * launched session adopts the harness-assigned identity; this is the
 * derive-don't-author path.
 *
 * Native `claude --worktree` is NOT used: that flag CREATES a new git worktree,
 * which would conflict with the worktree spawn already created — the `cd` form
 * enters the existing one.
 */
export function formatLaunchCommand(result: SpawnedWorktree): string {
  return [
    '  Launch this seat (starts a session rooted in the worktree):',
    `    cd ${shellSingleQuote(result.worktreePath)} && claude`,
    '',
  ].join('\n');
}
