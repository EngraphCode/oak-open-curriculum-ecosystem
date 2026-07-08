import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { buildConformanceNodeIo } from '../../src/protocol-conformance/node-io.js';
import { runProtocolConformance } from '../../src/protocol-conformance/report.js';

// Real-filesystem proof of the seam contract the unit suite assumes: a temp
// estate built from clearly-fake artefacts, run through the SAME composition
// the bin executes.
const tempDirs: string[] = [];

function tempConformantEstate(): string {
  const root = mkdtempSync(join(tmpdir(), 'protocol-conformance-test-'));
  tempDirs.push(root);

  mkdirSync(join(root, '.agent/practice-core/incoming'), { recursive: true });
  writeFileSync(join(root, '.agent/practice-core/incoming/fixture-offers.md'), '# fixture\n');

  mkdirSync(join(root, '.agent/practice-core/decision-records'), { recursive: true });
  writeFileSync(
    join(
      root,
      '.agent/practice-core/decision-records/PDR-001-inter-practice-collaboration-protocol.md',
    ),
    '# fixture protocol record\n\n## Conformance — fixture floor\n',
  );

  writeFileSync(
    join(root, '.agent/practice-core/protocol.json'),
    JSON.stringify({
      schema_version: '1.0.0',
      protocol_version: '1.0.0',
      tier_floor: 'tier-1',
      extensions: [],
    }),
  );

  mkdirSync(join(root, 'agent-tools/src/collaboration-state/schemas'), { recursive: true });
  writeFileSync(
    join(root, 'agent-tools/src/collaboration-state/schemas/comms-event.schema.json'),
    JSON.stringify({
      $defs: {
        agent_id: { required: ['agent_name', 'platform', 'model', 'session_id_prefix'] },
        narrative: { properties: { in_response_to: { type: 'string' } } },
      },
    }),
  );
  writeFileSync(
    join(root, 'agent-tools/src/collaboration-state/cli-spec-help.ts'),
    'export const HELP = "comms assert-watcher-live (--platform ...)";\n',
  );
  writeFileSync(
    join(root, 'agent-tools/src/collaboration-state/cli-comms-assert-watcher-live.ts'),
    'export async function assertWatcherLive(): Promise<void> {}\n',
  );

  mkdirSync(join(root, '.agent/state'), { recursive: true });
  writeFileSync(join(root, '.agent/state/README.md'), '# collaboration plane contract (fixture)\n');

  return root;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('buildConformanceNodeIo + runProtocolConformance (real filesystem)', () => {
  it('reports tier-1 with exit 0 on a conformant temp estate', () => {
    const root = tempConformantEstate();
    const { report, exitCode } = runProtocolConformance(buildConformanceNodeIo(root, {}));
    expect(report).toEqual({
      protocol_version: '1.0.0',
      tier: 'tier-1',
      extensions: [],
      failures: [],
    });
    expect(exitCode).toBe(0);
  });

  it('flips to tier none with exit 1 when the incoming box directory is deleted', () => {
    const root = tempConformantEstate();
    rmSync(join(root, '.agent/practice-core/incoming'), { recursive: true, force: true });
    const { report, exitCode } = runProtocolConformance(buildConformanceNodeIo(root, {}));
    expect(report.tier).toBe('none');
    expect(report.failures.map((f) => f.item)).toEqual(['t0-incoming-box']);
    expect(exitCode).toBe(1);
  });

  it('passes the process env through to the coordination-home leg', () => {
    const root = tempConformantEstate();
    rmSync(join(root, '.agent/state/README.md'), { force: true });
    const declaredHome = join(root, 'declared-home');
    // The declared home must hold the full collaboration substrate — the
    // detector certifies the real resolver's contract, and bare
    // `.agent/state` no longer resolves (PR #320 review finding).
    mkdirSync(join(declaredHome, '.agent/state/collaboration'), { recursive: true });
    const { report, exitCode } = runProtocolConformance(
      buildConformanceNodeIo(root, { PRACTICE_COORDINATION_HOME: declaredHome }),
    );
    expect(report.failures).toEqual([]);
    expect(exitCode).toBe(0);
  });

  it('refuses a declared home holding a FILE where the substrate directory should be', () => {
    const root = tempConformantEstate();
    rmSync(join(root, '.agent/state/README.md'), { force: true });
    const declaredHome = join(root, 'declared-home');
    mkdirSync(join(declaredHome, '.agent/state'), { recursive: true });
    writeFileSync(join(declaredHome, '.agent/state/collaboration'), 'not a directory\n');
    const { report, exitCode } = runProtocolConformance(
      buildConformanceNodeIo(root, { PRACTICE_COORDINATION_HOME: declaredHome }),
    );
    expect(report.failures.map((f) => f.item)).toEqual(['t1-coordination-home']);
    expect(exitCode).toBe(1);
  });
});
