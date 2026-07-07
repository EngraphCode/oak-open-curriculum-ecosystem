import { describe, expect, it } from 'vitest';

import {
  buildDenominator,
  buildGitleaksDirArgs,
  DEFAULT_OUT_DIR,
  DEFAULT_RULE_PATH,
  findEscapingMatches,
  frozenRelPath,
  mapSourcesToFrozen,
  parseFreezeArgs,
  resolveCopySink,
  validateOutDirChoice,
} from './refound-freeze-helpers.js';

describe('parseFreezeArgs', () => {
  it('applies the documented defaults', () => {
    const result = parseFreezeArgs([]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ rulePath: DEFAULT_RULE_PATH, outDir: DEFAULT_OUT_DIR });
    }
  });

  it('honours --rule and --out overrides', () => {
    const result = parseFreezeArgs(['--rule', 'r.json', '--out', 'somewhere']);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ rulePath: 'r.json', outDir: 'somewhere' });
    }
  });

  it('rejects a dangling flag with no value', () => {
    const result = parseFreezeArgs(['--rule']);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('requires a value');
    }
    expect(parseFreezeArgs(['--out']).ok).toBe(false);
  });

  it('rejects an unknown flag rather than silently ignoring it', () => {
    const result = parseFreezeArgs(['--rules', 'r.json']);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('unknown option');
    }
  });
});

describe('frozenRelPath', () => {
  it('strips exactly one leading .agent/ segment', () => {
    expect(frozenRelPath('.agent/plans/x.md')).toBe('plans/x.md');
    expect(frozenRelPath('.agent/milestones/m.md')).toBe('milestones/m.md');
  });

  it('leaves paths outside .agent/ unchanged', () => {
    expect(frozenRelPath('docs/x.md')).toBe('docs/x.md');
  });
});

describe('mapSourcesToFrozen', () => {
  it('maps each source to its mirrored frozen path', () => {
    const result = mapSourcesToFrozen(['.agent/plans/x.md', '.agent/proposals/p.md']);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.get('.agent/plans/x.md')).toBe('plans/x.md');
      expect(result.value.get('.agent/proposals/p.md')).toBe('proposals/p.md');
    }
  });

  it('refuses when two sources collide onto one frozen path', () => {
    const result = mapSourcesToFrozen(['.agent/plans/x.md', 'plans/x.md']);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('collide');
    }
  });
});

describe('buildDenominator', () => {
  const stat = (statPath: string, bytes: number, lines: number) => ({
    path: statPath,
    bytes,
    sha256: 'a'.repeat(64),
    lines,
    inventoryMode: 'lines' as const,
  });

  it('sums the totals and records the generating rule', () => {
    const denominator = buildDenominator({
      freezeRuleVersion: 1,
      ratifiedBy: 'g1.md',
      files: [stat('plans/b.md', 10, 2), stat('plans/a.md', 5, 1)],
    });
    expect(denominator.totals).toEqual({ files: 2, lines: 3, bytes: 15 });
    expect(denominator.generatedFrom).toEqual({ freezeRuleVersion: 1, ratifiedBy: 'g1.md' });
  });

  it('sorts by UTF-16 code units, where locale order disagrees', () => {
    // 'plans/B.md' precedes 'plans/a.md' by code units ('B' is 0x42, 'a' is
    // 0x61); localeCompare orders lowercase first. A localeCompare
    // regression flips this expectation.
    const denominator = buildDenominator({
      freezeRuleVersion: 1,
      ratifiedBy: 'g1.md',
      files: [stat('plans/a.md', 1, 1), stat('plans/B.md', 1, 1)],
    });
    expect(denominator.files.map((f) => f.path)).toEqual(['plans/B.md', 'plans/a.md']);
  });
});

describe('findEscapingMatches', () => {
  it('flags absolute matches and matches containing a .. segment', () => {
    expect(
      findEscapingMatches(['plans/a.md', '../escape/leak.md', '/etc/passwd', 'a/../b.md']),
    ).toEqual(['../escape/leak.md', '/etc/passwd', 'a/../b.md']);
  });

  it('passes ordinary repo-relative paths through untouched', () => {
    expect(findEscapingMatches(['plans/a.md', 'proposals/p.md'])).toEqual([]);
  });
});

describe('resolveCopySink', () => {
  it('resolves an ordinary frozen path inside the tree', () => {
    const sink = resolveCopySink('/repo/out/archive/frozen-v1', 'plans/a.md');
    expect(sink.ok).toBe(true);
    if (sink.ok) {
      expect(sink.value).toBe('/repo/out/archive/frozen-v1/plans/a.md');
    }
  });

  it('refuses a crafted traversal that escapes the frozen tree', () => {
    const sink = resolveCopySink('/repo/out/archive/frozen-v1', '../../../../etc/passwd');
    expect(sink.ok).toBe(false);
    if (!sink.ok) {
      expect(sink.error.message).toContain('escapes the frozen tree');
    }
    expect(resolveCopySink('/repo/out/archive/frozen-v1', '/etc/passwd').ok).toBe(false);
    expect(resolveCopySink('/repo/out/archive/frozen-v1', '.').ok).toBe(false);
  });
});

describe('validateOutDirChoice', () => {
  it('refuses the repository root itself', () => {
    const verdict = validateOutDirChoice('/repo', '/repo');
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.error.message).toContain('repository root');
    }
  });

  it('refuses any path inside .git', () => {
    expect(validateOutDirChoice('/repo', '/repo/.git').ok).toBe(false);
    const verdict = validateOutDirChoice('/repo', '/repo/.git/hooks');
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.error.message).toContain('.git');
    }
  });

  it('accepts an ordinary in-repo artefact home', () => {
    expect(validateOutDirChoice('/repo', '/repo/.agent/plans-refounding').ok).toBe(true);
  });
});

describe('buildGitleaksDirArgs', () => {
  it('builds the empirically verified single-path dir invocation', () => {
    expect(buildGitleaksDirArgs('.agent/plans/a.md')).toEqual([
      'dir',
      '.agent/plans/a.md',
      '--config',
      '.gitleaks.toml',
      '--no-banner',
      '--redact=100',
      '--exit-code',
      '99',
      '--log-level',
      'error',
    ]);
  });
});
