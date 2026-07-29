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
 * Splits the canonical into sections by heading line, fence-aware (a `#`
 * line inside a code fence is content, not a heading) and with the leading
 * YAML frontmatter block stripped. ATX levels 1–3 are the classification
 * grain; deeper headings are section content — and inside a SERVED section
 * they are rejected at classification (see `buildDigest`).
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
  let inFence = false;
  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      inFence = !inFence;
    }
    if (!inFence && /^#{1,3} /.test(line)) {
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
