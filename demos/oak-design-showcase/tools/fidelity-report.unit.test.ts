import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

expect.extend(toHaveNoViolations);

import { FIDELITY_PAIRS } from './fidelity-pairs';
import { parseRegister } from './fidelity-register';
import { renderReportHtml, type PairResult, type RunMeta } from './fidelity-report';

const META: RunMeta = {
  base: 'http://localhost:3020',
  widthCssPx: 1440,
  deviceScaleFactor: 2,
  serverMode: 'attached',
  generatedAt: '2026-08-09T12:00:00Z',
};

function fixtureResults(): PairResult[] {
  const [first, second, third] = FIDELITY_PAIRS.pairs;
  if (first === undefined || second === undefined || third === undefined) {
    return [];
  }
  return [
    {
      pair: first,
      status: 'diffed',
      diff: {
        changedRatio: 0.0123,
        diffPngName: `diff-${first.id}.png`,
        exportDims: { width: 2880, height: 2000 },
        liveDims: { width: 2880, height: 2000 },
        croppedTo: { width: 2880, height: 2000 },
        caveats: [],
      },
    },
    {
      pair: { ...second, notes: 'contains <script> unsafe & chars' },
      status: 'diffed',
      diff: {
        changedRatio: 0.4,
        diffPngName: `diff-${second.id}.png`,
        exportDims: { width: 2880, height: 9000 },
        liveDims: { width: 2880, height: 7000 },
        croppedTo: { width: 2880, height: 7000 },
        caveats: ['height-mismatch:-2000px'],
      },
    },
    { pair: third, status: 'missing-evidence', missing: [third.livePng] },
  ];
}

const parsedRegister = parseRegister(
  JSON.stringify({
    version: 1,
    entries: [
      {
        id: `${FIDELITY_PAIRS.pairs[0]?.id ?? 'x'}/known-divergence`,
        pairId: FIDELITY_PAIRS.pairs[0]?.id ?? 'x',
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
  }),
);
const register = parsedRegister.ok ? parsedRegister.value : { version: 1 as const, entries: [] };

describe('renderReportHtml', () => {
  const html = renderReportHtml(fixtureResults(), register, META);

  it('starts from a fixture register that parses', () => {
    expect(parsedRegister.ok).toBe(true);
  });

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
    expect(html).toContain('owner-rejected as the switchboard surface');
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
  const html = renderReportHtml(fixtureResults(), register, META);

  it('renders global-scope judgments in their own section, never as orphans', () => {
    expect(html).toContain('Global judgments (apply to every pair)');
    expect(html).toContain('global/token-source-convergence');
    expect(html).not.toContain(
      'global/token-source-convergence</code> — its pair no longer exists',
    );
  });
});
