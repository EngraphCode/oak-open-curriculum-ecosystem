import { defineConfig, devices } from '@playwright/test';

import { SHOWCASE_ORIGIN, SHOWCASE_PORT } from './tools/showcase-origin';

/**
 * Playwright configuration for the design-showcase demo.
 *
 * The suite's server rides a deterministic per-worktree port so the
 * built-artefact run coexists with anything already serving on the
 * machine — including this workspace's own dev/start instance on 3020 (a
 * live owner-facing server must never have to pause for a push gate;
 * owner-directed after a worked collision, MCP-384). The derivation lives
 * in tools/showcase-origin.ts, shared with the suite's same-origin gate
 * so the two cannot drift apart.
 * An "a11y" title tag splits the suite (estate idiom): `test:ui` greps it
 * out, `test:a11y` greps for it.
 */
const port = SHOWCASE_PORT;
const baseURL = SHOWCASE_ORIGIN;

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
    // Invoked directly (not via the `start` script) so the suite's instance
    // rides the probed port while the script's fixed 3020 stays for humans.
    command: `pnpm exec next start -p ${port}`,
    url: baseURL,
    // Never reuse: in a many-worktree estate a served instance may belong to
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
