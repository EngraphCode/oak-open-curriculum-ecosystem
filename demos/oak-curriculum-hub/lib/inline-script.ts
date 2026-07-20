/**
 * Escape JavaScript source for embedding as an inline `<script>` body. The
 * HTML parser terminates a script element at the FIRST `</script` sequence
 * regardless of JavaScript context — even inside a comment or string — so
 * un-escaped source containing that sequence truncates the inline script at
 * that point and everything after it never executes. `<\/` is identical to
 * `/` inside comments and string literals — which covers the runtime source
 * this embeds (the sequence occurs in oak-theme.js's header comment; the
 * parity test guards that fact). The escape is NOT safe for arbitrary source:
 * a regex literal directly after `<` (contrived: `x</script/.test(y)`) would
 * be corrupted, so widen with care if the input contract ever changes.
 */
export function escapeInlineScript(source: string): string {
  return source.replaceAll(/<\/script/gi, String.raw`<\/script`);
}
