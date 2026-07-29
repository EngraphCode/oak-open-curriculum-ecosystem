import { join } from 'node:path';

import { optional, type Options } from './cli-options.js';
import { resolveCoordinationHomeForOptions } from './cli-coordination-home.js';
import { type CliHandler } from './cli-spec-factory.js';
import { type CliRuntime } from './cli-runtime.js';

/** Closed-claims archive path relative to the coordination home. */
const CLOSED_CLAIMS_REL = '.agent/state/collaboration/closed-claims.archive.json';

/**
 * Resolve the closed-claims archive path for a `claims` command (F-108).
 *
 * An explicit `--closed` is honoured verbatim. Otherwise the path defaults to
 * the shared coordination home's `closed-claims.archive.json` — the SAME
 * primary checkout `--active` resolves to — so a worktree-isolated agent's
 * `claims close` / `claims archive-stale` archive into the team's primary
 * checkout rather than a worktree-local file (the F-41 fragmentation failure
 * mode F-85 cured for `--active`, applied to the closed archive). `--repo-root`
 * is the explicit home override.
 *
 * Resolution is lazy: the injected coordination-home resolver is called only
 * when neither `--closed` nor `--repo-root` is supplied, so an explicit path
 * never pays for a git invocation.
 */
export function resolveClosedPath(options: Options, runtime: CliRuntime): string {
  const explicit = optional(options, 'closed');
  if (explicit !== undefined) {
    return explicit;
  }
  return join(resolveCoordinationHomeForOptions(options, runtime), CLOSED_CLAIMS_REL);
}

/**
 * Return a copy of `options` whose `closed` value is resolved per
 * {@link resolveClosedPath}, leaving every other field untouched. Wrapping a
 * `claims` handler with this lets the handler body keep reading
 * `required(options, 'closed')` unchanged while gaining the coordination-home
 * default.
 */
export function withClosedDefault(options: Options, runtime: CliRuntime): Options {
  const values = new Map(options.values);
  values.set('closed', resolveClosedPath(options, runtime));
  return { ...options, values };
}

/**
 * Wrap a `claims` {@link CliHandler} so an omitted `--closed` defaults to the
 * coordination home before the handler runs (F-108). Mirrors `withResolvedActive`
 * (F-85): the default is applied once at spec-wiring time from the invocation
 * cwd on `CliRuntime`, so each handler body keeps reading
 * `required(options, 'closed')` unchanged.
 *
 * Wired only on `claims close` / `claims archive-stale`, whose `--closed` is
 * REQUIRED — defaulting the path is pure ergonomics with no behaviour change.
 * Deliberately NOT wired on `claims active-agents`, whose `--closed` is OPTIONAL
 * and whose PRESENCE toggles closed-archive context in the output: defaulting it
 * there would change the command's default output, not merely resolve a path.
 */
export function withResolvedClosed(handler: CliHandler): CliHandler {
  return (options, env, runtime) => handler(withClosedDefault(options, runtime), env, runtime);
}
