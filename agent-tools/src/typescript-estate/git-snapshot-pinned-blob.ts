import type { GitContext, PinnedBlobReadPort } from './git-snapshot-model.js';
import { runGit } from './git-snapshot-process.js';

/**
 * Commit-bound real Git adapter for {@link PinnedBlobReadPort}.
 *
 * Its only read is a structured `git show <commit>:<path>` invocation — the
 * ref and path travel as separate argv elements, never through a shell — so
 * every byte it returns comes from the pinned commit's object database and
 * can never observe the working tree or a lazy network fetch (the Git
 * environment is already scrubbed with `GIT_NO_LAZY_FETCH` by the process
 * layer). Throws inside the process port surface as `SOURCE_READ_FAILED`
 * results via `runGit`'s single translation boundary.
 */
export function createPinnedGitBlobPort(context: GitContext, commit: string): PinnedBlobReadPort {
  return {
    read: (path, maxBytes) =>
      runGit(
        context,
        ['-C', context.root, 'show', `${commit}:${path}`],
        maxBytes,
        'SOURCE_READ_FAILED',
        `Git auxiliary blob read '${path}'`,
      ),
  };
}
