/**
 * Drift-guard anchor for the curated behaviour projection (WS-B, D1).
 *
 * The curated `EXPLAIN_BEHAVIOUR_SHELL` is hand-authored, so single-sourcing
 * against the canonical cannot be a code dependency — it must be a TESTED
 * relationship (Director-ratified, 2026-06-24). This module fingerprints the
 * canonical's behaviour-contract sections; the drift-guard test asserts the live
 * fingerprint equals `EXPECTED_CANONICAL_BEHAVIOUR_FINGERPRINT`. When the canonical's
 * behaviour sections change, the fingerprint diverges and the test FAILS, forcing a
 * deliberate re-curation of the shell and a re-pin of the expected value here.
 *
 * This is "single-sourcing preserved" made concrete (PDR-112 / ADR-202): the
 * canonical stays the behaviour SSOT; the projection can only drift loudly.
 *
 * @see src/explain/behaviour-shell.ts — the curated projection this anchors
 * @see .agent/skills/explain/SKILL-CANONICAL.md — the behaviour SSOT
 */

import { createHash } from 'node:crypto';

/**
 * The canonical level-2 section headings whose content defines the behaviour
 * contract this projection covers (prefix match, case-insensitive). Changing the
 * canonical's wording in any of these trips the drift-guard.
 */
const CANONICAL_BEHAVIOUR_HEADINGS: readonly string[] = [
  'the front door',
  'the three delivery modes',
  'honesty invariants',
  'access-aware fork',
];

/**
 * Deterministic fingerprint of the canonical's behaviour-contract sections.
 * Extracts the level-2 blocks whose heading matches `CANONICAL_BEHAVIOUR_HEADINGS`,
 * normalises whitespace, and SHA-256s the concatenation.
 */
export function fingerprintCanonicalBehaviour(canonical: string): string {
  const lines = canonical.split('\n');
  const blocks: string[] = [];
  let current: string[] | undefined;
  for (const line of lines) {
    if (line.startsWith('## ')) {
      const heading = line.slice(3).trim().toLowerCase();
      const matches = CANONICAL_BEHAVIOUR_HEADINGS.some((h) => heading.startsWith(h));
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
  const normalised = blocks.join('\n\n').replace(/\s+/g, ' ').trim();
  return createHash('sha256').update(normalised, 'utf-8').digest('hex');
}

/**
 * The canonical-behaviour fingerprint the curated `EXPLAIN_BEHAVIOUR_SHELL` was
 * last reviewed against. Re-pin this (and re-review the shell) when the drift-guard
 * fails: run `fingerprintCanonicalBehaviour` over the current canonical and replace
 * the value here. The generation step asserts the live fingerprint equals this.
 */
export const EXPECTED_CANONICAL_BEHAVIOUR_FINGERPRINT =
  '26466bf209669b0c67b3036cffe1cb1a0f4f6dd4a2315d60de78364b5219a4b3';
