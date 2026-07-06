import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { resolveRepoRoot } from '../core/repo-root.js';
import { writeLine, writeErrorLine } from '../core/terminal-output.js';

import {
  binPathFromManifest,
  interpretSpawnOutcome,
  interpretTscOutcome,
} from './bootstrap-helpers.js';

/**
 * Install-time bootstrap, run by the root `postinstall` via `tsx`.
 *
 * Builds `@oaknational/agent-tools` `dist` so the repo's PreToolUse guards
 * (`.claude/settings.json`) and agent CLIs are available immediately after
 * `pnpm install`. It reproduces agent-tools' own build script
 * (`tsc -p tsconfig.build.json` + the executable-bit chmod) by invoking `tsc`
 * directly, so the build orchestrator (`turbo`) and the package manager stay
 * out of the install lifecycle — enforced by the `validate-lifecycle-scripts`
 * validator.
 *
 * agent-tools imports two workspace packages (`@oaknational/result`,
 * `@oaknational/safe-path`) whose exports resolve to built `dist` only —
 * there is no source-pointing export condition. On a fresh checkout (Vercel,
 * CI, a new worktree) `postinstall` runs before any orchestrated build, so
 * this bootstrap first builds that two-package closure with each package's
 * own toolchain (`tsup` for JS, `tsc --emitDeclarationOnly` for types),
 * skipping any dep whose `dist` already exists.
 *
 * `typescript` is a direct dependency of agent-tools, so it is present in dev
 * and `--prod` installs alike; a missing compiler therefore signals a corrupt
 * install and fails loudly rather than silently leaving the fail-open guards
 * without `dist`. Set `OAK_SKIP_AGENT_TOOLS_BOOTSTRAP=1` to opt out deliberately.
 *
 * @packageDocumentation
 */

const repoRoot = resolveRepoRoot(import.meta.url);
const agentToolsDir = path.join(repoRoot, 'agent-tools');

/**
 * The workspace packages agent-tools' own build depends on, in build order.
 * Leaf packages only (neither has runtime workspace deps of its own).
 */
const WORKSPACE_DEP_DIRS = ['packages/core/result', 'packages/core/safe-path'] as const;

/** Set the executable bit on every compiled CLI entry, mirroring the build script. */
function markExecutableArtifacts(): void {
  const binDir = path.join(agentToolsDir, 'dist', 'src', 'bin');
  if (existsSync(binDir)) {
    for (const entry of readdirSync(binDir)) {
      if (entry.endsWith('.js')) {
        chmodSync(path.join(binDir, entry), 0o755);
      }
    }
  }
  const statuslinePath = path.join(
    agentToolsDir,
    'dist',
    'src',
    'claude',
    'statusline-identity.js',
  );
  if (existsSync(statuslinePath)) {
    chmodSync(statuslinePath, 0o755);
  }
}

/** Run one build step under the current node binary, exiting loudly on failure. */
function runStep(label: string, binPath: string, args: readonly string[], cwd: string): void {
  const result = spawnSync(process.execPath, [binPath, ...args], { cwd, stdio: 'inherit' });
  const verdict = interpretSpawnOutcome(label, {
    error: result.error,
    signal: result.signal,
    status: result.status,
  });
  if (verdict.failed) {
    const reason = verdict.reason ?? `${label} failed`;
    writeErrorLine(`[bootstrap-agent-tools] ${reason}`);
    process.exit(verdict.exitCode);
  }
}

/**
 * Build one workspace dep with its own toolchain (tsup JS + tsc declarations),
 * unless its `dist` is already present from an earlier build.
 */
function buildWorkspaceDep(depRelDir: string, tscBin: string): void {
  const depDir = path.join(repoRoot, depRelDir);
  const depName = path.basename(depRelDir);
  if (
    existsSync(path.join(depDir, 'dist', 'index.js')) &&
    existsSync(path.join(depDir, 'dist', 'index.d.ts'))
  ) {
    return;
  }
  const depRequire = createRequire(path.join(depDir, 'package.json'));
  let tsupManifestPath: string;
  try {
    tsupManifestPath = depRequire.resolve('tsup/package.json');
  } catch {
    writeErrorLine(
      `[bootstrap-agent-tools] cannot resolve "tsup" from ${depRelDir} — the install looks incomplete.`,
    );
    process.exit(1);
  }
  const tsupManifest: unknown = JSON.parse(readFileSync(tsupManifestPath, 'utf8'));
  const tsupBin = binPathFromManifest(path.dirname(tsupManifestPath), tsupManifest, 'tsup');
  if (tsupBin === undefined) {
    writeErrorLine(
      `[bootstrap-agent-tools] the resolved tsup manifest for ${depRelDir} has no usable bin entry.`,
    );
    process.exit(1);
  }
  runStep(`tsup (${depName})`, tsupBin, [], depDir);
  runStep(
    `tsc declarations (${depName})`,
    tscBin,
    ['--emitDeclarationOnly', '--project', path.join(depDir, 'tsconfig.build.json')],
    depDir,
  );
  writeLine(`[bootstrap-agent-tools] built ${depRelDir}/dist`);
}

function main(): void {
  if (process.env.OAK_SKIP_AGENT_TOOLS_BOOTSTRAP === '1') {
    writeLine('[bootstrap-agent-tools] skipped (OAK_SKIP_AGENT_TOOLS_BOOTSTRAP=1)');
    return;
  }

  let tscBin: string;
  try {
    tscBin = createRequire(path.join(agentToolsDir, 'package.json')).resolve('typescript/bin/tsc');
  } catch {
    writeErrorLine(
      '[bootstrap-agent-tools] cannot resolve "typescript" from agent-tools — the install looks incomplete.',
    );
    writeErrorLine(
      '[bootstrap-agent-tools] Re-run `pnpm install`, or set OAK_SKIP_AGENT_TOOLS_BOOTSTRAP=1 to bypass deliberately.',
    );
    process.exit(1);
  }

  for (const depRelDir of WORKSPACE_DEP_DIRS) {
    buildWorkspaceDep(depRelDir, tscBin);
  }

  const result = spawnSync(
    process.execPath,
    [tscBin, '-p', path.join(agentToolsDir, 'tsconfig.build.json')],
    { cwd: agentToolsDir, stdio: 'inherit' },
  );
  const verdict = interpretTscOutcome({
    error: result.error,
    signal: result.signal,
    status: result.status,
  });
  if (verdict.failed) {
    writeErrorLine(`[bootstrap-agent-tools] ${verdict.reason ?? 'tsc build failed'}`);
    process.exit(verdict.exitCode);
  }

  markExecutableArtifacts();
  writeLine('[bootstrap-agent-tools] built agent-tools/dist');
}

main();
