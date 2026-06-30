import { describe, expect, it } from 'vitest';

import {
  assessValidateCompleteness,
  deterministicJitterMs,
  postReduceRegate,
  resolveResumeSeed,
  type ValidatedCandidate,
} from './run-orchestration.js';

/**
 * The orchestration layer the harness Workflow templates mirror: candidate-granular resume,
 * the completeness assertion, the post-reduce hard-abort re-gate, the cost calibration, and
 * deterministic per-voter jitter. Pure functions; the templates paste a type-stripped copy that
 * is re-checked against this source before each launch (not machine-pinned — see the module
 * docstring and README). No aggregation math is touched.
 */

const candidate = (id: string): { id: string; pattern: string } => ({
  id,
  pattern: `pattern ${id}`,
});

describe('resolveResumeSeed (candidate-granular resume)', () => {
  const seed = [candidate('C01'), candidate('C02'), candidate('C03'), candidate('C04')];

  it('returns the full seed when nothing is resolved (a fresh run)', () => {
    expect(resolveResumeSeed(seed, [])).toEqual(seed);
  });

  it('returns only the unresolved tail, preserving seed order (a re-seed)', () => {
    expect(resolveResumeSeed(seed, ['C01', 'C03'])).toEqual([candidate('C02'), candidate('C04')]);
  });

  it('returns an empty set when every candidate is already resolved', () => {
    expect(resolveResumeSeed(seed, ['C01', 'C02', 'C03', 'C04'])).toEqual([]);
  });

  it('ignores resolved ids that are not in the seed (no crash, no over-removal)', () => {
    expect(resolveResumeSeed(seed, ['C99', 'C02'])).toEqual([
      candidate('C01'),
      candidate('C03'),
      candidate('C04'),
    ]);
  });

  it('does not mutate the input seed', () => {
    const input = [candidate('C01'), candidate('C02')];
    resolveResumeSeed(input, ['C01']);
    expect(input).toEqual([candidate('C01'), candidate('C02')]);
  });
});

describe('assessValidateCompleteness (the extended completeness guard)', () => {
  const candidates = [{ id: 'C01' }, { id: 'C02' }, { id: 'C03' }];
  const terminal = (
    id: string,
    disposition: ValidatedCandidate['disposition'],
  ): ValidatedCandidate => ({
    candidateId: id,
    disposition,
    reason: null,
  });
  const held = (id: string, reason: string): ValidatedCandidate => ({
    candidateId: id,
    disposition: 'held-for-review',
    reason,
  });

  it('is complete when every candidate has a terminal disposition and the count matches', () => {
    const validated = [
      terminal('C01', 'keep'),
      terminal('C02', 'kill'),
      terminal('C03', 'reroute'),
    ];
    expect(assessValidateCompleteness(validated, candidates)).toEqual({
      complete: true,
      incompleteCandidateIds: [],
      missingCandidateIds: [],
    });
  });

  it('is incomplete on a retry-cap hold (the original quota-trip case)', () => {
    const validated = [terminal('C01', 'keep'), held('C02', 'retry-cap'), terminal('C03', 'keep')];
    const report = assessValidateCompleteness(validated, candidates);
    expect(report.complete).toBe(false);
    expect(report.incompleteCandidateIds).toEqual(['C02']);
    expect(report.missingCandidateIds).toEqual([]);
  });

  it('is incomplete on a held-for-review of ANY reason, not only retry-cap (the extension)', () => {
    const validated = [
      terminal('C01', 'keep'),
      held('C02', 'quorum-tie'),
      held('C03', 'lens-collision'),
    ];
    const report = assessValidateCompleteness(validated, candidates);
    expect(report.complete).toBe(false);
    expect(report.incompleteCandidateIds).toEqual(['C02', 'C03']);
  });

  it('is incomplete when a candidate is missing from validated (a silent filter(Boolean) drop)', () => {
    const validated = [terminal('C01', 'keep'), terminal('C03', 'kill')]; // C02 dropped
    const report = assessValidateCompleteness(validated, candidates);
    expect(report.complete).toBe(false);
    expect(report.missingCandidateIds).toEqual(['C02']);
    expect(report.incompleteCandidateIds).toEqual([]);
  });

  it('reports held AND missing together (the two failure dimensions do not mask each other)', () => {
    const validated = [terminal('C01', 'keep'), held('C02', 'quorum-tie')]; // C02 held, C03 dropped
    const report = assessValidateCompleteness(validated, candidates);
    expect(report.complete).toBe(false);
    expect(report.incompleteCandidateIds).toEqual(['C02']);
    expect(report.missingCandidateIds).toEqual(['C03']);
  });

  it('is incomplete when the validated count does not match (a duplicate row)', () => {
    const validated = [
      terminal('C01', 'keep'),
      terminal('C02', 'keep'),
      terminal('C03', 'keep'),
      terminal('C03', 'keep'), // duplicate → count 4 ≠ 3
    ];
    expect(assessValidateCompleteness(validated, candidates).complete).toBe(false);
  });
});

describe('postReduceRegate (calibration + hard-abort decision)', () => {
  it('models worst-case validate at the calibrated 50k all-in figure: 50 candidates x 5 voters x 50k = 12.5M, no double multiplier', () => {
    const regate = postReduceRegate({ candidateCount: 50, ceiling: 20_000_000 });
    // 12.5M pins the calibration through OUTPUT: 31.25M would mean a 2.5x high multiplier was wrongly re-applied.
    expect(regate.worstCaseTokens).toBe(12_500_000);
    expect(regate.estimate.totalTokens).toBe(12_500_000);
  });

  it('does NOT abort when the worst-case validate cost is within the ceiling', () => {
    const regate = postReduceRegate({ candidateCount: 50, ceiling: 13_000_000 });
    expect(regate.estimate.withinCeiling).toBe(true);
    expect(regate.abort).toBe(false);
  });

  it('HARD-ABORTS when the real candidate count breaches the ceiling (the v2 overrun the old log-only gate missed)', () => {
    const regate = postReduceRegate({ candidateCount: 50, ceiling: 2_000_000 });
    expect(regate.estimate.withinCeiling).toBe(false);
    expect(regate.abort).toBe(true);
    expect(regate.message).toContain('12500000');
  });

  it('abort is exactly the negation of withinCeiling at the boundary', () => {
    const exact = postReduceRegate({ candidateCount: 50, ceiling: 12_500_000 });
    expect(exact.abort).toBe(false); // 12.5M <= 12.5M is within
    const justUnder = postReduceRegate({ candidateCount: 50, ceiling: 12_499_999 });
    expect(justUnder.abort).toBe(true);
  });
});

describe('deterministicJitterMs (no Math.random — resume-safe in the Workflow sandbox)', () => {
  it('is deterministic: the same seed always yields the same delay', () => {
    expect(deterministicJitterMs('C12:tier-2:r0:1', 400)).toBe(
      deterministicJitterMs('C12:tier-2:r0:1', 400),
    );
  });

  it('stays within the inclusive [0, maxMs] range', () => {
    for (const seed of ['a', 'C01:tier-0:r0:0', 'vote:C49:tier-2:base-rate', 'zzz']) {
      const ms = deterministicJitterMs(seed, 250);
      expect(ms).toBeGreaterThanOrEqual(0);
      expect(ms).toBeLessThanOrEqual(250);
    }
  });

  it('spreads distinct voter ids across the window (flattens the dispatch burst)', () => {
    const ids = Array.from({ length: 40 }, (_, i) => `C${i}:tier-2:r0:${i % 3}`);
    const distinct = new Set(ids.map((id) => deterministicJitterMs(id, 400)));
    expect(distinct.size).toBeGreaterThan(10);
  });

  it('returns 0 when jitter is disabled (maxMs <= 0)', () => {
    expect(deterministicJitterMs('anything', 0)).toBe(0);
  });

  it('is in-range and non-zero for an empty seed (FNV offset basis, not 0)', () => {
    // FNV-1a over zero bytes returns the offset basis, so an empty / malformed voter id does not
    // collapse the delay to 0 — it stays a deterministic in-range value.
    const ms = deterministicJitterMs('', 400);
    expect(ms).toBe(25);
    expect(ms).toBeGreaterThanOrEqual(0);
    expect(ms).toBeLessThanOrEqual(400);
  });
});
