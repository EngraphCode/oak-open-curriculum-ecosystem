import { type CollaborationAgentId } from './types.js';

/**
 * Parsed identity row from the operational thread record.
 */
interface ThreadRecordIdentityRow {
  readonly label: 'Last refreshed' | 'Prior refresh';
  readonly agentId: CollaborationAgentId;
}

/**
 * Parse PDR-027 identity rows from a thread next-session record.
 *
 * @param text - Markdown thread record text.
 * @returns Identity rows from `Last refreshed` and `Prior refresh` entries.
 */
export function findThreadRecordIdentityRows(text: string): readonly ThreadRecordIdentityRow[] {
  const normalised = text.replaceAll(/\s+/gu, ' ');
  const pattern =
    /\*\*(Last refreshed|Prior refresh)\*\*:[^(]*\(([^/()]+) \/ ([^/()]+) \/ ([^/()]+) \/ ([A-Za-z0-9_-]{1,24})(?=\s*[—)])/gu;

  return Array.from(normalised.matchAll(pattern), (match) => ({
    label: parseThreadRecordLabel(match[1]),
    agentId: {
      agent_name: match[2].trim(),
      platform: match[3].trim(),
      model: match[4].trim(),
      session_id_prefix: match[5].trim(),
    },
  }));
}

function parseThreadRecordLabel(value: string): 'Last refreshed' | 'Prior refresh' {
  return value === 'Last refreshed' ? 'Last refreshed' : 'Prior refresh';
}
