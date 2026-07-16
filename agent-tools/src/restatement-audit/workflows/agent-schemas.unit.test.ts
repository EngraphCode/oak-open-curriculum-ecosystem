import { describe, expect, it } from 'vitest';

import type { DerivedJsonSchema } from './agent-schemas.js';
import { deriveAgentJsonSchemas } from './agent-schemas.js';

/**
 * The agent-call JSON Schemas are DERIVED from the zod SSOT at build time and inlined
 * into the sandbox artefacts — zod never enters the bundle, and drift between the zod
 * contract and what an agent is asked to emit is impossible rather than detected. These
 * tests pin the derived shape the harness `agent()` schema parameter requires: fully
 * inlined (no `$ref`/`$defs`/`$schema`), strict objects everywhere, exact enums.
 */

function isReadonlyArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function asSchemaObject(
  value: DerivedJsonSchema | boolean | readonly (DerivedJsonSchema | boolean)[] | undefined,
): DerivedJsonSchema | undefined {
  if (typeof value !== 'object' || isReadonlyArray(value)) {
    return undefined;
  }
  return value;
}

function collectNodes(
  schema: DerivedJsonSchema,
  out: DerivedJsonSchema[] = [],
): DerivedJsonSchema[] {
  out.push(schema);
  for (const property of Object.values(schema.properties ?? {})) {
    const node = asSchemaObject(property);
    if (node) {
      collectNodes(node, out);
    }
  }
  const items = asSchemaObject(schema.items);
  if (items) {
    collectNodes(items, out);
  }
  return out;
}

function propertySchema(
  node: DerivedJsonSchema | undefined,
  name: string,
): DerivedJsonSchema | undefined {
  return asSchemaObject(node?.properties?.[name]);
}

function nodeWithProperty(schema: DerivedJsonSchema, name: string): DerivedJsonSchema | undefined {
  return collectNodes(schema).find((candidate) => candidate.properties?.[name] !== undefined);
}

const byAlpha = (a: string, b: string): number => a.localeCompare(b);

const schemas = deriveAgentJsonSchemas();
const allNodes = Object.values(schemas).flatMap((schema) => collectNodes(schema));

describe('deriveAgentJsonSchemas — sandbox-inlinable shape', () => {
  it('derives all four stage agent schemas', () => {
    expect(Object.keys(schemas).sort(byAlpha)).toEqual([
      'clusterStage',
      'finderStage',
      'metaStage',
      'voterStage',
    ]);
  });

  it('contains no $schema, $defs, or $ref anywhere (fully inlined for the harness)', () => {
    expect(JSON.stringify(schemas)).not.toMatch(/"\$(?:schema|defs|ref)"\s*:/);
  });

  it('declares additionalProperties false on every object node (strict everywhere)', () => {
    const objectNodes = allNodes.filter((node) => node.type === 'object');
    expect(objectNodes.length).toBeGreaterThan(0);
    for (const node of objectNodes) {
      expect(node.additionalProperties).toBe(false);
    }
  });
});

describe('finderStage (map agent contract)', () => {
  const instance = nodeWithProperty(schemas.finderStage, 'factClass');

  it('requires exactly the finder-instance fields', () => {
    expect(schemas.finderStage.required).toEqual(['instances']);
    expect([...(instance?.required ?? [])].sort(byAlpha)).toEqual([
      'assertionKind',
      'confidence',
      'factClass',
      'file',
      'id',
      'line',
      'predicate',
      'quote',
      'subject',
      'subjectFromGazetteer',
      'valueNorm',
    ]);
  });

  it('pins the factClass and assertionKind enums in order', () => {
    expect(propertySchema(instance, 'factClass')?.enum).toEqual([
      'status-assertion',
      'closed-set-membership',
      'count',
      'denominator',
      'threshold',
      'coverage-mapping',
      'named-tool-or-artefact',
      'date-claim',
    ]);
    expect(propertySchema(instance, 'assertionKind')?.enum).toEqual([
      'authored',
      'citation',
      'history',
      'generated',
    ]);
  });

  it('caps quote length at 200', () => {
    expect(propertySchema(instance, 'quote')?.maxLength).toBe(200);
  });
});

describe('clusterStage (reduce agent contract)', () => {
  const cluster = nodeWithProperty(schemas.clusterStage, 'clusterKind');

  it('pins the clusterKind and verdict enums', () => {
    expect(propertySchema(cluster, 'clusterKind')?.enum).toEqual(['exact-key', 'reducer']);
    expect(propertySchema(cluster, 'verdict')?.enum).toEqual(['conflict', 'latent']);
  });

  it('keeps memberInstanceIds minItems: 2 (a restatement needs repetition)', () => {
    expect(propertySchema(cluster, 'memberInstanceIds')?.minItems).toBe(2);
  });
});

describe('voterStage (validate agent contract)', () => {
  it('carries exactly the four conjunctive tests plus importance', () => {
    const expected = [
      'authoredNotCited',
      'genuineConflict',
      'importance',
      'liveSurface',
      'sameFact',
    ];
    expect(Object.keys(schemas.voterStage.properties ?? {}).sort(byAlpha)).toEqual(expected);
    expect([...(schemas.voterStage.required ?? [])].sort(byAlpha)).toEqual(expected);
  });
});

describe('metaStage (meta agent contract)', () => {
  const row = nodeWithProperty(schemas.metaStage, 'proposedCure');

  it('requires rows at the envelope level', () => {
    expect(schemas.metaStage.required).toEqual(['rows']);
  });

  it('pins the closed proposedCure menu in order', () => {
    expect(propertySchema(row, 'proposedCure')?.enum).toEqual([
      'cite-register',
      'extract-to-data',
      'derive-from-generator',
      'delete-restatement',
      'mark-as-history',
      'new-single-source',
    ]);
  });

  it('keeps sourceOfTruth nullable', () => {
    const sourceOfTruth = propertySchema(row, 'sourceOfTruth');
    expect(sourceOfTruth?.anyOf ?? sourceOfTruth?.type).toBeDefined();
  });
});
