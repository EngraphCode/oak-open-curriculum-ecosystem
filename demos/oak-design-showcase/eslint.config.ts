/**
 * ESLint configuration for the design-showcase demo (Next.js + React).
 *
 * Consumes the shared next + strict configs from the oak-eslint standards
 * plugin. The demo is ordinary repo code held to the repo's full strict
 * ruleset — no rule relaxations, no per-path exemptions.
 */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { includeIgnoreFile } from 'eslint/config';
import { configs } from '@oaknational/eslint-plugin-standards';

const thisDir = dirname(fileURLToPath(import.meta.url));

export default [
  // Linting scope = tracked repo files (owner-ratified 2026-07-02, hub
  // precedent): regenerable output sits outside the lint corpus by
  // gitignore, not by per-path exception — the workspace .gitignore is the
  // single ignore authority here.
  includeIgnoreFile(join(thisDir, '.gitignore')),
  // `configs.strict` is the TypeScript base (typescript-eslint parser +
  // strict rules); `configs.next` adds React + Next.js rules on top.
  ...configs.strict,
  ...configs.next,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: thisDir,
      },
    },
  },
];
