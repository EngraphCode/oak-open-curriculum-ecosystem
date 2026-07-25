import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Cold-start smoke for the built PreToolUse dispatcher artefact.
 *
 * All three policy matchers in `.claude/settings.json` share this one dist
 * artefact, so a cold-start breakage under plain `node` fails every guarded
 * tool call at once. The smoke proves the built artefact starts, reads a
 * benign Bash payload from stdin, and emits exactly one decision line with
 * exit 0.
 */

const smokeDir = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = resolve(smokeDir, '..', '..');
const artefactPath = resolve(repoRoot, 'agent-tools/dist/src/hook-policy/pre-tool-use-dispatch.js');

const BENIGN_PAYLOAD = `${JSON.stringify({
  tool_name: 'Bash',
  tool_input: { command: 'echo smoke' },
})}\n`;

const child = spawn(process.execPath, [artefactPath], {
  cwd: repoRoot,
  stdio: ['pipe', 'pipe', 'pipe'],
});

let stdout = '';
let stderr = '';

const timeout = setTimeout(() => {
  child.kill('SIGTERM');
  fail('pre-tool-use-dispatch smoke timed out before the built artefact produced a decision');
}, 10_000);

child.stdout.setEncoding('utf8');
child.stdout.on('data', (chunk: string) => {
  stdout += chunk;
});

child.stderr.setEncoding('utf8');
child.stderr.on('data', (chunk: string) => {
  stderr += chunk;
});

child.on('error', (error) => {
  clearTimeout(timeout);
  fail(`pre-tool-use-dispatch smoke could not start the built artefact: ${error.message}`);
});

child.on('close', (code) => {
  clearTimeout(timeout);
  if (code !== 0) {
    fail(`pre-tool-use-dispatch smoke exited ${code ?? 'without a code'}\n${stderr}`);
  }
  const lines = stdout.split('\n').filter(Boolean);
  if (lines.length !== 1) {
    fail(
      `pre-tool-use-dispatch smoke expected exactly one decision line, got ${lines.length}:\n${stdout}`,
    );
  }
  const line = lines[0] ?? '';
  if (!line.includes('"permissionDecision":"allow"')) {
    fail(
      `pre-tool-use-dispatch smoke expected an allow decision for the benign payload, got:\n${line}`,
    );
  }
  process.stdout.write('pre-tool-use-dispatch smoke OK: one allow decision, exit 0\n');
});

child.stdin.write(BENIGN_PAYLOAD);
child.stdin.end();

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
