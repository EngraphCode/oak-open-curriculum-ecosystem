import type { Candidate } from '../judgment-schemas.js';
import { terminalResolutions } from './triage.js';
import type { ValidateSuccess } from './triage.js';

/**
 * Disposition partitioning over resumed validate results (salvage ws1).
 *
 * @remarks
 * Splits a run's candidates by their genuinely-last terminal disposition (the triage
 * module's supersession semantics, reused not re-derived). Candidates whose disposition
 * is non-terminal — rerouted, held, or never disposed — land in an explicit residual,
 * never a silent drop: the salvage report's whole point is conservation.
 */

/** A candidate outside the keep/kill strata, conserved explicitly. */
export interface ResidualEntry {
  readonly candidateId: string;
  readonly pattern: string;
  readonly state: 'reroute' | 'held-or-undisposed';
}

export interface DispositionPartition {
  readonly keeps: readonly Candidate[];
  readonly kills: readonly Candidate[];
  readonly residual: readonly ResidualEntry[];
}

/** Disposition ids that name no reduce candidate — a checkpoint mismatch to fail loud on. */
export function unknownDispositionIds(
  candidateById: ReadonlyMap<string, Candidate>,
  validateResults: readonly ValidateSuccess[],
): readonly string[] {
  const unknown = validateResults
    .flatMap((result) => result.dispositions)
    .map((entry) => entry.candidateId)
    .filter((candidateId) => !candidateById.has(candidateId));
  return [...new Set(unknown)];
}

/** Split candidates by last terminal disposition; non-terminal states go to the residual. */
export function partitionByDisposition(
  candidates: readonly Candidate[],
  validateResults: readonly ValidateSuccess[],
): DispositionPartition {
  const resolutions = terminalResolutions(validateResults);
  const keeps: Candidate[] = [];
  const kills: Candidate[] = [];
  const residual: ResidualEntry[] = [];
  for (const candidate of candidates) {
    const resolution = resolutions.get(candidate.id);
    if (resolution === undefined) {
      residual.push({
        candidateId: candidate.id,
        pattern: candidate.pattern,
        state: 'held-or-undisposed',
      });
      continue;
    }
    switch (resolution.disposition) {
      case 'keep':
        keeps.push(candidate);
        break;
      case 'kill':
        kills.push(candidate);
        break;
      case 'reroute':
        residual.push({ candidateId: candidate.id, pattern: candidate.pattern, state: 'reroute' });
        break;
    }
  }
  return { keeps, kills, residual };
}
