import { join } from 'node:path';

import { optional, type Options } from './cli-options.js';
import { resolveCoordinationHomeForOptions } from './cli-coordination-home.js';
import { type CliHandler } from './cli-spec-factory.js';
import { type CliRuntime } from './cli-runtime.js';

/** Active-claims registry path relative to the coordination home. */
const ACTIVE_CLAIMS_REL = '.agent/state/collaboration/active-claims.json';

/**
 * Resolve the active-claims path for a `claims` command (F-85).
 *
 * An explicit `--active` is honoured verbatim. Otherwise the path defaults to
 * the shared coordination home's `active-claims.json` — the SAME primary
 * checkout the `comms` commands resolve via
 * {@link resolveCoordinationHomeForOptions} — so a worktree-isolated agent's
 * claims stay visible to the team without per-call ceremony (the F-41
 * fragmentation failure mode, but for claims rather than comms). `--repo-root`
 * is the explicit home override.
 *
 * Resolution is lazy: the injected coordination-home resolver is called only
 * when neither `--active` nor `--repo-root` is supplied, so an explicit path
 * never pays for a git invocation.
 */
export function resolveActivePath(options: Options, runtime: CliRuntime): string {
  const explicit = optional(options, 'active');
  if (explicit !== undefined) {
    return explicit;
  }
  return join(resolveCoordinationHomeForOptions(options, runtime), ACTIVE_CLAIMS_REL);
}

/**
 * Return a copy of `options` whose `active` value is resolved per
 * {@link resolveActivePath}, leaving every other field untouched. Wrapping a
 * `claims` handler with this lets the handler body keep reading
 * `required(options, 'active')` unchanged while gaining the coordination-home
 * default.
 */
export function withActiveDefault(options: Options, runtime: CliRuntime): Options {
  const values = new Map(options.values);
  values.set('active', resolveActivePath(options, runtime));
  return { ...options, values };
}

/**
 * Wrap a `claims` {@link CliHandler} so an omitted `--active` defaults to the
 * coordination home before the handler runs (F-85). This mirrors the
 * default-resolution boundary in `cli-comms-send.ts` / `cli-comms-validate.ts`:
 * the default is applied once at spec-wiring time from the invocation cwd on
 * `CliRuntime`, so each handler body stays unchanged and tests can inject the
 * primary-home resolver.
 */
export function withResolvedActive(handler: CliHandler): CliHandler {
  return (options, env, runtime) => handler(withActiveDefault(options, runtime), env, runtime);
}
