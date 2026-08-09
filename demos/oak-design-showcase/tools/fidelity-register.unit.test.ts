import { describe, expect, it } from 'vitest';

import liveRegister from '../fidelity-register.json';

import { entriesForPair, newEntryTemplate, parseRegister } from './fidelity-register';

const validEntry = {
  id: 'picker-oak-full/masthead-search-width',
  pairId: 'picker-oak-full',
  kind: 'feature',
  summary: 'The live masthead search field renders wider than the export at 1440.',
  evidence: ['demo-evidence/live-picker-oak-full.png'],
  disposition: 'deliberate',
  rationale: 'Deliberate: the search form uses the kit input min-width.',
  author: 'design-lane',
  date: '2026-08-09',
};

describe('parseRegister', () => {
  it('accepts a well-formed register', () => {
    const result = parseRegister(JSON.stringify({ version: 1, entries: [validEntry] }));

    expect(result.ok ? undefined : result.error).toBeUndefined();
    if (result.ok) {
      expect(result.value.entries).toHaveLength(1);
    }
  });
});

describe('parseRegister rejections', () => {
  it('rejects invalid JSON with a readable error, never a throw', () => {
    const result = parseRegister('{not json');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('fidelity-register');
    }
  });

  it('rejects an entry whose id is not prefixed by its pairId', () => {
    const result = parseRegister(
      JSON.stringify({
        version: 1,
        entries: [{ ...validEntry, id: 'other-pair/masthead-search-width' }],
      }),
    );

    expect(result.ok).toBe(false);
  });

  it('rejects an entry carrying an unknown field — a typo must never be silently stripped', () => {
    const result = parseRegister(
      JSON.stringify({ version: 1, entries: [{ ...validEntry, dispositionn: 'fix' }] }),
    );

    expect(result.ok).toBe(false);
  });

  it('rejects an impossible calendar date', () => {
    const result = parseRegister(
      JSON.stringify({ version: 1, entries: [{ ...validEntry, date: '2026-99-99' }] }),
    );

    expect(result.ok).toBe(false);
  });

  it('rejects an unknown disposition', () => {
    const result = parseRegister(
      JSON.stringify({ version: 1, entries: [{ ...validEntry, disposition: 'maybe' }] }),
    );

    expect(result.ok).toBe(false);
  });
});

describe('entriesForPair', () => {
  it('returns only the entries keyed to the pair', () => {
    const parsed = parseRegister(
      JSON.stringify({
        version: 1,
        entries: [
          validEntry,
          { ...validEntry, id: 'picker-emc2-full/footer-rail', pairId: 'picker-emc2-full' },
        ],
      }),
    );

    expect(parsed.ok ? undefined : parsed.error).toBeUndefined();
    if (parsed.ok) {
      expect(entriesForPair(parsed.value, 'picker-oak-full')).toHaveLength(1);
      expect(entriesForPair(parsed.value, 'no-such-pair')).toHaveLength(0);
    }
  });
});

describe('newEntryTemplate', () => {
  it('produces a schema-valid entry skeleton keyed to the pair', () => {
    const template = newEntryTemplate('picker-oak-fold', '2026-08-09');
    const result = parseRegister(JSON.stringify({ version: 1, entries: [template] }));

    expect(result.ok).toBe(true);
    expect(template.pairId).toBe('picker-oak-fold');
    expect(template.id.startsWith('picker-oak-fold/')).toBe(true);
    expect(template.disposition).toBe('investigate');
  });
});

describe('the live fidelity-register.json', () => {
  // A schema-invalid live register blocks fidelity report generation but no CI
  // gate parsed it (the review orchestrator is a manual tool), so two entries
  // once shipped without the required date field. This is that issue's check.
  it('parses against the schema', () => {
    const result = parseRegister(JSON.stringify(liveRegister));

    expect(result.ok ? undefined : result.error).toBeUndefined();
    expect(result.ok).toBe(true);
  });
});
