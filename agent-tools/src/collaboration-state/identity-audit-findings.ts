/**
 * Shared finding shapes and the anonymous-Codex discriminator for the
 * identity audit's per-source legs (registry/archive/thread legs in
 * `identity-audit.ts`, comms leg in `identity-audit-comms.ts`).
 *
 * @packageDocumentation
 */
import { type CollaborationAgentId } from './types.js';

/**
 * Classification applied to anonymous Codex identity records.
 */
export type CodexIdentityAuditClassification =
  'live-risk' | 'historical-no-repair' | 'needs-evidence';

/**
 * Source family for a Codex identity audit finding.
 */
type CodexIdentityAuditSource = 'active' | 'closed' | 'thread-record' | 'comms-event';

/**
 * One report-only finding for an anonymous Codex identity record.
 */
export interface CodexIdentityAuditFinding {
  readonly source: CodexIdentityAuditSource;
  readonly record_ref: string;
  readonly classification: CodexIdentityAuditClassification;
  readonly agent_id: CollaborationAgentId;
  readonly reason: string;
}

/**
 * Discriminate anonymous Codex identity blocks. The primary discriminator is
 * `session_id_prefix` per WS1 / PDR-027; `agent_name` remains a secondary
 * fallback for legacy anonymous Codex writes that carry `Codex` as the
 * display name with no prefix yet derived.
 */
export function isAnonymousCodexAgent(agentId: CollaborationAgentId): boolean {
  return (
    agentId.platform === 'codex' &&
    (agentId.session_id_prefix === 'unknown' || agentId.agent_name === 'Codex')
  );
}
