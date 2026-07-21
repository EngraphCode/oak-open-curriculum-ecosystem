/**
 * Pure helpers for the plan-corpus validator: strategic-choice registry
 * recomputation and per-file frontmatter conformance.
 *
 * @remarks
 * The registry is recomputed from BOTH live surfaces on every run
 * (validators-must-recompute-not-just-record): the prefix families from
 * the `docs/strategy/README.md` registry table, and the concrete
 * numbered choice IDs from the `docs/strategy/stream-*.md` documents.
 * A `serves_strategic_choice` value resolves iff it is a concrete ID
 * from a registered family (or the literal `pending`, V0 §2.3).
 *
 * @packageDocumentation
 */

import { err, isErr, ok, type Result } from '@oaknational/result';
import { parse as parseYaml } from 'yaml';

import { isJsonObject } from '../../core/json.js';
import { extractFrontmatter } from '../portability/portability-fs.js';
import { planNodeSchema, type PlanNode } from './plan-node-schema.js';

/** A backtick-quoted family token in the registry table, e.g. APP-star. */
const FAMILY_TOKEN = /`([A-Z]+)-\*`/g;

/** A concrete strategic-choice ID, e.g. `FRAME-1`, anywhere in a stream doc. */
const CONCRETE_ID = /\b([A-Z]+-\d+)\b/g;

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

/** One plan file's conformance failure, path-anchored for the report. */
export interface PlanConformanceFailure {
  readonly path: string;
  readonly messages: readonly string[];
}

/**
 * Validate one `*.plan.md` file's frontmatter against the V0 contract
 * and the recomputed registry.
 *
 * Fail-closed at file granularity: a plan with no frontmatter block is
 * a failure, never a silent skip (the vacuous-green class).
 *
 * @returns `ok(PlanNode)` on conformance; `err` carries every message.
 */
export function validatePlanFile(
  path: string,
  content: string,
  registry: ChoiceRegistry,
): Result<PlanNode, PlanConformanceFailure> {
  const mapping = parseFrontmatterMapping(content);
  if (isErr(mapping)) {
    return err({ path, messages: [mapping.error] });
  }
  const result = planNodeSchema.safeParse(mapping.value);
  if (!result.success) {
    return err({
      path,
      messages: result.error.issues.map(
        (issue) => `${issue.path.map(String).join('.') || '(root)'}: ${issue.message}`,
      ),
    });
  }
  const choice = result.data.serves_strategic_choice;
  if (choice !== undefined && choice !== 'pending' && !registry.ids.has(choice)) {
    return err({
      path,
      messages: [
        `serves_strategic_choice: '${choice}' does not resolve against the published registry (docs/strategy; known: ${[...registry.ids].sort((a, b) => a.localeCompare(b)).join(', ')})`,
      ],
    });
  }
  return ok(result.data);
}

/** Extract and parse the YAML frontmatter block into a mapping, fail-closed. */
function parseFrontmatterMapping(content: string): Result<unknown, string> {
  const frontmatter = extractFrontmatter(content);
  if (frontmatter === null) {
    return err('no YAML frontmatter block (V0 §2 requires one)');
  }
  let parsed: unknown;
  try {
    parsed = parseYaml(frontmatter);
  } catch (cause) {
    return err(
      `frontmatter is not parseable YAML: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }
  if (!isJsonObject(parsed)) {
    return err('frontmatter is not a YAML mapping');
  }
  return ok(parsed);
}
