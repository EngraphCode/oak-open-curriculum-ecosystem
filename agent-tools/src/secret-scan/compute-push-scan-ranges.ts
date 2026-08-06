/**
 * Compute the gitleaks `--log-opts` ranges to scan for a git push.
 *
 * A git `pre-push` hook receives, on stdin, one line per pushed ref in the form
 * `<local_ref> <local_sha> <remote_ref> <remote_sha>`, and the destination
 * remote name as its first argument. This module turns that input into the set
 * of rev ranges gitleaks should scan — only the commits actually being pushed,
 * never the whole history (which grew to minutes as large blobs accumulated).
 *
 * It is a pure function (string input → range strings, no IO) so the range
 * logic is unit-tested directly; the thin `run-push-secret-scan.ts` CLI reads
 * the real inputs and runs gitleaks over the ranges it returns.
 */

/**
 * An all-zero object id marks an absent ref end: a zero `local_sha` is a ref
 * deletion, a zero `remote_sha` is a ref that does not yet exist on the remote.
 * Matched by shape (any length) so it holds for SHA-1 and SHA-256 repositories.
 */
const isZeroObjectId = (objectId: string): boolean => /^0+$/.test(objectId);

/**
 * The UNSCOPED exclusion set — "not reachable from any remote-tracking ref".
 * Every incremental range is scoped to one destination remote
 * (`--not --remotes=<name>`); this bare form is the fallback, and it walks a
 * superset of history whose size is bounded by nothing.
 */
const UNSCOPED_EXCLUSION = '--not --remotes';

export interface ComputePushScanRangesInput {
  /**
   * Raw `pre-push` stdin: newline-separated
   * `<local_ref> <local_sha> <remote_ref> <remote_sha>` lines. Empty when the
   * hook is invoked manually with no ref lines supplied by git.
   */
  refsText: string;
  /**
   * The push destination's remote name (the hook's first argument). Empty for a
   * push to a bare URL, where there are no remote-tracking refs to scope against.
   */
  remoteName: string;
}

/**
 * @returns one gitleaks `--log-opts` range string per scan to run. An empty
 * array means "scan nothing" — e.g. a push that only deletes refs.
 */
export function computePushScanRanges({
  refsText,
  remoteName,
}: ComputePushScanRangesInput): string[] {
  const refLines = refsText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // No ref lines at all: a manual/unusual invocation git supplied nothing for.
  // Fall back to scanning local commits not yet on any remote. A push that
  // supplies ref lines but scans nothing (all deletions) must NOT reach here.
  if (refLines.length === 0) {
    return [`HEAD ${UNSCOPED_EXCLUSION}`];
  }

  // Exclude commits already on the DESTINATION remote, scoped by its name, so a
  // first push of existing commits to a *second* remote still scans them. Fall
  // back to all remotes when the destination is an unnamed URL.
  const notAlreadyPushed = remoteName ? `--not --remotes=${remoteName}` : UNSCOPED_EXCLUSION;

  const ranges: string[] = [];
  for (const refLine of refLines) {
    const [, localSha, , remoteSha] = refLine.split(/\s+/);
    if (localSha === undefined || remoteSha === undefined) {
      // Not a well-formed ref line; skip rather than fabricate a scan range.
      continue;
    }
    if (isZeroObjectId(localSha)) {
      // Ref deletion: nothing is being pushed for this ref.
      continue;
    }
    ranges.push(
      isZeroObjectId(remoteSha)
        ? `${localSha} ${notAlreadyPushed}` // new ref on this remote
        : `${remoteSha}..${localSha}`, // ref update — only the new commits
    );
  }
  return ranges;
}

/**
 * The loud half of the degradation (R6): this scan exists to walk only the
 * commits being pushed, and two inputs cost it that guarantee — a destination
 * given as a bare URL (no remote name, so no remote-tracking refs to scope
 * against) and a run git supplied no ref lines for. Either way the walk widens
 * to a full-history superset, correct but unbounded: measured at 5,009 commits
 * on this repository, with nothing on either stream to say so.
 *
 * Derived from the ranges the caller is ACTUALLY about to scan, never from a
 * second reading of the inputs: a parallel re-derivation is free to drift out
 * of agreement with the thing it describes.
 *
 * @returns the warning to surface, or undefined when every range stayed
 * incremental.
 */
export function degradedScanWarning(
  ranges: readonly string[],
  { remoteName }: ComputePushScanRangesInput,
): string | undefined {
  if (!ranges.some((range) => range.endsWith(UNSCOPED_EXCLUSION))) {
    return undefined;
  }
  const cause =
    remoteName === ''
      ? 'the push destination is a bare URL, so there is no named remote whose tracking refs could bound the scan'
      : 'git supplied no ref lines, so there is no pushed range to scan';
  return (
    `secret scan: DEGRADED — scanning full history, not just the pushed commits.\n` +
    `  Cause: ${cause}.\n` +
    `  Effect: the walk covers every commit not reachable from any remote (thousands, ` +
    `not tens) and takes correspondingly longer. Results stay correct.\n` +
    `  Fix: push to a NAMED remote (git remote add / git push <name>) to restore the ` +
    `incremental range.\n`
  );
}
