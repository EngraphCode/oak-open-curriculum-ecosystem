/**
 * Under-the-hood MCP content generator.
 *
 * Reads the canonical orientation skill
 * (`.agent/skills/under-the-hood/SKILL-CANONICAL.md`), classifies every
 * section against the total allow/exclude lists in `sections.ts`, and emits
 * the served digest as a committed generated module in the MCP app
 * (`apps/oak-curriculum-mcp-streamable-http/src/generated/oak-under-the-hood-content.ts`).
 *
 * Generation is out-of-band-and-committed (the `build:widget` embed
 * precedent): the app build never reads `.agent/` — a cross-workspace
 * build-time read would be invisible to the app's turbo input set and go
 * silently stale. Drift is caught by `--check` (wired into
 * `repo-validators:check`), which regenerates in memory and compares
 * bytewise against the committed module — a recompute, never a recorded
 * assertion. All fallible steps return `Result` (ADR-088); the CLI is the
 * single boundary that translates errors to exit codes.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { err, isErr, ok, type Result } from '@oaknational/result';

import { EXCLUDED_SECTION_HEADINGS, SERVED_SECTION_HEADINGS } from './sections.js';

/** Repo-relative path of the canonical skill the digest derives from. */
const CANONICAL_SKILL_PATH = '.agent/skills/under-the-hood/SKILL-CANONICAL.md';

/** Repo-relative path of the emitted generated module. */
export const GENERATED_MODULE_PATH =
  'apps/oak-curriculum-mcp-streamable-http/src/generated/oak-under-the-hood-content.ts';

/** One markdown section: its exact heading line and verbatim body lines. */
interface CanonicalSection {
  readonly heading: string;
  readonly lines: readonly string[];
}

/**
 * Splits the canonical into sections by heading line, fence-aware (a `#`
 * line inside a code fence is content, not a heading) and with the leading
 * YAML frontmatter block stripped.
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

/**
 * Classifies every section and derives the served digest. Classification is
 * total: an unclassified heading, or a served heading absent from the
 * canonical, fails loudly so canonical restructuring forces a deliberate
 * decision here rather than silently changing the served payload.
 */
export function buildDigest(canonical: string): Result<string, string> {
  const parsed = parseCanonicalSections(canonical);
  if (isErr(parsed)) {
    return parsed;
  }
  const sections = parsed.value;
  const present = new Set(sections.map((s) => s.heading));
  const unclassified = sections
    .map((s) => s.heading)
    .filter((h) => !SERVED_SECTION_HEADINGS.includes(h) && !EXCLUDED_SECTION_HEADINGS.has(h));
  if (unclassified.length > 0) {
    return err(
      `Unclassified section heading(s) in ${CANONICAL_SKILL_PATH} — classify each in ` +
        `sections.ts (served or excluded, with reason):\n${unclassified.join('\n')}`,
    );
  }
  const missing = SERVED_SECTION_HEADINGS.filter((h) => !present.has(h));
  if (missing.length > 0) {
    return err(
      `Served section heading(s) missing from ${CANONICAL_SKILL_PATH} — the canonical was ` +
        `restructured; re-decide the digest in sections.ts:\n${missing.join('\n')}`,
    );
  }
  const served = sections.filter((s) => SERVED_SECTION_HEADINGS.includes(s.heading));
  const digest = served
    .map((s) => [s.heading, ...s.lines].join('\n').trimEnd())
    .join('\n\n')
    .trim();
  return ok(`${digest}\n`);
}

/** Renders the generated TypeScript module for a digest. */
export function renderGeneratedModule(digest: string): string {
  return `/**
 * GENERATED FILE — DO NOT EDIT
 *
 * The under-the-hood orientation digest served by the oak-under-the-hood MCP
 * tool: the audience-independent sections of the canonical skill
 * (\`${CANONICAL_SKILL_PATH}\`), selected by the total section classification
 * in \`agent-tools/src/under-the-hood-content-generate/sections.ts\`.
 *
 * Re-generate: \`pnpm under-the-hood-content:generate\` (repo root).
 * Drift gate: \`pnpm --filter @oaknational/agent-tools validate-under-the-hood-content\`.
 */
export const OAK_UNDER_THE_HOOD_ORIENTATION = ${JSON.stringify(digest)} as const;
`;
}

/** Generates the module from the repo's canonical and writes it. */
export async function generateContentModule(repoRoot: string): Promise<Result<string, string>> {
  const module = await renderFromRepo(repoRoot);
  if (isErr(module)) {
    return module;
  }
  const outputPath = join(repoRoot, GENERATED_MODULE_PATH);
  await writeFile(outputPath, module.value, 'utf8');
  return ok(outputPath);
}

/** Regenerates in memory and reports drift against the committed module. */
export async function checkContentModule(
  repoRoot: string,
): Promise<{ readonly ok: boolean; readonly detail: string }> {
  const expected = await renderFromRepo(repoRoot);
  if (isErr(expected)) {
    return { ok: false, detail: expected.error };
  }
  const outputPath = join(repoRoot, GENERATED_MODULE_PATH);
  const actual = await readFileOrUndefined(outputPath);
  if (actual === undefined) {
    return { ok: false, detail: `Missing generated module: ${GENERATED_MODULE_PATH}` };
  }
  if (actual !== expected.value) {
    return { ok: false, detail: `Generated module is stale: ${GENERATED_MODULE_PATH}` };
  }
  return { ok: true, detail: 'Under-the-hood content module is up to date.' };
}

async function renderFromRepo(repoRoot: string): Promise<Result<string, string>> {
  const canonical = await readFileOrUndefined(join(repoRoot, CANONICAL_SKILL_PATH));
  if (canonical === undefined) {
    return err(`Cannot read canonical skill: ${CANONICAL_SKILL_PATH}`);
  }
  const digest = buildDigest(canonical);
  if (isErr(digest)) {
    return digest;
  }
  return ok(renderGeneratedModule(digest.value));
}

async function readFileOrUndefined(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return undefined;
  }
}
