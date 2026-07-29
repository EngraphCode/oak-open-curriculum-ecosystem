/**
 * Guards over the content of SERVED sections. The classification lists in
 * `sections.ts` decide WHICH sections ship; these guards fail generation when
 * a served section's BODY carries a shape that must not ship — a
 * deeper-than-H3 heading (content that dodged the classification grain) or a
 * raw-GitHub fetch-URL form (the fetch-instruction shape directory policy
 * §2.F forbids). Excluded sections are exempt: their content never ships.
 */
import { createFenceTracker, type CanonicalSection } from './canonical-parser.js';

/** The first served-section content defect, or undefined when all bodies are clean. */
export function servedSectionDefect(
  sections: readonly CanonicalSection[],
  served: readonly string[],
): string | undefined {
  return servedDeepHeadingDefect(sections, served) ?? servedUrlFormDefect(sections, served);
}

/**
 * A `####`-or-deeper heading inside a SERVED section would ship in the digest
 * with no classification decision; fail loudly and ask for promotion to the
 * H1–H3 classification grain.
 */
function servedDeepHeadingDefect(
  sections: readonly CanonicalSection[],
  served: readonly string[],
): string | undefined {
  for (const section of sections) {
    if (!served.includes(section.heading)) {
      continue;
    }
    const deep = deepHeadingsOutsideFences(section.lines);
    if (deep.length > 0) {
      return (
        `Heading(s) deeper than the H1–H3 classification grain inside the served section ` +
        `"${section.heading}" — promote each to its own classified H1–H3 section, or fold ` +
        `it into prose:\n${deep.join('\n')}`
      );
    }
  }
  return undefined;
}

/**
 * Fences are tracked per section body via the parser's shared
 * `createFenceTracker`; a fence opened in one section and closed in another
 * is malformed markdown this scan does not model (`splitSections` tracks
 * fences globally). Heading detection covers CommonMark's ATX forms (space,
 * tab, or end-of-line after the hashes), matching the section split.
 */
function deepHeadingsOutsideFences(lines: readonly string[]): readonly string[] {
  const found: string[] = [];
  const fenced = createFenceTracker();
  for (const line of lines) {
    if (!fenced(line) && /^#{4,6}(?:[ \t]|$)/.test(line)) {
      found.push(line);
    }
  }
  return found;
}

/**
 * A raw-GitHub fetch-target URL form (`raw.githubusercontent.com`, or a
 * `/blob/<ref>/`, `/tree/<ref>/`, `/raw/<ref>/` path segment) matched as a
 * class, not a literal. Case-insensitive: URL hostnames are case-insensitive,
 * and over-matching a path segment is safe here (a false positive is a reword
 * with a clear message).
 */
const RAW_GITHUB_URL_FORM = /raw\.githubusercontent\.com|\/(?:blob|tree|raw)\/[^\s/]+\//i;

/**
 * A raw-GitHub fetch-target URL form inside a SERVED section is the
 * fetch-instruction shape the digest exists to exclude (directory policy
 * §2.F); fail loudly at the generation boundary. Excluded sections
 * legitimately carry these forms — `### Reaching the sources` is the worked
 * example. Cite the document path instead; the tool result's `repositoryUrl`
 * carries the locator.
 */
function servedUrlFormDefect(
  sections: readonly CanonicalSection[],
  served: readonly string[],
): string | undefined {
  for (const section of sections) {
    if (!served.includes(section.heading)) {
      continue;
    }
    const hits = section.lines.filter((line) => RAW_GITHUB_URL_FORM.test(line));
    if (hits.length > 0) {
      return (
        `Raw-GitHub URL form(s) inside the served section "${section.heading}" — cite the ` +
        `document path and let the tool result's repositoryUrl carry the locator:\n` +
        hits.join('\n')
      );
    }
  }
  return undefined;
}
