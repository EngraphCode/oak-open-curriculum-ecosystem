/**
 * Reviewed current-source anchors for the resource-registration audit items.
 *
 * Entries here are explicit semantic hand-offs; changing one is a compliance
 * review act. Split from `current-item-anchor-overrides.ts` when the MCP-337
 * relocations took the composed record over the file-size gate.
 */

const RESOURCE_REGISTRATIONS =
  'apps/oak-curriculum-mcp-streamable-http/src/resource-registrations.ts';

export const CURRENT_REGISTRATION_ITEM_ANCHOR_OVERRIDES: Readonly<
  Record<string, Readonly<Record<string, readonly string[]>>>
> = {
  // MCP-337: the per-resource registration bodies extracted verbatim from
  // register-resources.ts to resource-registrations.ts; each relocated row
  // re-anchors on the same content at its new home.
  C336: {
    [RESOURCE_REGISTRATIONS]: [
      '  server.registerResource(name, uri, metadata, () => {\n    const content = getDocumentationContent(uri);\n    return {\n      contents: [\n        {\n          uri,\n          mimeType: resource.mimeType,\n          text: content ?? `# ${resource.title}\\n\\nContent not found.`,\n        },\n      ],\n    };\n  });',
    ],
  },
  // MCP-241: registration names promoted to shared consts; the pinned
  // identities live in the exported declarations (revision 'unchanged').
  // MCP-353: C337–C340 (the under-the-hood pointer resource) retired with the
  // resource itself — no current anchors; the retirement rides the lineage.
  C690: {
    'apps/oak-curriculum-mcp-streamable-http/src/register-widget-resource.ts': [
      "export const WIDGET_RESOURCE_NAME = 'Oak Curriculum App';",
      'registerAppResource(\n    server,\n    WIDGET_RESOURCE_NAME,\n    WIDGET_URI,',
    ],
  },
};
