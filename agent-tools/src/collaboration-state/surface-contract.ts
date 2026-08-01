import { err, mapErr, type Result } from '@oaknational/result';

import { parseJsonTextResult } from '../core/json.js';
import { type CollaborationSchemaId } from './collaboration-json-validation.js';
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
 * table and the Ok arm IS the parsed product, so the interior cannot
 * discard a parser call — and a parser that stops returning a `Result`
 * fails the table's type in exactly one place, at compile time.
 *
 * Schema-validation trap (still open): the registry parser returns a
 * field-by-field reconstruction that drops unknown fields, so Ajv
 * (`additionalProperties: false`) must ALWAYS validate the raw text's own
 * parse, never this gate's Ok product. The write paths compose the two
 * correctly in `state-io-write-validators.ts`; the structural close (Ajv
 * reachable only through a checked-surface path, including the separate
 * practice-substrate Ajv instance) is its own tracked story.
 */

/**
 * The collaboration surfaces that carry a runtime contract parser
 * (conversations and escalations are schema-only). One tuple, derived from
 * the canonical schema vocabulary: `satisfies` gives the same rename guard
 * as an `Extract`, and the tuple doubles as the runtime membership list for
 * {@link isContractSchemaId} — no duplicate literals for drift to split.
 */
const CONTRACT_SCHEMA_IDS = [
  'active-claims.schema.json',
  'closed-claims.schema.json',
  'comms-event.schema.json',
] as const satisfies readonly CollaborationSchemaId[];

export type ContractSchemaId = (typeof CONTRACT_SCHEMA_IDS)[number];

export function isContractSchemaId(schemaId: CollaborationSchemaId): schemaId is ContractSchemaId {
  const contractIds: readonly CollaborationSchemaId[] = CONTRACT_SCHEMA_IDS;
  return contractIds.includes(schemaId);
}

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
  /** The ORIGINAL parser error, message intact: the state-io write gates
   * rethrow it as itself through the bridge's unwrapOrThrow-over-causeError
   * fold, keeping the smoke-pinned loud messages byte-identical. */
  readonly causeError: Error;

  constructor(input: { readonly path: string; readonly causeError: Error }) {
    super(`${input.path} does not satisfy its surface contract: ${input.causeError.message}`, {
      cause: input.causeError,
    });
    this.name = 'SurfaceContractError';
    this.causeError = input.causeError;
  }
}

export type CollaborationSurfaceFailure = MalformedJsonError | SurfaceContractError;

interface CollaborationSurfaceContracts {
  readonly 'active-claims.schema.json': CollaborationRegistry;
  readonly 'closed-claims.schema.json': ClosedClaimsArchive;
  readonly 'comms-event.schema.json': CommsEvent;
}

// The per-key CONCRETE parser table (the Result retype this seam existed
// to force): a non-Result parser, a missing or unknown key, and every
// wrong-surface pairing fail this table's type here at compile time —
// EXCEPT the registry parser under the closed-claims key, which structural
// typing admits (CollaborationRegistry satisfies ClosedClaimsArchive); the
// per-key unit fixtures catch that one mis-wire at runtime.
type ContractParsers = {
  readonly [K in ContractSchemaId]: (
    text: string,
  ) => Result<CollaborationSurfaceContracts[K], Error>;
};

const CONTRACT_PARSERS: ContractParsers = {
  'active-claims.schema.json': parseCollaborationRegistry,
  'closed-claims.schema.json': parseClosedClaimsArchive,
  'comms-event.schema.json': parseCommsEvent,
};

/**
 * Check one surface's text against its runtime contract. The Ok arm IS the
 * parsed domain product, so the interior cannot compile while discarding a
 * parser call; gate-only consumers test `.ok` and discard it. Value-needing
 * READERS use the state-file readers (and schema validation must NEVER take
 * this product — module doc, trap note).
 */
export function checkCollaborationSurfaceContract<TSchemaId extends ContractSchemaId>(input: {
  readonly schemaId: TSchemaId;
  readonly path: string;
  readonly text: string;
}): Result<CollaborationSurfaceContracts[TSchemaId], CollaborationSurfaceFailure> {
  const json = parseJsonTextResult(input.text, input.path);
  if (!json.ok) {
    return err(new MalformedJsonError({ path: input.path, causeError: json.error }));
  }

  return mapErr(
    CONTRACT_PARSERS[input.schemaId](input.text),
    (causeError) => new SurfaceContractError({ path: input.path, causeError }),
  );
}
