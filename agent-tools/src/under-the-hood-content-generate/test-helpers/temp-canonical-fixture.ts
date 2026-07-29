/**
 * Test fixture: a throwaway repo root carrying a synthetic canonical skill,
 * for exercising the generator's filesystem boundary. Owns the real IO so
 * test files stay IO-free (ADR-078 / no-real-io-in-tests).
 */
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { EXCLUDED_SECTION_HEADINGS, SERVED_SECTION_HEADINGS } from '../sections.js';

/** A minimal canonical carrying every classified heading, in list order. */
function syntheticCanonical(): string {
  const served = SERVED_SECTION_HEADINGS.map((h, i) => `${h}\n\nServed body ${i}.`);
  const excluded = [...EXCLUDED_SECTION_HEADINGS.keys()].map(
    (h, i) => `${h}\n\nExcluded body ${i}.`,
  );
  return `---\nname: under-the-hood\n---\n\n${[...served, ...excluded].join('\n\n')}\n`;
}

/**
 * Creates a temp repo root with the canonical in place and NO parent
 * directory for the generated module — the write-failure fixture.
 */
export async function createTempRepoWithCanonicalOnly(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'under-the-hood-generate-'));
  await mkdir(join(root, '.agent/skills/under-the-hood'), { recursive: true });
  await writeFile(
    join(root, '.agent/skills/under-the-hood/SKILL-CANONICAL.md'),
    syntheticCanonical(),
    'utf8',
  );
  return root;
}
