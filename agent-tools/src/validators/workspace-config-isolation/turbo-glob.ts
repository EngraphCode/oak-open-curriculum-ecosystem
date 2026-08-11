/**
 * The pinned turbo-glob matcher for the workspace-config-isolation
 * validator's turbo-inputs leg.
 *
 * @remarks Semantics pinned against turbo's own `--dry=json` resolved
 * inputs (MCP-542, 2026-08-11 — the dry run is the authoritative
 * instrument, never a docs statement): `**` matches ZERO or more whole
 * path segments; dot-directories match (no JS-glob dot default); a
 * literal directory input is expanded to its recursive contents;
 * embedded double-stars (`a**`, `**f`) are NORMALISED by turbo rather
 * than treated as two single stars, so this matcher refuses them. Any
 * syntax outside the supported subset (`**` as a whole segment, `*`,
 * `?`) is a refusal, never a guess — extend the subset here with a
 * red-proof rather than working around the gate.
 *
 * @packageDocumentation
 */

/** Any character that COULD be glob syntax routes the entry through the compiler. */
export const GLOB_CANDIDATE = /[*?[\]{}()+@|!]/;
const REGEX_SPECIAL = /[.^$\\]/;

type SegmentCompilation =
  | { readonly kind: 'source'; readonly source: string }
  | { readonly kind: 'unsupported'; readonly reason: string };

/** The compiler's outcome — a usable matcher or a named refusal. */
export type GlobCompilation =
  | { readonly kind: 'regex'; readonly regex: RegExp }
  | { readonly kind: 'unsupported'; readonly reason: string };

/** One path segment as regex source — `*`/`?` expanded, specials escaped, the rest refused. */
function compileGlobSegment(segment: string): SegmentCompilation {
  let source = '';
  for (const character of segment) {
    if (character === '*') {
      source += '[^/]*';
    } else if (character === '?') {
      source += '[^/]';
    } else if (GLOB_CANDIDATE.test(character)) {
      return {
        kind: 'unsupported',
        reason:
          `unsupported glob token '${character}' — the pinned turbo subset is ` +
          `'**', '*', '?'; extend the matcher (turbo-glob.ts) with a red-proof ` +
          `rather than changing turbo.json`,
      };
    } else if (REGEX_SPECIAL.test(character)) {
      source += `\\${character}`;
    } else {
      source += character;
    }
  }
  return { kind: 'source', source };
}

/** Compile one pattern (already stripped of its `$TURBO_ROOT$/` prefix). */
export function compileTurboGlob(pattern: string): GlobCompilation {
  let source = '^';
  const segments = pattern.split('/');
  for (const [index, segment] of segments.entries()) {
    const last = index === segments.length - 1;
    if (segment === '**') {
      // Zero or more whole segments mid-pattern; everything below when trailing.
      source += last ? '.+' : '(?:[^/]+/)*';
      continue;
    }
    if (segment.includes('**')) {
      // turbo NORMALISES embedded double-stars (`a**` → `a*/**`, `**f` →
      // `**/*f`) rather than treating them as two single stars — semantics
      // the pinned subset does not reproduce, so it refuses to guess
      // (Copilot round 1, 2026-08-11).
      return {
        kind: 'unsupported',
        reason:
          `embedded double-star in segment '${segment}' — turbo normalises these ` +
          `forms; the pinned subset supports '**' only as a whole segment; extend ` +
          `the matcher (turbo-glob.ts) with a red-proof rather than changing turbo.json`,
      };
    }
    const compiled = compileGlobSegment(segment);
    if (compiled.kind === 'unsupported') {
      return compiled;
    }
    source += compiled.source + (last ? '' : '/');
  }
  return { kind: 'regex', regex: new RegExp(`${source}$`, 'u') };
}

/**
 * turbo expands a literal input naming a DIRECTORY to that directory's
 * recursive contents before hashing (probe-measured on the pinned turbo,
 * 2026-08-11: a literal directory entry contributed its 7 tracked
 * descendants to the resolved input set, with and without a trailing
 * slash; `$TURBO_ROOT$/` alone resolved the whole repository). A literal
 * is therefore alive when it prefixes at least one tracked file, not
 * only when it IS one — and the empty relative path names the repository
 * root itself, which every tracked file sits under.
 */
export function isTrackedDirectoryPrefix(
  relative: string,
  trackedFiles: readonly string[],
): boolean {
  const directory = relative.replace(/\/+$/u, '');
  if (directory === '') {
    return trackedFiles.length > 0;
  }
  const prefix = `${directory}/`;
  return trackedFiles.some((candidate) => candidate.startsWith(prefix));
}
