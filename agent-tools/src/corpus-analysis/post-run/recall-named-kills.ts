import type { MetaOutput } from '../recall-schemas.js';

/**
 * Tier-D identification: killed candidates the meta stage's recall judgments identify as
 * baseline-matching (salvage ws1).
 *
 * @remarks
 * Two evidence routes, labelled by source: a `matchedCandidateId` on a recall match
 * (recall-matched — the meta stage's direct judgment) and a candidate-id mention inside a
 * recall note (note-named — the meta agent naming where a missed baseline's substance
 * actually lives). A recall-matched source outranks note-named when both name the same
 * kill. Mentions are intersected with the real candidate-id set before classification, so
 * a phantom id in free text can never mint a tier-D entry.
 */

/**
 * Whole-id candidate mentions in recall notes (word-boundaried, so C18 never bleeds into
 * C185). The `C<digits>` shape is this run's candidate-id convention, which the candidate
 * schema's plain non-empty-string id does not constrain — a future id-format change must
 * revisit this heuristic (a mismatch is a miss, never a corruption: mentions are
 * intersected with the real candidate-id set).
 */
const CANDIDATE_MENTION = /\bC\d+\b/gu;

/** How the recall judgments name one killed candidate, and which baselines name it. */
export interface RecallNamedKill {
  readonly source: 'recall-matched' | 'note-named';
  readonly baselineIds: ReadonlySet<string>;
}

/** Module-internal accumulator; the exported shape is the readonly projection above. */
interface MutableRecallNamedKill {
  source: RecallNamedKill['source'];
  readonly baselineIds: Set<string>;
}

export function recallNamedKills(
  meta: MetaOutput,
  candidateIds: ReadonlySet<string>,
  killIds: ReadonlySet<string>,
): ReadonlyMap<string, RecallNamedKill> {
  const records = new Map<string, MutableRecallNamedKill>();
  const add = (
    candidateId: string,
    source: RecallNamedKill['source'],
    baselineId: string,
  ): void => {
    const existing = records.get(candidateId);
    if (existing === undefined) {
      records.set(candidateId, { source, baselineIds: new Set([baselineId]) });
      return;
    }
    existing.baselineIds.add(baselineId);
    if (source === 'recall-matched') {
      existing.source = 'recall-matched';
    }
  };
  for (const match of meta.recallMatches) {
    if (match.matchedCandidateId !== undefined && killIds.has(match.matchedCandidateId)) {
      add(match.matchedCandidateId, 'recall-matched', match.baselineId);
    }
    for (const mention of match.note.matchAll(CANDIDATE_MENTION)) {
      const mentionedId = mention[0];
      if (
        mentionedId !== match.matchedCandidateId &&
        candidateIds.has(mentionedId) &&
        killIds.has(mentionedId)
      ) {
        add(mentionedId, 'note-named', match.baselineId);
      }
    }
  }
  return records;
}
