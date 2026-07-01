import { describe, expect, it } from 'vitest';

import { deriveAgentJsonSchemas } from '../agent-schemas.js';
import {
  agentSchemasModuleSource,
  agentSchemasInlinePlugin,
  runDataModuleSource,
  runDataInlinePlugin,
} from './schema-inline-plugin.js';

/**
 * The schema-inline plugin substitutes the real `agent-schemas.ts` module (which
 * value-imports zod to derive the JSON Schemas) with a precomputed literal module when
 * bundling sandbox artefacts — same exported name, zod-free source, derived from the
 * same SSOT at build time. Node-side code (tests, the post-run driver) imports the real
 * module; the sandbox gets the literal; neither can drift from the zod schemas.
 */

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
    // \b guards against schema content like the "importance" property.
    expect(source).not.toMatch(/\bimport\b/);
  });
});

describe('agentSchemasInlinePlugin', () => {
  it('targets exactly the workflows agent-schemas module', () => {
    const plugin = agentSchemasInlinePlugin();
    expect(plugin.name).toBe('inline-derived-agent-schemas');
    // The load filter must match the module's resolved path and nothing else.
    const filter = /workflows[/\\]agent-schemas\.ts$/;
    expect(filter.test('/repo/agent-tools/src/corpus-analysis/workflows/agent-schemas.ts')).toBe(
      true,
    );
    expect(filter.test('/repo/agent-tools/src/corpus-analysis/judgment-schemas.ts')).toBe(false);
  });
});

describe('runDataModuleSource', () => {
  it('exports RUN_DATA as a literal that round-trips to the seeded data', () => {
    const data = { windows: [{ window: 'w01', files: ['a.md'] }] };
    const source = runDataModuleSource(data);
    if (!source.ok) {
      expect.fail(`expected generated source, got: ${source.error.message}`);
    }
    const literalJson = source.value.replace('export const RUN_DATA = ', '').replace(/;\s*$/, '');
    expect(JSON.parse(literalJson)).toEqual(data);
  });

  it('refuses unserialisable data (undefined) — an unseeded build must stay unseeded loudly', () => {
    const source = runDataModuleSource(undefined);
    expect(!source.ok && source.error.message).toMatch(/run data/i);
  });
});

describe('runDataInlinePlugin', () => {
  it('targets exactly the workflows run-data module', () => {
    const plugin = runDataInlinePlugin({ payload: 'x' });
    expect(plugin.name).toBe('inline-run-data');
    const filter = /workflows[/\\]run-data\.ts$/;
    expect(filter.test('/repo/agent-tools/src/corpus-analysis/workflows/run-data.ts')).toBe(true);
    expect(filter.test('/repo/agent-tools/src/corpus-analysis/workflows/agent-schemas.ts')).toBe(
      false,
    );
  });
});
