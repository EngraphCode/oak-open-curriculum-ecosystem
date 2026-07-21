/**
 * Pure helpers for the Notion privacy fence (the mechanical layer).
 *
 * @remarks
 * The fence blocks two things from tracked content, per the corpus-reset
 * plan's S1.4 (owner directive 2026-07-21, "enforced rather than simply
 * promised"):
 *
 * 1. **Workspace-page hosts** — `app.notion.com` and `notion.so` URLs
 *    identify pages in Oak's (or anyone's) private Notion workspace; a
 *    public repository must not carry them. The public developer-docs
 *    host (`developers.notion.com`) is deliberately NOT fenced: it hosts
 *    Notion's public API documentation, not workspace content.
 * 2. **The fenced page ID** — matched via a stored SHA-256 so this
 *    fence's own config never carries the ID it fences. Any 32-hex token
 *    in tracked content is hashed and compared; only the fenced ID
 *    matches. This catches the ID even with the domain stripped.
 *
 * Content-similarity greps are explicitly NOT the mechanism: content
 * invariants cure by construction (strategy-derived material enters only
 * via owner-added documents) plus human review (CODEOWNERS) — the rule
 * file `.agent/rules/notion-strategy-page-fence.md` names all three
 * layers.
 *
 * @packageDocumentation
 */

import { createHash } from 'node:crypto';

/** Workspace-page hosts (never the public developer-docs host). */
const WORKSPACE_HOST = /\b(?:app\.notion\.com|(?:www\.)?notion\.so)\b/i;

/** A candidate Notion page ID: 32 contiguous lowercase hex characters. */
const PAGE_ID_TOKEN = /\b[0-9a-f]{32}\b/g;

/**
 * SHA-256 of the fenced strategy page's 32-hex ID. The raw ID never
 * appears in the repository — including here.
 */
export const FENCED_PAGE_ID_SHA256 =
  '0e50f667a95dfa0c2e4a9dc97e835999b6e85f56e57f2dac5558221a40e07baf';

/** One fence violation, line-anchored for the report. */
export interface FenceViolation {
  readonly path: string;
  readonly line: number;
  readonly reason: 'workspace-host' | 'fenced-page-id';
}

/**
 * Scan one tracked file's content for fence violations.
 *
 * @param path - Repo-relative path (report anchoring only).
 * @param content - The file's text content.
 * @param exemptPaths - Paths the fence does not scan: exactly the fence's
 *   own implementation and tests, which must name the blocked patterns to
 *   exist. The exemption list is caller-supplied and visible at the call
 *   site — never a hidden default.
 * @param fencedDigest - The SHA-256 the page-ID leg compares against.
 *   Defaults to the production constant; tests inject a digest of their
 *   own fixture token to exercise the positive path without the real ID
 *   ever entering the repository.
 */
export function scanForFenceViolations(
  path: string,
  content: string,
  exemptPaths: ReadonlySet<string>,
  fencedDigest: string = FENCED_PAGE_ID_SHA256,
): FenceViolation[] {
  if (exemptPaths.has(path)) {
    return [];
  }
  const violations: FenceViolation[] = [];
  content.split('\n').forEach((lineText, index) => {
    if (WORKSPACE_HOST.test(lineText)) {
      violations.push({ path, line: index + 1, reason: 'workspace-host' });
    }
    for (const match of lineText.matchAll(PAGE_ID_TOKEN)) {
      const digest = createHash('sha256').update(match[0]).digest('hex');
      if (digest === fencedDigest) {
        violations.push({ path, line: index + 1, reason: 'fenced-page-id' });
      }
    }
  });
  return violations;
}
