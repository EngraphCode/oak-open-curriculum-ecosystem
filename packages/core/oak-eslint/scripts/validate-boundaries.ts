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

function readIdentityPackTier(): {
  tierExists: boolean;
  entries: IdentityPackTierEntry[];
} {
  const tierDir = resolve(repoRoot, 'packages/design/identities');

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

      if (!existsSync(packageJsonPath)) {
        return { directoryName: entry.name, packageJson: undefined };
      }

      try {
        const packageJson: unknown = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

        return { directoryName: entry.name, packageJson };
      } catch (error) {
        return {
          directoryName: entry.name,
          packageJson: undefined,
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
