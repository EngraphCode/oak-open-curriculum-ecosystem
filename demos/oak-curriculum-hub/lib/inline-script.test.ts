/**
 * The inline-script embedding contract: a literal `</script` anywhere in the
 * source (the oak-theme.js header comment carries one) must not survive into
 * the inline body — the HTML parser would terminate the script element there
 * and the runtime after it would never execute. The escape must also be
 * semantics-preserving (`<\/` === `/` in every JavaScript context).
 */
import { describe, expect, it } from 'vitest';

import { escapeInlineScript } from './inline-script';

describe('escapeInlineScript', () => {
  it('escapes a closing-script sequence inside a comment', () => {
    const source = '/* usage: <script src="x.js"></script>. */\n(function () {})();';
    const escaped = escapeInlineScript(source);
    expect(escaped).not.toMatch(/<\/script/i);
    expect(escaped).toContain(String.raw`<\/script`);
    expect(escaped).toContain('(function () {})();');
  });

  it('escapes case variants the HTML parser also terminates on', () => {
    expect(escapeInlineScript('</SCRIPT>')).not.toMatch(/<\/script/i);
  });

  it('leaves sequence-free source byte-identical', () => {
    const source = '(function () { window.x = 1; })();';
    expect(escapeInlineScript(source)).toBe(source);
  });
});
