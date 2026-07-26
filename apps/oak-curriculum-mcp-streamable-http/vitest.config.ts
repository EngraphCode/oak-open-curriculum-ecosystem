import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'build-scripts/**/*.unit.test.ts',
      'build-scripts/**/*.integration.test.ts',
      'build-scripts/**/*.unit.test.mjs',
      'build-scripts/**/*.integration.test.mjs',
      'operations/**/*.unit.test.ts',
      'operations/**/*.integration.test.ts',
      'src/**/*.unit.test.ts',
      'src/**/*.unit.test.tsx',
      'src/**/*.integration.test.ts',
      'src/**/*.integration.test.tsx',
    ],
    exclude: ['**/*.e2e.test.ts', '**/*.e2e.test.tsx', '../../.agent/reference/**'],
    globals: true,
    setupFiles: ['src/test.setup.ts'],
  },
});
