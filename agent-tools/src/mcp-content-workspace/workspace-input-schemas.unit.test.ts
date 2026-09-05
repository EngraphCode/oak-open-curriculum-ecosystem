import { describe, expect, it } from 'vitest';
import { parseCurrentSourceProjection } from './workspace-input-schemas.js';

const observation = {
  initialize: { instructions: 'present' },
  tools: { live: ['search'], dormant: [] },
  resources: { live: [], dormant: ['docs://old'] },
  prompts: { capability: 'absent', list: 'method-not-found' },
};

function projection(item: Record<string, unknown>): string {
  return JSON.stringify({
    provenance: { baselineCommit: 'abc123' },
    items: [item],
    registrationRoots: [{ id: 'oak-curriculum-http', observation }],
  });
}

const addition = {
  id: 'A001',
  authority: 'workspace',
  workspaceScope: 'in',
  source: { state: 'available', files: ['src/allowlist.ts'], evidence: { revision: 'added' } },
  lineage: { disposition: 'added', addedAfterBaselineCommit: 'abc123' },
  registrations: [],
};

describe('parseCurrentSourceProjection', () => {
  it('refuses a post-baseline addition that carries no review context', () => {
    expect(() => parseCurrentSourceProjection(projection(addition))).toThrow();
  });

  it('accepts a post-baseline addition that classifies itself', () => {
    const parsed = parseCurrentSourceProjection(
      projection({
        ...addition,
        reviewContext: {
          title: 'Served-surface allowlist',
          reviewDomain: 'engineering-structural',
          impactTier: 'high-impact',
          behaviouralIntent: 'Classify every surface.',
        },
      }),
    );

    expect(parsed.items[0]?.reviewContext?.reviewDomain).toBe('engineering-structural');
  });

  it('carries every primitive the projection observed at a registration root', () => {
    const parsed = parseCurrentSourceProjection(
      projection({
        ...addition,
        reviewContext: {
          title: 't',
          reviewDomain: 'other',
          impactTier: 'simple-config',
          behaviouralIntent: '',
        },
      }),
    );

    expect(parsed.registrationRoots[0]?.observation.initialize.instructions).toBe('present');
    expect(parsed.registrationRoots[0]?.observation.prompts.list).toBe('method-not-found');
  });
});
