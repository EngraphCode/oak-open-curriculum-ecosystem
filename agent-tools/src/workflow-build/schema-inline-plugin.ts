/**
 * esbuild plugin factories: inline derived agent JSON Schemas into sandbox bundles.
 *
 * @remarks
 * Stage entries import `AGENT_JSON_SCHEMAS` from their module's real
 * `workflows/agent-schemas.ts` — fully typed, and executable under Node (tests,
 * tooling). That module value-imports zod to derive the schemas, and zod must never
 * enter a sandbox bundle. When bundling workflow artefacts, the plugin substitutes the
 * module with a precomputed literal of the SAME export, derived from the SAME zod SSOT
 * at build time — so the sandbox sees plain data, Node sees the live derivation, and
 * neither can drift from the schemas.
 *
 * The factories take the consuming module's resolved-path filters (scoped to that
 * module's `workflows/` directory, never a bare `workflows/agent-schemas.ts$` — two
 * pipeline modules coexist in this workspace, and an unscoped filter would substitute
 * the WRONG module's schemas into a bundle that crosses module boundaries) and its
 * schema derivation. Each module instantiates its plugins once in its own
 * `workflows/build/build-config.ts`.
 *
 * @packageDocumentation
 */

import { err, ok, type Result } from '@oaknational/result';
import type { Plugin } from 'esbuild';

/** The generated zod-free module source substituted for `agent-schemas.ts` in bundles. */
export function agentSchemasModuleSource(deriveSchemas: () => unknown): string {
  return `export const AGENT_JSON_SCHEMAS = ${JSON.stringify(deriveSchemas(), null, 2)};\n`;
}

/** Substitute the module's agent-schemas module with the precomputed literal source. */
export function makeAgentSchemasInlinePlugin(input: {
  /** Resolved-path filter for the module's `workflows/agent-schemas.ts` (module-scoped). */
  readonly moduleFilter: RegExp;
  /** The module's zod-SSOT schema derivation, evaluated at build time. */
  readonly deriveSchemas: () => unknown;
}): Plugin {
  return {
    name: 'inline-derived-agent-schemas',
    setup(build) {
      build.onLoad({ filter: input.moduleFilter }, () => ({
        contents: agentSchemasModuleSource(input.deriveSchemas),
        loader: 'ts',
      }));
    },
  };
}

/**
 * The generated seeded run-data module source: the stage discriminant (checked by every
 * sandbox guard, so a wrong-stage seeding is a zero-spend typed failure) plus the data.
 * The data has been zod-validated and stage-projected by the caller
 * (`build-run-artefact`); this only serialises it — COMPACT, because the payload
 * competes with code for the harness script size cap and nobody reads a seeded
 * artefact's data block.
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
 * Substitute the module's run-data module (unseeded sentinel) with the seeded literal.
 * A serialisation failure surfaces as an esbuild load error, failing the whole build.
 */
export function makeRunDataInlinePlugin(input: {
  /** Resolved-path filter for the module's `workflows/run-data.ts` (module-scoped). */
  readonly moduleFilter: RegExp;
  readonly stage: string;
  readonly data: unknown;
}): Plugin {
  return {
    name: 'inline-run-data',
    setup(build) {
      build.onLoad({ filter: input.moduleFilter }, () => {
        const source = runDataModuleSource(input.stage, input.data);
        if (!source.ok) {
          return { errors: [{ text: source.error.message }] };
        }
        return { contents: source.value, loader: 'ts' };
      });
    },
  };
}
