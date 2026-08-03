import { describe, expect, it } from 'vitest';

import type { JsonObject } from '../../core/json.js';

import {
  decideFreshnessOutcome,
  findFreshnessFindings,
  type FreshnessFinding,
} from './validate-claim-freshness-helpers.js';

/**
 * Fixture rows are literal `platform_support`-shaped objects. The ceiling is
 * always injected (7 here, deliberately not the registered production value)
 * so these proofs are independent of the registry configuration.
 */
const CEILING_DAYS = 7;

const WELL_FORMED_ROW: JsonObject = {
  status: 'supported',
  grounded_at: '2026-08-01',
  pinned_to: 'example-cli 1.2.3',
  review_by: '2026-08-05',
};

function rowVariant(overrides: JsonObject): JsonObject {
  return { ...WELL_FORMED_ROW, ...overrides };
}

describe('findFreshnessFindings', () => {
  it('returns no findings for a well-formed pinned row within the ceiling', () => {
    expect(findFreshnessFindings({ alpha: WELL_FORMED_ROW }, CEILING_DAYS)).toEqual([]);
  });

  it('flags a missing freshness field as an integrity finding naming row and field', () => {
    const missingReviewBy: JsonObject = {
      status: 'supported',
      grounded_at: '2026-08-01',
      pinned_to: 'example-cli 1.2.3',
    };
    const findings = findFreshnessFindings({ alpha: missingReviewBy }, CEILING_DAYS);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ kind: 'integrity', row: 'alpha', field: 'review_by' });
  });

  it.each([
    ['2026-02-30', 'a calendar-impossible day'],
    ['2026-8-3', 'a non-zero-padded month/day'],
    ['2026-13-01', 'a month that does not exist'],
  ])('flags %s (%s) as a malformed date', (badDate) => {
    const findings = findFreshnessFindings(
      { alpha: rowVariant({ grounded_at: badDate }) },
      CEILING_DAYS,
    );
    expect(findings.some((f) => f.kind === 'integrity' && f.field === 'grounded_at')).toBe(true);
  });

  it('flags review_by not after grounded_at as an integrity finding', () => {
    const findings = findFreshnessFindings(
      { alpha: rowVariant({ grounded_at: '2026-08-05', review_by: '2026-08-05' }) },
      CEILING_DAYS,
    );
    expect(findings.some((f) => f.kind === 'integrity' && f.field === 'review_by')).toBe(true);
  });

  it('flags an interval exceeding the injected ceiling as an integrity finding', () => {
    const findings = findFreshnessFindings(
      { alpha: rowVariant({ grounded_at: '2026-08-01', review_by: '2026-08-09' }) },
      CEILING_DAYS,
    );
    expect(findings.some((f) => f.kind === 'integrity' && f.field === 'review_by')).toBe(true);
  });

  it('accepts an interval exactly at the ceiling', () => {
    const findings = findFreshnessFindings(
      { alpha: rowVariant({ grounded_at: '2026-08-01', review_by: '2026-08-08' }) },
      CEILING_DAYS,
    );
    expect(findings).toEqual([]);
  });

  it('treats pinned_to: null as an obligation finding, not an integrity defect', () => {
    const findings = findFreshnessFindings(
      { alpha: rowVariant({ pinned_to: null }) },
      CEILING_DAYS,
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ kind: 'obligation', row: 'alpha', field: 'pinned_to' });
  });

  it('flags a non-string, non-null pinned_to as an integrity finding', () => {
    const findings = findFreshnessFindings({ alpha: rowVariant({ pinned_to: 42 }) }, CEILING_DAYS);
    expect(findings.some((f) => f.kind === 'integrity' && f.field === 'pinned_to')).toBe(true);
  });

  it('reports each defective row independently', () => {
    const missingGroundedAt: JsonObject = {
      status: 'supported',
      pinned_to: 'example-cli 1.2.3',
      review_by: '2026-08-05',
    };
    const findings = findFreshnessFindings(
      {
        alpha: WELL_FORMED_ROW,
        beta: missingGroundedAt,
        gamma: rowVariant({ pinned_to: null }),
      },
      CEILING_DAYS,
    );
    const offendingRows = findings.map((f) => f.row).sort((a, b) => a.localeCompare(b));
    expect(offendingRows).toEqual(['beta', 'gamma']);
  });

  it('flags a non-object platform_support value as a single integrity finding', () => {
    const findings = findFreshnessFindings('not-an-object', CEILING_DAYS);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.kind).toBe('integrity');
  });
});

describe('decideFreshnessOutcome', () => {
  const integrity: FreshnessFinding = {
    kind: 'integrity',
    row: 'alpha',
    field: 'review_by',
    reason: 'missing',
  };
  const obligation: FreshnessFinding = {
    kind: 'obligation',
    row: 'beta',
    field: 'pinned_to',
    reason: 'explicitly unverified (null pin)',
  };

  it('maps any integrity finding to exit 1 with lines naming the row and field', () => {
    const outcome = decideFreshnessOutcome([integrity, obligation]);
    expect(outcome.exitCode).toBe(1);
    expect(outcome.reportLines.join('\n')).toContain('alpha');
    expect(outcome.reportLines.join('\n')).toContain('review_by');
  });

  it('maps obligation-only findings to exit 0 with no report lines at all', () => {
    expect(decideFreshnessOutcome([obligation])).toEqual({ exitCode: 0, reportLines: [] });
  });

  it('maps no findings to exit 0 with no report lines', () => {
    expect(decideFreshnessOutcome([])).toEqual({ exitCode: 0, reportLines: [] });
  });
});
