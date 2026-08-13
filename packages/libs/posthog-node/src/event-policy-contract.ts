import type { ResolvedRelease } from '@oaknational/build-metadata';
import type { McpCaptureCommon } from '@posthog/mcp';
import type { EventMessage } from 'posthog-node';

import type { ActivePostHogActorProjector } from './actor-pseudonym-contract.js';
import type { PostHogOperationalErrorKind } from './product-analytics-runtime-contract.js';

export const POSTHOG_MCP_SOURCE = 'posthog_mcp_analytics';
export const OAK_MCP_SERVER_NAME = 'oak-curriculum-http';
export const ACTOR_MARKER = '__oak_posthog_distinct_id';

export const AUTOMATIC_EVENT_NAMES = {
  initialize: '$mcp_initialize',
  toolsList: '$mcp_tools_list',
  toolCall: '$mcp_tool_call',
} as const;

export const RESOURCE_READ_EVENT_NAME = '$mcp_resource_read';

export type AutomaticEventName = (typeof AUTOMATIC_EVENT_NAMES)[keyof typeof AUTOMATIC_EVENT_NAMES];
type AcceptedEventName = AutomaticEventName | typeof RESOURCE_READ_EVENT_NAME;
export type OakClientFamily = 'chatgpt' | 'claude' | 'other';
export type OakClientSurface = 'cli' | 'sdk' | 'vscode' | 'web' | 'other';

/**
 * Which MCP client *product* is calling, at vendor-product granularity.
 *
 * @remarks A third, orthogonal axis to the other two client categories, and the
 * only one that answers "is this tool's error rate one misbehaving client, or a
 * defect every teacher hits?" (MCP-594). `OakClientFamily` is vendor-grained and
 * reachable only from the `initialize` handshake, which ADR-112's per-request
 * transport cannot carry onto a later `tools/call`. `OakClientSurface` is *form
 * factor*, so it merges Claude Code and Codex into `cli` — collapsing exactly
 * the distinction the error-rate question needs. This axis derives per request
 * from the self-declaring client header, so it is present on every event.
 *
 * Deliberately NOT PostHog's `$mcp_client_name` / `$mcp_client_user_agent` /
 * `$mcp_vendor_client`, which its own `harness` column resolves from. Those
 * carry raw client-controlled strings, which ADR-218 §3 excludes from the
 * envelope. Live traffic contains opaque per-installation identifiers arriving
 * as `clientInfo.name`, so forwarding the raw value would place a stable
 * per-installation identifier in the analytics envelope. Only the closed
 * category below is ever emitted; the raw string never leaves this process.
 */
export type OakClientProduct = 'claude_ai' | 'claude_code' | 'codex' | 'other';
export type UnknownProperties = NonNullable<McpCaptureCommon['properties']>;

export interface McpRequest {
  readonly method?: string;
  readonly params?: UnknownProperties;
}

export interface PostHogEventPolicyConfig {
  readonly release: ResolvedRelease;
  readonly serverVersion: string;
  readonly servedToolNames: readonly string[];
  readonly servedResourceNames: readonly string[];
  readonly activeActorProjector: ActivePostHogActorProjector;
  readonly reportOperationalError: (kind: PostHogOperationalErrorKind) => void;
}

export interface PostHogEventPolicies {
  readonly projectVerifiedIdentityAndRelease: (
    request: McpRequest,
    extra?: unknown,
  ) => UnknownProperties | null;
  readonly finalOakEventPolicy: (event: EventMessage | null) => EventMessage | null;
}

export interface PolicySnapshot {
  readonly environment: ResolvedRelease['environment'];
  readonly release: string;
  readonly serverVersion: string;
  readonly servedToolNames: ReadonlySet<string>;
  readonly servedResourceNames: ReadonlySet<string>;
  readonly activeActorProjector: ActivePostHogActorProjector;
  readonly reportOperationalError: (kind: PostHogOperationalErrorKind) => void;
}

export interface NormalisedEvent {
  readonly event: AcceptedEventName;
  readonly properties: UnknownProperties;
}
