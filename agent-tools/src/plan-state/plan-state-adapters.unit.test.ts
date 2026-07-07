import { describe, expect, it } from 'vitest';

import { buildCensusRecords } from '../refounding/refound-claim-census-model.js';
import { extractAuditClaims, extractAuditClaimsRequired } from './plan-state-audit-adapter.js';
import { extractGateClaims, extractGateClaimsAll } from './plan-state-gate-adapter.js';

/** A frontmatter-led plan file body (LF endings, the repo convention). */
const planWith = (frontmatter: string): string => `---\n${frontmatter}\n---\n\n# Body\n`;

describe('extractGateClaims — the permanent gate adapter', () => {
  it('extracts V0 todos as verbatim claims keyed path#id', () => {
    const result = extractGateClaims({
      path: 'p/a.plan.md',
      content: planWith(
        ['todos:', '  - id: t1', '    content: build it', '    status: pending'].join('\n'),
      ),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual([
        { key: 'p/a.plan.md#t1', recordedStatus: 'pending', proof: null },
      ]);
    }
  });

  it('carries a V0.1 proof and captures an emergent status verbatim (never a refusal)', () => {
    const result = extractGateClaims({
      path: 'p/a.plan.md',
      content: planWith(
        [
          'todos:',
          '  - id: t1',
          '    content: build it',
          '    status: in-progress',
          '    proof:',
          '      kind: gate',
          '      ref: pnpm-check',
          '    spec_ref: spec-1',
        ].join('\n'),
      ),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[0]).toEqual({
        key: 'p/a.plan.md#t1',
        recordedStatus: 'in-progress',
        proof: { kind: 'gate', ref: 'pnpm-check' },
      });
    }
  });

  it('tolerates domain extension keys at the plan root (V0 §2.5 loose root)', () => {
    const result = extractGateClaims({
      path: 'p/a.plan.md',
      content: planWith(
        [
          'lineage: some-extension',
          'fitness_line_target: 100',
          'todos:',
          '  - id: t1',
          '    content: x',
          '    status: completed',
        ].join('\n'),
      ),
    });
    expect(result.ok).toBe(true);
  });

  it('refuses a strategic plan carrying todos (V0 §2.4)', () => {
    const result = extractGateClaims({
      path: 'p/s.plan.md',
      content: planWith(
        ['kind: strategic', 'todos:', '  - id: t1', '    content: x', '    status: pending'].join(
          '\n',
        ),
      ),
    });
    expect(result.ok).toBe(false);
  });

  it('tolerates unknown todo-item extension keys but keeps the proof union strict', () => {
    const tolerated = extractGateClaims({
      path: 'p/a.plan.md',
      content: planWith(
        [
          'todos:',
          '  - id: t1',
          '    content: x',
          '    status: pending',
          '    depends_on: [t0]',
        ].join('\n'),
      ),
    });
    expect(tolerated.ok).toBe(true);
    const badProof = extractGateClaims({
      path: 'p/a.plan.md',
      content: planWith(
        [
          'todos:',
          '  - id: t1',
          '    content: x',
          '    status: pending',
          '    proof:',
          '      kind: gate',
          '      ref: pnpm-check',
          '      extra: nope',
        ].join('\n'),
      ),
    });
    expect(badProof.ok).toBe(false);
  });

  it('refuses unparseable YAML with the path cited', () => {
    const result = extractGateClaims({
      path: 'p/bad.plan.md',
      content: planWith('todos: [unclosed'),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('p/bad.plan.md');
    }
  });

  it('yields zero rows for strategic-without-todos, no-frontmatter, and no-todos files', () => {
    const inputs = [
      { path: 'p/s.plan.md', content: planWith('kind: strategic') },
      { path: 'p/plain.md', content: '# No frontmatter\n' },
      { path: 'p/meta.plan.md', content: planWith('title: only-metadata') },
    ];
    const result = extractGateClaimsAll(inputs);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual([]);
    }
  });
});

describe('extractAuditClaims — the disposable audit adapter', () => {
  const record = (over: Record<string, unknown>): string =>
    JSON.stringify({
      file: 'plans/a.plan.md',
      line: 10,
      markers: [],
      statusValue: ' pending',
      text: '    status: pending',
      sha256: 'a'.repeat(64),
      ...over,
    });

  it('maps status-bearing records to file:line-keyed claims and skips keyword-only rows', () => {
    const jsonl = `${record({})}\n${record({ line: 20, statusValue: null, markers: ['done'] })}\n`;
    const result = extractAuditClaims(jsonl);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual([
        { key: 'plans/a.plan.md:10', recordedStatus: ' pending', proof: null },
      ]);
    }
  });

  it('parses real census-module output (C1 shape compatibility, test-only import)', () => {
    const bytes = new TextEncoder().encode('---\nstatus: completed\n---\nbody\n');
    const records = buildCensusRecords('plans/a.plan.md', bytes);
    const jsonl = records.map((entry) => JSON.stringify(entry)).join('\n');
    const result = extractAuditClaims(`${jsonl}\n`);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[0]?.recordedStatus.trim()).toBe('completed');
    }
  });

  it('refuses a malformed line citing its line number (nothing computed)', () => {
    const result = extractAuditClaims(`${record({})}\nnot-json\n`);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('line 2');
    }
  });

  it('refuses a blank artefact distinctly (absent is never an empty scan)', () => {
    const result = extractAuditClaimsRequired('\n');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('empty');
    }
  });
});
