import { describe, expect, it } from 'vitest';

import { parseStatusMappingTable } from '../../refounding/refound-claim-census-report.js';
import { parsePlanStateTable } from '../plan-state-model.js';
import { STATUS_MAPPING_TABLE_V1, STATUS_MAPPING_V1_RATIFICATION } from './v1.js';

/**
 * Table v1 shape proofs. The census import is TEST-ONLY — the C1 seam's
 * shape-compatibility fixture (production wiring across
 * `refounding`→`plan-state` is a deferred reintegration decision; this test
 * is the drift guard that lets both sides evolve loudly, not silently).
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

  it('is version 1 and awaits OG-2 ratification', () => {
    expect(STATUS_MAPPING_TABLE_V1.version).toBe(1);
    expect(STATUS_MAPPING_V1_RATIFICATION).toEqual({
      gate: 'OG-2',
      status: 'pending-ratification',
    });
  });

  it('holds pre-trimmed, unique entries sorted by value (byte-stable authoring)', () => {
    const values = STATUS_MAPPING_TABLE_V1.entries.map((entry) => entry.value);
    expect(values).toEqual(values.map((value) => value.trim()));
    expect(new Set(values).size).toBe(values.length);
    expect(values).toEqual([...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
  });

  it('maps both V0-legal values to themselves (identity on the canonical pair)', () => {
    const byValue = new Map(
      STATUS_MAPPING_TABLE_V1.entries.map((entry) => [entry.value, entry.verdict]),
    );
    expect(byValue.get('pending')).toBe('pending');
    expect(byValue.get('completed')).toBe('completed');
  });
});
