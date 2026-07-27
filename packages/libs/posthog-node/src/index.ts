/**
 * Closed package boundary for the PostHog product-analytics adapter.
 *
 * @remarks Product behaviour is introduced through later reviewed slices.
 * This slice exposes actor pseudonyms only: the capability factory and the
 * contracts a composition root needs to call it. Nothing here reaches the
 * vendor SDK, and no key material crosses the boundary.
 *
 * @packageDocumentation
 */

export { createPostHogPseudonymCapabilities } from './actor-pseudonym.js';
export type {
  ActivePostHogActorProjector,
  PostHogActorPseudonym,
  PostHogDeletionProjector,
  PostHogIdentityProjectionError,
  PostHogPseudonymCapabilities,
  PostHogPseudonymConfig,
  PostHogPseudonymConfigurationError,
  PostHogPseudonymEnvironment,
  PostHogPseudonymKey,
} from './actor-pseudonym-contract.js';
