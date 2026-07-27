import {
  AGENT_GUIDANCE_RESOURCES,
  getAgentGuidanceContent,
} from '@oaknational/curriculum-sdk/public/mcp-tools.js';
import { CURRENT_SOURCE_GUIDANCE } from './current-source-guidance-map.js';

export type ServedState = 'live' | 'dormant';

const LIVE_RESOURCE_CHANNELS = ['resources/list.resources[]', 'resources/read.contents[]'] as const;

interface GuidanceRegistrationEvidence {
  readonly rootId: 'oak-curriculum-http';
  readonly state: ServedState;
  readonly primitive: 'resource';
  readonly selector: string;
  readonly surfaces: readonly (
    | {
        readonly locus: 'resource-metadata';
        readonly field: 'name' | 'uri' | 'title' | 'description' | 'mimeType' | 'annotations';
        readonly value: string;
      }
    | {
        readonly locus: 'resource-contents';
        readonly field: 'uri' | 'mimeType' | 'text' | '_meta.lastModified';
        readonly value: string;
      }
  )[];
  readonly channels: readonly string[];
}

/** Projects observed protocol channels without advertising dormant routes. */
export function buildGuidanceRegistrationEvidence(
  resourcePolicy: Readonly<Record<string, ServedState>>,
): Readonly<Record<string, GuidanceRegistrationEvidence>> {
  return Object.fromEntries(
    CURRENT_SOURCE_GUIDANCE.map(({ source, uri }) => {
      const state = resourcePolicy[uri];
      if (state === undefined) {
        throw new Error(`Guidance URI is absent from policy: ${uri}`);
      }
      const resource = AGENT_GUIDANCE_RESOURCES.find((candidate) => candidate.uri === uri);
      const content = getAgentGuidanceContent(uri);
      if (resource === undefined || content === undefined) {
        throw new Error(`Guidance URI is absent from the canonical inventory: ${uri}`);
      }
      return [
        source,
        {
          rootId: 'oak-curriculum-http',
          state,
          primitive: 'resource',
          selector: uri,
          surfaces: [
            { locus: 'resource-metadata', field: 'name', value: resource.name },
            { locus: 'resource-metadata', field: 'uri', value: resource.uri },
            { locus: 'resource-metadata', field: 'title', value: resource.title },
            {
              locus: 'resource-metadata',
              field: 'description',
              value: resource.description,
            },
            {
              locus: 'resource-metadata',
              field: 'mimeType',
              value: resource.mimeType,
            },
            {
              locus: 'resource-metadata',
              field: 'annotations',
              value: JSON.stringify(resource.annotations),
            },
            { locus: 'resource-contents', field: 'uri', value: resource.uri },
            {
              locus: 'resource-contents',
              field: 'mimeType',
              value: resource.mimeType,
            },
            { locus: 'resource-contents', field: 'text', value: content },
            {
              locus: 'resource-contents',
              field: '_meta.lastModified',
              value: resource.lastModified,
            },
          ],
          channels: state === 'live' ? LIVE_RESOURCE_CHANNELS : [],
        },
      ];
    }),
  );
}
