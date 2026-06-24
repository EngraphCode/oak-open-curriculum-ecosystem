/**
 * Explain effort-orientation content transformer (WS-B, D1 — curated-projection shape).
 *
 * Assembles the body served by the explain MCP surfaces (tool / resource / prompt)
 * for a remote client with no repo filesystem, from two parts:
 *
 *   - the curated PORTABLE behaviour projection (`EXPLAIN_BEHAVIOUR_SHELL`) — authored
 *     clean, anchored to the canonical by the drift-guard (single-sourcing as a
 *     tested relationship; see canonical-behaviour-contract.ts). Verbatim extraction
 *     of the canonical's behaviour sections was abandoned: it baked in-repo
 *     live-routing and fs-coupling into a remote surface (Director verdict 2026-06-24).
 *   - the stable EFFORT-OVERVIEW — extracted from README/VISION effort sections,
 *     behind the curriculum and volatility firewalls.
 *
 * Firewalls applied to the assembled body (the curated shell is already clean):
 *   - curriculum DOMAIN firewall — README curriculum-structure subsections are
 *     denylisted out (Data Sources, MCP Server Capabilities); naming curriculum as
 *     what the effort SERVES is permitted, describing it is not.
 *   - volatility firewall — point-in-time status/lifecycle claims genericised
 *     (alpha banner, "as of <month>", live counts, deployment URLs).
 *   - fs-coupling — markdown doc-links delinkified (link text kept, path dropped) and
 *     any residual repo-path lines stripped, so the remote body references no filesystem.
 *
 * Pure function; no IO, no global clock — `lastModified` is passed in (the generation
 * script derives it from the newest source-file commit date).
 *
 * @see src/explain/behaviour-shell.ts — the curated behaviour projection
 * @see src/explain/canonical-behaviour-contract.ts — the drift-guard anchor
 */

import { EXPLAIN_BEHAVIOUR_SHELL } from './behaviour-shell.js';

export interface ExplainContentInputs {
  /** Raw text of repo-root `README.md`. */
  readme: string;
  /** Raw text of repo-root `VISION.md`. */
  vision: string;
  /** ISO-8601 datetime: the newest source-file commit date (never build/wall-clock). */
  lastModified: string;
}

interface Level2Block {
  heading: string;
  text: string;
}

/** Effort sections to keep from the README (prefix match, case-insensitive). */
const README_ALLOW: readonly string[] = ['what this repo provides', 'engineering practice'];

/** Curriculum-structure subsections to strip from kept README sections (domain firewall). */
const LEVEL3_DENY: readonly string[] = [
  'data sources',
  'mcp server capabilities',
  'sector reusable components',
];

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

function keepSections(md: string, allow: readonly string[]): string {
  return splitLevel2Blocks(md)
    .filter((b) => headingMatches(b.heading, allow))
    .map((b) => stripDeniedSubsections(b.text))
    .join('\n\n');
}

/** Convert markdown links `[text](target)` to plain `text` (remote has no filesystem). */
function delinkify(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
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

/** Strip any residual line carrying filesystem / repo-path coupling. */
function stripFsCoupling(text: string): string {
  return text
    .split('\n')
    .filter(
      (line) =>
        !line.includes('file://') &&
        !line.includes('.agent/') &&
        !line.includes('README.md') &&
        !line.includes('VISION.md') &&
        !/`[^`]*\/[^`]*`/.test(line) &&
        !/read the (file|canonical|live doc)/i.test(line),
    )
    .join('\n');
}

function tidyBlankLines(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Build the explain effort-orientation body. Deterministic for a given set of inputs.
 * The curated behaviour shell is prepended verbatim (authored clean); the
 * effort-overview is extracted from README/VISION and run through the firewalls.
 */
export function transformExplainContent(inputs: ExplainContentInputs): string {
  const { readme, vision, lastModified } = inputs;

  const effortFromReadme = keepSections(readme, README_ALLOW);
  const effortFromVision = stripFrontmatter(vision)
    .replace(/^#\s+.*$/m, '')
    .trim();

  const effortOverview = tidyBlankLines(
    stripFsCoupling(
      genericiseVolatileClaims(delinkify([effortFromReadme, effortFromVision].join('\n\n'))),
    ),
  );

  return [
    '# Orienting someone to the Oak effort',
    '',
    `_Effort and ecosystem orientation — how Oak builds and delivers its curriculum. ` +
      `For assistants and integrators; this is a separate concern from curriculum content, ` +
      `which other tools serve. Source content last updated: ${lastModified}._`,
    '',
    EXPLAIN_BEHAVIOUR_SHELL,
    '',
    '## What the Oak effort is',
    '',
    effortOverview,
  ].join('\n');
}
