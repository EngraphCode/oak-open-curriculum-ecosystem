/** Data contract for MCP-103's generated current-source projection. */

export type WorkspaceScope = 'in' | 'out-upstream-api';
export type ContentAuthority = 'workspace' | 'upstream-api';
type RegistrationState = 'live' | 'dormant';
type RegistrationPrimitive = 'initialize' | 'tool' | 'resource' | 'prompt';

export interface BaselineAuditRow {
  readonly id: string;
  readonly file: string;
  readonly workspaceScope: WorkspaceScope;
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
  readonly source:
    | { readonly state: 'available'; readonly files: readonly string[] }
    | { readonly state: 'retired'; readonly files: readonly [] };
  readonly lineage: {
    readonly disposition: 'retained' | 'relocated' | 'split' | 'retired';
    readonly baselineFile: string;
  };
  readonly registrations: readonly RegistrationEvidence[];
}

export interface CurrentSourceTruthSet {
  readonly schemaVersion: 1;
  readonly provenance: BuildCurrentSourceTruthSetInput['provenance'];
  readonly summary: {
    readonly itemCount: number;
    readonly availableCount: number;
    readonly retiredCount: number;
    readonly workspaceCount: number;
    readonly upstreamApiCount: number;
    readonly itemLiveBindingCount: number;
    readonly itemDormantBindingCount: number;
  };
  readonly registrationRoots: readonly RegistrationRoot[];
  readonly items: readonly CurrentSourceTruthItem[];
  readonly hostEvidence: readonly [];
}
