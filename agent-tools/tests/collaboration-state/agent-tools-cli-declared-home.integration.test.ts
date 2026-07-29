import { describe, expect, it } from 'vitest';

import {
  agentToolsCliEnvironmentFromProcessEnv,
  runAgentToolsCli,
} from '../../src/bin/agent-tools-cli';

describe('agent-tools collaboration-state declared coordination home', () => {
  it('carries PRACTICE_COORDINATION_HOME through the production composition edge', async () => {
    const env = agentToolsCliEnvironmentFromProcessEnv({
      PRACTICE_COORDINATION_HOME: 'relative/practice-checkout',
    });

    expect(env.PRACTICE_COORDINATION_HOME).toBe('relative/practice-checkout');

    const result = await runAgentToolsCli({
      argv: ['collaboration-state', 'comms', 'validate'],
      env,
      cwd: '/invoking/repository',
    });

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('PRACTICE_COORDINATION_HOME must be an absolute path');
  });
});
