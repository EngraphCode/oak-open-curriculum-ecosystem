/**
 * The gazetteer zod schema — Node-side boundary validation ONLY.
 *
 * @remarks
 * Split from `gazetteer.ts` (which is bundled INTO the sandbox artefact via `prompts.ts`)
 * because zod must never enter a sandbox bundle: this module is imported for its VALUE
 * only at the Node-side boundary (`stage-io.ts`'s `mapRunDataSchema`, and
 * `build-run-artefact`'s checkpoint re-validation); `gazetteer.ts` imports only the
 * `Gazetteer` TYPE from here (type-only, erased at bundle time), never the schema value.
 *
 * @packageDocumentation
 */

import { z } from 'zod';

/** One gazetteer snapshot: categorised canonical subject ids + known status words. */
export const gazetteerSchema = z.looseObject({
  subjects: z.record(z.string(), z.array(z.string().min(1))),
  statusVocabulary: z.array(z.string().min(1)),
});
export type Gazetteer = z.infer<typeof gazetteerSchema>;
