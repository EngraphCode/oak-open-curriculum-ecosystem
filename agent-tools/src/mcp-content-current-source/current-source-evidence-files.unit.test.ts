import { describe, expect, it, vi } from 'vitest';
import {
  currentTargetsByAuditId,
  parseCurrentSourceAnchorManifest,
} from './current-source-evidence-files.js';

const SHA256 = 'a'.repeat(64);

const registrationSurfaceFixture = {
  locus: 'resource-contents',
  field: 'text',
} as const;
const anchorFixture = {
  tokenCount: 1,
  tokenSha256: SHA256,
  indexToken: 'content',
  indexOffset: 0,
  registrationSurface: registrationSurfaceFixture,
};
const targetFixture = {
  file: 'source.ts',
  anchors: [anchorFixture],
};
const evidenceFixture = {
  revision: 'unchanged',
  targets: [targetFixture],
} as const;
const itemFixture = {
  auditId: 'C001',
  evidence: evidenceFixture,
};

function manifestFixture() {
  return {
    schemaVersion: 2,
    baselineCommit: 'baseline',
    baselineSha256: SHA256,
    items: [itemFixture],
  } as const;
}

const malformedManifests = [
  {
    level: 'manifest',
    manifest: { ...manifestFixture(), unknown: true },
  },
  {
    level: 'item',
    manifest: {
      ...manifestFixture(),
      items: [{ ...itemFixture, unknown: true }],
    },
  },
  {
    level: 'evidence',
    manifest: {
      ...manifestFixture(),
      items: [{ ...itemFixture, evidence: { ...evidenceFixture, unknown: true } }],
    },
  },
  {
    level: 'target',
    manifest: {
      ...manifestFixture(),
      items: [
        {
          ...itemFixture,
          evidence: {
            ...evidenceFixture,
            targets: [{ ...targetFixture, unknown: true }],
          },
        },
      ],
    },
  },
  {
    level: 'token anchor',
    manifest: {
      ...manifestFixture(),
      items: [
        {
          ...itemFixture,
          evidence: {
            ...evidenceFixture,
            targets: [
              {
                ...targetFixture,
                anchors: [{ ...anchorFixture, unknown: true }],
              },
            ],
          },
        },
      ],
    },
  },
  {
    level: 'registration surface',
    manifest: {
      ...manifestFixture(),
      items: [
        {
          ...itemFixture,
          evidence: {
            ...evidenceFixture,
            targets: [
              {
                ...targetFixture,
                anchors: [
                  {
                    ...anchorFixture,
                    registrationSurface: {
                      ...registrationSurfaceFixture,
                      unknown: true,
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  },
] as const;

describe('parseCurrentSourceAnchorManifest', () => {
  it('accepts the exact persisted evidence contract', () => {
    expect(parseCurrentSourceAnchorManifest(JSON.stringify(manifestFixture()))).toMatchObject({
      schemaVersion: 2,
      baselineCommit: 'baseline',
    });
  });

  it.each(malformedManifests)('rejects unknown fields at the $level level', ({ manifest }) => {
    expect(() => parseCurrentSourceAnchorManifest(JSON.stringify(manifest))).toThrow(
      'Unrecognized key',
    );
  });
});

describe('currentTargetsByAuditId', () => {
  it('prefers explicit item lineage even while the baseline source file survives', async () => {
    const pathExists = vi.fn().mockResolvedValue(true);
    const baseline = [
      {
        id: 'C001',
        file: 'shared.ts',
        lines: '1',
        workspaceScope: 'in',
        sourceLocus: 'this-repo',
      },
    ] as const;

    const relocated = await currentTargetsByAuditId(
      '/repo',
      baseline,
      new Map([['C001', ['relocated.ts']]]),
      { pathExists },
    );
    const retired = await currentTargetsByAuditId('/repo', baseline, new Map([['C001', []]]), {
      pathExists,
    });

    expect(relocated.get('C001')).toEqual(['relocated.ts']);
    expect(retired.get('C001')).toEqual([]);
    expect(pathExists).not.toHaveBeenCalled();
  });
});
