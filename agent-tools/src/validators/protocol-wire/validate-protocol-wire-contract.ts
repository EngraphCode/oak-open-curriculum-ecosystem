#!/usr/bin/env node
/**
 * Real-content backstop for the core-carried inter-Practice wire contract.
 *
 * Unit tests use an in-package JSON fixture so they stay pure and do not take
 * a module dependency on the protected `.agent` substrate. This validator
 * reads both documents as data and proves that every validation-bearing
 * definition exercised by the unit suite still matches the live contract.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { typeSafeEntries } from '@oaknational/type-helpers';

import { loadWireContractText } from '../../protocol-wire/contract.js';
import { WIRE_CONTRACT_REL_PATH, type WireContract } from '../../protocol-wire/types.js';
import { validateWireValue } from '../../protocol-wire/validate.js';

const REPO_ROOT = fileURLToPath(new URL('../../../..', import.meta.url));
const FIXTURE_REL_PATH = 'agent-tools/tests/protocol-wire/inter-practice-wire.fixture.json';

function loadContract(relativePath: string): WireContract {
  const loaded = loadWireContractText(readFileSync(join(REPO_ROOT, relativePath), 'utf8'));
  if (!loaded.ok) {
    throw new TypeError(`${relativePath}: ${loaded.error}`);
  }
  return loaded.value;
}

function withoutComments(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(withoutComments);
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  return Object.fromEntries(
    typeSafeEntries(value)
      .filter(([key]) => key !== '$comment')
      .map(([key, entry]) => [key, withoutComments(entry)]),
  );
}

const contract = loadContract(WIRE_CONTRACT_REL_PATH);
const fixture = loadContract(FIXTURE_REL_PATH);

assert.equal(
  contract.version,
  fixture.version,
  'the no-IO fixture must advertise the live wire-contract version',
);
assert.deepEqual(
  withoutComments(contract.document['$defs']),
  withoutComments(fixture.document['$defs']),
  'the no-IO fixture must match every validation-bearing live $def; only $comment annotations may differ',
);

const protocol: unknown = JSON.parse(
  readFileSync(join(REPO_ROOT, '.agent/practice-core/protocol.json'), 'utf8'),
);
if (
  typeof protocol !== 'object' ||
  protocol === null ||
  !('protocol_version' in protocol) ||
  typeof protocol.protocol_version !== 'string'
) {
  throw new TypeError('protocol.json declares no string protocol_version');
}
assert.equal(contract.family, protocol.protocol_version.split('.')[0]);

const identity = {
  agent_name: 'Fixture Testing Fixture',
  platform: 'codex',
  model: 'GPT-5',
  session_id_prefix: 'fake00',
};
const commonHeartbeat = {
  pid: 424242,
  started_at: '2026-01-01T00:00:00Z',
  watcher_identity: identity,
};

assert.equal(
  validateWireValue(contract, 'watcher_heartbeat', {
    ...commonHeartbeat,
    schema_version: '0.2.0',
    watched_comms_dir: '/coordination/.agent/state/collaboration/comms',
  }).ok,
  true,
  'the live contract must accept an absolute source-bound 0.2 heartbeat',
);
assert.equal(
  validateWireValue(contract, 'watcher_heartbeat', {
    ...commonHeartbeat,
    schema_version: '0.1.0',
  }).ok,
  true,
  'the v1 wire family must continue to accept an older source-unbound heartbeat',
);
assert.equal(
  validateWireValue(contract, 'watcher_heartbeat', {
    ...commonHeartbeat,
    schema_version: '0.2.0',
    watched_comms_dir: 'relative/comms',
  }).ok,
  false,
  'a supplied watched comms source must be absolute',
);

process.stdout.write(
  'protocol-wire contract validator: live definitions, family, and watcher source binding passed\n',
);
