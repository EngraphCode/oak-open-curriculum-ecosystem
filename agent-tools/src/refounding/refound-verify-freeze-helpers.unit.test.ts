import { describe, expect, it } from 'vitest';

import { type Denominator } from './refounding-artefacts.js';
import { formatViolation, mergeDenominator } from './refound-verify-freeze-model.js';

const SHA_A = 'a'.repeat(64);
const SHA_B = 'b'.repeat(64);

/** A literal fixture — mergeDenominator is pure, so no freeze run is needed. */
const denominatorFixture = {
  version: 1,
  generatedFrom: { freezeRuleVersion: 1, ratifiedBy: '.agent/decisions/g1.md' },
  files: [
    { path: 'plans/a.md', bytes: 12, sha256: SHA_A, lines: 3, inventory_mode: 'lines' },
    { path: 'plans/data.tsv', bytes: 4, sha256: SHA_B, lines: 1, inventory_mode: 'whole-file' },
  ],
  totals: { files: 2, lines: 4, bytes: 16 },
} satisfies Denominator;

describe('mergeDenominator', () => {
  it('returns the v1 denominator unchanged for an empty amendment list', () => {
    const merged = mergeDenominator(denominatorFixture, []);
    expect(merged.ok).toBe(true);
    if (merged.ok) {
      expect(merged.value).toEqual(denominatorFixture);
    }
  });

  it('refuses a non-empty amendment list as unimplemented in tranche 1', () => {
    const merged = mergeDenominator(denominatorFixture, [{ files: denominatorFixture.files }]);
    expect(merged.ok).toBe(false);
    if (!merged.ok) {
      expect(merged.error.message).toContain('amendment');
    }
  });
});

describe('formatViolation', () => {
  it('renders one operator-readable line per violation kind', () => {
    expect(
      formatViolation({
        kind: 'hash-mismatch',
        path: 'plans/a.md',
        expectedSha256: SHA_A,
        actualSha256: SHA_B,
      }),
    ).toContain('plans/a.md');
    expect(formatViolation({ kind: 'missing', path: 'plans/b.md' })).toContain('missing');
    expect(formatViolation({ kind: 'unreadable', path: 'plans/b.md', detail: 'EACCES' })).toContain(
      'unreadable',
    );
    expect(formatViolation({ kind: 'extra', path: 'plans/c.md' })).toContain('extra');
    expect(
      formatViolation({ kind: 'recount-mismatch', path: 'plans/a.md', detail: 'lines 3 != 4' }),
    ).toContain('recount');
    expect(formatViolation({ kind: 'totals-mismatch', detail: 'files 3 != 4' })).toContain(
      'totals',
    );
  });
});
