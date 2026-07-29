/**
 * Unit tests for the under-the-hood MCP content generator: fence-aware
 * section parsing, total classification (both failure directions), digest
 * verbatim-and-order fidelity, and the rendered module shape.
 */
import { isErr, unwrap, unwrapErr } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { buildDigest, parseCanonicalSections, renderGeneratedModule } from './generator.js';
import { EXCLUDED_SECTION_HEADINGS, SERVED_SECTION_HEADINGS } from './sections.js';

/** A minimal canonical carrying every classified heading, in list order. */
function syntheticCanonical(): string {
  const served = SERVED_SECTION_HEADINGS.map((h, i) => `${h}\n\nServed body ${i}.`);
  const excluded = [...EXCLUDED_SECTION_HEADINGS.keys()].map(
    (h, i) => `${h}\n\nExcluded body ${i}.`,
  );
  return `---\nname: under-the-hood\n---\n\n${[...served, ...excluded].join('\n\n')}\n`;
}

describe('parseCanonicalSections', () => {
  it('strips frontmatter and does not read fenced # lines as headings', () => {
    const canonical =
      '---\nname: x\n---\n\n# Title\n\nBody.\n\n```yaml\n# fenced comment\n```\n\n## Next\n\nMore.\n';
    const sections = unwrap(parseCanonicalSections(canonical));
    expect(sections.map((s) => s.heading)).toEqual(['# Title', '## Next']);
    expect(sections[0]?.lines).toContain('# fenced comment');
  });

  it('reports unterminated frontmatter as an error', () => {
    const result = parseCanonicalSections('---\nname: x\n\n# Title\n');
    expect(isErr(result)).toBe(true);
  });
});

describe('buildDigest', () => {
  it('serves exactly the allowlisted sections, verbatim, in canonical order', () => {
    const digest = unwrap(buildDigest(syntheticCanonical()));
    for (const [i, heading] of SERVED_SECTION_HEADINGS.entries()) {
      expect(digest).toContain(`${heading}\n\nServed body ${i}.`);
    }
    for (const heading of EXCLUDED_SECTION_HEADINGS.keys()) {
      expect(digest).not.toContain(heading);
    }
    const positions = SERVED_SECTION_HEADINGS.map((h) => digest.indexOf(h));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it('fails loudly on an unclassified heading', () => {
    const canonical = `${syntheticCanonical()}\n## Brand New Section\n\nSurprise.\n`;
    const result = buildDigest(canonical);
    expect(isErr(result)).toBe(true);
    expect(unwrapErr(result)).toMatch(/Unclassified section heading/);
    expect(unwrapErr(result)).toMatch(/## Brand New Section/);
  });

  it('fails loudly when a served heading is missing from the canonical', () => {
    const honestyIndex = SERVED_SECTION_HEADINGS.indexOf('## Honesty Invariants');
    const canonical = syntheticCanonical().replace(
      `## Honesty Invariants\n\nServed body ${honestyIndex}.`,
      '',
    );
    const result = buildDigest(canonical);
    expect(isErr(result)).toBe(true);
    expect(unwrapErr(result)).toMatch(/missing from/);
    expect(unwrapErr(result)).toMatch(/## Honesty Invariants/);
  });
});

describe('renderGeneratedModule', () => {
  it('emits a single-constant module with the generated header and escaped digest', () => {
    const module = renderGeneratedModule('# Title\n\nA "quoted" body with `ticks`.\n');
    expect(module).toContain('GENERATED FILE — DO NOT EDIT');
    expect(module).toContain('export const OAK_UNDER_THE_HOOD_ORIENTATION =');
    expect(module).toContain('as const;');
    const constantLine = module.split('\n').find((l) => l.startsWith('export const'));
    expect(constantLine).toContain(String.raw`\n`);
    expect(constantLine).toContain(String.raw`\"quoted\"`);
  });
});
