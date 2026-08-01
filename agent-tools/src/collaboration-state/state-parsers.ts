import { collect, err, flatMap, map, ok, type Result } from '@oaknational/result';

import { failureAsError } from '../core/failure-as-error.js';
import {
  getJsonValue,
  isJsonObject,
  parseJsonTextResult,
  parseStringArrayResult,
  requireStringResult,
} from '../core/json.js';
import { parseCommitQueueEntry } from './registry-entry-parser.js';
import {
  parseCommsEventValueResult,
  parseDirectedCommsMessageValue,
  parseLifecycleCommsEventValue,
  parseNarrativeCommsEventValue,
} from './state-schemas.js';
import {
  type ClosedClaimsArchive,
  type CollaborationAgentId,
  type CollaborationArea,
  type CollaborationClaim,
  type CollaborationRegistry,
  collaborationAgentIdSchema,
  type CommsEvent,
  type DirectedCommsMessage,
  type LifecycleCommsEvent,
  type NarrativeCommsEvent,
} from './types.js';

/**
 * Parse the active claims registry from JSON text, as a `Result` (ADR-088,
 * story 2b). Mapping is dense (`Array.from`, never `.map`) so a sparse
 * array handed to an interior parser yields an `Err`, never a throw.
 */
export function parseCollaborationRegistry(text: string): Result<CollaborationRegistry, Error> {
  return flatMap(
    parseJsonTextResult(
      text,
      'active-claims registry (--active must point to the active-claims registry JSON, e.g. .agent/state/collaboration/active-claims.json)',
    ),
    parseRegistryValue,
  );
}

function parseRegistryValue(parsed: unknown): Result<CollaborationRegistry, Error> {
  if (!isJsonObject(parsed) || getJsonValue(parsed, 'schema_version') !== '1.3.0') {
    return err(new Error('active claims registry must use schema_version 1.3.0'));
  }
  const claims = getJsonValue(parsed, 'claims');
  const commitQueue = getJsonValue(parsed, 'commit_queue');
  if (!Array.isArray(claims) || !Array.isArray(commitQueue)) {
    return err(new Error('active claims registry must contain claims and commit_queue arrays'));
  }

  return flatMap(collect(Array.from(commitQueue, parseCommitQueueEntry)), (entries) =>
    map(collect(Array.from(claims, parseClaim)), (parsedClaims): CollaborationRegistry => ({
      schema_version: '1.3.0',
      commit_queue: entries,
      claims: parsedClaims,
    })),
  );
}

/** Parse the closed-claims archive from JSON text, as a `Result` (ADR-088). */
export function parseClosedClaimsArchive(text: string): Result<ClosedClaimsArchive, Error> {
  return flatMap(
    parseJsonTextResult(
      text,
      'closed-claims archive (--closed must point to the closed-claims archive JSON)',
    ),
    parseArchiveValue,
  );
}

function parseArchiveValue(parsed: unknown): Result<ClosedClaimsArchive, Error> {
  if (!isJsonObject(parsed) || getJsonValue(parsed, 'schema_version') !== '1.3.0') {
    return err(new Error('closed claims archive must use schema_version 1.3.0'));
  }
  const claims = getJsonValue(parsed, 'claims');
  if (!Array.isArray(claims)) {
    return err(new Error('closed claims archive must contain a claims array'));
  }

  return map(collect(Array.from(claims, parseClaim)), (parsedClaims): ClosedClaimsArchive => ({
    schema_version: '1.3.0',
    claims: parsedClaims,
  }));
}

/**
 * Parse a canonical communication event from JSON text, as a `Result`
 * (ADR-088). On malformed JSON the `Err` carries the RAW `SyntaxError`: the
 * substrate finding classifier (live-types `parseFailureFinding`) narrows on
 * `instanceof SyntaxError` to tell invalid JSON from schema failures.
 */
export function parseCommsEvent(text: string): Result<CommsEvent, Error> {
  return flatMap(parseRawJson(text), (parsed) =>
    isJsonObject(parsed)
      ? parseCommsEventValueResult(parsed)
      : err(new Error('communication event must be a JSON object')),
  );
}

// The ONE library-boundary translate in this module: JSON.parse cannot
// return a Result, and the raw SyntaxError is load-bearing (see the
// parseCommsEvent doc), so no labelling wrapper may replace this.
function parseRawJson(text: string): Result<unknown, Error> {
  try {
    return ok(JSON.parse(text));
  } catch (error) {
    return err(failureAsError(error, 'the comms-event JSON boundary'));
  }
}

/** Parse a narrative communication event from JSON text. */
export function parseNarrativeCommsEvent(text: string): NarrativeCommsEvent {
  const parsed: unknown = JSON.parse(text);
  if (!isJsonObject(parsed)) {
    throw new Error('narrative communication event must be a JSON object');
  }

  return parseNarrativeCommsEventValue(parsed);
}

/** Parse a lifecycle communication event from JSON text. */
export function parseLifecycleCommsEvent(text: string): LifecycleCommsEvent {
  const parsed: unknown = JSON.parse(text);
  if (!isJsonObject(parsed)) {
    throw new Error('lifecycle communication event must be a JSON object');
  }

  return parseLifecycleCommsEventValue(parsed);
}

/** Parse a directed communication message from JSON text. */
export function parseDirectedCommsMessage(text: string): DirectedCommsMessage {
  const parsed: unknown = JSON.parse(text);
  if (!isJsonObject(parsed)) {
    throw new Error('directed communication message must be a JSON object');
  }

  return parseDirectedCommsMessageValue(parsed);
}

// Claims SPREAD the raw record (preservation contract: legacy content owned
// by other writers survives write-back) while intents reconstruct — the
// deliberate asymmetry is documented at `registry-entry-parser.ts`.
function parseClaim(value: unknown): Result<CollaborationClaim, Error> {
  if (!isJsonObject(value)) {
    return err(new Error('claim entries must be objects'));
  }
  const record = value;
  const claimId = requireStringResult(record, 'claim_id');
  if (!claimId.ok) {
    return claimId;
  }
  const agentId = parseAgentId(getJsonValue(record, 'agent_id'));
  if (!agentId.ok) {
    return agentId;
  }
  const thread = requireStringResult(record, 'thread');
  if (!thread.ok) {
    return thread;
  }
  const areas = parseAreas(getJsonValue(record, 'areas'));
  if (!areas.ok) {
    return areas;
  }
  const claimedAt = requireStringResult(record, 'claimed_at');
  if (!claimedAt.ok) {
    return claimedAt;
  }

  return map(requireStringResult(record, 'intent'), (intent) => ({
    ...record,
    claim_id: claimId.value,
    agent_id: agentId.value,
    thread: thread.value,
    areas: areas.value,
    claimed_at: claimedAt.value,
    intent,
  }));
}

function parseAgentId(value: unknown): Result<CollaborationAgentId, Error> {
  // Commandment 12: the schema IS the type. Zod parsing through
  // `collaborationAgentIdSchema` validates the legacy required fields AND
  // the PDR-076a v5 brand on the optional `id` in one boundary check;
  // safeParse keeps the ZodError itself as the Err, byte-identical to the
  // old throwing `.parse`.
  const result = collaborationAgentIdSchema.safeParse(value);
  return result.success ? ok(result.data) : err(result.error);
}

function parseAreas(value: unknown): Result<readonly CollaborationArea[], Error> {
  if (!Array.isArray(value)) {
    return err(new Error('claim areas must be an array'));
  }

  return collect(Array.from(value, parseArea));
}

function parseArea(value: unknown): Result<CollaborationArea, Error> {
  if (!isJsonObject(value)) {
    return err(new Error('claim area must be an object'));
  }

  return flatMap(parseAreaKind(getJsonValue(value, 'kind')), (kind) =>
    map(parseStringArrayResult(getJsonValue(value, 'patterns'), 'patterns'), (patterns) => ({
      kind,
      patterns,
    })),
  );
}

function parseAreaKind(value: unknown): Result<CollaborationArea['kind'], Error> {
  if (
    value === 'files' ||
    value === 'workspace' ||
    value === 'plan' ||
    value === 'adr' ||
    value === 'git'
  ) {
    return ok(value);
  }

  return err(new Error('unsupported claim area kind'));
}
