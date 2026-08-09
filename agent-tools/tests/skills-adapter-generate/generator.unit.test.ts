import { describe, expect, it } from 'vitest';

import { checkAdapters, type CheckerFs } from '../../src/skills-adapter-generate/checker';
import {
  adapterTargetPath,
  buildAdapterFrontmatter,
  discoverCanonicals,
  generateExitCode,
  parseFrontmatter,
  renderAdapter,
  type AdapterSurface,
  type ParsedCanonicalSkill,
} from '../../src/skills-adapter-generate/generator';

const sampleCanonicalSkill = `---
name: start-right-quick
classification: active
description: Apply the repository start-right quick grounding workflow to the active session.
---

# Start Right (Quick)

## Goal

Workflow content here.
`;

describe('parseFrontmatter', () => {
  it('extracts name and description from a fenced canonical SKILL, discarding extra keys', () => {
    const result = parseFrontmatter(sampleCanonicalSkill);

    expect(result).toEqual({
      name: 'start-right-quick',
      description:
        'Apply the repository start-right quick grounding workflow to the active session.',
    });
  });

  it('returns undefined when the file lacks a frontmatter fence', () => {
    const result = parseFrontmatter('# Just a heading\n\nNo frontmatter.');

    expect(result).toBeUndefined();
  });

  it('returns undefined when frontmatter omits the required description', () => {
    const result = parseFrontmatter('---\nname: foo\n---\n\nbody');

    expect(result).toBeUndefined();
  });

  it('handles folded-scalar descriptions', () => {
    const folded = `---
name: commit
description: >-
  Create a well-formed commit for current changes with conventional
  message format.
---

body
`;
    const result = parseFrontmatter(folded);

    expect(result).toMatchObject({
      name: 'commit',
      description:
        'Create a well-formed commit for current changes with conventional message format.',
    });
  });
});

describe('buildAdapterFrontmatter', () => {
  it('renames the skill with the configured prefix and preserves the description', () => {
    const result = buildAdapterFrontmatter(
      { name: 'go', description: 'Re-ground execution.' },
      'oak-',
      'go',
    );

    expect(result).toEqual({
      name: 'oak-go',
      description: 'Re-ground execution.',
    });
  });

  it('uses an empty prefix when configured', () => {
    const result = buildAdapterFrontmatter(
      { name: 'go', description: 'Re-ground execution.' },
      '',
      'go',
    );

    expect(result).toEqual({ name: 'go', description: 'Re-ground execution.' });
  });
});

function makeFs(files: ReadonlyMap<string, string>): CheckerFs {
  return {
    async readFileOrUndefined(path) {
      return files.get(path);
    },
    async listSubdirectoryNames(path) {
      return path === '/repo/.agent/skills' ? ['sample'] : [];
    },
  };
}

const canonicalBody = '---\nname: x\ndescription: A canonical skill.\n---\n\nbody\n';

function makeTreeFs(
  directories: ReadonlyMap<string, readonly string[]>,
  files: ReadonlyMap<string, string>,
): CheckerFs {
  return {
    async readFileOrUndefined(path) {
      return files.get(path);
    },
    async listSubdirectoryNames(path) {
      return directories.get(path) ?? [];
    },
  };
}

describe('discoverCanonicals', () => {
  const repoRoot = '/repo';

  it('discovers flat individuals and family members together', async () => {
    const fs = makeTreeFs(
      new Map([
        ['/repo/.agent/skills', ['flat-one', 'fam']],
        ['/repo/.agent/skills/fam/skills', ['member-a', 'member-b']],
      ]),
      new Map([
        ['/repo/.agent/skills/flat-one/SKILL-CANONICAL.md', canonicalBody],
        ['/repo/.agent/skills/fam/skills/member-a/SKILL-CANONICAL.md', canonicalBody],
        ['/repo/.agent/skills/fam/skills/member-b/SKILL-CANONICAL.md', canonicalBody],
      ]),
    );

    const outcome = await discoverCanonicals(repoRoot, fs);

    expect(outcome.skipped).toEqual([]);
    expect(outcome.duplicates).toEqual([]);
    expect(outcome.canonicals.map((c) => [c.id, c.relativeDir])).toEqual([
      ['flat-one', 'flat-one'],
      ['member-a', 'fam/skills/member-a'],
      ['member-b', 'fam/skills/member-b'],
    ]);
  });

  it('skips a root directory that is neither a skill nor a family', async () => {
    const fs = makeTreeFs(new Map([['/repo/.agent/skills', ['neither']]]), new Map());

    const outcome = await discoverCanonicals(repoRoot, fs);

    expect(outcome.canonicals).toEqual([]);
    expect(outcome.skipped).toEqual(['neither']);
  });

  it('skips a family member directory without a readable canonical', async () => {
    const fs = makeTreeFs(
      new Map([
        ['/repo/.agent/skills', ['fam']],
        ['/repo/.agent/skills/fam/skills', ['good', 'hollow']],
      ]),
      new Map([['/repo/.agent/skills/fam/skills/good/SKILL-CANONICAL.md', canonicalBody]]),
    );

    const outcome = await discoverCanonicals(repoRoot, fs);

    expect(outcome.canonicals.map((c) => c.id)).toEqual(['good']);
    expect(outcome.skipped).toEqual(['fam/skills/hollow']);
  });

  it('reports duplicate leaf ids across shapes — the flat adapter namespace must stay injective', async () => {
    const fs = makeTreeFs(
      new Map([
        ['/repo/.agent/skills', ['member-a', 'fam']],
        ['/repo/.agent/skills/fam/skills', ['member-a']],
      ]),
      new Map([
        ['/repo/.agent/skills/member-a/SKILL-CANONICAL.md', canonicalBody],
        ['/repo/.agent/skills/fam/skills/member-a/SKILL-CANONICAL.md', canonicalBody],
      ]),
    );

    const outcome = await discoverCanonicals(repoRoot, fs);

    expect(outcome.duplicates).toEqual(['member-a']);
  });

  it('skips a skill directory whose canonical fails frontmatter parsing', async () => {
    const fs = makeTreeFs(
      new Map([['/repo/.agent/skills', ['broken']]]),
      new Map([['/repo/.agent/skills/broken/SKILL-CANONICAL.md', '# No frontmatter\n']]),
    );

    const outcome = await discoverCanonicals(repoRoot, fs);

    expect(outcome.canonicals).toEqual([]);
    expect(outcome.skipped).toEqual(['broken']);
  });
});

describe('renderAdapter for family members', () => {
  const familyMember: ParsedCanonicalSkill = {
    id: 'parallax-frame',
    relativeDir: 'parallax/skills/parallax-frame',
    frontmatter: { name: 'parallax-frame', description: 'Frame an inquiry.' },
    canonicalPath: '/repo/.agent/skills/parallax/skills/parallax-frame/SKILL-CANONICAL.md',
    canonicalFilename: 'SKILL-CANONICAL.md',
  };

  it('links the family-relative canonical path while naming by leaf id', () => {
    const content = renderAdapter(familyMember, 'oak-', 'claude');

    expect(content).toContain('name: oak-parallax-frame');
    expect(content).toContain(
      'Read and follow `.agent/skills/parallax/skills/parallax-frame/SKILL-CANONICAL.md`.',
    );
  });
});

describe('checkAdapters over a family', () => {
  it('reports family member adapters missing at their flat target paths', async () => {
    const fs = makeTreeFs(
      new Map([
        ['/repo/.agent/skills', ['fam']],
        ['/repo/.agent/skills/fam/skills', ['member-a']],
      ]),
      new Map([['/repo/.agent/skills/fam/skills/member-a/SKILL-CANONICAL.md', canonicalBody]]),
    );

    const result = await checkAdapters({ repoRoot: '/repo', prefix: 'oak-' }, fs);

    expect(result.missing).toEqual([
      adapterTargetPath('/repo', 'oak-', 'member-a', 'claude'),
      adapterTargetPath('/repo', 'oak-', 'member-a', 'agents'),
    ]);
  });
});

describe('checkAdapters', () => {
  const repoRoot = '/repo';
  const prefix = 'oak-';
  const sampleCanonical: ParsedCanonicalSkill = {
    id: 'sample',
    relativeDir: 'sample',
    frontmatter: { name: 'sample', description: 'A sample canonical skill.' },
    canonicalPath: '/repo/.agent/skills/sample/SKILL-CANONICAL.md',
    canonicalFilename: 'SKILL-CANONICAL.md',
  };

  function expectedAdapter(surface: AdapterSurface): { path: string; content: string } {
    return {
      path: adapterTargetPath(repoRoot, prefix, sampleCanonical.id, surface),
      content: renderAdapter(sampleCanonical, prefix, surface),
    };
  }

  it('reports no drift when adapters match what the generator would emit', async () => {
    const claude = expectedAdapter('claude');
    const agents = expectedAdapter('agents');
    const fs = makeFs(
      new Map([
        [
          sampleCanonical.canonicalPath,
          '---\nname: sample\ndescription: A sample canonical skill.\n---\n\nbody\n',
        ],
        [claude.path, claude.content],
        [agents.path, agents.content],
      ]),
    );

    const result = await checkAdapters({ repoRoot, prefix }, fs);

    expect(result.drifted).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  it('surfaces skipped directories — content no harness can summon must fail the check', async () => {
    const directories = new Map([['/repo/.agent/skills', ['ghost']]]);
    const files = new Map<string, string>();

    const result = await checkAdapters(
      { repoRoot: '/repo', prefix: 'oak-' },
      makeTreeFs(directories, files),
    );

    expect(result.skipped).toEqual(['ghost']);
  });

  it('detects drift in a modified adapter', async () => {
    const claude = expectedAdapter('claude');
    const agents = expectedAdapter('agents');
    const fs = makeFs(
      new Map([
        [
          sampleCanonical.canonicalPath,
          '---\nname: sample\ndescription: A sample canonical skill.\n---\n\nbody\n',
        ],
        [claude.path, `${claude.content}\n<!-- drift -->\n`],
        [agents.path, agents.content],
      ]),
    );

    const result = await checkAdapters({ repoRoot, prefix }, fs);

    expect(result.drifted).toEqual([claude.path]);
    expect(result.missing).toEqual([]);
  });

  it('detects missing adapters', async () => {
    const claude = expectedAdapter('claude');
    const agents = expectedAdapter('agents');
    const fs = makeFs(
      new Map([
        [
          sampleCanonical.canonicalPath,
          '---\nname: sample\ndescription: A sample canonical skill.\n---\n\nbody\n',
        ],
        [claude.path, claude.content],
      ]),
    );

    const result = await checkAdapters({ repoRoot, prefix }, fs);

    expect(result.missing).toEqual([agents.path]);
    expect(result.drifted).toEqual([]);
  });
});

describe('generateExitCode', () => {
  it('returns success when nothing was skipped and no leaf ids collide', () => {
    expect(generateExitCode({ written: ['a', 'b'], skipped: [], duplicates: [] })).toBe(0);
  });

  it('fails hard when any directory was skipped', () => {
    expect(generateExitCode({ written: ['a'], skipped: ['uncategorised'], duplicates: [] })).toBe(
      1,
    );
  });

  it('fails hard when leaf ids collide in the flat adapter namespace', () => {
    expect(generateExitCode({ written: [], skipped: [], duplicates: ['member-a'] })).toBe(1);
  });
});
