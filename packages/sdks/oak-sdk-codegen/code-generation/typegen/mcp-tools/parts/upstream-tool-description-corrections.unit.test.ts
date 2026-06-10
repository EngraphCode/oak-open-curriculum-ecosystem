/**
 * Removal-condition test for tool description corrections.
 *
 * This test reads the committed upstream-schema mirror (`schemaBase`, the
 * generated module emitted from the schema cache on every codegen run) and
 * verifies that each correction's `upstreamBuggySentence` still appears in
 * the upstream operation description. When the upstream wording changes —
 * the bug is fixed or the claim is reworded — this test will FAIL on the
 * first codegen run that picks up the new spec: that failure is the signal
 * to remove the correction from tool-description.ts (or re-ground it against
 * the new wording).
 *
 * The operation-level sibling of
 * `upstream-param-description-overrides.unit.test.ts` (which reads the schema
 * cache from disk; this test imports the generated mirror instead, keeping
 * real IO out of the test per the no-real-io-in-tests rule).
 *
 * @see tool-description.ts — TOOL_DESCRIPTION_CORRECTIONS
 */
import { describe, it, expect } from 'vitest';

import { schemaBase } from '../../../../src/types/generated/api-schema/api-schema-base.js';
import { TOOL_DESCRIPTION_CORRECTIONS } from './tool-description.js';

interface SchemaOperation {
  readonly description: string;
}

function isSchemaOperation(value: unknown): value is SchemaOperation {
  if (typeof value !== 'object' || value === null || !('description' in value)) {
    return false;
  }
  return typeof value.description === 'string';
}

function isPathsRecord(value: unknown): value is Record<string, Record<string, unknown>> {
  return typeof value === 'object' && value !== null;
}

/**
 * The upstream operation description, whitespace-normalised exactly as
 * `toToolDescription` normalises it, so the comparison sees the same form
 * `applyDescriptionCorrections` operates on. Throws (rather than returning
 * undefined) on a missing operation or description so a mistyped corrections
 * key fails with a readable message instead of an opaque
 * `toContain(undefined)` explosion.
 */
function getNormalisedOperationDescription(apiPath: string, method: string): string {
  const paths: unknown = schemaBase.paths;
  if (!isPathsRecord(paths)) {
    throw new Error('schemaBase does not contain expected paths structure');
  }
  const operation: unknown = paths[apiPath]?.[method];
  if (operation === undefined) {
    throw new Error(
      `No operation ${method.toUpperCase()} ${apiPath} in schemaBase — check the corrections key`,
    );
  }
  if (!isSchemaOperation(operation)) {
    throw new Error(
      `Operation ${method.toUpperCase()} ${apiPath} has no string description in schemaBase`,
    );
  }
  return operation.description.replace(/\s+/g, ' ').trim();
}

describe('upstream tool description corrections — removal conditions', () => {
  for (const [key, corrections] of Object.entries(TOOL_DESCRIPTION_CORRECTIONS)) {
    const separatorIndex = key.lastIndexOf(':');
    const apiPath = key.slice(0, separatorIndex);
    const method = key.slice(separatorIndex + 1);

    for (const correction of corrections ?? []) {
      it(`correction for ${method.toUpperCase()} ${apiPath} is still needed (upstream claim persists)`, () => {
        const cachedDescription = getNormalisedOperationDescription(apiPath, method);

        // When this assertion fails, the upstream wording has changed.
        // Remove the correction from TOOL_DESCRIPTION_CORRECTIONS (or
        // re-ground it against the new wording) and re-run pnpm sdk-codegen.
        expect(
          cachedDescription,
          `Upstream description for ${method.toUpperCase()} ${apiPath} no longer contains ` +
            `the known-false sentence. The upstream wording has CHANGED. Remove the ` +
            `correction from tool-description.ts (or re-ground it) and re-run ` +
            `pnpm sdk-codegen to pick up the new upstream description.`,
        ).toContain(correction.upstreamBuggySentence);
      });
    }
  }
});
