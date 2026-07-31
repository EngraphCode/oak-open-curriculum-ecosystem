import { z } from 'zod';

import { NAMING_SCHEMA_VERSION_VALUES } from '../core/agent-identity/schema-registry.js';

/**
 * Branded UUID v5 schema for the agent identity `id` field (PDR-076a §Cascade
 * item 3). The schema validates standard UUID format and refines on the
 * version nibble at position 14 = `5`, which v5 sets per RFC 4122. The brand
 * marker `'UuidV5'` carries the derivation intent at the type level so a
 * routing comparator receiving `agent_id.id` cannot accidentally accept a
 * plain string at compile time.
 *
 * The derivation function (`deriveCollaborationIdentity`) produces values
 * that satisfy this schema; the schema is the boundary check at every
 * untrusted-input parse site.
 */
export const uuidV5Schema = z
  .uuid()
  .refine((value) => value.charAt(14) === '5', {
    message: 'expected UUID v5 (version nibble at position 14 must be 5)',
  })
  .brand<'UuidV5'>();

export type UuidV5 = z.infer<typeof uuidV5Schema>;

/**
 * Name-provenance values accepted on the identity tuple: a registered
 * naming-schema era or the operator-override marker. The closed list lives
 * in the agent-identity schema registry; unregistered version ids are
 * rejected at this parse boundary.
 */
const namingSchemaVersionSchema = z.enum(NAMING_SCHEMA_VERSION_VALUES);

/**
 * Name-provenance value carried by the identity tuple.
 */
export type NamingSchemaVersion = z.infer<typeof namingSchemaVersionSchema>;

/**
 * Canonical read-side Zod schema for an agent identity tuple
 * (PDR-027 as amended 2026-05-26). The type `CollaborationAgentId` is
 * `z.infer<typeof collaborationAgentIdSchema>` per schema-first
 * Commandment 12 — the schema IS the type, statically embedded.
 *
 * All four identity string fields (`agent_name`, `platform`, `model`,
 * `session_id_prefix`) are non-empty (`.min(1)`), matching the canonical JSON
 * schema (`comms-event.schema.json` `minLength: 1`). An empty component is a
 * meaningless identity and is rejected at the parse boundary — do not relax
 * these to bare `z.string()`.
 *
 * `id` is OPTIONAL on the read side for the two legacy populations that
 * must stay readable: pre-sunset CLAIM rows (legal registry content,
 * preserved on write-back, narrowed at the routing boundary — see
 * `routingKeyFor` in `active-agent-routing.ts`, where an id-less identity
 * is never the same live agent) and historical COMMS-EVENT identities
 * (`state-schemas.ts` binds this schema for author/from/to; legacy events
 * on disk lack ids, and replying to one through the id-keyed write path
 * correctly throws — see `replyToDirectedCommsMessage`). Do NOT require
 * `id` on this generic read schema. The one strict exception is
 * commit-queue INTENT rows, which require `id` AT PARSE in both registry
 * read paths (see {@link parseIntentAgentId}); the write-side schema
 * `collaborationAgentIdWriteSchema` requires `id` so write factories
 * cannot accidentally emit legacy shape.
 *
 * Any caller that needs to parse an identity from untrusted input (JSON, env,
 * external source) MUST use this schema rather than hand-crafting a
 * structural-typing equivalent.
 */
export const collaborationAgentIdSchema = z
  .object({
    agent_name: z.string().min(1),
    platform: z.string().min(1),
    model: z.string().min(1),
    session_id_prefix: z.string().min(1),
    id: uuidV5Schema.optional(),
    /**
     * Optional everywhere: rows written before the field existed are the v1
     * era by definition, and address-relay writes (a recipient block built
     * from `--to-*` flags, a commit-queue intent relaying caller identity)
     * cannot know another agent's name provenance and must not fabricate
     * it. The identity derivation factories — the only sites where
     * provenance is known — always populate it (test-enforced). A
     * materialised default would also inject the field into immutable
     * historical events on any parse-and-rewrite cycle. Resolve through
     * {@link namingSchemaVersionOf}; never read the raw field for era logic.
     */
    naming_schema_version: namingSchemaVersionSchema.optional(),
  })
  .strict();

export type CollaborationAgentId = Readonly<z.infer<typeof collaborationAgentIdSchema>>;

/**
 * Resolve the naming-schema version of an identity row. Rows written before
 * the field existed carry no value and are the v1 era by definition (no
 * backfill). Address-relay rows (recipient blocks, relayed caller identity)
 * may also omit the field; resolving them as v1 is the documented
 * legacy-or-unknown reading.
 */
export function namingSchemaVersionOf(
  agentId: Pick<CollaborationAgentId, 'naming_schema_version'>,
): NamingSchemaVersion {
  return agentId.naming_schema_version ?? 'v1-adjective-verb-noun';
}

/**
 * Write-side Zod schema for an agent identity tuple (PDR-076a §Decision).
 * Every write factory (`deriveCollaborationIdentity`, comms event authoring,
 * claim opening, escalation, conversation appends) MUST emit identities that
 * satisfy this schema. `id` is required here so missing-id is caught at
 * compile time at the write site, not only as a runtime parse failure.
 */
export const collaborationAgentIdWriteSchema = collaborationAgentIdSchema.extend({
  id: uuidV5Schema,
});

export type CollaborationAgentIdWrite = Readonly<z.infer<typeof collaborationAgentIdWriteSchema>>;

export interface DerivedCollaborationIdentity {
  readonly agentId: CollaborationAgentIdWrite;
  readonly seed_source: string;
}

/**
 * Boundary validation for a commit_queue INTENT row's identity: the
 * canonical PDR-076a write schema (UUID v5 `id` required). Every live
 * writer emits `id` (intent factories parse through this same schema), so
 * a failure here means registry corruption — the error names the offending
 * intent so a blocked agent can surface it precisely. Recovery is an
 * owner-run removal of the named row; do not work around it.
 *
 * Shared by BOTH registry read paths (`commit-queue/registry.ts` and
 * `collaboration-state/state-parsers.ts`) per
 * consolidate-at-second-consumer — do not fork a third copy.
 */
export function parseIntentAgentId(value: unknown, intentId: string): CollaborationAgentIdWrite {
  const parsed = collaborationAgentIdWriteSchema.safeParse(value);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(
      `commit_queue entry ${intentId} carries an invalid agent_id ` +
        `(PDR-076a requires the UUID v5 id on intents): ${issues}. ` +
        `Every live writer emits id, so this indicates registry corruption — ` +
        `surface to the owner; recovery is removing intent ${intentId} (owner-run).`,
    );
  }
  return parsed.data;
}
