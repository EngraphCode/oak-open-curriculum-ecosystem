/**
 * Generate widget constants file from cross-domain constants.
 *
 * Creates `src/types/generated/widget-constants.ts` with WIDGET_URI constant
 * exported for consumption by handwritten SDK files and public API.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { BASE_WIDGET_URI, WIDGET_TOOL_NAMES } from './cross-domain-constants.js';
import type { Logger } from '@oaknational/logger';

const OUTPUT_PATH = resolve(import.meta.dirname, '../../src/types/generated/widget-constants.ts');

function generateWidgetConstantsFile(): string {
  return `/**
 * GENERATED FILE - DO NOT EDIT
 * 
 * Widget URI constants generated from sdk-codegen cross-domain constants.
 * 
 * @see code-generation/typegen/cross-domain-constants.ts - Single source of truth
 */

/**
 * Base URI for the Oak curriculum MCP App resource.
 *
 * This app renders tool output with Oak branding, logo, and styling.
 * All UI-bearing tools reference this URI in their \`_meta.ui.resourceUri\` field (ADR-141).
 *
 * **Cache-Busting Strategy**: The URI carries a deterministic per-build hash
 * derived at sdk-codegen time from the build identifier (git commit SHA on
 * deployed builds; the literal \`local\` in local dev). A code change yields a
 * new URI — the only cache-invalidation lever the MCP Apps standard gives a
 * server (hosts MAY cache \`ui://\` content with no invalidation mechanism) —
 * while same-code redeploys keep the same URI.
 *
 * **Format**: \`ui://widget/oak-curriculum-app-<hash>.html\`
 * **Example**: \`ui://widget/oak-curriculum-app-abc12345.html\`
 *
 * @see code-generation/typegen/cross-domain-constants.ts - Source of truth
 * @see https://modelcontextprotocol.io/extensions/apps/overview (MCP Apps standard)
 */
export const WIDGET_URI = ${JSON.stringify(BASE_WIDGET_URI)} as const;

/**
 * Tools that advertise a widget UI via \`_meta.ui.resourceUri\`.
 *
 * Only tools in this set have \`_meta.ui\` in their descriptors.
 * All other tools have no widget UI — MCP clients will not render
 * a widget for their results.
 *
 * @see code-generation/typegen/cross-domain-constants.ts - Source of truth
 */
export const WIDGET_TOOL_NAMES: ReadonlySet<string> = new Set(${JSON.stringify([...WIDGET_TOOL_NAMES])});
`;
}

export function generateWidgetConstants(logger: Logger): void {
  const outputDir = dirname(OUTPUT_PATH);
  mkdirSync(outputDir, { recursive: true });

  const content = generateWidgetConstantsFile();
  writeFileSync(OUTPUT_PATH, content, 'utf-8');

  logger.info('Generated widget constants', { path: OUTPUT_PATH });
}
