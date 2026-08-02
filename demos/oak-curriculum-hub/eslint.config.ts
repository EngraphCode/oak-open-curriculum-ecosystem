/**
 * ESLint configuration for the Curriculum Hub demo (Next.js + React).
 *
 * Consumes the shared next + strict configs from the oak-eslint standards
 * plugin (Next.js + React + TypeScript). `next lint` is deprecated in Next 16,
 * so this workspace lints with ESLint directly via `eslint .`.
 *
 * The demo is ordinary repo code held to the repo's full strict ruleset —
 * no rule relaxations, no per-path exemptions. Linting scope is the tracked
 * repo files: untracked vendor reference data and regenerable output sit
 * outside the lint corpus via gitignore-awareness (see below), not via
 * per-path exceptions.
 */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { globalIgnores, includeIgnoreFile } from 'eslint/config';
import { configs } from '@oaknational/eslint-plugin-standards';

const thisDir = dirname(fileURLToPath(import.meta.url));

export default [
  // Owner-ratified 2026-07-02: linting scope = tracked repo files; untracked
  // vendor reference data and regenerable output are outside the lint corpus
  // by gitignore, not by per-path exception.
  includeIgnoreFile(join(thisDir, '.gitignore')),
  // Build outputs, plus the design system's vanilla-JS theme runtime: tracked
  // as a served asset in public/ (byte-parity with the workspace package is
  // gated by demos/oak-design-showcase/tools/validate-kit-assets.ts, in the
  // root repo-validators:check chain); served assets are not typed-lint
  // sources.
  globalIgnores(['.next/**', 'out/**', 'next-env.d.ts', 'node_modules/**', 'public/oak-theme.js']),
  // `configs.strict` is the TypeScript base (typescript-eslint parser + strict
  // rules); `configs.next` adds React + Next.js rules on top (react-only, no
  // parser). Both are needed for a TS + React workspace.
  ...configs.strict,
  ...configs.next,
  {
    // One block (and one projectService options object — the service is
    // created once per run, from the first options it sees) covering every
    // lintable source kind. postcss.config.mjs is tracked source and stays in
    // the lint corpus under the full ruleset; it sits outside the tsconfig
    // project (no allowJs), so the type-aware rules get their type
    // information from the project service's default project instead —
    // inclusion, not exemption.
    files: ['**/*.ts', '**/*.tsx', '**/*.mjs'],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.mjs'],
        },
        tsconfigRootDir: thisDir,
      },
    },
  },
];
