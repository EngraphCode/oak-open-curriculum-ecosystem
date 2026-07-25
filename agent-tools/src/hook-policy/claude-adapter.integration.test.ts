import { ok } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import {
  bashRoute,
  claudeContentRoute,
  claudePolicyRoutes,
  copilotCompatStringRoute,
} from './claude-adapter.js';
import type { PolicyRouteContext } from './dispatcher.js';
import type { PolicySnapshot } from './policy-snapshot.js';

/** Names of the production routes whose match predicate accepts the payload. */
function matchedRouteNames(hookInput: unknown): readonly string[] {
  return claudePolicyRoutes.filter((route) => route.matches(hookInput)).map((route) => route.name);
}

/** Build a route context with safe defaults; the snapshot accessor throws unless overridden. */
function contextFor(
  hookInput: unknown,
  overrides: Partial<PolicyRouteContext> = {},
): PolicyRouteContext {
  return {
    hookInput,
    getSnapshot: () => Promise.reject(new Error('snapshot access not expected in this test')),
    bashPatterns: undefined,
    contentPatterns: undefined,
    scopedBlocks: undefined,
    readPriorContent: () => null,
    ...overrides,
  };
}

/** A fully-populated synthetic snapshot for section-fallback tests. */
function snapshotWith(overrides: Partial<PolicySnapshot> = {}): PolicySnapshot {
  return {
    bashPatterns: ok([]),
    contentPatterns: ok([]),
    scopedBlocks: ok([]),
    ...overrides,
  };
}

describe('route match predicates', () => {
  it('bash route matches every recorded command container variant', () => {
    const variants: readonly unknown[] = [
      { tool_name: 'Bash', tool_input: { command: 'git status' } },
      { toolInput: { command: 'git status' } },
      { command: 'git status' },
      { parameters: { command: 'git status' } },
    ];

    for (const variant of variants) {
      expect(matchedRouteNames(variant)).toStrictEqual(['bash']);
    }
  });

  it('a tool_name-less Edit object matches only the claude-content route', () => {
    const payload = {
      tool_input: { new_string: 'updated text', old_string: 'original text' },
    };

    expect(matchedRouteNames(payload)).toStrictEqual(['claude-content']);
  });

  it('a Write shape with file_path matches only the claude-content route', () => {
    const payload = {
      tool_name: 'Write',
      tool_input: { file_path: 'notes.md', content: 'plain content' },
    };

    expect(matchedRouteNames(payload)).toStrictEqual(['claude-content']);
  });

  it('a string tool_input matches only the copilot-compat string route', () => {
    const payload = {
      tool_name: 'Edit',
      tool_input: '*** Begin Patch\n*** Add File: a.txt\n+hello\n*** End Patch\n',
    };

    expect(matchedRouteNames(payload)).toStrictEqual(['copilot-compat-string']);
  });

  it('a synthetic payload carrying both command and new_string matches two routes', () => {
    const payload = { command: 'git status', new_string: 'updated text' };

    expect(matchedRouteNames(payload)).toStrictEqual(['bash', 'claude-content']);
  });

  it('an empty object matches zero routes', () => {
    expect(matchedRouteNames({})).toStrictEqual([]);
  });

  it('content matching over-approximates: writable content in any container matches', () => {
    // tool_input is an object without writable content, so extraction throws
    // even though the root carries new_string. The predicate matches anyway so
    // the payload fails closed in extraction rather than falling to a route
    // that would answer it with no content check at all.
    const payload = { tool_input: { irrelevant: true }, new_string: 'updated text' };

    expect(claudeContentRoute.matches(payload)).toBe(true);
  });

  it('a payload hiding writable content under a command-bearing tool_input fails closed on ambiguity', () => {
    // The pre-unification Edit runner exited 2 on this shape. Without the
    // over-approximating content predicate it would match the bash route alone
    // and be allowed, with the root-level written content never policy-checked.
    const payload = { tool_input: { command: 'ls' }, new_string: 'unchecked content' };

    expect(matchedRouteNames(payload)).toStrictEqual(['bash', 'claude-content']);
  });
});

describe('bash route evaluation', () => {
  it('denies through injected bashPatterns without touching the snapshot', async () => {
    const context = contextFor(
      { tool_name: 'Bash', tool_input: { command: 'git commit --no-verify' } },
      { bashPatterns: ['git --no-verify'] },
    );

    await expect(bashRoute.evaluate(context)).resolves.toStrictEqual({
      kind: 'deny-bash-pattern',
      entry: { pattern: 'git --no-verify' },
    });
  });

  it('unwraps the snapshot bash section when no patterns are injected', async () => {
    const context = contextFor(
      { tool_input: { command: 'git push origin HEAD --force' } },
      {
        getSnapshot: () =>
          Promise.resolve(snapshotWith({ bashPatterns: ok(['git push --force']) })),
      },
    );

    await expect(bashRoute.evaluate(context)).resolves.toStrictEqual({
      kind: 'deny-bash-pattern',
      entry: { pattern: 'git push --force' },
    });
  });
});

describe('content route evaluation', () => {
  it('denies an added owner marker through injected content sections', async () => {
    const context = contextFor(
      { tool_input: { new_string: 'now with secret-marker', old_string: 'clean' } },
      { contentPatterns: ['secret-marker'], scopedBlocks: [] },
    );

    await expect(claudeContentRoute.evaluate(context)).resolves.toStrictEqual({
      kind: 'deny-content-pattern',
      pattern: 'secret-marker',
    });
  });

  it('resolves Write prior content through the injected reader', async () => {
    const context = contextFor(
      { tool_input: { file_path: '/repo/notes.md', content: 'keeps existing-marker intact' } },
      {
        contentPatterns: ['existing-marker'],
        scopedBlocks: [],
        readPriorContent: () => 'prior text with existing-marker present',
      },
    );

    await expect(claudeContentRoute.evaluate(context)).resolves.toStrictEqual({ kind: 'allow' });
  });

  it('falls back to the snapshot scoped_blocks section when only contentPatterns is injected', async () => {
    const context = contextFor(
      {
        tool_input: {
          new_string: 'we will carve out an allowance',
          old_string: 'we will decide',
          file_path: '/repo/.agent/plans/example.plan.md',
        },
      },
      {
        contentPatterns: [],
        getSnapshot: () =>
          Promise.resolve(
            snapshotWith({
              scopedBlocks: ok([
                {
                  concept: 'expediency-hedging',
                  patterns: ['carve out'],
                  include_paths: ['**/*.plan.md'],
                  citation: 'PDR-044',
                },
              ]),
            }),
          ),
      },
    );

    await expect(claudeContentRoute.evaluate(context)).resolves.toMatchObject({
      kind: 'deny-scoped-block',
      match: { matchedText: 'carve out' },
    });
  });
});

describe('copilot-compat string route evaluation', () => {
  it('evaluates every file section of an apply_patch program', async () => {
    const patch =
      '*** Begin Patch\n*** Add File: files/example.txt\n+contains FORBIDDEN-TEST-MARKER here\n*** End Patch\n';
    const context = contextFor(
      { tool_name: 'Edit', tool_input: patch },
      { contentPatterns: ['FORBIDDEN-TEST-MARKER'], scopedBlocks: [] },
    );

    await expect(copilotCompatStringRoute.evaluate(context)).resolves.toStrictEqual({
      kind: 'deny-content-pattern',
      pattern: 'FORBIDDEN-TEST-MARKER',
    });
  });

  it('rejects a malformed apply_patch program so the dispatcher fails closed', async () => {
    const context = contextFor(
      { tool_name: 'Edit', tool_input: 'not a patch' },
      { contentPatterns: [], scopedBlocks: [] },
    );

    await expect(copilotCompatStringRoute.evaluate(context)).rejects.toThrow(
      'apply_patch payload was invalid',
    );
  });
});
