import { describe, expect, it } from 'vitest';

import { readRepoDocument } from '../../src/collaboration-state/test-helpers/repo-doc.js';

/**
 * Lockstep pins for the codex mcp-server binding evidence (Sif Annex A).
 *
 * Design settled by the instrument's own first dialogue
 * (dlg-20260802-lockstep-pins, outcome position-changed): the probe
 * record's fenced `codex_cli_version` line is the CANONICAL version
 * authority — machine-read by the probe script's version gate and by
 * these tests. Dependent doctrine references that field through
 * resolving links and never restates the literal, so these tests assert
 * reference-PRESENCE (a semantic pointer exists), never value extraction
 * from prose. Deliberately duplicated machine artefacts (the copy-paste
 * registration template vs the script's launch args) stay whole-array
 * equality-pinned. ADR-078 helper-mediated committed-artefact reads.
 */

const RECORD_PATH = '.agent/skills/the-codex-dialogues/probe-record.md';
const INSTRUMENT_SKILL_PATH = '.agent/skills/the-codex-dialogues/SKILL-CANONICAL.md';
const SIF_SKILL_PATH = '.agent/skills/sif/SKILL-CANONICAL.md';
const PROBE_SCRIPT_PATH = '.agent/skills/the-codex-dialogues/scripts/probe-codex-mcp-server.mjs';

/** The registration template's launch contract, pinned whole-array. */
const PINNED_REGISTRATION_ARGS = [
  'mcp-server',
  '-c',
  'sandbox_mode=read-only',
  '-c',
  'approval_policy=never',
];

describe('the-codex-dialogues probe evidence lockstep', () => {
  it('parses a canonical codex_cli_version pin from the probe record', async () => {
    const record = await readRepoDocument(RECORD_PATH);
    const pin = /^codex_cli_version: (\d+\.\d+\.\d+)$/m.exec(record)?.[1] ?? 'RECORD-PIN-MISSING';
    expect(pin).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('keeps the instrument skill referencing the canonical pin, not restating it', async () => {
    const skill = await readRepoDocument(INSTRUMENT_SKILL_PATH);
    expect(skill, 'semantic pointer to the canonical field').toContain(
      'the pinned `codex_cli_version` in',
    );
    expect(skill, 'resolving link to the record').toContain('](./probe-record.md)');
    expect(skill, 'no restated version literal outside the record').not.toMatch(
      /codex-cli \d+\.\d+\.\d+/,
    );
  });

  it('keeps the Sif annex referencing the canonical pin, not restating it', async () => {
    const sif = await readRepoDocument(SIF_SKILL_PATH);
    expect(sif, 'semantic pointer to the canonical field').toContain('`codex_cli_version`');
    expect(sif, 'resolving link to the record').toContain(
      '](../the-codex-dialogues/probe-record.md)',
    );
    expect(sif, 'no restated version literal outside the record').not.toMatch(
      /codex-cli \d+\.\d+\.\d+/,
    );
  });

  it('pins the tracked registration template to the exact launch contract', async () => {
    const skill = await readRepoDocument(INSTRUMENT_SKILL_PATH);
    const fenced = /```json\n([\s\S]*?)```/.exec(skill)?.[1] ?? '"TEMPLATE-FENCE-MISSING"';
    const template: unknown = JSON.parse(fenced);
    expect(template).toStrictEqual({
      mcpServers: {
        codex: {
          type: 'stdio',
          command: 'codex',
          args: PINNED_REGISTRATION_ARGS,
        },
      },
    });
  });

  it('pins the probe script launch args to the same contract, whole-array', async () => {
    const script = await readRepoDocument(PROBE_SCRIPT_PATH);
    const declaration = /const LAUNCH_ARGS = \[([\s\S]*?)\];/.exec(script)?.[1] ?? '';
    const args = [...declaration.matchAll(/'([^']*)'/g)].map((entry) => entry[1]);
    expect(args).toStrictEqual(PINNED_REGISTRATION_ARGS);
  });
});
