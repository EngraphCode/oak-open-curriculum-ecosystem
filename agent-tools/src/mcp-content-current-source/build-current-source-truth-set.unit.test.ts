/**
 * Unit proof for the MCP content current-source projection.
 *
 * The real-repository validator owns filesystem and registration walks.
 * This test keeps the transformation itself IO-free and proves the three
 * independent axes: authority, source lifecycle, and registration state.
 */

import { buildCurrentSourceTruthSet } from './build-current-source-truth-set.js';

describe('buildCurrentSourceTruthSet', () => {
  it('accounts for every audit row without conflating custody, lifecycle, or registration', () => {
    const truthSet = buildCurrentSourceTruthSet({
      provenance: {
        title: 'Fixture current-source truth set',
        baselineCommit: 'fixture-baseline',
        baselineArtifact: 'fixture/registry.json',
        baselineSha256: 'fixture-sha',
        currentEvidence: ['fixture/app/core.ts'],
        evidenceCeiling: ['Fixture only'],
      },
      baseline: [
        { id: 'C001', file: 'legacy/moved.ts', workspaceScope: 'in' },
        { id: 'C002', file: 'legacy/removed.ts', workspaceScope: 'in' },
        { id: 'C003', file: 'current/available.ts', workspaceScope: 'in' },
        { id: 'C004', file: 'current/dormant.ts', workspaceScope: 'in' },
        { id: 'C005', file: 'generated/upstream.ts', workspaceScope: 'out-upstream-api' },
      ],
      current: [
        {
          auditId: 'C001',
          files: ['current/moved.ts'],
          registrations: [
            {
              rootId: 'http',
              state: 'live',
              primitive: 'resource',
              selector: 'docs://example/moved.md',
              channels: ['resources/list.resources[]', 'resources/read.contents[]'],
            },
          ],
        },
        { auditId: 'C003', files: ['current/available.ts'], registrations: [] },
        {
          auditId: 'C004',
          files: ['current/dormant.ts'],
          registrations: [
            {
              rootId: 'http',
              state: 'dormant',
              primitive: 'resource',
              selector: 'docs://example/dormant.md',
              channels: ['resources/list.resources[]', 'resources/read.contents[]'],
            },
          ],
        },
        {
          auditId: 'C005',
          files: ['generated/upstream.ts'],
          registrations: [
            {
              rootId: 'http',
              state: 'live',
              primitive: 'tool',
              selector: 'upstream-tool',
              channels: ['tools/list.tools[]'],
            },
          ],
        },
      ],
      retiredAuditIds: ['C002'],
      registrationRoots: [
        {
          id: 'http',
          rootRef: 'app/core.ts',
          transport: 'streamable-http',
          registrationRef: 'app/register.ts',
          proof: 'in-memory-protocol-walk',
          observation: {
            initialize: { instructions: 'present' },
            tools: { live: ['upstream-tool'], dormant: [] },
            resources: {
              live: ['docs://example/moved.md'],
              dormant: ['docs://example/dormant.md'],
            },
            prompts: { capability: 'absent', list: 'method-not-found' },
          },
        },
      ],
    });

    expect(truthSet.items).toHaveLength(5);
    expect(truthSet.items.map((item) => item.id)).toEqual(['C001', 'C002', 'C003', 'C004', 'C005']);

    expect(truthSet.items[0]).toMatchObject({
      id: 'C001',
      authority: 'workspace',
      source: { state: 'available', files: ['current/moved.ts'] },
      lineage: { disposition: 'relocated', baselineFile: 'legacy/moved.ts' },
      registrations: [{ state: 'live' }],
    });
    expect(truthSet.items[1]).toMatchObject({
      id: 'C002',
      authority: 'workspace',
      source: { state: 'retired', files: [] },
      lineage: { disposition: 'retired', baselineFile: 'legacy/removed.ts' },
      registrations: [],
    });
    expect(truthSet.items[2]).toMatchObject({
      id: 'C003',
      source: { state: 'available' },
      registrations: [],
    });
    expect(truthSet.items[3]).toMatchObject({
      id: 'C004',
      source: { state: 'available' },
      registrations: [{ state: 'dormant' }],
    });
    expect(truthSet.items[4]).toMatchObject({
      id: 'C005',
      authority: 'upstream-api',
      source: { state: 'available' },
      registrations: [{ state: 'live' }],
    });
  });

  it('rejects an unaccounted audit row', () => {
    expect(() =>
      buildCurrentSourceTruthSet({
        provenance: {
          title: 'Fixture current-source truth set',
          baselineCommit: 'fixture-baseline',
          baselineArtifact: 'fixture/registry.json',
          baselineSha256: 'fixture-sha',
          currentEvidence: [],
          evidenceCeiling: ['Fixture only'],
        },
        baseline: [
          { id: 'C001', file: 'current/accounted.ts', workspaceScope: 'in' },
          { id: 'C002', file: 'current/missing.ts', workspaceScope: 'in' },
        ],
        current: [{ auditId: 'C001', files: ['current/accounted.ts'], registrations: [] }],
        retiredAuditIds: [],
        registrationRoots: [],
      }),
    ).toThrow('Unaccounted baseline audit ids: C002');
  });
});
