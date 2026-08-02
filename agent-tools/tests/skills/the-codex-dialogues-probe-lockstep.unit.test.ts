import { describe, expect, it } from 'vitest';

import { readRepoDocument } from '../../src/collaboration-state/test-helpers/repo-doc.js';

/**
 * Lockstep pins for the codex mcp-server binding evidence (Sif Annex A).
 *
 * The probe record's `codex_cli_version` pin is machine-read by the probe
 * script's version gate, cited by the instrument skill's dialogue-open
 * check, and asserted by the Sif annex — four surfaces, one version. These
 * tests redden when any surface drifts from the record; fix all surfaces in
 * the same change alongside a reviewed probe re-run (ADR-078
 * helper-mediated committed-artefact reads).
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

async function recordedVersion(): Promise<string> {
  const record = await readRepoDocument(RECORD_PATH);
  return /^codex_cli_version: (\d+\.\d+\.\d+)$/m.exec(record)?.[1] ?? 'RECORD-PIN-MISSING';
}

describe('the-codex-dialogues probe evidence lockstep', () => {
  it('pins the instrument skill probe citation to the recorded version', async () => {
    const skill = await readRepoDocument(INSTRUMENT_SKILL_PATH);
    const cited =
      /Probe-verified \d{4}-\d{2}-\d{2} against codex-cli (\d+\.\d+\.\d+)/.exec(skill)?.[1] ??
      'SKILL-CITATION-MISSING';
    expect(cited).toBe(await recordedVersion());
  });

  it('pins the Sif Annex A citation to the recorded version', async () => {
    const sif = await readRepoDocument(SIF_SKILL_PATH);
    const cited =
      /Verified first-hand \d{4}-\d{2}-\d{2} against codex-cli (\d+\.\d+\.\d+)/.exec(sif)?.[1] ??
      'ANNEX-CITATION-MISSING';
    expect(cited).toBe(await recordedVersion());
  });

  it('pins the tracked registration template to the exact launch contract', async () => {
    const skill = await readRepoDocument(INSTRUMENT_SKILL_PATH);
    const fenced = /```json\n([\s\S]*?)```/.exec(skill)?.[1] ?? '"TEMPLATE-FENCE-MISSING"';
    const template: unknown = JSON.parse(fenced);
    expect(template).toStrictEqual({
      codex: {
        type: 'stdio',
        command: 'codex',
        args: PINNED_REGISTRATION_ARGS,
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
