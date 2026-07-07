import { describe, expect, it } from 'vitest';

import {
  decideBatchStatusVerdict,
  parseRunState,
  type RunState,
} from './refound-batch-status-model.js';

/**
 * Pure behaviours of the batch-status dashboard: the closed run-state
 * schema and the exit-code contract (any recomputed red or invalid stage
 * exits 1; not-reached stages are honest early-protocol states, exit 0).
 */

const greenRunState = (): RunState => ({
  version: 1,
  denominator: { state: 'green', detail: '3 file(s)' },
  freeze: { state: 'green', detail: '3 file(s) verified' },
  inventory: { state: 'green', detail: '5 record(s)' },
  crossArea: { state: 'green', detail: '2 tiled area(s), no duplicate ids' },
  areas: [
    { area: 'plans--alpha', files: 2, state: 'green', detail: '4 row(s)' },
    { area: 'plans--beta', files: 1, state: 'green', detail: '2 row(s)' },
  ],
});

describe('parseRunState', () => {
  it('parses the closed shape and rejects unknown keys or states', () => {
    expect(parseRunState(greenRunState()).ok).toBe(true);
    expect(parseRunState({ ...greenRunState(), extra: 1 }).ok).toBe(false);
    expect(
      parseRunState({
        ...greenRunState(),
        freeze: { state: 'greenish', detail: '' },
      }).ok,
    ).toBe(false);
  });
});

describe('decideBatchStatusVerdict', () => {
  it('exits 0 with per-stage lines when everything recomputes green', () => {
    const verdict = decideBatchStatusVerdict(greenRunState());
    expect(verdict.exitCode).toBe(0);
    expect(verdict.lines.join('\n')).toContain('freeze');
    expect(verdict.lines.join('\n')).toContain('plans--alpha');
  });

  it('exits 0 on not-reached stages (early protocol is honest, never a crash)', () => {
    const verdict = decideBatchStatusVerdict({
      ...greenRunState(),
      freeze: { state: 'not-reached', detail: 'no frozen tree on disk' },
      inventory: { state: 'not-reached', detail: 'freeze stage not green' },
      crossArea: { state: 'not-reached', detail: 'freeze stage not green' },
      areas: [],
    });
    expect(verdict.exitCode).toBe(0);
    expect(verdict.lines.join('\n')).toContain('not-reached');
  });

  it('exits 1 when any stage recomputes red', () => {
    const runState = greenRunState();
    const verdict = decideBatchStatusVerdict({
      ...runState,
      areas: [
        runState.areas[0],
        { area: 'plans--beta', files: 1, state: 'red', detail: '1 violation(s)' },
      ],
    });
    expect(verdict.exitCode).toBe(1);
  });

  it('exits 1 when any stage is invalid (unreadable is never silently green)', () => {
    const verdict = decideBatchStatusVerdict({
      ...greenRunState(),
      inventory: { state: 'invalid', detail: 'inventory line 3: not JSON' },
    });
    expect(verdict.exitCode).toBe(1);
  });
});
