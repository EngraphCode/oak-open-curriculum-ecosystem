/*
 * Unit-class: the system under test is the pure boundary parser
 * (wow-verdict-register.ts). The committed register enters as imported
 * data (resolveJsonModule; the hub fidelity-register precedent's shape) —
 * no filesystem IO, no fakes. The live-register block is the schema
 * backstop over the committed artefact.
 */
import { describe, expect, it } from 'vitest';

import liveRegister from './wow-verdict-register.json';

import { parseWowVerdictRegister, rowsForDemo } from './wow-verdict-register';

const validPreReadRow = {
  page: '/',
  demo: 'oak-design-showcase',
  verdict: 'FAIL',
  qualitiesJudged: ['content-relevance'],
  cellsCovered: [{ identity: 'oak', theme: 'light' }],
  ownerStatementDate: '2026-08-05',
  rowClass: 'pre-read',
  source: 'sitting record §Verdict 1',
};

const validLegResults = {
  seat: { verdict: 'PASS' },
  accessibilityExpert: { verdict: 'PASS', notes: 'contrast floors hold in both themes' },
  designSystemExpert: { verdict: 'PASS' },
};

describe('parseWowVerdictRegister', () => {
  it('accepts a well-formed register', () => {
    const result = parseWowVerdictRegister(
      JSON.stringify({ version: 1, entries: [validPreReadRow] }),
    );

    expect(result.ok, 'a well-formed register must parse').toBe(true);
    if (result.ok) {
      expect(result.value.entries).toHaveLength(1);
    }
  });

  it('rejects invalid JSON with a readable error, never a throw', () => {
    const result = parseWowVerdictRegister('{not json');

    expect(result.ok, 'invalid JSON must be refused, not thrown').toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('wow-verdict-register');
    }
  });

  it('rejects a checkpoint-class row without instrument-leg results', () => {
    const result = parseWowVerdictRegister(
      JSON.stringify({
        version: 1,
        entries: [{ ...validPreReadRow, rowClass: 'checkpoint' }],
      }),
    );

    expect(result.ok, 'a checkpoint row without leg results must be refused').toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('checkpoint-class rows require instrumentLegResults');
    }
  });

  it('accepts a checkpoint-class row carrying all three leg results', () => {
    const result = parseWowVerdictRegister(
      JSON.stringify({
        version: 1,
        entries: [
          {
            ...validPreReadRow,
            rowClass: 'checkpoint',
            verdict: 'PASS',
            instrumentLegResults: validLegResults,
          },
        ],
      }),
    );

    expect(result.ok).toBe(true);
  });

  it('rejects a checkpoint-class row carrying only a partial leg set', () => {
    const result = parseWowVerdictRegister(
      JSON.stringify({
        version: 1,
        entries: [
          {
            ...validPreReadRow,
            rowClass: 'checkpoint',
            instrumentLegResults: { seat: { verdict: 'PASS' } },
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
  });

  it('accepts a pre-read row with leg results present (the optional arm)', () => {
    const result = parseWowVerdictRegister(
      JSON.stringify({
        version: 1,
        entries: [{ ...validPreReadRow, instrumentLegResults: validLegResults }],
      }),
    );

    expect(result.ok).toBe(true);
  });

  it('rejects a row missing its provenance source', () => {
    const rowWithoutSource: Record<string, unknown> = { ...validPreReadRow };
    delete rowWithoutSource.source;
    const result = parseWowVerdictRegister(
      JSON.stringify({ version: 1, entries: [rowWithoutSource] }),
    );

    expect(result.ok).toBe(false);
  });

  it.each([
    ['an unknown verdict', { ...validPreReadRow, verdict: 'MAYBE' }],
    ['an unknown row class', { ...validPreReadRow, rowClass: 'audit' }],
    ['empty qualitiesJudged', { ...validPreReadRow, qualitiesJudged: [] }],
    ['empty cellsCovered', { ...validPreReadRow, cellsCovered: [] }],
  ])('rejects a row with %s', (_label, malformedRow) => {
    const result = parseWowVerdictRegister(JSON.stringify({ version: 1, entries: [malformedRow] }));

    expect(result.ok).toBe(false);
  });

  it('rejects a register whose version is not 1', () => {
    const result = parseWowVerdictRegister(
      JSON.stringify({ version: 2, entries: [validPreReadRow] }),
    );

    expect(result.ok).toBe(false);
  });
});

describe('rowsForDemo', () => {
  const showcaseRow = { ...validPreReadRow, demo: 'oak-design-showcase' };
  const hubRow = { ...validPreReadRow, page: '/search', demo: 'oak-curriculum-hub' };

  it('returns only the named demo’s rows', () => {
    const result = parseWowVerdictRegister(
      JSON.stringify({ version: 1, entries: [showcaseRow, hubRow] }),
    );

    expect(result.ok, 'the two-row register must parse').toBe(true);
    if (result.ok) {
      const rows = rowsForDemo(result.value, 'oak-curriculum-hub');
      expect(rows).toHaveLength(1);
      expect(rows[0]?.page).toBe('/search');
    }
  });

  it('returns no rows for an unknown demo', () => {
    const result = parseWowVerdictRegister(
      JSON.stringify({ version: 1, entries: [showcaseRow, hubRow] }),
    );

    expect(result.ok, 'the two-row register must parse').toBe(true);
    if (result.ok) {
      expect(rowsForDemo(result.value, 'no-such-demo')).toHaveLength(0);
    }
  });
});

describe('the committed live register', () => {
  it('parses against the boundary schema', () => {
    const result = parseWowVerdictRegister(JSON.stringify(liveRegister));

    expect(result.ok ? undefined : result.error).toBeUndefined();
  });
});
