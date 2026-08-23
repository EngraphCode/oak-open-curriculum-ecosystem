#!/usr/bin/env node
/**
 * Claude Code `SessionStart` hook shim for Practice agent identity.
 *
 * Delegates to the built adapter inside agent-tools at
 * `agent-tools/dist/src/bin/claude-session-identity-hook.js`. The adapter
 * parses Claude Code's stdin JSON, appends `PRACTICE_AGENT_SESSION_ID_CLAUDE`
 * to `$CLAUDE_ENV_FILE` so subsequent Bash tool calls in the session can read
 * the deterministic seed, and prints a `hookSpecificOutput` payload carrying
 * the agent identity row.
 *
 * Soft surface, loud failure: every failure path (missing build artefact,
 * spawn error, signal, non-zero child exit) still exits 0 so the hook never
 * disrupts the session — but instead of a silent `{}` it emits a
 * `hookSpecificOutput.additionalContext` diagnostic naming the cause and the
 * recovery, mirrors it to stderr, and appends it to
 * `.claude/logs/hook-errors.log`. Exit 0 is deliberate: the harness does not
 * surface a non-blocking hook's non-zero exit to the assistant or terminal
 * (see `.claude/hooks/_lib/log-hook-errors.sh`), and `SessionStart` stdout is
 * only consumed on exit 0 — additionalContext is the one channel the session
 * is guaranteed to see. Same fail-open observability pattern as
 * `run-pretooluse-guard.mjs`; a log-write failure never changes the outcome.
 */

import { spawn } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot =
  process.env.CLAUDE_PROJECT_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const adapterPath = resolve(repoRoot, 'agent-tools/dist/src/bin/claude-session-identity-hook.js');

const RECOVERY =
  'Recover with `pnpm install` at the repo root (the postinstall bootstrap builds agent-tools/dist), ' +
  'or derive the identity by hand: `pnpm agent-tools:agent-identity --seed "<session_id>" --format display` ' +
  '(seed = the Claude Code session UUID).';

function failOpen(reason) {
  const message = `[Practice agent identity] Identity hook could not run — identity NOT derived, PRACTICE_AGENT_SESSION_ID_CLAUDE NOT exported. Cause: ${reason}. ${RECOVERY}`;
  process.stderr.write(`${message}\n`);
  try {
    const logDir = resolve(repoRoot, '.claude', 'logs');
    mkdirSync(logDir, { recursive: true });
    appendFileSync(
      resolve(logDir, 'hook-errors.log'),
      `[${new Date().toISOString()}] practice-session-identity fail-open\n  ${message}\n\n`,
    );
  } catch {
    // Best-effort log; observability must never break the session.
  }
  const hookOutput = {
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: message },
  };
  process.stdout.write(`${JSON.stringify(hookOutput)}\n`);
  process.exit(0);
}

if (!existsSync(adapterPath)) {
  failOpen(`built adapter missing at ${adapterPath} (fresh checkout without pnpm install?)`);
}

const child = spawn(process.execPath, [adapterPath], {
  stdio: ['inherit', 'inherit', 'inherit'],
});

child.on('error', (error) => {
  failOpen(`could not spawn node for the adapter (${error.message})`);
});

child.on('exit', (code, signal) => {
  if (signal !== null) {
    failOpen(`adapter terminated by signal ${signal}`);
  }
  if (code !== 0) {
    failOpen(`adapter exited with code ${String(code)}`);
  }
  process.exit(0);
});
