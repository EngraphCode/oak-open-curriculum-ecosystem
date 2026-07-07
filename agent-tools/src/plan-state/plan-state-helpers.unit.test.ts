import { describe, expect, it } from 'vitest';

import { parseArgs } from './plan-state-helpers.js';

describe('parseArgs — mode selection', () => {
  it('accepts gate mode and accumulates repeated --plan flags in order', () => {
    const result = parseArgs(['--plan', 'a.plan.md', '--plan', 'b.plan.md']);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.planPaths).toEqual(['a.plan.md', 'b.plan.md']);
      expect(result.value.censusPath).toBe('');
    }
  });

  it('accepts audit mode with the optional injection flags', () => {
    const result = parseArgs([
      '--census',
      'claims.jsonl',
      '--status-mapping',
      'table.json',
      '--evidence',
      'evidence.json',
      '--report',
      'out.json',
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        planPaths: [],
        censusPath: 'claims.jsonl',
        statusMappingPath: 'table.json',
        evidencePath: 'evidence.json',
        reportPath: 'out.json',
      });
    }
  });

  it('refuses both modes at once (exactly-one contract)', () => {
    const result = parseArgs(['--plan', 'a.plan.md', '--census', 'claims.jsonl']);
    expect(result.ok).toBe(false);
  });

  it('refuses neither mode (a gate must be pointed at something)', () => {
    const result = parseArgs([]);
    expect(result.ok).toBe(false);
  });
});
