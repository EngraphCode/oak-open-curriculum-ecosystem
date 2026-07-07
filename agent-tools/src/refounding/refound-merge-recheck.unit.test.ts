import { describe, expect, it } from 'vitest';

import { decideMergeRecheckVerdict } from './refound-merge-recheck.js';
import { type MergeRecheckSummary } from './refound-merge-recheck-helpers.js';

/**
 * Unit proof for `refound-merge-recheck`'s pure verdict decision (test-I3,
 * F1 §7): an unsanctioned arrival is exit 1 (RED), everything else exit 0.
 * Pure — no stdout capture, no filesystem.
 */

const summary = (overrides: Partial<MergeRecheckSummary> = {}): MergeRecheckSummary => ({
  liveFiles: 3,
  added: 0,
  modified: 0,
  deleted: 0,
  sanctioned: 0,
  red: false,
  ...overrides,
});

describe('decideMergeRecheckVerdict — exit code contract', () => {
  it('OK (no unsanctioned arrivals) decides exit 0', () => {
    const verdict = decideMergeRecheckVerdict(summary({ sanctioned: 2, deleted: 1 }));
    expect(verdict.exitCode).toBe(0);
    expect(verdict.lines[0]).toContain('OK');
  });

  it('RED (an unsanctioned arrival) decides exit 1', () => {
    const verdict = decideMergeRecheckVerdict(summary({ added: 1, red: true }));
    expect(verdict.exitCode).toBe(1);
    expect(verdict.lines[0]).toContain('RED');
  });
});
