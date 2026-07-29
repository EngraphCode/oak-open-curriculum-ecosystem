/**
 * Unit tests for the canonical section parser: frontmatter stripping and
 * fence-aware heading detection.
 */
import { isErr, unwrap } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { parseCanonicalSections } from './canonical-parser.js';

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
