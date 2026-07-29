import { createMessage } from '../reappraising-message.js';
import { isVercelFunctionsComposeFile, VERCEL_FUNCTIONS_PACKAGE } from './boundary.js';
import { createVendorImportRule } from './vendor-import-rule.js';

function isVercelFunctionsSpecifier(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    (value === VERCEL_FUNCTIONS_PACKAGE || value.startsWith(`${VERCEL_FUNCTIONS_PACKAGE}/`))
  );
}

/**
 * Enforces the MCP-241 single-module `@vercel/functions` boundary.
 *
 * @remarks
 * Intra-app single-site enforcement, deliberately narrower than the
 * estate-wide PostHog vendor fence: only the streamable-http app declares
 * the dependency (`import-x/no-extraneous-dependencies` already fences
 * every other workspace), and the MCP-241 ruling requires the import to
 * live at exactly one module — the composition-root re-export in
 * `apps/oak-curriculum-mcp-streamable-http/src/compose-product-analytics-runtime.ts`.
 * A dedicated rule rather than `no-restricted-imports` patterns for two
 * reasons: flat-config rule values replace rather than merge, so the fence
 * survives a workspace later customising `no-restricted-imports`; and the
 * exemption is a single FILE, which pattern-level config cannot express
 * without a per-file override block — a bypass surface.
 */
const noVercelFunctionsImportsRule = createVendorImportRule({
  description: 'Allow @vercel/functions imports only inside the product-analytics compose module.',
  messageId: 'vercelFunctionsImportBanned',
  messages: {
    vercelFunctionsImportBanned: createMessage({
      prohibition:
        'Importing "{{specifier}}" outside src/compose-product-analytics-runtime.ts is forbidden.',
      reappraisal:
        'Consume the hosting lifetime hook via the compose module re-export (hostingWaitUntil); the MCP-241 ruling keeps @vercel/functions at exactly one import site.',
    }),
  },
  isExemptFile: isVercelFunctionsComposeFile,
  isVendorSpecifier: isVercelFunctionsSpecifier,
});

export { noVercelFunctionsImportsRule };
