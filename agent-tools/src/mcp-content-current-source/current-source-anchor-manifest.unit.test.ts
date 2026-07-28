import { describe, expect, it } from 'vitest';
import { buildCurrentSourceAnchorManifest } from './current-source-anchor-manifest.js';

const SOURCE = 'export const content = "current";\n';

function inputFixture(revisionOverrides: Readonly<Record<string, 'unchanged'>> = {}) {
  return {
    baselineCommit: 'baseline',
    baselineSha256: 'a'.repeat(64),
    rows: [{ id: 'C001', file: 'source.ts', lines: '1' }],
    targetsByAuditId: new Map([['C001', ['source.ts']]]),
    baselineContentByFile: new Map([['source.ts', SOURCE]]),
    currentContentByFile: new Map([['source.ts', SOURCE]]),
    overrides: { C001: { 'source.ts': ['content'] } },
    registrationSurfaceOverrides: {},
    revisionOverrides,
  } as const;
}

describe('buildCurrentSourceAnchorManifest', () => {
  it('rejects an in-place reviewed anchor override without an explicit revision', () => {
    expect(() => buildCurrentSourceAnchorManifest(inputFixture())).toThrow(
      'In-place current anchor overrides require an explicit revision: C001',
    );
  });

  it('preserves an explicit unchanged classification for a formatting-only override', () => {
    const manifest = buildCurrentSourceAnchorManifest(inputFixture({ C001: 'unchanged' }));

    expect(manifest.items[0]?.evidence.revision).toBe('unchanged');
  });
});
