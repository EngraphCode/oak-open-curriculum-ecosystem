import { defineConfig } from 'vitest/config';

/**
 * Stryker-only Vitest config for the mutation-testing canary
 * (`.agent/plans/delivery/mutation-testing-core-canary.plan.md`).
 *
 * Historical necessity, now superseded: Stryker's sandbox is built by
 * crawling files at-or-below its working directory only (first-hand
 * verified against `@stryker-mutator/core`'s `ProjectReader.resolveInputFileNames`,
 * which calls `crawlDir(process.cwd())` with no option to widen the root).
 * At the time this duplicate was created, the workspace's real
 * `vitest.config.ts` imported a shared base at the repo root — a file
 * outside any single workspace's sandbox, so it could not resolve inside
 * one (see `mutation-evidence/dry-run.log.txt` for the reproduced
 * failure). The real config now imports
 * `@oaknational/workspace-config/vitest`, which resolves through the
 * sandbox's symlinked `node_modules`, so this duplicate is scheduled for
 * deletion: the isolation plan's todo 3 points `vitest.configFile` at the
 * real `vitest.config.ts` and banks a canary re-run as proof.
 *
 * Until that lands, this file is read by Stryker's vitest runner alone,
 * via `vitest.configFile` in `stryker.config.mjs`.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'coverage', '**/*.e2e.test.ts', 'stryker-tmp'],
  },
});
