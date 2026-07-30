import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for the design-showcase demo (hub precedent).
 *
 * Component tests run under `happy-dom`; tests live beside the code they
 * prove, named by explicit convention (testing-strategy §Pattern 2).
 * Playwright specs under `tests/` are excluded — they run via `test:ui` /
 * `test:a11y`, never under vitest. No `globals`: tests import their vitest
 * API explicitly, so the type-checker sees exactly what the runtime
 * provides.
 */
export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['{app,components,lib,tools}/**/*.{unit,integration}.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'tests', '**/*.e2e.test.ts'],
  },
});
