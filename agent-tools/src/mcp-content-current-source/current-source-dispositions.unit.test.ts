import { describe, expect, it } from 'vitest';
import { buildAnchoredDispositions } from './current-source-dispositions.js';
import { buildTokenAnchor } from './item-anchor-evidence.js';
import type {
  CurrentSourceAnchorManifest,
  RegistrationAnchorSurface,
  RegistrationSourceEvidence,
} from './current-source-model.js';

const LIVE_FILE = 'live.ts';
const DORMANT_FILE = 'dormant.ts';
const TITLE = 'Guidance title';
const DESCRIPTION = 'Guidance description';
const BODY = '# Guidance body';
const LIVE_SOURCE = `${TITLE}\n${DESCRIPTION}\n${BODY}\n`;
const DORMANT_SOURCE = 'Dormant title\nDormant description\n# Dormant body\n';

const titleSurface: RegistrationAnchorSurface = {
  locus: 'resource-metadata',
  field: 'title',
};
const descriptionSurface: RegistrationAnchorSurface = {
  locus: 'resource-metadata',
  field: 'description',
};
const textSurface: RegistrationAnchorSurface = {
  locus: 'resource-contents',
  field: 'text',
};

function anchor(content: string, source: string, registrationSurface: RegistrationAnchorSurface) {
  return { ...buildTokenAnchor(content, source), registrationSurface };
}

const manifest: CurrentSourceAnchorManifest = {
  schemaVersion: 2,
  baselineCommit: 'baseline',
  baselineSha256: 'a'.repeat(64),
  items: [
    {
      auditId: 'C001',
      evidence: {
        revision: 'relocated',
        targets: [{ file: LIVE_FILE, anchors: [anchor(TITLE, LIVE_SOURCE, titleSurface)] }],
      },
    },
    {
      auditId: 'C002',
      evidence: {
        revision: 'relocated',
        targets: [{ file: LIVE_FILE, anchors: [anchor(BODY, LIVE_SOURCE, textSurface)] }],
      },
    },
    {
      auditId: 'C003',
      evidence: {
        revision: 'relocated',
        targets: [
          {
            file: LIVE_FILE,
            anchors: [
              anchor(DESCRIPTION, LIVE_SOURCE, descriptionSurface),
              anchor(BODY, LIVE_SOURCE, textSurface),
            ],
          },
        ],
      },
    },
    {
      auditId: 'C004',
      evidence: {
        revision: 'relocated',
        targets: [
          {
            file: DORMANT_FILE,
            anchors: [anchor('Dormant title', DORMANT_SOURCE, titleSurface)],
          },
        ],
      },
    },
  ],
};

const registration = (
  selector: string,
  state: 'live' | 'dormant',
  title: string,
  description: string,
  body: string,
): RegistrationSourceEvidence => ({
  rootId: 'http',
  state,
  primitive: 'resource',
  selector,
  surfaces: [
    { ...titleSurface, value: title },
    { ...descriptionSurface, value: description },
    { ...textSurface, value: body },
  ],
  channels: state === 'live' ? ['resources/list.resources[]', 'resources/read.contents[]'] : [],
});

describe('buildAnchoredDispositions registration attribution', () => {
  it('derives channels from each item anchor surface and keeps dormant channels empty', () => {
    const baseline = ['C001', 'C002', 'C003', 'C004'].map((id) => ({
      id,
      file: `baseline-${id}.ts`,
      lines: '1',
      workspaceScope: 'in' as const,
      sourceLocus: 'this-repo' as const,
    }));
    const targetsByAuditId = new Map([
      ['C001', [LIVE_FILE]],
      ['C002', [LIVE_FILE]],
      ['C003', [LIVE_FILE]],
      ['C004', [DORMANT_FILE]],
    ]);

    const result = buildAnchoredDispositions({
      baseline,
      registrationsBySource: {
        [LIVE_FILE]: registration('docs://live', 'live', TITLE, DESCRIPTION, BODY),
        [DORMANT_FILE]: registration(
          'docs://dormant',
          'dormant',
          'Dormant title',
          'Dormant description',
          '# Dormant body',
        ),
      },
      targetsByAuditId,
      anchorManifest: manifest,
      contentByFile: new Map([
        [LIVE_FILE, LIVE_SOURCE],
        [DORMANT_FILE, DORMANT_SOURCE],
      ]),
      baselineCommit: 'baseline',
      baselineSha256: 'a'.repeat(64),
      anchorArtifact: 'anchors.json',
    });

    expect(result.current.map((item) => [item.auditId, item.registrations[0]?.channels])).toEqual([
      ['C001', ['resources/list.resources[]']],
      ['C002', ['resources/read.contents[]']],
      ['C003', ['resources/list.resources[]', 'resources/read.contents[]']],
      ['C004', []],
    ]);
    expect(result.current[2]?.registrations[0]?.anchorSurfaces).toEqual([
      { locus: 'resource-metadata', field: 'description', anchorCount: 1 },
      { locus: 'resource-contents', field: 'text', anchorCount: 1 },
    ]);
  });
});
