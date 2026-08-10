/**
 * Behavioural contract for the workspace-config-isolation helpers.
 *
 * Every fixture is an inline string, never a committed file: a fixture
 * file named like a real config would itself be scanned by the gate it
 * proves (and exempting it would weaken the gate — forbidden). Each
 * suite carries the red-proof: the check demonstrably FIRES on the
 * violation class before it guards anything.
 */

import { describe, expect, it } from 'vitest';

import { findConfigEscapes } from './containment.js';
import { isStaleTurboRootInput, scanTurboRootInputs } from './turbo-inputs.js';
import {
  expandWorkspaceGlobs,
  isDegenerateScan,
  isWorkspaceConfigFile,
  resolveOwner,
} from './workspace-topology.js';

describe('isWorkspaceConfigFile', () => {
  it('matches the vitest config family at any suffix depth', () => {
    expect(isWorkspaceConfigFile('packages/core/result/vitest.config.ts')).toBe(true);
    expect(isWorkspaceConfigFile('apps/oak-search-cli/vitest.e2e.config.ts')).toBe(true);
    expect(isWorkspaceConfigFile('apps/oak-search-cli/vitest.smoke.config.ts')).toBe(true);
    expect(isWorkspaceConfigFile('apps/oak-search-cli/vitest.experiment.config.ts')).toBe(true);
  });

  it('matches tsup, eslint, and stryker configs across extensions', () => {
    expect(isWorkspaceConfigFile('packages/core/result/tsup.config.ts')).toBe(true);
    expect(isWorkspaceConfigFile('packages/core/env/eslint.config.ts')).toBe(true);
    expect(isWorkspaceConfigFile('packages/core/type-helpers/stryker.config.mjs')).toBe(true);
  });

  it('rejects non-config sources, declarations, and other tools', () => {
    expect(isWorkspaceConfigFile('packages/core/result/src/index.ts')).toBe(false);
    expect(isWorkspaceConfigFile('packages/core/result/vitest.config.d.ts')).toBe(false);
    expect(isWorkspaceConfigFile('commitlint.config.mjs')).toBe(false);
    expect(isWorkspaceConfigFile('knip.config.ts')).toBe(false);
  });
});

describe('expandWorkspaceGlobs', () => {
  const tracked = [
    'agent-tools/package.json',
    'packages/core/result/package.json',
    'packages/design/oak-design-ink/package.json',
    'packages/design/oak-design-react/package.json',
    'packages/design/oak-design-react/src/index.ts',
    'research/web-app-deconstruction/packages/research-evidence/package.json',
  ];

  it('keeps literal members and expands star globs to package.json holders', () => {
    const dirs = expandWorkspaceGlobs(
      ['agent-tools', 'packages/core/result', 'packages/design/*'],
      tracked,
    );

    expect(dirs).toEqual([
      'agent-tools',
      'packages/core/result',
      'packages/design/oak-design-ink',
      'packages/design/oak-design-react',
    ]);
  });

  it('keeps nested members whose parents are not members', () => {
    const dirs = expandWorkspaceGlobs(
      ['research/web-app-deconstruction/packages/research-evidence'],
      tracked,
    );

    expect(dirs).toEqual(['research/web-app-deconstruction/packages/research-evidence']);
  });
});

describe('resolveOwner', () => {
  const workspaces = [
    'agent-tools',
    'packages/core/result',
    'research/web-app-deconstruction/packages/research-evidence',
  ];

  it('picks the longest matching workspace prefix', () => {
    expect(
      resolveOwner(
        workspaces,
        'research/web-app-deconstruction/packages/research-evidence/vitest.config.ts',
      ),
    ).toBe('research/web-app-deconstruction/packages/research-evidence');
    expect(resolveOwner(workspaces, 'packages/core/result/tsup.config.ts')).toBe(
      'packages/core/result',
    );
  });

  it('assigns the repo root to files outside every workspace', () => {
    expect(resolveOwner(workspaces, 'eslint.config.ts')).toBe('');
  });

  it('does not treat a sibling name prefix as containment', () => {
    expect(
      resolveOwner(['packages/core/result'], 'packages/core/result-extras/tsup.config.ts'),
    ).toBe('');
  });
});

describe('findConfigEscapes — static specifiers are the resolver’s job', () => {
  it('does not scan static import specifiers (dependency-cruiser owns them)', () => {
    const { escapes, unanalysable } = findConfigEscapes({
      file: 'packages/core/result/vitest.config.ts',
      owner: 'packages/core/result',
      content:
        "import { baseTestConfig } from '@oaknational/workspace-config/vitest';\n" +
        "import { helper } from './src/helper.js';\n",
    });

    expect(escapes).toEqual([]);
    expect(unanalysable).toEqual([]);
  });
});

describe('findConfigEscapes — path arithmetic', () => {
  it('fires on an import.meta.url resolve that leaves the workspace', () => {
    const { escapes } = findConfigEscapes({
      file: 'packages/core/result/vitest.e2e.config.ts',
      owner: 'packages/core/result',
      content:
        "setupFiles: [resolve(dirname(fileURLToPath(import.meta.url)), '../../../test.setup.no-network.ts')],\n",
    });

    expect(escapes).toHaveLength(1);
    expect(escapes[0]?.resolved).toBe('test.setup.no-network.ts');
  });

  it('passes an import.meta.url resolve that stays inside the workspace', () => {
    const { escapes } = findConfigEscapes({
      file: 'packages/core/workspace-config/src/vitest.e2e.config.base.ts',
      owner: 'packages/core/workspace-config',
      content:
        "setupFiles: [resolve(dirname(fileURLToPath(import.meta.url)), 'no-network.setup.ts')],\n",
    });

    expect(escapes).toEqual([]);
  });
});

describe('findConfigEscapes — comments are not code', () => {
  it('ignores import() mentioned in comments (the type-helpers JSDoc note)', () => {
    const { escapes, unanalysable } = findConfigEscapes({
      file: 'packages/core/type-helpers/eslint.config.ts',
      owner: 'packages/core/type-helpers',
      content:
        '// JSDoc `@type {import(...)}` is the typing mechanism for a plain-JS\n' +
        '/* block comments may also mention import("anything") freely */\n',
    });

    expect(escapes).toEqual([]);
    expect(unanalysable).toEqual([]);
  });

  it('ignores a commented-out path-arithmetic escape', () => {
    const { escapes } = findConfigEscapes({
      file: 'packages/core/result/vitest.e2e.config.ts',
      owner: 'packages/core/result',
      content:
        '// setupFiles: [resolve(dirname(fileURLToPath(import.meta.url)), ' +
        "'../../../test.setup.no-network.ts')],\n",
    });

    expect(escapes).toEqual([]);
  });

  it('still fires on code that precedes a trailing comment', () => {
    const { escapes } = findConfigEscapes({
      file: 'packages/core/result/vitest.e2e.config.ts',
      owner: 'packages/core/result',
      content:
        'const setup = resolve(dirname(fileURLToPath(import.meta.url)), ' +
        "'../../../test.setup.no-network.ts'); // legacy root reach\n",
    });

    expect(escapes).toHaveLength(1);
  });
});

describe('isDegenerateScan', () => {
  it('refuses a zero-workspace scan (the manifest-tidy red-proof)', () => {
    expect(isDegenerateScan({ workspaceCount: 0, configFileCount: 55 })).toBe(true);
  });

  it('refuses a zero-config-file scan (the family-rename red-proof)', () => {
    expect(isDegenerateScan({ workspaceCount: 34, configFileCount: 0 })).toBe(true);
  });

  it('passes a populated scan set', () => {
    expect(isDegenerateScan({ workspaceCount: 34, configFileCount: 103 })).toBe(false);
  });
});

describe('findConfigEscapes — unanalysable constructs fail loud', () => {
  it('flags a non-literal dynamic import', () => {
    const { unanalysable } = findConfigEscapes({
      file: 'packages/core/result/tsup.config.ts',
      owner: 'packages/core/result',
      content: 'const mod = await import(configPath);\n',
    });

    expect(unanalysable).toHaveLength(1);
    expect(unanalysable[0]?.line).toBe(1);
  });

  it('flags an import.meta.url resolve whose target is not a literal', () => {
    const { unanalysable } = findConfigEscapes({
      file: 'packages/core/result/vitest.e2e.config.ts',
      owner: 'packages/core/result',
      content: 'setupFiles: [resolve(dirname(fileURLToPath(import.meta.url)), setupPath)],\n',
    });

    expect(unanalysable).toHaveLength(1);
  });
});

describe('isStaleTurboRootInput', () => {
  const exists = (present: readonly string[]) => (candidate: string) => present.includes(candidate);

  it('fires on a literal input naming a missing file (the red-proof)', () => {
    expect(isStaleTurboRootInput('$TURBO_ROOT$/vitest.config.ts', exists([]))).toBe(true);
  });

  it('passes a literal input naming an existing file', () => {
    expect(
      isStaleTurboRootInput('$TURBO_ROOT$/tsconfig.base.json', exists(['tsconfig.base.json'])),
    ).toBe(false);
  });

  it('exempts negated inputs entirely', () => {
    expect(isStaleTurboRootInput('!$TURBO_ROOT$/packages/design/dist/**', exists([]))).toBe(false);
  });

  it('requires only the leading literal prefix for glob inputs', () => {
    const fileExists = exists(['research/web-app-deconstruction']);
    expect(
      isStaleTurboRootInput('$TURBO_ROOT$/research/web-app-deconstruction/**/*.ts', fileExists),
    ).toBe(false);
    expect(isStaleTurboRootInput('$TURBO_ROOT$/missing-dir/**', fileExists)).toBe(true);
  });
});

describe('scanTurboRootInputs', () => {
  it('reports each stale occurrence with its line in JSONC', () => {
    const turboJsonText = [
      '{',
      '  // pipeline',
      '  "tasks": {',
      '    "test": {',
      '      "inputs": ["$TURBO_ROOT$/vitest.config.ts", "$TURBO_ROOT$/tsconfig.base.json"]',
      '    },',
      '    "mutate": {',
      '      "inputs": ["$TURBO_ROOT$/vitest.config.ts"]',
      '    }',
      '  }',
      '}',
    ].join('\n');

    const findings = scanTurboRootInputs({
      turboJsonText,
      fileExists: (candidate) => candidate === 'tsconfig.base.json',
    });

    expect(findings).toEqual([
      { entry: '$TURBO_ROOT$/vitest.config.ts', line: 5 },
      { entry: '$TURBO_ROOT$/vitest.config.ts', line: 8 },
    ]);
  });

  it('ignores $TURBO_ROOT$ strings outside inputs arrays', () => {
    const turboJsonText = '{"tasks": {"test": {"outputs": ["$TURBO_ROOT$/missing/**"]}}}';

    expect(scanTurboRootInputs({ turboJsonText, fileExists: () => false })).toEqual([]);
  });
});
