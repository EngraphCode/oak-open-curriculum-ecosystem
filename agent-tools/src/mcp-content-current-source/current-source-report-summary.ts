import type { CurrentSourceTruthSet } from './current-source-model.js';

export const CURRENT_SOURCE_SUMMARY_START = '<!-- current-source-summary:start -->';
export const CURRENT_SOURCE_SUMMARY_END = '<!-- current-source-summary:end -->';

/** Renders the report's present-tense counts from the generated truth set. */
function renderCurrentSourceReportSummary(summary: CurrentSourceTruthSet['summary']): string {
  const availableBaselineCount = summary.availableCount - summary.additionCount;
  return [
    CURRENT_SOURCE_SUMMARY_START,
    '> **Current-source refresh (MCP-103 phase c):**',
    `> \`current-source.json\` accounts for all ${String(summary.baselineItemCount)} immutable phase-(a) \`C\` ids and ${String(summary.additionCount)} governed post-baseline additions.`,
    `> Its ${String(availableBaselineCount)} available baseline dispositions and ${String(summary.additionCount)} additions carry reviewed token evidence; ${String(summary.retiredCount)} baseline rows are explicitly retired.`,
    `> Revisions: ${String(summary.unchangedCount)} unchanged, ${String(summary.expandedCount)} expanded, ${String(summary.modifiedCount)} modified, ${String(summary.relocatedCount)} relocated, and ${String(summary.addedCount)} added.`,
    `> Workspace scope is ${String(summary.workspaceScopeInCount)} in / ${String(summary.workspaceScopeOutUpstreamApiCount)} upstream-API out; word authority is ${String(summary.workspaceAuthorityCount)} workspace, ${String(summary.upstreamApiAuthorityCount)} API, ${String(summary.upstreamSkillsAuthorityCount)} skills, and ${String(summary.externalThirdPartyAuthorityCount)} external.`,
    '> The HTTP root is also walked through initialize, tool/resource listing, resource reads, and prompt absence. Host delivery is not inferred.',
    CURRENT_SOURCE_SUMMARY_END,
  ].join('\n');
}

/** Replaces exactly one generated report summary block. */
export function updateCurrentSourceReportSummary(
  report: string,
  summary: CurrentSourceTruthSet['summary'],
): string {
  const start = report.indexOf(CURRENT_SOURCE_SUMMARY_START);
  const end = report.indexOf(CURRENT_SOURCE_SUMMARY_END);
  if (
    start < 0 ||
    end < start ||
    report.slice(start + 1).includes(CURRENT_SOURCE_SUMMARY_START) ||
    report.slice(end + 1).includes(CURRENT_SOURCE_SUMMARY_END)
  ) {
    throw new Error('Audit report must contain exactly one current-source summary marker pair');
  }
  const afterEnd = end + CURRENT_SOURCE_SUMMARY_END.length;
  return `${report.slice(0, start)}${renderCurrentSourceReportSummary(summary)}${report.slice(afterEnd)}`;
}
