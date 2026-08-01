import { err, mapErr, ok, unwrapOrThrow, type Result } from '@oaknational/result';

import { parseJsonTextResult } from '../core/json.js';
import { type CollaborationSchemaId } from './collaboration-json-validation.js';
import { failureAsError } from './state-file-readers.js';
import {
  parseClosedClaimsArchive,
  parseCollaborationRegistry,
  parseCommsEvent,
} from './state-parsers.js';
import { type ClosedClaimsArchive, type CollaborationRegistry, type CommsEvent } from './types.js';

/**
 * The ONE collaboration-state-owned surface-contract gate (ADR-088).
 *
 * This module replaces the compiler-silent `(text: string) => unknown`
 * validator seams (state-integrity, practice-substrate live-json) and the
 * bare-expression parse gates (state-io write paths): those shapes accepted
 * a Result-returning parser SILENTLY and stopped detecting contract
 * failures. Here every parser sits in a per-key CONCRETELY-typed dispatch
 * table and the Ok arm carries the parsed products, so the interior cannot
 * discard a parser call — story 2b's Result conversion fails this table's
 * type at compile time, in exactly one place, loudly.
 */

/**
 * The collaboration surfaces that carry a runtime contract parser
 * (conversations and escalations are schema-only). `Extract` welds this to
 * the real schema filenames: a renamed schema file collapses the type to
 * `never` and breaks every call site instead of silently dropping a surface.
 */
export type ContractSchemaId = Extract<
  CollaborationSchemaId,
  'active-claims.schema.json' | 'closed-claims.schema.json' | 'comms-event.schema.json'
>;

/** JSON text that is not JSON at all. */
export class MalformedJsonError extends Error {
  readonly kind = 'malformed-json';
  /** The path-labelled JSON error, typed (Error.cause is unknown). */
  readonly causeError: Error;

  constructor(input: { readonly path: string; readonly causeError: Error }) {
    super(`${input.path} is not valid JSON`, { cause: input.causeError });
    this.name = 'MalformedJsonError';
    this.causeError = input.causeError;
  }
}

/** Valid JSON that violates the surface's own contract. */
export class SurfaceContractError extends Error {
  readonly kind = 'contract-failure';
  /** The parser's message verbatim — consumers preserving bytes read this. */
  readonly reason: string;
  /** The ORIGINAL parser error: the state-io write gates rethrow it as
   * itself via `unwrapOrThrow(mapErr(result, (f) => f.causeError))`, keeping
   * the smoke-pinned loud messages byte-identical. */
  readonly causeError: Error;

  constructor(input: { readonly path: string; readonly causeError: Error }) {
    super(`${input.path} does not satisfy its surface contract: ${input.causeError.message}`, {
      cause: input.causeError,
    });
    this.name = 'SurfaceContractError';
    this.reason = input.causeError.message;
    this.causeError = input.causeError;
  }
}

export type CollaborationSurfaceFailure = MalformedJsonError | SurfaceContractError;

interface CollaborationSurfaceContracts {
  readonly 'active-claims.schema.json': CollaborationRegistry;
  readonly 'closed-claims.schema.json': ClosedClaimsArchive;
  readonly 'comms-event.schema.json': CommsEvent;
}

/**
 * Both products of a passed check. `json` is the RAW parsed JSON value and
 * is the only value that may be schema-validated: the registry parser
 * returns a field-by-field reconstruction that drops unknown fields, and
 * Ajv (additionalProperties: false) run against the reconstruction would
 * PASS files it must reject. `value` is the contract-parsed domain object.
 */
export interface CheckedSurface<T> {
  readonly json: unknown;
  readonly value: T;
}

// The ONE translate boundary over the still-throwing parsers. Story 2b
// retypes this mapped value type to
//   (text: string) => Result<CollaborationSurfaceContracts[K], Error>
// and deletes the try/catch in the check below; until then, a parser
// converted to return a Result fails this table's type — the compile-time
// forcing the deleted injection seams could not provide.
type ContractParsers = {
  readonly [K in ContractSchemaId]: (text: string) => CollaborationSurfaceContracts[K];
};

const CONTRACT_PARSERS: ContractParsers = {
  'active-claims.schema.json': parseCollaborationRegistry,
  'closed-claims.schema.json': parseClosedClaimsArchive,
  'comms-event.schema.json': parseCommsEvent,
};

/**
 * Check one surface's text against its runtime contract. Value-needing
 * READERS use the state-file readers; gate-only consumers test `.ok` and
 * may discard the products — the value-carrying Ok arm exists so the
 * INTERIOR cannot compile while discarding a parser call.
 */
export function checkCollaborationSurfaceContract<TSchemaId extends ContractSchemaId>(input: {
  readonly schemaId: TSchemaId;
  readonly path: string;
  readonly text: string;
}): Result<CheckedSurface<CollaborationSurfaceContracts[TSchemaId]>, CollaborationSurfaceFailure> {
  const json = parseJsonTextResult(input.text, input.path);
  if (!json.ok) {
    return err(new MalformedJsonError({ path: input.path, causeError: json.error }));
  }
  try {
    return ok({ json: json.value, value: CONTRACT_PARSERS[input.schemaId](input.text) });
  } catch (error) {
    return err(new SurfaceContractError({ path: input.path, causeError: failureAsError(error) }));
  }
}

/**
 * Pre-2c bridge for `Promise<void>` validateText contexts (the state-io
 * write gates): folds the check with `unwrapOrThrow` over the ORIGINAL
 * parser error (typed `causeError`), keeping the smoke-pinned loud messages
 * byte-identical through the transaction layer. Story 2c retypes those
 * validators to `Promise<Result<void, Error>>`, replaces each call with
 * `return checkCollaborationSurfaceContract(...)`, and DELETES this bridge.
 */
export function requireCollaborationSurfaceContract(input: {
  readonly schemaId: ContractSchemaId;
  readonly path: string;
  readonly text: string;
}): void {
  unwrapOrThrow(mapErr(checkCollaborationSurfaceContract(input), (failure) => failure.causeError));
}
