import { describe, expect, it } from 'vitest';

import { escapeInlineScript } from './inline-script';

describe('escapeInlineScript', () => {
  it('escapes every closing-script sequence, case-insensitively, and nothing else', () => {
    // The replacement is deliberately case-normalising: the parser hazard
    // is the sequence, not its case, and the escaped form is inert either way.
    const source = 'a</script>b</SCRIPT>c</script foo>';
    expect(escapeInlineScript(source)).toBe(String.raw`a<\/script>b<\/script>c<\/script foo>`);
  });

  it('leaves source without the sequence byte-identical', () => {
    const source = 'window.oakTheme = { get: function () { return "light"; } };';
    expect(escapeInlineScript(source)).toBe(source);
  });
});
