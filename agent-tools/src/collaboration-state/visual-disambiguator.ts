import { type CollaborationAgentId } from './types.js';

/**
 * The MCP-145 visual-disambiguator display token:
 * `<session_id_prefix>-<last 3 of the UUIDv5 id>`. A pure render-time
 * derivation of two fields every derived identity block carries — never
 * persisted, never a join or lookup key (PDR-027 field-role doctrine; the
 * PDR-125 cross-estate join key remains the prefix, unchanged).
 *
 * The prefix is used verbatim — no casing or hyphen normalisation — so the
 * token is neither fixed-width nor hyphen-parseable. The id is likewise used
 * verbatim: stored ids are the canonical lowercase UUIDv5 string, and a block
 * parsed from external JSON may carry uppercase hex, rendered as-is. A block
 * with no `id` (legacy rows, migration output, relay blocks that omitted it)
 * returns undefined: the id-less case is the derivation's honest domain, not
 * an error, so no Result type applies and the renderer shows the bare prefix.
 */
export function visualDisambiguator(
  agentId: Pick<CollaborationAgentId, 'session_id_prefix' | 'id'>,
): string | undefined {
  if (agentId.id === undefined) {
    return undefined;
  }
  return `${agentId.session_id_prefix}-${agentId.id.slice(-3)}`;
}
