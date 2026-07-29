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
  // MCP-337: the declarations moved to resource-registrations.ts, and the
  // NAME const became an export so the descriptor derives labels from it.
  C337: {
    [RESOURCE_REGISTRATIONS]: [
      "export const OAK_UNDER_THE_HOOD_RESOURCE_NAME = 'Oak: Under the Hood orientation';",
      "export const OAK_UNDER_THE_HOOD_RESOURCE_URI = 'docs://oak/under-the-hood.md';",
    ],
  },
  C338: {
    [RESOURCE_REGISTRATIONS]: [
      "      description:\n        'How Oak builds and delivers its curriculum — the project/effort/ecosystem, its purpose ' +\n        'and machinery, and how to engage. For assistants and integrators; a separate concern ' +\n        'from curriculum content, which the curriculum tools serve.',",
    ],
  },
  C339: {
    [RESOURCE_REGISTRATIONS]: [
      "      annotations: {\n        priority: 0.2,\n        audience: ['assistant'],\n      },",
    ],
  },
  C340: {
    [RESOURCE_REGISTRATIONS]: [
      "  const pointer =\n    '# Oak: Under the Hood — orientation method\\n\\n' +\n    'This resource is a pointer, not a copy. Fetch the canonical orientation method and follow ' +\n    'it to orient the user to this repository (the Oak Open Curriculum Ecosystem), framed by ' +\n    \"Oak's public mission and strategy:\\n\\n\" +\n    `- Canonical method (always reachable): ${CANONICAL_SKILL_URL}\\n\\n` +\n    'Relay Oak’s official wording from its public site; never surface a person’s name.\\n';",
      "    () => ({\n      contents: [{ uri, mimeType: 'text/markdown', text: pointer }],\n    }),",
    ],
  },
  C690: {
    'apps/oak-curriculum-mcp-streamable-http/src/register-widget-resource.ts': [
      "export const WIDGET_RESOURCE_NAME = 'Oak Curriculum App';",
      'registerAppResource(\n    server,\n    WIDGET_RESOURCE_NAME,\n    WIDGET_URI,',
    ],
  },
};
