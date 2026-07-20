/**
 * The gazetteer zod schemas — Node-side boundary validation ONLY.
 *
 * @remarks
 * Split from `gazetteer.ts` (which is bundled INTO the sandbox artefact via `prompts.ts`)
 * because zod must never enter a sandbox bundle: this module is imported for its VALUE
 * only at the Node-side boundary; `gazetteer.ts` imports only the `Gazetteer` TYPE from
 * here (type-only, erased at bundle time), never a schema value.
 *
 * Two schemas, two boundaries: {@link gazetteerFileSchema} is the STRICT v1 envelope for
 * the committed `gazetteer.v1.json` — every field declared, typos fail loudly, nothing
 * unvalidated rides through. {@link gazetteerSchema} is the STRICT minimal projection
 * that gets inlined into every seeded map artefact (against the 524,288-char harness
 * cap): only what the finder prompt consumes. `knownCanonicalValues` stays in the
 * envelope (validated, Node-side — it is the planned code-side canonicalisation input),
 * never in the inlined projection.
 *
 * @packageDocumentation
 */

import type { Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../../core/schema-parse.js';
import { factKeyComponent } from '../schemas.js';

/**
 * Canonical subject ids are the record VALUES (`flattenGazetteerSubjects` iterates
 * values; the keys are category names such as `gates` or `tools`). The ids are fact-key
 * components, so the `:` join-delimiter ban the finder schema enforces binds each listed
 * id — a listed id could never survive the exact-key join it exists to enable. Category
 * keys share the ban: they are prompt-facing labels with no legitimate `:` use, and a
 * delimiter there reads as id structure.
 */
const subjectsSchema = z.record(factKeyComponent, z.array(factKeyComponent));

/**
 * The strict v1 envelope of the committed gazetteer file — the file-read boundary.
 * Module-private: consumers go through {@link parseGazetteerFile}; export the schema the
 * moment a second consumer needs it directly (`consolidate-at-second-consumer`).
 */
const gazetteerFileSchema = z.strictObject({
  // Pinned literal: a typo'd or future version must fail loudly, not ride through.
  version: z.literal('gazetteer.v1'),
  referenceTree: z.string().min(1),
  compiledBy: z.string().min(1),
  usage: z.string().min(1),
  subjects: subjectsSchema,
  statusVocabulary: z.array(z.string().min(1)),
  knownCanonicalValues: z.record(z.string(), z.string().min(1)),
});
export type GazetteerFile = z.infer<typeof gazetteerFileSchema>;

/** The strict minimal projection inlined into seeded artefacts — what finders consume. */
export const gazetteerSchema = z.strictObject({
  subjects: subjectsSchema,
  statusVocabulary: z.array(z.string().min(1)),
});
export type Gazetteer = z.infer<typeof gazetteerSchema>;

/** Project the validated file envelope down to the inlined finder-facing shape. */
export function projectGazetteer(file: GazetteerFile): Gazetteer {
  return { subjects: file.subjects, statusVocabulary: file.statusVocabulary };
}

export const parseGazetteerFile = (value: unknown): Result<GazetteerFile, Error> =>
  parseWithSchema({ label: 'gazetteer file', schema: gazetteerFileSchema, value });
