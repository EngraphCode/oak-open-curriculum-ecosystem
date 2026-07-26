/**
 * Smoke test for the built `mcp-conformance` binary (MCP-189), proving the
 * testing-strategy §"CLI binary" truth-set network-free: the dist entrypoint
 * EXISTS, is EXECUTABLE and carries its SHEBANG; it cold-starts under plain
 * `node`; `--help` exits 0 with usage on stdout; and the usage-error paths
 * (missing --target, unknown flag, duplicate --suite) exit 2 with guidance on
 * stderr and no stack trace.
 *
 * The truth-set's remaining clause — "one trivial happy-path invocation exits
 * 0" — is NOT satisfiable here network-free, and that is a property of this
 * binary rather than an omission: every non-`--help` invocation runs
 * conformance suites against a live MCP target, and testing-strategy forbids
 * network in gated tests. The real happy path is exercised end-to-end by the
 * scheduled `mcp-conformance-unattended` workflow against the deployed alpha
 * on every run, which is where a happy-path regression surfaces. Recorded
 * rather than silently skipped, so the gap is a stated decision with a named
 * home.
 *
 * Requires the workspace to be built (the turbo `test:e2e` task depends on
 * `build`, so the pipeline guarantees it); a missing dist fails loudly with
 * the build command rather than spawning a package manager from PATH here
 * (S4036: only fixed executables are spawned — the current Node binary).
 */
import { spawnSync } from 'node:child_process';
import { accessSync, constants, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AGENT_TOOLS_ROOT = fileURLToPath(new URL('..', import.meta.url));
const REPO_ROOT = join(AGENT_TOOLS_ROOT, '..');
const BIN = join(AGENT_TOOLS_ROOT, 'dist', 'src', 'bin', 'mcp-conformance.js');

const failures: string[] = [];

function check(label: string, condition: boolean, detail: string): void {
  if (!condition) {
    failures.push(`${label}: ${detail}`);
  }
}

if (!existsSync(BIN)) {
  process.stderr.write(
    'SMOKE FAILED: dist entrypoint missing — run `pnpm --filter @oaknational/agent-tools build` first\n',
  );
  process.exit(1);
}

// Artefact-shape proofs. A build that drops the shebang or the executable bit
// still passes every `node <path>` invocation below, so `pnpm mcp:conformance`
// could break while this smoke stayed green — these assert the artefact as
// SHIPPED, not merely as loadable.
let executable = true;
try {
  accessSync(BIN, constants.X_OK);
} catch {
  executable = false;
}
check('dist entry is executable', executable, `${BIN} lacks the executable bit`);
check(
  'dist entry carries its shebang',
  readFileSync(BIN, 'utf8').startsWith('#!/usr/bin/env node'),
  'first line is not the node shebang',
);

const help = spawnSync(process.execPath, [BIN, '--help'], { cwd: REPO_ROOT, encoding: 'utf8' });
check('help exit code', help.status === 0, `expected 0, got ${String(help.status)}`);
check(
  'help usage on stdout',
  help.stdout.includes('Usage: pnpm -s mcp:conformance'),
  help.stdout.slice(0, 200),
);

const missingTarget = spawnSync(process.execPath, [BIN, '--unattended'], {
  cwd: REPO_ROOT,
  encoding: 'utf8',
});
check(
  'missing --target exit code',
  missingTarget.status === 2,
  `expected 2, got ${String(missingTarget.status)}`,
);
check(
  'missing --target guidance on stderr',
  missingTarget.stderr.includes('--target is required'),
  missingTarget.stderr.slice(0, 200),
);
check(
  'missing --target no stack trace',
  !missingTarget.stderr.includes('    at '),
  'stderr carries a stack trace',
);

const unknownFlag = spawnSync(process.execPath, [BIN, '--target', 'https://x.test/mcp', '--nope'], {
  cwd: REPO_ROOT,
  encoding: 'utf8',
});
check(
  'unknown flag exit code',
  unknownFlag.status === 2,
  `expected 2, got ${String(unknownFlag.status)}`,
);
check(
  'unknown flag guidance on stderr',
  unknownFlag.stderr.includes('--nope'),
  unknownFlag.stderr.slice(0, 200),
);

const duplicateSuite = spawnSync(
  process.execPath,
  [BIN, '--target', 'https://x.test/mcp', '--suite', 'protocol', '--suite', 'protocol'],
  { cwd: REPO_ROOT, encoding: 'utf8' },
);
check(
  'duplicate --suite exit code',
  duplicateSuite.status === 2,
  `expected 2, got ${String(duplicateSuite.status)}`,
);
check(
  'duplicate --suite guidance on stderr',
  duplicateSuite.stderr.includes('duplicate --suite'),
  duplicateSuite.stderr.slice(0, 200),
);

if (failures.length > 0) {
  process.stderr.write(`SMOKE FAILED (mcp-conformance-cli):\n${failures.join('\n')}\n`);
  process.exit(1);
}
process.stdout.write(
  'SMOKE OK (mcp-conformance-cli): artefact shape + help + usage-error truth-set verified\n',
);
