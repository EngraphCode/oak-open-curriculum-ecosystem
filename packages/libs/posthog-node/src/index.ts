/**
 * Closed package boundary for the PostHog product-analytics adapter.
 *
 * @remarks Product behaviour is introduced through later reviewed slices.
 * The root exposes actor pseudonyms and the runtime's public configuration
 * surface. The event policies themselves stay internal — they are consumed by
 * the sink and the runtime, never by a caller. Nothing here reaches the vendor
 * SDK, and no key material crosses the boundary.
 *
 * @packageDocumentation
 */

export { createPostHogPseudonymCapabilities } from './actor-pseudonym.js';
export { POSTHOG_EU_INGESTION_HOST } from './product-analytics-runtime-contract.js';
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
export type {
  PostHogOperationalErrorKind,
  PostHogProductAnalyticsConfig,
  PostHogWaitUntil,
} from './product-analytics-runtime-contract.js';
