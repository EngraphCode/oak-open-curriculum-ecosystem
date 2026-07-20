import { describe, expect, it } from 'vitest';

import liveRegister from '../fidelity-register.json';

import { entriesForPair, newEntryTemplate, parseRegister } from './fidelity-register';

const validEntry = {
  id: 'hub-home-full/sixth-destination-card',
  pairId: 'hub-home-full',
  kind: 'feature',
  summary: 'The demo adds a sixth destination card the export does not have.',
  evidence: ['demo-evidence/home-live.png'],
  disposition: 'deliberate',
  rationale: 'Ratified requirement: six destination cards.',
  author: 'director-9',
  date: '2026-07-03',
};

describe('parseRegister', () => {
  it('accepts a well-formed register', () => {
    const result = parseRegister(JSON.stringify({ version: 1, entries: [validEntry] }));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.entries).toHaveLength(1);
    }
  });

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
        entries: [{ ...validEntry, id: 'other-pair/sixth-destination-card' }],
      }),
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
          { ...validEntry, id: 'standards-full/rail-count', pairId: 'standards-full' },
        ],
      }),
    );

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(entriesForPair(parsed.value, 'hub-home-full')).toHaveLength(1);
      expect(entriesForPair(parsed.value, 'no-such-pair')).toHaveLength(0);
    }
  });
});

describe('newEntryTemplate', () => {
  it('produces a schema-valid entry skeleton keyed to the pair', () => {
    const template = newEntryTemplate('hub-home-fold', '2026-07-03');
    const result = parseRegister(JSON.stringify({ version: 1, entries: [template] }));

    expect(result.ok).toBe(true);
    expect(template.pairId).toBe('hub-home-fold');
    expect(template.id.startsWith('hub-home-fold/')).toBe(true);
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
