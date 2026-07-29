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

  it('recognises tab and end-of-line ATX heading forms', () => {
    const sections = unwrap(parseCanonicalSections('# A\n\n##\tTabbed\n\nBody.\n\n##\n\nBare.\n'));
    expect(sections.map((s) => s.heading)).toEqual(['# A', '##\tTabbed', '##']);
  });

  it('treats tilde fences as fences and deep-indented backticks as code, not fences', () => {
    const canonical =
      '# A\n\n~~~md\n# fenced by tildes\n~~~\n\n    ```\n## Real heading\n\nBody.\n';
    const sections = unwrap(parseCanonicalSections(canonical));
    expect(sections.map((s) => s.heading)).toEqual(['# A', '## Real heading']);
    expect(sections[0]?.lines).toContain('# fenced by tildes');
  });

  it('pairs fences by delimiter character and length (a shorter run inside stays content)', () => {
    const canonical =
      '# A\n\n````md\nA literal example:\n```\ninner\n```\n````\n\n## After the fence\n\nBody.\n';
    const sections = unwrap(parseCanonicalSections(canonical));
    expect(sections.map((s) => s.heading)).toEqual(['# A', '## After the fence']);
    expect(sections[0]?.lines).toContain('inner');
  });
});
