import { createHash } from 'node:crypto';

import { IDENTITY_WORD_GROUPS } from './wordlists.js';

/**
 * Identifier of a registered naming schema.
 *
 * @remarks
 * A closed union: each member names a frozen era of the display-name
 * projection. Identifiers are descriptive slugs (template shape after an
 * ordinal prefix), never bare digits, so historical rows remain
 * self-describing.
 */
export type NamingSchemaId = 'v1-adjective-verb-noun';

/**
 * Casing applied to one display-name column at render time.
 *
 * @remarks
 * `title` capitalises the first letter; `lower` leaves the word lowercase.
 * Casing is schema-owned so a schema can de-emphasise low-salience columns
 * typographically (the v2 lowercase middle word).
 */
type NamingSchemaColumnCasing = 'title' | 'lower';

/**
 * One themed word group inside a naming schema: parallel columns of
 * selectable words, ordered to match the schema's `columnCasing`.
 */
interface NamingSchemaWordGroup {
  /** Stable group key emitted in derived identity results. */
  readonly group: string;
  /** Word columns for this group, in display order. */
  readonly columns: readonly (readonly string[])[];
}

/**
 * A registered, digest-pinned naming-schema era.
 */
export interface NamingSchema {
  /** Registered schema identifier. */
  readonly id: NamingSchemaId;
  /** Render casing per column; its length defines the column count. */
  readonly columnCasing: readonly NamingSchemaColumnCasing[];
  /** Themed word groups routed by the seed digest. */
  readonly groups: readonly NamingSchemaWordGroup[];
  /**
   * Pinned SHA-256 digest of the canonical wordlist material.
   *
   * @remarks
   * A gate test recomputes this digest from the live wordlists; any edit to
   * registered material without a new schema version fails the tree. Lists
   * therefore freeze at the moment a schema becomes active.
   */
  readonly wordlistDigest: string;
}

/**
 * Compute the canonical content digest for a naming schema's wordlist
 * material.
 *
 * @param schema - Schema material to digest (the pinned digest is ignored).
 * @returns Lowercase hexadecimal SHA-256 digest.
 */
export function computeNamingSchemaDigest(
  schema: Pick<NamingSchema, 'id' | 'columnCasing' | 'groups'>,
): string {
  const canonical = JSON.stringify({
    id: schema.id,
    columnCasing: schema.columnCasing,
    groups: schema.groups.map((group) => ({
      group: group.group,
      columns: group.columns,
    })),
  });

  return createHash('sha256').update(canonical).digest('hex');
}

const V1_WORDLIST_DIGEST = 'ce765ff52d73a93f0fd61a95f10d2aa36a20b0aaf3383018fae408d8d6d21e19';

/**
 * The v1 era: adjective–participle–noun, all columns title-cased, six themed
 * groups. Frozen as registered material; the underlying wordlist modules are
 * the canonical source and must not change while v1 is registered.
 */
const V1_NAMING_SCHEMA: NamingSchema = {
  id: 'v1-adjective-verb-noun',
  columnCasing: ['title', 'title', 'title'],
  groups: IDENTITY_WORD_GROUPS.map((group) => ({
    group: group.group,
    columns: [group.adjectives, group.verbs, group.nouns],
  })),
  wordlistDigest: V1_WORDLIST_DIGEST,
};

/**
 * All registered naming schemas, keyed by id.
 */
export const NAMING_SCHEMAS: Readonly<Record<NamingSchemaId, NamingSchema>> = {
  'v1-adjective-verb-noun': V1_NAMING_SCHEMA,
};

/**
 * The schema used for new derivations.
 */
export const ACTIVE_NAMING_SCHEMA_ID: NamingSchemaId = 'v1-adjective-verb-noun';
