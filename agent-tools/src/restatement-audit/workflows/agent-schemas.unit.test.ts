import { describe, expect, it } from 'vitest';

import type { DerivedJsonSchema } from './agent-schemas.js';
import { deriveAgentJsonSchemas } from './agent-schemas.js';

/**
 * The agent-call JSON Schemas are DERIVED from the zod SSOT at build time and inlined
 * into the sandbox artefacts — zod never enters the bundle, and drift between the zod
 * contract and what an agent is asked to emit is impossible rather than detected. These
 * tests pin the derived shape the harness `agent()` schema parameter requires: fully
 * inlined (no `$ref`/`$defs`/`$schema`), strict objects everywhere, exact enums.
 *
 * Navigation is by DIRECT literal path (never a recursive walker — a walker encodes the
 * shape it claims to verify and silently skips branches it does not know about); the
 * strict-everywhere invariant is pinned by counting over the serialised schema, which
 * cannot miss a branch.
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

function propertySchema(
  node: DerivedJsonSchema | undefined,
  name: string,
): DerivedJsonSchema | undefined {
  return asSchemaObject(node?.properties?.[name]);
}

function arrayItems(node: DerivedJsonSchema | undefined): DerivedJsonSchema | undefined {
  return asSchemaObject(node?.items);
}

const byAlpha = (a: string, b: string): number => a.localeCompare(b);

const schemas = deriveAgentJsonSchemas();

// Direct literal paths to each stage's payload node.
const finderInstance = arrayItems(propertySchema(schemas.finderStage, 'instances'));
const reducerProposal = arrayItems(propertySchema(schemas.clusterStage, 'clusters'));
const ledgerRow = arrayItems(propertySchema(schemas.metaStage, 'rows'));

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

  it('declares additionalProperties false on every object node (counted over the serialisation)', () => {
    const serialised = JSON.stringify(schemas);
    const objectNodeCount = serialised.match(/"type":"object"/g)?.length ?? 0;
    const strictCount = serialised.match(/"additionalProperties":false/g)?.length ?? 0;
    expect(objectNodeCount).toBeGreaterThan(0);
    expect(strictCount).toBe(objectNodeCount);
  });
});

describe('finderStage (map agent contract)', () => {
  it('requires exactly the finder-instance fields', () => {
    expect(schemas.finderStage.required).toEqual(['instances']);
    expect([...(finderInstance?.required ?? [])].sort(byAlpha)).toEqual([
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
    expect(propertySchema(finderInstance, 'factClass')?.enum).toEqual([
      'status-assertion',
      'closed-set-membership',
      'count',
      'denominator',
      'threshold',
      'coverage-mapping',
      'named-tool-or-artefact',
      'date-claim',
    ]);
    expect(propertySchema(finderInstance, 'assertionKind')?.enum).toEqual([
      'authored',
      'citation',
      'history',
      'generated',
    ]);
  });

  it('caps quote length at 200', () => {
    expect(propertySchema(finderInstance, 'quote')?.maxLength).toBe(200);
  });
});

describe('clusterStage (reduce agent contract — membership proposals only)', () => {
  it('requires exactly a proposal id and its member instance ids', () => {
    expect(schemas.clusterStage.required).toEqual(['clusters']);
    expect([...(reducerProposal?.required ?? [])].sort(byAlpha)).toEqual([
      'id',
      'memberInstanceIds',
    ]);
  });

  it('keeps memberInstanceIds minItems: 2 (a restatement needs repetition)', () => {
    expect(propertySchema(reducerProposal, 'memberInstanceIds')?.minItems).toBe(2);
  });

  it('asks the reducer for NO verdict, factClass, or count fields (the prompt forbids them)', () => {
    expect(propertySchema(reducerProposal, 'verdict')).toBeUndefined();
    expect(propertySchema(reducerProposal, 'factClass')).toBeUndefined();
    expect(propertySchema(reducerProposal, 'clusterKind')).toBeUndefined();
    expect(propertySchema(reducerProposal, 'distinctValueNorms')).toBeUndefined();
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
  it('requires rows at the envelope level', () => {
    expect(schemas.metaStage.required).toEqual(['rows']);
  });

  it('pins the closed proposedCure menu in order', () => {
    expect(propertySchema(ledgerRow, 'proposedCure')?.enum).toEqual([
      'cite-register',
      'extract-to-data',
      'derive-from-generator',
      'delete-restatement',
      'mark-as-history',
      'new-single-source',
    ]);
  });

  it('keeps sourceOfTruth nullable', () => {
    const sourceOfTruth = propertySchema(ledgerRow, 'sourceOfTruth');
    expect(sourceOfTruth?.anyOf ?? sourceOfTruth?.type).toBeDefined();
  });

  it('requires droppedMembers explicitly — a drop is expressed by naming it, an empty array by stating it', () => {
    expect(ledgerRow?.required).toContain('droppedMembers');
    const droppedMember = arrayItems(propertySchema(ledgerRow, 'droppedMembers'));
    expect([...(droppedMember?.required ?? [])].sort(byAlpha)).toEqual([
      'file',
      'line',
      'quote',
      'reason',
    ]);
  });

  it('asks the agent for NO disposition — code stamps flagged after the call', () => {
    expect(propertySchema(ledgerRow, 'disposition')).toBeUndefined();
  });
});
