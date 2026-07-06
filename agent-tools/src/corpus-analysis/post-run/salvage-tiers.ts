import { err, ok, type Result } from '@oaknational/result';

import type { Candidate } from '../judgment-schemas.js';
import type { MetaOutput } from '../recall-schemas.js';
import type { Corroboration } from '../real-world-signal.js';
import { opusQuorumOutcomes, unknownBankedCandidateIds } from './banked-verdicts.js';
import type { BankedFreetoolEntry, QuorumOutcome } from './banked-verdicts.js';
import { partitionByDisposition, unknownDispositionIds } from './disposition-partition.js';
import type { ResidualEntry } from './disposition-partition.js';
import { recallNamedKills } from './recall-named-kills.js';
import { byNaturalId, stratifyKeeps, stratifyKills } from './salvage-strata.js';
import type {
  TierAEntry,
  TierBEntry,
  TierCEntry,
  TierDEntry,
  TierEEntry,
} from './salvage-strata.js';
import type { ValidateSuccess } from './triage.js';

/**
 * Deterministic salvage stratification of a completed discovery run (salvage ws1).
 *
 * @remarks
 * The 2026-07-02 validate stage's judgment regime failed calibration: it killed known-real
 * baselines the run had correctly found, so the survivors list is not a complete discovery
 * set. This module recovers the discovery value already paid for by stratifying every
 * candidate into evidence tiers from the committed checkpoints plus the banked
 * paired-comparison verdict corpus — pure code over recorded judgments, zero validate
 * re-spend, no LLM in the loop (PDR-122: agents judge atomically, code computes and
 * routes). The quorum over banked diverse-lens ensembles replays the FROZEN adjudication
 * math (`./banked-verdicts.ts`), never a re-derivation; the strata builders live in
 * `./salvage-strata.ts`.
 *
 * Tiers: A — sonnet keeps that are corroborated on disk or opus-quorum-kept (highest
 * confidence); B — the remaining sonnet keeps (survived the harshest filter); C —
 * opus-quorum-keep / sonnet-kill disagreements (the over-kill signal); D — kills the meta
 * stage's recall judgments identify as baseline-matching (proven-real false kills, see
 * `./recall-named-kills.ts`); E — the remaining kills ranked by recomputed evidence
 * strength for the owner's manual round. Conservation invariant: every candidate lands in
 * exactly one of A, B, C∪D, E, or the explicit residual bucket — a partition mismatch is
 * a typed failure, never a silent drop.
 *
 * @packageDocumentation
 */

export interface SalvageTierTable {
  readonly tierA: readonly TierAEntry[];
  readonly tierB: readonly TierBEntry[];
  readonly tierC: readonly TierCEntry[];
  readonly tierD: readonly TierDEntry[];
  readonly tierE: readonly TierEEntry[];
  readonly residual: readonly ResidualEntry[];
  readonly opusQuorum: {
    readonly candidatesWithLensedVerdicts: number;
    readonly completeQuorums: number;
    readonly quorumKeeps: number;
    readonly incompleteQuorumCandidateIds: readonly string[];
  };
}

function quorumSummary(
  quorumOutcomes: ReadonlyMap<string, QuorumOutcome>,
  quorumKeepIds: ReadonlySet<string>,
): SalvageTierTable['opusQuorum'] {
  return {
    candidatesWithLensedVerdicts: quorumOutcomes.size,
    completeQuorums: [...quorumOutcomes.values()].filter((outcome) => outcome.complete).length,
    quorumKeeps: quorumKeepIds.size,
    incompleteQuorumCandidateIds: [...quorumOutcomes]
      .filter(([, outcome]) => !outcome.complete)
      .map(([candidateId]) => candidateId)
      .sort(byNaturalId),
  };
}

/** The conservation invariant: every candidate in exactly one stratum, or a typed failure. */
function verifyConservation(
  table: Omit<SalvageTierTable, 'opusQuorum'>,
  candidateCount: number,
): Result<undefined, Error> {
  const rescuedKillIds = new Set(
    [...table.tierC, ...table.tierD].map((entry) => entry.candidateId),
  );
  const partitionTotal =
    table.tierA.length +
    table.tierB.length +
    rescuedKillIds.size +
    table.tierE.length +
    table.residual.length;
  if (partitionTotal !== candidateCount) {
    return err(
      new Error(
        `Salvage partition does not conserve the candidate count: ${partitionTotal} partitioned of ${candidateCount} candidates.`,
      ),
    );
  }
  return ok(undefined);
}

/** Both fail-loud referential checks against the reduce candidate set, as one typed result. */
const referentialFailure = (
  checks: readonly { readonly kind: string; readonly unknownIds: readonly string[] }[],
): Result<undefined, Error> => {
  const failed = checks.find((check) => check.unknownIds.length > 0);
  return failed === undefined
    ? ok(undefined)
    : err(
        new Error(
          `${failed.kind} name candidates absent from the reduce result: ${failed.unknownIds.join(', ')}.`,
        ),
      );
};

/**
 * Stratify every candidate of a completed run into the salvage tiers. Pure: the caller
 * supplies parsed checkpoints, the corroboration report, and the banked opus verdicts.
 * Fails loud (typed error) on a disposition or banked verdict naming an unknown candidate
 * and on a partition that does not conserve the candidate count.
 */
export function computeSalvageTiers(input: {
  readonly candidates: readonly Candidate[];
  readonly validateResults: readonly ValidateSuccess[];
  readonly meta: MetaOutput;
  readonly corroborations: readonly Corroboration[];
  readonly bankedOpusVerdicts: readonly BankedFreetoolEntry[];
}): Result<SalvageTierTable, Error> {
  const candidateById = new Map(input.candidates.map((candidate) => [candidate.id, candidate]));
  const candidateIds = new Set(candidateById.keys());
  const referential = referentialFailure([
    {
      kind: 'Validate dispositions',
      unknownIds: unknownDispositionIds(candidateById, input.validateResults),
    },
    {
      kind: 'Banked opus verdicts',
      unknownIds: unknownBankedCandidateIds(input.bankedOpusVerdicts, candidateIds),
    },
  ]);
  if (!referential.ok) {
    return referential;
  }
  const { keeps, kills, residual } = partitionByDisposition(
    input.candidates,
    input.validateResults,
  );
  const quorumOutcomes = opusQuorumOutcomes(input.bankedOpusVerdicts);
  const quorumKeepIds = new Set(
    [...quorumOutcomes]
      .filter(([, outcome]) => outcome.complete && outcome.keep)
      .map(([candidateId]) => candidateId),
  );
  const { tierA, tierB } = stratifyKeeps({
    keeps,
    corroborations: input.corroborations,
    quorumKeepIds,
  });
  const namedKills = recallNamedKills(
    input.meta,
    candidateIds,
    new Set(kills.map((candidate) => candidate.id)),
  );
  const { tierC, tierD, tierE } = stratifyKills({ kills, quorumKeepIds, namedKills });
  const strata = { tierA, tierB, tierC, tierD, tierE, residual };
  const conserved = verifyConservation(strata, input.candidates.length);
  if (!conserved.ok) {
    return conserved;
  }
  return ok({ ...strata, opusQuorum: quorumSummary(quorumOutcomes, quorumKeepIds) });
}
