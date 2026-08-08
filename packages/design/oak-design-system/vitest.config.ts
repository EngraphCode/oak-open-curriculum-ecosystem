import { mergeConfig } from 'vitest/config';

import { baseTestConfig } from '../../../vitest.config.base';

/**
 * The theme runtime is a browser pre-paint script (document.documentElement,
 * localStorage, matchMedia), so this workspace overrides the base config's
 * node environment with happy-dom — the estate's DOM-test environment
 * (demos/oak-design-showcase/vitest.config.ts is the precedent). Includes and
 * the mandatory e2e exclusion are inherited unchanged.
 *
 * Category note (testing-strategy.md §Test Types): this workspace's suites
 * are INTEGRATION-class by behaviour shape — the system under test (the
 * emitted dist/oak-theme.js) is evaluated inside the test process against
 * injected fakes, or compared byte-for-byte with the committed copy. They
 * are not smoke tests: smoke invokes the artefact exactly as production
 * does, with no fakes and no feature assertions. They are named
 * *.integration.test.ts. The design-review tree's suite is UNIT-class (a
 * pure boundary parser; its committed JSON enters as imported data, never
 * IO); its include is a tree CATCH-ALL because mergeConfig CONCATENATES
 * includes with the base config's — src/ inherits the base catch-all,
 * design-review/ does not, and a category-scoped glob there would let a
 * differently-named future suite silently never run.
 */
export default mergeConfig(baseTestConfig, {
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.integration.test.ts', 'design-review/**/*.test.ts'],
  },
});
