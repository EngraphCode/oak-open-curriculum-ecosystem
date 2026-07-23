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
  AGENT_GUIDANCE_RESOURCES,
  getAgentGuidanceContent,
  WIDGET_URI,
} from '@oaknational/curriculum-sdk/public/mcp-tools.js';
import { isResourceLive } from './served-surface/served-surface.js';

import {
  type ResourceRegistrar,
  type ResourceRegistrationOptions,
} from './register-resource-helpers.js';
import { registerWidgetResource } from './register-widget-resource.js';
import { CANONICAL_SKILL_URL } from './oak-under-the-hood/oak-under-the-hood-tool.js';

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
 * URI of the Oak: Under the Hood orientation resource. Exported as the single source
 * of truth so the public-resource allowlist (ADR-205) and its drift test reference the
 * exact literal the resource is registered under.
 */
export const OAK_UNDER_THE_HOOD_RESOURCE_URI = 'docs://oak/under-the-hood.md';

/**
 * Registers the Oak: Under the Hood orientation resource (`docs://oak/under-the-hood.md`).
 *
 * A LOW-SALIENCE (`priority` low, `audience: ['assistant']`) `text/markdown` resource serving a
 * POINTER to the canonical orientation method (the under-the-hood skill on the public repo),
 * for the minority audience (assistants / integrators) that wants it. It carries NO orientation
 * body: the canonical is always reachable, so the resource points rather than bakes a copy.
 * Effort-domain ONLY (owner separation principle): it never describes curriculum content, which
 * the curriculum tools serve. No `lastModified` — there is no server-owned body whose
 * modification time is meaningful; the canonical's freshness lives at the canonical's own URL.
 */
function registerOakUnderTheHoodResource(server: ResourceRegistrar): void {
  const uri = OAK_UNDER_THE_HOOD_RESOURCE_URI;
  const pointer =
    '# Oak: Under the Hood — orientation method\n\n' +
    'This resource is a pointer, not a copy. Fetch the canonical orientation method and follow ' +
    'it to orient the user to this repository (the Oak Open Curriculum Ecosystem), framed by ' +
    "Oak's public mission and strategy:\n\n" +
    `- Canonical method (always reachable): ${CANONICAL_SKILL_URL}\n\n` +
    'Relay Oak’s official wording from its public site; never surface a person’s name.\n';
  server.registerResource(
    'Oak: Under the Hood orientation',
    uri,
    {
      title: 'Oak: Under the Hood orientation',
      description:
        'How Oak builds and delivers its curriculum — the project/effort/ecosystem, its purpose ' +
        'and machinery, and how to engage. For assistants and integrators; a separate concern ' +
        'from curriculum content, which the curriculum tools serve.',
      mimeType: 'text/markdown',
      annotations: {
        priority: 0.2,
        audience: ['assistant'],
      },
    },
    () => ({
      contents: [{ uri, mimeType: 'text/markdown', text: pointer }],
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
 * Registers the agent guidance resources whose served-surface rows are
 * live (the ratified live-set: the navigation three; the creation four
 * stay dormant until the definition deliberately turns them live).
 */
function registerAgentGuidanceResources(
  server: ResourceRegistrar,
  options: ResourceRegistrationOptions,
): void {
  for (const resource of AGENT_GUIDANCE_RESOURCES) {
    if (!isResourceLive(options.servedSurface, resource.uri)) {
      continue;
    }
    const { name, uri, title, description, mimeType, annotations, lastModified } = resource;
    server.registerResource(name, uri, { title, description, mimeType, annotations }, () => ({
      contents: [
        {
          uri,
          mimeType,
          text: getAgentGuidanceContent(uri) ?? `# ${title}\n\nContent not found.`,
          _meta: { lastModified },
        },
      ],
    }));
  }
}

/**
 * Registers all static resources with the MCP server.
 *
 * Every registration consults the served-surface definition: dormant rows
 * are structurally absent from resources/list — the single point of
 * control per the mcp-101 ratified plan (no runtime flags; the former
 * OAK_CURRICULUM_MCP_EEF_ENABLED resource leg is superseded by the
 * definition's `eef://interpretation` row).
 *
 * @param server - MCP server instance
 * @param options - Registration options carrying the definition
 */
export function registerAllResources(
  server: ResourceRegistrar,
  options: ResourceRegistrationOptions,
): void {
  const { servedSurface } = options;
  if (DOCUMENTATION_RESOURCES.every((r) => isResourceLive(servedSurface, r.uri))) {
    registerDocumentationResources(server);
  }
  if (isResourceLive(servedSurface, CURRICULUM_MODEL_RESOURCE.uri)) {
    registerCurriculumModelResource(server);
  }
  if (isResourceLive(servedSurface, OAK_UNDER_THE_HOOD_RESOURCE_URI)) {
    registerOakUnderTheHoodResource(server);
  }
  if (isResourceLive(servedSurface, EEF_INTERPRETATION_RESOURCE.uri)) {
    registerEefInterpretationResource(server);
  }
  registerAgentGuidanceResources(server, options);
  if (isResourceLive(servedSurface, WIDGET_URI)) {
    registerWidgetResource(server, options.getWidgetHtml);
  }
}

export type { ResourceRegistrationOptions } from './register-resource-helpers.js';
