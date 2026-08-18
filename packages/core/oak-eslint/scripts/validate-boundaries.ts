import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  APP_PACKAGE_IMPORTS,
  DESIGN_PACKAGE_IMPORTS,
  LIB_PACKAGES,
  SDK_PACKAGE_IMPORTS,
  TOOLING_PACKAGE_IMPORTS,
} from '../src/rules/boundary.js';
import {
  TIER_PATH,
  checkIdentityPackTier,
  diffInventory,
  type IdentityPackTierEntry,
} from '../src/rules/boundary-inventory.js';

const repoRoot = resolve(import.meta.dirname, '../../../..');

function readPackageName(packageJsonPath: string): string {
  const packageJson: unknown = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  if (
    typeof packageJson !== 'object' ||
    packageJson === null ||
    !('name' in packageJson) ||
    typeof packageJson.name !== 'string'
  ) {
    throw new Error(`Expected ${packageJsonPath} to contain a string package name`);
  }

  return packageJson.name;
}

/**
 * Names every workspace directly under relativeDir that carries a
 * package.json. Directories without one (the identity-pack tier at
 * packages/design/identities) are invisible to this scan by construction —
 * such tiers need their own leg below, or they are silently unguarded.
 */
function readWorkspacePackageNames(relativeDir: string): string[] {
  const workspaceDir = resolve(repoRoot, relativeDir);

  return readdirSync(workspaceDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(workspaceDir, entry.name, 'package.json'))
    .filter((packageJsonPath) => existsSync(packageJsonPath))
    .map((packageJsonPath) => readPackageName(packageJsonPath));
}

/**
 * Every entry name the walk treats as a transient local artefact rather
 * than pack content. Enumerated, never pattern-matched: a blanket
 * dot-entry skip would hide committed content (`.npmrc`, an
 * `.eslintrc.json`, a hidden source directory) from the anatomy's
 * refusals, so anything not on this list — dot-prefixed or not — is
 * listed and validated.
 */
const TRANSIENT_ENTRY_NAMES: ReadonlySet<string> = new Set(['node_modules', '.turbo', '.DS_Store']);

/**
 * Pack-relative paths of every file and every symbolic link under packDir
 * (transient artefacts above excluded) — the input the pure anatomy check
 * enforces the data-only invariant over. Symlinks are LISTED, not
 * followed: a link is neither a directory nor a regular file, and
 * silently omitting it would let a pack carry linked source or an asset
 * link escaping the pack while reading well-shaped.
 */
function listPackFiles(packDir: string): { files: string[]; symlinks: string[] } {
  const files: string[] = [];
  const symlinks: string[] = [];
  const walk = (dir: string, prefix: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (TRANSIENT_ENTRY_NAMES.has(entry.name)) {
        continue;
      }
      const relativePath = prefix === '' ? entry.name : `${prefix}/${entry.name}`;
      if (entry.isSymbolicLink()) {
        symlinks.push(relativePath);
      } else if (entry.isDirectory()) {
        walk(resolve(dir, entry.name), relativePath);
      } else if (entry.isFile()) {
        files.push(relativePath);
      }
    }
  };
  walk(packDir, '');

  return { files, symlinks };
}

function readIdentityPackTier(): {
  tierExists: boolean;
  entries: IdentityPackTierEntry[];
} {
  const tierDir = resolve(repoRoot, TIER_PATH);

  if (!existsSync(tierDir)) {
    return { tierExists: false, entries: [] };
  }

  const entries = readdirSync(tierDir, { withFileTypes: true })
    // Local tooling artefacts (node_modules, .turbo and friends) are never
    // tier members and must not be misdiagnosed as malformed packs.
    .filter(
      (entry) =>
        entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.'),
    )
    .map((entry) => {
      const packageJsonPath = resolve(tierDir, entry.name, 'package.json');
      const { files, symlinks } = listPackFiles(resolve(tierDir, entry.name));

      if (!existsSync(packageJsonPath)) {
        return { directoryName: entry.name, packageJson: undefined, files, symlinks };
      }

      try {
        const packageJson: unknown = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

        return { directoryName: entry.name, packageJson, files, symlinks };
      } catch (error) {
        return {
          directoryName: entry.name,
          packageJson: undefined,
          files,
          symlinks,
          parseFailure: error instanceof Error ? error.message : String(error),
        };
      }
    });

  return { tierExists: true, entries };
}

function main(): void {
  const inventoryLegs: readonly (readonly string[])[] = [
    diffInventory(
      'Library boundary inventory',
      [...LIB_PACKAGES].map((packageName) => `@oaknational/${packageName}`),
      readWorkspacePackageNames('packages/libs'),
    ),
    diffInventory('App boundary inventory', APP_PACKAGE_IMPORTS, readWorkspacePackageNames('apps')),
    diffInventory(
      'SDK boundary inventory',
      SDK_PACKAGE_IMPORTS,
      readWorkspacePackageNames('packages/sdks'),
    ),
    diffInventory(
      'Design boundary inventory',
      DESIGN_PACKAGE_IMPORTS,
      readWorkspacePackageNames('packages/design'),
    ),
    diffInventory('Tooling boundary inventory', TOOLING_PACKAGE_IMPORTS, [
      readPackageName(resolve(repoRoot, 'agent-tools/package.json')),
    ]),
  ];

  const { tierExists, entries } = readIdentityPackTier();
  const failures: readonly string[] = [
    ...inventoryLegs.flat(),
    ...checkIdentityPackTier(tierExists, entries),
  ];

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(failure);
    }
    process.exitCode = 1;

    return;
  }

  console.log(
    `validate-boundaries: OK (${String(inventoryLegs.length)} inventories in sync; ` +
      `identity-pack tier: ${String(entries.length)} pack(s) well-shaped).`,
  );
}

main();
