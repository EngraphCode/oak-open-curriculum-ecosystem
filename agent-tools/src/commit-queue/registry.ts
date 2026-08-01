import { readFile } from 'node:fs/promises';

import { collect, err, flatMap, map, ok, unwrapOrThrow, type Result } from '@oaknational/result';

import { parseIntentAgentId } from '../collaboration-state/agent-id.js';
import { validateCollaborationJsonFileText } from '../collaboration-state/collaboration-json-validation.js';
import { isErrnoCode } from '../collaboration-state/errno.js';
import { updateJsonFileWithRetry } from '../collaboration-state/index.js';
import { failureAsError, type ReadTextFile } from '../collaboration-state/state-file-readers.js';
import {
  EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON,
  missingStateFileError,
} from '../collaboration-state/state-file-seeds.js';

import {
  type CommitIntent,
  type CommitQueueClaim,
  type CommitQueueRegistry,
  type JsonObject,
  isCommitQueuePhase,
} from './types.js';
import { parseJsonTextResult, requireStringResult } from '../core/json.js';
import { requireIsoDateTimeResult } from '../core/iso-date-time.js';

const readTextFileFromDisk: ReadTextFile = (path) => readFile(path, 'utf8');

/**
 * Read and minimally validate the active-claims registry for queue writes.
 * IO, JSON-syntax, and contract failures all arrive on the `Err` arm
 * (ADR-088). IO failures mirror the owner-ruled state-file readers
 * (rulings 2026-07-20): ENOENT enriches into verify-then-seed instructions,
 * any other `Error` flows out as ITSELF, a non-Error throwable crashes at
 * detection. Injectable read seam per ADR-078.
 */
export async function readRegistry(
  registryPath: string,
  readTextFile: ReadTextFile = readTextFileFromDisk,
): Promise<Result<CommitQueueRegistry, Error>> {
  let content: string;
  try {
    content = await readTextFile(registryPath);
  } catch (error) {
    // Crash-at-detection first: non-Error throwables never enter the Err channel.
    const failure = failureAsError(error);
    return err(
      isErrnoCode(failure, 'ENOENT')
        ? missingStateFileError({
            label: 'active-claims registry',
            path: registryPath,
            seedJson: EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON,
            cause: failure,
          })
        : failure,
    );
  }

  return parseRegistryText(content, registryPath);
}

/**
 * Transactionally update the active-claims registry for queue writes.
 * The transaction seam folds the parse `Result` with `unwrapOrThrow` — the
 * sanctioned identity-preserving edge. It must never fold with a
 * default-substituting unwrap: the transform would run over a substituted
 * empty registry and write it back, silently destroying every claim and
 * intent (the corrupt-registry smoke proof pins this).
 */
export async function updateRegistry(
  registryPath: string,
  transform: (registry: CommitQueueRegistry) => CommitQueueRegistry,
): Promise<void> {
  // Pre-transaction read: the fresh-checkout seed error, not a bare ENOENT (as state-io.ts).
  unwrapOrThrow(await readRegistry(registryPath));
  await updateJsonFileWithRetry({
    filePath: registryPath,
    parseText: (text) => unwrapOrThrow(parseRegistryText(text, registryPath)),
    validateText: (text) => validateCollaborationJsonFileText(registryPath, text),
    transform,
    maxAttempts: 5,
  });
}

/**
 * Parse registry JSON text: syntax failures are labelled with the registry
 * path (a raw position-only `SyntaxError` names no surface), then the
 * parsed value flows through {@link parseRegistry}.
 */
export function parseRegistryText(
  text: string,
  registryPath: string,
): Result<CommitQueueRegistry, Error> {
  return flatMap(parseJsonTextResult(text, registryPath), (value) =>
    parseRegistry(value, registryPath),
  );
}

/**
 * Pure structural validation of an already-parsed registry value. Exported
 * so every error literal below is unit-describable over plain values —
 * `readRegistry` stays the thin IO wrapper.
 */
export function parseRegistry(
  value: unknown,
  registryPath: string,
): Result<CommitQueueRegistry, Error> {
  if (!isRecord(value)) {
    return err(new TypeError(`${registryPath} must contain a JSON object`));
  }
  // Load-bearing: narrowing does not survive into closures (all `const record = value` sites).
  const record = value;
  if (record.schema_version !== '1.3.0') {
    return err(
      new Error(`${registryPath} must use schema_version 1.3.0 before commit queue writes`),
    );
  }
  if (!Array.isArray(record.commit_queue)) {
    return err(new TypeError(`${registryPath} must contain a top-level commit_queue array`));
  }
  const rawIntents = record.commit_queue;
  if (!Array.isArray(record.claims)) {
    return err(new TypeError(`${registryPath} must contain a top-level claims array`));
  }
  const rawClaims = record.claims;

  // Array.from, not .map: map preserves sparse holes, and a hole reaching
  // collect would throw on `.ok` — the dense mapping keeps this parser total.
  return flatMap(collect(Array.from(rawIntents, parseIntent)), (commitQueue) =>
    map(collect(Array.from(rawClaims, parseClaim)), (claims) => ({
      ...record,
      schema_version: '1.3.0',
      commit_queue: commitQueue,
      claims,
    })),
  );
}

function parseIntent(value: unknown): Result<CommitIntent, Error> {
  if (!isRecord(value) || !isCommitQueuePhase(value.phase)) {
    return err(new Error('commit_queue entries must be complete intent objects'));
  }
  const record = value;
  const phase = value.phase;
  const intentId = requireStringResult(record, 'intent_id');
  if (!intentId.ok) {
    return intentId;
  }
  if (!isStringArray(record.files)) {
    return err(new Error(`commit_queue entry ${intentId.value} must contain a files array`));
  }
  const files = record.files;

  return flatMap(parseIntentRequiredStrings(record), (fields) =>
    map(parseIntentAgentId(record.agent_id, intentId.value), (agentId) => ({
      ...record,
      intent_id: intentId.value,
      claim_id: fields.claim_id,
      agent_id: agentId,
      files,
      commit_subject: fields.commit_subject,
      queued_at: fields.queued_at,
      updated_at: fields.updated_at,
      expires_at: fields.expires_at,
      phase,
    })),
  );
}

function parseIntentRequiredStrings(record: JsonObject): Result<
  {
    readonly claim_id: string;
    readonly commit_subject: string;
    readonly queued_at: string;
    readonly updated_at: string;
    readonly expires_at: string;
  },
  Error
> {
  const claimId = requireStringResult(record, 'claim_id');
  if (!claimId.ok) {
    return claimId;
  }
  const commitSubject = requireStringResult(record, 'commit_subject');
  if (!commitSubject.ok) {
    return commitSubject;
  }
  const queuedAt = requireIsoStringField(record, 'queued_at');
  if (!queuedAt.ok) {
    return queuedAt;
  }
  const updatedAt = requireIsoStringField(record, 'updated_at');
  if (!updatedAt.ok) {
    return updatedAt;
  }
  const expiresAt = requireIsoStringField(record, 'expires_at');
  if (!expiresAt.ok) {
    return expiresAt;
  }

  return ok({
    claim_id: claimId.value,
    commit_subject: commitSubject.value,
    queued_at: queuedAt.value,
    updated_at: updatedAt.value,
    expires_at: expiresAt.value,
  });
}

/**
 * Claims are PRESERVED as written (the registry's compatibility contract:
 * unrecognised and legacy content survives write-back byte-identical).
 * An id-less legacy `agent_id` is legal here — ownership checks narrow
 * through the canonical comparator, which never matches an id-less row.
 */
function parseClaim(value: unknown): Result<CommitQueueClaim, Error> {
  if (!isRecord(value)) {
    return err(new Error('claims entries must be objects'));
  }
  const record = value;

  return map(requireStringResult(record, 'claim_id'), (claimId) => ({
    ...record,
    claim_id: claimId,
  }));
}

function requireIsoStringField(record: JsonObject, key: string): Result<string, Error> {
  return flatMap(requireStringResult(record, key), (value) => requireIsoDateTimeResult(value, key));
}

function isRecord(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is readonly string[] {
  // Dense check: a bare every() skips sparse holes and would admit a value
  // typed readonly string[] whose holes read as undefined.
  return Array.isArray(value) && Array.from(value).every((entry) => typeof entry === 'string');
}
