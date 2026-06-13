/**
 * Test fixture that loads the canonical `active-claims.schema.json` from disk
 * once and exposes it as a typed `AnySchemaObject`. The schema file is the
 * authority under test, so reading it in a test fixture (rather than a test
 * file directly) keeps `node:fs` out of test files while preserving the
 * schema-meets-reality property the tests assert.
 */
import { readFileSync } from 'node:fs';
import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';
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

const COLLABORATION_SCHEMA_FILE_NAMES = [
  'active-claims.schema.json',
  'closed-claims.schema.json',
  'comms-event.schema.json',
  'conversation.schema.json',
  'escalation.schema.json',
] as const;

/**
 * Copy the full canonical collaboration schema set into a directory, for
 * tests that exercise the write-path validator: it compiles every schema in
 * the registry file's directory, so a canonical temp registry needs the
 * complete set beside it.
 */
export async function writeCollaborationSchemaSet(targetDir: string): Promise<void> {
  await Promise.all(
    COLLABORATION_SCHEMA_FILE_NAMES.map((fileName) =>
      copyFile(
        fileURLToPath(new URL(`../../../.agent/state/collaboration/${fileName}`, import.meta.url)),
        join(targetDir, fileName),
      ),
    ),
  );
}
