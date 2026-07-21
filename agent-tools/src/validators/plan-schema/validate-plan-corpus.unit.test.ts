import { isErr, isOk } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import {
  recomputeChoiceRegistry,
  validatePlanFile,
  type ChoiceRegistry,
} from './validate-plan-corpus-helpers.js';

const README = [
  '| Stream | Choice IDs | Status |',
  '| --- | --- | --- |',
  '| MCP app | `APP-*` | Signed off |',
  '| Agentic framework | `FRAME-*` | Signed off |',
].join('\n');

const STREAMS = ['- **FRAME-1 — The Practice as a meta-learning loop.**', 'Choices: APP-1, APP-2.'];

function registry(): ChoiceRegistry {
  const result = recomputeChoiceRegistry(README, STREAMS);
  if (isErr(result)) {
    expect.fail('registry recompute should succeed for the fixture corpus');
  }
  return result.value;
}

function planDoc(frontmatterLines: readonly string[]): string {
  return ['---', ...frontmatterLines, '---', '', '# Body', ''].join('\n');
}

const EXECUTABLE_LINES = [
  'id: fixture-plan',
  'node_type: plan',
  'name: Fixture plan',
  'overview: One-line scope.',
  'kind: executable',
  'serves_strategic_choice: FRAME-1',
  'last_updated: 2026-07-21',
  'todos:',
  '  - id: s1',
  '    content: First slice.',
  '    status: pending',
];

describe('recomputeChoiceRegistry', () => {
  it('collects families from the table and concrete IDs from stream docs', () => {
    const reg = registry();
    expect([...reg.families].sort((a, b) => a.localeCompare(b))).toEqual(['APP', 'FRAME']);
    expect([...reg.ids].sort((a, b) => a.localeCompare(b))).toEqual(['APP-1', 'APP-2', 'FRAME-1']);
  });

  it('refuses a vacuous registry (no families found)', () => {
    expect(isErr(recomputeChoiceRegistry('no table here', STREAMS))).toBe(true);
  });

  it('ignores concrete IDs whose family is not registered', () => {
    const result = recomputeChoiceRegistry(README, ['ROGUE-9 appears here']);
    if (isErr(result)) {
      expect.fail('recompute should succeed');
    }
    expect(result.value.ids.has('ROGUE-9')).toBe(false);
  });
});

describe('validatePlanFile', () => {
  it('accepts a conformant executable plan', () => {
    const result = validatePlanFile('p.plan.md', planDoc(EXECUTABLE_LINES), registry());
    expect(isOk(result)).toBe(true);
  });

  it("accepts the literal 'pending' strategic choice", () => {
    const lines = EXECUTABLE_LINES.map((line) =>
      line.startsWith('serves_strategic_choice') ? 'serves_strategic_choice: pending' : line,
    );
    expect(isOk(validatePlanFile('p.plan.md', planDoc(lines), registry()))).toBe(true);
  });

  it('rejects an unresolvable strategic choice', () => {
    const lines = EXECUTABLE_LINES.map((line) =>
      line.startsWith('serves_strategic_choice') ? 'serves_strategic_choice: FRAME-999' : line,
    );
    const result = validatePlanFile('p.plan.md', planDoc(lines), registry());
    if (isOk(result)) {
      expect.fail('should reject');
    }
    expect(result.error.messages[0]).toContain('does not resolve');
  });

  it('rejects an executable plan without todos', () => {
    const lines = EXECUTABLE_LINES.slice(0, 7);
    const result = validatePlanFile('p.plan.md', planDoc(lines), registry());
    if (isOk(result)) {
      expect.fail('should reject');
    }
    expect(result.error.messages.join('\n')).toContain('todos');
  });

  it('rejects dropped emergent keys (V0 §2.5)', () => {
    const result = validatePlanFile(
      'p.plan.md',
      planDoc([...EXECUTABLE_LINES, 'status: in progress']),
      registry(),
    );
    if (isOk(result)) {
      expect.fail('should reject');
    }
    expect(result.error.messages.join('\n')).toContain('dropped emergent key');
  });

  it('requires promotion_trigger on strategic plans and forbids todos there', () => {
    const result = validatePlanFile(
      'p.plan.md',
      planDoc([
        'id: fixture-strategic',
        'node_type: plan',
        'name: Fixture strategic',
        'overview: One-line scope.',
        'kind: strategic',
        'last_updated: 2026-07-21',
        'todos:',
        '  - id: s1',
        '    content: Should not be here.',
        '    status: pending',
      ]),
      registry(),
    );
    if (isOk(result)) {
      expect.fail('should reject');
    }
    const joined = result.error.messages.join('\n');
    expect(joined).toContain('promotion_trigger');
    expect(joined).toContain('forbidden on strategic');
  });

  it("couples disposition 'superseded' to a superseded_by edge", () => {
    const result = validatePlanFile(
      'p.plan.md',
      planDoc([...EXECUTABLE_LINES, 'disposition: superseded']),
      registry(),
    );
    if (isOk(result)) {
      expect.fail('should reject');
    }
    expect(result.error.messages.join('\n')).toContain('superseded_by');
  });

  it('resolves todo depends_on within the same plan only', () => {
    const result = validatePlanFile(
      'p.plan.md',
      planDoc([...EXECUTABLE_LINES, '    depends_on: [missing-todo]']),
      registry(),
    );
    if (isOk(result)) {
      expect.fail('should reject');
    }
    expect(result.error.messages.join('\n')).toContain('does not name a todo id');
  });

  it('fails closed on a file with no frontmatter block', () => {
    const result = validatePlanFile('p.plan.md', '# Just a body\n', registry());
    if (isOk(result)) {
      expect.fail('should reject');
    }
    expect(result.error.messages[0]).toContain('no YAML frontmatter');
  });

  it('fails closed on unparseable YAML', () => {
    const result = validatePlanFile('p.plan.md', planDoc(['id: [unclosed']), registry());
    expect(isErr(result)).toBe(true);
  });
});
