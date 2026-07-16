import { describe, expect, it } from 'vitest';

import { deriveAgentJsonSchemas } from '../agent-schemas.js';
import {
  AGENT_SCHEMAS_MODULE_FILTER,
  RUN_DATA_MODULE_FILTER,
  agentSchemasInlinePlugin,
  agentSchemasModuleSource,
  runDataInlinePlugin,
  runDataModuleSource,
} from './schema-inline-plugin.js';

/**
 * The inline plugins substitute two modules when bundling sandbox artefacts: the real
 * `agent-schemas.ts` (which value-imports zod) with a precomputed zod-free literal, and
 * the unseeded `run-data.ts` sentinel with the stage-tagged validated payload. The
 * exported filters and module-source builders ARE the substitution contract.
 */

describe('module filters (the substitution targets)', () => {
  it('the schema filter matches exactly the restatement-audit workflows agent-schemas module', () => {
    expect(
      AGENT_SCHEMAS_MODULE_FILTER.test(
        '/repo/agent-tools/src/restatement-audit/workflows/agent-schemas.ts',
      ),
    ).toBe(true);
    expect(
      AGENT_SCHEMAS_MODULE_FILTER.test('/repo/agent-tools/src/restatement-audit/schemas.ts'),
    ).toBe(false);
  });

  it("does NOT match corpus-analysis's own agent-schemas module (scoped, no cross-package collision)", () => {
    expect(
      AGENT_SCHEMAS_MODULE_FILTER.test(
        '/repo/agent-tools/src/corpus-analysis/workflows/agent-schemas.ts',
      ),
    ).toBe(false);
  });

  it('the run-data filter matches exactly the restatement-audit workflows run-data module', () => {
    expect(
      RUN_DATA_MODULE_FILTER.test('/repo/agent-tools/src/restatement-audit/workflows/run-data.ts'),
    ).toBe(true);
    expect(
      RUN_DATA_MODULE_FILTER.test(
        '/repo/agent-tools/src/restatement-audit/workflows/agent-schemas.ts',
      ),
    ).toBe(false);
    expect(
      RUN_DATA_MODULE_FILTER.test('/repo/agent-tools/src/corpus-analysis/workflows/run-data.ts'),
    ).toBe(false);
  });

  it('the plugins carry their registered names', () => {
    expect(agentSchemasInlinePlugin().name).toBe('inline-derived-restatement-audit-agent-schemas');
    expect(runDataInlinePlugin('map', { windows: [] }).name).toBe(
      'inline-restatement-audit-run-data',
    );
  });
});

describe('agentSchemasModuleSource', () => {
  const source = agentSchemasModuleSource();

  it('exports AGENT_JSON_SCHEMAS as a literal that round-trips to the derived schemas', () => {
    const literalJson = source
      .replace('export const AGENT_JSON_SCHEMAS = ', '')
      .replace(/;\s*$/, '');
    expect(JSON.parse(literalJson)).toEqual(deriveAgentJsonSchemas());
  });

  it('is zod-free source with no module system (safe for the sandbox purity scan)', () => {
    expect(source).not.toMatch(/\bzod\b|\bz\./);
    expect(source).not.toMatch(/\bimport\b/);
  });
});

describe('runDataModuleSource', () => {
  it('exports the stage discriminant and RUN_DATA as compact literals that round-trip', () => {
    const data = {
      windows: [{ window: 'W01', files: ['a.md'] }],
      gazetteer: { subjects: {}, statusVocabulary: [] },
    };
    const source = runDataModuleSource('map', data);
    if (!source.ok) {
      expect.fail(`expected generated source, got: ${source.error.message}`);
    }
    const lines = source.value.trimEnd().split('\n');
    expect(lines[0]).toBe('export const RUN_DATA_STAGE = "map";');
    expect(
      JSON.parse((lines[1] ?? '').replace('export const RUN_DATA = ', '').replace(/;$/, '')),
    ).toEqual(data);
    expect(source.value).not.toContain('  "windows"');
  });

  it('refuses unserialisable data (undefined) — an unseeded build must stay unseeded loudly', () => {
    const source = runDataModuleSource('map', undefined);
    expect(!source.ok && source.error.message).toMatch(/run data/i);
  });
});
