import { describe, expect, it } from 'vitest';

import { parseApplyPatchContent } from './apply-patch-content.js';

/**
 * Unit tests for the `apply_patch` content projection.
 *
 * Modules harvested from the tested MCP-150 branch implementation
 * (docs/copilot-cli-practice-citizenship); these tests pin the behaviour the
 * policy relies on: additions and deletions are separated per file so deleted
 * text is never misread as newly added content.
 */
describe('parseApplyPatchContent', () => {
  it('projects an add-file section into wholly-new content', () => {
    const patch = [
      '*** Begin Patch',
      '*** Add File: notes/example.txt',
      '+first line',
      '+second line',
      '*** End Patch',
      '',
    ].join('\n');

    const result = parseApplyPatchContent(patch);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual([
        {
          newContent: 'first line\nsecond line',
          priorContent: '',
          filePath: 'notes/example.txt',
        },
      ]);
    }
  });

  it('separates additions from deletions in an update section', () => {
    const patch = [
      '*** Begin Patch',
      '*** Update File: notes/example.txt',
      '@@',
      ' unchanged context',
      '-removed line',
      '+added line',
      '*** End Patch',
      '',
    ].join('\n');

    const result = parseApplyPatchContent(patch);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual([
        {
          newContent: 'added line',
          priorContent: 'removed line',
          filePath: 'notes/example.txt',
        },
      ]);
    }
  });

  it('yields one change per file section', () => {
    const patch = [
      '*** Begin Patch',
      '*** Add File: a.txt',
      '+alpha',
      '*** Add File: b.txt',
      '+beta',
      '*** End Patch',
      '',
    ].join('\n');

    const result = parseApplyPatchContent(patch);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.map((change) => change.filePath)).toEqual(['a.txt', 'b.txt']);
    }
  });

  it('rejects a structurally invalid add-section body line', () => {
    const patch = [
      '*** Begin Patch',
      '*** Add File: a.txt',
      'missing plus prefix',
      '*** End Patch',
      '',
    ].join('\n');

    const result = parseApplyPatchContent(patch);

    expect(result.ok).toBe(false);
  });
});
