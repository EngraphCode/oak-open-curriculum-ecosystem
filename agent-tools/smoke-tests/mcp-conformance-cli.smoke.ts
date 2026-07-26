/**
 * Smoke test for the built `mcp-conformance` binary (MCP-189), satisfying
 * the testing-strategy invariant that every built binary lands with a smoke
 * proving its CLI truth-set network-free: the dist entrypoint cold-starts
 * under plain `node`, `--help` exits 0 with usage on stdout, and the two
 * usage-error paths (missing --target, unknown flag) exit 2 with guidance
 * on stderr and no stack trace.
 *
 * Requires the workspace to be built (the turbo `test:e2e` task depends on
 * `build`, so the pipeline guarantees it); a missing dist fails loudly with
 * the build command rather than spawning a package manager from PATH here
 * (S4036: only fixed executables are spawned — the current Node binary).
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
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

const help = spawnSync(process.execPath, [BIN, '--help'], { cwd: REPO_ROOT, encoding: 'utf8' });
check('help exit code', help.status === 0, `expected 0, got ${String(help.status)}`);
check(
  'help usage on stdout',
  help.stdout.includes('Usage: agent-tools mcp-conformance'),
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

if (failures.length > 0) {
  process.stderr.write(`SMOKE FAILED (mcp-conformance-cli):\n${failures.join('\n')}\n`);
  process.exit(1);
}
process.stdout.write('SMOKE OK (mcp-conformance-cli): help + usage-error truth-set verified\n');
