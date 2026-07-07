/**
 * The validated quality-standards loader: imports the committed content data
 * (`quality-standards.json`, the vendored 685-row snapshot normalised by
 * `scripts/generate-quality-standards.ts`) and parses it against the quality-standard schema —
 * the single source of truth in `../quality-standards-types.ts` — at module initialisation.
 *
 * This is the runtime belt of the two-belt design (the generator validates the same schema before
 * writing). The module loads at build/server start, so a validation failure fails the build loud
 * via the module-scope `parse` (the one deliberate throwing boundary here: there is no runtime
 * caller to hand a `Result` to, and a malformed content file must never ship).
 */

import { qualityStandardsSchema, type QualityStandard } from '../quality-standards-types';
import standardsJson from './quality-standards.json';

/** The full Oak quality-standards snapshot (685 rows), schema-validated at load. */
export const qualityStandards: readonly QualityStandard[] =
  qualityStandardsSchema.parse(standardsJson);
