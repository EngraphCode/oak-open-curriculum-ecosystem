import { describe, expect, it } from 'vitest';

import { createWorkflowEsbuildOptions } from './esbuild-options.js';

/**
 * The options factory pins the bundling shape the sandbox requires: everything inlined
 * into one ESM file per stage (imports resolved, types stripped), platform-neutral so
 * the harness globals stay free identifiers, in-memory output so the harness emitter
 * transforms before anything is written.
 */

describe('createWorkflowEsbuildOptions', () => {
  const options = createWorkflowEsbuildOptions({
    entryPoints: { echo: 'src/corpus-analysis/workflows/echo.workflow.ts' },
    outdir: 'dist/corpus-analysis/workflows',
  });

  it('bundles to self-contained ESM for a neutral platform', () => {
    expect(options.bundle).toBe(true);
    expect(options.format).toBe('esm');
    expect(options.platform).toBe('neutral');
    expect(options.target).toBe('es2022');
  });

  it('emits in memory only — the harness emitter transforms before writing', () => {
    expect(options.write).toBe(false);
  });

  it('carries no sourcemap (the artefact is submitted to the harness, not debugged on disk)', () => {
    expect(options.sourcemap).toBe(false);
  });

  it('installs the schema-inline plugin', () => {
    expect(options.plugins?.map((plugin) => plugin.name)).toContain('inline-derived-agent-schemas');
  });

  it('passes the entry points and outdir through', () => {
    expect(options.entryPoints).toEqual({ echo: 'src/corpus-analysis/workflows/echo.workflow.ts' });
    expect(options.outdir).toBe('dist/corpus-analysis/workflows');
  });

  it('seeds the run-data plugin only when run data is provided', () => {
    expect(options.plugins?.map((plugin) => plugin.name)).not.toContain('inline-run-data');
    const seeded = createWorkflowEsbuildOptions({
      entryPoints: { echo: 'src/corpus-analysis/workflows/echo.workflow.ts' },
      outdir: 'dist/corpus-analysis/workflows',
      runData: { payload: 'x' },
    });
    expect(seeded.plugins?.map((plugin) => plugin.name)).toContain('inline-run-data');
  });
});
