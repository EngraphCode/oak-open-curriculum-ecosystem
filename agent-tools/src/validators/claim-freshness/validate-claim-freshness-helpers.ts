import { typeSafeEntries } from '@oaknational/type-helpers';

import { isJsonObject, type JsonObject } from '../../core/json.js';

/**
 * Pure rules for the perishable-claim freshness contract (ADR-223) over the
 * hook policy's `platform_support` rows.
 *
 * Deliberately clock-free: every rule is a deterministic function of the row
 * content plus the injected per-surface ceiling, so the gate run can never be
 * reddened by time passing (the plan-node gate-drift precedent). The
 * clock-bearing arm — expiry, null-pin obligations, pin drift — lives in the
 * session-open drift instrument, never here.
 *
 * @packageDocumentation
 */

/** One freshness defect or obligation found on a `platform_support` row. */
export interface FreshnessFinding {
  /**
   * `integrity` findings fail the gate (a defect in the record being
   * edited); `obligation` findings never fail the gate — they are standing
   * re-verification obligations (PDR-133 §8 explicitly-unverified rows)
   * surfaced by the session-open instrument.
   */
  readonly kind: 'integrity' | 'obligation';
  /** The platform row key, e.g. `codex`. */
  readonly row: string;
  /** The offending field, when the finding is field-scoped. */
  readonly field?: string;
  /** Human-readable reason, free of caller payload by construction. */
  readonly reason: string;
}

/** The gate's verdict over a finding set. */
export interface FreshnessOutcome {
  readonly exitCode: 0 | 1;
  /** Empty exactly when the gate passes — the gate never emits a non-fatal notice. */
  readonly reportLines: readonly string[];
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
const MS_PER_DAY = 86_400_000;

/**
 * Strict ISO calendar-date parse: shape `YYYY-MM-DD` AND a real calendar day.
 * The UTC round-trip rejects impossible dates (`2026-02-30`) that
 * `Date.parse` silently rolls forward, and the shape check rejects
 * non-padded forms (`2026-8-3`) that parse but break lexicographic and
 * arithmetic assumptions.
 */
function parseIsoDateUtc(value: unknown): number | null {
  if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value)) {
    return null;
  }
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(timestamp)) {
    return null;
  }
  const roundTrip = new Date(timestamp).toISOString().slice(0, 10);
  return roundTrip === value ? timestamp : null;
}

interface ResolvedDateField {
  readonly timestamp: number | null;
  readonly findings: readonly FreshnessFinding[];
}

/** Resolve one required date field to a timestamp, or an integrity finding. */
function resolveDateField(rowKey: string, row: JsonObject, field: string): ResolvedDateField {
  const timestamp = parseIsoDateUtc(row[field]);
  if (timestamp !== null) {
    return { timestamp, findings: [] };
  }
  const reason =
    row[field] === undefined
      ? 'missing — every registered perishable claim carries this field'
      : 'not a real YYYY-MM-DD calendar date';
  return { timestamp: null, findings: [{ kind: 'integrity', row: rowKey, field, reason }] };
}

/** Ordering and ceiling rules over the two resolved timestamps. */
function checkInterval(
  rowKey: string,
  groundedAt: number | null,
  reviewBy: number | null,
  maxIntervalDays: number,
): readonly FreshnessFinding[] {
  if (groundedAt === null || reviewBy === null) {
    return [];
  }
  if (reviewBy <= groundedAt) {
    return [
      { kind: 'integrity', row: rowKey, field: 'review_by', reason: 'must be after grounded_at' },
    ];
  }
  if ((reviewBy - groundedAt) / MS_PER_DAY > maxIntervalDays) {
    return [
      {
        kind: 'integrity',
        row: rowKey,
        field: 'review_by',
        reason: `interval exceeds this surface's registered ceiling of ${String(maxIntervalDays)} days`,
      },
    ];
  }
  return [];
}

/** Pin rules: string = verified pin; null = explicit PDR-133 §8 obligation. */
function checkPin(rowKey: string, row: JsonObject): readonly FreshnessFinding[] {
  if (row.pinned_to === null) {
    return [
      {
        kind: 'obligation',
        row: rowKey,
        field: 'pinned_to',
        reason: 'explicitly unverified (null pin) — a standing re-verification obligation',
      },
    ];
  }
  if (typeof row.pinned_to === 'string' && row.pinned_to.trim() !== '') {
    return [];
  }
  const reason =
    row.pinned_to === undefined
      ? 'missing — record the verified version, or null for explicitly-unverified'
      : 'must be a non-empty string or null (explicitly unverified)';
  return [{ kind: 'integrity', row: rowKey, field: 'pinned_to', reason }];
}

function checkRow(
  rowKey: string,
  row: JsonObject,
  maxIntervalDays: number,
): readonly FreshnessFinding[] {
  const groundedAt = resolveDateField(rowKey, row, 'grounded_at');
  const reviewBy = resolveDateField(rowKey, row, 'review_by');
  return [
    ...groundedAt.findings,
    ...reviewBy.findings,
    ...checkInterval(rowKey, groundedAt.timestamp, reviewBy.timestamp, maxIntervalDays),
    ...checkPin(rowKey, row),
  ];
}

/**
 * Evaluate every `platform_support` row against the freshness contract.
 *
 * @param platformSupport - The parsed `platform_support` object.
 * @param maxIntervalDays - The registered per-surface review-interval ceiling.
 */
export function findFreshnessFindings(
  platformSupport: unknown,
  maxIntervalDays: number,
): readonly FreshnessFinding[] {
  if (!isJsonObject(platformSupport)) {
    return [
      {
        kind: 'integrity',
        row: 'platform_support',
        reason: 'platform_support is missing or not an object',
      },
    ];
  }
  return typeSafeEntries(platformSupport).flatMap(([rowKey, row]) =>
    isJsonObject(row)
      ? checkRow(rowKey, row, maxIntervalDays)
      : [{ kind: 'integrity' as const, row: rowKey, reason: 'row is not an object' }],
  );
}

/**
 * Map findings to the gate verdict. Integrity findings fail the run with
 * lines naming each offender; obligation-only findings produce a clean pass
 * with NO output — the gate never carries a non-fatal notice
 * (no-warning-toleration; the session-open instrument owns obligations).
 */
export function decideFreshnessOutcome(findings: readonly FreshnessFinding[]): FreshnessOutcome {
  const integrity = findings.filter((finding) => finding.kind === 'integrity');
  if (integrity.length === 0) {
    return { exitCode: 0, reportLines: [] };
  }
  return {
    exitCode: 1,
    reportLines: integrity.map(
      (finding) =>
        `  ${finding.row}${finding.field === undefined ? '' : `.${finding.field}`}: ${finding.reason}`,
    ),
  };
}
