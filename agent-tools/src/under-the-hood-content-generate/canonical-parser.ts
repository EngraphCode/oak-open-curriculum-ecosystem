/**
 * Section parser for the under-the-hood canonical skill. Owns the section
 * model and the markdown split; classification and digest derivation live in
 * `generator.ts`.
 */
import { err, ok, isErr, type Result } from '@oaknational/result';

/** Repo-relative path of the canonical skill the digest derives from. */
export const CANONICAL_SKILL_PATH = '.agent/skills/under-the-hood/SKILL-CANONICAL.md';

/** One markdown section: its exact heading line and verbatim body lines. */
export interface CanonicalSection {
  readonly heading: string;
  readonly lines: readonly string[];
}

/**
 * Stateful CommonMark fence tracker. A fence opens with a backtick or tilde
 * run of three or more, indented at most three spaces (deeper indent is
 * code); it closes only on a run of the SAME character, at least as long,
 * with nothing after it — so a literal three-backtick line inside a
 * four-backtick fence stays content. The returned function answers, per line
 * in order, "is this line a fence delimiter or fenced content?"; heading
 * detection is suppressed for such lines. Shared by the section split and
 * the served-section guards so both track fences the same way.
 */
export function createFenceTracker(): (line: string) => boolean {
  let open: FenceDelimiter | undefined;
  return (line: string): boolean => {
    const delimiter = parseFenceDelimiter(line);
    if (delimiter === undefined) {
      return open !== undefined;
    }
    if (open === undefined) {
      open = delimiter;
    } else if (closesFence(open, delimiter)) {
      open = undefined;
    }
    return true;
  };
}

interface FenceDelimiter {
  readonly char: string;
  readonly length: number;
  readonly rest: string;
}

function parseFenceDelimiter(line: string): FenceDelimiter | undefined {
  const match = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
  const run = match?.[1];
  if (run === undefined) {
    return undefined;
  }
  return { char: run.charAt(0), length: run.length, rest: match?.[2] ?? '' };
}

/** CommonMark close: same delimiter character, an equal-or-longer run, nothing after it. */
function closesFence(open: FenceDelimiter, candidate: FenceDelimiter): boolean {
  return (
    candidate.char === open.char && candidate.length >= open.length && candidate.rest.trim() === ''
  );
}

/**
 * Splits the canonical into sections by heading line, fence-aware (a `#`
 * line inside a code fence is content, not a heading) and with the leading
 * YAML frontmatter block stripped. ATX levels 1–3 are the classification
 * grain; deeper headings are section content — and inside a SERVED section
 * they are rejected at classification (see `buildDigest`). The scanner
 * covers CommonMark's ATX forms (space, tab, or end-of-line after the
 * hashes) and both fence styles; the estate's markdownlint gate binds the
 * canonical on the same commit path (hard tabs and mixed fence styles are
 * lint errors there), so these forms are defence-in-depth, not a live
 * dialect.
 */
export function parseCanonicalSections(
  canonical: string,
): Result<readonly CanonicalSection[], string> {
  const stripped = stripFrontmatter(canonical.split('\n'));
  if (isErr(stripped)) {
    return stripped;
  }
  return ok(splitSections(stripped.value));
}

function splitSections(lines: readonly string[]): readonly CanonicalSection[] {
  const sections: CanonicalSection[] = [];
  let current: { heading: string; lines: string[] } | undefined;
  const fenced = createFenceTracker();
  for (const line of lines) {
    if (!fenced(line) && /^#{1,3}(?:[ \t]|$)/.test(line)) {
      if (current !== undefined) {
        sections.push(current);
      }
      current = { heading: line, lines: [] };
      continue;
    }
    if (current !== undefined) {
      current.lines.push(line);
    }
  }
  if (current !== undefined) {
    sections.push(current);
  }
  return sections;
}

function stripFrontmatter(lines: readonly string[]): Result<readonly string[], string> {
  if (lines[0] !== '---') {
    return ok(lines);
  }
  const closing = lines.indexOf('---', 1);
  if (closing === -1) {
    return err(`Unterminated YAML frontmatter in ${CANONICAL_SKILL_PATH}`);
  }
  return ok(lines.slice(closing + 1));
}
