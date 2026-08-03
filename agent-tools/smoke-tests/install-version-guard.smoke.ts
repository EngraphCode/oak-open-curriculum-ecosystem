import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { isErr } from '@oaknational/result';
import { z } from 'zod';

import { resolvePnpm } from '../src/spawn/pnpm-path.js';

/**
 * Prove the root pnpm preinstall hook blocks a mismatched pnpm before it can
 * rewrite an incompatible lockfile.
 *
 * The fixture copies the production lifecycle command and guard source, then
 * runs the installed pnpm binary against a deliberately old-format lockfile.
 * The guard must be the process that refuses the install, and the lockfile
 * bytes must remain identical.
 */

const smokeDir = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = resolve(smokeDir, '..', '..');
const rootPackageJson = z
  .object({ scripts: z.object({ 'pnpm:devPreinstall': z.string() }) })
  .safeParse(JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8')));
if (!rootPackageJson.success) {
  fail(`could not read root pnpm:devPreinstall: ${rootPackageJson.error.message}`);
}
const devPreinstall = rootPackageJson.data.scripts['pnpm:devPreinstall'];
const guardRelativePath = 'runtime-only-scripts/validate-package-manager-version.mjs';

if (devPreinstall !== `node ${guardRelativePath}`) {
  fail(`root pnpm:devPreinstall must invoke the version guard, got: ${devPreinstall}`);
}

const fixtureRoot = mkdtempSync(join(tmpdir(), 'oak-install-version-guard-'));
const fixtureGuardPath = join(fixtureRoot, guardRelativePath);
const originalLockfile = [
  "lockfileVersion: '6.0'",
  '',
  'settings:',
  '  autoInstallPeers: true',
  '  excludeLinksFromLockfile: false',
  '',
].join('\n');

try {
  mkdirSync(dirname(fixtureGuardPath), { recursive: true });
  copyFileSync(join(repoRoot, guardRelativePath), fixtureGuardPath);
  writeFileSync(
    join(fixtureRoot, 'package.json'),
    `${JSON.stringify(
      {
        name: 'install-version-guard-smoke',
        private: true,
        type: 'module',
        scripts: { 'pnpm:devPreinstall': devPreinstall },
        packageManager: 'pnpm@99.1.2+sha512.fixture',
      },
      undefined,
      2,
    )}\n`,
  );
  writeFileSync(join(fixtureRoot, 'pnpm-lock.yaml'), originalLockfile);

  const pnpm = resolvePnpm(process.env);
  if (isErr(pnpm)) {
    fail(pnpm.error.message);
  }

  const install = spawnSync(
    pnpm.value,
    ['install', '--offline', '--ignore-workspace', '--reporter=silent'],
    {
      cwd: fixtureRoot,
      encoding: 'utf8',
      env: { ...process.env, COREPACK_ENABLE_PROJECT_SPEC: '0' },
    },
  );

  if (install.error !== undefined) {
    fail(`could not start pnpm: ${install.error.message}`);
  }
  if (install.status !== 1) {
    fail(
      `mismatched install must exit 1, got ${String(install.status)}\n${install.stdout}${install.stderr}`,
    );
  }
  if (!install.stderr.includes('does not match the pinned pnpm 99.1.2')) {
    fail(`mismatched install did not report the version mismatch:\n${install.stderr}`);
  }
  if (!install.stderr.includes('corepack enable')) {
    fail(`mismatched install did not report the Corepack remedy:\n${install.stderr}`);
  }

  const finalLockfile = readFileSync(join(fixtureRoot, 'pnpm-lock.yaml'), 'utf8');
  if (finalLockfile !== originalLockfile) {
    fail('mismatched install changed pnpm-lock.yaml before the preinstall guard refused it');
  }

  process.stdout.write(
    'install-version-guard smoke OK: mismatch refused and lockfile remained byte-identical\n',
  );
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
