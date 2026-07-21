/**
 * Filesystem adapter for the owner-jobs register.
 *
 * @remarks
 * The impure half of the owner-attention indicator: reads the register from
 * the primary checkout and resolves the pure module's count and link. Split
 * from `statusline-identity.ts` so the orchestrator stays within its size
 * budget and `statusline-owner-jobs.ts` stays IO-free.
 *
 * @packageDocumentation
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { countOpenOwnerJobs, parseOwnerJobsLink } from './statusline-owner-jobs.js';

/** The register's open count and link URL, both absent-tolerant. */
export interface OwnerJobsParts {
  readonly ownerJobsOpen: number | undefined;
  readonly ownerJobsLink: string | undefined;
}

const ABSENT: OwnerJobsParts = { ownerJobsOpen: undefined, ownerJobsLink: undefined };

/**
 * Read the owner-jobs register from the primary checkout. Absence and
 * unreadability both resolve to the absent shape (no register, no bell) —
 * the register is untracked-by-design, so a fresh clone simply has none
 * until an agent renders one.
 */
export function gatherOwnerJobs(primaryRoot: string | undefined): OwnerJobsParts {
  if (primaryRoot === undefined) {
    return ABSENT;
  }
  const registerPath = join(primaryRoot, '.agent/state/collaboration/owner-jobs.md');
  if (!existsSync(registerPath)) {
    return ABSENT;
  }
  try {
    const content = readFileSync(registerPath, 'utf8');
    return {
      ownerJobsOpen: countOpenOwnerJobs(content),
      ownerJobsLink: parseOwnerJobsLink(content),
    };
  } catch {
    return ABSENT;
  }
}
