import type { TSESTree } from '@typescript-eslint/utils';

import { createMessage, type RuleWithReappraisingMessages } from '../reappraising-message.js';
import { isVercelFunctionsComposeFile, VERCEL_FUNCTIONS_PACKAGE } from './boundary.js';

function isVercelFunctionsSpecifier(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    (value === VERCEL_FUNCTIONS_PACKAGE || value.startsWith(`${VERCEL_FUNCTIONS_PACKAGE}/`))
  );
}

function readLiteralSpecifier(node: TSESTree.Node): string | undefined {
  if (node.type !== 'Literal' || !isVercelFunctionsSpecifier(node.value)) {
    return undefined;
  }
  return node.value;
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
const noVercelFunctionsImportsRule: RuleWithReappraisingMessages<'vercelFunctionsImportBanned'> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Allow @vercel/functions imports only inside the product-analytics compose module.',
    },
    schema: [],
    messages: {
      vercelFunctionsImportBanned: createMessage({
        prohibition:
          'Importing "{{specifier}}" outside src/compose-product-analytics-runtime.ts is forbidden.',
        reappraisal:
          'Consume the hosting lifetime hook via the compose module re-export (hostingWaitUntil); the MCP-241 ruling keeps @vercel/functions at exactly one import site.',
      }),
    },
  },
  defaultOptions: [],

  create(context) {
    const filename = context.physicalFilename ?? context.filename;
    if (filename && isVercelFunctionsComposeFile(filename)) {
      return {};
    }

    function report(node: TSESTree.Node, source: TSESTree.Node): void {
      const specifier = readLiteralSpecifier(source);
      if (specifier === undefined) {
        return;
      }
      context.report({
        node,
        messageId: 'vercelFunctionsImportBanned',
        data: { specifier },
      });
    }

    return {
      ImportDeclaration(node) {
        report(node, node.source);
      },
      ExportNamedDeclaration(node) {
        if (node.source !== null) {
          report(node, node.source);
        }
      },
      ExportAllDeclaration(node) {
        report(node, node.source);
      },
      ImportExpression(node) {
        report(node, node.source);
      },
      TSImportType(node) {
        report(node, node.source);
      },
      TSImportEqualsDeclaration(node) {
        if (node.moduleReference.type === 'TSExternalModuleReference') {
          report(node, node.moduleReference.expression);
        }
      },
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'require' &&
          node.arguments.length > 0
        ) {
          const firstArgument = node.arguments[0];
          if (firstArgument !== undefined && firstArgument.type !== 'SpreadElement') {
            report(node, firstArgument);
          }
        }
      },
    };
  },
};

export { noVercelFunctionsImportsRule };
