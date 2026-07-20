/**
 * Fresh-checkout seeding support for the untracked-by-design collaboration
 * state files (ADR-199 / PDR-094). These files exist on no fresh checkout or
 * new worktree, so the first CLI read meets ENOENT; the readers convert that
 * into an actionable error carrying the exact seed content below. Absence is
 * never silently treated as empty — a wrong path would masquerade as "no
 * claims" (the F-41 decoy-path failure class).
 */

/**
 * The minimal valid active-claims registry content. Offered verbatim in the
 * missing-registry error so a fresh checkout can seed the file without
 * reverse-engineering the parser's expectations.
 */
export const EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON =
  '{ "schema_version": "1.3.0", "claims": [], "commit_queue": [] }';

/**
 * The minimal valid closed-claims archive content, offered in the
 * missing-archive error for the same fresh-checkout seeding path.
 */
export const EMPTY_CLOSED_CLAIMS_ARCHIVE_JSON = '{ "schema_version": "1.3.0", "claims": [] }';

/**
 * Build the actionable missing-state-file error for a reader that met ENOENT.
 */
export function missingStateFileError(input: {
  readonly label: string;
  readonly path: string;
  readonly seedJson: string;
  readonly cause: unknown;
}): Error {
  return new Error(
    `${input.label} not found at ${input.path}. On a fresh checkout or new worktree this ` +
      `file is untracked-by-design (ADR-199 / PDR-094) and does not exist until seeded. ` +
      `Seed it with exactly this content, then re-run:\n${input.seedJson}`,
    { cause: input.cause },
  );
}
