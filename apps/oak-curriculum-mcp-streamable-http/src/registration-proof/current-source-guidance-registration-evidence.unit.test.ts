import { describe, expect, it } from 'vitest';
import { CURRENT_SOURCE_GUIDANCE } from './current-source-guidance-map.js';
import { buildGuidanceRegistrationEvidence } from './current-source-guidance-registration-evidence.js';

describe('buildGuidanceRegistrationEvidence', () => {
  const [liveGuidance, dormantGuidance] = CURRENT_SOURCE_GUIDANCE;

  it('reports observed list and read channels only for live resources', () => {
    expect(liveGuidance).toBeDefined();
    expect(dormantGuidance).toBeDefined();
    if (liveGuidance === undefined || dormantGuidance === undefined) {
      throw new Error('Current-source guidance fixture requires two resources');
    }
    const policy = Object.fromEntries(
      CURRENT_SOURCE_GUIDANCE.map(({ uri }) => [
        uri,
        uri === liveGuidance.uri ? ('live' as const) : ('dormant' as const),
      ]),
    );

    const evidence = buildGuidanceRegistrationEvidence(policy);

    expect(evidence[liveGuidance.source]?.channels).toEqual([
      'resources/list.resources[]',
      'resources/read.contents[]',
    ]);
    expect(evidence[dormantGuidance.source]?.channels).toEqual([]);
  });
});
