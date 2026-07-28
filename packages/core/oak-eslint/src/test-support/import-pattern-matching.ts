import { minimatch } from 'minimatch';

/**
 * Returns the pattern-group entries that match a specifier, mirroring
 * `no-restricted-imports` group semantics: a `!`-prefixed entry is an
 * exception within its group, never a positive match on its own, and a
 * specifier caught by a group's exception does not match that group.
 */
export function getMatchingPatternGroups(
  patterns: readonly { readonly group: readonly string[] }[],
  specifier: string,
): string[] {
  return patterns.flatMap((pattern) => {
    const excepted = pattern.group.some(
      (group) => group.startsWith('!') && minimatch(specifier, group.slice(1), { dot: true }),
    );
    if (excepted) {
      return [];
    }
    return pattern.group.filter(
      (group) => !group.startsWith('!') && minimatch(specifier, group, { dot: true }),
    );
  });
}
