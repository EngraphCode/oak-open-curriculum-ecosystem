/**
 * Platform names used by reviewer-adapter parity checks.
 */
export type ReviewerAdapterPlatform = 'cursor' | 'claude-code' | 'codex';

/**
 * Explicit reviewer roles whose supported platforms differ from the default
 * cross-platform contract.
 */
const PLATFORM_SPECIFIC_REVIEWER_SUPPORT: ReadonlyMap<
  string,
  ReadonlySet<ReviewerAdapterPlatform>
> = new Map([
  ['cricket-judgement-high', new Set<ReviewerAdapterPlatform>(['cursor', 'claude-code'])],
]);

/**
 * Reports whether a reviewer adapter belongs on a platform.
 *
 * Reviewer roles are cross-platform by default. Entries in the explicit
 * support map narrow that default for roles whose runtime panels genuinely
 * differ, such as Cricket's Claude-and-Cursor-only high-judgement seat.
 *
 * @param reviewerName - Reviewer adapter basename without its extension.
 * @param platform - Platform surface being checked.
 * @returns `true` when the adapter is supported on that platform.
 */
export function isReviewerAdapterSupportedOnPlatform(
  reviewerName: string,
  platform: ReviewerAdapterPlatform,
): boolean {
  const supportedPlatforms = PLATFORM_SPECIFIC_REVIEWER_SUPPORT.get(reviewerName);
  return supportedPlatforms?.has(platform) ?? true;
}
