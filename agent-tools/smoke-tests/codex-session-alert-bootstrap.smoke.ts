import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { typeSafeGet } from '@oaknational/type-helpers';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const hookPath = join(repoRoot, '.codex/hooks/practice-session-identity.mjs');
const input = JSON.stringify({
  session_id: '22e83599-a627-4427-b23c-fe6ce046e859',
  source: 'startup',
  hook_event_name: 'SessionStart',
  model: 'GPT-5',
});
const result = spawnSync(process.execPath, [hookPath], {
  cwd: repoRoot,
  input,
  encoding: 'utf8',
});

if (result.status !== 0) {
  process.stderr.write(
    `Codex SessionStart hook exited ${String(result.status)}:\n${result.stderr}`,
  );
  process.exit(1);
}

const additionalContext = readAdditionalContext(result.stdout);
const requiredSnippets = [
  '[Practice agent identity]',
  '[Codex team alert bootstrap]',
  'follow the generated Codex team-session alert bootstrap in AGENTS.md',
  '.agent/rules/use-monitor-for-event-driven-wake.md#codex-notify-session-relay',
];
const missing = requiredSnippets.filter((snippet) => !additionalContext?.includes(snippet));
if (missing.length > 0) {
  process.stderr.write(
    `Codex SessionStart hook omitted required context:\n${missing.join('\n')}\n` +
      `stdout: ${result.stdout}\n`,
  );
  process.exit(1);
}

process.stdout.write('codex-session-alert-bootstrap smoke: shipped hook context verified\n');

interface HookResponse {
  readonly hookSpecificOutput?: unknown;
}

interface HookSpecificOutput {
  readonly additionalContext?: unknown;
}

function readAdditionalContext(stdout: string): string | undefined {
  const parsed = parseJsonRecord(stdout);
  if (parsed === undefined) {
    return undefined;
  }
  const hookOutput = typeSafeGet(parsed, 'hookSpecificOutput');
  return readContextFromHookOutput(hookOutput);
}

function parseJsonRecord(value: string): HookResponse | undefined {
  try {
    const parsed: unknown = JSON.parse(value);
    return isHookResponse(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function readContextFromHookOutput(hookOutput: unknown): string | undefined {
  if (!isHookSpecificOutput(hookOutput)) {
    return undefined;
  }
  const context = typeSafeGet(hookOutput, 'additionalContext');
  return typeof context === 'string' ? context : undefined;
}

function isHookResponse(value: unknown): value is HookResponse {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isHookSpecificOutput(value: unknown): value is HookSpecificOutput {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
