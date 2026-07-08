import { err, ok, type Result } from '@oaknational/result';

import { isJsonObject } from '../core/json.js';
import { WIRE_CONTRACT_REL_PATH, type WireContract } from './types.js';

/**
 * Parse and validate a wire-contract document. The document must declare its
 * own full version (the MAJOR component is the compatibility family) and
 * carry the `$defs` shape set.
 */
export function loadWireContractText(raw: string): Result<WireContract, string> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return err(
      `wire contract unreadable (${WIRE_CONTRACT_REL_PATH}): ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (!isJsonObject(parsed)) {
    return err(`wire contract unreadable (${WIRE_CONTRACT_REL_PATH}): root is not a JSON object`);
  }
  const version = parsed['version'];
  if (typeof version !== 'string' || version.length === 0) {
    return err(
      `wire contract declares no version (${WIRE_CONTRACT_REL_PATH}) — the family contract needs it`,
    );
  }
  if (!isJsonObject(parsed['$defs'])) {
    return err(`wire contract carries no $defs shape set (${WIRE_CONTRACT_REL_PATH})`);
  }
  const family = numericFamily(version);
  if (family === undefined) {
    return err(
      `wire contract version ${version} has no numeric MAJOR component — the family contract is MAJOR-numeric (PDR-125 clause 6)`,
    );
  }
  return ok({ version, family, document: parsed });
}

/**
 * The family is the numeric MAJOR component, normalised ("01" → "1"). A
 * non-numeric MAJOR is malformed, distinct from a cross-family mismatch.
 */
function numericFamily(version: string): string | undefined {
  const major = version.split('.')[0] ?? '';
  if (!/^\d+$/.test(major)) {
    return undefined;
  }
  return String(Number(major));
}

/**
 * The join-ceremony version negotiation (PDR-125 clause 6): same MAJOR
 * family → agree and proceed; different families → a typed refusal naming
 * both versions, never a best-effort parse.
 */
export function negotiateWireFamily(
  localVersion: string,
  peerVersion: string,
): Result<string, string> {
  const localFamily = numericFamily(localVersion);
  const peerFamily = numericFamily(peerVersion);
  if (localFamily === undefined || peerFamily === undefined) {
    return err(
      `wire family negotiation received a versionless or malformed value (local "${localVersion}", peer "${peerVersion}") — versions carry a numeric MAJOR`,
    );
  }
  if (localFamily !== peerFamily) {
    return err(
      `cross-family wire contact refused: local contract ${localVersion} (family ${localFamily}) cannot exchange with peer contract ${peerVersion} (family ${peerFamily}) — a breaking wire change is a new family; upgrade deliberately, never best-effort parse`,
    );
  }
  return ok(localFamily);
}
