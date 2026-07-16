/**
 * esbuild plugin: inline the derived agent JSON Schemas into sandbox bundles.
 *
 * @remarks
 * Mirrors `corpus-analysis/workflows/build/schema-inline-plugin.ts`. Stage entries import
 * `AGENT_JSON_SCHEMAS` from the real `../agent-schemas.ts` — fully typed, executable
 * under Node (tests, tooling). That module value-imports zod to derive the schemas, and
 * zod must never enter a sandbox bundle. When bundling workflow artefacts, this plugin
 * substitutes the module with a precomputed literal of the SAME export, derived from the
 * SAME zod SSOT at build time — so the sandbox sees plain data, Node sees the live
 * derivation, and neither can drift from the schemas.
 *
 * The path filters are scoped to `restatement-audit/workflows/` specifically (not the
 * bare `workflows/agent-schemas.ts` corpus-analysis's plugin matches) so bundling a
 * restatement-audit stage never accidentally substitutes corpus-analysis's own module if
 * both ever appear on one esbuild resolve graph.
 *
 * @packageDocumentation
 */

import { err, ok, type Result } from '@oaknational/result';
import type { Plugin } from 'esbuild';

import { deriveAgentJsonSchemas } from '../agent-schemas.js';

/** Resolved-path filter for the module the schema plugin substitutes. */
export const AGENT_SCHEMAS_MODULE_FILTER = /restatement-audit[/\\]workflows[/\\]agent-schemas\.ts$/;

/** Resolved-path filter for the module the run-data plugin substitutes. */
export const RUN_DATA_MODULE_FILTER = /restatement-audit[/\\]workflows[/\\]run-data\.ts$/;

/** The generated zod-free module source substituted for `agent-schemas.ts` in bundles. */
export function agentSchemasModuleSource(): string {
  return `export const AGENT_JSON_SCHEMAS = ${JSON.stringify(deriveAgentJsonSchemas(), null, 2)};\n`;
}

/** Substitute the workflows agent-schemas module with the precomputed literal source. */
export function agentSchemasInlinePlugin(): Plugin {
  return {
    name: 'inline-derived-restatement-audit-agent-schemas',
    setup(build) {
      build.onLoad({ filter: AGENT_SCHEMAS_MODULE_FILTER }, () => ({
        contents: agentSchemasModuleSource(),
        loader: 'ts',
      }));
    },
  };
}

/**
 * The generated seeded run-data module source: the stage discriminant (checked by every
 * sandbox guard, so a wrong-stage seeding is a zero-spend typed failure) plus the data.
 * The data has been zod-validated and stage-projected by the caller
 * (`build-run-artefact`); this only serialises it — COMPACT, because the payload competes
 * with code for the harness script size cap.
 */
export function runDataModuleSource(stage: string, data: unknown): Result<string, Error> {
  const literal: string | undefined = JSON.stringify(data);
  if (literal === undefined) {
    return err(
      new Error(
        'Run data must be JSON-serialisable and defined — refusing to seed an artefact with nothing.',
      ),
    );
  }
  return ok(
    `export const RUN_DATA_STAGE = ${JSON.stringify(stage)};\nexport const RUN_DATA = ${literal};\n`,
  );
}

/**
 * Substitute the workflows run-data module (unseeded sentinel) with the seeded literal.
 * A serialisation failure surfaces as an esbuild load error, failing the whole build.
 */
export function runDataInlinePlugin(stage: string, data: unknown): Plugin {
  return {
    name: 'inline-restatement-audit-run-data',
    setup(build) {
      build.onLoad({ filter: RUN_DATA_MODULE_FILTER }, () => {
        const source = runDataModuleSource(stage, data);
        if (!source.ok) {
          return { errors: [{ text: source.error.message }] };
        }
        return { contents: source.value, loader: 'ts' };
      });
    },
  };
}
