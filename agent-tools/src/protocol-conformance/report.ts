import { loadProtocolDeclaration } from './declaration.js';
import { runConformanceDetectors } from './detectors.js';
import {
  type ConformanceFailure,
  type ConformanceIo,
  type ConformanceReport,
  type ProtocolTier,
} from './types.js';

function computeTier(failures: readonly ConformanceFailure[]): ProtocolTier {
  if (failures.some((failure) => failure.tier === 'tier-0')) {
    return 'none';
  }
  if (failures.some((failure) => failure.tier === 'tier-1')) {
    return 'tier-0';
  }
  return 'tier-1';
}

const TIER_RANK: Readonly<Record<ProtocolTier, number>> = {
  none: 0,
  'tier-0': 1,
  'tier-1': 2,
};

/**
 * Recompute the estate's protocol tier and compare it against the declared
 * floor. Exit 0 iff the declaration loads AND the computed tier meets the
 * floor; every other outcome is exit 1 with named failures.
 */
export function runProtocolConformance(io: ConformanceIo): {
  readonly report: ConformanceReport;
  readonly exitCode: 0 | 1;
} {
  const detectorFailures = runConformanceDetectors(io);
  const tier = computeTier(detectorFailures);

  const declaration = loadProtocolDeclaration(io);
  if (!declaration.ok) {
    return {
      report: {
        protocol_version: 'undeclared',
        tier,
        extensions: [],
        failures: [
          {
            item: 'protocol-declaration',
            tier: 'tier-0',
            message: declaration.error,
            evidence: [],
          },
          ...detectorFailures,
        ],
      },
      exitCode: 1,
    };
  }

  return {
    report: {
      protocol_version: declaration.value.protocol_version,
      tier,
      extensions: declaration.value.extensions,
      failures: detectorFailures,
    },
    exitCode: TIER_RANK[tier] >= TIER_RANK[declaration.value.tier_floor] ? 0 : 1,
  };
}
