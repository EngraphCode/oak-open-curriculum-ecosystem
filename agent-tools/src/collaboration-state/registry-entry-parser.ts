import { err, flatMap, map, ok, type Result } from '@oaknational/result';

import {
  getJsonValue,
  isJsonObject,
  parseStringArrayResult,
  requireStringResult,
  type JsonObject,
} from '../core/json.js';
import { parseIntentAgentId } from './agent-id.js';
import { type CollaborationCommitQueueEntry } from './types.js';

/**
 * The commit-queue entry half of the registry parser (story 2b split for
 * module cohesion; `state-parsers.ts` owns the text-level surfaces).
 *
 * Intents RECONSTRUCT field-by-field (the schema's intent_to_commit sets
 * additionalProperties: false, and intents are short-lived rows every live
 * writer fully specifies) while claims SPREAD (preservation contract:
 * legacy content owned by other writers survives write-back). The asymmetry
 * is deliberate — do not "fix" it by spreading intents. Reconstruction is
 * non-destructive ONLY because parseCollaborationRegistry hard-rejects any
 * schema_version other than 1.3.0: a newer-minor file (whose unrecognised
 * fields the runtime contract says to preserve) is refused outright, never
 * silently stripped. Relaxing that version pin without revisiting this
 * reconstruction turns this path silently destructive.
 */
export function parseCommitQueueEntry(
  value: unknown,
): Result<CollaborationCommitQueueEntry, Error> {
  if (!isJsonObject(value)) {
    return err(new Error('commit_queue entries must be objects'));
  }
  const record = value;

  return flatMap(parseEntryIdentity(record), (identity) =>
    flatMap(parseEntryStrings(record), (strings) =>
      map(parseCommitQueuePhase(getJsonValue(record, 'phase')), (phase) =>
        assembleEntry(record, identity, strings, phase),
      ),
    ),
  );
}

interface EntryIdentity {
  readonly intentId: string;
  readonly claimId: string;
  readonly agentId: CollaborationCommitQueueEntry['agent_id'];
  readonly files: readonly string[];
}

// Failure precedence preserved from the throwing parser: intent_id,
// claim_id, agent_id, files — then the remaining strings, then phase.
function parseEntryIdentity(record: JsonObject): Result<EntryIdentity, Error> {
  const intentId = requireStringResult(record, 'intent_id');
  if (!intentId.ok) {
    return intentId;
  }
  const claimId = requireStringResult(record, 'claim_id');
  if (!claimId.ok) {
    return claimId;
  }
  const agentId = parseIntentAgentId(getJsonValue(record, 'agent_id'), intentId.value);
  if (!agentId.ok) {
    return agentId;
  }

  return map(parseStringArrayResult(getJsonValue(record, 'files'), 'files'), (files) => ({
    intentId: intentId.value,
    claimId: claimId.value,
    agentId: agentId.value,
    files,
  }));
}

interface EntryStrings {
  readonly commitSubject: string;
  readonly queuedAt: string;
  readonly updatedAt: string;
  readonly expiresAt: string;
}

function parseEntryStrings(record: JsonObject): Result<EntryStrings, Error> {
  const commitSubject = requireStringResult(record, 'commit_subject');
  if (!commitSubject.ok) {
    return commitSubject;
  }
  const queuedAt = requireStringResult(record, 'queued_at');
  if (!queuedAt.ok) {
    return queuedAt;
  }
  const updatedAt = requireStringResult(record, 'updated_at');
  if (!updatedAt.ok) {
    return updatedAt;
  }

  return map(requireStringResult(record, 'expires_at'), (expiresAt) => ({
    commitSubject: commitSubject.value,
    queuedAt: queuedAt.value,
    updatedAt: updatedAt.value,
    expiresAt,
  }));
}

function assembleEntry(
  record: JsonObject,
  identity: EntryIdentity,
  strings: EntryStrings,
  phase: CollaborationCommitQueueEntry['phase'],
): CollaborationCommitQueueEntry {
  const stagedBundleFingerprint = getJsonValue(record, 'staged_bundle_fingerprint');
  const stagedNameStatus = getJsonValue(record, 'staged_name_status');
  const notes = getJsonValue(record, 'notes');

  return {
    intent_id: identity.intentId,
    claim_id: identity.claimId,
    agent_id: identity.agentId,
    files: identity.files,
    commit_subject: strings.commitSubject,
    queued_at: strings.queuedAt,
    updated_at: strings.updatedAt,
    expires_at: strings.expiresAt,
    phase,
    ...(typeof stagedBundleFingerprint === 'string'
      ? { staged_bundle_fingerprint: stagedBundleFingerprint }
      : {}),
    ...(typeof stagedNameStatus === 'string' ? { staged_name_status: stagedNameStatus } : {}),
    ...(typeof notes === 'string' ? { notes } : {}),
  };
}

function parseCommitQueuePhase(
  value: unknown,
): Result<CollaborationCommitQueueEntry['phase'], Error> {
  if (
    value === 'queued' ||
    value === 'staging' ||
    value === 'pre_commit' ||
    value === 'abandoned'
  ) {
    return ok(value);
  }

  return err(new Error('unsupported commit queue phase'));
}
