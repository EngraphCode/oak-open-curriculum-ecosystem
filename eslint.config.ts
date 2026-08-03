/**
 * Root ESLint Configuration
 *
 * This file is only used when running eslint from the root.
 * Workspaces define their own eslint.config.ts and consume shared standards
 * from @oaknational/eslint-plugin-standards.
 */

import { defineConfig } from 'eslint/config';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import { configs, ignores } from '@oaknational/eslint-plugin-standards';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const thisDir = dirname(fileURLToPath(import.meta.url));

const config = defineConfig(
  {
    ignores,
  },
  ...configs.strict,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: thisDir,
      },
    },
  },
  {
    files: ['runtime-only-scripts/**/*.{js,mjs}'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly' },
      parserOptions: { program: null, project: false, projectService: false },
    },
    rules: {
      ...tseslintPlugin.configs['flat/disable-type-checked'].rules,
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      complexity: 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      'no-console': 'off',
    },
  },
);
export default config;
