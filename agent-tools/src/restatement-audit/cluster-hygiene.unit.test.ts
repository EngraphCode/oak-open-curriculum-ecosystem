import { describe, expect, it } from 'vitest';

import { dedupeByMemberSet, overlappingMemberIds } from './cluster-hygiene.js';
describe('dedupeByMemberSet', () => {
  const base = {
    clusterKind: 'reducer' as const,
    factClass: 'count' as const,
    subject: 's',
    predicate: 'p',
    verdict: 'conflict' as const,
    distinctValueNorms: ['1', '2'],
  };

  it('drops a later cluster covering exactly the same members, keeping the first', () => {
    const first = { ...base, id: 'reducer:c0-p0', memberInstanceIds: ['f1', 'f2'] };
    const dupe = { ...base, id: 'reducer:c1-p3', memberInstanceIds: ['f2', 'f1'] };
    expect(dedupeByMemberSet([first, dupe])).toStrictEqual([first]);
  });

  it('keeps clusters whose member sets differ, even partially overlapping', () => {
    const a = { ...base, id: 'reducer:c0-p0', memberInstanceIds: ['f1', 'f2'] };
    const b = { ...base, id: 'reducer:c0-p1', memberInstanceIds: ['f1', 'f3'] };
    expect(dedupeByMemberSet([a, b])).toStrictEqual([a, b]);
  });
});

describe('overlappingMemberIds', () => {
  const base = {
    clusterKind: 'reducer' as const,
    factClass: 'count' as const,
    subject: 's',
    predicate: 'p',
    verdict: 'conflict' as const,
    distinctValueNorms: ['1', '2'],
  };

  it('names every instance id shared by more than one cluster', () => {
    const a = { ...base, id: 'r1', memberInstanceIds: ['f1', 'f2'] };
    const b = { ...base, id: 'r2', memberInstanceIds: ['f1', 'f3'] };
    expect(overlappingMemberIds([a, b])).toStrictEqual(['f1']);
  });

  it('returns nothing for disjoint clusters', () => {
    const a = { ...base, id: 'r1', memberInstanceIds: ['f1'] };
    const b = { ...base, id: 'r2', memberInstanceIds: ['f2'] };
    expect(overlappingMemberIds([a, b])).toStrictEqual([]);
  });
});
