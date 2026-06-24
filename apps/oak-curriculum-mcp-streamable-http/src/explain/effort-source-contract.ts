/**
 * Drift-guard anchor for the curated effort-overview projection (WS-B, D2).
 *
 * The curated `EXPLAIN_EFFORT_OVERVIEW` is hand-authored, so single-sourcing against the
 * README/VISION effort prose cannot be a code dependency — it must be a TESTED relationship
 * (Director-ratified Option A, 2026-06-24). This module fingerprints the README's
 * effort-relevant sections plus the VISION body; the generation step asserts the live
 * fingerprint equals `EXPECTED_EFFORT_SOURCE_FINGERPRINT`. When the source effort prose
 * changes, the fingerprint diverges and the build FAILS, forcing a deliberate re-curation of
 * the constant and a re-pin of the expected value here.
 *
 * This is the same pattern the behaviour half uses (canonical-behaviour-contract.ts): the
 * README/VISION stay the effort SSOT; the projection can only drift loudly (PDR-112 /
 * ADR-202). It anchors the source content, not the curated wording — a curated constant
 * deliberately reads differently from its source; what must not change silently is the
 * SOURCE the curation was reviewed against.
 *
 * @see src/explain/effort-overview.ts — the curated projection this anchors
 * @see README.md / VISION.md — the effort-content SSOT
 */

import { createHash } from 'node:crypto';

/**
 * README level-2 section headings whose content is the effort source for the curated
 * overview (prefix match, case-insensitive). Changing any of these in the README trips the
 * drift-guard. The curriculum-structure subsections inside them are NOT separately
 * fingerprinted — the whole section text is hashed, so any change (including to those
 * subsections) is caught; the curation is what holds the curriculum firewall, the
 * drift-guard only ensures the curation is re-reviewed when the source moves.
 */
const README_EFFORT_HEADINGS: readonly string[] = [
  'what this repo provides',
  'engineering practice',
];

/** README level-2 blocks whose heading matches the effort allow-list, concatenated. */
function readmeEffortSections(readme: string): string {
  const lines = readme.split('\n');
  const blocks: string[] = [];
  let current: string[] | undefined;
  for (const line of lines) {
    if (line.startsWith('## ')) {
      const heading = line.slice(3).trim().toLowerCase();
      const matches = README_EFFORT_HEADINGS.some((h) => heading.startsWith(h));
      if (current) {
        blocks.push(current.join('\n'));
        current = undefined;
      }
      if (matches) {
        current = [line];
      }
    } else if (current) {
      current.push(line);
    }
  }
  if (current) {
    blocks.push(current.join('\n'));
  }
  return blocks.join('\n\n');
}

/** The VISION body — frontmatter and the H1 title stripped. */
function visionBody(vision: string): string {
  let md = vision;
  if (md.startsWith('---')) {
    const end = md.indexOf('\n---', 3);
    if (end !== -1) {
      const after = md.indexOf('\n', end + 1);
      md = after === -1 ? '' : md.slice(after + 1);
    }
  }
  return md.replace(/^#\s+.*$/m, '').trim();
}

/**
 * Deterministic fingerprint of the effort source: the README effort sections plus the
 * VISION body, whitespace-normalised, SHA-256.
 */
export function fingerprintEffortSource(readme: string, vision: string): string {
  const normalised = [readmeEffortSections(readme), visionBody(vision)]
    .join('\n\n')
    .replace(/\s+/g, ' ')
    .trim();
  return createHash('sha256').update(normalised, 'utf-8').digest('hex');
}

/**
 * The effort-source fingerprint the curated `EXPLAIN_EFFORT_OVERVIEW` was last reviewed
 * against. Re-pin this (and re-review the constant) when the drift-guard fails: run
 * `fingerprintEffortSource` over the current README/VISION and replace the value here. The
 * generation step asserts the live fingerprint equals this.
 */
export const EXPECTED_EFFORT_SOURCE_FINGERPRINT =
  'c125dd58b882f6a26c882654fddbd9f9539ef3f2d764ded22e5518b59852db1e';
