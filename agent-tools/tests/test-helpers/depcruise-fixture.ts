/**
 * Real-IO seam for the dependency-cruiser boundary-rule red-proofs:
 * builds a temp fixture tree, runs the repo's depcruise binary over it,
 * and tears it down. Kept out of the test file per the
 * no-real-io-in-tests convention (ADR-078) — integration tests import
 * this helper; the helper owns the filesystem and process calls.
 */

import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

export interface DepcruiseFixture {
  readonly dir: string;
  readonly writeFile: (relative: string, content: string) => void;
  readonly remove: () => void;
}

export function makeDepcruiseFixture(prefix: string): DepcruiseFixture {
  const dir = mkdtempSync(path.join(tmpdir(), prefix));
  return {
    dir,
    writeFile: (relative, content) => {
      const target = path.join(dir, relative);
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, content);
    },
    remove: () => {
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

/** Run the repo's depcruise binary over `scanDir` inside the fixture, returning raw JSON stdout. */
export function runDepcruiseJson(input: {
  readonly repoRoot: string;
  readonly fixtureDir: string;
  readonly configRelative: string;
  readonly scanDir: string;
}): string {
  const depcruiseBin = path.join(input.repoRoot, 'node_modules', '.bin', 'depcruise');
  const result = spawnSync(
    depcruiseBin,
    [input.scanDir, '--config', input.configRelative, '--output-type', 'json'],
    {
      cwd: input.fixtureDir,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  if (result.error !== undefined || typeof result.stdout !== 'string' || result.stdout === '') {
    throw new Error(
      `depcruise spawn failed (bin: ${depcruiseBin}): ` +
        `error=${result.error?.message ?? 'none'} status=${String(result.status)} ` +
        `stderr=${result.stderr}`,
    );
  }
  return result.stdout;
}
