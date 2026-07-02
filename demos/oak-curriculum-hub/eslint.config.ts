/**
 * ESLint configuration for the Curriculum Hub demo (Next.js + React).
 *
 * Consumes the shared next + strict configs from the oak-eslint standards
 * plugin (Next.js + React + TypeScript). `next lint` is deprecated in Next 16,
 * so this workspace lints with ESLint directly via `eslint .`.
 *
 * The demo meets the repo's full strict ruleset — no production-doctrine
 * relaxations. The only overrides below are genuinely contextual:
 * framework-callback typing in config files and the Next-provided
 * `server-only` virtual module. (The former ESLint-10 react-version pin
 * moved into the shared `configs.react` — one canonical workaround.)
 */
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { globalIgnores } from 'eslint/config';
import { configs } from '@oaknational/eslint-plugin-standards';

const thisDir = dirname(fileURLToPath(import.meta.url));

export default [
  // postcss.config.mjs: the strict TS base applies type-aware rules that need
  // a tsconfig project, which a standalone 6-line .mjs config file is not part
  // of — excluded rather than restructured. The vendor/evidence folders are
  // untracked reference data and regenerable tool output — data, not source
  // (see .gitignore for the disposition rationale).
  globalIgnores([
    '.next/**',
    'out/**',
    'next-env.d.ts',
    'node_modules/**',
    'postcss.config.mjs',
    'claude-design-canonical-export/**',
    'vendor-reference/**',
    'demo-evidence/**',
  ]),
  // `configs.strict` is the TypeScript base (typescript-eslint parser + strict
  // rules); `configs.next` adds React + Next.js rules on top (react-only, no
  // parser). Both are needed for a TS + React workspace.
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
    rules: {
      // `server-only` is a Next-provided virtual module: it resolves at build
      // but the import resolver cannot see it. Keep the rule ON, ignore only
      // that specifier (not a blanket disable).
      'import-x/no-unresolved': ['error', { ignore: ['^server-only$'] }],
    },
  },
  {
    // Config files interface with framework callbacks that ship loose/`any`
    // types (e.g. Next's `webpack(config)` hook), so the type-safety rules fire
    // on unavoidable framework shapes. Scoped to config files only — app code
    // keeps these rules.
    files: ['*.config.ts', 'next.config.ts', 'eslint.config.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    // Build tooling (Director-ratified 2026-07-01, mirroring the verified
    // `oak-sdk-codegen` `code-generation/**` precedent): the Course generator
    // fails loud on malformed vendored data — the correct control flow for a
    // build script (ADR-088's Result pattern is app-runtime, not build tooling)
    // — and deep-walks arbitrary JSON, where `Object.keys` is unavoidable.
    // `max-lines` deliberately stays ON: hand-authored tooling holds the length
    // bar (the generator is split into `course-extract.ts` + `generate-course.ts`
    // rather than exempted). App code + real logic keep the full ruleset.
    files: ['scripts/**/*.ts'],
    // Tests OF the tooling hold full strict — a tooling relaxation must never reach a test file
    // (config-expert note, 2026-07-01). Only the tooling itself gets the relaxations.
    ignores: ['scripts/**/*.test.ts'],
    rules: {
      '@oaknational/no-throw-statement': 'off',
      'no-restricted-properties': 'off',
    },
  },
  {
    // Generated data (Director-ratified 2026-07-01, mirroring the codegen
    // `src/types/generated/**` precedent): a machine-emitted content module is
    // not hand-authored, so a hand-authored line budget is a category error.
    // Only `max-lines` is relaxed; the CONSUMER of this data holds full strict,
    // and the `: Course` annotation still compile-time-validates every block.
    files: ['lib/**/*.generated.ts'],
    rules: {
      'max-lines': 'off',
    },
  },
  {
    // Evidence/verification tooling (TypeScript, run via tsx): fails loud on
    // broken preconditions — the same ratified build-tooling class as the
    // scripts/** generator relaxation above — and its stdout IS its interface
    // (reports, evidence paths, pass/fail lines), so console is the product,
    // not stray debug logging. Everything else holds full strict.
    files: ['tools/**/*.ts'],
    rules: {
      '@oaknational/no-throw-statement': 'off',
      'no-console': 'off',
    },
  },
];
