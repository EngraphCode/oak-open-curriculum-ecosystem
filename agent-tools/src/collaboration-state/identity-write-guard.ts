import { unwrapOrThrow, type Result } from '@oaknational/result';

import { assertNoLiveIdentityRoutingCollision } from './active-agents.js';
import { required, type Options } from './cli-options.js';
import { readActiveClaimsFile } from './state-io.js';
import { type CollaborationAgentId, type CollaborationRegistry } from './types.js';

interface IdentityWriteGuardInput {
  readonly options: Options;
  readonly agentId: CollaborationAgentId;
  readonly nowIso: string;
  readonly surface: string;
  readonly readActiveClaimsFile?: (
    activePath: string,
  ) => Promise<Result<CollaborationRegistry, Error>>;
}

/**
 * Read the active-claims registry named by `--active` and enforce P4
 * identity-route uniqueness for shared-state writers, returning the
 * registry so a caller that also needs registry data reads the file exactly
 * once (`comms direct` derives the recipient prefix from this same read —
 * a second read would tear the guard's snapshot from the derivation's).
 */
export async function registryForIdentityWrite(
  input: IdentityWriteGuardInput,
): Promise<CollaborationRegistry> {
  const readActive = input.readActiveClaimsFile ?? readActiveClaimsFile;
  const registry = unwrapOrThrow(await readActive(required(input.options, 'active')));

  assertNoLiveIdentityRoutingCollision({
    registry,
    nowIso: input.nowIso,
    agentId: input.agentId,
    surface: input.surface,
  });

  return registry;
}

/**
 * Guard-only view of {@link registryForIdentityWrite} for call sites that
 * need the P4 collision check and nothing else.
 */
export async function assertIdentityCanWrite(input: IdentityWriteGuardInput): Promise<void> {
  await registryForIdentityWrite(input);
}
