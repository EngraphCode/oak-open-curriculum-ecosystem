const alphabetical = (left: string, right: string) => left.localeCompare(right);

/**
 * Requires two string multisets to contain the same values with the same
 * multiplicity. Input order is deliberately irrelevant.
 */
export function requireSameStringMembers(
  label: string,
  expected: readonly string[],
  actual: readonly string[],
): void {
  const sortedExpected = [...expected].sort(alphabetical);
  const sortedActual = [...actual].sort(alphabetical);
  if (JSON.stringify(sortedExpected) !== JSON.stringify(sortedActual)) {
    throw new Error(
      `${label} differ\nexpected: ${JSON.stringify(sortedExpected)}\n` +
        `actual: ${JSON.stringify(sortedActual)}`,
    );
  }
}
