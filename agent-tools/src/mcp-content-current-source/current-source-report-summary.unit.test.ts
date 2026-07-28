import { describe, expect, it } from 'vitest';
import type { CurrentSourceTruthSet } from './current-source-model.js';
import {
  CURRENT_SOURCE_SUMMARY_END,
  CURRENT_SOURCE_SUMMARY_START,
  updateCurrentSourceReportSummary,
} from './current-source-report-summary.js';

const summary = {
  itemCount: 3,
  baselineItemCount: 2,
  additionCount: 1,
  availableCount: 2,
  retiredCount: 1,
  unchangedCount: 1,
  expandedCount: 0,
  modifiedCount: 0,
  relocatedCount: 0,
  addedCount: 1,
  workspaceScopeInCount: 2,
  workspaceScopeOutUpstreamApiCount: 1,
  workspaceAuthorityCount: 2,
  upstreamApiAuthorityCount: 1,
  upstreamSkillsAuthorityCount: 0,
  externalThirdPartyAuthorityCount: 0,
  itemLiveBindingCount: 1,
  itemDormantBindingCount: 0,
} satisfies CurrentSourceTruthSet['summary'];

describe('updateCurrentSourceReportSummary', () => {
  it('replaces derived counts inside the governed marker pair', () => {
    const report = [
      '# Report',
      CURRENT_SOURCE_SUMMARY_START,
      '> stale',
      CURRENT_SOURCE_SUMMARY_END,
      '## Next',
    ].join('\n');

    expect(updateCurrentSourceReportSummary(report, summary)).toContain(
      'all 2 immutable phase-(a) `C` ids and 1 governed post-baseline additions',
    );
  });

  it('rejects a report without exactly one marker pair', () => {
    expect(() => updateCurrentSourceReportSummary('# Report\n', summary)).toThrow(
      'exactly one current-source summary marker pair',
    );
  });
});
