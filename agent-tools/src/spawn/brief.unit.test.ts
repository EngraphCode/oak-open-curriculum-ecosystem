import { describe, expect, it } from 'vitest';

import { formatSeatBrief } from './brief.js';
import { type SpawnedWorktree } from './create.js';

const RESULT: SpawnedWorktree = {
  worktreePath: '/workspace/oak-spawn-flow',
  branch: 'feat/spawn-flow',
  base: 'origin/main',
  resumed: false,
};

describe('formatSeatBrief', () => {
  it('renders the derived seat coordinates — worktree and branch — from the spawn result', () => {
    const brief = formatSeatBrief(RESULT, {});

    expect(brief).toContain('/workspace/oak-spawn-flow');
    expect(brief).toContain('feat/spawn-flow');
  });

  it('states identity is assigned at launch rather than printing an authored prediction', () => {
    const brief = formatSeatBrief(RESULT, {});

    expect(brief).toContain('identity: assigned at launch');
    expect(brief).toContain('identity preflight');
  });

  it('invokes /oak-start-right-team rather than restating the skill (Pitfall 5)', () => {
    const brief = formatSeatBrief(RESULT, { role: 'implementer' });

    expect(brief).toContain('/oak-start-right-team');
  });

  it('renders each supplied per-seat specific — role, task, Director', () => {
    const brief = formatSeatBrief(RESULT, {
      role: 'implementer',
      task: 'build the spawn-flow lane',
      director: 'Triton lifts Eternity (34b9ce)',
    });

    expect(brief).toContain('role:');
    expect(brief).toContain('implementer');
    expect(brief).toContain('task:');
    expect(brief).toContain('build the spawn-flow lane');
    expect(brief).toContain('Director:');
    expect(brief).toContain('Triton lifts Eternity (34b9ce)');
  });

  it('omits the line for any per-seat specific the coordinator did not supply', () => {
    const brief = formatSeatBrief(RESULT, { role: 'implementer' });

    expect(brief).toContain('role:');
    expect(brief).not.toContain('task:');
    expect(brief).not.toContain('Director:');
  });
});
