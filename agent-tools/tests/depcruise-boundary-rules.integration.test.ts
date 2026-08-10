/**
 * Check-fires proof for the dependency-cruiser boundary rules that
 * enforce the workspace-config isolation and ESM rulings (owner rulings
 * 2026-08-09): `workspace-config-containment`,
 * `workspace-config-no-phantom-deps`, `no-commonjs-require`, and
 * `no-dynamic-import`.
 *
 * The rules under test are imported BY REFERENCE from the real root
 * `.dependency-cruiser.mjs` — never copied — so this suite reddens the
 * moment a rule is renamed, weakened, or deleted. Fixtures live in a
 * temp tree laid out under `packages/core/…` so the rules' workspace
 * regexes match; committed fixture files named like real configs would
 * themselves be scanned by the gates they prove (forbidden — see the
 * workspace-config-isolation unit suite header).
 */

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  makeDepcruiseFixture,
  runDepcruiseJson,
  type DepcruiseFixture,
} from './test-helpers/depcruise-fixture.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const realConfigUrl = pathToFileURL(path.join(repoRoot, '.dependency-cruiser.mjs')).href;

const RULE_NAMES = [
  'workspace-config-containment',
  'workspace-config-no-phantom-deps',
  'no-commonjs-require',
  'no-dynamic-import',
] as const;

const cruiseResultSchema = z.object({
  summary: z.object({
    violations: z.array(
      z.object({
        from: z.string(),
        to: z.string(),
        rule: z.object({ name: z.string(), severity: z.string() }),
      }),
    ),
  }),
});

type CruiseViolation = z.infer<typeof cruiseResultSchema>['summary']['violations'][number];

let fixture: DepcruiseFixture;
let violations: readonly CruiseViolation[];

function violationsMatching(input: {
  readonly ruleName: string;
  readonly from: string;
  readonly to?: string;
}): readonly CruiseViolation[] {
  return violations.filter(
    (violation) =>
      violation.rule.name === input.ruleName &&
      violation.rule.severity === 'error' &&
      violation.from === input.from &&
      (input.to === undefined || violation.to === input.to),
  );
}

beforeAll(() => {
  fixture = makeDepcruiseFixture('oak-depcruise-rules-');
  const write = fixture.writeFile;

  // The fixture config imports the REAL rules AND the real options by
  // reference (only the four rules kept, so fixture noise — orphans,
  // layer rules — stays out). Effective enforcement is forbidden ×
  // options: a rule can be nullified by an options.exclude entry alone,
  // so proving the rules under substitute options proves nothing (the
  // finding-1 class). Only tsConfig/progress/reporterOptions are
  // dropped — they reference repo-root files and terminal state, not
  // enforcement semantics.
  write(
    'dc.mjs',
    [
      `import real from ${JSON.stringify(realConfigUrl)};`,
      `const names = new Set(${JSON.stringify([...RULE_NAMES])});`,
      'const { tsConfig, progress, reporterOptions, ...enforcementOptions } = real.options;',
      'export default {',
      '  forbidden: real.forbidden.filter((rule) => names.has(rule.name)),',
      '  options: enforcementOptions,',
      '};',
      '',
    ].join('\n'),
  );

  // Violating fixtures — one per rule.
  write(
    'packages/core/fixture-a/tsup.config.ts',
    [
      "import { thing } from '../fixture-b/src/thing.js';",
      "import 'not-a-real-package-oak-fixture';",
      'export const config = thing;',
      '',
    ].join('\n'),
  );
  write(
    'packages/core/fixture-a/src/dynamic-site.ts',
    ["export const loaded = import('./target.js');", ''].join('\n'),
  );
  write('packages/core/fixture-a/src/target.js', 'export const target = 1;\n');
  write(
    'packages/core/fixture-a/src/legacy.cjs',
    ["const target = require('./target2.cjs');", 'module.exports = target;', ''].join('\n'),
  );
  write('packages/core/fixture-a/src/target2.cjs', 'module.exports = 2;\n');

  // A resolvable-but-undeclared npm package: the copied-config class the
  // phantom rule exists for. Lives in the fixture's node_modules so the
  // edge must SURVIVE the real options (the finding-1 exclusion class).
  write(
    'node_modules/phantom-pkg/package.json',
    JSON.stringify({ name: 'phantom-pkg', main: 'index.js' }),
  );
  write('node_modules/phantom-pkg/index.js', 'export const phantom = 1;\n');
  write(
    'packages/core/fixture-a/vitest.config.ts',
    ["import 'phantom-pkg';", "import '../fixture-b/dist/built.js';", ''].join('\n'),
  );
  write('packages/core/fixture-b/dist/built.js', 'export const built = 1;\n');

  // Compliant fixture — a config whose imports stay inside its workspace.
  write('packages/core/fixture-b/src/thing.js', 'export const thing = 1;\n');
  write(
    'packages/core/fixture-b/tsup.config.ts',
    ["import { thing } from './src/thing.js';", 'export const config = thing;', ''].join('\n'),
  );

  const stdout = runDepcruiseJson({
    repoRoot,
    fixtureDir: fixture.dir,
    configRelative: 'dc.mjs',
    scanDir: 'packages',
  });
  violations = cruiseResultSchema.parse(JSON.parse(stdout)).summary.violations;
});

afterAll(() => {
  fixture.remove();
});

describe('dependency-cruiser boundary rules (red-proofs against the real config)', () => {
  it('workspace-config-containment fires on a config import that leaves its workspace', () => {
    expect(
      violationsMatching({
        ruleName: 'workspace-config-containment',
        from: 'packages/core/fixture-a/tsup.config.ts',
        to: 'packages/core/fixture-b/src/thing.js',
      }),
    ).toHaveLength(1);
  });

  it('workspace-config-no-phantom-deps fires on an undeclared package specifier', () => {
    expect(
      violationsMatching({
        ruleName: 'workspace-config-no-phantom-deps',
        from: 'packages/core/fixture-a/tsup.config.ts',
        to: 'not-a-real-package-oak-fixture',
      }),
    ).toHaveLength(1);
  });

  it('no-commonjs-require fires on a require() dependency', () => {
    expect(
      violationsMatching({
        ruleName: 'no-commonjs-require',
        from: 'packages/core/fixture-a/src/legacy.cjs',
      }),
    ).toHaveLength(1);
  });

  it('no-dynamic-import fires on a literal dynamic import', () => {
    expect(
      violationsMatching({
        ruleName: 'no-dynamic-import',
        from: 'packages/core/fixture-a/src/dynamic-site.ts',
      }),
    ).toHaveLength(1);
  });

  it('workspace-config-no-phantom-deps survives the real options for a node_modules-resolved undeclared package (the finding-1 class)', () => {
    expect(
      violationsMatching({
        ruleName: 'workspace-config-no-phantom-deps',
        from: 'packages/core/fixture-a/vitest.config.ts',
        to: 'node_modules/phantom-pkg/index.js',
      }),
    ).toHaveLength(1);
  });

  it('workspace-config-containment survives the real options for a relative reach into another workspace’s dist', () => {
    expect(
      violationsMatching({
        ruleName: 'workspace-config-containment',
        from: 'packages/core/fixture-a/vitest.config.ts',
        to: 'packages/core/fixture-b/dist/built.js',
      }),
    ).toHaveLength(1);
  });

  it('stays silent on a config whose imports remain inside its workspace', () => {
    const compliant = violations.filter(
      (violation) => violation.from === 'packages/core/fixture-b/tsup.config.ts',
    );
    expect(compliant).toEqual([]);
  });
});
