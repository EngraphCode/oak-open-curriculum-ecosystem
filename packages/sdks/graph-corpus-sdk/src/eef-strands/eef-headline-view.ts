/**
 * The bounded headline view over the EEF evidence bindings.
 *
 * `evidenceForMoveHeadlines` runs the same axis/explicit query as
 * {@link evidenceForMove} but projects each member to its
 * {@link EefStrandHeadline} (identity, the impact-for-cost headline metrics,
 * tags, and the EEF page), leaving `answerType`, `edges`, `frontier`, and
 * `provenance` unchanged. It is a separate view-layer concern over the core
 * bindings (ADR-155): the agent scans the headline list and drills a chosen
 * strand with `inspectStrand` for its full evidence — a payload bounded by
 * member depth, not by dropping the graph structure.
 */

import {
  evidenceForMove,
  type EefEvidenceEnvelope,
  type EvidenceForMoveSelectors,
} from './eef-evidence.js';
import type { EefStrand } from './strand-lookup.js';

/**
 * The headline projection of a strand — identity, the impact-for-cost headline
 * metrics, tags, and the EEF page — for the bounded `evidenceForMoveHeadlines`
 * list view. A `Pick` over {@link EefStrand}, so it tracks the corpus shape and
 * cannot drift; the deep evidence fields (key findings, effectiveness,
 * implementation, …) are omitted and reached by drilling with `inspectStrand`.
 */
export type EefStrandHeadline = Pick<
  EefStrand,
  'id' | 'name' | 'slug' | 'eef_url' | 'headline' | 'tags'
>;

/** Project one strand to its {@link EefStrandHeadline} — a `Pick`, no fabrication. */
function toHeadline(strand: EefStrand): EefStrandHeadline {
  const { id, name, slug, eef_url, headline, tags } = strand;
  return { id, name, slug, eef_url, headline, tags };
}

/**
 * The bounded headline view of {@link evidenceForMove}: the same axis/explicit
 * query, with each member projected to {@link EefStrandHeadline}. `answerType`,
 * `edges`, `frontier`, and `provenance` are identical to the full envelope —
 * only the member depth differs.
 */
export function evidenceForMoveHeadlines(
  selectors: EvidenceForMoveSelectors,
): EefEvidenceEnvelope<EefStrandHeadline> {
  const full = evidenceForMove(selectors);
  return { ...full, members: full.members.map(toHeadline) };
}
