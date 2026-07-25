import { buildPreToolUseDenyResponse as buildBashDenyResponse } from './blocked-patterns.js';
import { buildPreToolUseDenyResponse as buildContentDenyResponse } from './content-deny-response.js';
import type { PolicyDecision } from './evaluate.js';

/**
 * Claude-contract rendering of canonical policy decisions.
 *
 * The output lines are byte-identical to the two runners this renderer
 * supersedes: bash denies go through the Bash deny builder in
 * `blocked-patterns.ts`, content denies through the content deny builder in
 * `content-deny-response.ts`, and every clean evaluation writes the explicit
 * allow decision. The two deny builders stay deliberately un-unified — they
 * have independent threat models and distinct reason strings.
 *
 * @packageDocumentation
 */

/** Minimal writable surface the renderer needs — matches the runner seams. */
export interface DecisionWriter {
  write(text: string): void;
}

/**
 * Write the scoped-block deny line through the concept framing, surfacing the
 * matched text (never the regex source), the concept, the citation, and the
 * group's reappraisal direction.
 */
function renderScopedBlockDeny(
  match: Extract<PolicyDecision, { kind: 'deny-scoped-block' }>['match'],
  stdout: DecisionWriter,
): void {
  stdout.write(
    `${JSON.stringify(
      buildContentDenyResponse({
        kind: 'concept',
        pattern: match.matchedText,
        concept: match.group.concept,
        citation: match.group.citation,
        reappraisal: match.group.reappraisal,
      }),
    )}\n`,
  );
}

/**
 * Write the explicit allow decision. Silence-means-allow is a Claude-only
 * convention; an inheriting host (Copilot CLI's compat route) needs the
 * decision stated. Explicit output is contract-valid for Claude too, so
 * every clean evaluation ends with a stated verdict rather than an implied
 * one (strict-and-complete).
 */
function renderAllowDecision(stdout: DecisionWriter): void {
  stdout.write(
    `${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'allow',
        permissionDecisionReason: 'no policy match',
      },
    })}\n`,
  );
}

/**
 * Render one canonical {@link PolicyDecision} into Claude's PreToolUse stdout
 * contract, writing exactly one newline-terminated JSON line. An exhaustive
 * switch with a `never` guard makes adding a future decision kind a
 * compile-time error rather than a silent fall-through.
 */
export function renderClaudeDecision(decision: PolicyDecision, stdout: DecisionWriter): void {
  switch (decision.kind) {
    case 'allow':
      renderAllowDecision(stdout);
      return;
    case 'deny-bash-pattern':
      stdout.write(`${JSON.stringify(buildBashDenyResponse(decision.entry))}\n`);
      return;
    case 'deny-content-pattern':
      stdout.write(
        `${JSON.stringify(buildContentDenyResponse({ kind: 'owner-marker', pattern: decision.pattern }))}\n`,
      );
      return;
    case 'deny-scoped-block':
      renderScopedBlockDeny(decision.match, stdout);
      return;
    default: {
      const exhaustive: never = decision;
      throw new Error(`Unhandled PolicyDecision kind: ${JSON.stringify(exhaustive)}`);
    }
  }
}
