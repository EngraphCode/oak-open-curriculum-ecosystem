import { describe, expect, it } from 'vitest';

import {
  GUARD_ROUTING_SHIM,
  GUARD_COMMAND_MARKER,
  REQUIRED_POLICY_MATCHERS,
  findPolicyMatcherDefects,
  findUnroutedGuardCommands,
} from './validate-pretooluse-guard-routing-helpers.js';

const routedDispatch = `node "\${CLAUDE_PROJECT_DIR}/${GUARD_ROUTING_SHIM}" agent-tools/dist/src/hook-policy/pre-tool-use-dispatch.js`;
const directDispatch =
  'node "${CLAUDE_PROJECT_DIR}/agent-tools/dist/src/hook-policy/pre-tool-use-dispatch.js"';
const directLegacyGuard =
  'node "${CLAUDE_PROJECT_DIR}/agent-tools/dist/src/hook-policy/check-blocked-patterns.js"';

describe('findUnroutedGuardCommands', () => {
  it('returns nothing when every dist hook-policy command routes through the shim', () => {
    expect(findUnroutedGuardCommands([routedDispatch])).toStrictEqual([]);
  });

  it('flags a dist hook-policy command that invokes node directly (no shim)', () => {
    expect(findUnroutedGuardCommands([directDispatch])).toStrictEqual([directDispatch]);
  });

  it('flags renamed or legacy artefacts in the same dist family, not just the current basename', () => {
    expect(findUnroutedGuardCommands([directLegacyGuard])).toStrictEqual([directLegacyGuard]);
  });

  it('ignores commands that do not invoke a dist hook-policy artefact', () => {
    const commands = [
      '.claude/hooks/_lib/log-hook-errors.sh .claude/hooks/sonar-secrets/build-scripts/pretool-secrets.sh',
      routedDispatch,
    ];

    expect(findUnroutedGuardCommands(commands)).toStrictEqual([]);
  });

  it('flags only the unrouted command among a mixed set', () => {
    expect(findUnroutedGuardCommands([routedDispatch, directDispatch, 'echo hi'])).toStrictEqual([
      directDispatch,
    ]);
  });

  // Deliberate rename-tripwire, not a constant audit: narrowing the family
  // marker back to an artefact basename is exactly the silent-vacuous-pass
  // regression this validator exists to prevent, so the literal is pinned.
  it('exposes the family marker and shim substrings it keys on', () => {
    expect(GUARD_COMMAND_MARKER).toBe('dist/src/hook-policy/');
    expect(GUARD_ROUTING_SHIM).toBe('.claude/hooks/run-pretooluse-guard.mjs');
  });
});

describe('findPolicyMatcherDefects', () => {
  const fullCoverage = new Map<string, readonly string[]>([
    ['Bash', [routedDispatch]],
    ['Edit', [routedDispatch]],
    ['Write', [routedDispatch]],
  ]);

  // Deliberate coverage-tripwire, not a constant audit: silently dropping a
  // matcher from the required set would hollow out the non-vacuity check
  // while every behaviour test still passed on the remaining matchers.
  it('names the three required policy matchers', () => {
    expect(REQUIRED_POLICY_MATCHERS).toStrictEqual(['Bash', 'Edit', 'Write']);
  });

  it('returns nothing when every required matcher carries exactly one shim-routed dispatcher', () => {
    expect(findPolicyMatcherDefects(fullCoverage)).toStrictEqual([]);
  });

  it('flags a required matcher that is missing entirely (the vacuous-pass hazard)', () => {
    const missingWrite = new Map<string, readonly string[]>([
      ['Bash', [routedDispatch]],
      ['Edit', [routedDispatch]],
    ]);

    const defects = findPolicyMatcherDefects(missingWrite);

    expect(defects).toHaveLength(1);
    expect(defects[0]).toContain('"Write"');
    expect(defects[0]).toContain('carries 0');
  });

  it('flags a matcher whose command exists but does not route through the shim', () => {
    const unrouted = new Map<string, readonly string[]>([
      ['Bash', [directDispatch]],
      ['Edit', [routedDispatch]],
      ['Write', [routedDispatch]],
    ]);

    const defects = findPolicyMatcherDefects(unrouted);

    expect(defects).toHaveLength(1);
    expect(defects[0]).toContain('"Bash"');
  });

  it('flags a matcher carrying duplicate dispatcher commands', () => {
    const doubled = new Map<string, readonly string[]>([
      ['Bash', [routedDispatch, routedDispatch]],
      ['Edit', [routedDispatch]],
      ['Write', [routedDispatch]],
    ]);

    const defects = findPolicyMatcherDefects(doubled);

    expect(defects).toHaveLength(1);
    expect(defects[0]).toContain('carries 2');
  });

  it('ignores non-policy hooks on other matchers', () => {
    const withRead = new Map<string, readonly string[]>([
      ...fullCoverage,
      ['Read', ['.claude/hooks/_lib/log-hook-errors.sh something.sh']],
    ]);

    expect(findPolicyMatcherDefects(withRead)).toStrictEqual([]);
  });
});
