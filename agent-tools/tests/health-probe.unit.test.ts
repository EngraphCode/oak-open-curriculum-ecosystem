import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { formatAgentInfrastructureHealthReport } from '../src/core/health-probe';
import {
  evaluateHookPolicySpineCoherenceFromInputs,
  evaluatePracticeBoxState,
} from '../src/core/health-probe-hook-state';
import { evaluateParityChecks } from '../src/core/health-probe-parity';
import type { AgentInfrastructureHealthReport } from '../src/core/health-probe-types';

const wiredClaudeSettingsText = JSON.stringify({
  hooks: {
    PreToolUse: [
      {
        matcher: 'Bash',
        hooks: [
          {
            type: 'command',
            command:
              'node "${CLAUDE_PROJECT_DIR}/.claude/hooks/run-pretooluse-guard.mjs" agent-tools/dist/src/hook-policy/pre-tool-use-dispatch.js',
          },
        ],
      },
    ],
  },
});

const documentedSurfaceMatrix = [
  '.agent/hooks/policy.json',
  'agent-tools/dist/src/hook-policy/pre-tool-use-dispatch.js',
  'Policy Spine',
  'override prune block',
].join('\n');

function writeReviewerAdapterFixture(repoRoot: string, includeCodexHighSeat: boolean): void {
  const sharedAgentNames = [
    'cricket-judgement-low',
    'cricket-judgement-medium',
    'cricket-procedure-xhigh',
  ];
  const claudeCursorAgentNames = [...sharedAgentNames, 'cricket-judgement-high'];
  const codexAgentNames = includeCodexHighSeat
    ? [...sharedAgentNames, 'cricket-judgement-high']
    : sharedAgentNames;

  for (const [relativeDir, extension, agentNames] of [
    ['.cursor/agents', '.md', claudeCursorAgentNames],
    ['.claude/agents', '.md', claudeCursorAgentNames],
    ['.codex/agents', '.toml', codexAgentNames],
  ] as const) {
    const absoluteDir = join(repoRoot, relativeDir);
    mkdirSync(absoluteDir, { recursive: true });
    for (const agentName of agentNames) {
      writeFileSync(join(absoluteDir, `${agentName}${extension}`), '', 'utf8');
    }
  }
}

describe('reviewer adapter parity health', () => {
  it('accepts the Claude and Cursor only high-judgement Cricket seat', () => {
    const repoRoot = mkdtempSync(join(tmpdir(), 'agent-health-parity-'));

    try {
      writeReviewerAdapterFixture(repoRoot, false);

      const result = evaluateParityChecks(repoRoot).find(
        (check) => check.key === 'reviewer-adapter-parity',
      );

      expect(result).toMatchObject({
        status: 'pass',
        details: [],
      });
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });

  it('rejects a fake Codex adapter for the unsupported high-judgement seat', () => {
    const repoRoot = mkdtempSync(join(tmpdir(), 'agent-health-parity-'));

    try {
      writeReviewerAdapterFixture(repoRoot, true);

      const result = evaluateParityChecks(repoRoot).find(
        (check) => check.key === 'reviewer-adapter-parity',
      );

      expect(result).toMatchObject({
        status: 'fail',
        details: ['Codex has unsupported reviewer adapter cricket-judgement-high.'],
      });
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });
});

describe('hook policy spine health', () => {
  it('passes when policy, tracked activation, and surface matrix align', () => {
    expect(
      evaluateHookPolicySpineCoherenceFromInputs({
        hookPolicyExists: true,
        claudeSupportStatus: 'supported',
        surfaceMatrixText: documentedSurfaceMatrix,
        claudeSettingsText: wiredClaudeSettingsText,
      }),
    ).toMatchObject({
      key: 'hook-policy-spine',
      status: 'pass',
    });
  });

  it('fails when supported Claude hook policy has no tracked settings file', () => {
    const result = evaluateHookPolicySpineCoherenceFromInputs({
      hookPolicyExists: true,
      claudeSupportStatus: 'supported',
      surfaceMatrixText: documentedSurfaceMatrix,
      claudeSettingsText: null,
    });

    expect(result.status).toBe('fail');
    expect(result.details).toContain(
      '.agent/hooks/policy.json marks Claude Code as supported, but tracked project .claude/settings.json is missing.',
    );
  });

  it('fails when the surface matrix omits the hook policy spine', () => {
    const result = evaluateHookPolicySpineCoherenceFromInputs({
      hookPolicyExists: true,
      claudeSupportStatus: 'supported',
      surfaceMatrixText: null,
      claudeSettingsText: wiredClaudeSettingsText,
    });

    expect(result.status).toBe('fail');
    expect(result.details).toContain(
      '.agent/memory/executive/cross-platform-agent-surface-matrix.md is missing.',
    );
  });
});

describe('practice box health', () => {
  it('is pure over the incoming file count', () => {
    expect(evaluatePracticeBoxState(0).status).toBe('pass');
    expect(evaluatePracticeBoxState(2)).toMatchObject({
      status: 'warn',
      summary: '2 incoming Practice artefacts are waiting for integration.',
    });
  });
});

describe('health report formatting', () => {
  it('formats a summary-first report with details for non-passing checks', () => {
    const report: AgentInfrastructureHealthReport = {
      overallStatus: 'warn',
      stats: { pass: 1, warn: 1, fail: 0 },
      checks: [
        {
          key: 'hook-policy-spine',
          label: 'Hook Policy Spine coherence',
          status: 'pass',
          summary: 'Hook policy aligned.',
          details: [],
        },
        {
          key: 'practice-box-state',
          label: 'Practice box state',
          status: 'warn',
          summary: 'Incoming artefacts are waiting.',
          details: ['Use oak-consolidate-docs.'],
        },
      ],
    };

    const output = formatAgentInfrastructureHealthReport(report);

    expect(output).toContain('Agent Infrastructure Health');
    expect(output).toContain('Summary');
    expect(output).toContain('Practice box state');
    expect(output).toContain('Details');
    expect(output).toContain('Use oak-consolidate-docs.');
  });
});
