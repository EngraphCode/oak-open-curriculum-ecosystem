import { createHash } from 'node:crypto';

import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the design-showcase demo.
 *
 * The suite's server rides a deterministic per-worktree port derived from
 * this workspace's absolute path, so the built-artefact run coexists with
 * anything already serving on the machine — including this workspace's own
 * dev/start instance on 3020 (a live owner-facing server must never have to
 * pause for a push gate; owner-directed after a worked collision, MCP-384).
 * Derivation, not probing: Playwright evaluates this config once in the main
 * process and again in every worker, so the value must be stable across
 * evaluations — a probed ephemeral port differs per evaluation and the
 * workers navigate to a port nothing serves (worked failure, MCP-384). The
 * derived range (4600-4999) keeps clear of the estate's fixed dev ports
 * (3010 hub, 3020 showcase, 3333/3334 MCP). No `process.env` access — config
 * files follow the same DI principle as product code (app precedent): the
 * adaptation comes from the machine, not the environment.
 * An "a11y" title tag splits the suite (estate idiom): `test:ui` greps it
 * out, `test:a11y` greps for it.
 */
const digest = createHash('sha256')
  .update(import.meta.dirname)
  .digest();
const port = 4600 + (digest.readUInt16BE(0) % 400);
const baseURL = `http://localhost:${port}`;

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
