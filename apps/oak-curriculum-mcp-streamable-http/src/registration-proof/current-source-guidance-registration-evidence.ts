import { CURRENT_SOURCE_GUIDANCE } from './current-source-guidance-map.js';

export type ServedState = 'live' | 'dormant';

const LIVE_RESOURCE_CHANNELS = ['resources/list.resources[]', 'resources/read.contents[]'] as const;

interface GuidanceRegistrationEvidence {
  readonly rootId: 'oak-curriculum-http';
  readonly state: ServedState;
  readonly primitive: 'resource';
  readonly selector: string;
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
      return [
        source,
        {
          rootId: 'oak-curriculum-http',
          state,
          primitive: 'resource',
          selector: uri,
          channels: state === 'live' ? LIVE_RESOURCE_CHANNELS : [],
        },
      ];
    }),
  );
}
