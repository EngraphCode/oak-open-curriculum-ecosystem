import type { CurrentSourceTruthItem, CurrentSourceTruthSet } from './current-source-model.js';

/** Summarises the orthogonal truth-set dimensions without changing item grain. */
export function buildCurrentSourceSummary(
  items: readonly CurrentSourceTruthItem[],
): CurrentSourceTruthSet['summary'] {
  const registrations = items.flatMap((item) => item.registrations);
  const available = items.filter((item) => item.source.state === 'available');
  const revisions = items.flatMap((item) =>
    item.source.state === 'available' ? [item.source.evidence.revision] : [],
  );
  return {
    itemCount: items.length,
    availableCount: available.length,
    retiredCount: items.filter((item) => item.source.state === 'retired').length,
    unchangedCount: revisions.filter((revision) => revision === 'unchanged').length,
    expandedCount: revisions.filter((revision) => revision === 'expanded').length,
    modifiedCount: revisions.filter((revision) => revision === 'modified').length,
    relocatedCount: revisions.filter((revision) => revision === 'relocated').length,
    workspaceScopeInCount: items.filter((item) => item.workspaceScope === 'in').length,
    workspaceScopeOutUpstreamApiCount: items.filter(
      (item) => item.workspaceScope === 'out-upstream-api',
    ).length,
    workspaceAuthorityCount: items.filter((item) => item.authority === 'workspace').length,
    upstreamApiAuthorityCount: items.filter((item) => item.authority === 'upstream-api').length,
    upstreamSkillsAuthorityCount: items.filter((item) => item.authority === 'upstream-skills')
      .length,
    externalThirdPartyAuthorityCount: items.filter(
      (item) => item.authority === 'external-third-party',
    ).length,
    itemLiveBindingCount: registrations.filter((item) => item.state === 'live').length,
    itemDormantBindingCount: registrations.filter((item) => item.state === 'dormant').length,
  };
}
