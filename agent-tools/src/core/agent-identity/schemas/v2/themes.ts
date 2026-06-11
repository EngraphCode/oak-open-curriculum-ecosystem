/**
 * Manifest of themed v2 noun material.
 *
 * @remarks
 * Each theme cycle adds its module and one manifest row here; the curation
 * gate tests are data-driven over this list, so the gates never change as
 * themes land. The WS2.8 assembly cycle pins the manifest into the
 * v2 registry entry and asserts completeness (all six themes registered).
 */

/**
 * One themed pair of edge-noun columns for the v2 noun-verb-noun schema.
 */
export interface V2ThemeGroup {
  /** Stable group key emitted in derived identity results. */
  readonly group: string;
  /** First-column (subject) nouns: the largest, highest-salience column. */
  readonly subjectNouns: readonly string[];
  /** Last-column (object) nouns. */
  readonly objectNouns: readonly string[];
}

/**
 * All registered v2 theme groups, in routing order.
 */
export const V2_THEME_GROUPS: readonly V2ThemeGroup[] = [];
