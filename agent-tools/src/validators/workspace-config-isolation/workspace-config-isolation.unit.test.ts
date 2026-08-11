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
import { classifyTurboRootInput, scanTurboRootInputs } from './turbo-inputs.js';
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

  it('fires on an absolute target, which runtime resolve would escape to directly', () => {
    const { escapes } = findConfigEscapes({
      file: 'packages/core/result/vitest.e2e.config.ts',
      owner: 'packages/core/result',
      content:
        "setupFiles: [resolve(dirname(fileURLToPath(import.meta.url)), '/etc/outside.ts')],\n",
    });

    expect(escapes).toHaveLength(1);
    expect(escapes[0]?.resolved).toBe('/etc/outside.ts');
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

describe('classifyTurboRootInput — the pinned turbo-glob matcher', () => {
  const tracked = [
    'tsconfig.base.json',
    'research/web-app-deconstruction/pnpm-workspace.yaml',
    'research/web-app-deconstruction/.github/workflows/research.yml',
    'research/web-app-deconstruction/packages/research-evidence/lib/cli.ts',
    'packages/design/oak-design-system/src/tokens/color.ts',
  ];

  it('reports a positive glob with zero tracked matches as dead (the red-proof)', () => {
    expect(
      classifyTurboRootInput('$TURBO_ROOT$/research/web-app-deconstruction/**/*.cjs', tracked),
    ).toEqual({ kind: 'dead' });
  });

  it('matches zero intermediate segments under ** (the turbo.json yaml ruling, dry-run-pinned)', () => {
    expect(
      classifyTurboRootInput('$TURBO_ROOT$/research/web-app-deconstruction/**/*.yaml', tracked),
    ).toEqual({ kind: 'alive' });
  });

  it('matches dot-directory segments (turbo hashes dotfiles; JS glob defaults do not)', () => {
    expect(
      classifyTurboRootInput('$TURBO_ROOT$/research/web-app-deconstruction/**/*.yml', tracked),
    ).toEqual({ kind: 'alive' });
  });

  it('matches any depth under a trailing double-star', () => {
    expect(
      classifyTurboRootInput('$TURBO_ROOT$/packages/design/oak-design-system/**', tracked),
    ).toEqual({ kind: 'alive' });
  });

  it('does not let a single star cross a path separator', () => {
    expect(classifyTurboRootInput('$TURBO_ROOT$/research/*.ts', tracked)).toEqual({
      kind: 'dead',
    });
  });

  it('treats a literal dot as literal, never regex any-char', () => {
    expect(
      classifyTurboRootInput(
        '$TURBO_ROOT$/research/web-app-deconstruction/packages/research-evidence/lib/*.ts',
        ['research/web-app-deconstruction/packages/research-evidence/lib/cliXts'],
      ),
    ).toEqual({ kind: 'dead' });
  });

  it('matches exactly one non-slash character per question mark', () => {
    expect(
      classifyTurboRootInput('$TURBO_ROOT$/tsconfig?base.json', ['tsconfigXbase.json']),
    ).toEqual({
      kind: 'alive',
    });
    expect(
      classifyTurboRootInput('$TURBO_ROOT$/tsconfig?base.json', ['tsconfig/base.json']),
    ).toEqual({
      kind: 'dead',
    });
  });

  it('resolves literal entries through the same tracked set as globs', () => {
    expect(classifyTurboRootInput('$TURBO_ROOT$/tsconfig.base.json', tracked)).toEqual({
      kind: 'alive',
    });
    expect(classifyTurboRootInput('$TURBO_ROOT$/vitest.config.ts', tracked)).toEqual({
      kind: 'dead',
    });
  });

  it('treats a literal naming a tracked DIRECTORY as alive (turbo walks it — probe-measured)', () => {
    expect(
      classifyTurboRootInput('$TURBO_ROOT$/research/web-app-deconstruction/packages', tracked),
    ).toEqual({ kind: 'alive' });
    expect(classifyTurboRootInput('$TURBO_ROOT$/missing-directory', tracked)).toEqual({
      kind: 'dead',
    });
  });

  it('refuses embedded double-stars, which turbo normalises rather than treating as two stars', () => {
    const trailing = classifyTurboRootInput('$TURBO_ROOT$/research/a**', tracked);
    expect(trailing.kind).toBe('unsupported');
    expect(trailing.kind === 'unsupported' && trailing.reason).toContain('double-star');

    const leading = classifyTurboRootInput('$TURBO_ROOT$/**f/x.ts', tracked);
    expect(leading.kind).toBe('unsupported');
  });

  it('exempts negated inputs entirely, including negations carrying unsupported syntax', () => {
    expect(classifyTurboRootInput('!$TURBO_ROOT$/packages/design/dist/**', tracked)).toEqual({
      kind: 'exempt',
    });
    expect(classifyTurboRootInput('!$TURBO_ROOT$/**/{dist,coverage}/**', tracked)).toEqual({
      kind: 'exempt',
    });
  });

  it('refuses brace and extglob syntax by naming the token (the refusal red-proof)', () => {
    const brace = classifyTurboRootInput('$TURBO_ROOT$/packages/{core,libs}/**', tracked);
    expect(brace.kind).toBe('unsupported');
    expect(brace.kind === 'unsupported' && brace.reason).toContain('{');

    const extglob = classifyTurboRootInput('$TURBO_ROOT$/packages/+(core|libs)/**', tracked);
    expect(extglob.kind).toBe('unsupported');
  });

  it('refuses a $TURBO_ROOT$ occurrence outside leading prefix form', () => {
    expect(classifyTurboRootInput('$TURBO_ROOT$', tracked).kind).toBe('unsupported');
    expect(classifyTurboRootInput('packages/$TURBO_ROOT$/x.ts', tracked).kind).toBe('unsupported');
  });
});

describe('scanTurboRootInputs', () => {
  it('reports each dead occurrence with its line in JSONC', () => {
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

    const scan = scanTurboRootInputs({
      turboJsonText,
      trackedFiles: ['tsconfig.base.json'],
    });

    expect(scan.parseErrors).toEqual([]);
    expect(scan.refusals).toEqual([]);
    expect(scan.findings).toEqual([
      { entry: '$TURBO_ROOT$/vitest.config.ts', line: 5 },
      { entry: '$TURBO_ROOT$/vitest.config.ts', line: 8 },
    ]);
  });

  it('ignores $TURBO_ROOT$ strings outside inputs arrays', () => {
    const turboJsonText = '{"tasks": {"test": {"outputs": ["$TURBO_ROOT$/missing/**"]}}}';

    const scan = scanTurboRootInputs({ turboJsonText, trackedFiles: [] });
    expect(scan.findings).toEqual([]);
    expect(scan.refusals).toEqual([]);
  });

  it('routes unsupported pattern syntax to the refusal stream, never to findings', () => {
    const turboJsonText =
      '{"tasks": {"test": {"inputs": ["$TURBO_ROOT$/packages/{core,libs}/**"]}}}';

    const scan = scanTurboRootInputs({ turboJsonText, trackedFiles: ['packages/core/a.ts'] });

    expect(scan.findings).toEqual([]);
    expect(scan.refusals).toHaveLength(1);
    expect(scan.refusals[0]?.line).toBe(1);
    expect(scan.refusals[0]?.reason).toContain('{');
  });

  it('surfaces JSONC parse errors instead of scanning recoverable fragments (the red-proof)', () => {
    // Truncated mid-array: the fault-tolerant visitor would happily visit
    // what it can recover and report a clean scan without onError.
    const truncated = '{"tasks": {"test": {"inputs": ["$TURBO_ROOT$/tsconfig.base.json",';

    const scan = scanTurboRootInputs({
      turboJsonText: truncated,
      trackedFiles: ['tsconfig.base.json'],
    });

    expect(scan.parseErrors.length).toBeGreaterThan(0);
  });
});
