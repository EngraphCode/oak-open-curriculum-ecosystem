import { err, ok, unwrapOrThrow, type Result } from '@oaknational/result';

import { resolveIdentity } from './cli-identity.js';
import { optional, type Options } from './cli-options.js';
import { deriveOverrideCollaborationIdentity } from './identity.js';
import { type CollaborationAgentIdWrite, type CollaborationStateEnvironment } from './types.js';

/**
 * A supplied `--session-prefix` must carry a non-empty trimmed value: the
 * prefix is the PDR-125 cross-estate join key, and an empty value writes a
 * wire-invalid identity (the watcher-heartbeat wire schema requires a
 * non-empty prefix) while blinding self-match reads on the override path
 * (the override id derives from the name+prefix pair). The `'unknown'`
 * sentinel is reserved for HARNESS absence and never enters through a flag
 * an operator typed. Trimming is part of the contract so padding can never
 * reach the wire field.
 */
function validatedSessionPrefix(
  raw: string | undefined,
  requiredWithAgentName: boolean,
): Result<string | undefined, Error> {
  if (raw === undefined) {
    return requiredWithAgentName
      ? err(
          new Error(
            '--session-prefix is required with --agent-name: the override operator knows the ' +
              'session prefix, and defaulting it empty would write a wire-invalid identity ' +
              'and blind self-match reads',
          ),
        )
      : ok(undefined);
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return err(
      new Error(
        '--session-prefix must not be empty: an empty prefix writes a wire-invalid identity ' +
          '(the heartbeat wire schema requires a non-empty prefix); omit the flag to use the ' +
          'session-derived prefix, or supply the real one',
      ),
    );
  }
  return ok(trimmed);
}

/**
 * Resolve the current comms CLI identity tuple as a write-side identity
 * (PDR-076a §Cascade item 1 — `id` is required on every collaboration-state
 * write).
 *
 * Explicit `--agent-name` selects override mode for admin/test usage. The
 * override path derives a deterministic UUID v5 from
 * `<agent_name>|<session_id_prefix>` (see
 * `deriveOverrideCollaborationIdentity`), preserving the single
 * v5-derivation site invariant; `--session-prefix` is REQUIRED and
 * non-empty here — the operator knows the prefix, so absence is operator
 * error, never a silent `''` (the recorded field symptom: an
 * `assert-watcher-live --agent-name` false-negative while the
 * `--platform/--model` form passes).
 *
 * Otherwise, identity is derived from the Practice session-id environment
 * via `resolveIdentity` (which composes over `deriveCollaborationIdentity`),
 * and any `--session-prefix` override replaces only the readable prefix
 * field — the `id` stays bound to the env-derived seed. A supplied value
 * must be non-empty on this branch too: it has a derivation to fall back
 * to, but a typed-empty value is the same operator error.
 */
export function resolveSelfIdentity(
  options: Options,
  env: CollaborationStateEnvironment,
): CollaborationAgentIdWrite {
  const explicitAgentName = optional(options, 'agent-name');
  const sessionPrefix = unwrapOrThrow(
    validatedSessionPrefix(optional(options, 'session-prefix'), explicitAgentName !== undefined),
  );
  if (explicitAgentName !== undefined) {
    return deriveOverrideCollaborationIdentity({
      agent_name: explicitAgentName,
      platform: optional(options, 'platform') ?? 'override',
      model: optional(options, 'model') ?? 'override',
      // validatedSessionPrefix rejects undefined in override mode, so the
      // fallback is unreachable; it exists only for the type narrowing.
      session_id_prefix: sessionPrefix ?? '',
    });
  }
  const identity = resolveIdentity(options, env);
  return sessionPrefix === undefined
    ? identity.agent_id
    : { ...identity.agent_id, session_id_prefix: sessionPrefix };
}
