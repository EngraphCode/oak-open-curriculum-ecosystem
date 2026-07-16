/**
 * Chunk-scoped resolution of reducer proposals — the reduce stage's evidence-integrity
 * seam. A reducer may only cite instances from the chunk it actually saw: resolving
 * against a global residual map would accept citations of instances the reducer never
 * received (predictable ids make that trivially possible), and silently dropping an
 * unresolvable id would let a typo shrink a proposal into a DIFFERENT, smaller cluster.
 * Every proposal therefore resolves against its ORIGINATING chunk only and is refused
 * WHOLE — loudly, by name — on any unknown or out-of-chunk member id.
 *
 * Pure and sandbox-safe (type-only imports); regression pins live beside it.
 *
 * @packageDocumentation
 */

interface ProposalShape {
  readonly memberInstanceIds: readonly string[];
}

interface ReducerOutputShape {
  readonly clusters: readonly ProposalShape[];
}

interface InstanceShape {
  readonly id: string;
}

interface ResolvedProposal<T> {
  /** Re-minted per chunk+position — agent-invented ids are never trusted for uniqueness. */
  readonly id: string;
  readonly members: readonly T[];
}

export interface ProposalResolution<T> {
  readonly proposedCount: number;
  readonly resolved: readonly ResolvedProposal<T>[];
  /** `proposalId [bad-id, ...]` for every proposal refused whole — never silently shrunk. */
  readonly refused: readonly string[];
}

/** Resolve every proposal against its originating chunk; refuse whole on any bad id. */
export function resolveProposalsChunkScoped<T extends InstanceShape>(
  reducerResults: readonly (ReducerOutputShape | null)[],
  chunks: readonly (readonly T[])[],
): ProposalResolution<T> {
  const resolved: ResolvedProposal<T>[] = [];
  const refused: string[] = [];
  let proposedCount = 0;
  reducerResults.forEach((result, chunkIndex) => {
    if (result === null) {
      return;
    }
    const chunkById = new Map(
      (chunks[chunkIndex] ?? []).map((instance) => [instance.id, instance]),
    );
    result.clusters.forEach((proposal, proposalIndex) => {
      proposedCount += 1;
      const id = `reducer:c${chunkIndex}-p${proposalIndex}`;
      const members: T[] = [];
      const badIds: string[] = [];
      for (const memberId of proposal.memberInstanceIds) {
        const member = chunkById.get(memberId);
        if (member === undefined) {
          badIds.push(memberId);
        } else {
          members.push(member);
        }
      }
      if (badIds.length > 0) {
        refused.push(`${id} [${badIds.join(', ')}]`);
      } else {
        resolved.push({ id, members });
      }
    });
  });
  return { proposedCount, resolved, refused };
}
