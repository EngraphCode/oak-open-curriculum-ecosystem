/**
 * MCP Resource Registration
 *
 * Registers static resources with the MCP server, including:
 * - Documentation resources for the "start here" experience
 * - Curriculum model and the EEF interpretation guide
 * - MCP App widget resource (interactive React curriculum app)
 *
 * The graph corpora have no whole-corpus resource form: prior knowledge,
 * misconceptions, and thread progressions are served by their anchored tools
 * (`get-prior-knowledge-graph`, `get-misconception-graph`,
 * `get-thread-progressions`).
 */

import {
  DOCUMENTATION_RESOURCES,
  getDocumentationContent,
  CURRICULUM_MODEL_RESOURCE,
  getCurriculumModelJson,
  EEF_INTERPRETATION_RESOURCE,
  getEefInterpretationMarkdown,
} from '@oaknational/curriculum-sdk/public/mcp-tools.js';

import {
  type ResourceRegistrar,
  type ResourceRegistrationOptions,
} from './register-resource-helpers.js';
import { registerWidgetResource } from './register-widget-resource.js';
import { EXPLAIN_ORIENTATION_BODY, EXPLAIN_LAST_MODIFIED } from './generated/explain-content.js';

/**
 * Registers documentation resources for the "start here" experience.
 *
 * The getting-started guide is the documentation resource exposed via
 * resources/list and resources/read. Tool categories, workflows, and tips are
 * single-sourced through the canonical `curriculum://model` resource (and the
 * `get-curriculum-model` tool), not duplicated as separate doc resources.
 *
 * @param server - MCP server instance
 */
export function registerDocumentationResources(server: ResourceRegistrar): void {
  for (const resource of DOCUMENTATION_RESOURCES) {
    const { name, uri, ...metadata } = resource;
    server.registerResource(name, uri, metadata, () => {
      const content = getDocumentationContent(uri);
      return {
        contents: [
          {
            uri,
            mimeType: resource.mimeType,
            text: content ?? `# ${resource.title}\n\nContent not found.`,
          },
        ],
      };
    });
  }
}

/** Registers the curriculum model as an MCP resource, complementing `get-curriculum-model`. */
export function registerCurriculumModelResource(server: ResourceRegistrar): void {
  const { name, uri, ...metadata } = CURRICULUM_MODEL_RESOURCE;
  server.registerResource(name, uri, metadata, () => ({
    contents: [
      {
        uri,
        mimeType: CURRICULUM_MODEL_RESOURCE.mimeType,
        text: getCurriculumModelJson(),
      },
    ],
  }));
}

/**
 * Registers the Oak effort-orientation resource (`docs://oak/explain.md`).
 *
 * A LOW-SALIENCE (`priority` low, `audience: ['assistant']`) `text/markdown` resource serving
 * the curated effort-orientation body — how Oak builds and delivers its curriculum (purpose,
 * machinery at executive altitude, how to engage) — for the minority audience (assistants /
 * integrators) that wants it. Effort-domain ONLY (owner separation principle): it never
 * describes curriculum content, which the curriculum tools serve. The body is the committed
 * generated constant, so the published surface reads no filesystem (ADR-041); `lastModified`
 * is the body's source-commit freshness signal.
 */
function registerExplainResource(server: ResourceRegistrar): void {
  const uri = 'docs://oak/explain.md';
  server.registerResource(
    'Oak effort orientation',
    uri,
    {
      title: 'Oak effort orientation',
      description:
        'How Oak builds and delivers its curriculum — the project/effort/ecosystem, its purpose ' +
        'and machinery, and how to engage. For assistants and integrators; a separate concern ' +
        'from curriculum content, which the curriculum tools serve.',
      mimeType: 'text/markdown',
      annotations: {
        priority: 0.2,
        audience: ['assistant'],
        lastModified: EXPLAIN_LAST_MODIFIED,
      },
    },
    () => ({
      contents: [{ uri, mimeType: 'text/markdown', text: EXPLAIN_ORIENTATION_BODY }],
    }),
  );
}

/**
 * Registers the EEF interpretation resource (`eef://interpretation`).
 *
 * A static `text/markdown` reasoning scaffold for the EEF Toolkit evidence
 * (content built SDK-side; ADR-179). Registered only when the EEF flag is on —
 * see `registerAllResources`.
 */
function registerEefInterpretationResource(server: ResourceRegistrar): void {
  const { name, uri, ...metadata } = EEF_INTERPRETATION_RESOURCE;
  server.registerResource(name, uri, metadata, () => ({
    contents: [
      {
        uri,
        mimeType: EEF_INTERPRETATION_RESOURCE.mimeType,
        text: getEefInterpretationMarkdown(),
      },
    ],
  }));
}

/**
 * Registers all static resources with the MCP server.
 *
 * Combines documentation, curriculum model, EEF interpretation, and widget
 * resource registration into a single call.
 *
 * @param server - MCP server instance
 * @param options - Resource registration options including observability
 */
export function registerAllResources(
  server: ResourceRegistrar,
  options: ResourceRegistrationOptions,
): void {
  registerDocumentationResources(server);
  registerCurriculumModelResource(server);
  registerExplainResource(server);
  // EEF is co-gated at registration (OAK_CURRICULUM_MCP_EEF_ENABLED, kill-switch,
  // default ON): register the resource unless an explicit `=false` disables it. The
  // tool and prompt are gated by the same flag (D6 c6).
  if (options.eefEnabled) {
    registerEefInterpretationResource(server);
  }
  registerWidgetResource(server, options.getWidgetHtml);
}

export { registerPrompts } from './register-prompts.js';
export type { ResourceRegistrationOptions } from './register-resource-helpers.js';
