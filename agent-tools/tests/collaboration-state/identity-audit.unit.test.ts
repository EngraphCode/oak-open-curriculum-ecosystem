import { describe, expect, it } from 'vitest';

import { auditCodexIdentityRecords } from '../../src/collaboration-state';

const nowIso = '2026-04-28T11:05:00Z';

const anonymousAgent = {
  agent_name: 'Codex',
  platform: 'codex',
  model: 'GPT-5',
  session_id_prefix: 'unknown',
};

describe('auditCodexIdentityRecords', () => {
  it('reports anonymous Codex records without mutating source texts', () => {
    const activeText = JSON.stringify(
      {
        schema_version: '1.3.0',
        commit_queue: [
          {
            intent_id: 'queued-anonymous',
            claim_id: 'claim-queued',
            // Anonymity (name/prefix) is orthogonal to the PDR-076a routing
            // id: intents REQUIRE id at parse, and an anonymous seat still
            // carries one. The id-less-intent rejection is covered by
            // state-parsers.unit.test.ts.
            agent_id: { ...anonymousAgent, id: 'a3c81f5e-7d2b-5c49-8e16-4f0a9d3b7c25' },
            files: ['.agent/plans/example.md'],
            commit_subject: 'docs(agent): anonymous queue',
            queued_at: '2026-04-28T11:00:00Z',
            updated_at: '2026-04-28T11:00:00Z',
            expires_at: '2026-04-28T11:15:00Z',
            phase: 'queued',
          },
        ],
        claims: [
          {
            claim_id: 'fresh-active-anonymous',
            agent_id: anonymousAgent,
            thread: 'agentic-engineering-enhancements',
            areas: [{ kind: 'files', patterns: ['.agent/state/collaboration/active-claims.json'] }],
            claimed_at: '2026-04-28T11:00:00Z',
            freshness_seconds: 900,
            sidebar_open: false,
            intent: 'Fresh anonymous state.',
          },
          {
            claim_id: 'stale-active-anonymous',
            agent_id: anonymousAgent,
            thread: 'agentic-engineering-enhancements',
            areas: [{ kind: 'files', patterns: ['.agent/state/collaboration/active-claims.json'] }],
            claimed_at: '2026-04-28T10:00:00Z',
            freshness_seconds: 900,
            sidebar_open: false,
            intent: 'Stale anonymous state.',
          },
        ],
      },
      null,
      2,
    );
    const closedText = JSON.stringify(
      {
        schema_version: '1.3.0',
        claims: [
          {
            claim_id: 'closed-anonymous',
            agent_id: anonymousAgent,
            thread: 'agentic-engineering-enhancements',
            areas: [{ kind: 'files', patterns: ['.agent/state/collaboration/closed.json'] }],
            claimed_at: '2026-04-28T08:00:00Z',
            freshness_seconds: 900,
            intent: 'Closed anonymous state.',
            archived_at: '2026-04-28',
          },
        ],
      },
      null,
      2,
    );
    const threadRecordText = [
      '# Next-Session Record',
      '',
      '**Last refreshed**: 2026-04-28 (Codex / codex / GPT-5 / unknown — current row.)',
      '',
      '**Prior refresh**: 2026-04-28 (Codex / codex / GPT-5 / unknown — old row.)',
      '',
    ].join('\n');
    const sharedLogText = [
      '# Agent-to-Agent Shared Communication Log',
      '',
      '## 2026-04-28T09:00:00Z — `Codex` / `codex` / `GPT-5` / `unknown` — old event',
      '',
      'Anonymous historical event.',
      '',
    ].join('\n');

    const report = auditCodexIdentityRecords({
      nowIso,
      activeText,
      closedText,
      threadRecordText,
      sharedLogText,
    });

    expect(report.summary).toStrictEqual({
      total: 7,
      by_classification: {
        'historical-no-repair': 3,
        'live-risk': 2,
        'needs-evidence': 2,
      },
    });
    expect(report.findings).toMatchObject([
      {
        source: 'active',
        record_ref: 'claim:fresh-active-anonymous',
        classification: 'live-risk',
      },
      {
        source: 'active',
        record_ref: 'claim:stale-active-anonymous',
        classification: 'needs-evidence',
      },
      {
        source: 'active',
        record_ref: 'commit_queue:queued-anonymous',
        classification: 'live-risk',
      },
      {
        source: 'closed',
        record_ref: 'claim:closed-anonymous',
        classification: 'historical-no-repair',
      },
      {
        source: 'thread-record',
        record_ref: 'Last refreshed',
        classification: 'needs-evidence',
      },
      {
        source: 'thread-record',
        record_ref: 'Prior refresh',
        classification: 'historical-no-repair',
      },
      {
        source: 'shared-log',
        record_ref: '2026-04-28T09:00:00Z',
        classification: 'historical-no-repair',
      },
    ]);
    expect(activeText).toContain('fresh-active-anonymous');
    expect(closedText).toContain('closed-anonymous');
  });

  it('throws at parse on a legacy id-less intent instead of reporting on it (PDR-076a boundary)', () => {
    // Behaviour change landed with the intent read-boundary tightening: an
    // id-less intent is registry corruption, so the report-only audit now
    // fails loudly naming the row rather than including it in the report.
    const activeText = JSON.stringify({
      schema_version: '1.3.0',
      commit_queue: [
        {
          intent_id: 'queued-anonymous',
          claim_id: 'claim-queued',
          agent_id: anonymousAgent,
          files: ['.agent/plans/example.md'],
          commit_subject: 'docs(agent): anonymous queue',
          queued_at: '2026-04-28T11:00:00Z',
          updated_at: '2026-04-28T11:00:00Z',
          expires_at: '2026-04-28T11:15:00Z',
          phase: 'queued',
        },
      ],
      claims: [],
    });

    expect(() =>
      auditCodexIdentityRecords({
        nowIso,
        activeText,
        closedText: JSON.stringify({ schema_version: '1.3.0', claims: [] }),
        threadRecordText: '',
        sharedLogText: '',
      }),
    ).toThrow(/^commit_queue entry queued-anonymous carries an invalid agent_id/);
  });
});
