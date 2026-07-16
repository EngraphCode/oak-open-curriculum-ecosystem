import { describe, expect, it } from 'vitest';

import { resolveProposalsChunkScoped } from './proposal-resolution.js';

const chunkA = [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }];
const chunkB = [{ id: 'b1' }, { id: 'b2' }];

function output(...proposals: readonly (readonly string[])[]) {
  return { clusters: proposals.map((memberInstanceIds) => ({ memberInstanceIds })) };
}

describe('resolveProposalsChunkScoped', () => {
  it('resolves a proposal against its own chunk with re-minted chunk+position ids', () => {
    const { proposedCount, resolved, refused } = resolveProposalsChunkScoped(
      [output(['a1', 'a2']), output(['b1', 'b2'])],
      [chunkA, chunkB],
    );
    expect(proposedCount).toBe(2);
    expect(refused).toEqual([]);
    expect(resolved.map((entry) => entry.id)).toEqual(['reducer:c0-p0', 'reducer:c1-p0']);
    expect(resolved[0]?.members.map((m) => m.id)).toEqual(['a1', 'a2']);
  });

  it('refuses WHOLE a proposal citing an id from another chunk — a reducer cannot cite instances it never saw', () => {
    const { resolved, refused } = resolveProposalsChunkScoped(
      [output(['a1', 'b1'])],
      [chunkA, chunkB],
    );
    expect(resolved).toEqual([]);
    expect(refused).toEqual(['reducer:c0-p0 [b1]']);
  });

  it('refuses WHOLE a proposal with a typo id — a typo must not silently shrink a cluster', () => {
    const { resolved, refused } = resolveProposalsChunkScoped(
      [output(['a1', 'a2', 'a3-typo'])],
      [chunkA],
    );
    expect(resolved).toEqual([]);
    expect(refused).toEqual(['reducer:c0-p0 [a3-typo]']);
  });

  it('keeps good proposals while refusing bad ones, and skips dead chunks', () => {
    const { proposedCount, resolved, refused } = resolveProposalsChunkScoped(
      [output(['a1', 'a2'], ['a1', 'ghost']), null],
      [chunkA, chunkB],
    );
    expect(proposedCount).toBe(2);
    expect(resolved.map((entry) => entry.id)).toEqual(['reducer:c0-p0']);
    expect(refused).toEqual(['reducer:c0-p1 [ghost]']);
  });
});
