import { defineConfig, type Plugin } from 'vitest/config';

/**
 * Resolve the baked landing-page artefact import to a fixed placeholder.
 *
 * @remarks
 * The deploy graph imports `.generated/landing-page.html` as an inlined
 * string (esbuild `text` loader; see `build-scripts/esbuild-config.ts`).
 * Vitest has no text loader, so this plugin resolves EXACTLY that artefact
 * specifier — nothing else — to a fixed placeholder. Deliberately NOT the
 * real artefact: reading it would make what the suite exercises depend on
 * whether a build ran first. Baked-page CONTENT is asserted in
 * build-scripts suites against the artefact itself, never through this
 * seam; `src/server.unit.test.ts` only needs the module to import.
 */
function bakedLandingPageAsText(): Plugin {
  const ARTEFACT_SUFFIX = '/.generated/landing-page.html';
  // Rollup virtual-module convention: the \0 prefix tells other plugins and
  // resolvers not to touch this id.
  const RESOLVED_ID = '\0baked-landing-page-placeholder';
  const PLACEHOLDER =
    '<!-- vitest placeholder: baked landing page (content is asserted in build-scripts suites) -->';
  return {
    name: 'baked-landing-page-as-text',
    // 'pre' is load-bearing: with the artefact present on disk, Vite's core
    // resolver would otherwise win and feed raw HTML to import analysis.
    enforce: 'pre',
    resolveId(source) {
      return source.endsWith(ARTEFACT_SUFFIX) ? RESOLVED_ID : null;
    },
    load(id) {
      return id === RESOLVED_ID ? `export default ${JSON.stringify(PLACEHOLDER)};` : null;
    },
  };
}

export default defineConfig({
  plugins: [bakedLandingPageAsText()],
  test: {
    environment: 'node',
    include: [
      'build-scripts/**/*.unit.test.ts',
      'build-scripts/**/*.integration.test.ts',
      'build-scripts/**/*.unit.test.mjs',
      'build-scripts/**/*.integration.test.mjs',
      'operations/**/*.unit.test.ts',
      'operations/**/*.integration.test.ts',
      'src/**/*.unit.test.ts',
      'src/**/*.unit.test.tsx',
      'src/**/*.integration.test.ts',
      'src/**/*.integration.test.tsx',
    ],
    exclude: ['**/*.e2e.test.ts', '**/*.e2e.test.tsx', '../../.agent/reference/**'],
    globals: true,
    setupFiles: ['src/test.setup.ts'],
  },
});
