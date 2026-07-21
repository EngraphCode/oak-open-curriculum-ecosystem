import { describe, expect, it } from 'vitest';

import { findParityGaps, parseCheckLegs, parseCiCoverage } from './check-ci-parity-helpers.js';

/**
 * Fixtures mirror the real shapes: the root `check` aggregate joins legs
 * with `&&`, and workflow YAML carries `run:` lines invoking `pnpm <name>`
 * or `turbo run <tasks…>` with flags interleaved.
 */
const CHECK_SCRIPT =
  'pnpm secrets:scan && pnpm clean && ' +
  'turbo run --continue sdk-codegen build type-check lint test test:e2e && ' +
  'pnpm repo-validators:check && pnpm skills:check && pnpm knip:gate';

const COVERING_WORKFLOW = `
      - name: Secret scan
        run: pnpm secrets:scan
      - name: Build
        run: pnpm exec turbo run sdk-codegen build --continue --log-order=grouped --summarize
      - name: Type-check, lint, unit tests
        run: pnpm exec turbo run type-check lint test --continue
      - name: Browser suites
        run: >-
          pnpm exec turbo run test:e2e --continue
      - name: Validators
        run: pnpm repo-validators:check
      - name: Skills adapters
        run: pnpm skills:check
      - name: Knip
        run: pnpm knip:gate
`;

describe('parseCheckLegs', () => {
  it('splits the aggregate into root scripts and turbo tasks, ignoring flags', () => {
    const legs = parseCheckLegs(CHECK_SCRIPT);

    expect(legs.scripts).toEqual([
      'secrets:scan',
      'clean',
      'repo-validators:check',
      'skills:check',
      'knip:gate',
    ]);
    expect(legs.turboTasks).toEqual([
      'sdk-codegen',
      'build',
      'type-check',
      'lint',
      'test',
      'test:e2e',
    ]);
  });

  it('reads turbo tasks through a pnpm exec prefix', () => {
    const legs = parseCheckLegs('pnpm exec turbo run lint test --continue');

    expect(legs.scripts).toEqual([]);
    expect(legs.turboTasks).toEqual(['lint', 'test']);
  });

  it('does not treat pnpm subcommands as root scripts', () => {
    const legs = parseCheckLegs('pnpm exec playwright install && pnpm run something');

    expect(legs.scripts).toEqual([]);
  });
});

describe('parseCiCoverage', () => {
  it('collects pnpm script invocations and turbo tasks from workflow text', () => {
    const coverage = parseCiCoverage(COVERING_WORKFLOW);

    expect(coverage.scripts.has('secrets:scan')).toBe(true);
    expect(coverage.scripts.has('repo-validators:check')).toBe(true);
    expect(coverage.scripts.has('skills:check')).toBe(true);
    expect(coverage.turboTasks.has('sdk-codegen')).toBe(true);
    expect(coverage.turboTasks.has('test:e2e')).toBe(true);
    expect(coverage.turboTasks.has('--continue')).toBe(false);
    expect(coverage.scripts.has('exec')).toBe(false);
  });

  it('reads turbo tasks across YAML folded-scalar continuation lines', () => {
    const folded = `
      - name: Browser suites (e2e, ui, a11y, widget)
        run: >-
          pnpm exec turbo run test:e2e test:ui test:a11y test:widget
          test:widget:ui test:widget:a11y --continue --log-order=grouped --summarize
      - name: Report Turbo summary
        run: pnpm --filter @oaknational/agent-tools ci-turbo-report
`;
    const coverage = parseCiCoverage(folded);

    expect(coverage.turboTasks.has('test:widget:ui')).toBe(true);
    expect(coverage.turboTasks.has('test:widget:a11y')).toBe(true);
    expect(coverage.turboTasks.has('name:')).toBe(false);
    expect(coverage.turboTasks.has('Report')).toBe(false);
  });

  it('reads pnpm invocations through a -s silence flag', () => {
    const coverage = parseCiCoverage('        run: pnpm -s smoke:esm-import-extensions\n');

    expect(coverage.scripts.has('smoke:esm-import-extensions')).toBe(true);
  });
});

describe('findParityGaps', () => {
  const legs = parseCheckLegs(CHECK_SCRIPT);

  it('reports no gaps when every leg is covered or structurally equivalent', () => {
    const coverage = parseCiCoverage(COVERING_WORKFLOW);

    expect(findParityGaps(legs, coverage, ['clean'])).toEqual([]);
  });

  it('reports a script leg CI does not run', () => {
    const withoutSkills = COVERING_WORKFLOW.replace('run: pnpm skills:check', 'run: true');
    const coverage = parseCiCoverage(withoutSkills);

    expect(findParityGaps(legs, coverage, ['clean'])).toEqual([
      { kind: 'script', name: 'skills:check' },
    ]);
  });

  it('reports a turbo task CI does not run', () => {
    const withoutE2e = COVERING_WORKFLOW.replace('pnpm exec turbo run test:e2e --continue', 'true');
    const coverage = parseCiCoverage(withoutE2e);

    expect(findParityGaps(legs, coverage, ['clean'])).toEqual([
      { kind: 'turbo-task', name: 'test:e2e' },
    ]);
  });

  it('does not silently pass a script missing from the equivalence list', () => {
    const coverage = parseCiCoverage(COVERING_WORKFLOW);

    expect(findParityGaps(legs, coverage, [])).toEqual([{ kind: 'script', name: 'clean' }]);
  });
});
