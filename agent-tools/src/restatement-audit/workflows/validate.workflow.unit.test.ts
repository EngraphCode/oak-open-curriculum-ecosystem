import { describe, expect, it } from 'vitest';

import { aggregateValidation } from './validate.workflow.js';
import type { Cluster, VoterVerdict } from '../schemas.js';

function cluster(id: string): Cluster {
  return {
    id,
    clusterKind: 'exact-key',
    factClass: 'status-assertion',
    subject: 'G1',
    predicate: 'status',
    verdict: 'conflict',
    distinctValueNorms: ['discharged', 'done'],
    memberInstanceIds: ['f1', 'f2'],
  };
}

function verdict(overrides: Partial<VoterVerdict> = {}): VoterVerdict {
  return {
    sameFact: { pass: true, confidence: 'high' },
    authoredNotCited: { pass: true, confidence: 'high' },
    genuineConflict: { pass: true, confidence: 'high' },
    liveSurface: { pass: true, confidence: 'high' },
    importance: 'high',
    ...overrides,
  };
}

describe('aggregateValidation', () => {
  it('resolves a cluster with two verdicts and computes its disposition', () => {
    const c = cluster('c1');
    const result = aggregateValidation([c], [{ cluster: c, verdicts: [verdict(), verdict()] }]);
    expect(result.resolvedClusterIds).toEqual(['c1']);
    expect(result.incompleteClusterIds).toEqual([]);
    expect(result.dispositions).toEqual([
      { clusterId: 'c1', disposition: 'flagged', reason: null },
    ]);
    expect(result.voterVerdicts).toHaveLength(2);
    expect(result.voterVerdicts.map((v) => v.voterId)).toEqual(['v1', 'v2']);
  });

  it('marks a cluster incomplete when its round is null (dead dispatch)', () => {
    const c = cluster('c1');
    const result = aggregateValidation([c], [null]);
    expect(result.incompleteClusterIds).toEqual(['c1']);
    expect(result.resolvedClusterIds).toEqual([]);
    expect(result.dispositions).toEqual([]);
  });

  it('marks a cluster incomplete when only one voter survived', () => {
    const c = cluster('c1');
    const result = aggregateValidation([c], [{ cluster: c, verdicts: [verdict()] }]);
    expect(result.incompleteClusterIds).toEqual(['c1']);
    expect(result.resolvedClusterIds).toEqual([]);
  });

  it('never emits a voterVerdict for an incomplete cluster', () => {
    const c = cluster('c1');
    const result = aggregateValidation([c], [{ cluster: c, verdicts: [verdict()] }]);
    expect(result.voterVerdicts).toEqual([]);
  });

  it('aggregates multiple clusters independently, positionally aligned', () => {
    const a = cluster('a');
    const b = cluster('b');
    const result = aggregateValidation(
      [a, b],
      [{ cluster: a, verdicts: [verdict(), verdict()] }, null],
    );
    expect(result.resolvedClusterIds).toEqual(['a']);
    expect(result.incompleteClusterIds).toEqual(['b']);
  });
});
