import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for the Curriculum Hub demo.
 *
 * Component tests run under `happy-dom` (the repo's React-testing precedent in
 * `apps/oak-curriculum-mcp-streamable-http/vitest.widget.config.ts`). The demo
 * has no `src/` directory, so tests live beside the code they prove in
 * `components/`, `lib/`, and `app/`. The `@/*` path alias mirrors `tsconfig.json`
 * so tests import via `@/…` exactly as the app does.
 */
const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['{components,lib,app,scripts}/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next'],
  },
  resolve: {
    alias: { '@': rootDir },
  },
});
