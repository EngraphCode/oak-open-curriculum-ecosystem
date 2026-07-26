import type { RegistrationEvidence } from './current-source-model.js';

type ExpectedGuidanceEntry = readonly [source: string, selector: string];

/** Requires every expected source to carry its exact resource selector. */
export function requireGuidanceRegistrationParity(
  expectedEntries: readonly ExpectedGuidanceEntry[],
  registrationsBySource: Readonly<Record<string, RegistrationEvidence>>,
): void {
  for (const [source, expectedSelector] of expectedEntries) {
    const registration = registrationsBySource[source];
    if (registration === undefined) {
      throw new Error(`Current guidance has no registration evidence: ${source}`);
    }
    if (registration.selector !== expectedSelector) {
      throw new Error(
        `Current guidance selector differs for ${source}\n` +
          `expected: ${expectedSelector}\nactual:   ${registration.selector}`,
      );
    }
  }
}
