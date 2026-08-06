/**
 * `pre-push` secret-scan CLI: scans only the commits being pushed.
 *
 * The `.husky/pre-push` hook captures git's ref lines into a temp file and calls
 * this with `--remote <name> --refs-file <path>`. This is the thin IO adapter
 * around the pure {@link computePushScanRanges}: it resolves the ranges to scan,
 * runs gitleaks over each, and exits non-zero if any range reports a leak. The
 * full `--branches --tags` history scan stays in CI (`pnpm secrets:scan`).
 *
 * A file path (rather than a multi-line `--refs` value) is used so the ref text
 * survives pnpm's shell-command argument handling as a single clean token.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { computePushScanRanges, degradedScanWarning } from './compute-push-scan-ranges.js';

export interface PushSecretScanArgs {
  remoteName: string;
  refsText: string;
}

/**
 * Parse the hook-supplied argv: `--remote <name>` and either `--refs <text>`
 * (used directly) or `--refs-file <path>` (read via the injected `readFile`,
 * keeping this function testable without touching the filesystem).
 */
export function parseArgs(
  argv: readonly string[],
  readFile: (path: string) => string,
): PushSecretScanArgs {
  let remoteName = '';
  let refsText = '';
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index + 1] ?? '';
    switch (argv[index]) {
      case '--remote':
        remoteName = value;
        index += 1;
        break;
      case '--refs':
        refsText = value;
        index += 1;
        break;
      case '--refs-file':
        refsText = value ? readFile(value) : '';
        index += 1;
        break;
      default:
        break;
    }
  }
  return { remoteName, refsText };
}

/**
 * Run `scanRange` over each computed range. `scanRange` returns true when a
 * range is clean, false when gitleaks reports a leak or fails to run. Pure
 * orchestration over an injected scanner and an injected warning sink.
 *
 * A scan that has lost its incremental range is announced through `warn`
 * BEFORE the first range runs (R6) — after the walk, an operator has already
 * spent the minutes the warning exists to explain.
 *
 * @returns the process exit code: 0 when every range is clean, 1 otherwise.
 */
export function runPushSecretScan(
  args: PushSecretScanArgs,
  scanRange: (range: string) => boolean,
  warn: (message: string) => void,
): number {
  const ranges = computePushScanRanges(args);
  const degraded = degradedScanWarning(ranges, args);
  if (degraded !== undefined) {
    warn(degraded);
  }
  let allClean = true;
  for (const range of ranges) {
    if (!scanRange(range)) {
      allClean = false;
    }
  }
  return allClean ? 0 : 1;
}

/** Scan one range with gitleaks; its own output is inherited to the terminal. */
function scanRangeWithGitleaks(range: string): boolean {
  const result = spawnSync(
    'gitleaks',
    ['detect', '--redact=100', '--source', '.', `--log-opts=${range}`],
    {
      stdio: ['ignore', 'inherit', 'inherit'],
      env: {
        ...process.env,
        GIT_CONFIG_COUNT: '1',
        GIT_CONFIG_KEY_0: 'diff.renameLimit',
        GIT_CONFIG_VALUE_0: '3000',
      },
    },
  );
  if (result.error !== undefined) {
    process.stderr.write(`gitleaks failed to run: ${result.error.message}\n`);
    return false;
  }
  return result.status === 0;
}

const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFilePath) {
  const args = parseArgs(process.argv.slice(2), (path) => readFileSync(path, 'utf8'));
  process.exit(
    runPushSecretScan(args, scanRangeWithGitleaks, (message) => process.stderr.write(message)),
  );
}
