import { Linter } from '@typescript-eslint/utils/ts-eslint';
import type { Linter as ESLintLinter } from 'eslint';
import { plugin as typescriptEslintPlugin } from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

import { strict } from '../configs/strict.js';
import {
  appArchitectureRules,
  coreBoundaryRules,
  createLibBoundaryRules,
  createSdkBoundaryRules,
  POSTHOG_VENDOR_PACKAGES,
} from './boundary.js';

const VENDOR_IMPORT_SPECIFIERS = POSTHOG_VENDOR_PACKAGES.flatMap((packageName) => [
  packageName,
  `${packageName}/instrumentation`,
]);

const DEDICATED_RULE_IMPORT_FORMS = [
  [
    'named re-export',
    (specifier: string) => `export { capture as vendorCapture } from '${specifier}';`,
  ],
  ['export-all', (specifier: string) => `export * from '${specifier}';`],
  ['dynamic import', (specifier: string) => `void import('${specifier}');`],
  [
    'CommonJS require',
    (specifier: string) => `const vendor = require('${specifier}');\nvoid vendor;`,
  ],
] as const;

const DENIED_BOUNDARIES = [
  ['app', appArchitectureRules],
  ['core', coreBoundaryRules],
  ['SDK', createSdkBoundaryRules('runtime')],
  ['foundation library', createLibBoundaryRules('logger')],
  ['other adapter', createLibBoundaryRules('sentry-node')],
] as const;

const linter = new Linter({ configType: 'flat' });

const STRICT_FIXTURE_RULES_OFF = {
  '@typescript-eslint/no-misused-promises': 'off',
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-deprecated': 'off',
  '@typescript-eslint/consistent-return': 'off',
  '@typescript-eslint/consistent-type-exports': 'off',
  'sonarjs/no-alphabetical-sort': 'off',
  'sonarjs/void-use': 'off',
} as const;

function lintVendorImport(rules: Partial<ESLintLinter.RulesRecord>, specifier: string) {
  const restrictedImports = rules['@typescript-eslint/no-restricted-imports'];
  if (restrictedImports === undefined) {
    throw new Error('Expected the boundary to configure no-restricted-imports');
  }

  return linter.verify(
    `import vendorDefault from '${specifier}';\nvoid vendorDefault;`,
    [
      {
        files: ['**/*.ts'],
        plugins: {
          '@typescript-eslint': typescriptEslintPlugin,
        },
        rules: {
          '@typescript-eslint/no-restricted-imports': restrictedImports,
        },
      },
    ],
    { filename: 'src/fixture.ts' },
  );
}

function lintStrictVendorImport(
  specifier: string,
  filename: string,
  source = `import vendorDefault from '${specifier}';\nvoid vendorDefault;`,
) {
  return linter.verify(
    source,
    [
      ...strict,
      {
        rules: {
          '@typescript-eslint/no-restricted-imports': [
            'error',
            {
              paths: [{ name: 'zod', message: "Import from 'zod/v4' instead." }],
            },
          ],
        },
      },
      { rules: STRICT_FIXTURE_RULES_OFF },
    ],
    { filename },
  );
}

describe('exclusive PostHog vendor boundary', () => {
  describe.each(DENIED_BOUNDARIES)('%s consumer', (_name, rules) => {
    it.each(VENDOR_IMPORT_SPECIFIERS)('rejects %s', (specifier) => {
      const issues = lintVendorImport(rules, specifier);

      expect(issues).toHaveLength(1);
      const issue = issues[0];
      expect(issue).toMatchObject({
        column: 1,
        line: 1,
        ruleId: '@typescript-eslint/no-restricted-imports',
        severity: 2,
      });
      expect(issue?.message).toContain(specifier);
      expect(issue?.message).toContain('packages/libs/posthog-node');
    });
  });

  it.each(VENDOR_IMPORT_SPECIFIERS)('allows the posthog-node adapter to import %s', (specifier) => {
    expect(lintVendorImport(createLibBoundaryRules('posthog-node'), specifier)).toStrictEqual([]);
  });

  it.each(VENDOR_IMPORT_SPECIFIERS)(
    'survives a later no-restricted-imports override for %s',
    (specifier) => {
      const issues = lintStrictVendorImport(specifier, 'packages/core/example/src/fixture.ts');

      expect(issues.map((issue) => issue.ruleId)).toContain(
        '@oaknational/no-posthog-vendor-imports',
      );
    },
  );

  it.each(VENDOR_IMPORT_SPECIFIERS)(
    'rejects a TypeScript import-type query for %s after a later override',
    (specifier) => {
      const issues = lintStrictVendorImport(
        specifier,
        'packages/core/example/src/fixture.ts',
        `type VendorEvent = import('${specifier}').EventMessage;\nexport type { VendorEvent };`,
      );

      expect(issues.map((issue) => issue.ruleId)).toContain(
        '@oaknational/no-posthog-vendor-imports',
      );
    },
  );

  it.each(VENDOR_IMPORT_SPECIFIERS)(
    'rejects a TypeScript import-equals declaration for %s after a later override',
    (specifier) => {
      const issues = lintStrictVendorImport(
        specifier,
        'packages/core/example/src/fixture.ts',
        `import vendor = require('${specifier}');\nvoid vendor;`,
      );

      expect(issues.map((issue) => issue.ruleId)).toContain(
        '@oaknational/no-posthog-vendor-imports',
      );
    },
  );

  describe.each(DEDICATED_RULE_IMPORT_FORMS)('%s', (_form, sourceForSpecifier) => {
    it.each(VENDOR_IMPORT_SPECIFIERS)('rejects %s after a later override', (specifier) => {
      const issues = lintStrictVendorImport(
        specifier,
        'packages/core/example/src/fixture.ts',
        sourceForSpecifier(specifier),
      );

      expect(issues.map((issue) => issue.ruleId)).toContain(
        '@oaknational/no-posthog-vendor-imports',
      );
    });
  });

  it.each(VENDOR_IMPORT_SPECIFIERS)(
    'keeps the dedicated strict rule exempt for the adapter importing %s',
    (specifier) => {
      const issues = lintStrictVendorImport(specifier, 'packages/libs/posthog-node/src/fixture.ts');

      expect(issues.map((issue) => issue.ruleId)).not.toContain(
        '@oaknational/no-posthog-vendor-imports',
      );
    },
  );
});
