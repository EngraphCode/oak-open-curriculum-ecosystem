/**
 * Node IO for `agent-tools mcp-conformance` (MCP-189): the real spawn seam
 * over the lockfile-installed `@mcpjam/cli` bin, and raw-report retention
 * under a caller-chosen directory (absolute, or relative to the repo root).
 *
 * Bin resolution: the bare `@mcpjam/cli` specifier is resolved with a
 * `createRequire` anchored at the repo root — resolution-only, matching the
 * bootstrap precedent — which today yields `dist/index.js`, the same file
 * the package's `bin` entry names (verified 3.15.2; a future main/bin split
 * would fail loudly at the parse boundary). The child runs under the
 * current Node executable; no `npx`, no PATH lookup, no network at
 * install-drift risk.
 */
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

import { err, ok, type Result } from '@oaknational/result';

import { boundedExcerpt } from './bounded-excerpt.js';
import { type McpConformanceIo, type RetentionOutcome } from './io-port.js';
import { type McpjamSpawnResult } from './runner.js';
import { type ConformanceSuite } from './types.js';

/**
 * Generous per-suite ceiling: observed suite durations against the deployed
 * alpha are 1–4 s (2026-07-26); the ceiling exists so a hung SSE stream
 * cannot hold a CI job to the runner's own timeout.
 */
const SUITE_TIMEOUT_MS = 120_000;

/** Raw json-summary documents are single-digit KiB; 16 MiB is unreachable headroom. */
const MAX_STDOUT_BYTES = 16 * 1024 * 1024;

function resolveMcpjamBin(repoRoot: string): Result<string, Error> {
  try {
    return ok(createRequire(join(repoRoot, 'package.json')).resolve('@mcpjam/cli'));
  } catch (error) {
    return err(
      new Error(
        `@mcpjam/cli did not resolve from the repo root — run pnpm install (lockfile-declared devDependency): ${
          error instanceof Error ? error.message : String(error)
        }`,
      ),
    );
  }
}

function spawnMcpjam(
  repoRoot: string,
  binPath: string,
  args: readonly string[],
): Result<McpjamSpawnResult, Error> {
  const child = spawnSync(process.execPath, [binPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: SUITE_TIMEOUT_MS,
    maxBuffer: MAX_STDOUT_BYTES,
  });
  if (child.error !== undefined) {
    // A timeout sets BOTH `error` (ETIMEDOUT) and `signal`, so this branch
    // fires first — the captured streams must ride the error here too, or
    // the timeout case (where diagnostics matter most) loses them.
    return err(
      new Error(
        `${child.error.message}` +
          `${boundedExcerpt('partial stdout', child.stdout ?? '')}` +
          `${boundedExcerpt('stderr', child.stderr ?? '')}`,
      ),
    );
  }
  if (child.signal !== null) {
    // A signal death (typically the timeout ceiling) is a LAUNCH FAILURE to
    // the orchestration: retention never runs on this path, so no evidence
    // artefact survives it — bounded DIAGNOSTICS of both streams ride the
    // error instead, so the operator still sees what the child said.
    return err(
      new Error(
        `mcpjam died on signal ${child.signal} (timeout ceiling ${String(SUITE_TIMEOUT_MS)}ms)` +
          `${boundedExcerpt('partial stdout', child.stdout)}${boundedExcerpt('stderr', child.stderr)}`,
      ),
    );
  }
  return ok({ exitCode: child.status ?? undefined, stdout: child.stdout, stderr: child.stderr });
}

// Writes resolve against the repo root; an absolute reportDir stands as
// given. The REPORTED path preserves the caller's own form (relative in,
// repo-root-relative out; absolute in, absolute out) so the emitted
// report never names a path that does not exist.
function writeUnder(
  repoRoot: string,
  reportDir: string,
  fileName: string,
  content: string,
): RetentionOutcome {
  const writeDir = resolve(repoRoot, reportDir);
  const reportedPath = join(reportDir, fileName);
  const filePath = join(writeDir, fileName);
  try {
    mkdirSync(writeDir, { recursive: true });
    // OWNER-ONLY. Attended runs retain AUTHENTICATED vendor output here, and
    // the report shapes constrain none of `error`, `output`, `details` or the
    // captured stderr — a bearer or refresh token reaching any of them lands
    // in this file. The process default (0644 under a 022 umask) would make
    // that readable by every other user on a shared host.
    //
    // chmod AFTER the write, because `mode` applies at CREATION only: a report
    // left by an earlier run under a looser umask keeps its old permissions
    // otherwise, and a long-lived file is exactly the one that matters.
    writeFileSync(filePath, content, { encoding: 'utf8', mode: 0o600 });
    chmodSync(filePath, 0o600);
    return { ok: true, reportedPath };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function retainUnder(repoRoot: string, reportDir: string) {
  return (suite: ConformanceSuite, content: string): RetentionOutcome =>
    writeUnder(repoRoot, reportDir, `${suite}.json`, content);
}

/**
 * Persist the wrapper's own aggregate report as `<report-dir>/summary.json`
 * so the report directory (and any CI artifact built from it) carries the
 * verdict document — divergences and failure reasons — alongside the raw
 * per-suite evidence, and stdout purity is never load-bearing.
 */
export function writeRunSummary(
  repoRoot: string,
  reportDir: string,
  reportJson: string,
): RetentionOutcome {
  return writeUnder(repoRoot, reportDir, 'summary.json', reportJson);
}

/**
 * Build the real IO seam.
 *
 * @param repoRoot - Absolute repository root (worktree-safe, from `resolveRepoRoot`).
 * @param reportDir - Raw-report directory: absolute, or relative to the repo root.
 */
export function buildMcpConformanceNodeIo(repoRoot: string, reportDir: string): McpConformanceIo {
  return {
    runMcpjam: (args) => {
      const bin = resolveMcpjamBin(repoRoot);
      if (bin.ok) {
        return spawnMcpjam(repoRoot, bin.value, args);
      }
      return bin;
    },
    retainRawReport: retainUnder(repoRoot, reportDir),
  };
}
