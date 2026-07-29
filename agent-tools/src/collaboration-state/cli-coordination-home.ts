import { err, ok, unwrapOrThrow, type Result } from '@oaknational/result';

import { optional, type Options } from './cli-options.js';
import { type CliRuntime, type CoordinationHomeResolver } from './cli-runtime.js';

interface CoordinationHomeRuntime {
  readonly cwd: string;
  readonly resolveCoordinationHome: CoordinationHomeResolver;
}

/**
 * Resolve the shared coordination home for a CLI invocation.
 *
 * `--repo-root` wins without consulting git. Otherwise the resolver runs from
 * the invocation cwd at call time, so a linked worktree reaches the primary
 * checkout rather than a worktree-local decoy. Both seams live on `CliRuntime`
 * to keep command tests hermetic.
 */
export function resolveCoordinationHomeForOptions(options: Options, runtime: CliRuntime): string {
  const explicit = optional(options, 'repo-root');
  if (explicit !== undefined) {
    return explicit;
  }

  const injected = unwrapOrThrow(requireCoordinationHomeRuntime(runtime));
  return injected.resolveCoordinationHome(injected.cwd);
}

function requireCoordinationHomeRuntime(
  runtime: CliRuntime,
): Result<CoordinationHomeRuntime, Error> {
  if (runtime.cwd === undefined) {
    return err(new Error('coordination-home cwd must be provided by the composition layer'));
  }
  if (runtime.resolveCoordinationHome === undefined) {
    return err(new Error('coordination-home resolver must be provided by the composition layer'));
  }
  return ok({
    cwd: runtime.cwd,
    resolveCoordinationHome: runtime.resolveCoordinationHome,
  });
}
