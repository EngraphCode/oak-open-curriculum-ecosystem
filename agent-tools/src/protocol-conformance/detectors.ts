// coordination-home pulls node builtins (fs/path/child_process) into this
// module's graph; acceptable because the only consumer chain is the node CLI
// bin — a future non-node consumer of the detectors breaks at this boundary.
import {
  COLLABORATION_SUBSTRATE_REL,
  resolveCoordinationHome,
} from '../collaboration-state/coordination-home.js';
import { getJsonValue, isJsonObject, type JsonObject } from '../core/json.js';
import { type ConformanceFailure, type ConformanceIo } from './types.js';

/**
 * Phenotype anchors for this estate's detectors. The portable spec names
 * WHAT each floor item is (PDR-125 §Conformance); these paths are WHERE
 * this estate proves it. A peer estate's twin carries its own anchors.
 */
const INCOMING_BOX_REL_PATH = '.agent/practice-core/incoming';
const DECISION_RECORDS_REL_PATH = '.agent/practice-core/decision-records';
// Anchored to the canonical record shape: a correctly-numbered PDR file whose
// body carries the Conformance contract — a placeholder that merely mentions
// the protocol in its name must not satisfy tier 0 (review probe 2026-07-07).
const PROTOCOL_RECORD_FILE_PATTERN = /^PDR-\d+-inter-practice-collaboration-protocol\.md$/;
const PROTOCOL_RECORD_CONTENT_MARKER = 'Conformance';
const WIRE_SCHEMA_REL_PATH = 'agent-tools/src/collaboration-state/schemas/comms-event.schema.json';
const CLI_SPEC_HELP_REL_PATH = 'agent-tools/src/collaboration-state/cli-spec-help.ts';
const WATCHER_ASSERTION_MODULE_REL_PATH =
  'agent-tools/src/collaboration-state/cli-comms-assert-watcher-live.ts';
const WATCHER_ASSERTION_ACTION = 'assert-watcher-live';
const COORDINATION_HOME_ENV = 'PRACTICE_COORDINATION_HOME';
const GIT_NATIVE_HOME_CONTRACT_REL_PATH = '.agent/state/README.md';

type WireSchemaRead =
  | { readonly kind: 'absent' }
  | { readonly kind: 'unreadable'; readonly detail: string }
  | {
      readonly kind: 'parsed';
      readonly requiresPrefixOnIdentity: boolean;
      readonly declaresThreadingField: boolean;
    };

function parseWireSchema(raw: string): WireSchemaRead {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return {
      kind: 'unreadable',
      detail: error instanceof Error ? error.message : String(error),
    };
  }
  if (!isJsonObject(parsed)) {
    return { kind: 'unreadable', detail: 'schema root is not a JSON object' };
  }
  const defsValue = getJsonValue(parsed, '$defs');
  return readWireSchemaShape(isJsonObject(defsValue) ? defsValue : {});
}

function readWireSchemaShape(defs: JsonObject): WireSchemaRead {
  const agentId = getJsonValue(defs, 'agent_id');
  const required = isJsonObject(agentId) ? getJsonValue(agentId, 'required') : undefined;
  const requiresPrefixOnIdentity =
    Array.isArray(required) && required.includes('session_id_prefix');

  // Anchored on the narrative def (the exchange event shape): the schema is
  // byte-identical across estates, so the threading field's home is stable.
  const narrative = getJsonValue(defs, 'narrative');
  const narrativeProperties = isJsonObject(narrative)
    ? getJsonValue(narrative, 'properties')
    : undefined;
  const declaresThreadingField =
    isJsonObject(narrativeProperties) && 'in_response_to' in narrativeProperties;

  return { kind: 'parsed', requiresPrefixOnIdentity, declaresThreadingField };
}

function readWireSchema(io: ConformanceIo): WireSchemaRead {
  const raw = io.readTextFile(WIRE_SCHEMA_REL_PATH);
  if (raw === undefined) {
    return { kind: 'absent' };
  }
  return parseWireSchema(raw);
}

function wireSchemaFaultMessage(read: WireSchemaRead, fieldMessage: string): string {
  if (read.kind === 'absent') {
    return `the comms wire schema is absent`;
  }
  if (read.kind === 'unreadable') {
    return `the comms wire schema is unreadable: ${read.detail}`;
  }
  return fieldMessage;
}

function detectIncomingBox(io: ConformanceIo): ConformanceFailure | undefined {
  if (io.listDir(INCOMING_BOX_REL_PATH) !== undefined) {
    return undefined;
  }
  return {
    item: 't0-incoming-box',
    tier: 'tier-0',
    message: `the incoming Practice Box directory is absent at its canonical path`,
    evidence: [INCOMING_BOX_REL_PATH],
  };
}

function detectProtocolRecord(io: ConformanceIo): ConformanceFailure | undefined {
  const decisionRecords = io.listDir(DECISION_RECORDS_REL_PATH) ?? [];
  const recordName = decisionRecords.find((name) => PROTOCOL_RECORD_FILE_PATTERN.test(name));
  if (recordName === undefined) {
    return {
      item: 't0-protocol-record',
      tier: 'tier-0',
      message: `no inter-Practice collaboration protocol record found in the decision-record set`,
      evidence: [DECISION_RECORDS_REL_PATH],
    };
  }
  const content = io.readTextFile(`${DECISION_RECORDS_REL_PATH}/${recordName}`);
  if (content?.includes(PROTOCOL_RECORD_CONTENT_MARKER)) {
    return undefined;
  }
  return {
    item: 't0-protocol-record',
    tier: 'tier-0',
    message: `the protocol record ${recordName} carries no ${PROTOCOL_RECORD_CONTENT_MARKER} contract — a record that does not state the conformance floor does not prove tier 0`,
    evidence: [`${DECISION_RECORDS_REL_PATH}/${recordName}`],
  };
}

function detectWireSchemaItems(io: ConformanceIo): readonly ConformanceFailure[] {
  const wireSchema = readWireSchema(io);
  const failures: ConformanceFailure[] = [];
  if (wireSchema.kind !== 'parsed' || !wireSchema.declaresThreadingField) {
    failures.push({
      item: 't1-threadable-comms',
      tier: 'tier-1',
      message: wireSchemaFaultMessage(
        wireSchema,
        `the comms wire schema does not declare the threading field (in_response_to)`,
      ),
      evidence: [WIRE_SCHEMA_REL_PATH],
    });
  }
  if (wireSchema.kind !== 'parsed' || !wireSchema.requiresPrefixOnIdentity) {
    failures.push({
      item: 't1-identity-with-prefix',
      tier: 'tier-1',
      message: wireSchemaFaultMessage(
        wireSchema,
        `the comms wire schema does not require session_id_prefix on the identity block`,
      ),
      evidence: [WIRE_SCHEMA_REL_PATH],
    });
  }
  return failures;
}

function detectCoordinationHome(io: ConformanceIo): ConformanceFailure | undefined {
  const declaredHome = io.env[COORDINATION_HOME_ENV];
  if (declaredHome !== undefined) {
    return certifyDeclaredHome(io, declaredHome);
  }
  // Git-native leg: the contract must exist AND actually document the
  // collaboration plane — a stray README does not establish a resolvable
  // home (review probe 2026-07-07).
  const homeContract = io.readTextFile(GIT_NATIVE_HOME_CONTRACT_REL_PATH);
  if (homeContract?.includes('collaboration')) {
    return undefined;
  }
  return {
    item: 't1-coordination-home',
    tier: 'tier-1',
    message:
      homeContract === undefined
        ? `no coordination home resolves: ${COORDINATION_HOME_ENV} is unset and the git-native home contract is absent`
        : `the git-native home contract exists but does not document the collaboration plane`,
    evidence: [GIT_NATIVE_HOME_CONTRACT_REL_PATH],
  };
}

/**
 * Certify a declared home by running the REAL resolver against the seam —
 * the detector recomputes the exact production validation (absolute path,
 * directory, collaboration substrate present) rather than recording a
 * weaker copy of it (PR #320 review finding). The resolver never touches
 * git on the declared-home path, so the cwd argument is inert.
 */
function certifyDeclaredHome(
  io: ConformanceIo,
  declaredHome: string,
): ConformanceFailure | undefined {
  try {
    resolveCoordinationHome('.', {
      coordinationHomeEnv: declaredHome,
      directoryExists: io.absoluteDirectoryExists,
    });
    return undefined;
  } catch (error) {
    return {
      item: 't1-coordination-home',
      tier: 'tier-1',
      message: error instanceof Error ? error.message : String(error),
      evidence: [`${declaredHome}/${COLLABORATION_SUBSTRATE_REL}`],
    };
  }
}

function detectWatcherLivenessGate(io: ConformanceIo): ConformanceFailure | undefined {
  // Structural anchors, not free-text mention: the usage-spec line
  // (quote-agnostic — estates differ on string quoting) plus the exported
  // handler — a prose mention of the action or a gutted stub module must
  // not satisfy the gate item (review probes 2026-07-07). The full
  // run-proof remains the ceremony's own liveness assertion (skill step 5);
  // this detector recomputes that the assertion is registered and
  // implemented on the home CLI surface.
  const cliSpecHelp = io.readTextFile(CLI_SPEC_HELP_REL_PATH);
  const assertionModule = io.readTextFile(WATCHER_ASSERTION_MODULE_REL_PATH);
  const usageSpecAnchor = new RegExp(`["']comms ${WATCHER_ASSERTION_ACTION} `);
  if (
    cliSpecHelp !== undefined &&
    usageSpecAnchor.test(cliSpecHelp) &&
    assertionModule !== undefined &&
    /export (async )?function assertWatcherLive/.test(assertionModule)
  ) {
    return undefined;
  }
  return {
    item: 't1-watcher-liveness-gate',
    tier: 'tier-1',
    message: `the watcher liveness assertion (comms ${WATCHER_ASSERTION_ACTION}) is not registered and implemented on the home tooling's CLI surface`,
    evidence: [CLI_SPEC_HELP_REL_PATH, WATCHER_ASSERTION_MODULE_REL_PATH],
  };
}

/**
 * Recompute every floor item. An empty return means the estate proves
 * tier-1; each failure names the item, its tier, and the artefact that
 * would prove it (validators recompute, never merely record).
 */
export function runConformanceDetectors(io: ConformanceIo): readonly ConformanceFailure[] {
  return [
    detectIncomingBox(io),
    detectProtocolRecord(io),
    ...detectWireSchemaItems(io),
    detectCoordinationHome(io),
    detectWatcherLivenessGate(io),
  ].filter((failure): failure is ConformanceFailure => failure !== undefined);
}
