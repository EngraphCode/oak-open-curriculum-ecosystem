import { requireIsoDateTime } from '../core/iso-date-time.js';

/**
 * Compute queue expiry seconds with invalid timestamps treated as hard
 * errors. Queue-specific: expiry semantics belong to the commit queue; the
 * shared ISO parsing lives in `core/iso-date-time`.
 */
export function secondsUntilExpiry(expiresAt: string, nowIso: string): number {
  return Math.floor(
    (parseIsoDateTime(expiresAt, 'expires_at') - parseIsoDateTime(nowIso, 'now')) / 1000,
  );
}

function parseIsoDateTime(value: string, fieldName: string): number {
  requireIsoDateTime(value, fieldName);
  return Date.parse(value);
}
