import type {
  CurrentSourceAdditionDisposition,
  CurrentSourceTruthItem,
} from './current-source-model.js';
import { authorityFor, sortedRegistrationEvidence } from './current-source-projection-shared.js';

function buildAdditionItem(
  addition: CurrentSourceAdditionDisposition,
  baselineCommit: string,
): CurrentSourceTruthItem {
  if (addition.evidence.revision !== 'added') {
    throw new Error(`Current-source addition ${addition.id} must use the added revision`);
  }
  return {
    id: addition.id,
    authority: authorityFor(addition.sourceLocus),
    workspaceScope: addition.workspaceScope,
    source: {
      state: 'available',
      files: [addition.file],
      evidence: {
        revision: addition.evidence.revision,
        anchorTargetCount: addition.evidence.targets.length,
        anchorCount: addition.evidence.targets.reduce(
          (count, target) => count + target.anchors.length,
          0,
        ),
      },
    },
    lineage: { disposition: 'added', addedAfterBaselineCommit: baselineCommit },
    registrations: sortedRegistrationEvidence(addition.registrations),
    reviewContext: {
      title: addition.title,
      reviewDomain: addition.reviewDomain,
      impactTier: addition.impactTier,
      behaviouralIntent: addition.behaviouralIntent,
    },
  };
}

/** Projects reviewed post-baseline additions into current-source truth items. */
export function buildCurrentSourceAdditionItems(
  additions: readonly CurrentSourceAdditionDisposition[],
  baselineCommit: string,
): readonly CurrentSourceTruthItem[] {
  return additions
    .map((addition) => buildAdditionItem(addition, baselineCommit))
    .sort((left, right) => left.id.localeCompare(right.id));
}
