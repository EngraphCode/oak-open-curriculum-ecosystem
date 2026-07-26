/** Data contract for MCP-103's generated current-source projection. */

type WorkspaceScope = 'in' | 'out-upstream-api';
export type SourceLocus =
  'this-repo' | 'upstream-in-house-api' | 'upstream-in-house-skills' | 'external-third-party';
export type ContentAuthority =
  'workspace' | 'upstream-api' | 'upstream-skills' | 'external-third-party';
type RegistrationState = 'live' | 'dormant';
type RegistrationPrimitive = 'initialize' | 'tool' | 'resource' | 'prompt';
export type ContentRevision = 'unchanged' | 'expanded' | 'modified' | 'relocated';

export interface BaselineAuditRow {
  readonly id: string;
  readonly file: string;
  readonly workspaceScope: WorkspaceScope;
  readonly sourceLocus: SourceLocus;
}

export interface TokenAnchor {
  readonly tokenCount: number;
  readonly tokenSha256: string;
  readonly indexToken: string;
  readonly indexOffset: number;
}

export interface CurrentItemEvidenceTarget {
  readonly file: string;
  readonly anchors: readonly TokenAnchor[];
}

export interface CurrentItemEvidence {
  readonly revision: ContentRevision;
  readonly targets: readonly CurrentItemEvidenceTarget[];
}

interface CurrentItemEvidenceSummary {
  readonly revision: ContentRevision;
  readonly anchorTargetCount: number;
  readonly anchorCount: number;
}

export interface CurrentSourceAnchorManifest {
  readonly schemaVersion: 1;
  readonly baselineCommit: string;
  readonly baselineSha256: string;
  readonly items: readonly {
    readonly auditId: string;
    readonly evidence: CurrentItemEvidence;
  }[];
}

export interface RegistrationEvidence {
  readonly rootId: string;
  readonly state: RegistrationState;
  readonly primitive: RegistrationPrimitive;
  readonly selector: string;
  readonly channels: readonly string[];
}

export interface CurrentAuditDisposition {
  readonly auditId: string;
  readonly files: readonly string[];
  readonly evidence: CurrentItemEvidence;
  readonly registrations: readonly RegistrationEvidence[];
}

export interface RegistrationRoot {
  readonly id: string;
  readonly rootRef: string;
  readonly transport: string;
  readonly registrationRef: string;
  readonly proof: string;
  readonly observation: {
    readonly initialize: { readonly instructions: 'present' | 'absent' };
    readonly tools: {
      readonly live: readonly string[];
      readonly dormant: readonly string[];
    };
    readonly resources: {
      readonly live: readonly string[];
      readonly dormant: readonly string[];
    };
    readonly prompts: {
      readonly capability: 'present' | 'absent';
      readonly list: 'available' | 'method-not-found';
    };
  };
}

export interface BuildCurrentSourceTruthSetInput {
  readonly provenance: {
    readonly title: string;
    readonly baselineCommit: string;
    readonly baselineArtifact: string;
    readonly baselineSha256: string;
    readonly currentEvidence: readonly string[];
    readonly evidenceCeiling: readonly string[];
  };
  readonly baseline: readonly BaselineAuditRow[];
  readonly current: readonly CurrentAuditDisposition[];
  readonly retiredAuditIds: readonly string[];
  readonly registrationRoots: readonly RegistrationRoot[];
}

export interface CurrentSourceTruthItem {
  readonly id: string;
  readonly authority: ContentAuthority;
  readonly workspaceScope: WorkspaceScope;
  readonly source:
    | {
        readonly state: 'available';
        readonly files: readonly string[];
        readonly evidence: CurrentItemEvidenceSummary;
      }
    | { readonly state: 'retired'; readonly files: readonly [] };
  readonly lineage: {
    readonly disposition: 'retained' | 'relocated' | 'split' | 'retired';
    readonly baselineFile: string;
  };
  readonly registrations: readonly RegistrationEvidence[];
}

export interface CurrentSourceTruthSet {
  readonly schemaVersion: 2;
  readonly provenance: BuildCurrentSourceTruthSetInput['provenance'];
  readonly summary: {
    readonly itemCount: number;
    readonly availableCount: number;
    readonly retiredCount: number;
    readonly unchangedCount: number;
    readonly expandedCount: number;
    readonly modifiedCount: number;
    readonly relocatedCount: number;
    readonly workspaceScopeInCount: number;
    readonly workspaceScopeOutUpstreamApiCount: number;
    readonly workspaceAuthorityCount: number;
    readonly upstreamApiAuthorityCount: number;
    readonly upstreamSkillsAuthorityCount: number;
    readonly externalThirdPartyAuthorityCount: number;
    readonly itemLiveBindingCount: number;
    readonly itemDormantBindingCount: number;
  };
  readonly registrationRoots: readonly RegistrationRoot[];
  readonly items: readonly CurrentSourceTruthItem[];
  readonly hostEvidence: readonly [];
}
