import { describe, expect, it } from 'vitest';

import { evaluateReviewerRegistrationParityFromInputs } from './health-probe-parity.js';

describe('reviewer registration parity health', () => {
  it('resolves a relative config_file from the Codex config directory', () => {
    const observedPaths: string[] = [];
    const registrationCheck = evaluateReviewerRegistrationParityFromInputs({
      repoRoot: '/repo',
      codexAdapterNames: ['code-expert'],
      registrations: [{ name: 'code-expert', configFile: 'agents/code-expert.toml' }],
      pathExists: (path) => {
        observedPaths.push(path);
        return path === '/repo/.codex/agents/code-expert.toml';
      },
    });

    expect(registrationCheck).toMatchObject({ status: 'pass', details: [] });
    expect(observedPaths).toEqual(['/repo/.codex/agents/code-expert.toml']);
  });
});
