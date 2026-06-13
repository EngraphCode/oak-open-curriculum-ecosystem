/**
 * Test fixture that loads the canonical `active-claims.schema.json` from disk
 * once and exposes it as a typed `AnySchemaObject`. The schema file is the
 * authority under test, so reading it in a test fixture (rather than a test
 * file directly) keeps `node:fs` out of test files while preserving the
 * schema-meets-reality property the tests assert. Shared with
 * `agent-id-jsonschema.unit.test.ts` (the established schema-fixture pattern in
 * this suite).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { type AnySchemaObject } from 'ajv';

function isAnySchemaObject(value: unknown): value is AnySchemaObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function loadCollaborationSchema(fileName: string): AnySchemaObject {
  const schemaUrl = new URL(`../../../.agent/state/collaboration/${fileName}`, import.meta.url);
  const parsed: unknown = JSON.parse(readFileSync(fileURLToPath(schemaUrl), 'utf8'));
  if (!isAnySchemaObject(parsed)) {
    throw new Error(`${fileName} must be a JSON object`);
  }
  return parsed;
}

export const activeClaimsSchema: AnySchemaObject = loadCollaborationSchema(
  'active-claims.schema.json',
);
