import { describe, expect, it } from 'vitest';

import { displayPrefix } from '../../src/collaboration-state/visual-disambiguator';
import { readAgentIdentityDoc } from '../test-helpers/agent-identity-doc';
import {
  parsedBlock,
  UUIDV4_ANCHORED_ID,
  UUIDV4_ANCHORED_PREFIX,
} from './visual-disambiguator-fixtures';

// The docs example is generated, not hand-maintained: this test rebuilds the
// documented example block from the live renderer and asserts the fenced block
// in docs/agent-identity.md matches byte-for-byte, so doc drift fails CI
// (MCP-145 plan acceptance 6). The committed doc is the fixture; its real-IO
// read lives on the test-helpers surface per the no-real-io-in-tests
// structural allowlist. Fixture rows come from the shared
// visual-disambiguator-fixtures module's anchored UUIDv4 row, so this table
// and the sibling token table stay cross-checkable by mechanism.
const ANCHOR = '<!-- drift-test:visual-disambiguator-example -->';

const idBearing = parsedBlock({
  session_id_prefix: UUIDV4_ANCHORED_PREFIX,
  id: UUIDV4_ANCHORED_ID,
});
const idLess = parsedBlock({ session_id_prefix: UUIDV4_ANCHORED_PREFIX });

function renderedExampleBlock(): string {
  return [
    `session_id_prefix: ${UUIDV4_ANCHORED_PREFIX}`,
    `id:                ${UUIDV4_ANCHORED_ID}`,
    `rendered:          ${displayPrefix(idBearing)}`,
    `rendered (no id):  ${displayPrefix(idLess)}`,
  ].join('\n');
}

describe('agent-identity.md visual-disambiguator example', () => {
  const doc = readAgentIdentityDoc();

  it('carries the drift-test anchor exactly once', () => {
    const occurrences = doc.split(ANCHOR).length - 1;
    expect(occurrences, `expected exactly one "${ANCHOR}" anchor`).toBe(1);
  });

  it('documents exactly what the live renderer produces', () => {
    const afterAnchor = doc.slice(doc.indexOf(ANCHOR) + ANCHOR.length);
    // An expect-guard, not a throw-guard: the estate-wide no-throw-statement
    // lint binds test files too, and the message-bearing expect fails just as
    // loud when the fence is missing.
    const fence = /^\n+```text\n([\s\S]*?)\n```/u.exec(afterAnchor);
    expect(
      fence,
      'expected a ```text fence immediately after the drift-test anchor',
    ).not.toBeNull();
    expect(fence?.[1]).toBe(renderedExampleBlock());
  });
});
