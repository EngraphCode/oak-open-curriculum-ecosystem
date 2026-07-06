import { resolve } from 'node:path';

import { assertPathWithinBase, type AssertPathWithinBaseOptions } from '@oaknational/safe-path';

import type { CorroborationClaim } from '../real-world-signal.js';

/**
 * Resolve which claimed corroboration homes genuinely exist on disk, anchored at the
 * repo root.
 *
 * @remarks
 * The meta stage claims repo-relative home paths (e.g. `.agent/rules/x.md`). Checking
 * them with a bare `existsSync` resolves against the process working directory — the
 * agent-tools workspace under the documented driver usage — so every real home reads
 * as missing. This helper anchors each claim at the supplied repo root instead, via
 * `assertPathWithinBase` exactly as the driver's checkpoint reads do (tssecurity:S8707
 * lineage): success proves the path both EXISTS (`realpathSync` throws on an absent
 * path) and stays CONTAINED within the repo root, so a claim that is absent or that
 * escapes the root is simply not corroborating — a discrepancy the caller surfaces,
 * never a crash.
 *
 * The returned set carries each claim's ORIGINAL path string, so downstream
 * set-membership against the claims themselves (`corroborateAgainstHomes`) matches.
 * Existence is canonicalisation-level: any on-disk entry (file or directory) counts,
 * matching the `existsSync` behaviour this replaces; claims are pipeline-internal
 * document paths from a committed, zod-validated checkpoint.
 *
 * @param input - The corroboration claims and the repo root to anchor them at.
 * @param options - The safe-path canonicalisation seam; tests inject a pure map.
 * @returns The claimed home paths that exist on disk within the repo root.
 */
export function existingClaimedHomePaths(
  input: {
    readonly claims: readonly CorroborationClaim[];
    readonly repoRoot: string;
  },
  options: AssertPathWithinBaseOptions = {},
): ReadonlySet<string> {
  const existing = new Set<string>();
  for (const claim of input.claims) {
    for (const home of claim.claimedHomePaths) {
      if (claimedHomeExists({ home, repoRoot: input.repoRoot }, options)) {
        existing.add(home);
      }
    }
  }
  return existing;
}

function claimedHomeExists(
  input: { readonly home: string; readonly repoRoot: string },
  options: AssertPathWithinBaseOptions,
): boolean {
  try {
    assertPathWithinBase(resolve(input.repoRoot, input.home), input.repoRoot, options);
    return true;
  } catch {
    // Absent on disk or escaping the repo root — either way the claim is not
    // corroborating; the caller reports it as a missing claim.
    return false;
  }
}
