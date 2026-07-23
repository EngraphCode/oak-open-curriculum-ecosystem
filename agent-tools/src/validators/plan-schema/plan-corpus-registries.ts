/**
 * Registry recomputation for the plan-corpus validator: the published
 * strategic-choice registry and the closed impact-areas registry.
 *
 * @remarks
 * Both registries are recomputed from live surfaces on every run
 * (validators-must-recompute-not-just-record), and both fail closed on
 * a vacuous parse — an empty registry would green every plan.
 *
 * @packageDocumentation
 */

import { err, ok, type Result } from '@oaknational/result';

/** A backtick-quoted family token in the registry table, e.g. APP-star. */
const FAMILY_TOKEN = /`([A-Z]+)-\*`/g;

/** A concrete strategic-choice ID, e.g. `FRAME-1`, anywhere in a stream doc. */
const CONCRETE_ID = /\b([A-Z]+-\d+)\b/g;

/** A backtick-quoted kebab area name opening an impact-areas table row. */
const IMPACT_AREA_ROW = /^\|\s*`([a-z0-9]+(?:-[a-z0-9]+)*)`/gm;

/** The recomputed strategic-choice registry. */
export interface ChoiceRegistry {
  /** Registered prefix families (e.g. `APP`, `FRAME`), from the README table. */
  readonly families: ReadonlySet<string>;
  /** Concrete choice IDs (e.g. `FRAME-1`), from the stream documents. */
  readonly ids: ReadonlySet<string>;
}

/**
 * Recompute the strategic-choice registry from the strategy corpus.
 *
 * @param readmeContent - `docs/strategy/README.md` verbatim.
 * @param streamContents - Each `docs/strategy/stream-*.md` verbatim.
 * @returns The registry, or an error when the README names no families
 *   (a vacuous registry would green every plan — fail closed instead).
 */
export function recomputeChoiceRegistry(
  readmeContent: string,
  streamContents: readonly string[],
): Result<ChoiceRegistry, Error> {
  const families = collectFamilies(readmeContent);
  if (families.size === 0) {
    return err(
      new Error(
        'strategic-choice registry recompute found no `PREFIX-*` families in docs/strategy/README.md — refusing a vacuous registry',
      ),
    );
  }
  return ok({ families, ids: collectConcreteIds(streamContents, families) });
}

/** Family prefixes from the README registry table. */
function collectFamilies(readmeContent: string): Set<string> {
  const families = new Set<string>();
  for (const match of readmeContent.matchAll(FAMILY_TOKEN)) {
    const family = match[1];
    if (family !== undefined) {
      families.add(family);
    }
  }
  return families;
}

/** Concrete choice IDs from the stream docs, filtered to registered families. */
function collectConcreteIds(
  streamContents: readonly string[],
  families: ReadonlySet<string>,
): Set<string> {
  const ids = new Set<string>();
  for (const content of streamContents) {
    for (const match of content.matchAll(CONCRETE_ID)) {
      const id = match[1];
      const family = id?.split('-')[0];
      if (id !== undefined && family !== undefined && families.has(family)) {
        ids.add(id);
      }
    }
  }
  return ids;
}

/**
 * Parse the closed impact-areas registry from its markdown table.
 *
 * @param content - `.agent/plans/impact-areas.md` verbatim.
 * @returns The set of registered area names, or an error when none are
 *   found (a vacuous registry would green every plan — fail closed).
 */
export function parseImpactAreasRegistry(content: string): Result<ReadonlySet<string>, Error> {
  const areas = new Set<string>();
  for (const match of content.matchAll(IMPACT_AREA_ROW)) {
    const area = match[1];
    if (area !== undefined) {
      areas.add(area);
    }
  }
  if (areas.size === 0) {
    return err(
      new Error(
        'impact-areas registry parse found no backtick-quoted area rows in .agent/plans/impact-areas.md — refusing a vacuous registry',
      ),
    );
  }
  return ok(areas);
}
