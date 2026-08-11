import { SUPPORTED_PROTOCOL_VERSIONS } from '@modelcontextprotocol/sdk/types.js';
import { err } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { normaliseAutomaticProperties } from './automatic-event-policy.js';
import type { PolicySnapshot, UnknownProperties } from './event-policy-contract.js';

const SNAPSHOT = {
  environment: 'production',
  release: 'release-2026-07-26',
  serverVersion: '1.2.3',
  servedToolNames: new Set<string>(),
  servedResourceNames: new Set<string>(),
  activeActorProjector: {
    project: () => err({ kind: 'posthog_identity_projection_failed' }),
  },
  reportOperationalError: () => undefined,
} satisfies PolicySnapshot;

describe('normaliseAutomaticProperties', () => {
  it.each([
    ['missing', undefined],
    ['non-boolean', 'false'],
  ])('drops initialize when the success signal is %s', (_label, isError) => {
    const properties: UnknownProperties = {
      oak_client_family: 'chatgpt',
      $mcp_protocol_version: SUPPORTED_PROTOCOL_VERSIONS[0],
      ...(isError === undefined ? {} : { $mcp_is_error: isError }),
    };

    expect(normaliseAutomaticProperties('$mcp_initialize', properties, SNAPSHOT)).toBeNull();
  });

  it('strips the @posthog/mcp 0.11.x auto-captured client-identity properties', () => {
    const properties: UnknownProperties = {
      oak_client_family: 'chatgpt',
      $mcp_protocol_version: SUPPORTED_PROTOCOL_VERSIONS[0],
      $mcp_is_error: false,
      $mcp_client_user_agent: 'claude-ai/1.0',
      $mcp_vendor_client: 'anthropic',
    };

    const normalised = normaliseAutomaticProperties('$mcp_initialize', properties, SNAPSHOT);

    expect(normalised, 'a valid initialize event must survive normalisation').not.toBeNull();
    expect(
      normalised,
      'an undeclared upstream property must never reach the sink; declaring it is a reviewed policy edit',
    ).not.toHaveProperty('$mcp_client_user_agent');
    expect(
      normalised,
      'an undeclared upstream property must never reach the sink; declaring it is a reviewed policy edit',
    ).not.toHaveProperty('$mcp_vendor_client');
  });
});
