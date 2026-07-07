import type { CourseNavTree } from './course-view-model';

/**
 * The `<id>` in a `#section=<id>` location fragment, or `null` when the hash is not a section
 * deep-link. The `section=` form (rather than a native `#<id>`) is deliberate: hub-search emits
 * `/course#section=<id>` and the fragment is resolved programmatically, never by native anchor
 * behaviour (which would never fire, since `section=<id>` is not an element id).
 */
export function parseSectionFragment(hash: string): string | null {
  return /^#section=(.+)$/.exec(hash)?.[1] ?? null;
}

/** One entry in the player's ordered section sequence: a section paired with its owning module. */
export interface PlayerEntry {
  readonly sectionId: string;
  readonly moduleId: string;
}

/** A section's place in the player sequence: 0-based index, total, and both neighbours. */
export interface PlayerPosition {
  readonly index: number;
  readonly total: number;
  readonly previousId: string | null;
  readonly nextId: string | null;
}

/**
 * The player's ordered section sequence — the intro's sections first, then each module's in tree
 * order, every section paired with its owning module id (the module gate needs it to show the active
 * section's module and hide the rest). Supersedes the flat id list for player consumers: the id list
 * is `entries.map((entry) => entry.sectionId)`.
 */
export function toPlayerEntries(tree: CourseNavTree): readonly PlayerEntry[] {
  const introEntries = tree.intro.sections.map((section) => ({
    sectionId: section.id,
    moduleId: tree.intro.id,
  }));
  const moduleEntries = tree.units.flatMap((unit) =>
    unit.modules.flatMap((module) =>
      module.sections.map((section) => ({ sectionId: section.id, moduleId: module.id })),
    ),
  );
  return [...introEntries, ...moduleEntries];
}

/**
 * Resolve a location hash to the section the player should activate, or `null` when it names none.
 * Two hash shapes navigate the player: `#section=<id>` (the hub-search deep-link contract — held
 * stable, shared seam) and `#<moduleId>` (the coursemap anchor scheme), which activates that
 * module's first section. A stale or malformed fragment resolves to `null` rather than throwing or
 * activating the wrong section.
 *
 * CONSTRAINT (reviewer-flagged): every OTHER in-page fragment also resolves `null`. The provider
 * keeps the last-resolved section active for unresolvable non-empty hashes, so a future in-content
 * anchor (e.g. a skip-link target) will not reset the player — but its target must live inside the
 * active section (or be handled explicitly) to be scroll-reachable in player mode.
 */
export function resolveActiveSection(hash: string, entries: readonly PlayerEntry[]): string | null {
  const sectionId = parseSectionFragment(hash);
  if (sectionId !== null) {
    return entries.some((entry) => entry.sectionId === sectionId) ? sectionId : null;
  }
  const moduleId = /^#(.+)$/.exec(hash)?.[1] ?? null;
  if (moduleId === null) {
    return null;
  }
  return entries.find((entry) => entry.moduleId === moduleId)?.sectionId ?? null;
}

/**
 * The module owning the given section, or `null` when no section is active or the id is unknown.
 * The single derivation consumed by the module gates and the sidebar (one source, no drift).
 */
export function activeModuleIdOf(
  activeSectionId: string | null,
  entries: readonly PlayerEntry[],
): string | null {
  if (activeSectionId === null) {
    return null;
  }
  return entries.find((entry) => entry.sectionId === activeSectionId)?.moduleId ?? null;
}

/**
 * The active section's place in the sequence — 0-based `index`, `total`, and the neighbouring section
 * ids (`null` at either end) — or `null` for an id outside the sequence. Drives the player's prev/next
 * controls and the "Section n of N" position line.
 */
export function playerPosition(
  activeSectionId: string,
  entries: readonly PlayerEntry[],
): PlayerPosition | null {
  const index = entries.findIndex((entry) => entry.sectionId === activeSectionId);
  if (index === -1) {
    return null;
  }
  return {
    index,
    total: entries.length,
    previousId: entries[index - 1]?.sectionId ?? null,
    nextId: entries[index + 1]?.sectionId ?? null,
  };
}
