import { err, ok, type Result } from '@oaknational/result';
import { glob } from 'tinyglobby';

import { type FreezeRule } from './freeze-rule-schema.js';
import { compareByCodeUnit } from './refounding-artefacts.js';
import { findEscapingMatches, INSTRUMENT_EXCLUDE_GLOBS } from './refound-freeze-helpers.js';

/**
 * The shared live-tree `in`-set enumeration under the ratified freeze rule —
 * the ONE place the rule's class verdicts become a concrete file set, so its
 * two consumers (`refound-freeze`'s plan phase and `refound-merge-recheck`'s
 * re-derivation, F1 D4) cannot drift. Extracted from
 * `refound-freeze-plan.ts` when the G3.3 out-subtraction landed.
 *
 * @packageDocumentation
 */

/**
 * Enumerate the rule's `in` classes from the live tree: sorted repo-relative
 * POSIX paths, with the instrument's own homes excluded by construction and
 * the rule's `out` classes subtracted — an overlapping `out` glob wins (the
 * verdict schema's TSDoc owns the semantics note).
 */
export async function enumerateInSet(
  rule: FreezeRule,
  repoRoot: string,
): Promise<Result<readonly string[], Error>> {
  const patterns = rule.classes
    .filter((ruleClass) => ruleClass.verdict === 'in')
    .flatMap((ruleClass) => [...ruleClass.globs]);
  const outPatterns = rule.classes
    .filter((ruleClass) => ruleClass.verdict === 'out')
    .flatMap((ruleClass) => [...ruleClass.globs]);
  const matches = await glob(patterns, {
    cwd: repoRoot,
    dot: true,
    ignore: [...INSTRUMENT_EXCLUDE_GLOBS, ...outPatterns],
  });
  const escaping = findEscapingMatches(matches);
  if (escaping.length > 0) {
    return err(
      new Error(
        `freeze rule globs matched paths outside the repository (absolute or containing '..'): ` +
          `${escaping.slice(0, 5).join(', ')} — a ratified rule cannot grant out-of-repo reach`,
      ),
    );
  }
  if (matches.length === 0) {
    return err(
      new Error(
        "no files remain in the freeze rule's 'in' classes after subtracting 'out' classes " +
          "and the instrument's own homes; refusing a mis-run",
      ),
    );
  }
  return ok([...matches].sort(compareByCodeUnit));
}
