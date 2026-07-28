/**
 * A reviewer-maintained disposition for one exact semantic state of a changed
 * governed source file.
 */
export interface CurrentSourceDeltaReview {
  readonly semanticSha256: string;
  readonly itemIds: readonly string[];
  readonly exclusionReason?: string;
}

export function reviewed(
  semanticSha256: string,
  itemIds: readonly string[],
): CurrentSourceDeltaReview {
  return { semanticSha256, itemIds };
}

export function excluded(
  semanticSha256: string,
  exclusionReason: string,
): CurrentSourceDeltaReview {
  return { semanticSha256, itemIds: [], exclusionReason };
}

export const IMPLEMENTATION_ONLY =
  'Reviewed engineering implementation change; no new authored agent-facing content.';
export const VALIDATION_ONLY =
  'Current-source validation machinery; this file does not reach an MCP consumer.';
export const TYPE_ONLY = 'Type-only change; no authored agent-facing content.';
export const TEST_ONLY = 'Test support only; this file does not reach an MCP consumer.';
export const UPSTREAM_BULK_ONLY =
  'Bulk ingestion schema contract only; this file is not exposed through the MCP app.';
export const DELETED_SOURCE =
  'Governed source deleted from the tree; the baseline-content hash is the tombstone and item lineage records each item retirement or relocation.';
