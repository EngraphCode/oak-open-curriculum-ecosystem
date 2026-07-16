import { describe, expect, it } from 'vitest';

import { agentSchemasModuleSource } from '../../../workflow-build/schema-inline-plugin.js';
import { deriveAgentJsonSchemas } from '../agent-schemas.js';
import {
  AGENT_SCHEMAS_MODULE_FILTER,
  BUILD_CONFIG,
  RUN_DATA_MODULE_FILTER,
  STAGE_DEFINITIONS,
} from './build-config.js';

/**
 * The filters and the schema derivation are THIS module's substitution contract with
 * the shared build core. The scoping pins matter: two pipeline modules coexist in this
 * workspace, and a filter that also matches the OTHER module's files would substitute
 * the wrong schemas into a cross-module bundle.
 */

describe('module filters (the substitution targets)', () => {
  it('the schema filter matches only THIS module workflows agent-schemas module', () => {
    expect(
      AGENT_SCHEMAS_MODULE_FILTER.test(
        '/repo/agent-tools/src/restatement-audit/workflows/agent-schemas.ts',
      ),
    ).toBe(true);
    expect(
      AGENT_SCHEMAS_MODULE_FILTER.test(
        '/repo/agent-tools/src/corpus-analysis/workflows/agent-schemas.ts',
      ),
    ).toBe(false);
    expect(
      AGENT_SCHEMAS_MODULE_FILTER.test(
        '/repo/agent-tools/src/restatement-audit/judgment-schemas.ts',
      ),
    ).toBe(false);
  });

  it('the run-data filter matches only THIS module workflows run-data module', () => {
    expect(
      RUN_DATA_MODULE_FILTER.test('/repo/agent-tools/src/restatement-audit/workflows/run-data.ts'),
    ).toBe(true);
    expect(
      RUN_DATA_MODULE_FILTER.test('/repo/agent-tools/src/corpus-analysis/workflows/run-data.ts'),
    ).toBe(false);
    expect(
      RUN_DATA_MODULE_FILTER.test(
        '/repo/agent-tools/src/restatement-audit/workflows/agent-schemas.ts',
      ),
    ).toBe(false);
  });
});

describe('BUILD_CONFIG wiring', () => {
  it('carries the instantiated plugins under their registered names', () => {
    expect(BUILD_CONFIG.agentSchemasPlugin.name).toBe('inline-derived-agent-schemas');
    expect(BUILD_CONFIG.makeRunDataPlugin('map', { windows: [] }).name).toBe('inline-run-data');
  });

  it('registers the four pipeline stages in run order against this module entries', () => {
    expect(STAGE_DEFINITIONS.map((stage) => stage.name)).toStrictEqual([
      'map',
      'reduce',
      'validate',
      'meta',
    ]);
    for (const stage of STAGE_DEFINITIONS) {
      expect(stage.entry).toContain('src/restatement-audit/workflows/');
    }
  });
});

describe('the real derivation through the shared source builder', () => {
  const source = agentSchemasModuleSource(deriveAgentJsonSchemas);

  it('round-trips this module derived schemas', () => {
    const literalJson = source
      .replace('export const AGENT_JSON_SCHEMAS = ', '')
      .replace(/;\s*$/, '');
    expect(JSON.parse(literalJson)).toEqual(deriveAgentJsonSchemas());
  });

  it('is zod-free source (safe for the sandbox purity scan)', () => {
    expect(source).not.toMatch(/\bzod\b|\bz\./);
  });
});
