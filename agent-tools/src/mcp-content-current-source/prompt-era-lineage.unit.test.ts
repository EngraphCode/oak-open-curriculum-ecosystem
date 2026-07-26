import { PROMPT_ERA_LINEAGE_ENTRIES } from './prompt-era-lineage.js';

describe('prompt-era current-source lineage', () => {
  it('preserves every surviving target for the recurring teacher-decision framing', () => {
    const targets = PROMPT_ERA_LINEAGE_ENTRIES.find(([auditId]) => auditId === 'C208')?.[1];

    expect(targets).toEqual([
      'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/curriculum-mapping.ts',
      'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/adapt-lesson.ts',
      'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/continue-progression.ts',
    ]);
  });
});
