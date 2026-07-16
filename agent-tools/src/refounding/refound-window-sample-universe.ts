import { err, isErr, ok, type Result } from '@oaknational/result';

import { type FreezeRule } from './freeze-rule-schema.js';
import { INSTRUMENT_EXCLUDE_GLOBS } from './refound-freeze-helpers.js';
import {
  classifyInventoryMode,
  compareByCodeUnit,
  splitLineBytes,
} from './refounding-artefacts.js';

/**
 * The scanned-file universe for `refound-window-sample`: the sweep's file
 * surface re-derived AT THE BASE COMMIT, never the live tree.
 *
 * @remarks
 * The reader sample's denominator is the same universe the verified sweep
 * scanned, so this module re-derives it from first principles at the base:
 * the freeze rule's `sweep`-class globs select, the instrument's own homes
 * are excluded by construction (F1 §8.4, the sweep's own posture), opaque
 * files (null-byte sniff) are skipped exactly as the sweep skips them, and
 * the result is sorted by UTF-16 code unit (the determinism contract).
 *
 * Bytes arrive only through the {@link ByteSource} seam — `git ls-tree` /
 * `git show` in production (`refound-window-sample-helpers.ts`), in-memory
 * fakes in unit tests — so the enumeration itself stays pure.
 *
 * **Glob-semantics guard.** The sweep enumerates with tinyglobby over the
 * live tree; this module enumerates by prefix over a base-commit listing.
 * Those two mechanisms agree only for globs of the exact shape
 * `<prefix>/**`, so {@link reduceGlobsToPrefixes} asserts that shape for
 * every relevant glob and HALTS on any other — a silently drifted universe
 * would corrupt every downstream count.
 *
 * @packageDocumentation
 */

/**
 * The bytes-at-base seam: everything the computation reads about the
 * repository comes through this interface, so unit tests drive it with
 * in-memory fakes and production backs it with git plumbing at the base
 * commit.
 */
export interface ByteSource {
  /** All repo-relative POSIX paths at the base commit (any order). */
  listPaths(): Result<readonly string[], Error>;
  /** The raw bytes of one path at the base commit. */
  readBytes(relPath: string): Result<Uint8Array, Error>;
}

/** One universe file with its LF-split line count at base. */
export interface UniverseFile {
  readonly relPath: string;
  readonly lineCount: number;
}

/**
 * A `<prefix>/**` glob: a relative POSIX prefix free of glob metacharacters
 * and `..` segments, followed by exactly one `/**`. Only this shape reduces
 * to prefix matching without semantic drift from tinyglobby — which also
 * recognises extglobs (`+(…)`, `@(a|b)`), so `+ @ ( ) |` and backslash are
 * refused alongside the classic metacharacters: a prefix containing any of
 * them would silently change the base universe instead of refusing.
 */
const PREFIX_GLOB_PATTERN = /^([^*?[\]{}!+@()|\\]+)\/\*\*$/;

/**
 * Reduce globs to plain path prefixes, halting on any glob whose shape is
 * not exactly `<prefix>/**` (see the module remarks for why any other shape
 * must refuse rather than approximate).
 */
export function reduceGlobsToPrefixes(globs: readonly string[]): Result<readonly string[], Error> {
  const prefixes: string[] = [];
  for (const glob of globs) {
    const prefix = PREFIX_GLOB_PATTERN.exec(glob)?.[1];
    const escapes = prefix === undefined || prefix.startsWith('/') || prefix.endsWith('/');
    if (escapes || prefix.split('/').includes('..')) {
      return err(
        new Error(
          `glob '${glob}' is not of the required '<prefix>/**' shape — prefix matching cannot ` +
            `reproduce its semantics, so the universe could drift from the sweep's; halting`,
        ),
      );
    }
    prefixes.push(prefix);
  }
  return ok(prefixes);
}

/** True when `relPath` lies strictly under any of the prefixes. */
const underAny = (relPath: string, prefixes: readonly string[]): boolean =>
  prefixes.some((prefix) => relPath.startsWith(`${prefix}/`));

/** The rule's sweep-class prefixes and the instrument-exclude prefixes, shape-asserted. */
function resolvePrefixSets(
  rule: FreezeRule,
): Result<{ sweep: readonly string[]; exclude: readonly string[] }, Error> {
  const globs = rule.classes
    .filter((ruleClass) => ruleClass.verdict === 'sweep')
    .flatMap((ruleClass) => [...ruleClass.globs]);
  if (globs.length === 0) {
    return err(new Error("the freeze rule declares no 'sweep' classes; refusing a mis-run"));
  }
  const sweep = reduceGlobsToPrefixes(globs);
  if (isErr(sweep)) {
    return sweep;
  }
  const exclude = reduceGlobsToPrefixes(INSTRUMENT_EXCLUDE_GLOBS);
  if (isErr(exclude)) {
    return exclude;
  }
  return ok({ sweep: sweep.value, exclude: exclude.value });
}

/**
 * Enumerate the non-opaque sweep-surface universe at base: sweep-class
 * prefixes in, instrument homes out by construction, opaque files skipped
 * (the sweep's own skip), sorted by code unit, each file carrying its
 * LF-split line count. Any unreadable path or shape-violating glob is a
 * refusal, never a partial universe.
 */
export function enumerateUniverse(
  source: ByteSource,
  rule: FreezeRule,
): Result<readonly UniverseFile[], Error> {
  const prefixes = resolvePrefixSets(rule);
  if (isErr(prefixes)) {
    return prefixes;
  }
  const listed = source.listPaths();
  if (isErr(listed)) {
    return err(new Error(`cannot list the base commit's paths: ${listed.error.message}`));
  }
  const candidates = listed.value
    .filter(
      (relPath) =>
        underAny(relPath, prefixes.value.sweep) && !underAny(relPath, prefixes.value.exclude),
    )
    .sort(compareByCodeUnit);
  const universe: UniverseFile[] = [];
  for (const relPath of candidates) {
    const bytes = source.readBytes(relPath);
    if (isErr(bytes)) {
      return err(new Error(`cannot read '${relPath}' at base: ${bytes.error.message}`));
    }
    if (classifyInventoryMode(relPath, bytes.value) !== 'opaque') {
      universe.push({ relPath, lineCount: splitLineBytes(bytes.value).length });
    }
  }
  return ok(universe);
}

/**
 * Parse one NUL-delimited `git ls-tree -r -z <base>` entry — mode, type, and
 * object id, then a tab, then the path — into its repo-relative path,
 * refusing every non-regular-file mode loudly.
 *
 * @remarks
 * The `-z` listing is what makes special-character paths safe (no C-quoting),
 * and the mode filter closes the one silent-divergence case the sweep parity
 * cannot see: a symlink under a sweep surface would count as one file on both
 * sides while this instrument windowed the link-target STRING and the sweep
 * scanned the target CONTENT. The estate forbids symlinks, so a refusal here
 * is a defect signal, never routine.
 */
export function parseTreeEntry(entry: string): Result<string, Error> {
  const tabIndex = entry.indexOf('\t');
  if (tabIndex < 0) {
    return err(new Error(`malformed ls-tree entry (no tab separator): '${entry}'`));
  }
  const mode = entry.slice(0, tabIndex).split(' ')[0] ?? '';
  const relPath = entry.slice(tabIndex + 1);
  if (mode !== '100644' && mode !== '100755') {
    return err(
      new Error(
        `refusing non-regular-file tree entry at base: '${relPath}' has mode ${mode} — ` +
          `symlinks and gitlinks cannot be windowed, and the estate forbids them; ` +
          `halting with nothing written`,
      ),
    );
  }
  return ok(relPath);
}
