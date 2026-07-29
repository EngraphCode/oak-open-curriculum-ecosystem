import { describe, expect, it } from 'vitest';

import { escapeInlineScript } from './inline-script';

describe('escapeInlineScript', () => {
  it('escapes every closing-script sequence, case-insensitively', () => {
    const source = 'a</script>b</SCRIPT>c</script foo>';
    const escaped = escapeInlineScript(source);
    expect(escaped).not.toMatch(/<\/script/i);
  });

  it('leaves source without the sequence byte-identical', () => {
    const source = 'window.oakTheme = { get: function () { return "light"; } };';
    expect(escapeInlineScript(source)).toBe(source);
  });
});
