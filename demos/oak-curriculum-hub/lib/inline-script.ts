/**
 * Escape JavaScript source for embedding as an inline `<script>` body. The
 * HTML parser terminates a script element at the FIRST `</script` sequence
 * regardless of JavaScript context — even inside a comment or string — so
 * un-escaped source containing that sequence truncates the inline script at
 * that point and everything after it never executes. `<\/` is identical to
 * `/` in every JavaScript context (comment, string, regex), so the escape is
 * semantics-preserving for any source.
 */
export function escapeInlineScript(source: string): string {
  return source.replaceAll(/<\/script/gi, String.raw`<\/script`);
}
