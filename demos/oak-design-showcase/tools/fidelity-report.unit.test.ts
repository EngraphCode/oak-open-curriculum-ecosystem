import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

expect.extend(toHaveNoViolations);

import type { FidelityPair, PairingMap } from './fidelity-pairs';
import type { FidelityRegister } from './fidelity-register';
import { renderReportHtml, type PairResult, type RunMeta } from './fidelity-report';

// Wholly literal fixtures: the renderer takes plain data, so nothing here
// derives from the declared pairing map — a reorder or re-declaration of
// the live configuration cannot move these tests. Literal fixtures need no
// live brand slug, so the naming ratchet is untouched.

const META: RunMeta = {
  base: 'http://localhost:3020',
  widthCssPx: 1440,
  deviceScaleFactor: 2,
  serverMode: 'attached',
  generatedAt: '2026-08-09T12:00:00Z',
};

const FOLD_PAIR = {
  id: 'picker-oak-fold',
  kind: 'page-abovefold',
  exportPng: 'demo-evidence/export-picker-oak-fold.png',
  livePng: 'demo-evidence/live-picker-oak-fold.png',
  liveRoute: '/specimen',
  diffEligible: true,
} satisfies FidelityPair;

const FULL_PAIR = {
  id: 'picker-oak-full',
  kind: 'page-fullpage',
  exportPng: 'demo-evidence/export-picker-oak-full.png',
  livePng: 'demo-evidence/live-picker-oak-full.png',
  liveRoute: '/specimen',
  diffEligible: true,
  notes: 'contains <script> unsafe & chars',
} satisfies FidelityPair;

const CHROME_PAIR = {
  id: 'picker-chrome',
  kind: 'reference-only',
  exportPng: 'demo-evidence/export-picker-chrome.png',
  livePng: 'demo-evidence/live-picker-chrome.png',
  liveRoute: '/switchboard',
  diffEligible: false,
} satisfies FidelityPair;

const MAP = {
  version: 1,
  pairs: [FOLD_PAIR, FULL_PAIR, CHROME_PAIR],
  exemptSurfaces: [{ route: '/', reason: 'owner-rejected surface; judged elsewhere' }],
} satisfies PairingMap;

const RESULTS: readonly PairResult[] = [
  {
    pair: FOLD_PAIR,
    status: 'diffed',
    diff: {
      changedRatio: 0.0123,
      diffPngName: 'diff-picker-oak-fold.png',
      exportDims: { width: 2880, height: 2000 },
      liveDims: { width: 2880, height: 2000 },
      croppedTo: { width: 2880, height: 2000 },
      caveats: [],
    },
  },
  {
    pair: FULL_PAIR,
    status: 'diffed',
    diff: {
      changedRatio: 0.4,
      diffPngName: 'diff-picker-oak-full.png',
      exportDims: { width: 2880, height: 9000 },
      liveDims: { width: 2880, height: 7000 },
      croppedTo: { width: 2880, height: 7000 },
      caveats: ['height-mismatch:-2000px'],
    },
  },
  { pair: CHROME_PAIR, status: 'missing-evidence', missing: [CHROME_PAIR.livePng] },
];

const REGISTER = {
  version: 1,
  entries: [
    {
      id: 'picker-oak-fold/known-divergence',
      pairId: 'picker-oak-fold',
      kind: 'feature',
      summary: 'A recorded judgment.',
      evidence: ['demo-evidence/live-picker-oak-fold.png'],
      disposition: 'deliberate',
      rationale: 'Ratified.',
      author: 'design-lane',
      date: '2026-08-09',
    },
    {
      id: 'global/token-source-convergence',
      pairId: 'global',
      kind: 'visual',
      summary: 'Token-source convergence shifts values on every pair.',
      evidence: ['demo-evidence/live-picker-oak-fold.png'],
      disposition: 'deliberate',
      rationale: 'Ratified (ADR-213).',
      author: 'design-lane',
      date: '2026-08-09',
    },
    {
      id: 'gone-pair/old-finding',
      pairId: 'gone-pair',
      kind: 'visual',
      summary: 'Entry whose pair no longer exists.',
      evidence: ['demo-evidence/old.png'],
      disposition: 'matched',
      rationale: 'From an earlier export.',
      author: 'design-lane',
      date: '2026-08-01',
    },
  ],
} satisfies FidelityRegister;

describe('renderReportHtml', () => {
  const html = renderReportHtml(RESULTS, REGISTER, META, MAP);

  it('renders every pair with its status and any caveats', () => {
    expect(html).toContain('picker-oak-fold');
    expect(html).toContain('height-mismatch:-2000px');
    expect(html).toContain('missing evidence');
  });

  it('escapes data-carried markup instead of injecting it', () => {
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('renders recorded dispositions and a copy-ready template for unregistered pairs', () => {
    expect(html).toContain('deliberate');
    expect(html).toContain('A recorded judgment.');
    expect(html).toContain('describe-the-finding');
  });

  it('surfaces register entries whose pair no longer exists as superseded candidates', () => {
    expect(html).toContain('gone-pair/old-finding');
    expect(html).toContain('superseded');
  });

  it('lists the exempt surfaces with reasons', () => {
    expect(html).toContain('owner-rejected surface; judged elsewhere');
  });

  it('references live evidence relative to the report directory', () => {
    expect(html).toContain('src="../../demo-evidence/live-picker-oak-fold.png"');
    expect(html).toContain('src="diff-picker-oak-fold.png"');
  });

  it('has no axe violations', async () => {
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.append(container);

    expect(await axe(container)).toHaveNoViolations();

    container.remove();
  });
});

describe('renderReportHtml global scope', () => {
  const html = renderReportHtml(RESULTS, REGISTER, META, MAP);

  it('renders global-scope judgments in their own section, never as orphans', () => {
    expect(html).toContain('Global judgments (apply to every pair)');
    expect(html).toContain('global/token-source-convergence');
    expect(html).not.toContain(
      'global/token-source-convergence</code> — its pair no longer exists',
    );
  });
});
