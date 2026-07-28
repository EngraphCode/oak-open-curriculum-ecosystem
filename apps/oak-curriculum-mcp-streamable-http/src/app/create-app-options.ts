import type { RequestHandler } from 'express';
import type { Logger } from '@oaknational/logger';
import type { RuntimeConfig } from '../runtime-config.js';
import type { HttpObservability } from '../observability/http-observability.js';
import type { RateLimiterFactory } from '../rate-limiting/index.js';
import type { ToolHandlerOverrides } from '../handlers.js';
import type { CreateMcpAuthClerkDeps } from '../auth/mcp-auth/index.js';
import type { UpstreamAuthServerMetadata } from '../oauth-proxy/index.js';
import type { SentryExpressErrorHandlerSetup } from './bootstrap-error-handlers.js';
import type { ServedSurfaceDefinition } from '../served-surface/served-surface.js';

/**
 * Everything `createApp` needs to build an app instance.
 *
 * Lives beside the bootstrap phases rather than in the composition root so
 * a phase module can name the contract without importing the root that
 * calls it.
 */
export interface CreateAppOptions {
  readonly runtimeConfig: RuntimeConfig;
  readonly observability: HttpObservability;
  readonly toolHandlerOverrides?: ToolHandlerOverrides;
  readonly logger?: Logger;
  readonly resourceUrl?: string;
  /** Returns built widget HTML for the MCP App resource. Prod: codegen constant; tests: trivial fake. (ADR-078) */
  readonly getWidgetHtml: () => string;
  /**
   * Returns the baked landing-page document. Prod: boot-read of the build's
   * artefact (`readBakedLandingPageHtml`); tests: trivial fake. Required so
   * the request path can never fall back to rendering — the page's content
   * is fixed at build time by owner ruling. (ADR-078)
   */
  readonly getLandingPageHtml: () => string;
  /** Upstream AS metadata for OAuth proxy; provided by tests, fetched at startup in prod. */
  readonly upstreamMetadata?: UpstreamAuthServerMetadata;
  /** Factory for global Clerk middleware (tests inject no-op; prod omits). (ADR-078) */
  readonly clerkMiddlewareFactory?: () => RequestHandler;
  /**
   * Clerk auth dependencies (`getAuth` / `verifyClerkToken`) for
   * `createMcpAuthClerk`. Tests inject fakes that report a known auth outcome
   * at the verification seam; production omits this and the real Clerk SDK
   * functions are used. (ADR-078)
   */
  readonly mcpAuthClerkDeps?: CreateMcpAuthClerkDeps;
  /**
   * Factory for per-IP rate-limit middleware. Required: production passes
   * {@link createDefaultRateLimiterFactory}; tests pass a no-op or recording
   * fake from `src/test-helpers/rate-limiter-fakes.ts`. Required (not
   * optional) so the test boundary cannot silently fall back to the
   * production `express-rate-limit` factory and its `MemoryStore` cleanup
   * interval. (ADR-078, ADR-158)
   */
  readonly rateLimiterFactory: RateLimiterFactory;
  /** Sentry Express error-handler registration; live mode only, not fixture/off. (ADR-078) */
  readonly setupSentryErrorHandler?: SentryExpressErrorHandlerSetup;
  /**
   * Served-surface definition override — test seam only (e.g. exercising
   * the dormant user-search MCP App tools). Production omits it; the
   * canonical module-level `SERVED_SURFACE` then governs registration.
   */
  readonly servedSurface?: ServedSurfaceDefinition;
  /**
   * Static asset root override — test seam (ADR-078). Tests inject a scratch
   * directory so no suite touches the workspace's live `public/` tree;
   * production omits it and the `process.cwd()` candidate probe governs.
   */
  readonly staticRoot?: string;
}
