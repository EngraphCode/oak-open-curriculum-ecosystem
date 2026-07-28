import { buildTokenAnchor, requireItemEvidenceTargets } from './item-anchor-evidence.js';

describe('current-source item anchor evidence', () => {
  const file = 'current/shared.ts';
  const source =
    'export const FIRST = "first audited string";\nexport const SECOND = "second audited string";';
  const first = buildTokenAnchor('export const FIRST = "first audited string";', source);
  const second = buildTokenAnchor('export const SECOND = "second audited string";', source);

  it('proves two audit items independently inside one surviving file', () => {
    const contentByFile = new Map([[file, source]]);

    expect(() =>
      requireItemEvidenceTargets('C001', [{ file, anchors: [first] }], contentByFile),
    ).not.toThrow();
    expect(() =>
      requireItemEvidenceTargets('C002', [{ file, anchors: [second] }], contentByFile),
    ).not.toThrow();
  });

  it('fails with the audit id when one item is removed but its file survives', () => {
    const contentByFile = new Map([[file, 'export const FIRST = "first audited string";']]);

    expect(() =>
      requireItemEvidenceTargets('C002', [{ file, anchors: [second] }], contentByFile),
    ).toThrow(`Current audit item C002 anchors lack distinct occurrences in ${file}`);
  });

  it('fails when a relocated file exists without the reviewed item anchor', () => {
    const relocatedFile = 'current/relocated.ts';
    const contentByFile = new Map([[relocatedFile, 'export const OTHER = "still a file";']]);

    expect(() =>
      requireItemEvidenceTargets(
        'C003',
        [{ file: relocatedFile, anchors: [first] }],
        contentByFile,
      ),
    ).toThrow(`Current audit item C003 anchors lack distinct occurrences in ${relocatedFile}`);
  });

  it('ignores formatting-only changes while retaining content identity', () => {
    const reformatted = 'export const FIRST="first audited string" ;';
    const contentByFile = new Map([[file, reformatted]]);

    expect(() =>
      requireItemEvidenceTargets('C001', [{ file, anchors: [first] }], contentByFile),
    ).not.toThrow();
  });

  it('requires two identical reviewed anchors to match distinct source occurrences', () => {
    const repeated = 'logger.info("repeated audited string");';
    const repeatedSource = `${repeated}\n${repeated}`;
    const duplicateAnchors = [
      buildTokenAnchor(repeated, repeatedSource),
      buildTokenAnchor(repeated, repeatedSource),
    ];

    expect(() =>
      requireItemEvidenceTargets(
        'C679',
        [{ file, anchors: duplicateAnchors }],
        new Map([[file, repeatedSource]]),
      ),
    ).not.toThrow();
    expect(() =>
      requireItemEvidenceTargets(
        'C679',
        [{ file, anchors: duplicateAnchors }],
        new Map([[file, repeated]]),
      ),
    ).toThrow(`Current audit item C679 anchors lack distinct occurrences in ${file}`);
  });
});
