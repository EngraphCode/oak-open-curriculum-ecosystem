/**
 * Integration tests for the generator over its injected filesystem seam
 * (simple fakes as arguments — testing-strategy §Integration; no real IO):
 * fallible writes translate to Err at the boundary (ADR-088), and a
 * classified canonical renders and writes the generated module.
 */
import { isErr, unwrap, unwrapErr } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { generateContentModule, type GeneratorFileIo } from './generator.js';
import { syntheticCanonical } from './test-helpers/synthetic-canonical.js';

function readsCanonicalOnly(): GeneratorFileIo['readTextFile'] {
  return (path: string) =>
    Promise.resolve(path.endsWith('SKILL-CANONICAL.md') ? syntheticCanonical() : undefined);
}

describe('generateContentModule (integration)', () => {
  it('surfaces a filesystem write failure as Err, never a rejection', async () => {
    const io: GeneratorFileIo = {
      readTextFile: readsCanonicalOnly(),
      writeTextFile: () => Promise.reject(new Error('EACCES: permission denied')),
    };
    const result = await generateContentModule('/repo', io);
    expect(isErr(result)).toBe(true);
    expect(unwrapErr(result)).toMatch(/Cannot write/);
    expect(unwrapErr(result)).toContain('EACCES');
  });

  it('writes the rendered module for a classified canonical', async () => {
    const written = new Map<string, string>();
    const io: GeneratorFileIo = {
      readTextFile: readsCanonicalOnly(),
      writeTextFile: (path: string, content: string) => {
        written.set(path, content);
        return Promise.resolve();
      },
    };
    const result = await generateContentModule('/repo', io);
    const outputPath = unwrap(result);
    expect(written.get(outputPath)).toContain('export const OAK_UNDER_THE_HOOD_ORIENTATION =');
  });
});
