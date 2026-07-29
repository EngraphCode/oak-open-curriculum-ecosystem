/**
 * Shared test fixture: a minimal canonical carrying every classified
 * heading, in list order. Single owner for both the unit and integration
 * suites (consolidate-at-second-consumer).
 */
import { EXCLUDED_SECTION_HEADINGS, SERVED_SECTION_HEADINGS } from '../sections.js';

export function syntheticCanonical(): string {
  const served = SERVED_SECTION_HEADINGS.map((h, i) => `${h}\n\nServed body ${i}.`);
  const excluded = [...EXCLUDED_SECTION_HEADINGS.keys()].map(
    (h, i) => `${h}\n\nExcluded body ${i}.`,
  );
  return `---\nname: under-the-hood\n---\n\n${[...served, ...excluded].join('\n\n')}\n`;
}
