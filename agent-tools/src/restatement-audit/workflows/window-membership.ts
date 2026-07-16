/**
 * Evidence-integrity screen for the map stage: a finder may only report files from its
 * OWN window. A hallucinated or prompt-injected path would otherwise enter the join and
 * voting stages as corpus evidence; the meta stage's byte-verify is only a partial
 * backstop (a real file outside the window byte-verifies). A window that reports any
 * alien path is failed WHOLE and loudly — its extraction is untrustworthy and the
 * window is re-runnable via the normal incomplete-window resume path.
 *
 * Pure and sandbox-safe (type-only imports); regression pins live beside it.
 *
 * @packageDocumentation
 */

import type { PartitionWindow } from './stage-io.js';

interface MembershipViolation {
  readonly window: string;
  readonly alienFiles: readonly string[];
}

export interface MembershipScreen<T> {
  /** Positionally aligned with the input: violating windows become null (failed). */
  readonly screened: readonly (T | null)[];
  readonly violations: readonly MembershipViolation[];
}

/** Screen every window's result; null results pass through (already dead). */
export function screenWindowMembership<
  T extends { readonly instances: readonly { readonly file: string }[] },
>(windows: readonly PartitionWindow[], results: readonly (T | null)[]): MembershipScreen<T> {
  const violations: MembershipViolation[] = [];
  const screened = windows.map((w, index) => {
    const result = results[index] ?? null;
    if (result === null) {
      return null;
    }
    const allowed = new Set(w.files);
    const alienFiles = [
      ...new Set(
        result.instances
          .filter((instance) => !allowed.has(instance.file))
          .map((instance) => instance.file),
      ),
    ];
    if (alienFiles.length > 0) {
      violations.push({ window: w.window, alienFiles });
      return null;
    }
    return result;
  });
  return { screened, violations };
}
