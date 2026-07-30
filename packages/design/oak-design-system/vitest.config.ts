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
 * are SMOKE-class — they read the emitted dist/oak-theme.js off disk and
 * exercise the shipped form (invoked exactly as a browser would, with
 * per-test injected fakes), or assert byte parity between the emitted and
 * committed copies. They are named *.smoke.test.ts; the include below is
 * scoped to exactly that category so the taxonomy's one-category-per-config
 * rule holds.
 */
export default mergeConfig(baseTestConfig, {
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.smoke.test.ts'],
  },
});
