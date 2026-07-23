/**
 * MCP tool registration.
 *
 * Iterates over the SDK's universal tool registry and registers each tool
 * with its observability wrapping and auth interception.
 *
 * The per-request HTTP handler factory lives in `mcp-handler.ts`.
 */

import type { McpServer, ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAppTool } from '@modelcontextprotocol/ext-apps/server';
import type { Logger } from '@oaknational/logger';
import type { RuntimeConfig } from './runtime-config.js';
import type { HttpObservability } from './observability/http-observability.js';
import {
  createOakPathBasedClient,
  executeToolCall,
  listUniversalTools,
  createUniversalToolExecutor,
  createStubToolExecutionAdapter,
  generatedToolRegistry,
  isAppToolEntry,
  type SearchRetrievalService,
  type UniversalToolName,
} from '@oaknational/curriculum-sdk/public/mcp-tools.js';
import { handleToolWithAuthInterception } from './tool-handler-with-auth.js';
import { measureCallToolResult } from './observability/tool-result-measurement.js';
import { registerAllResources, registerPrompts } from './register-resources.js';
import { registerOakUnderTheHoodTool } from './oak-under-the-hood/oak-under-the-hood-tool.js';
import {
  SERVED_SURFACE,
  isUniversalToolLive,
  isAppLocalToolLive,
  type ServedSurfaceDefinition,
} from './served-surface/served-surface.js';
import {
  createDefaultRequestExecutor,
  createStubRequestExecutor,
} from './tool-executor-factory.js';
import type { ToolHandlerDependencies, ToolHandlerOverrides } from './tool-handler-types.js';

export type { ToolHandlerDependencies, ToolHandlerOverrides } from './tool-handler-types.js';
export { createMcpHandler } from './mcp-handler.js';
export type { McpHandlerRequest, McpHandlerResponse } from './mcp-handler.js';

/**
 * Inputs required to register Oak's MCP tools, resources, and prompts.
 *
 * The HTTP app stays thin: it receives prebuilt SDK/runtime dependencies,
 * then registers the canonical universal tool inventory directly without
 * reintroducing a projection layer.
 *
 * @example
 * ```typescript
 * registerHandlers(server, {
 *   runtimeConfig,
 *   logger,
 *   observability,
 *   searchRetrieval,
 *   resourceUrl: 'https://example.org/mcp',
 * });
 * ```
 */
interface RegisterHandlersOptions {
  readonly overrides?: ToolHandlerOverrides;
  readonly runtimeConfig: RuntimeConfig;
  readonly logger: Logger;
  readonly observability: HttpObservability;
  readonly resourceUrl?: string;
  /** Pre-created search retrieval service (shared across per-request servers). */
  readonly searchRetrieval: SearchRetrievalService;
  /** Factory for generating signed asset download URLs (HTTP-only). */
  readonly createAssetDownloadUrl?: (lesson: string, type: string) => string;
  /** Returns the built widget HTML content (DI per ADR-078). */
  readonly getWidgetHtml: () => string;
  /**
   * Served-surface definition governing registration. Defaults to the
   * canonical module-level `SERVED_SURFACE`; injectable so tests can
   * exercise dormant rows (e.g. the unbuilt user-search MCP App tools).
   * Production callers never pass this — the canonical constant is the
   * single point of control (ratified plan mcp-101).
   */
  readonly servedSurface?: ServedSurfaceDefinition;
}

function buildToolHandlerDependencies(
  resourceUrl: string,
  overrides: ToolHandlerOverrides | undefined,
  searchRetrieval: SearchRetrievalService,
  stubExecutor: ReturnType<typeof createStubToolExecutionAdapter> | undefined,
): ToolHandlerDependencies {
  const createRequestExecutor: ToolHandlerDependencies['createRequestExecutor'] = stubExecutor
    ? (config) =>
        createStubRequestExecutor({
          factoryConfig: { ...config, searchRetrieval },
          stubExecutor,
          createExecutor: createUniversalToolExecutor,
        })
    : (config) =>
        createDefaultRequestExecutor({
          ...config,
          searchRetrieval,
          createClient: createOakPathBasedClient,
          executeToolCall,
          createExecutor: createUniversalToolExecutor,
        });

  const defaults: ToolHandlerDependencies = {
    createRequestExecutor,
    getResourceUrl: () => resourceUrl,
  };
  if (!overrides) {
    return defaults;
  }
  return {
    createRequestExecutor: overrides.createRequestExecutor ?? defaults.createRequestExecutor,
    getResourceUrl: overrides.getResourceUrl ?? defaults.getResourceUrl,
  };
}

/**
 * Registers all MCP tools, resources, and prompts with the server.
 *
 * Tool metadata is registered in the same shape returned by
 * `listUniversalTools()`: `title`, `description`, `inputSchema`,
 * `annotations`, and `_meta`. No compatibility projection layer sits
 * between the SDK registry and the transport registration step.
 *
 * @param server - MCP server instance
 * @param options - Registration options including runtime config and logger
 *
 * @example
 * ```typescript
 * const server = new McpServer({ name: 'oak-http', version: '0.1.0' });
 *
 * registerHandlers(server, {
 *   runtimeConfig,
 *   logger,
 *   observability,
 *   searchRetrieval,
 *   createAssetDownloadUrl: (lesson, type) =>
 *     `https://example.org/api/assets/${lesson}/${type}`,
 * });
 * ```
 */
export function registerHandlers(
  server: Pick<McpServer, 'registerTool' | 'registerResource' | 'registerPrompt'>,
  options: RegisterHandlersOptions,
): void {
  const resourceUrl = options.resourceUrl ?? 'http://localhost:3333/mcp';
  const stubExecutor = options.runtimeConfig.useStubTools
    ? createStubToolExecutionAdapter()
    : undefined;
  const deps = buildToolHandlerDependencies(
    resourceUrl,
    options.overrides,
    options.searchRetrieval,
    stubExecutor,
  );

  const servedSurface = options.servedSurface ?? SERVED_SURFACE;

  registerTools(server, deps, options, servedSurface);

  // Additive, app-local effort-orientation tool — registered outside the
  // universal-tools loop (it is not in the SDK generated registry), with its
  // own served-surface row. Low-salience; the curriculum firewall lives in
  // its description and result.
  if (isAppLocalToolLive(servedSurface, 'oak-under-the-hood')) {
    registerOakUnderTheHoodTool(server);
  }

  registerAllResources(server, {
    getWidgetHtml: options.getWidgetHtml,
    eefEnabled: options.runtimeConfig.eefEnabled,
  });
  registerPrompts(server, options.runtimeConfig.eefEnabled);
}

/**
 * Tool names co-gated behind `OAK_CURRICULUM_MCP_EEF_ENABLED`. Typed as
 * `UniversalToolName` so a tool-name rename is a compile error here, not a
 * silently-stale string. EEF is one tool today; this is the single extension
 * point for further EEF surfaces (D6 plan c6).
 */
const EEF_FLAG_GATED_TOOL_NAMES: ReadonlySet<UniversalToolName> = new Set<UniversalToolName>([
  'get-eef-evidence',
]);

/** Iterates over universal tools and registers each live tool with the server. */
function registerTools(
  server: Pick<McpServer, 'registerTool'>,
  deps: ToolHandlerDependencies,
  options: RegisterHandlersOptions,
  servedSurface: ServedSurfaceDefinition,
): void {
  for (const tool of listUniversalTools(generatedToolRegistry)) {
    // The served-surface definition is the single point of control: dormant
    // tools (the unbuilt user-search MCP App pair) are structurally absent
    // from registration — and from tools/list — regardless of any client
    // behaviour. The SDK enumerator stays transport-agnostic; the app owns
    // the classification.
    if (!isUniversalToolLive(servedSurface, tool.name)) {
      continue;
    }

    // EEF is gated at registration (OAK_CURRICULUM_MCP_EEF_ENABLED → runtimeConfig.eefEnabled,
    // kill-switch, default ON): register the entry unless an explicit `=false` disables it.
    // Transitional: the flag's migration into the served-surface definition completes in the
    // next slice of the mcp-101 lane, where the prompt and resource legs it co-gates are
    // reworked together.
    if (EEF_FLAG_GATED_TOOL_NAMES.has(tool.name) && !options.runtimeConfig.eefEnabled) {
      continue;
    }

    const handler = async (params: unknown, extra: Parameters<ToolCallback>[0]) => {
      options.observability.setTag('mcp.tool_name', tool.name);
      const result = await handleToolWithAuthInterception({
        tool,
        params,
        deps,
        logger: options.logger,
        apiKey: options.runtimeConfig.env.OAK_API_KEY,
        runtimeConfig: options.runtimeConfig,
        createAssetDownloadUrl: options.createAssetDownloadUrl,
        authInfo: extra.authInfo,
      });
      // Outbound token health metric, per-field half: every tool result —
      // including auth errors — is measured (sizes only, never content).
      options.logger.info('MCP tool result size', {
        toolName: tool.name,
        ...measureCallToolResult(result),
      });
      return result;
    };

    const config = {
      title: tool.title,
      description: tool.description,
      inputSchema: tool.inputSchema,
      annotations: tool.annotations,
    };

    if (isAppToolEntry(tool)) {
      registerAppTool(server, tool.name, { ...config, _meta: { ...tool._meta } }, handler);
    } else {
      server.registerTool(tool.name, { ...config, _meta: { ...tool._meta } }, handler);
    }
  }
}
