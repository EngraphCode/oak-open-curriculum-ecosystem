import { createHash } from 'node:crypto';
import type { CurrentItemEvidenceTarget, TokenAnchor } from './current-source-model.js';

const TOKEN_PATTERN = /[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu;
const WORD_TOKEN_PATTERN = /[\p{L}\p{N}_]/u;

/** Tokenises content without making source formatting part of item identity. */
function tokenizeItemEvidence(content: string): readonly string[] {
  return (
    content
      .normalize('NFC')
      .replaceAll(/\\(?=[`'"])/g, '')
      .match(TOKEN_PATTERN) ?? []
  );
}

function tokenHash(tokens: readonly string[]): string {
  return createHash('sha256').update(tokens.join('\u0000')).digest('hex');
}

function chooseIndexToken(
  anchorTokens: readonly string[],
  targetTokens: readonly string[],
): { readonly indexToken: string; readonly indexOffset: number } {
  const frequency = new Map<string, number>();
  for (const token of targetTokens) {
    frequency.set(token, (frequency.get(token) ?? 0) + 1);
  }
  const candidates = anchorTokens
    .map((token, indexOffset) => ({
      indexToken: token,
      indexOffset,
      frequency: frequency.get(token) ?? 0,
      isWord: WORD_TOKEN_PATTERN.test(token),
    }))
    .filter((candidate) => candidate.frequency > 0)
    .sort(
      (left, right) =>
        Number(right.isWord) - Number(left.isWord) ||
        left.frequency - right.frequency ||
        right.indexToken.length - left.indexToken.length ||
        left.indexOffset - right.indexOffset,
    );
  const selected = candidates[0];
  if (selected === undefined) {
    throw new Error('Item anchor has no token present in its target source');
  }
  return { indexToken: selected.indexToken, indexOffset: selected.indexOffset };
}

/** Builds a compact, movable item anchor from reviewed source text. */
export function buildTokenAnchor(anchorContent: string, targetContent: string): TokenAnchor {
  const anchorTokens = tokenizeItemEvidence(anchorContent);
  if (anchorTokens.length === 0) {
    throw new Error('Item anchor content must contain at least one token');
  }
  const targetTokens = tokenizeItemEvidence(targetContent);
  const index = chooseIndexToken(anchorTokens, targetTokens);
  const anchor: TokenAnchor = {
    tokenCount: anchorTokens.length,
    tokenSha256: tokenHash(anchorTokens),
    ...index,
  };
  if (!tokenAnchorIsPresent(anchor, targetTokens)) {
    throw new Error('Item anchor content is not present in its target source');
  }
  return anchor;
}

function tokenAnchorIsPresent(anchor: TokenAnchor, targetTokens: readonly string[]): boolean {
  return tokenAnchorMatchStarts(anchor, targetTokens).length > 0;
}

function tokenAnchorMatchStarts(
  anchor: TokenAnchor,
  targetTokens: readonly string[],
): readonly number[] {
  const starts: number[] = [];
  for (let index = 0; index < targetTokens.length; index += 1) {
    if (targetTokens[index] !== anchor.indexToken) {
      continue;
    }
    const start = index - anchor.indexOffset;
    if (start < 0 || start + anchor.tokenCount > targetTokens.length) {
      continue;
    }
    const candidate = targetTokens.slice(start, start + anchor.tokenCount);
    if (tokenHash(candidate) === anchor.tokenSha256) {
      starts.push(start);
    }
  }
  return starts;
}

function anchorsHaveDistinctMatches(
  anchors: readonly TokenAnchor[],
  targetTokens: readonly string[],
): boolean {
  const candidatesByAnchor = anchors.map((anchor) => tokenAnchorMatchStarts(anchor, targetTokens));
  const anchorByMatchedStart = new Map<number, number>();

  const assignDistinctStart = (anchorIndex: number, visitedStarts: Set<number>): boolean => {
    const candidates = candidatesByAnchor[anchorIndex] ?? [];
    for (const start of candidates) {
      if (visitedStarts.has(start)) {
        continue;
      }
      visitedStarts.add(start);
      const displacedAnchor = anchorByMatchedStart.get(start);
      if (displacedAnchor === undefined || assignDistinctStart(displacedAnchor, visitedStarts)) {
        anchorByMatchedStart.set(start, anchorIndex);
        return true;
      }
    }
    return false;
  };

  return anchors.every((_, anchorIndex) => assignDistinctStart(anchorIndex, new Set()));
}

/** Requires reviewed anchors to retain distinct occurrences in one payload. */
export function requireTokenAnchorsPresent(
  label: string,
  anchors: readonly TokenAnchor[],
  content: string,
  location?: string,
): void {
  if (anchors.length === 0 || !anchorsHaveDistinctMatches(anchors, tokenizeItemEvidence(content))) {
    const locationSuffix = location === undefined ? '' : ` in ${location}`;
    throw new Error(`${label} anchors lack distinct occurrences${locationSuffix}`);
  }
}

/** Requires every reviewed anchor for one audit item to remain present. */
export function requireItemEvidenceTargets(
  auditId: string,
  targets: readonly CurrentItemEvidenceTarget[],
  contentByFile: ReadonlyMap<string, string>,
): void {
  if (targets.length === 0) {
    throw new Error(`Current audit item ${auditId} has no evidence targets`);
  }
  for (const target of targets) {
    const content = contentByFile.get(target.file);
    if (content === undefined) {
      throw new Error(`Current audit item ${auditId} evidence file is absent: ${target.file}`);
    }
    if (target.anchors.length === 0) {
      throw new Error(`Current audit item ${auditId} has no anchors for ${target.file}`);
    }
    requireTokenAnchorsPresent(
      `Current audit item ${auditId}`,
      target.anchors,
      content,
      target.file,
    );
  }
}
