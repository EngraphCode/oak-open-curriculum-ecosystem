import { describe, expect, it } from 'vitest';

import { buildPreToolUseDenyResponse as buildBashDenyResponse } from './blocked-patterns.js';
import { renderClaudeDecision } from './claude-renderer.js';
import { buildPreToolUseDenyResponse as buildContentDenyResponse } from './content-deny-response.js';
import type { PolicyDecision } from './evaluate.js';
import type { ScopedContentBlockGroup } from './types.js';

/** Collect stdout writes, preserving call boundaries so byte and call-count assertions stay exact. */
function collector(): { write(text: string): void; chunks: string[] } {
  const chunks: string[] = [];
  return {
    write(text: string): void {
      chunks.push(text);
    },
    chunks,
  };
}

const SCOPED_GROUP: ScopedContentBlockGroup = {
  concept: 'expediency-hedging',
  patterns: ['carve out'],
  include_paths: ['**/*.plan.md'],
  citation: 'PDR-044; principles.md §Architectural Excellence Over Expediency',
  reappraisal: 'Re-assess the concept.',
};

describe('renderClaudeDecision', () => {
  it('writes the explicit allow line byte-for-byte, in one write', () => {
    const stdout = collector();

    renderClaudeDecision({ kind: 'allow' }, stdout);

    expect(stdout.chunks).toStrictEqual([
      '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","permissionDecisionReason":"no policy match"}}\n',
    ]);
  });

  it('renders a bash deny through the unchanged Bash deny builder, newline-terminated', () => {
    const stdout = collector();
    const entry = {
      pattern: 'git reset --hard',
      concept: 'worktree-destruction',
      citation: '.agent/rules/never-use-git-to-remove-work.md',
      reappraisal: 'Step back before destroying work.',
    };

    renderClaudeDecision({ kind: 'deny-bash-pattern', entry }, stdout);

    expect(stdout.chunks).toStrictEqual([`${JSON.stringify(buildBashDenyResponse(entry))}\n`]);
  });

  it('renders a bare-pattern bash deny identically to the legacy runner line', () => {
    const stdout = collector();
    const entry = { pattern: 'git --no-verify' };

    renderClaudeDecision({ kind: 'deny-bash-pattern', entry }, stdout);

    expect(stdout.chunks).toStrictEqual([`${JSON.stringify(buildBashDenyResponse(entry))}\n`]);
  });

  it('renders the owner-marker deny byte-for-byte', () => {
    const stdout = collector();

    renderClaudeDecision({ kind: 'deny-content-pattern', pattern: 'secret-marker' }, stdout);

    expect(stdout.chunks).toStrictEqual([
      '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Blocked by repo hook policy: content contains the owner-approval marker \\"secret-marker\\". Only the project owner may author this marker."}}\n',
    ]);
    expect(stdout.chunks).toStrictEqual([
      `${JSON.stringify(buildContentDenyResponse({ kind: 'owner-marker', pattern: 'secret-marker' }))}\n`,
    ]);
  });

  it('renders a scoped-block deny through the concept framing with the matched text', () => {
    const stdout = collector();
    const decision: PolicyDecision = {
      kind: 'deny-scoped-block',
      match: { group: SCOPED_GROUP, matchedText: 'carve out' },
    };

    renderClaudeDecision(decision, stdout);

    expect(stdout.chunks).toStrictEqual([
      `${JSON.stringify(
        buildContentDenyResponse({
          kind: 'concept',
          pattern: 'carve out',
          concept: SCOPED_GROUP.concept,
          citation: SCOPED_GROUP.citation,
          reappraisal: SCOPED_GROUP.reappraisal,
        }),
      )}\n`,
    ]);
  });

  it('defaults the reappraisal exactly as the runner did when a group omits it', () => {
    const stdout = collector();
    const group: ScopedContentBlockGroup = {
      concept: 'tombstone comment',
      patterns: ['removed for brevity'],
      include_paths: ['docs/'],
      citation: 'no-tombstones-for-removed-ideas',
    };

    renderClaudeDecision(
      { kind: 'deny-scoped-block', match: { group, matchedText: 'removed for brevity' } },
      stdout,
    );

    expect(stdout.chunks).toStrictEqual([
      `${JSON.stringify(
        buildContentDenyResponse({
          kind: 'concept',
          pattern: 'removed for brevity',
          concept: group.concept,
          citation: group.citation,
          reappraisal: group.reappraisal,
        }),
      )}\n`,
    ]);
  });
});
