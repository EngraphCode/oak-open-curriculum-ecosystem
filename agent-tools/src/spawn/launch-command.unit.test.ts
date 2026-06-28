import { describe, expect, it } from 'vitest';

import { type SpawnedWorktree } from './create.js';
import { formatLaunchCommand } from './launch-command.js';

const RESULT: SpawnedWorktree = {
  worktreePath: '/workspace/oak-spawn-flow',
  branch: 'feat/spawn-flow',
  base: 'origin/main',
  session: { seed: 'seed-value', agentName: 'Test Agent Name', sessionIdPrefix: 'seed-v' },
  resumed: false,
};

describe('formatLaunchCommand', () => {
  it('emits a cd-into-the-worktree command that starts claude rooted in the worktree', () => {
    const command = formatLaunchCommand(RESULT);

    expect(command).toContain("cd '/workspace/oak-spawn-flow' && claude");
  });

  it('single-quotes the worktree path so a path containing spaces stays one shell argument', () => {
    const command = formatLaunchCommand({ ...RESULT, worktreePath: '/work space/oak-spawn-flow' });

    expect(command).toContain("cd '/work space/oak-spawn-flow' && claude");
  });

  it('escapes a single quote in the worktree path so the command stays shell-safe', () => {
    const command = formatLaunchCommand({ ...RESULT, worktreePath: "/work'space/oak-spawn-flow" });

    expect(command).toContain(String.raw`cd '/work'\''space/oak-spawn-flow' && claude`);
  });

  it('does NOT inject an identity seed — the SessionStart hook derives identity from the harness session_id and overrides any launch-time seed, so injection is inert (verified 2026-06-28)', () => {
    const command = formatLaunchCommand(RESULT);

    expect(command).not.toContain('PRACTICE_AGENT_SESSION_ID');
    expect(command).not.toContain('seed-value');
  });

  it('uses the cd form, never native `claude --worktree` (which creates a second, conflicting worktree)', () => {
    const command = formatLaunchCommand(RESULT);

    expect(command).not.toContain('--worktree');
  });
});
