/**
 * Built-CLI smoke for MCP-360's linked-worktree watcher defaults.
 *
 * A real linked worktree invokes the built CLI with both watcher paths
 * omitted. The proof crosses production git/process/filesystem composition,
 * then exercises both F-95 readers while the watcher is still live.
 */
import assert from 'node:assert/strict';
import { spawn, spawnSync, type ChildProcess, type SpawnSyncReturns } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  AGENT_NAME,
  agentEnvironment,
  EVENT_ID,
  EVENT_TITLE,
  type Fixture,
  makeFixture,
  removeFixture,
} from './comms-watch-coordination-home-fixture';

const AGENT_TOOLS_ROOT = fileURLToPath(new URL('..', import.meta.url));
const BIN = join(AGENT_TOOLS_ROOT, 'dist', 'src', 'bin', 'agent-tools.js');

interface WatcherHarness {
  readonly supervisor: ChildProcess;
  readonly watcher: ChildProcess;
  readonly stdout: () => string;
  readonly stderr: () => string;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function waitForExit(child: ChildProcess, label: string): Promise<number | null> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve(child.exitCode);
  }
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`${label} did not exit within 10 seconds`));
    }, 10_000);
    child.once('close', (code) => {
      clearTimeout(timeout);
      resolve(code);
    });
  });
}

function startWatcher(fixture: Fixture, env: NodeJS.ProcessEnv): WatcherHarness {
  let stdout = '';
  let stderr = '';
  const supervisor = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1_000)'], {
    stdio: 'ignore',
  });
  assert.notEqual(supervisor.pid, undefined, 'supervisor helper failed to start');
  const watcher = spawn(
    process.execPath,
    [
      BIN,
      'collaboration-state',
      '--',
      'comms',
      'watch',
      '--platform',
      'codex',
      '--model',
      'GPT-5',
      '--no-auto-seed',
      '--supervisor-pid',
      String(supervisor.pid),
      '--poll-ms',
      '50',
    ],
    { cwd: fixture.linked, env, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  watcher.stdout?.setEncoding('utf8');
  watcher.stderr?.setEncoding('utf8');
  watcher.stdout?.on('data', (chunk: string) => {
    stdout += chunk;
  });
  watcher.stderr?.on('data', (chunk: string) => {
    stderr += chunk;
  });
  return { supervisor, watcher, stdout: () => stdout, stderr: () => stderr };
}

async function waitForWatcherProof(harness: WatcherHarness, fixture: Fixture): Promise<void> {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (
      harness.stdout().includes(EVENT_TITLE) &&
      existsSync(fixture.seenFile) &&
      existsSync(fixture.heartbeatFile)
    ) {
      return;
    }
    assert.equal(
      harness.watcher.exitCode,
      null,
      `watcher exited before proof\n${harness.stderr()}`,
    );
    await delay(25);
  }
  assert.fail(`watcher proof timed out\n${harness.stdout()}\n${harness.stderr()}`);
}

function runCli(
  fixture: Fixture,
  env: NodeJS.ProcessEnv,
  args: readonly string[],
): SpawnSyncReturns<string> {
  return spawnSync(process.execPath, [BIN, 'collaboration-state', '--', ...args], {
    cwd: fixture.linked,
    env,
    encoding: 'utf8',
  });
}

function provePrimaryState(fixture: Fixture): void {
  assert.match(readFileSync(fixture.seenFile, 'utf8'), new RegExp(EVENT_ID));
  assert.equal(existsSync(dirname(fixture.seenFile)), true);
  assert.equal(existsSync(join(fixture.linked, '.agent/state/collaboration/comms')), false);
  assert.equal(existsSync(join(fixture.linked, '.agent/state/collaboration/comms-seen')), false);
}

function proveAssertReader(fixture: Fixture, env: NodeJS.ProcessEnv): void {
  const result = runCli(fixture, env, [
    'comms',
    'assert-watcher-live',
    '--platform',
    'codex',
    '--model',
    'GPT-5',
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /comms watcher live for Europa stirs Void/u);
}

function proveClaimGate(fixture: Fixture, env: NodeJS.ProcessEnv): void {
  const result = runCli(fixture, env, [
    'claims',
    'open',
    '--active',
    fixture.activePath,
    '--thread',
    'agent-tooling',
    '--area-kind',
    'files',
    '--area-pattern',
    'agent-tools/src/**',
    '--intent',
    'Prove the default F-95 reader sees the primary watcher heartbeat.',
    '--now',
    new Date().toISOString(),
    '--platform',
    'codex',
    '--model',
    'GPT-5',
  ]);
  assert.equal(result.status, 0, result.stderr);
  const registry: unknown = JSON.parse(readFileSync(fixture.activePath, 'utf8'));
  assert.equal(
    typeof registry === 'object' &&
      registry !== null &&
      'claims' in registry &&
      Array.isArray(registry.claims)
      ? registry.claims.length
      : -1,
    2,
  );
}

async function stopWatcher(harness: WatcherHarness): Promise<void> {
  harness.supervisor.kill('SIGTERM');
  await waitForExit(harness.supervisor, 'supervisor helper');
  assert.equal(await waitForExit(harness.watcher, 'watcher'), 0, harness.stderr());
  assert.match(harness.stdout(), /WATCHER EXIT --- reason=supervisor-gone/u);
}

async function abortHarness(harness: WatcherHarness): Promise<void> {
  if (harness.supervisor.exitCode === null && harness.supervisor.signalCode === null) {
    harness.supervisor.kill('SIGTERM');
    await waitForExit(harness.supervisor, 'supervisor helper cleanup');
  }
  if (harness.watcher.exitCode === null && harness.watcher.signalCode === null) {
    harness.watcher.kill('SIGTERM');
    await waitForExit(harness.watcher, 'watcher cleanup');
  }
}

async function proveFixture(fixture: Fixture, env: NodeJS.ProcessEnv): Promise<void> {
  const harness = startWatcher(fixture, env);
  try {
    await waitForWatcherProof(harness, fixture);
    provePrimaryState(fixture);
    proveAssertReader(fixture, env);
    proveClaimGate(fixture, env);
    await stopWatcher(harness);
  } finally {
    await abortHarness(harness);
  }
}

assert.equal(existsSync(BIN), true, `built CLI missing: ${BIN}`);
const fixture = await makeFixture();
try {
  await proveFixture(fixture, agentEnvironment());
} finally {
  await removeFixture(fixture);
}
process.stdout.write(
  `comms-watch coordination-home smoke: primary event/cursor/heartbeat, ` +
    `${AGENT_NAME} assert and claim gate passed\n`,
);
