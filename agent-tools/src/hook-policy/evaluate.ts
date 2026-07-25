import { findBlockedPattern } from './blocked-patterns.js';
import {
  findAddedBlockedContent,
  findAddedScopedBlock,
  type ScopedBlockMatch,
} from './matchers.js';
import type { BlockedPatternEntry, RawBlockedPattern, ScopedContentBlockGroup } from './types.js';

/**
 * Platform-free canonical policy evaluation.
 *
 * Decisions carry domain evidence only — the matched entry, pattern, or
 * scoped match — and no host response shapes or reason copy. Rendering a
 * decision into a host's output contract is the caller's concern (today the
 * two Claude runners; the dispatcher's per-host renderers once they exist).
 *
 * @packageDocumentation
 */
export type PolicyDecision =
  | { readonly kind: 'allow' }
  | { readonly kind: 'deny-bash-pattern'; readonly entry: BlockedPatternEntry }
  | { readonly kind: 'deny-content-pattern'; readonly pattern: string }
  | { readonly kind: 'deny-scoped-block'; readonly match: ScopedBlockMatch };

/**
 * One content change with its prior content already resolved by the caller's
 * IO seam — evaluation is pure and never touches the filesystem.
 */
export interface ResolvedContentChange {
  readonly newContent: string;
  readonly priorContent: string;
  readonly filePath?: string | undefined;
}

/**
 * Evaluate one Bash command against the blocked-pattern section. The first
 * matching entry wins, in policy declaration order.
 */
export function evaluateBashCommand(
  command: string,
  blockedPatterns: readonly RawBlockedPattern[],
): PolicyDecision {
  const entry = findBlockedPattern(command, blockedPatterns);
  if (entry !== null) {
    return { kind: 'deny-bash-pattern', entry };
  }
  return { kind: 'allow' };
}

/**
 * Evaluate every resolved content change with two layers of detection per
 * change, in order: flat `blocked_patterns` first, then `scoped_blocks`.
 * Nesting is per change, not layer-major: the first deny on any change
 * short-circuits, and allow is returned only after every change is clean.
 */
export function evaluateContentChanges(
  changes: readonly ResolvedContentChange[],
  contentPatterns: readonly string[],
  scopedBlocks: readonly ScopedContentBlockGroup[],
): PolicyDecision {
  for (const { newContent, priorContent, filePath } of changes) {
    const pattern = findAddedBlockedContent(newContent, priorContent, contentPatterns);
    if (pattern !== null) {
      return { kind: 'deny-content-pattern', pattern };
    }

    const match = findAddedScopedBlock(newContent, priorContent, filePath, scopedBlocks);
    if (match !== null) {
      return { kind: 'deny-scoped-block', match };
    }
  }

  return { kind: 'allow' };
}
