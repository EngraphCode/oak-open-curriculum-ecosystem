/**
 * Guards over the content of SERVED sections. The classification lists in
 * `sections.ts` decide WHICH sections ship; these guards fail generation when
 * a served section carries a shape that must not ship — a deeper-than-H3
 * heading (content that dodged the classification grain) or an absolute URL
 * outside the served-citation allowlist (the fetch-instruction shape
 * directory policy §2.F forbids). Excluded sections are exempt: their
 * content never ships.
 */
import { createFenceTracker, type CanonicalSection } from './canonical-parser.js';

/** The first served-section content defect, or undefined when all bodies are clean. */
export function servedSectionDefect(
  sections: readonly CanonicalSection[],
  served: readonly string[],
): string | undefined {
  return servedDeepHeadingDefect(sections, served) ?? servedUrlDefect(sections, served);
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
 * The only absolute-URL prefixes a SERVED section may carry: Oak's own public
 * pages — the factual citations the owner ruling retains. Everything else
 * fails generation: an allowlist cannot be bypassed by enumerating new fetch
 * hosts (raw-GitHub, the Contents API, gists, …) the way a deny-list can
 * (directory policy §2.F). Additions here are deliberate compliance
 * decisions, reviewed like the section classification itself.
 */
const ALLOWED_SERVED_URL_PREFIXES: readonly string[] = ['https://www.thenational.academy/'];

/** Absolute-URL matcher; whitespace, backticks, pipes, and parens end a URL. */
const ABSOLUTE_URL = /https?:\/\/[^\s`)|]+/gi;

/**
 * Any absolute URL outside the served-citation allowlist inside a SERVED
 * section is treated as a potential fetch-instruction shape (directory
 * policy §2.F); fail loudly at the generation boundary. Excluded sections
 * legitimately carry fetch mechanics — `### Reaching the sources` is the
 * worked example. Cite repo-relative document paths instead; the tool
 * result's `repositoryUrl` carries the locator.
 */
function servedUrlDefect(
  sections: readonly CanonicalSection[],
  served: readonly string[],
): string | undefined {
  for (const section of sections) {
    if (!served.includes(section.heading)) {
      continue;
    }
    // The heading line ships too — scan it alongside the body.
    const disallowed = [section.heading, ...section.lines]
      .flatMap((line) => [...line.matchAll(ABSOLUTE_URL)].map((match) => match[0]))
      .filter((url) => !isAllowedServedUrl(url));
    if (disallowed.length > 0) {
      return (
        `Absolute URL(s) outside the served-citation allowlist in the served section ` +
        `"${section.heading}" — cite the repo-relative document path (the tool result's ` +
        `repositoryUrl carries the locator), or add a factual Oak citation prefix to the ` +
        `allowlist deliberately:\n${disallowed.join('\n')}`
      );
    }
  }
  return undefined;
}

/** Case-insensitive prefix test (URL hostnames are case-insensitive). */
function isAllowedServedUrl(url: string): boolean {
  const lowered = url.toLowerCase();
  return ALLOWED_SERVED_URL_PREFIXES.some((prefix) => lowered.startsWith(prefix));
}
