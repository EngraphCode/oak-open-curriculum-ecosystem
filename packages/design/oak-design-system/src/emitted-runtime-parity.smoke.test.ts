/**
 * Drift gate between the committed root oak-theme.js (what consumers load —
 * CI's static-checks tier reads it off a fresh checkout with no build) and
 * the emitted dist/oak-theme.js (what the build writes). The build is
 * deliberately non-mutating (a turbo cache hit must never skip a tracked
 * write), so the committed copy is synced by hand via the workspace's
 * `sync:runtime` script — and this test turns a forgotten sync into a red
 * gate instead of stale served bytes. Smoke class: it reads both shipped
 * artefacts off disk.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(here, '..');

describe('emitted runtime parity', () => {
  it('the committed root oak-theme.js is byte-identical to the emitted dist/oak-theme.js', () => {
    const committed = readFileSync(join(packageRoot, 'oak-theme.js'), 'utf8');
    const emitted = readFileSync(join(packageRoot, 'dist', 'oak-theme.js'), 'utf8');
    // A mismatch means a source edit was built but not synced: run
    // `pnpm --filter @oaknational/oak-design-system sync:runtime`.
    expect(committed).toBe(emitted);
  });
});
