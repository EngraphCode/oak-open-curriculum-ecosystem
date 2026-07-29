import { describe, expect, it } from 'vitest';

import { lintStrictVendorImport } from './strict-lint-harness.js';

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
  ['template-literal dynamic import', (specifier: string) => `void import(\`${specifier}\`);`],
  [
    'template-literal CommonJS require',
    (specifier: string) => `const vendor = require(\`${specifier}\`);\nvoid vendor;`,
  ],
] as const;

describe('exclusive @vercel/functions compose-module boundary', () => {
  describe.each(DENIED_FILENAMES)('%s', (_name, filename) => {
    describe.each(IMPORT_FORMS)('%s', (_form, sourceForSpecifier) => {
      it.each(VENDOR_IMPORT_SPECIFIERS)(
        'rejects %s after a later no-restricted-imports override',
        (specifier) => {
          const issues = lintStrictVendorImport(specifier, filename, sourceForSpecifier(specifier));

          expect(issues.map((issue) => issue.ruleId)).toContain(
            '@oaknational/no-vercel-functions-imports',
          );
        },
      );
    });
  });

  describe.each(IMPORT_FORMS)('%s', (_form, sourceForSpecifier) => {
    it.each(VENDOR_IMPORT_SPECIFIERS)('exempts the compose module for %s', (specifier) => {
      const issues = lintStrictVendorImport(
        specifier,
        COMPOSE_MODULE_FILENAME,
        sourceForSpecifier(specifier),
      );

      expect(issues.map((issue) => issue.ruleId)).not.toContain(
        '@oaknational/no-vercel-functions-imports',
      );
    });
  });

  it('leaves unrelated specifiers alone', () => {
    const issues = lintStrictVendorImport(
      '@vercel/functions-lookalike',
      'packages/core/example/src/fixture.ts',
    );

    expect(issues.map((issue) => issue.ruleId)).not.toContain(
      '@oaknational/no-vercel-functions-imports',
    );
  });
});
