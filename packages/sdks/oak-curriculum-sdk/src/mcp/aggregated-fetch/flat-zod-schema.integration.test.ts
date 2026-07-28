/**
 * Integration tests for the fetch tool's flat Zod schema.
 *
 * Mirrors the sibling test for `aggregated-search/flat-zod-schema.integration.test.ts`,
 * proving that `.meta({ examples })` round-trips through Zod 4's
 * `z.toJSONSchema()` for the aggregated `fetch` tool's single `id` parameter.
 *
 * This integration-level proof replaces the equivalent assertion previously
 * made at the E2E layer in the now-deleted
 * `tool-examples-metadata.e2e.test.ts` (under
 * `apps/oak-curriculum-mcp-streamable-http/e2e-tests/`), per the testing
 * strategy: keep E2E assertions on system/transport invariants and prove
 * schema-shape semantics in SDK integration tests.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { FETCH_INPUT_SCHEMA } from './flat-zod-schema.js';

const JsonSchemaPropertiesSchema = z.object({
  properties: z.record(z.string(), z.looseObject({ examples: z.array(z.unknown()).optional() })),
});

describe('fetch inputSchema round-trip', () => {
  it('exports a defined inputSchema', () => {
    expect(FETCH_INPUT_SCHEMA).toBeDefined();
  });

  it('z.toJSONSchema() carries a non-empty examples array on the id field', () => {
    // Behaviour, never config: the mechanism under test is that
    // `.meta({ examples })` survives the round-trip to the wire. Whether the
    // example VALUES are true of deployed data is a live-probe concern
    // (owner ruling 2026-07-28: tests never test config, only behaviour).
    const jsonSchema = z.toJSONSchema(z.object(FETCH_INPUT_SCHEMA));
    const { properties } = JsonSchemaPropertiesSchema.parse(jsonSchema);

    expect(Array.isArray(properties.id?.examples)).toBe(true);
    expect(properties.id?.examples?.length).toBeGreaterThan(0);
  });

  it('z.toJSONSchema() produces a description on the id field', () => {
    const jsonSchema = z.toJSONSchema(z.object(FETCH_INPUT_SCHEMA));

    expect(jsonSchema).toHaveProperty('properties.id.description');
  });
});
