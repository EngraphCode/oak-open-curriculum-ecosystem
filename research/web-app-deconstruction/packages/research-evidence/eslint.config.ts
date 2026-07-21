import {
  configs,
  defineConfigArray,
  ignores as globalIgnores,
  testRules,
} from '@oaknational/eslint-plugin-standards';
import globals from 'globals';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const thisDir = dirname(fileURLToPath(import.meta.url));
const wsTsProject = fileURLToPath(new URL('./tsconfig.lint.json', import.meta.url));

// The research-evidence package holds recomputable evidence tooling: CLI
// inventory scripts and pure analysis libraries. Genuine type-safety rules stay
// on (no implicit any, no `as`, no non-null, explicit boundary types, typed
// imports, no floating promises). The house style/complexity/console/property
// rules are relaxed for the tooling code exactly as OCE relaxes them for its own
// `build-scripts/**` (see packages/core/build-metadata/eslint.config.ts) — these
// are single-run analysis scripts, not product runtime.
const toolingRelaxations = {
  complexity: 'off',
  'max-depth': 'off',
  'max-lines': 'off',
  'max-lines-per-function': 'off',
  'max-statements': 'off',
  'no-console': 'off',
  'no-restricted-properties': 'off',
  '@typescript-eslint/no-restricted-types': 'off',
  'sonarjs/cognitive-complexity': 'off',
  // Deterministic code-unit ordering is required for reproducible evidence
  // snapshots; localeCompare (what the rule wants) would change the order.
  'sonarjs/no-alphabetical-sort': 'off',
  // Intentional ANSI-escape (\x1b) stripping of captured terminal output.
  'no-control-regex': 'off',
  // The runtime probes use the TypeScript and Node module compiler/runtime
  // internals (e.g. isTypeOnly, NodeRequire) whose deprecation cadence is
  // upstream; the tooling tracks the installed sibling checkout, not this repo.
  '@typescript-eslint/no-deprecated': 'off',
  // Typing a dynamically-required external module (`typeof import('typescript')`)
  // needs a `import type * as` namespace type import; there is no named
  // alternative for "the whole module's type".
  'import-x/no-namespace': 'off',
} as const;

const config = defineConfigArray(
  {
    ignores: [...globalIgnores, 'dist/**', 'coverage/**', 'fixtures/**', '.turbo/**'],
  },
  configs.strict,
  {
    files: ['lib/**/*.ts', 'scripts/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        projectService: false,
        project: wsTsProject,
        tsconfigRootDir: thisDir,
      },
    },
    rules: toolingRelaxations,
  },
  {
    // Probe tooling parses trusted local artefacts of the MEASURED sibling
    // checkouts (their package.json, git output, OpenAPI schemas) with the
    // shape annotated at the call site — the developer's own checkouts, the
    // same trust class as the build-scripts relaxations above. The
    // validation layer in lib/ keeps the rule ON.
    files: ['scripts/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['tests/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        projectService: false,
        project: wsTsProject,
        tsconfigRootDir: thisDir,
      },
    },
    rules: {
      ...testRules,
      ...toolingRelaxations,
      // The helpers test verifies resolveFromCwd, which is defined in terms of
      // process.cwd(); reproducing that expectation legitimately reads cwd.
      'no-restricted-syntax': 'off',
    },
  },
  {
    files: ['*.config.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: thisDir,
      },
    },
    rules: {
      'import-x/no-relative-packages': 'off',
      'import-x/no-relative-parent-imports': 'off',
    },
  },
);

export default config;
