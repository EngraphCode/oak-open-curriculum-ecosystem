import { describe, expect, it } from 'vitest';

import { createWorkflowEsbuildOptions } from './esbuild-options.js';

/**
 * The behavioural proof of the bundling options lives in the output contract and each
 * module's verification build (every stage bundles contract-green on every
 * `pnpm build`). These tests pin only the factory's own behaviour: the caller's plugins
 * install verbatim, and the sandbox-critical option invariants hold.
 */

describe('createWorkflowEsbuildOptions', () => {
  const options = createWorkflowEsbuildOptions({
    entryPoints: { map: 'src/corpus-analysis/workflows/map.workflow.ts' },
    outdir: 'dist/corpus-analysis/workflows',
    plugins: [{ name: 'inline-derived-agent-schemas', setup: () => undefined }],
  });

  it('installs exactly the plugins the module passes', () => {
    expect(options.plugins?.map((plugin) => plugin.name)).toStrictEqual([
      'inline-derived-agent-schemas',
    ]);
  });

  it('holds the sandbox-critical invariants: in-memory ESM bundle on a neutral platform', () => {
    expect(options.bundle).toBe(true);
    expect(options.format).toBe('esm');
    expect(options.platform).toBe('neutral');
    expect(options.write).toBe(false);
  });
});
