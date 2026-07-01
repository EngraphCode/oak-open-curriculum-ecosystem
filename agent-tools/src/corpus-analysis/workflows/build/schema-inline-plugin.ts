/**
 * esbuild plugin: inline the derived agent JSON Schemas into sandbox bundles.
 *
 * @remarks
 * Stage entries import `AGENT_JSON_SCHEMAS` from the real `../agent-schemas.ts` — fully
 * typed, and executable under Node (tests, tooling). That module value-imports zod to
 * derive the schemas, and zod must never enter a sandbox bundle. When bundling workflow
 * artefacts, this plugin substitutes the module with a precomputed literal of the SAME
 * export, derived from the SAME zod SSOT at build time — so the sandbox sees plain data,
 * Node sees the live derivation, and neither can drift from the schemas.
 *
 * @packageDocumentation
 */

import { err, ok, type Result } from '@oaknational/result';
import type { Plugin } from 'esbuild';

import { deriveAgentJsonSchemas } from '../agent-schemas.js';

/** The generated zod-free module source substituted for `agent-schemas.ts` in bundles. */
export function agentSchemasModuleSource(): string {
  return `export const AGENT_JSON_SCHEMAS = ${JSON.stringify(deriveAgentJsonSchemas(), null, 2)};\n`;
}

/** Substitute the workflows agent-schemas module with the precomputed literal source. */
export function agentSchemasInlinePlugin(): Plugin {
  return {
    name: 'inline-derived-agent-schemas',
    setup(build) {
      build.onLoad({ filter: /workflows[/\\]agent-schemas\.ts$/ }, () => ({
        contents: agentSchemasModuleSource(),
        loader: 'ts',
      }));
    },
  };
}

/**
 * The generated seeded run-data module source. The data has been zod-validated and
 * stage-projected by the caller (`build-run-artefact`); this only serialises it.
 */
export function runDataModuleSource(data: unknown): Result<string, Error> {
  const literal: string | undefined = JSON.stringify(data, null, 2);
  if (literal === undefined) {
    return err(
      new Error(
        'Run data must be JSON-serialisable and defined — refusing to seed an artefact with nothing.',
      ),
    );
  }
  return ok(`export const RUN_DATA = ${literal};\n`);
}

/**
 * Substitute the workflows run-data module (unseeded sentinel) with the seeded literal.
 * A serialisation failure surfaces as an esbuild load error, failing the whole build.
 */
export function runDataInlinePlugin(data: unknown): Plugin {
  return {
    name: 'inline-run-data',
    setup(build) {
      build.onLoad({ filter: /workflows[/\\]run-data\.ts$/ }, () => {
        const source = runDataModuleSource(data);
        if (!source.ok) {
          return { errors: [{ text: source.error.message }] };
        }
        return { contents: source.value, loader: 'ts' };
      });
    },
  };
}
