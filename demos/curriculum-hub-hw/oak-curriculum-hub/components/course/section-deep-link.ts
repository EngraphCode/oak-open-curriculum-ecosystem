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

/**
 * Every section id in the course — the intro's sections first, then each module's in order. These are
 * the valid deep-link targets; consuming the {@link CourseNavTree} `sections` projection keeps that
 * projection load-bearing (closed-shape).
 */
export function collectSectionIds(tree: CourseNavTree): readonly string[] {
  const moduleSectionIds = tree.units.flatMap((unit) =>
    unit.modules.flatMap((module) => module.sections.map((section) => section.id)),
  );
  return [...tree.intro.sections.map((section) => section.id), ...moduleSectionIds];
}

/**
 * Resolve a location hash to the id of the section element to focus, or `null`. Returns
 * `section-<id>` only when the hash is a `#section=<id>` deep-link AND `<id>` is a real section, so a
 * stale or malformed fragment focuses nothing rather than throwing or focusing the wrong node.
 */
export function resolveSectionDeepLink(hash: string, validIds: ReadonlySet<string>): string | null {
  const id = parseSectionFragment(hash);
  return id !== null && validIds.has(id) ? `section-${id}` : null;
}
