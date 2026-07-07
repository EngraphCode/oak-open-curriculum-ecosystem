import { spawnSync } from 'node:child_process';
import { accessSync, constants, existsSync, statSync } from 'node:fs';
import path from 'node:path';

import { err, ok, type Result } from '@oaknational/result';

import {
  buildGitleaksDirArgs,
  GITLEAKS_LEAK_EXIT_CODE,
  type SecretScan,
} from './refound-freeze-helpers.js';

/**
 * The pinned-gitleaks scanner seam for `refound-freeze` (F1 §8.3): resolve
 * the binary from `PATH` exactly once, probe its version for the run's
 * attestation line, and build the per-file scan closure over the resolved
 * ABSOLUTE path — no spawn ever searches `PATH` again (S4036), and the run
 * names one pinned binary. The invocation shape itself stays in
 * `refound-freeze-helpers.ts` (`buildGitleaksDirArgs`).
 *
 * @packageDocumentation
 */

/**
 * Resolve the `gitleaks` binary to an ABSOLUTE path by walking a `PATH`
 * value ONCE — every scan process then spawns the resolved path, never a
 * bare name (S4036: no per-spawn `PATH` re-search across the ~two scans per
 * corpus file, and the run's attestation names ONE pinned binary). The
 * caller's `PATH` is honoured exactly once, at this single auditable point;
 * a missing binary is a refusal. Exported for the discrimination proof.
 */
export function resolveGitleaksBin(envPath: string | undefined): Result<string, Error> {
  const entries = (envPath ?? '').split(path.delimiter).filter((entry) => entry !== '');
  for (const entry of entries) {
    const candidate = path.resolve(entry, 'gitleaks');
    try {
      if (!statSync(candidate).isFile()) {
        continue;
      }
      accessSync(candidate, constants.X_OK);
      return ok(candidate);
    } catch {
      continue; // Not present (or not executable) in this entry — keep walking.
    }
  }
  return err(
    new Error(
      'gitleaks not found on PATH — the secret scan cannot run; install gitleaks or add its ' +
        'directory to PATH',
    ),
  );
}

/**
 * Probe the resolved binary's self-reported version for the run's operator
 * attestation line. A binary that cannot print its version will not scan
 * either, so a failed probe is a refusal. Exported for the proof.
 */
export function probeGitleaksVersion(binAbsPath: string): Result<string, Error> {
  const probe = spawnSync(binAbsPath, ['version'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });
  if (probe.error !== undefined) {
    return err(new Error(`cannot probe gitleaks version: ${probe.error.message}`));
  }
  if (probe.status !== 0 || probe.stdout.trim() === '') {
    return err(
      new Error(
        `gitleaks version probe failed (exit ${String(probe.status)})` +
          (probe.stderr.trim() === '' ? '' : `: ${probe.stderr.trim()}`),
      ),
    );
  }
  return ok(probe.stdout.trim());
}

/**
 * Production secret scan over a PINNED gitleaks binary: no-git `dir` mode,
 * one process per file with the repo root as cwd (see
 * {@link buildGitleaksDirArgs} for the empirically verified invocation shape
 * and its foot-guns). Refuses when the repo's `.gitleaks.toml` is absent
 * rather than silently scanning with a different rule set. Reports leaking
 * FILES only — never finding contents.
 */
export const makeGitleaksSecretScan =
  (repoRoot: string, binAbsPath: string): SecretScan =>
  (absFilePaths) => {
    if (!existsSync(path.join(repoRoot, '.gitleaks.toml'))) {
      return Promise.resolve(
        err(new Error('secret scan cannot run: .gitleaks.toml not found at the repo root')),
      );
    }
    const leakingFiles: string[] = [];
    for (const absFilePath of absFilePaths) {
      const relPath = path.relative(repoRoot, absFilePath);
      // stderr is captured for failure diagnostics only; gitleaks runs with
      // --redact=100 and --log-level error, so it never carries finding bytes.
      const scan = spawnSync(binAbsPath, [...buildGitleaksDirArgs(relPath)], {
        cwd: repoRoot,
        stdio: ['ignore', 'ignore', 'pipe'],
        encoding: 'utf8',
      });
      if (scan.error !== undefined) {
        return Promise.resolve(
          err(new Error(`secret scan failed to run gitleaks: ${scan.error.message}`)),
        );
      }
      if (scan.status === GITLEAKS_LEAK_EXIT_CODE) {
        leakingFiles.push(relPath);
      } else if (scan.status !== 0) {
        const stderrTail = scan.stderr.trim();
        return Promise.resolve(
          err(
            new Error(
              `secret scan failed on '${relPath}' (gitleaks exit ${String(scan.status)})` +
                (stderrTail === '' ? '' : `: ${stderrTail}`),
            ),
          ),
        );
      }
    }
    if (leakingFiles.length > 0) {
      return Promise.resolve(
        err(
          new Error(
            `secret scan found potential leaks in ${String(leakingFiles.length)} file(s): ` +
              `${leakingFiles.join(', ')} — owner escalation required, never a skip`,
          ),
        ),
      );
    }
    return Promise.resolve(ok(undefined));
  };
