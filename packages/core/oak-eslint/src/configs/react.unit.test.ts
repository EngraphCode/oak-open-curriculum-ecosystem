import { describe, expect, it } from 'vitest';
import { Linter } from '@typescript-eslint/utils/ts-eslint';
import type { TSESLint } from '@typescript-eslint/utils';
import { react } from './react.js';

/**
 * Behavioural tests for the react config exported by
 * `@oaknational/eslint-plugin-standards`.
 *
 * @remarks
 * These tests describe a system state: the shared react config MUST be
 * usable under ESLint 10. `eslint-plugin-react` (7.37.5, the latest
 * release) implements `settings.react.version: 'detect'` via
 * `context.getFilename()`, an API ESLint 10 removed — so a config that
 * ships `'detect'` crashes on every file in every consuming workspace.
 * The config therefore carries a literal version pin, centralised here
 * so no consumer needs a local workaround. Revisit the pin when an
 * eslint-plugin-react release lands with ESLint 10 support.
 */

const linter = new Linter({ configType: 'flat' });

const CLASS_COMPONENT_FIXTURE = [
  "import React from 'react';",
  'class Comp extends React.Component {',
  '  componentWillMount() {}',
  '  render() { return null; }',
  '}',
  'export { Comp };',
].join('\n');

function lint(code: string, extraRules: TSESLint.FlatConfig.Rules = {}): readonly string[] {
  const base: TSESLint.FlatConfig.ConfigArray = Array.isArray(react) ? react : [react];
  const config: TSESLint.FlatConfig.ConfigArray = [
    ...base,
    { files: ['**/*.ts'], rules: extraRules },
  ];
  const messages = linter.verify(code, config, { filename: 'fixture.ts' });

  return messages
    .map((message) => message.ruleId)
    .filter((value): value is string => value !== null && value !== undefined);
}

describe('@oaknational/eslint-plugin-standards react config: ESLint 10 usability', () => {
  it('lints a React class component without crashing (version detection never runs)', () => {
    // With `settings.react.version: 'detect'` this call throws
    // "contextOrFilename.getFilename is not a function" while loading the
    // config's own react rules — the pinned literal is what makes the
    // config loadable at all under ESLint 10.
    expect(() => lint(CLASS_COMPONENT_FIXTURE)).not.toThrow();
  });

  it('resolves the pinned version for version-dependent rules', () => {
    // react/no-deprecated needs a resolved React version to know which
    // deprecations apply; componentWillMount is deprecated from React
    // 16.9, so it MUST be reported under the pinned modern version.
    const ruleIds = lint(CLASS_COMPONENT_FIXTURE, { 'react/no-deprecated': 'error' });

    expect(ruleIds).toContain('react/no-deprecated');
  });
});
