import { Linter } from '@typescript-eslint/utils/ts-eslint';
import { describe, expect, it } from 'vitest';

import { strict } from '../configs/strict.js';

/**
 * Engine-level pins for the MCP-241 `@vercel/functions` single-module
 * boundary: the dedicated rule fires through the real strict config — and
 * survives a later `no-restricted-imports` override — everywhere except the
 * one exempt compose module.
 */

const VENDOR_IMPORT_SPECIFIERS = ['@vercel/functions', '@vercel/functions/oidc'] as const;

const COMPOSE_MODULE_FILENAME =
  'apps/oak-curriculum-mcp-streamable-http/src/compose-product-analytics-runtime.ts';

const DENIED_FILENAMES = [
  ['another app module', 'apps/oak-curriculum-mcp-streamable-http/src/handlers.ts'],
  [
    'the compose module sibling test',
    'apps/oak-curriculum-mcp-streamable-http/src/compose-product-analytics-runtime.integration.test.ts',
  ],
  ['a core package module', 'packages/core/example/src/fixture.ts'],
] as const;

const IMPORT_FORMS = [
  ['value import', (specifier: string) => `import vendor from '${specifier}';\nvoid vendor;`],
  [
    'named re-export',
    (specifier: string) => `export { waitUntil as hostingWaitUntil } from '${specifier}';`,
  ],
  ['export-all', (specifier: string) => `export * from '${specifier}';`],
  ['dynamic import', (specifier: string) => `void import('${specifier}');`],
  [
    'type-import query',
    (specifier: string) =>
      `type VendorHook = import('${specifier}').Request;\nexport type { VendorHook };`,
  ],
  [
    'import-equals declaration',
    (specifier: string) => `import vendor = require('${specifier}');\nvoid vendor;`,
  ],
  [
    'CommonJS require',
    (specifier: string) => `const vendor = require('${specifier}');\nvoid vendor;`,
  ],
] as const;

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

const linter = new Linter({ configType: 'flat' });

function lintStrictVercelImport(source: string, filename: string) {
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

describe('exclusive @vercel/functions compose-module boundary', () => {
  describe.each(DENIED_FILENAMES)('%s', (_name, filename) => {
    describe.each(IMPORT_FORMS)('%s', (_form, sourceForSpecifier) => {
      it.each(VENDOR_IMPORT_SPECIFIERS)(
        'rejects %s after a later no-restricted-imports override',
        (specifier) => {
          const issues = lintStrictVercelImport(sourceForSpecifier(specifier), filename);

          expect(issues.map((issue) => issue.ruleId)).toContain(
            '@oaknational/no-vercel-functions-imports',
          );
        },
      );
    });
  });

  describe.each(IMPORT_FORMS)('%s', (_form, sourceForSpecifier) => {
    it.each(VENDOR_IMPORT_SPECIFIERS)('exempts the compose module for %s', (specifier) => {
      const issues = lintStrictVercelImport(sourceForSpecifier(specifier), COMPOSE_MODULE_FILENAME);

      expect(issues.map((issue) => issue.ruleId)).not.toContain(
        '@oaknational/no-vercel-functions-imports',
      );
    });
  });

  it('leaves unrelated specifiers alone', () => {
    const issues = lintStrictVercelImport(
      `import vendor from '@vercel/functions-lookalike';\nvoid vendor;`,
      'packages/core/example/src/fixture.ts',
    );

    expect(issues.map((issue) => issue.ruleId)).not.toContain(
      '@oaknational/no-vercel-functions-imports',
    );
  });
});
