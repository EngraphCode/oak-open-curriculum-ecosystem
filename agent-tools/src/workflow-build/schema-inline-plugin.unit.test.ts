import { describe, expect, it } from 'vitest';

import {
  agentSchemasModuleSource,
  makeAgentSchemasInlinePlugin,
  makeRunDataInlinePlugin,
  runDataModuleSource,
} from './schema-inline-plugin.js';

/**
 * The inline-plugin factories substitute two modules when bundling sandbox artefacts:
 * the module's real `agent-schemas.ts` (which value-imports zod) with a precomputed
 * zod-free literal, and the unseeded `run-data.ts` sentinel with the stage-tagged
 * validated payload. The module-source builders ARE the substitution contract; the
 * filters and real schema derivations are module data, pinned by each module's
 * `build-config.unit.test.ts`. (A mis-wired substitution cannot ship regardless: the
 * sandbox purity scan fails the build if zod survives, and an unseeded artefact fails
 * its stage guard at zero spend.)
 */

const stubDerivation = (): unknown => ({ map: { type: 'object' } });

describe('plugin factories', () => {
  it('the factory-built plugins carry their registered names', () => {
    expect(
      makeAgentSchemasInlinePlugin({ moduleFilter: /x$/, deriveSchemas: stubDerivation }).name,
    ).toBe('inline-derived-agent-schemas');
    expect(
      makeRunDataInlinePlugin({ moduleFilter: /x$/, stage: 'map', data: { windows: [] } }).name,
    ).toBe('inline-run-data');
  });
});

describe('agentSchemasModuleSource', () => {
  const source = agentSchemasModuleSource(stubDerivation);

  it('exports AGENT_JSON_SCHEMAS as a literal that round-trips to the derivation', () => {
    const literalJson = source
      .replace('export const AGENT_JSON_SCHEMAS = ', '')
      .replace(/;\s*$/, '');
    expect(JSON.parse(literalJson)).toEqual(stubDerivation());
  });

  it('is source with no module system (safe for the sandbox purity scan)', () => {
    expect(source).not.toMatch(/\bimport\b/);
  });
});

describe('runDataModuleSource', () => {
  it('exports the stage discriminant and RUN_DATA as compact literals that round-trip', () => {
    const data = { windows: [{ window: 'w01', files: ['a.md'] }] };
    const source = runDataModuleSource('map', data);
    if (!source.ok) {
      expect.fail(`expected generated source, got: ${source.error.message}`);
    }
    const lines = source.value.trimEnd().split('\n');
    expect(lines[0]).toBe('export const RUN_DATA_STAGE = "map";');
    expect(
      JSON.parse((lines[1] ?? '').replace('export const RUN_DATA = ', '').replace(/;$/, '')),
    ).toEqual(data);
    // Compact serialisation — the payload competes with code for the harness size cap.
    expect(source.value).not.toContain('  "windows"');
  });

  it('refuses unserialisable data (undefined) — an unseeded build must stay unseeded loudly', () => {
    const source = runDataModuleSource('map', undefined);
    expect(!source.ok && source.error.message).toMatch(/run data/i);
  });
});
