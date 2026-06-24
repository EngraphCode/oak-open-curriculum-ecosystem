/**
 * Explain effort-orientation content transformer (WS-B, D1).
 *
 * Projects the explain lens onto a self-contained body for a remote MCP client
 * that has no repo filesystem. It bakes:
 *
 *   - the lens BEHAVIOUR SHELL — extracted from the explain SKILL-CANONICAL by an
 *     allowlist of section headings (Front Door / discernment, Three Delivery
 *     Modes, Honesty Invariants, Access-Aware Fork);
 *   - a stable EFFORT-OVERVIEW — extracted from README/VISION by an allowlist of
 *     effort sections, with curriculum-structure subsections denylisted out.
 *
 * Behind two firewalls (owner separation principle, 2026-06-24):
 *
 *   - curriculum DOMAIN firewall — extraction never pulls curriculum-structure
 *     sections (README "Data Sources", "MCP Server Capabilities", curriculum-guide
 *     prose); naming curriculum as what the effort SERVES is permitted.
 *   - volatility firewall — a genericisation pass removes every point-in-time
 *     status/lifecycle claim (alpha banner, "as of <month>", live counts,
 *     deployment URLs), not only the live progress report (which is never read).
 *
 * The firewalls are STRUCTURAL (allowlist + denylist) with the genericisation
 * pass and the D1.1 unit assertions as the backstop against stray claims inside
 * kept sections. Pure function; no IO, no global clock — `lastModified` is passed
 * in (the generation script derives it from the newest source-file commit date).
 *
 * @see embed-widget-html.ts — the sibling generation-step pattern
 * @see .agent/skills/explain/SKILL-CANONICAL.md — behaviour-shell SSOT
 */

export interface ExplainContentInputs {
  /** Raw text of `.agent/skills/explain/SKILL-CANONICAL.md`. */
  canonical: string;
  /** Raw text of repo-root `README.md`. */
  readme: string;
  /** Raw text of repo-root `VISION.md`. */
  vision: string;
  /** ISO-8601 datetime: the newest source-file commit date (never build/wall-clock). */
  lastModified: string;
}

interface Level2Block {
  /** Heading text without the leading `## `. */
  heading: string;
  /** The block including its `## ` heading line and all nested content. */
  text: string;
}

/** Behaviour-shell sections to keep from the canonical (prefix match, case-insensitive). */
const CANONICAL_ALLOW: readonly string[] = [
  'the front door',
  'the three delivery modes',
  'honesty invariants',
  'access-aware fork',
];

/** Effort sections to keep from the README (prefix match, case-insensitive). */
const README_ALLOW: readonly string[] = ['what this repo provides', 'engineering practice'];

/**
 * Level-3 subsections to strip from otherwise-kept sections — the curriculum
 * DOMAIN firewall at the structural level (these live under README "What This
 * Repo Provides" in the real document).
 */
const LEVEL3_DENY: readonly string[] = [
  'data sources',
  'mcp server capabilities',
  'sector reusable components',
];

/** Strip a leading YAML frontmatter block (`---` … `---`). */
function stripFrontmatter(md: string): string {
  if (!md.startsWith('---')) {
    return md;
  }
  const end = md.indexOf('\n---', 3);
  if (end === -1) {
    return md;
  }
  const after = md.indexOf('\n', end + 1);
  return after === -1 ? '' : md.slice(after + 1);
}

/** Split markdown into level-2 (`## `) blocks; pre-heading content is dropped. */
function splitLevel2Blocks(md: string): Level2Block[] {
  const lines = md.split('\n');
  const blocks: Level2Block[] = [];
  let current: { heading: string; lines: string[] } | undefined;
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current) {
        blocks.push({ heading: current.heading, text: current.lines.join('\n') });
      }
      current = { heading: line.slice(3).trim(), lines: [line] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) {
    blocks.push({ heading: current.heading, text: current.lines.join('\n') });
  }
  return blocks;
}

function headingMatches(heading: string, allow: readonly string[]): boolean {
  const h = heading.toLowerCase();
  return allow.some((a) => h.startsWith(a));
}

/** Remove denylisted level-3 (`### `) subsections from a block's text. */
function stripDeniedSubsections(blockText: string): string {
  const lines = blockText.split('\n');
  const kept: string[] = [];
  let skipping = false;
  for (const line of lines) {
    if (line.startsWith('### ')) {
      const sub = line.slice(4).trim().toLowerCase();
      skipping = LEVEL3_DENY.some((d) => sub.startsWith(d));
    }
    if (!skipping) {
      kept.push(line);
    }
  }
  return kept.join('\n');
}

function keepSections(md: string, allow: readonly string[], denyLevel3: boolean): string {
  return splitLevel2Blocks(md)
    .filter((b) => headingMatches(b.heading, allow))
    .map((b) => (denyLevel3 ? stripDeniedSubsections(b.text) : b.text))
    .join('\n\n');
}

/** Remove point-in-time status/lifecycle claims (volatility firewall). */
function genericiseVolatileClaims(text: string): string {
  return text
    .split('\n')
    .filter((line) => !/current status|invite-only alpha/i.test(line))
    .join('\n')
    .replace(/\bas of \w+ \d{4},?\s*/gi, '')
    .replace(/\b\d+\s+curriculum tools\b[^.]*/gi, 'curriculum tools')
    .replace(/`?[\w-]+\.oaknational\.dev`?/g, 'the Oak MCP server');
}

/** Final belt-and-braces strip of any line carrying filesystem / repo-path coupling. */
function stripFsCoupling(text: string): string {
  return text
    .split('\n')
    .filter(
      (line) =>
        !line.includes('file://') &&
        !line.includes('.agent/') &&
        !line.includes('README.md') &&
        !line.includes('VISION.md') &&
        !/read the (file|canonical|live doc)/i.test(line),
    )
    .join('\n');
}

/** Collapse 3+ blank lines to a single blank line. */
function tidyBlankLines(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Build the explain effort-orientation body for the MCP surfaces (tool / resource
 * / prompt all share it). Deterministic for a given set of inputs.
 */
export function transformExplainContent(inputs: ExplainContentInputs): string {
  const { canonical, readme, vision, lastModified } = inputs;

  const behaviourShell = keepSections(stripFrontmatter(canonical), CANONICAL_ALLOW, false);
  const effortFromReadme = keepSections(readme, README_ALLOW, true);
  const effortFromVision = stripFrontmatter(vision)
    .replace(/^#\s+.*$/m, '')
    .trim();

  const assembled = [
    '# Orienting someone to the Oak effort',
    '',
    `_Effort and ecosystem orientation — how Oak builds and delivers its curriculum. ` +
      `For assistants and integrators; this is a separate concern from curriculum content, ` +
      `which other tools serve. Source content last updated: ${lastModified}._`,
    '',
    '## How to orient (the approach)',
    '',
    behaviourShell,
    '',
    '## What the Oak effort is',
    '',
    effortFromReadme,
    '',
    effortFromVision,
  ].join('\n');

  return tidyBlankLines(stripFsCoupling(genericiseVolatileClaims(assembled)));
}
