import { describe, expect, it } from 'vitest';

import { type Denominator } from './refounding-artefacts.js';
import { type DenominatorAmendment, type NumberedAmendment } from './refound-amendments.js';
import { formatViolation, mergeDenominator } from './refound-verify-freeze-model.js';

const SHA_A = 'a'.repeat(64);
const SHA_B = 'b'.repeat(64);
const SHA_C = 'c'.repeat(64);

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

/** A well-formed amendment: one arrival row plus its matching identity proof. */
const amendmentFixture = (): DenominatorAmendment => ({
  version: 1,
  files: [{ path: 'plans/arrived.md', bytes: 9, sha256: SHA_C, lines: 2, inventory_mode: 'lines' }],
  identityProof: [{ path: 'plans/arrived.md', source_sha256: SHA_C, copy_sha256: SHA_C, bytes: 9 }],
});

const numbered = (amendment: DenominatorAmendment, sequence = 1): NumberedAmendment => ({
  sequence,
  amendment,
});

describe('mergeDenominator', () => {
  it('returns the v1 denominator unchanged for an empty amendment list', () => {
    const merged = mergeDenominator(denominatorFixture, []);
    expect(merged.ok).toBe(true);
    if (merged.ok) {
      expect(merged.value).toEqual(denominatorFixture);
    }
  });

  it('merges a proven amendment: files re-sorted by path, totals recomputed in code', () => {
    const merged = mergeDenominator(denominatorFixture, [numbered(amendmentFixture())]);
    expect(merged.ok).toBe(true);
    if (merged.ok) {
      expect(merged.value.files.map((file) => file.path)).toEqual([
        'plans/a.md',
        'plans/arrived.md',
        'plans/data.tsv',
      ]);
      expect(merged.value.totals).toEqual({ files: 3, lines: 6, bytes: 25 });
      expect(merged.value.generatedFrom).toEqual(denominatorFixture.generatedFrom);
    }
  });

  it('refuses a file row lacking its identity proof (F1 §7 — nothing merged)', () => {
    const amendment = amendmentFixture();
    const broken: DenominatorAmendment = {
      ...amendment,
      identityProof: [
        { path: 'plans/other.md', source_sha256: SHA_C, copy_sha256: SHA_C, bytes: 9 },
      ],
    };
    const merged = mergeDenominator(denominatorFixture, [numbered(broken)]);
    expect(merged.ok).toBe(false);
    if (!merged.ok) {
      expect(merged.error.message).toContain('identity proof');
      expect(merged.error.message).toContain('plans/arrived.md');
    }
  });

  it('refuses an identity proof whose source and copy hashes disagree', () => {
    const amendment = amendmentFixture();
    const broken: DenominatorAmendment = {
      ...amendment,
      identityProof: [
        { path: 'plans/arrived.md', source_sha256: SHA_A, copy_sha256: SHA_C, bytes: 9 },
      ],
    };
    expect(mergeDenominator(denominatorFixture, [numbered(broken)]).ok).toBe(false);
  });

  it('refuses an identity proof that disagrees with the file row hash or byte count', () => {
    const amendment = amendmentFixture();
    const wrongHash: DenominatorAmendment = {
      ...amendment,
      identityProof: [
        { path: 'plans/arrived.md', source_sha256: SHA_A, copy_sha256: SHA_A, bytes: 9 },
      ],
    };
    expect(mergeDenominator(denominatorFixture, [numbered(wrongHash)]).ok).toBe(false);
    const wrongBytes: DenominatorAmendment = {
      ...amendment,
      identityProof: [
        { path: 'plans/arrived.md', source_sha256: SHA_C, copy_sha256: SHA_C, bytes: 10 },
      ],
    };
    expect(mergeDenominator(denominatorFixture, [numbered(wrongBytes)]).ok).toBe(false);
  });

  it('refuses an amendment path already present in the denominator', () => {
    const collision: DenominatorAmendment = {
      version: 1,
      files: [{ path: 'plans/a.md', bytes: 12, sha256: SHA_A, lines: 3, inventory_mode: 'lines' }],
      identityProof: [{ path: 'plans/a.md', source_sha256: SHA_A, copy_sha256: SHA_A, bytes: 12 }],
    };
    const merged = mergeDenominator(denominatorFixture, [numbered(collision)]);
    expect(merged.ok).toBe(false);
    if (!merged.ok) {
      expect(merged.error.message).toContain('plans/a.md');
    }
  });

  it('refuses two file rows sharing one path within one amendment as a collision (not a missing proof)', () => {
    const row = {
      path: 'plans/arrived.md',
      bytes: 9,
      sha256: SHA_C,
      lines: 2,
      inventory_mode: 'lines' as const,
    };
    const duplicated: DenominatorAmendment = {
      version: 1,
      files: [row, row],
      identityProof: [
        { path: 'plans/arrived.md', source_sha256: SHA_C, copy_sha256: SHA_C, bytes: 9 },
      ],
    };
    const merged = mergeDenominator(denominatorFixture, [numbered(duplicated)]);
    expect(merged.ok).toBe(false);
    if (!merged.ok) {
      expect(merged.error.message).toContain('collision');
      expect(merged.error.message).toContain('plans/arrived.md');
      // The old behaviour mis-reported the second row as lacking its proof.
      expect(merged.error.message).not.toContain('identity proof');
    }
  });

  it('refuses identity proofs for paths outside the amendment file list', () => {
    const amendment = amendmentFixture();
    const stray: DenominatorAmendment = {
      ...amendment,
      identityProof: [
        ...amendment.identityProof,
        { path: 'plans/stray.md', source_sha256: SHA_B, copy_sha256: SHA_B, bytes: 4 },
      ],
    };
    const merged = mergeDenominator(denominatorFixture, [numbered(stray)]);
    expect(merged.ok).toBe(false);
    if (!merged.ok) {
      expect(merged.error.message).toContain('plans/stray.md');
    }
  });

  it('names the refusing amendment by sequence number', () => {
    const first = amendmentFixture();
    const second: DenominatorAmendment = {
      version: 1,
      files: [
        { path: 'plans/arrived.md', bytes: 9, sha256: SHA_C, lines: 2, inventory_mode: 'lines' },
      ],
      identityProof: [
        { path: 'plans/arrived.md', source_sha256: SHA_C, copy_sha256: SHA_C, bytes: 9 },
      ],
    };
    const merged = mergeDenominator(denominatorFixture, [numbered(first, 1), numbered(second, 2)]);
    expect(merged.ok).toBe(false);
    if (!merged.ok) {
      expect(merged.error.message).toContain('amendment-2');
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
