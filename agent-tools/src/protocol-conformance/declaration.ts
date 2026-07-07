import { z } from 'zod';

import { err, ok, type Result } from '@oaknational/result';
import { type ConformanceIo, type ProtocolDeclaration } from './types.js';

/**
 * The core-carried canonical path where an estate declares the protocol
 * version it speaks, its tier floor, and its version-advertised extensions
 * (PDR-125 §Conformance; the join ceremony negotiates against this).
 */
export const PROTOCOL_DECLARATION_REL_PATH = '.agent/practice-core/protocol.json';

/**
 * The declaration schema family this reader speaks. Cross-family contact is
 * a typed refusal (PDR-125 clause 6), never a best-effort parse.
 */
const DECLARATION_SCHEMA_FAMILY = '1';

const declarationSchema = z
  .object({
    schema_version: z.string().min(1),
    protocol_version: z.string().min(1),
    tier_floor: z.union([z.literal('tier-0'), z.literal('tier-1')]),
    extensions: z.array(z.string().min(1)),
  })
  .strict();

export function loadProtocolDeclaration(io: ConformanceIo): Result<ProtocolDeclaration, string> {
  const raw = io.readTextFile(PROTOCOL_DECLARATION_REL_PATH);
  if (raw === undefined) {
    return err(
      `protocol declaration missing: ${PROTOCOL_DECLARATION_REL_PATH} — declare the protocol this estate speaks ({ schema_version, protocol_version, tier_floor, extensions })`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return err(
      `protocol declaration unreadable (${PROTOCOL_DECLARATION_REL_PATH}): ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const validated = declarationSchema.safeParse(parsed);
  if (!validated.success) {
    return err(
      `protocol declaration invalid (${PROTOCOL_DECLARATION_REL_PATH}): ${validated.error.issues
        .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
        .join('; ')}`,
    );
  }

  const family = validated.data.schema_version.split('.')[0];
  if (family !== DECLARATION_SCHEMA_FAMILY) {
    return err(
      `protocol declaration schema_version ${validated.data.schema_version} is outside this reader's family ${DECLARATION_SCHEMA_FAMILY}.x — cross-family contact is a typed refusal; upgrade the reader or the declaration deliberately`,
    );
  }

  return ok(validated.data);
}
