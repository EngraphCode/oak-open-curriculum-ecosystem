import { beforeAll, describe, expect, it } from 'vitest';
import { HTTP_ENV_KEYS } from '../src/env.js';
import { resolveBuildTaskGraph, type TurboDryRunTask } from './test-helpers/turbo-task-graph.js';

const APP = '@oaknational/oak-curriculum-mcp-streamable-http';
const GATE_TASK = `${APP}#deploy-config-gate`;
const BUILD_TASK = `${APP}#build`;

/**
 * The orchestration half of the deploy-config plan's acceptance criterion 1:
 * the production build entrypoint invokes the gate as an always-executed
 * step outside the cached build task. Read from Turbo's own resolution of
 * the graph, not from the config text, so what is asserted is what runs.
 */
describe('deploy-config gate — always executed, never cached, on the build path', () => {
  let graph: ReadonlyMap<string, TurboDryRunTask>;

  beforeAll(() => {
    graph = resolveBuildTaskGraph();
  });

  it('is a task of its own that the build task depends on', () => {
    const gate = graph.get(GATE_TASK);
    const build = graph.get(BUILD_TASK);

    expect(gate?.command).toContain('run-validate-deploy-config');
    expect(build?.dependencies).toContain(GATE_TASK);
  });

  it('is never cached, so a same-commit redeploy still runs it', () => {
    const gate = graph.get(GATE_TASK);
    const build = graph.get(BUILD_TASK);

    expect(gate?.resolvedTaskDefinition.cache).toBe(false);
    expect(build?.resolvedTaskDefinition.dependsOn).toContain('deploy-config-gate');
  });

  it('passes exactly the validated surface through, in lockstep with the env schema', () => {
    const passedThrough = new Set(
      graph.get(GATE_TASK)?.resolvedTaskDefinition.passThroughEnv ?? [],
    );

    for (const key of HTTP_ENV_KEYS) {
      expect(passedThrough, `${key} must be passed through to the gate`).toContain(key);
    }
    expect(passedThrough).not.toContain('SENTRY_AUTH_TOKEN');
  });
});
