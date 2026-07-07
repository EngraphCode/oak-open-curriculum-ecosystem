import { describe, expect, it } from 'vitest';

import { parseStatusMappingTable } from '../../refounding/refound-claim-census-report.js';
import { parsePlanStateTable } from '../plan-state-model.js';
import { STATUS_MAPPING_TABLE_V1 } from './v1.js';

/**
 * Table v1 shape proofs. The census import is TEST-ONLY — the C1 seam's
 * shape-compatibility fixture (production wiring across
 * `refounding`→`plan-state` is a deferred reintegration decision; this test
 * is the drift guard that lets both sides evolve loudly, not silently).
 * Pure cross-module composition kept under the unit name deliberately.
 */
describe('STATUS_MAPPING_TABLE_V1', () => {
  it('parses through the census parse boundary (C1 shape compatibility)', () => {
    const parsed = parseStatusMappingTable(STATUS_MAPPING_TABLE_V1);
    expect(parsed.ok).toBe(true);
  });

  it('parses through the plan-state engine boundary (narrowed verdict codomain)', () => {
    const parsed = parsePlanStateTable(STATUS_MAPPING_TABLE_V1);
    expect(parsed.ok).toBe(true);
  });

  it('maps both V0-legal values to themselves (identity on the canonical pair)', () => {
    const byValue = new Map(
      STATUS_MAPPING_TABLE_V1.entries.map((entry) => [entry.value, entry.verdict]),
    );
    expect(byValue.get('pending')).toBe('pending');
    expect(byValue.get('completed')).toBe('completed');
  });
});

describe('parsePlanStateTable — the engine boundary', () => {
  it('refuses duplicate values (last-write-wins can never resolve a collision silently)', () => {
    const parsed = parsePlanStateTable({
      version: 1,
      entries: [
        { value: 'done', verdict: 'completed' },
        { value: 'done', verdict: 'pending' },
      ],
    });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error.message).toContain("duplicate value 'done'");
    }
  });

  it('refuses untrimmed values (application is exact-match-after-trim)', () => {
    const parsed = parsePlanStateTable({
      version: 1,
      entries: [{ value: ' done', verdict: 'completed' }],
    });
    expect(parsed.ok).toBe(false);
  });
});
