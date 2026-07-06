import { distinctGroundingWindows } from '../aggregation-verdict.js';
import type { Candidate } from '../judgment-schemas.js';
import type { Corroboration } from '../real-world-signal.js';
import type { RecallNamedKill } from './recall-named-kills.js';

/**
 * The salvage strata builders: per-candidate evidence recompute and the keep/kill tier
 * stratification (salvage ws1). `./salvage-tiers.ts` owns the table contract and the
 * conservation invariant; this module builds the individual strata it composes.
 */

/** The evidence fields every tier entry carries, recomputed from the reduce candidate. */
interface SalvageEvidence {
  readonly candidateId: string;
  readonly pattern: string;
  readonly kind: Candidate['kind'];
  /** Distinct supporting windows, recomputed — never the self-reported count. */
  readonly distinctWindows: number;
  /** Recomputed from the supporting-leaf list; the self-reported groundingCount is unused. */
  readonly supportingLeafCount: number;
}

export interface TierAEntry extends SalvageEvidence {
  readonly corroboratedBy: readonly string[];
  readonly opusQuorumKeep: boolean;
}
export type TierBEntry = SalvageEvidence;
export interface TierCEntry extends SalvageEvidence {
  readonly alsoInTierD: boolean;
}
export interface TierDEntry extends SalvageEvidence {
  readonly source: RecallNamedKill['source'];
  readonly namingBaselineIds: readonly string[];
  readonly alsoInTierC: boolean;
}
export type TierEEntry = SalvageEvidence;

/** Natural candidate-id order (numeric-aware), the deterministic final tie-break. */
export const byNaturalId = (a: string, b: string): number =>
  a.localeCompare(b, 'en', { numeric: true });

const evidenceFor = (candidate: Candidate): SalvageEvidence => ({
  candidateId: candidate.id,
  pattern: candidate.pattern,
  kind: candidate.kind,
  distinctWindows: distinctGroundingWindows(candidate),
  supportingLeafCount: candidate.supportingLeafIds.length,
});

/** Tier A (corroborated or opus-quorum-kept) vs tier B for the sonnet keeps. */
export function stratifyKeeps(input: {
  readonly keeps: readonly Candidate[];
  readonly corroborations: readonly Corroboration[];
  readonly quorumKeepIds: ReadonlySet<string>;
}): { readonly tierA: readonly TierAEntry[]; readonly tierB: readonly TierBEntry[] } {
  const corroborationById = new Map(
    input.corroborations.map((corroboration) => [corroboration.candidateId, corroboration]),
  );
  const tierA: TierAEntry[] = [];
  const tierB: TierBEntry[] = [];
  for (const candidate of input.keeps) {
    const corroboratedBy = corroborationById.get(candidate.id)?.corroboratedBy ?? [];
    const opusQuorumKeep = input.quorumKeepIds.has(candidate.id);
    if (corroboratedBy.length > 0 || opusQuorumKeep) {
      tierA.push({ ...evidenceFor(candidate), corroboratedBy, opusQuorumKeep });
    } else {
      tierB.push(evidenceFor(candidate));
    }
  }
  return { tierA, tierB };
}

/** Tiers C and D (overlap annotated both ways) and the ranked remainder E for the kills. */
export function stratifyKills(input: {
  readonly kills: readonly Candidate[];
  readonly quorumKeepIds: ReadonlySet<string>;
  readonly namedKills: ReadonlyMap<string, RecallNamedKill>;
}): {
  readonly tierC: readonly TierCEntry[];
  readonly tierD: readonly TierDEntry[];
  readonly tierE: readonly TierEEntry[];
} {
  const tierC: TierCEntry[] = [];
  const tierD: TierDEntry[] = [];
  const tierE: TierEEntry[] = [];
  for (const candidate of input.kills) {
    const inC = input.quorumKeepIds.has(candidate.id);
    const namedKill = input.namedKills.get(candidate.id);
    if (inC) {
      tierC.push({ ...evidenceFor(candidate), alsoInTierD: namedKill !== undefined });
    }
    if (namedKill !== undefined) {
      tierD.push({
        ...evidenceFor(candidate),
        source: namedKill.source,
        namingBaselineIds: [...namedKill.baselineIds].sort(byNaturalId),
        alsoInTierC: inC,
      });
    }
    if (!inC && namedKill === undefined) {
      tierE.push(evidenceFor(candidate));
    }
  }
  tierE.sort(
    (a, b) =>
      b.distinctWindows - a.distinctWindows ||
      b.supportingLeafCount - a.supportingLeafCount ||
      byNaturalId(a.candidateId, b.candidateId),
  );
  return { tierC, tierD, tierE };
}
