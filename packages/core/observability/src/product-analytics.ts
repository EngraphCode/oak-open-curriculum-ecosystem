/**
 * Provider-neutral product-analytics capability contracts.
 *
 * @remarks Product analytics shares the app-local observability selection
 * axis, but it is deliberately separate from diagnostic exception and message
 * sinks. Application code receives only these closed capabilities.
 *
 * @packageDocumentation
 */

import { ok, type Result } from '@oaknational/result';

/**
 * Closed resource-read fact accepted by the product-analytics boundary.
 */
export type ProductAnalyticsEvent = Readonly<{
  kind: 'mcp_resource_read';
  resourceName: string;
  startedAt: Date;
  durationMs: number;
  isError: boolean;
}>;

/**
 * Protected identity context supplied separately from the event fact.
 */
export type ProductAnalyticsCaptureContext = Readonly<{
  verifiedActorId: string;
}>;

/**
 * Provider-neutral capture capability exposed to resource-emission sites.
 */
export interface ProductAnalyticsSink {
  capture(event: ProductAnalyticsEvent, context: ProductAnalyticsCaptureContext): void;
}

/**
 * Provider-neutral capability for instrumenting a newly created MCP server.
 *
 * @typeParam TServer - Concrete MCP server type owned by the application.
 */
export interface McpServerInstrumenter<TServer> {
  instrument(server: TServer): void;
}

/**
 * Content-free product-runtime close failure.
 */
export type ProductAnalyticsCloseError = Readonly<{
  kind: 'product_analytics_close_failed';
}>;

interface ProductAnalyticsRuntimeCapabilities<TServer> {
  readonly sink: ProductAnalyticsSink;
  readonly instrumenter: McpServerInstrumenter<TServer>;
  close(): Promise<Result<void, ProductAnalyticsCloseError>>;
}

/**
 * Exact inert product-analytics runtime variant.
 *
 * @remarks Exposes the same closed capabilities as a provider-backed runtime,
 * but captures and instruments nothing and closes successfully.
 *
 * @typeParam TServer - Concrete MCP server type owned by the application.
 */
export type OffProductAnalyticsRuntime<TServer> = ProductAnalyticsRuntimeCapabilities<TServer> & {
  readonly mode: 'off';
};

/**
 * Required product-analytics runtime slot derived from the shared selection.
 *
 * @remarks PostHog mode retains closed provider-neutral capabilities and does
 * not expose a client or configuration object to application code.
 *
 * @typeParam TServer - Concrete MCP server type owned by the application.
 */
export type ProductAnalyticsRuntime<TServer> =
  | OffProductAnalyticsRuntime<TServer>
  | (ProductAnalyticsRuntimeCapabilities<TServer> & {
      readonly mode: 'posthog';
    });

/**
 * Creates the inert product-analytics runtime used when PostHog is not selected.
 *
 * @typeParam TServer - Concrete MCP server type owned by the application.
 * @returns An exact off-mode runtime that captures nothing, instruments
 * nothing, reads no configuration, creates no client, and closes successfully.
 */
export function createOffProductAnalyticsRuntime<TServer>(): OffProductAnalyticsRuntime<TServer> {
  return {
    mode: 'off',
    sink: {
      capture: () => undefined,
    },
    instrumenter: {
      instrument: () => undefined,
    },
    close: () => Promise.resolve(ok(undefined)),
  };
}
