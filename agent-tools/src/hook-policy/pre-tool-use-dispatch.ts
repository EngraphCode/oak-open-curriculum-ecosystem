import { fileURLToPath } from 'node:url';

import { claudePolicyRoutes } from './claude-adapter.js';
import { renderClaudeDecision } from './claude-renderer.js';
import { dispatchPreToolUse, type RunPreToolUseDispatchOptions } from './dispatcher.js';

/**
 * Composition root for the unified PreToolUse hook: one artefact serves the
 * Bash, Edit, and Write matchers by wiring the three production routes and
 * the Claude-contract renderer into the bounded dispatcher.
 *
 * @packageDocumentation
 */

/**
 * Run the unified PreToolUse dispatch with the production routes (bash,
 * claude-content, copilot-compat-string) and the Claude renderer. Seams in
 * {@link RunPreToolUseDispatchOptions} exist for tests and composition;
 * production invocation passes none.
 */
export async function runPreToolUseDispatch(
  options: RunPreToolUseDispatchOptions = {},
): Promise<{ exitCode: number }> {
  return dispatchPreToolUse(claudePolicyRoutes, renderClaudeDecision, options);
}

const currentFilePath = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFilePath) {
  const { exitCode } = await runPreToolUseDispatch();
  process.exit(exitCode);
}
