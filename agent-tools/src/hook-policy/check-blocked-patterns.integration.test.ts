import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { buildPreToolUseDenyResponse, findBlockedPattern } from './blocked-patterns.js';
import { loadBlockedPatterns, loadRawPolicyJson } from './policy-loader.js';
import { runPreToolUseDispatch } from './pre-tool-use-dispatch.js';
import { BLOCKED_PATTERN_MATCH_KINDS } from './types.js';

describe('runPreToolUseDispatch', () => {
  it('writes a deny payload when the command matches a blocked pattern', async () => {
    const stdout: string[] = [];
    const stderr: string[] = [];

    async function* stdin(): AsyncGenerator<Buffer> {
      yield Buffer.from(
        JSON.stringify({
          tool_name: 'Bash',
          tool_input: {
            command: 'git commit --no-verify',
          },
        }),
      );
    }

    await expect(
      runPreToolUseDispatch({
        stdin: stdin(),
        stdout: {
          write(text: string) {
            stdout.push(text);
          },
        },
        stderr: {
          write(text: string) {
            stderr.push(text);
          },
        },
        bashPatterns: ['git --no-verify'],
      }),
    ).resolves.toStrictEqual({ exitCode: 0 });

    expect(stderr).toStrictEqual([]);
    expect(JSON.parse(stdout.join(''))).toStrictEqual(
      buildPreToolUseDenyResponse({ pattern: 'git --no-verify' }),
    );
  });
});

describe('canonical policy: explicit-pathspec staging discipline (WS6)', () => {
  const expectedCitation = '.agent/rules/stage-by-explicit-pathspec.md';

  it('blocks the wildcard staging commands and teaches the explicit-pathspec concept', async () => {
    const patterns = await loadBlockedPatterns();

    for (const command of ['git add -A', 'git add --all', 'git add .']) {
      const entry = findBlockedPattern(command, patterns);
      expect(entry).toMatchObject({
        pattern: command,
        concept: 'wildcard-staging',
        citation: expectedCitation,
      });
      // The block must TEACH, not only refuse: a non-empty reappraisal travels to the agent.
      expect(entry?.reappraisal?.trim()).toBeTruthy();
    }
  });

  it('does not block explicit-pathspec staging via the canonical policy', async () => {
    const patterns = await loadBlockedPatterns();

    expect(findBlockedPattern('git add packages/core/foo.ts', patterns)).toBeNull();
    expect(findBlockedPattern('git add ./packages/core/foo.ts', patterns)).toBeNull();
    expect(findBlockedPattern('git add .gitignore', patterns)).toBeNull();
  });
});

describe('canonical policy: a matched command teaches a reappraisal end-to-end', () => {
  it('frames a destructive command as a concept to reappraise, carrying its citation', async () => {
    const patterns = await loadBlockedPatterns();
    const entry = findBlockedPattern('git reset --hard HEAD~1', patterns);
    if (entry === null) {
      throw new Error('expected `git reset --hard` to be blocked by the canonical policy');
    }

    const reason = buildPreToolUseDenyResponse(entry).hookSpecificOutput.permissionDecisionReason;
    expect(reason).toContain('git reset --hard');
    expect(reason).toContain('worktree-destruction');
    expect(reason).toContain('not a command to swap for a sibling');
    expect(reason).toContain('Citation: .agent/rules/never-use-git-to-remove-work.md');
  });
});

describe('canonical policy: ripgrep clustered-replace fingerprint', () => {
  it('blocks the clustered and bare short-replace forms that silently rewrite match output', async () => {
    const patterns = await loadBlockedPatterns();

    for (const command of [
      'rg -riln "pattern" .agent/',
      'rg -r il "pattern" docs/',
      'rg -i -rn "pattern" docs/',
    ]) {
      const entry = findBlockedPattern(command, patterns);
      expect(entry).toMatchObject({ concept: 'silent-output-mangling' });
      // The block must TEACH, not only refuse: a non-empty reappraisal travels to the agent.
      expect(entry?.reappraisal?.trim()).toBeTruthy();
    }
  });

  it('does not block separated flags or the explicit long-form replace', async () => {
    const patterns = await loadBlockedPatterns();

    expect(findBlockedPattern('rg -i -l -n "pattern" docs/', patterns)).toBeNull();
    expect(findBlockedPattern('rg -in --no-messages "pattern" docs/', patterns)).toBeNull();
    expect(findBlockedPattern('rg --replace=X "pattern" docs/', patterns)).toBeNull();
  });

  it('does not block unrelated commands whose tokens merely end in rg (PR #304 Bugbot)', async () => {
    const patterns = await loadBlockedPatterns();

    expect(findBlockedPattern('xorg -restart config', patterns)).toBeNull();
    expect(findBlockedPattern('pnpm --filter org -r build', patterns)).toBeNull();
  });

  it('accepts the flags-after-positionals gap as a deliberate trade-off', async () => {
    // ripgrep accepts flags after positionals, so `rg pattern -r repl` slips
    // this fence. Accepted: anchoring -r to the leading flag cluster is what
    // keeps downstream pipe segments (`rg foo | rm -rf …` shapes) from
    // false-positive matches, and the substring predecessor missed this shape
    // too. The fence teaches; it does not claim to parse ripgrep's CLI.
    const patterns = await loadBlockedPatterns();

    expect(findBlockedPattern('rg pattern -r repl docs/', patterns)).toBeNull();
  });

  it('every regex-mode entry in the canonical policy compiles', async () => {
    const patterns = await loadBlockedPatterns();

    for (const raw of patterns) {
      if (typeof raw !== 'string' && raw.match === 'regex') {
        // Compile-time enforcement for the fail-open runtime posture: an
        // invalid regex never bricks the guard, so THIS test is what makes
        // an uncompilable pattern a commit-time failure instead of a
        // silently dead policy entry.
        expect(() => new RegExp(raw.pattern, 'iu')).not.toThrow();
      }
    }
  });

  it('every canonical entry names a known match kind (the schema degrades unknown kinds silently)', async () => {
    // The runtime schema `.catch`es an unknown match kind to the default mode
    // so a stale dist never fails the guard closed; this test is the
    // commit-time half of that bargain — a typo'd kind fails HERE, never
    // silently in production. The schema-free raw load exists because the
    // runtime schema's catch would mask exactly what this test exists to catch.
    const rawPolicySchema = z.object({
      hooks: z.object({
        preToolUse: z.object({
          blocked_patterns: z.array(
            z.union([z.string(), z.looseObject({ match: z.string().optional() })]),
          ),
        }),
      }),
    });
    const policy = rawPolicySchema.parse(await loadRawPolicyJson());

    for (const raw of policy.hooks.preToolUse.blocked_patterns) {
      if (typeof raw !== 'string' && raw.match !== undefined) {
        expect(BLOCKED_PATTERN_MATCH_KINDS).toContain(raw.match);
      }
    }
  });
});
