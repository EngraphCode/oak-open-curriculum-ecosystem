/**
 * esbuild options factory for sandbox workflow bundles.
 *
 * @remarks
 * One options shape for every stage artefact: bundle everything (local imports inlined,
 * types stripped) into one ESM file per entry, `platform: 'neutral'` so the harness
 * globals (`agent`/`parallel`/`phase`/`log`/`args`) remain free identifiers, in-memory
 * output (`write: false`) so the harness emitter and output contract run before any file
 * is written. Mirrors the MCP app's programmatic-esbuild precedent
 * (`apps/oak-curriculum-mcp-streamable-http/build-scripts/esbuild-config.ts`).
 *
 * Module coupling (which schemas to inline, whether to seed run data) arrives as the
 * `plugins` argument — instantiated per module from `schema-inline-plugin.ts`'s
 * factories, composed by `workflow-builder.ts`.
 *
 * @packageDocumentation
 */

import type { BuildOptions, Plugin } from 'esbuild';

/** Build one in-memory ESM bundle per stage entry, ready for the harness emitter. */
export function createWorkflowEsbuildOptions(input: {
  readonly entryPoints: Readonly<Record<string, string>>;
  /** Shapes `outputFiles[].path` (nothing is written — `write: false`). */
  readonly outdir: string;
  /** The module's inline plugins (agent-schemas always; run-data only when seeding). */
  readonly plugins: readonly Plugin[];
}): BuildOptions {
  return {
    entryPoints: { ...input.entryPoints },
    outdir: input.outdir,
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    target: 'es2022',
    write: false,
    sourcemap: false,
    legalComments: 'none',
    plugins: [...input.plugins],
  };
}
