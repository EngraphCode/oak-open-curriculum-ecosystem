/**
 * WS0c — the protocol-conformance self-report (PDR-133 §Conformance).
 *
 * "Speaks the protocol" is recomputable, never asserted: this module
 * RECOMPUTES the estate's tier from artefacts and gates on every run and
 * compares it against the tier floor the estate declares in
 * `.agent/practice-core/protocol.json`. The portable spec (the five-item
 * floor and tier ladder) is identical across estates; the detector
 * anchors below are this estate's phenotype.
 */

export type ProtocolTier = 'none' | 'tier-0' | 'tier-1';

type ProtocolTierFloor = Exclude<ProtocolTier, 'none'>;

export interface ProtocolDeclaration {
  readonly schema_version: string;
  readonly protocol_version: string;
  readonly tier_floor: ProtocolTierFloor;
  readonly extensions: readonly string[];
}

export interface ConformanceFailure {
  readonly item: string;
  readonly tier: ProtocolTierFloor;
  readonly message: string;
  readonly evidence: readonly string[];
}

export interface ConformanceReport {
  readonly protocol_version: string;
  readonly tier: ProtocolTier;
  readonly extensions: readonly string[];
  readonly failures: readonly ConformanceFailure[];
}

/**
 * Read-only IO seam over the estate. Repo-relative paths except
 * `absolutePathExists`, which exists solely for the
 * `PRACTICE_COORDINATION_HOME` resolution leg (an absolute path by
 * definition).
 */
export interface ConformanceIo {
  readonly fileExists: (relPath: string) => boolean;
  readonly readTextFile: (relPath: string) => string | undefined;
  readonly listDir: (relPath: string) => readonly string[] | undefined;
  readonly absolutePathExists: (path: string) => boolean;
  readonly env: Readonly<Record<string, string | undefined>>;
}
