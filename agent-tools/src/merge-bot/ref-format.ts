import { spawnSync } from 'node:child_process';

import { resolveTrustedGit } from '../core/trusted-git.js';

/**
 * Ref-name legality, asked of the system that OWNS it.
 *
 * git publishes `git check-ref-format` for exactly this question, and its
 * grammar is not summarisable: the rules interact per slash-separated
 * component, so a regex written from the prose admits shapes git rejects —
 * `foo.`, `foo//bar`, `foo/.bar`, `foo.lock/bar` all pass a plausible
 * hand grammar and all fail the oracle. Asking the oracle at time of use
 * (R9) means this file never has to track git's grammar; a git upgrade that
 * changes it changes this answer with no code change here.
 *
 * The oracle's output volume is fixed by git's own contract — nothing on
 * success, one diagnostic line on failure — so this is a controlled-output
 * child and `spawnSync`'s default buffer is a fact about it, not an
 * unexamined seam (R1 binds output the tool does NOT control).
 */

/** The legality question as a seam, so callers can pin behaviour without a git binary. */
export type RefFormatOracle = (fullRefName: string) => boolean;

/**
 * git's own answer. The name is passed as a FULL ref (`refs/heads/<branch>`)
 * because that is the form `git-check-ref-format` documents its rules
 * against; `--branch` is a different question (it also expands `@{-1}`-style
 * shorthand against a repository, which a name being validated must not get).
 */
export function realRefFormatOracle(): RefFormatOracle {
  return (fullRefName) => {
    const result = spawnSync(resolveTrustedGit(), ['check-ref-format', fullRefName], {
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    return result.error === undefined && result.status === 0;
  };
}

/** Whether `branch` is a legal branch name, per git. */
export function isLegalBranchName(branch: string, oracle: RefFormatOracle): boolean {
  return oracle(`refs/heads/${branch}`);
}
