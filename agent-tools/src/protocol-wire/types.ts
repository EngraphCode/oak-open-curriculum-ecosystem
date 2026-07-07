/**
 * WS0e — the shared wire contract and its version-family validators
 * (PDR-133 clause 6).
 *
 * @remarks
 * The core-carried schema document is the CONTRACT for the cross-estate wire
 * subset; each estate's strict local schemas remain its enforcement surface,
 * and a conformance test binds the two (no second drift surface). Within one
 * MAJOR family evolution is additive-optional only; cross-family contact is
 * a typed refusal, never a best-effort parse.
 */

import { type JsonObject } from '../core/json.js';

export const WIRE_CONTRACT_REL_PATH =
  '.agent/practice-core/schemas/inter-practice-wire.schema.json';

export type WireShapeName =
  | 'wire_identity'
  | 'exchange_comms_event'
  | 'claim_repo_ref'
  | 'watcher_heartbeat'
  | 'watcher_seen_file';

export interface WireContract {
  /** Full semantic version of the contract document, e.g. "1.0.0". */
  readonly version: string;
  /** The MAJOR component — the compatibility family. */
  readonly family: string;
  /** The parsed schema document (annotation keys included). */
  readonly document: JsonObject;
}
