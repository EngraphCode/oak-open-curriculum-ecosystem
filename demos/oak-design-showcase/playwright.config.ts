import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the design-showcase demo.
 *
 * Port 3020 keeps clear of the MCP server (3333/3334) and the hub (3010)
 * when Turbo runs tasks in parallel. No `process.env` access — config files
 * follow the same DI principle as product code (app precedent).
 * An "a11y" title tag splits the suite (estate idiom): `test:ui` greps it
 * out, `test:a11y` greps for it.
 */
const baseURL = 'http://localhost:3020';

export default defineConfig({
  timeout: 30_000,
  expect: { timeout: 5_000 },
  // A stray test.only would silently narrow test:ui — and empty test:a11y
  // if it landed on a non-a11y test. Fail loudly everywhere instead.
  forbidOnly: true,
  reporter: [['list']],
  webServer: {
    // The production server, not `pnpm dev`: the turbo test:ui / test:a11y
    // tasks depend on `build`, so the suites prove the BUILT artefact — a
    // dev-only pipeline pass cannot green them. Direct runners build first
    // (`pnpm build && pnpm test:ui`); an absent .next fails loudly here.
    command: 'pnpm start',
    url: baseURL,
    // Never reuse: in a many-worktree estate a served 3020 may belong to
    // ANOTHER tree's code; reusing it greens this suite against that tree.
    reuseExistingServer: false,
    timeout: 60_000,
  },
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'showcase',
      testDir: './tests',
      use: {
        ...devices['Desktop Chrome'],
        baseURL,
      },
    },
  ],
});
