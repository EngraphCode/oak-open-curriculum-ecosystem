/**
 * Shared scratch static root for suites that construct the app.
 *
 * @remarks
 * Boot refuses a static root without the copied design system and brand
 * assets, so every `createApp` call needs a servable root. Suites inject
 * this fixture's scratch directory (`CreateAppOptions.staticRoot`) instead
 * of falling through to the `process.cwd()` probe — no test ever reads the
 * workspace's live `public/` tree, so no test can race the build's or dev
 * server's copy step, and a clean tree needs no prior build to run vitest.
 *
 * One copy per worker process: the populated root is memoised at module
 * level and shared by every suite the worker runs. The OS temp dir owns
 * cleanup of the long-lived root; per-test scratch dirs are removed by
 * their suites.
 *
 * Real IO lives here deliberately — this is the `test-helpers/` structural
 * allowlist surface of the `no-real-io-in-tests` rule
 * (`packages/core/oak-eslint/src/rules/no-real-io-in-tests.ts`).
 */

import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { copyOakDs } from '../../build-scripts/copy-oak-ds.js';

let sharedRoot: Promise<string> | undefined;

/** A static root populated with the copied design system and brand assets. */
export function getScratchStaticRoot(): Promise<string> {
  sharedRoot ??= (async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'oak-static-root-'));
    await copyOakDs(root);
    return root;
  })();
  return sharedRoot;
}

/** An empty scratch directory, for describing the boot refusal itself. */
// observability-emission-exempt: test fixture — scratch-dir IO for suites, not a runtime capability
export async function createEmptyStaticRoot(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), 'oak-static-empty-'));
}

/** Remove a scratch directory created by {@link createEmptyStaticRoot}. */
// observability-emission-exempt: test fixture — scratch-dir IO for suites, not a runtime capability
export async function removeStaticRoot(root: string): Promise<void> {
  await rm(root, { recursive: true, force: true });
}
